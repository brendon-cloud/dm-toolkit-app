import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!campaign) notFound()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, session_number, session_date, status, summary')
    .eq('campaign_id', id)
    .order('session_number', { ascending: false })

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted hover:text-text transition-colors text-sm">← Campaigns</Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full"
                style={{ background: campaign.cover_color }}
              />
              <span className="font-cinzel text-text font-bold text-sm">{campaign.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted text-xs">{campaign.system}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-muted text-xs hover:text-text transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-text mb-1">{campaign.name}</h1>
            {campaign.setting && (
              <p className="text-muted text-sm max-w-xl">{campaign.setting}</p>
            )}
          </div>
          <Link
            href={`/campaigns/${id}/sessions/new`}
            className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-5 py-2.5 rounded-toolkit-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
          >
            <span>+</span> Add Session
          </Link>
        </div>

        {/* Empty state */}
        {(!sessions || sessions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-5 opacity-40">📖</div>
            <h2 className="font-cinzel text-lg font-semibold text-muted mb-2">No sessions yet</h2>
            <p className="text-muted text-sm max-w-xs leading-relaxed mb-6">
              After your first session, paste in your notes and Archivist will transform them into a structured chronicle.
            </p>
            <Link
              href={`/campaigns/${id}/sessions/new`}
              className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-6 py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity"
            >
              Add Your First Session
            </Link>
          </div>
        )}

        {/* Sessions list */}
        {sessions && sessions.length > 0 && (
          <div className="flex flex-col gap-3">
            {sessions.map(session => (
              <Link
                key={session.id}
                href={`/campaigns/${id}/sessions/${session.id}`}
                className="group bg-surface border border-border rounded-toolkit p-5 hover:border-border2 hover:bg-surface2 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-toolkit-sm bg-surface2 border border-border flex items-center justify-center shrink-0">
                    <span className="font-cinzel text-muted text-xs font-bold">#{session.session_number}</span>
                  </div>
                  <div>
                    <h3 className="font-cinzel font-bold text-text group-hover:text-gold transition-colors">
                      {session.title || `Session ${session.session_number}`}
                    </h3>
                    {session.summary && (
                      <p className="text-muted text-xs mt-0.5 line-clamp-1">{session.summary}</p>
                    )}
                    {session.session_date && (
                      <p className="text-muted text-xs mt-0.5">
                        {new Date(session.session_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {session.status === 'processing' && (
                    <span className="text-xs text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">Processing…</span>
                  )}
                  {session.status === 'complete' && (
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Chronicle ready</span>
                  )}
                  <span className="text-muted text-sm group-hover:text-text transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
