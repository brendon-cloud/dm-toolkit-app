'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-surface border border-border rounded-toolkit p-8 text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="font-cinzel text-lg font-bold text-text mb-2">Check your email</h2>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to <strong className="text-text">{email}</strong>.
            Click it to activate your account and enter the archives.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-3">📜</div>
        <h1 className="font-cinzel text-2xl font-bold text-gold tracking-wide">The DM Toolkit</h1>
        <p className="text-muted text-sm mt-1">The Archivist</p>
      </div>

      {/* Trial badge */}
      <div className="mb-4 inline-flex items-center gap-2 bg-purple/10 border border-purple/30 rounded-full px-4 py-1.5 text-xs font-semibold text-purple2">
        ✦ 14-day free trial — no credit card required
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface border border-border rounded-toolkit p-8">
        <h2 className="font-cinzel text-lg font-bold text-text mb-1">Create your account</h2>
        <p className="text-muted text-sm mb-6">Start chronicling your campaign history</p>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
              placeholder="At least 8 characters"
              minLength={8}
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
            {loading ? 'Creating account…' : 'Begin Your Chronicle'}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted text-center leading-relaxed">
          By signing up you agree to our{' '}
          <Link href="https://thedmtoolkit.com/terms.html" className="text-purple2 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="https://thedmtoolkit.com/privacy-policy.html" className="text-purple2 hover:underline">Privacy Policy</Link>.
        </p>

        <div className="mt-5 pt-5 border-t border-border text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-purple2 hover:text-purple font-semibold transition-colors">
            Sign in
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
