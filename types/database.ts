// ── Database Types ──
// These mirror the Supabase schema exactly.

export type Plan = 'free' | 'pro'
export type EntityType = 'npc' | 'location' | 'faction' | 'item' | 'event'
export type SectionType = 'chronicle' | 'npcs' | 'encounters' | 'quests' | 'loot' | 'mysteries' | 'next_session'
export type JobStatus = 'queued' | 'processing' | 'done' | 'failed'
export type QuestStatus = 'active' | 'completed' | 'failed' | 'discovered'
export type Relationship = 'ally' | 'enemy' | 'neutral' | 'mysterious'
export type EncounterOutcome = 'victory' | 'defeat' | 'flee' | 'resolved'
export type LootType = 'weapon' | 'armor' | 'magic' | 'gold' | 'consumable' | 'misc'
export type ChronicleТone = 'epic' | 'lore' | 'concise' | 'narrative'

export interface Profile {
  id: string
  email: string
  plan: Plan
  trial_ends_at: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  user_id: string
  name: string
  setting: string | null
  world_notes: string | null
  cover_color: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  campaign_id: string
  session_number: number | null
  title: string | null
  date: string | null
  raw_notes: string | null
  audio_url: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

export interface ChronicleSection {
  id: string
  session_id: string
  section_type: SectionType
  data: ChronicleData
  display_order: number
  created_at: string
}

// ── Chronicle JSON shapes ──
export interface ChronicleData {
  chronicle?: string
  session_title?: string
  npcs?: NPC[]
  encounters?: Encounter[]
  quests?: Quest[]
  loot?: LootItem[]
  mysteries?: Mystery[]
  next_session?: NextSession
}

export interface NPC {
  name: string
  role: string
  relationship: Relationship
  emoji: string
  notes: string
}

export interface Encounter {
  name: string
  outcome: EncounterOutcome
  notes: string
}

export interface Quest {
  name: string
  status: QuestStatus
  notes: string
}

export interface LootItem {
  name: string
  type: LootType
  notes: string
}

export interface Mystery {
  question: string
  clues: string
}

export interface NextSession {
  reminders: string[]
  hooks: string[]
}

export interface Entity {
  id: string
  campaign_id: string
  type: EntityType
  name: string
  description: string | null
  data: Record<string, unknown>
  session_first_seen: string | null
  created_at: string
  updated_at: string
}

export interface ProcessingJob {
  id: string
  session_id: string
  status: JobStatus
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}
