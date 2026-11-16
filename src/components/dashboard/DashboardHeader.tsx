import Link from 'next/link'
import { FileUp, Briefcase } from 'lucide-react'

interface DashboardHeaderProps {
  userName?: string | null
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const displayName = userName ? userName.split(' ')[0] : 'there'

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 sm:pb-6 border-b border-[#eadcc9]">
      <div>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#2563eb] mb-1 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
          AI Radar Active • Verified Real-Time Sync
        </p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#572d12] tracking-tight">
          Welcome back, {displayName}
        </h1>
        <p className="text-xs sm:text-sm text-[#635b52] mt-1 font-normal">
          Here is your career telemetry and live application pipeline.
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Link
          href="/resume"
          className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center justify-center gap-1.5 font-bold flex-1 sm:flex-initial text-xs"
        >
          <FileUp className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>Audit Resume</span>
        </Link>
        <Link
          href="/jobs"
          className="pavitra-btn pavitra-btn-sm inline-flex items-center justify-center gap-1.5 font-bold flex-1 sm:flex-initial text-xs"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Explore Matches</span>
        </Link>
      </div>
    </div>
  )
}
