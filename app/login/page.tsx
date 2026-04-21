'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
    <div className="min-h-screen bg-surface flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[52%] bg-primary flex-col items-center justify-center px-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-20 w-md h-112 rounded-full bg-white/5" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mb-8">
            <Image
              src="/gsf-logo-def.jpeg"
              alt="GSF Logo"
              width={144}
              height={144}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="font-headline font-extrabold text-3xl text-white leading-tight mb-3">
            Ghousunnissa Saheba<br />Foundation
          </h1>
          <p className="text-on-primary/70 text-sm font-label leading-relaxed max-w-xs">
            Secure financial management for the Foundation's accounts, subscriptions, and fund tracking.
          </p>

        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Mobile logo */}
        <div className="flex flex-col items-center mb-10 lg:hidden">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline-variant shadow mb-4">
            <Image
              src="/gsf-logo-def.jpeg"
              alt="GSF Logo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="font-headline font-extrabold text-xl text-primary text-center leading-tight">
            Ghousunnissa Saheba Foundation
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">Financial Integrity</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-on-surface">Welcome back</h2>
            <p className="text-sm text-on-surface-variant mt-1">Sign in to the accounts portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="treasurer@gsf.demo"
                required
                autoComplete="email"
                className="w-full bg-surface-highest border border-outline-variant/40 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-surface-highest border border-outline-variant/40 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-error-container/40 border border-error-container rounded-lg px-3 py-2.5">
                <span className="material-symbols-outlined text-[16px] text-error shrink-0">error</span>
                <p className="text-xs text-on-error-container">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-primary to-primary-container text-on-primary font-label font-semibold px-4 py-3 rounded-lg hover:opacity-95 transition-opacity disabled:opacity-60 text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 bg-surface-container rounded-xl p-4 border border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
              <p className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wide">
                Demo credentials
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Email</span>
                <span className="text-xs text-on-surface font-mono bg-surface-highest px-2 py-0.5 rounded">
                  treasurer@gsf.demo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Password</span>
                <span className="text-xs text-on-surface font-mono bg-surface-highest px-2 py-0.5 rounded">
                  demo123
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-on-surface-variant/60 mt-8">
            © 2025 Ghousunnissa Saheba Foundation
          </p>
        </div>
      </div>
    </div>
  )
}
