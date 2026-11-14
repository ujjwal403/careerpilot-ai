import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  caption: string
  icon: LucideIcon
  iconColor: string
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: string
}

export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  iconColor,
  trend,
  badge,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-[#d97706] shadow-xs">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold text-[#635b52] leading-tight pr-2">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-[#fff3df] border border-[#eadcc9] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#d97706]" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-extrabold text-[#572d12] tracking-tight font-mono">
            {value}
          </span>
        </div>
        <p className="text-xs text-[#78716c] leading-relaxed">{caption}</p>
      </div>

      {(trend || badge) && (
        <div className="mt-3 pt-3 border-t border-[#eadcc9] flex items-center justify-between">
          {badge && (
            <span className="text-[11px] font-bold text-[#d97706]">{badge}</span>
          )}
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ml-auto ${
              trend.isPositive ? 'text-[#166534]' : 'text-rose-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
