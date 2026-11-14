import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#29231e] flex flex-col justify-between p-4 sm:p-8 relative">
      {/* Top Header matching Pavitra Foundation Style */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#eadcc9]">
        <Link href="/" className="flex items-center gap-3">
          <span className="pavitra-brand-mark">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <div className="leading-tight">
            <span className="text-lg font-bold text-[#572d12]">
              <b className="text-[#d97706] font-extrabold">CareerPilot</b> AI
            </span>
            <small className="block text-[10px] text-[#78716c] uppercase tracking-[1.4px] font-semibold">
              India Placement & Career Telemetry
            </small>
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff3df] border border-[#eadcc9] text-[#d97706]">
          <span className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
          <span>Student & Job Seeker Onboarding</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10">{children}</main>

      {/* Footer info */}
      <footer className="text-center text-xs text-[#78716c] pt-6 max-w-xl mx-auto border-t border-[#eadcc9]">
        Tailored for Indian universities, state colleges, AICTE internships, and national career portals.
        You can fine-tune all details anytime in your Profile.
      </footer>
    </div>
  )
}
