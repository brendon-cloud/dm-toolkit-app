'use client'

import { useState } from 'react'

type NPC = { name: string; role: string; status: string; notes: string }
type Quest = { name: string; status: string; giver: string; description: string; reward: string | null }
type LootItem = { name: string; description: string; holder: string }
type Encounter = { name: string; type: string; outcome: string; notes: string }
type Location = { name: string; description: string }

export type ChronicleData = {
  title?: string
  summary?: string
  npcs?: NPC[]
  quests?: Quest[]
  loot?: LootItem[]
  encounters?: Encounter[]
  locations?: Location[]
  mysteries?: string[]
  hooks?: string[]
  _truncated?: boolean
}

// ── Status styling ──────────────────────────────────────────────────────────
const npcStatusStyle: Record<string, { badge: string; border: string; dot: string }> = {
  friendly: {
    badge:  'text-green2 bg-green/10 border-green/30',
    border: 'border-l-green',
    dot:    'bg-green',
  },
  neutral: {
    badge:  'text-muted2 bg-surface3 border-border2',
    border: 'border-l-border2',
    dot:    'bg-muted',
  },
  hostile: {
    badge:  'text-red2 bg-red/10 border-red/30',
    border: 'border-l-red',
    dot:    'bg-red2',
  },
  unknown: {
    badge:  'text-muted2 bg-surface3 border-border',
    border: 'border-l-border',
    dot:    'bg-muted2',
  },
}

const questStatusStyle: Record<string, { badge: string; border: string }> = {
  new:       { badge: 'text-accent2 bg-accent/10 border-accent/30',  border: 'border-l-accent2' },
  active:    { badge: 'text-gold bg-gold/10 border-gold/30',          border: 'border-l-gold' },
  completed: { badge: 'text-green2 bg-green/10 border-green/30',      border: 'border-l-green' },
  failed:    { badge: 'text-red2 bg-red/10 border-red/30',            border: 'border-l-red' },
}

const encounterTypeStyle: Record<string, string> = {
  combat:      'text-red2 bg-red/10 border-red/20',
  social:      'text-blue bg-blue/10 border-blue/20',
  exploration: 'text-teal bg-teal/10 border-teal/20',
  trap:        'text-accent2 bg-accent/10 border-accent/20',
  puzzle:      'text-gold bg-gold/10 border-gold/20',
}

