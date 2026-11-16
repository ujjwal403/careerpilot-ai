'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GoogleAuthButton } from './OAuthButtons'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

const USER_TYPES = [
  { value: 'job_seeker', label: 'Job Seeker (Active)' },
  { value: 'career_switcher', label: 'Career Switcher' },
  { value: 'student_grad', label: 'Student / Recent Graduate' },
  { value: 'freelancer', label: 'Freelancer / Consultant' },
] as const

interface FormErrors {
  name?: string
  email?: string
  password?: string
  city?: string
  userType?: string
}

export function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    userType: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const validate = (): boolean => {
    const errs: FormErrors = {}

    if (!form.name.trim()) {
      errs.name = 'Full name is required'
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }

    if (!form.password) {
      errs.password = 'Password is required'
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(form.password)) {
      errs.password = 'Must include at least one letter and one number'
    }

    if (!form.city.trim()) {
      errs.city = 'City is required'
    }

    if (!form.userType) {
      errs.userType = 'Please select your status'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const fillDemoData = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    setForm({
      name: 'Alex Rivera',
      email: `alex.demo${randomSuffix}@gmail.com`,
      password: 'DemoPassword123!',
      city: 'San Francisco, CA',
      userType: 'job_seeker',
    })
    setErrors({})
    setServerError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
            city: form.city.trim(),
            user_type: form.userType,
          },
        },
      })

      if (error) {
        setServerError(error.message)
        return
      }

      // Check if user already exists (Supabase returns empty identities array)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setServerError('An account with this email already exists. Please sign in instead.')
        return
      }

      // If active session returned (instant signup)
      if (data.session) {
        router.push('/onboarding')
        router.refresh()
        return
      }

      // Email confirmation required
      setSuccessEmail(form.email.trim())
    } catch {
      setServerError('Something went wrong during sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Success view when confirmation email is dispatched
  if (successEmail) {
    return (
      <div className="w-full text-center space-y-6 py-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            We sent a verification link to <span className="text-blue-300 font-semibold">{successEmail}</span>.
            Click the link in the email to activate your account.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-white/5 bg-zinc-950/60 text-xs text-zinc-400 max-w-sm mx-auto">
          Tip: If you don&apos;t see the message within 1 minute, check your spam or promotional folders.
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors"
          >
            Go to Sign In
          </Link>
          <button
            type="button"
            onClick={() => setSuccessEmail(null)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs transition-colors"
          >
            Use different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Demo Fill shortcut */}
      <div className="text-center relative">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-[#635b52]">
          Start your AI-powered career journey with CareerPilot
        </p>

        {/* Demo data shortcut */}
        <button
          type="button"
          onClick={fillDemoData}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#eff6ff] hover:bg-[#ffe8c2] text-[11px] font-semibold text-[#1d4ed8] transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#2563eb]" />
          <span>Auto-fill Demo Data</span>
        </button>
      </div>

      {/* Google Sign In */}
      <GoogleAuthButton label="Sign up with Google" />

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#eadcc9] w-full" />
        <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#78716c] relative font-bold">
          Or with email
        </span>
      </div>

      {/* Server Alerts */}
      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[#572d12] mb-1.5">
            Full Name <span className="text-[#2563eb]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#29231e', colorScheme: 'light' }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                errors.name
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-[#eadcc9] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
              }`}
            />
          </div>
          {errors.name && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-[#572d12] mb-1.5">
            Email Address <span className="text-[#2563eb]">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            <input
              type="email"
              placeholder="alex@company.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#29231e', colorScheme: 'light' }}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-[#eadcc9] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
              }`}
            />
          </div>
          {errors.email && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-[#572d12] mb-1.5">
            Password <span className="text-[#2563eb]">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters (letters & numbers)"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              style={{ backgroundColor: '#ffffff', color: '#29231e', colorScheme: 'light' }}
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                  : 'border-[#eadcc9] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
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
          {errors.password && (
            <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.password}</p>
          )}
        </div>

        {/* City & User Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-[#572d12] mb-1.5">
              City <span className="text-[#2563eb]">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-[#fffaf3] text-[#29231e] text-xs sm:text-sm placeholder:text-[#a89f91] focus:outline-none focus:ring-1 transition-all ${
                  errors.city
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#eadcc9] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
                }`}
              />
            </div>
            {errors.city && <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.city}</p>}
          </div>

          {/* User Type with Dropdown Chevron */}
          <div>
            <label className="block text-xs font-semibold text-[#572d12] mb-1.5">
              I am a <span className="text-[#2563eb]">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <select
                value={form.userType}
                onChange={(e) => handleChange('userType', e.target.value)}
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl border bg-[#fffaf3] text-[#29231e] text-xs sm:text-sm focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
                  errors.userType
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#eadcc9] focus:border-[#2563eb] focus:ring-[#2563eb]/20'
                }`}
              >
                <option value="" disabled className="text-[#a89f91]">
                  Select Status
                </option>
                {USER_TYPES.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-white text-[#29231e]">
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            </div>
            {errors.userType && (
              <p className="mt-1 text-[11px] text-rose-600 font-semibold">{errors.userType}</p>
            )}
          </div>
        </div>

        {/* Terms */}
        <p className="text-[11px] text-[#635b52] leading-relaxed pt-1">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-[#2563eb] hover:underline font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#2563eb] hover:underline font-medium">
            Privacy Policy
          </Link>.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="pavitra-btn w-full flex items-center justify-center gap-2 font-bold cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-xs text-[#635b52]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#2563eb] font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
