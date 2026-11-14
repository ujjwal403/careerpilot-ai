import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Compass } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#29231e] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-[#eadcc9] bg-[#fffaf3]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#d97706] to-[#b45309] text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </span>
          <span className="font-bold text-sm text-[#572d12]">
            <b className="text-[#d97706]">CareerPilot</b> AI
          </span>
        </Link>
        <LogoutButton className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50" />
      </header>

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#fffaf3]">
        {children}
      </main>
    </div>
  )
}
