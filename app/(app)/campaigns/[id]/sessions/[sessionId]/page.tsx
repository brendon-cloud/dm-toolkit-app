import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type NPC = { name: string; role: string; status: string; notes: string }
type Quest = { name: string; status: string; giver: string; description: string; reward: string | null }
type LootItem = { name: string; description: string; holder: string }
type Encounter = { name: string; type: string; outcome: string; notes: string }
type Location = { name: string; description: string }

type ChronicleData = {
  title?: string
  summary?: string
  npcs?: NPC[]
  quests?: Quest[]
  loot?: LootItem[]
  encounters?: Encounter[]
  locations?: Location[]
  mysteries?: string[]
  hooks?: string[]
}

const statusColors: Record<string, string> = {
  friendly: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  neutral: 'text-muted bg-surface2 border-border',
  hostile: 'text-red2 bg-red/10 border-red/20',
  unknown: 'text-muted2 bg-surface2 border-border',
  new: 'text-purple2 bg-purple/10 border-purple/20',
  active: 'text-gold bg-gold/10 border-gold/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  failed: 'text-red2 bg-red/10 border-red/20',
}

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
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/campaigns/${campaignId}`} className="text-muted hover:text-text transition-colors text-sm">← {campaign.name}</Link>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="text-muted text-xs hover:text-text transition-colors">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Session header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-muted text-sm mb-3">
            <span>Session #{session.session_number}</span>
            {sessionDateStr && <><span>·</span><span>{sessionDateStr}</span></>}
            <span>·</span>
            <span>{campaign.system}</span>
          </div>
          <h1 className="font-cinzel text-4xl font-bold text-text mb-4 leading-tight">
            {session.title || `Session ${session.session_number}`}
          </h1>
          <div
            className="h-1 w-24 rounded-full"
            style={{ background: campaign.cover_color }}
          />
        </div>

        {/* Processing state */}
        {session.status === 'processing' && (
          <div className="bg-purple/10 border border-purple/30 rounded-toolkit p-8 text-center">
            <div className="w-10 h-10 rounded-full border-2 border-purple border-t-transparent animate-spin mx-auto mb-4" />
            <p className="font-cinzel text-purple2 font-bold">Archivist is chronicling this session…</p>
            <p className="text-muted text-sm mt-1">Refresh the page in a moment to see your chronicle.</p>
          </div>
        )}

        {/* Failed state */}
        {session.status === 'failed' && (
          <div className="bg-red/10 border border-red/30 rounded-toolkit p-8 text-center">
            <p className="font-cinzel text-red2 font-bold mb-2">Chronicle processing failed</p>
            <p className="text-muted text-sm">There was an error generating this chronicle. Please try creating the session again.</p>
          </div>
        )}

        {/* Chronicle content */}
        {chronicle && (
          <div className="flex flex-col gap-8">

            {/* Summary */}
            {chronicle.summary && (
              <section>
                <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                  <span>📜</span> The Story So Far
                </h2>
                <div className="bg-surface border border-border rounded-toolkit p-6">
                  {chronicle.summary.split('\n\n').map((para, i) => (
                    <p key={i} className="text-text leading-relaxed mb-3 last:mb-0">{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Two-column: NPCs + Quests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* NPCs */}
              {chronicle.npcs && chronicle.npcs.length > 0 && (
                <section>
                  <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                    <span>👥</span> NPCs Encountered
                  </h2>
                  <div className="flex flex-col gap-3">
                    {chronicle.npcs.map((npc, i) => (
                      <div key={i} className="bg-surface border border-border rounded-toolkit p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-cinzel font-bold text-text text-sm">{npc.name}</h3>
                          {npc.status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColors[npc.status] ?? statusColors.unknown}`}>
                              {npc.status}
                            </span>
                          )}
                        </div>
                        <p className="text-muted text-xs mb-2">{npc.role}</p>
                        {npc.notes && <p className="text-text text-xs leading-relaxed">{npc.notes}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Quests */}
              {chronicle.quests && chronicle.quests.length > 0 && (
                <section>
                  <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                    <span>⚔️</span> Quests
                  </h2>
                  <div className="flex flex-col gap-3">
                    {chronicle.quests.map((quest, i) => (
                      <div key={i} className="bg-surface border border-border rounded-toolkit p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-cinzel font-bold text-text text-sm">{quest.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusColors[quest.status] ?? statusColors.neutral}`}>
                            {quest.status}
                          </span>
                        </div>
                        <p className="text-muted text-xs mb-2">Given by: {quest.giver}</p>
                        <p className="text-text text-xs leading-relaxed">{quest.description}</p>
                        {quest.reward && (
                          <p className="text-gold text-xs mt-2">Reward: {quest.reward}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Encounters */}
            {chronicle.encounters && chronicle.encounters.length > 0 && (
              <section>
                <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                  <span>🎲</span> Encounters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chronicle.encounters.map((enc, i) => (
                    <div key={i} className="bg-surface border border-border rounded-toolkit p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-cinzel font-bold text-text text-sm">{enc.name}</h3>
                        <span className="text-xs text-muted bg-surface2 border border-border px-2 py-0.5 rounded-full shrink-0 capitalize">{enc.type}</span>
                      </div>
                      <p className="text-xs text-emerald-400 mb-2">Outcome: {enc.outcome}</p>
                      {enc.notes && <p className="text-text text-xs leading-relaxed">{enc.notes}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Loot + Locations row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Loot */}
              {chronicle.loot && chronicle.loot.length > 0 && (
                <section>
                  <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                    <span>💰</span> Loot & Items
                  </h2>
                  <div className="flex flex-col gap-2">
                    {chronicle.loot.map((item, i) => (
                      <div key={i} className="bg-surface border border-border rounded-toolkit p-4">
                        <h3 className="font-cinzel font-bold text-text text-sm mb-1">{item.name}</h3>
                        <p className="text-text text-xs leading-relaxed mb-1">{item.description}</p>
                        <p className="text-muted text-xs">Held by: {item.holder}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Locations */}
              {chronicle.locations && chronicle.locations.length > 0 && (
                <section>
                  <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                    <span>🗺️</span> Locations
                  </h2>
                  <div className="flex flex-col gap-2">
                    {chronicle.locations.map((loc, i) => (
                      <div key={i} className="bg-surface border border-border rounded-toolkit p-4">
                        <h3 className="font-cinzel font-bold text-text text-sm mb-1">{loc.name}</h3>
                        <p className="text-text text-xs leading-relaxed">{loc.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Mysteries + Hooks */}
            {((chronicle.mysteries && chronicle.mysteries.length > 0) || (chronicle.hooks && chronicle.hooks.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {chronicle.mysteries && chronicle.mysteries.length > 0 && (
                  <section>
                    <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                      <span>🔮</span> Open Mysteries
                    </h2>
                    <div className="bg-surface border border-border rounded-toolkit p-4">
                      <ul className="flex flex-col gap-2">
                        {chronicle.mysteries.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text">
                            <span className="text-muted mt-0.5 shrink-0">?</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {chronicle.hooks && chronicle.hooks.length > 0 && (
                  <section>
                    <h2 className="font-cinzel text-lg font-bold text-gold mb-4 flex items-center gap-2">
                      <span>🪝</span> Next Session Hooks
                    </h2>
                    <div className="bg-surface border border-border rounded-toolkit p-4">
                      <ul className="flex flex-col gap-2">
                        {chronicle.hooks.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text">
                            <span className="text-purple2 mt-0.5 shrink-0">→</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
              </div>
            )}

          </div>
        )}

        {/* Raw notes toggle (always available) */}
        {session.raw_notes && (
          <details className="mt-10 bg-surface border border-border rounded-toolkit">
            <summary className="px-5 py-4 cursor-pointer text-sm text-muted hover:text-text transition-colors font-cinzel font-semibold select-none">
              View Raw Notes
            </summary>
            <div className="px-5 pb-5 border-t border-border mt-0">
              <pre className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-mono pt-4">
                {session.raw_notes}
              </pre>
            </div>
          </details>
        )}

      </main>
    </div>
  )
}