const encounterTypeIcon: Record<string, string> = {
  combat:      '⚔️',
  social:      '💬',
  exploration: '🧭',
  trap:        '⚠️',
  puzzle:      '🔐',
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionHeading({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-gold text-base">{icon}</span>
      <h2 className="font-cinzel text-sm font-bold text-gold tracking-widest uppercase">{label}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-border2 to-transparent" />
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────────
function Empty({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-muted text-sm font-lora italic opacity-70">
      {message}
    </div>
  )
}

// ── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'chronicle', label: 'Chronicle',  icon: '📜' },
  { id: 'people',    label: 'People',     icon: '👥' },
  { id: 'quests',    label: 'Quests',     icon: '⚔️' },
  { id: 'combat',    label: 'Combat',     icon: '🎲' },
  { id: 'world',     label: 'World',      icon: '🗺️' },
] as const

type TabId = typeof TABS[number]['id']

// ── Main component ──────────────────────────────────────────────────────────
export default function ChronicleView({ chronicle }: { chronicle: ChronicleData }) {
  const [activeTab, setActiveTab] = useState<TabId>('chronicle')

  return (
    <div>
      {/* Truncation warning */}
      {chronicle._truncated && (
        <div className="mb-5 bg-accent/5 border border-accent/20 rounded-toolkit px-4 py-3 text-sm text-accent2 flex items-start gap-2.5">
          <span className="shrink-0 mt-0.5 text-base">⚠️</span>
          <span className="font-lora">
            This session&apos;s transcript was very long — Archivist analyzed the first portion.
            The chronicle may not reflect events from later in the session.
          </span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-3.5 text-xs font-cinzel font-bold tracking-wider uppercase
              border-b-2 transition-all shrink-0 whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-gold text-gold'
                : 'border-transparent text-muted hover:text-muted2 hover:border-border2'
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Chronicle ── */}
      {activeTab === 'chronicle' && (
        <div>
          {chronicle.summary ? (
            <div className="relative">
              {/* Decorative top border */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-1" />
              <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-6" />

              <div className="bg-surface border border-border/60 rounded-toolkit p-8 relative overflow-hidden">
                {/* Subtle corner ornaments */}
                <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-gold/20" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-gold/20" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-gold/20" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-gold/20" />

                <div className="text-center mb-6">
                  <span className="text-gold/40 text-2xl tracking-widest">✦  ✦  ✦</span>
                </div>

                <div className="max-w-2xl mx-auto">
                  {chronicle.summary.split('\n\n').map((para, i) => (
                    <p
                      key={i}
                      className="font-lora text-text leading-loose text-base mb-5 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                <div className="text-center mt-6">
                  <span className="text-gold/40 text-2xl tracking-widest">✦  ✦  ✦</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mt-1" />
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>
          ) : (
            <Empty message="No chronicle summary was generated for this session." />
          )}
        </div>
      )}

      {/* ── Tab: People ── */}
      {activeTab === 'people' && (
        <div>
          <SectionHeading icon="👥" label="NPCs Encountered" />
          {chronicle.npcs && chronicle.npcs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chronicle.npcs.map((npc, i) => {
                const style = npcStatusStyle[npc.status] ?? npcStatusStyle.unknown
                return (
                  <div
                    key={i}
                    className={`bg-surface border border-border rounded-toolkit p-5 border-l-4 ${style.border} hover:bg-surface2 transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${style.dot}`} />
                        <h3 className="font-cinzel font-bold text-text">{npc.name}</h3>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 font-cinzel font-bold tracking-wide uppercase ${style.badge}`}>
                        {npc.status}
                      </span>
                    </div>
                    <p className="text-muted text-xs mb-3 font-lora italic ml-3.5">{npc.role}</p>
                    {npc.notes && (
                      <p className="text-muted2 text-sm leading-relaxed font-lora ml-3.5">{npc.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty message="No NPCs were recorded for this session." />
          )}
        </div>
      )}

      {/* ── Tab: Quests ── */}
      {activeTab === 'quests' && (
        <div>
          <SectionHeading icon="⚔️" label="Quests" />
          {chronicle.quests && chronicle.quests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {chronicle.quests.map((quest, i) => {
                const style = questStatusStyle[quest.status] ?? questStatusStyle.active
                return (
                  <div
                    key={i}
                    className={`bg-surface border border-border rounded-toolkit p-5 border-l-4 ${style.border} hover:bg-surface2 transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-cinzel font-bold text-text text-base">{quest.name}</h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 font-cinzel font-bold tracking-wide uppercase ${style.badge}`}>
                        {quest.status}
                      </span>
                    </div>
                    <p className="text-muted text-xs mb-3 font-lora italic">
                      Quest giver: <span className="text-muted2">{quest.giver}</span>
                    </p>
                    <p className="text-muted2 text-sm leading-relaxed font-lora">{quest.description}</p>
                    {quest.reward && quest.reward !== 'null' && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                        <span className="text-gold text-xs">💰</span>
                        <p className="text-gold text-xs font-cinzel tracking-wide">
                          Reward: <span className="font-normal text-gold/80">{quest.reward}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty message="No quests were recorded for this session." />
          )}
        </div>
      )}

      {/* ── Tab: Combat ── */}
      {activeTab === 'combat' && (
        <div>
          <SectionHeading icon="🎲" label="Encounters" />
          {chronicle.encounters && chronicle.encounters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chronicle.encounters.map((enc, i) => {
                const typeStyle = encounterTypeStyle[enc.type] ?? 'text-muted2 bg-surface3 border-border'
                const typeIcon = encounterTypeIcon[enc.type] ?? '🎲'
                return (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-toolkit p-5 hover:bg-surface2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-cinzel font-bold text-text">{enc.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 font-cinzel font-bold tracking-wide uppercase flex items-center gap-1 ${typeStyle}`}>
                        <span>{typeIcon}</span> {enc.type}
                      </span>
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-green" />
                      <p className="text-green text-xs font-cinzel tracking-wide font-bold uppercase">{enc.outcome}</p>
                    </div>
                    {enc.notes && (
                      <p className="text-muted2 text-sm leading-relaxed font-lora">{enc.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty message="No encounters were recorded for this session." />
          )}
        </div>
      )}

      {/* ── Tab: World ── */}
      {activeTab === 'world' && (
        <div className="flex flex-col gap-10">

          {/* Locations */}
          <div>
            <SectionHeading icon="🗺️" label="Locations" />
            {chronicle.locations && chronicle.locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chronicle.locations.map((loc, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-toolkit p-5 border-l-4 border-l-teal hover:bg-surface2 transition-colors"
                  >
                    <h3 className="font-cinzel font-bold text-text mb-2">{loc.name}</h3>
                    <p className="text-muted2 text-sm leading-relaxed font-lora">{loc.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty message="No locations were recorded." />
            )}
          </div>

          {/* Loot */}
          {chronicle.loot && chronicle.loot.length > 0 && (
            <div>
              <SectionHeading icon="💰" label="Loot & Items" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chronicle.loot.map((item, i) => (
                  <div
                    key={i}
                    className="bg-surface border border-border rounded-toolkit p-5 border-l-4 border-l-gold hover:bg-surface2 transition-colors"
                  >
                    <h3 className="font-cinzel font-bold text-text mb-1">{item.name}</h3>
                    <p className="text-muted2 text-sm leading-relaxed font-lora mb-2">{item.description}</p>
                    <p className="text-muted text-xs font-cinzel tracking-wide">
                      Held by: <span className="text-muted2">{item.holder}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mysteries + Hooks */}
          {((chronicle.mysteries && chronicle.mysteries.length > 0) ||
            (chronicle.hooks && chronicle.hooks.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {chronicle.mysteries && chronicle.mysteries.length > 0 && (
                <div>
                  <SectionHeading icon="🔮" label="Open Mysteries" />
                  <div className="bg-surface border border-border/60 rounded-toolkit overflow-hidden">
                    {chronicle.mysteries.map((m, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 px-5 py-3.5 ${i < chronicle.mysteries!.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        <span className="text-muted mt-0.5 shrink-0 font-cinzel text-xs">?</span>
                        <span className="text-muted2 text-sm font-lora leading-relaxed">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {chronicle.hooks && chronicle.hooks.length > 0 && (
                <div>
                  <SectionHeading icon="🪝" label="Next Session Hooks" />
                  <div className="bg-surface border border-border/60 rounded-toolkit overflow-hidden">
                    {chronicle.hooks.map((h, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 px-5 py-3.5 ${i < chronicle.hooks!.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        <span className="text-purple2 mt-0.5 shrink-0 font-cinzel text-xs">→</span>
                        <span className="text-muted2 text-sm font-lora leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
