'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (email === 'treasurer@gsf.demo' && password === 'demo123') {
      localStorage.setItem('gsf_demo_authed', 'true')
      router.push('/dashboard')
    } else {
      setError('Invalid credentials. Use the demo credentials below.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
            <span className="text-on-primary-container font-headline font-extrabold text-lg">GS</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-primary">Project GSF</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Financial Integrity</p>
        </div>

        {/* Card */}
        <div className="bg-surface-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-1">Sign in</h2>
          <p className="text-sm text-on-surface-variant mb-6">Access your Foundation account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="treasurer@gsf.demo"
                required
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-label font-medium text-on-surface-variant uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-highest border-none rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-xs text-error font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-4 py-2.5 rounded-md hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-surface-container rounded-xl p-3.5 border border-outline-variant/20">
          <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
            Demo credentials
          </p>
          <div className="space-y-1">
            <p className="text-xs text-on-surface font-mono">
              <span className="text-on-surface-variant">Email: </span>treasurer@gsf.demo
            </p>
            <p className="text-xs text-on-surface font-mono">
              <span className="text-on-surface-variant">Password: </span>demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
