import Link from 'next/link'
import { ArrowRight, Bookmark, Send, Eye, Calendar, Award } from 'lucide-react'

interface FunnelCounts {
  saved: number
  applied: number
  screening: number
  interview: number
  offer: number
}

interface ApplicationFunnelProps {
  counts?: Partial<FunnelCounts>
}

const STAGES = [
  { key: 'saved', label: 'Saved', icon: Bookmark, badgeColor: 'bg-[#eff6ff] text-[#635b52]' },
  { key: 'applied', label: 'Applied', icon: Send, badgeColor: 'bg-[#eff6ff] text-[#2563eb]' },
  { key: 'screening', label: 'Screening', icon: Eye, badgeColor: 'bg-[#eff6ff] text-[#1d4ed8]' },
  { key: 'interview', label: 'Interview', icon: Calendar, badgeColor: 'bg-[#eff6ff] text-[#572d12]' },
  { key: 'offer', label: 'Offer', icon: Award, badgeColor: 'bg-[#f0fdf4] text-[#166534]' },
] as const

export function ApplicationFunnel({ counts = {} }: ApplicationFunnelProps) {
  const total = Object.values(counts).reduce((acc, val) => (acc || 0) + (val || 0), 0) || 0

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#572d12]">Application Pipeline</h3>
            <p className="text-xs text-[#78716c] mt-0.5">
              {total > 0 ? `${total} active applications across hiring stages` : 'Track opportunities from Job Radar'}
            </p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stages List */}
        <div className="space-y-2">
          {STAGES.map(({ key, label, icon: Icon, badgeColor }) => {
            const stageCount = counts[key as keyof FunnelCounts] || 0
            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] hover:bg-[#eff6ff]/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border border-[#eadcc9] ${badgeColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#572d12]">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-md border border-[#eadcc9] bg-white ${
                      stageCount > 0 ? 'text-[#2563eb] font-black' : 'text-[#78716c]'
                    }`}
                  >
                    {stageCount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {total === 0 && (
        <div className="mt-4 pt-3 border-t border-[#eadcc9] flex items-center justify-between text-xs">
          <span className="text-[#78716c]">Ready to apply?</span>
          <Link
            href="/jobs"
            className="font-bold text-[#2563eb] hover:underline flex items-center gap-1"
          >
            Find Openings →
          </Link>
        </div>
      )}
    </div>
  )
}
