'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // On success, Supabase redirects the browser — no further action needed
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

        {/* Google SSO */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-surface2 border border-border hover:border-muted text-text font-semibold text-sm py-2.5 rounded-toolkit-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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
            disabled={loading || googleLoading}
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
