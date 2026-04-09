'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">📜</div>
        <h1 className="font-cinzel text-2xl font-bold text-gold tracking-wide">The DM Toolkit</h1>
        <p className="text-muted text-sm mt-1">The Archivist</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface border border-border rounded-toolkit p-8">
        <h2 className="font-cinzel text-lg font-bold text-text mb-1">Welcome back</h2>
        <p className="text-muted text-sm mb-6">Sign in to your campaign archives</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dm@yourrealm.com"
              required
              className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-surface2 border border-border rounded-toolkit-sm px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
            />
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-toolkit-sm px-3 py-2 text-red2 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-purple to-purple2 text-white font-cinzel font-bold text-sm py-3 rounded-toolkit-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Enter the Archives'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted">
          No account?{' '}
          <Link href="/signup" className="text-purple2 hover:text-purple font-semibold transition-colors">
            Start your free trial
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-muted">
        <Link href="https://thedmtoolkit.com" className="hover:text-muted2 transition-colors">
          ← Back to thedmtoolkit.com
        </Link>
      </div>
    </div>
  )
}
