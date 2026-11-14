import { DashboardSidebar, DashboardMobileBottomNav } from '@/components/layout/DashboardSidebar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Compass, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#29231e] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#eadcc9] bg-[#fffaf3] sticky top-0 z-30 shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </span>
          <span className="font-bold text-sm text-[#572d12]">
            <b className="text-[#d97706]">CareerPilot</b> AI
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/profile"
            className="p-1.5 rounded-lg border border-[#eadcc9] bg-[#fff3df] text-[#d97706] hover:bg-[#ffe8c2] transition-colors"
            title="Your Profile"
            aria-label="Your Profile"
          >
            <User className="w-4 h-4" />
          </Link>
          <LogoutButton className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50" />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content (with bottom padding on mobile so navigation bar never obstructs content) */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto bg-[#fffaf3] min-w-0">
        {children}
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <DashboardMobileBottomNav />
    </div>
  )
}
