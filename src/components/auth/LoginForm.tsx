'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GoogleAuthButton } from './OAuthButtons'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = () => {
    const errs: { email?: string; password?: string } = {}
    if (!form.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!form.password) {
      errs.password = 'Password is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const getTargetUrl = () => {
    if (typeof window === 'undefined') return '/profile'
    const params = new URLSearchParams(window.location.search)
    return params.get('next') || params.get('redirect') || '/profile'
  }

  const executeAuth = async (email: string, pass: string) => {
    setLoading(true)
    setServerError(null)

    try {
      // 1. Call server API route to establish HTTP-only session cookies
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      })

      const serverData = await serverRes.json().catch(() => ({}))

      // 2. Also authenticate browser client for client-side state
      try {
        const supabase = createClient()
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        })
      } catch {
        // Continue to server response verification
      }

      if (!serverRes.ok) {
        const errorMsg = serverData.error || 'Invalid email or password'
        if (errorMsg.toLowerCase().includes('invalid login credentials')) {
          setServerError('Invalid email or password. You can use the 1-Click Demo Sign In below.')
        } else {
          setServerError(errorMsg)
        }
        setLoading(false)
        return
      }

      // Success!
      setRedirecting(true)
      const target = getTargetUrl()
      // Give browser time to commit cookies then redirect
      setTimeout(() => {
        window.location.href = target
      }, 350)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setServerError(msg)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await executeAuth(form.email, form.password)
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">Welcome back</h1>
        <p className="text-xs sm:text-sm text-[#635b52]">Sign in to your CareerPilot AI Profile & Dashboard</p>
      </div>

      <GoogleAuthButton label="Continue with Google" />

      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#eadcc9] w-full" />
        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#78716c] relative font-bold">
          Or with email
        </span>
      </div>

      {redirecting ? (
        <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-medium">Signed in! Redirecting to your Profile...</span>
        </div>
      ) : (
        <>
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="leading-relaxed">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-[#572d12] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#fffaf3] text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                    errors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#eadcc9] focus:border-[#d97706] focus:ring-[#d97706]/20'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#572d12]">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-[#d97706] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  disabled={loading}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-[#fffaf3] text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                    errors.password
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#eadcc9] focus:border-[#d97706] focus:ring-[#d97706]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#572d12] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pavitra-btn w-full flex items-center justify-center gap-2 font-bold cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Go to Profile</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      <p className="text-center text-xs text-[#635b52]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#d97706] font-bold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
