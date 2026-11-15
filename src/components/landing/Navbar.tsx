'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Compass, Menu, X } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { LogoutButton } from '@/components/auth/LogoutButton'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '#collection', label: 'ATS Benchmark' },
  { href: '#about', label: 'Who We Are' },
  { href: '#initiatives', label: 'Our Capabilities' },
  { href: '/jobs', label: 'Job Radar' },
] as const

export function Navbar() {
  const { user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="pavitra-header sticky top-0 z-40 bg-[#fffaf3]/95 backdrop-blur-xs border-b border-[#eadcc9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand - CareerPilot AI */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <span className="pavitra-brand-mark">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-bold text-[#572d12]">
              <b className="text-[#d97706] font-extrabold">CareerPilot</b> AI
            </span>
            <small className="block text-[9px] sm:text-[10px] text-[#78716c] uppercase tracking-[1.4px] font-semibold">
              Precision • Telemetry • Dedication
            </small>
          </div>
        </Link>

        {/* Center Navigation (Desktop Only) */}
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

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Actions (md:flex) */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="pavitra-btn pavitra-btn-sm !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white !font-bold shadow-xs hover:!from-[#b45309] hover:!to-[#92400e]"
                  style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                >
                  Dashboard
                </Link>
                <LogoutButton className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-[#572d12] hover:text-[#d97706] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="pavitra-btn pavitra-btn-sm !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white !font-bold shadow-xs hover:!from-[#b45309] hover:!to-[#92400e]"
                  style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                >
                  Audit Resume Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Only (md:hidden) - Prevents duplicate buttons */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-[#572d12] hover:bg-[#fff3df] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#eadcc9] bg-[#fffaf3] px-5 py-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-[#572d12] hover:bg-[#fff3df] hover:text-[#d97706] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#eadcc9] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="pavitra-btn w-full text-center text-xs font-bold py-2.5"
                >
                  Dashboard
                </Link>
                <LogoutButton className="w-full text-center py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-[#572d12] border border-[#eadcc9] rounded-xl hover:bg-[#fff3df] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="pavitra-btn w-full text-center text-xs font-bold py-2.5"
                >
                  Audit Resume Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
