'use client'

import Link from 'next/link'
import { Compass } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { LogoutButton } from '@/components/auth/LogoutButton'

const NAV_LINKS = [
  { href: '#collection', label: 'ATS Benchmark' },
  { href: '#about', label: 'Who We Are' },
  { href: '#initiatives', label: 'Our Capabilities' },
  { href: '/jobs', label: 'Job Radar' },
] as const

export function Navbar() {
  const { user } = useUser()

  return (
    <header className="pavitra-header">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand - CareerPilot AI */}
        <Link href="/" className="flex items-center gap-3">
          <span className="pavitra-brand-mark">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <div className="leading-tight">
            <span className="text-lg font-bold text-[#572d12]">
              <b className="text-[#d97706] font-extrabold">CareerPilot</b> AI
            </span>
            <small className="block text-[10px] text-[#78716c] uppercase tracking-[1.4px] font-semibold">
              Precision • Telemetry • Dedication
            </small>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#572d12]">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[#d97706] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Action Button (No theme toggle, pure Pavitra styling) */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="pavitra-btn pavitra-btn-sm"
              >
                Dashboard
              </Link>
              <LogoutButton className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-[#572d12] hover:text-[#d97706] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="pavitra-btn pavitra-btn-sm"
              >
                Audit Resume Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
