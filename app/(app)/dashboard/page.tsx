import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Campaign } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📜</span>
            <span className="font-cinzel text-gold font-bold text-base tracking-wide">Archivist</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted text-xs">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button className="text-muted text-xs hover:text-text transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-cinzel text-2xl font-bold text-text">Your Campaigns</h1>
            <p className="text-muted text-sm mt-1">Select a campaign to view its chronicle, or start a new one.</p>
          </div>
          <Link
            href="/campaigns/new"
            className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-5 py-2.5 rounded-toolkit-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>+</span> New Campaign
          </Link>
        </div>

        {/* Empty state */}
        {(!campaigns || campaigns.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full glass-card flex items-center justify-center text-4xl mb-5 opacity-70">
              🗺️
            </div>
            <h2 className="font-cinzel text-lg font-semibold text-muted mb-2">No campaigns yet</h2>
            <p className="text-muted text-sm max-w-xs leading-relaxed mb-6 font-lora">
              Every great adventure starts somewhere. Create your first campaign to begin building your chronicle.
            </p>
            <Link
              href="/campaigns/new"
              className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-6 py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity"
            >
              Create Your First Campaign
            </Link>
          </div>
        )}

        {/* Campaign grid */}
        {campaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign: Campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group glass-card rounded-toolkit p-5"
              >
                <div
                  className="w-10 h-10 rounded-toolkit-sm flex items-center justify-center text-xl mb-4"
                  style={{ background: campaign.cover_color + '22', border: `1px solid ${campaign.cover_color}55` }}
                >
                  📖
                </div>
                <h3 className="font-cinzel font-bold text-text group-hover:text-gold transition-colors mb-1">
                  {campaign.name}
                </h3>
                {campaign.setting && (
                  <p className="text-muted text-xs line-clamp-2 font-lora">{campaign.setting}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-muted text-xs font-cinzel tracking-wide">
                  <span className="group-hover:text-gold transition-colors">View chronicle →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
