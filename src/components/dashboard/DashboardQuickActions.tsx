import Link from 'next/link'
import { Sparkles, FileText, Briefcase, ArrowRight, MessageSquareText } from 'lucide-react'

export function DashboardQuickActions() {
  const actions = [
    {
      title: 'Ask AI Copilot',
      desc: 'Ask career questions, interview prep & cold emails',
      href: '/ask-ai',
      icon: MessageSquareText,
      badge: 'Chat Now',
      highlight: true,
    },
    {
      title: 'ATS Resume Scorer',
      desc: 'Verify Google Drive CV against 10 ATS rules',
      href: '/resume',
      icon: FileText,
      badge: 'Audit CV',
    },
    {
      title: 'AI Profile Coach',
      desc: 'AI summary rewrite & missing skill alerts',
      href: '/profile',
      icon: Sparkles,
      badge: 'Optimize',
    },
    {
      title: 'Verified Job Radar',
      desc: 'Explore 40+ internships & entry roles',
      href: '/jobs',
      icon: Briefcase,
      badge: 'Explore',
    },
  ]

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#572d12] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#2563eb]" />
          AI Career Intelligence Toolkit
        </h3>
        <p className="text-xs text-[#78716c] mt-0.5">
          Direct tools to increase your shortlist rate
        </p>
      </div>

      <div className="space-y-2.5">
        {actions.map((act) => {
          const Icon = act.icon
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 group block no-underline ${
                act.highlight
                  ? 'border-[#2563eb] bg-[#eff6ff] hover:bg-[#ffe8c2]'
                  : 'border-[#eadcc9] bg-[#fffaf3] hover:bg-[#eff6ff] hover:border-[#2563eb]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#eadcc9] flex items-center justify-center shrink-0 group-hover:border-[#2563eb] transition-colors mt-0.5">
                  <Icon className="w-4 h-4 text-[#2563eb]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#572d12] group-hover:text-[#2563eb] transition-colors truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-[#78716c] line-clamp-1">
                    {act.desc}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[11px] font-bold text-[#2563eb] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>{act.badge}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
