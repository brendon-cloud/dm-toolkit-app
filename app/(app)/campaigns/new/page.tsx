'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const COLORS = [
  '#c9a84c', // gold
  '#7c5ce8', // purple
  '#e85c7c', // rose
  '#5ce8a8', // emerald
  '#5ca8e8', // blue
  '#e8925c', // orange
]

const SYSTEMS = [
  'D&D 5e',
  'Pathfinder 2e',
  'Call of Cthulhu',
  'Starfinder',
  'Shadowrun',
  'Vampire: The Masquerade',
  'Other',
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [setting, setSetting] = useState('')
  const [system, setSystem] = useState('D&D 5e')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        setting: setting || null,
        system,
        cover_color: color,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/campaigns/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="text-muted hover:text-text transition-colors text-sm">← Back</Link>
          <span className="text-border">|</span>
          <span className="font-cinzel text-gold font-bold text-sm tracking-wide">New Campaign</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold text-text mb-2">Begin a New Campaign</h1>
          <p className="text-muted">Give your adventure a name and some context. You can always edit this later.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-toolkit p-6 flex flex-col gap-5">

            {/* Campaign name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Campaign Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Curse of Strahd, The Lost Coast..."
                required
                className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
              />
            </div>

            {/* System */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Game System</label>
              <select
                value={system}
                onChange={e => setSystem(e.target.value)}
                className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
              >
                {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Setting */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">
                World / Setting <span className="text-muted normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={setting}
                onChange={e => setSetting(e.target.value)}
                placeholder="Brief description of your campaign's world or setting. This helps the AI understand the context when generating chronicles."
                rows={3}
                className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all resize-none"
              />
            </div>

            {/* Color */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Campaign Color</label>
              <div className="flex gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      outline: color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-toolkit-sm px-4 py-3 text-red2 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm px-6 py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create Campaign'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-toolkit-sm text-sm text-muted hover:text-text border border-border hover:border-border2 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
