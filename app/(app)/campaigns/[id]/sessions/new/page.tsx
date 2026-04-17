'use client'

import { useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: campaignId } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [sessionNumber, setSessionNumber] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [srtFile, setSrtFile] = useState<File | null>(null)
  const [srtContent, setSrtContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'processing'>('idle')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.srt')) {
      setError('Please upload an .srt file from your transcription software.')
      return
    }
    setError(null)
    setSrtFile(file)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setSrtContent(ev.target?.result as string)
    }
    reader.readAsText(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!srtContent) return
    setError(null)
    setStatus('saving')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Auto-calculate session number if blank
    let num = parseInt(sessionNumber)
    if (!sessionNumber || isNaN(num)) {
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
      num = (count ?? 0) + 1
    }

    // Create session record with SRT content as raw_notes
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        campaign_id: campaignId,
        user_id: user.id,
        session_number: num,
        session_date: sessionDate || null,
        raw_notes: srtContent,
        status: 'processing',
      })
      .select()
      .single()

    if (sessionError) {
      setError(sessionError.message)
      setStatus('idle')
      return
    }

    setStatus('processing')

    // Trigger AI chronicle generation
    const res = await fetch('/api/chronicle/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Something went wrong processing your transcript.')
      setStatus('idle')
      return
    }

    router.push(`/campaigns/${campaignId}/sessions/${session.id}`)
  }

  const isLoading = status === 'saving' || status === 'processing'

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href={`/campaigns/${campaignId}`} className="text-muted hover:text-text transition-colors text-sm">← Back to campaign</Link>
          <span className="text-border">|</span>
          <span className="font-cinzel text-gold font-bold text-sm tracking-wide">New Session</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold text-text mb-2">Chronicle a Session</h1>
          <p className="text-muted leading-relaxed">
            Upload the <strong className="text-text">.srt transcript</strong> from your session recording.
            Archivist will parse the transcript and generate a full structured chronicle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-toolkit p-6 flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">
                  Session # <span className="text-muted normal-case font-normal">(auto if blank)</span>
                </label>
                <input
                  type="number"
                  value={sessionNumber}
                  onChange={e => setSessionNumber(e.target.value)}
                  placeholder="e.g. 12"
                  min={1}
                  className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={e => setSessionDate(e.target.value)}
                  className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                />
              </div>
            </div>

            {/* SRT upload */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Session Transcript (.srt) *</label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".srt"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`
                  w-full border-2 border-dashed rounded-toolkit p-8 text-center transition-all
                  ${srtFile
                    ? 'border-purple/50 bg-purple/5'
                    : 'border-border hover:border-border2 hover:bg-surface2'
                  }
                `}
              >
                {srtFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl">📄</div>
                    <p className="font-cinzel font-bold text-text text-sm">{srtFile.name}</p>
                    <p className="text-xs text-muted">{(srtFile.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl opacity-40">🎙️</div>
                    <p className="font-cinzel font-semibold text-muted text-sm">Click to upload your .srt file</p>
                    <p className="text-xs text-muted">Generated by your transcription software</p>
                  </div>
                )}
              </button>
            </div>

          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-toolkit-sm px-4 py-3 text-red2 text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="bg-purple/10 border border-purple/30 rounded-toolkit p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-purple border-t-transparent animate-spin shrink-0" />
              <div>
                <p className="font-cinzel text-sm font-bold text-purple2">
                  {status === 'saving' ? 'Saving your transcript…' : 'Archivist is reading the transcript…'}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {status === 'processing' ? 'This usually takes 15–30 seconds.' : ''}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !srtFile}
              className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-6 py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing…' : 'Generate Chronicle'}
            </button>
            {!isLoading && (
              <Link
                href={`/campaigns/${campaignId}`}
                className="px-6 py-3 rounded-toolkit-sm text-sm text-muted hover:text-text border border-border hover:border-border2 transition-all"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
