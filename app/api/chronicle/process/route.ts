import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Groq free tier: 12k TPM. Prompts use ~1k tokens, response up to 4k.
// That leaves ~7k tokens for transcript ≈ 28,000 chars. We cap at 24k to be safe.
const MAX_TRANSCRIPT_CHARS = 24000

// Parse SRT content into a readable transcript string
function parseSRT(srt: string): string {
  const lines = srt.split('\n')
  const textLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip sequence numbers (pure digits)
    if (/^\d+$/.test(trimmed)) continue
    // Skip timestamp lines
    if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(trimmed)) continue
    // Skip empty lines
    if (trimmed === '') continue
    // Keep speaker text
    textLines.push(trimmed)
  }

  // Merge consecutive lines from the same speaker
  const merged: string[] = []
  let current = ''
  for (const line of textLines) {
    const speakerMatch = line.match(/^\[Speaker \d+\]/)
    if (speakerMatch) {
      if (current) merged.push(current)
      current = line
    } else {
      current += ' ' + line
    }
  }
  if (current) merged.push(current)

  return merged.join('\n')
}

// Truncate transcript to fit within token limits, cutting at a speaker boundary
function truncateTranscript(transcript: string, maxChars: number): { text: string; truncated: boolean } {
  if (transcript.length <= maxChars) return { text: transcript, truncated: false }

  // Try to cut at a speaker boundary (start of a [Speaker N] line)
  const cutPoint = transcript.lastIndexOf('\n[Speaker', maxChars)
  const text = cutPoint > maxChars * 0.5
    ? transcript.slice(0, cutPoint).trimEnd()
    : transcript.slice(0, maxChars).trimEnd()

  return { text, truncated: true }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Fetch session + campaign
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, campaigns(name, setting, system)')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const campaign = session.campaigns as { name: string; setting: string | null; system: string }

    // Parse SRT if the raw notes look like an SRT file, otherwise use as-is
    const rawNotes = session.raw_notes as string
    const isSRT = rawNotes.includes('-->') && /\d{2}:\d{2}:\d{2},\d{3}/.test(rawNotes)
    const fullTranscript = isSRT ? parseSRT(rawNotes) : rawNotes
    const { text: transcript, truncated } = truncateTranscript(fullTranscript, MAX_TRANSCRIPT_CHARS)

    const systemPrompt = `You are Archivist, an expert chronicler for tabletop RPG campaigns. You analyze transcripts of actual play sessions — which include both in-character roleplay and out-of-character table talk — and extract only the in-game events to create structured chronicle records.

You are skilled at:
- Distinguishing in-character events from out-of-character chatter (rules discussions, jokes, side conversations)
- Identifying which speakers are players vs the Dungeon Master/Game Master
- Extracting NPCs, quests, loot, and encounters from natural conversation
- Writing evocative narrative summaries in a rich fantasy style
- Generating atmospheric session titles

Always respond with valid JSON only. No markdown, no extra text.`

    const userPrompt = `Analyze this tabletop RPG session transcript and create a structured chronicle.

Campaign: ${campaign.name}
System: ${campaign.system}
${campaign.setting ? `World/Setting: ${campaign.setting}` : ''}

Session Transcript:${truncated ? ' [Note: transcript was long and has been trimmed to the first portion of the session]' : ''}
---
${transcript}
---

Note: This transcript includes both in-character roleplay and out-of-character table talk. Focus only on in-character events, decisions, encounters, and story developments. Ignore rules questions, jokes, and off-topic conversation.

Return a JSON object with this exact structure:
{
  "title": "An evocative 3-7 word title capturing the session's essence",
  "summary": "A 2-3 paragraph narrative summary written in past tense, rich and atmospheric. Capture what happened in-game, the emotional beats, and key turning points. Write as if narrating to a player who missed the session.",
  "npcs": [
    {
      "name": "NPC name",
      "role": "Who they are and relationship to party",
      "status": "friendly | neutral | hostile | unknown",
      "notes": "Key details, what party learned, promises or threats"
    }
  ],
  "quests": [
    {
      "name": "Quest name",
      "status": "new | active | completed | failed",
      "giver": "Who gave the quest",
      "description": "What needs to be done",
      "reward": "Known reward or null"
    }
  ],
  "loot": [
    {
      "name": "Item name",
      "description": "What it is and known properties",
      "holder": "Which party member has it, or 'Party', or 'Unknown'"
    }
  ],
  "encounters": [
    {
      "name": "Encounter name",
      "type": "combat | social | exploration | trap | puzzle",
      "outcome": "Won | Lost | Fled | Negotiated | Discovered | etc.",
      "notes": "Notable moments, casualties, key decisions"
    }
  ],
  "locations": [
    {
      "name": "Location name",
      "description": "Brief evocative description"
    }
  ],
  "mysteries": [
    "An unresolved question or dangling thread"
  ],
  "hooks": [
    "A story hook or upcoming element to follow up on"
  ]
}

Only include sections with actual content. Empty arrays are fine.`

    // Call Groq via OpenAI-compatible API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    })

    if (!groqResponse.ok) {
      const err = await groqResponse.text()
      throw new Error(`Groq API error: ${err}`)
    }

    const groqData = await groqResponse.json()
    const rawText = groqData.choices[0]?.message?.content ?? ''

    let chronicleData: Record<string, unknown>
    try {
      chronicleData = JSON.parse(rawText)
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse AI response as JSON')
      chronicleData = JSON.parse(jsonMatch[0])
    }

    // Save to session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        title: chronicleData.title as string,
        summary: chronicleData.summary as string,
        chronicle_data: { ...chronicleData, _truncated: truncated },
        status: 'complete',
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)

    if (updateError) throw new Error(updateError.message)

    return NextResponse.json({ success: true, sessionId })
  } catch (error) {
    console.error('Chronicle processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
