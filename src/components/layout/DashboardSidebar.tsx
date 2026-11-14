'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { LogoutButton } from '@/components/auth/LogoutButton'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Layers,
  User,
  Compass,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  shortLabel?: string
  icon: LucideIcon
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Radar', shortLabel: 'Jobs', icon: Briefcase, badge: 'Live' },
  { href: '/resume', label: 'Resume Scorer', shortLabel: 'Resume', icon: FileText },
  { href: '/applications', label: 'Applications', shortLabel: 'Tracker', icon: Layers },
  { href: '/profile', label: 'Career Profile', shortLabel: 'Profile', icon: User },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#eadcc9] flex flex-col justify-between hidden md:flex shrink-0">
      {/* Top Brand & Nav */}
      <div>
        {/* Brand */}
        <div className="px-5 py-5 mb-1 border-b border-[#eadcc9]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="pavitra-brand-mark">
              <Compass className="w-5 h-5 text-white" />
            </span>
            <div className="leading-tight">
              <span className="font-bold text-base text-[#572d12] tracking-tight block">
                <b className="text-[#d97706] font-extrabold">CareerPilot</b> AI
              </span>
              <small className="block text-[10px] text-[#78716c] uppercase tracking-wider font-semibold">
                Service • Precision • Telemetry
              </small>
            </div>
          </Link>
        </div>

        {/* Section label */}
        <div className="px-5 mt-4 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d97706]">
            NAVIGATION
          </span>
        </div>

        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#fff3df] border border-[#eadcc9] text-[#d97706]'
                    : 'text-[#635b52] hover:text-[#572d12] hover:bg-[#fffaf3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#d97706]' : 'text-[#78716c]'}`} />
                  <span>{label}</span>
                </div>
                {badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#d97706] text-white' : 'bg-[#fff3df] text-[#d97706] border border-[#eadcc9]'
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom User & Logout */}
      <div className="border-t border-[#eadcc9] p-4 space-y-2 bg-[#fffaf3]">
        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-[#fff3df] border border-[#eadcc9] flex items-center justify-center text-xs font-bold text-[#d97706] uppercase shrink-0">
              {user.email?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#572d12] truncate">
                {user.user_metadata?.full_name || 'My Account'}
              </p>
              <p className="text-[11px] text-[#78716c] truncate">{user.email}</p>
            </div>
          </Link>
        )}

        <LogoutButton className="w-full justify-start px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50" />
      </div>
    </aside>
  )
}

/**
 * Mobile Bottom Navigation Bar:
 * Appears ONLY on mobile devices (hidden md:hidden).
 * Allows users on smartphones to seamlessly switch between all pages with thumb reach.
 */
export function DashboardMobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fffaf3]/95 backdrop-blur-md border-t border-[#eadcc9] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-md"
    >
      {NAV_ITEMS.map(({ href, shortLabel, label, icon: Icon, badge }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`))
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all duration-150 active:scale-95 relative ${
              isActive
                ? 'text-[#d97706] font-extrabold bg-[#fff3df] border border-[#eadcc9]'
                : 'text-[#78716c] hover:text-[#572d12]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#d97706]' : 'text-[#78716c]'}`} />
              {badge && (
                <span className="absolute -top-1 -right-2.5 w-2 h-2 rounded-full bg-[#d97706]" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium leading-none">
              {shortLabel || label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
