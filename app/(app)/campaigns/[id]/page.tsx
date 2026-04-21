import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SessionsList from './SessionsList'

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
    .select('id, title, session_number, session_date, status, summary, display_order, archived')
    .eq('campaign_id', id)
    .order('display_order', { ascending: true, nullsFirst: false })

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Nav ── */}
      <header className="bg-surface/95 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted hover:text-text transition-colors text-sm">
              ← Campaigns
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: campaign.cover_color }}
              />
              <span className="font-cinzel text-text font-bold text-sm">{campaign.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted text-xs font-cinzel">{campaign.system}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-muted text-xs hover:text-text transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Campaign header ── */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-text mb-1">{campaign.name}</h1>
            {campaign.setting && (
              <p className="text-muted text-sm max-w-xl font-lora">{campaign.setting}</p>
            )}
          </div>
          <Link
            href={`/campaigns/${id}/sessions/new`}
            className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-5 py-2.5 rounded-toolkit-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
          >
            <span>+</span> Add Session
          </Link>
        </div>

        {/* ── Sessions ── */}
        <SessionsList
          initialSessions={sessions ?? []}
          campaignId={id}
        />

      </main>
    </div>
  )
}
