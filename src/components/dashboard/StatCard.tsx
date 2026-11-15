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
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-[#d97706] hover:shadow-xs shadow-2xs h-full group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-bold text-[#635b52] leading-tight pr-2 group-hover:text-[#572d12] transition-colors">
            {title}
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#fff3df] border border-[#eadcc9] flex items-center justify-center shrink-0 group-hover:border-[#d97706] transition-colors">
            <Icon className="w-4 h-4 text-[#d97706]" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#572d12] tracking-tight font-mono">
            {value}
          </span>
        </div>
        <p className="text-xs text-[#78716c] leading-relaxed line-clamp-1">{caption}</p>
      </div>

      {(trend || badge) && (
        <div className="mt-3 pt-3 border-t border-[#eadcc9] flex items-center justify-between text-[11px] font-bold">
          {badge && (
            <span className="text-[#d97706] truncate mr-2">{badge}</span>
          )}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 ml-auto shrink-0 ${
                trend.isPositive ? 'text-[#166534]' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
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
