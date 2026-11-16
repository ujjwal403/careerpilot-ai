import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  caption: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: string
  href?: string
}

export function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  trend,
  badge,
  href,
}: StatCardProps) {
  const cardBody = (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:border-[#2563eb] hover:shadow-xs shadow-2xs h-full group">
      <div>
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <span className="text-[11px] sm:text-xs font-bold text-[#635b52] leading-tight pr-1.5 group-hover:text-[#572d12] transition-colors line-clamp-1">
            {title}
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#eff6ff] border border-[#eadcc9] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563eb]" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1">
          <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#572d12] tracking-tight font-mono">
            {value}
          </span>
        </div>
        <p className="text-[10px] sm:text-xs text-[#78716c] leading-relaxed line-clamp-1">{caption}</p>
      </div>

      {(trend || badge) && (
        <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-[#eadcc9] flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
          {badge && (
            <span className="text-[#2563eb] truncate mr-1.5">{badge}</span>
          )}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 ml-auto shrink-0 ${
                trend.isPositive ? 'text-[#166534]' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {cardBody}
      </Link>
    )
  }

  return cardBody
}
