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
  { key: 'saved', label: 'Saved', icon: Bookmark, bar: 'bg-[#eadcc9]', count: 'text-[#635b52]', iconColor: 'text-[#78716c]' },
  { key: 'applied', label: 'Applied', icon: Send, bar: 'bg-[#d97706]', count: 'text-[#d97706]', iconColor: 'text-[#d97706]' },
  { key: 'screening', label: 'Screening', icon: Eye, bar: 'bg-[#f59e0b]', count: 'text-[#b45309]', iconColor: 'text-[#f59e0b]' },
  { key: 'interview', label: 'Interview', icon: Calendar, bar: 'bg-[#572d12]', count: 'text-[#572d12]', iconColor: 'text-[#572d12]' },
  { key: 'offer', label: 'Offer', icon: Award, bar: 'bg-[#166534]', count: 'text-[#166534]', iconColor: 'text-[#166534]' },
] as const

export function ApplicationFunnel({ counts = {} }: ApplicationFunnelProps) {
  const total = Object.values(counts).reduce((acc, val) => (acc || 0) + (val || 0), 0) || 0
  const max = Math.max(...Object.values(counts).map((v) => v || 0), 1)

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#572d12]">Application Pipeline Telemetry</h3>
          <p className="text-xs text-[#78716c] mt-0.5">
            {total} active applications across all stages
          </p>
        </div>
        <Link
          href="/applications"
          className="text-xs font-bold text-[#d97706] hover:text-[#b45309] flex items-center gap-1 transition-colors"
        >
          View Pipeline
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {STAGES.map(({ key, label, icon: Icon, bar, count, iconColor }) => {
          const stageCount = counts[key as keyof FunnelCounts] || 0
          const pct = Math.round((stageCount / max) * 100)
          return (
            <div key={key} className="flex flex-col items-center gap-2 text-center">
              {/* Bar */}
              <div className="w-full h-16 bg-[#fff3df] rounded-lg relative overflow-hidden flex items-end">
                <div
                  className={`w-full rounded-lg ${bar} transition-all duration-500`}
                  style={{ height: `${Math.max(pct, stageCount > 0 ? 20 : 6)}%` }}
                />
              </div>
              {/* Count */}
              <span className={`text-xl font-bold font-mono ${count}`}>{stageCount}</span>
              {/* Icon + Label */}
              <div className="flex flex-col items-center gap-0.5">
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                <span className="text-[11px] font-bold text-[#635b52]">{label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
