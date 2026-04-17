import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ChronicleView, { type ChronicleData } from './ChronicleView'

export default async function SessionPage({
  params
}: {
  params: Promise<{ id: string; sessionId: string }>
}) {
  const { id: campaignId, sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('*, campaigns(name, system, cover_color)')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const campaign = session.campaigns as { name: string; system: string; cover_color: string }
  const chronicle = session.chronicle_data as ChronicleData | null

  const sessionDateStr = session.session_date
    ? new Date(session.session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Sticky nav ── */}
      <header className="bg-surface/95 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-muted hover:text-text transition-colors text-sm flex items-center gap-1.5"
          >
            <span className="text-xs">←</span>
            <span>{campaign.name}</span>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button className="text-muted text-xs hover:text-text transition-colors">Sign out</button>
          </form>
        </div>
      </header>

      {/* ── Session hero ── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Ambient glow behind title */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${campaign.cover_color}33, transparent 70%)`,
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-10 relative">
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted font-cinzel tracking-widest uppercase mb-4">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: campaign.cover_color }}
            />
            <span>Session #{session.session_number}</span>
            {sessionDateStr && <><span className="opacity-40">·</span><span>{sessionDateStr}</span></>}
            <span className="opacity-40">·</span>
            <span>{campaign.system}</span>
          </div>

          {/* Title */}
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-text leading-tight mb-5 max-w-3xl">
            {session.title || `Session ${session.session_number}`}
          </h1>

          {/* Accent bar */}
          <div className="flex items-center gap-3">
            <div
              className="h-0.5 w-16 rounded-full"
              style={{ background: campaign.cover_color }}
            />
            <div
              className="h-0.5 w-8 rounded-full opacity-40"
              style={{ background: campaign.cover_color }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Processing state */}
        {session.status === 'processing' && (
          <div className="bg-amber/5 border border-amber/20 rounded-toolkit p-10 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-amber border-t-transparent animate-spin mx-auto mb-5" />
            <p className="font-cinzel text-amber2 font-bold text-lg mb-1">Archivist is chronicling this session…</p>
            <p className="text-muted text-sm font-lora">Refresh the page in a moment to see your chronicle.</p>
          </div>
        )}

        {/* Failed state */}
        {session.status === 'failed' && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-toolkit p-10 text-center">
            <p className="font-cinzel text-crimson2 font-bold text-lg mb-2">Chronicle processing failed</p>
            <p className="text-muted text-sm font-lora">There was an error generating this chronicle. Please try creating the session again.</p>
          </div>
        )}

        {/* Chronicle tabs */}
        {chronicle && <ChronicleView chronicle={chronicle} />}

        {/* Raw transcript */}
        {session.raw_notes && (
          <details className="mt-12 group">
            <summary className="flex items-center gap-3 cursor-pointer select-none text-muted hover:text-muted2 transition-colors py-3">
              <div className="flex-1 h-px bg-border" />
              <span className="font-cinzel text-xs tracking-widest uppercase shrink-0">View Raw Transcript</span>
              <div className="flex-1 h-px bg-border" />
            </summary>
            <div className="mt-4 bg-surface border border-border rounded-toolkit p-6">
              <pre className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-mono">
                {session.raw_notes}
              </pre>
            </div>
          </details>
        )}

      </main>
    </div>
  )
}
