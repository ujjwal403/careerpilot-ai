import Link from 'next/link'
import { ArrowRight, MapPin, Building2, Zap } from 'lucide-react'
import type { Job } from '@/types'
import { formatSalary } from '@/lib/utils'

const FALLBACK_RECOMMENDATIONS = [
  {
    id: '1',
    title: 'Senior Full Stack Engineer',
    company: 'Linear Labs',
    location: 'Remote (Global)',
    salary: '₹28 – 35 LPA',
    matchScore: 96,
  },
  {
    id: '2',
    title: 'Frontend AI Systems Engineer',
    company: 'Vercel Ecosystem',
    location: 'Bengaluru (Hybrid)',
    salary: '₹24 – 32 LPA',
    matchScore: 93,
  },
  {
    id: '3',
    title: 'Product Engineer',
    company: 'Supabase Inc',
    location: 'Remote (India)',
    salary: '₹22 – 30 LPA',
    matchScore: 91,
  },
]

interface QuickRecommendationsProps {
  jobs?: Job[]
  userSkills?: string[]
}

function MatchBar({ score }: { score: number }) {
  return (
    <div className="w-24 h-1.5 rounded-full bg-[#fff3df] border border-[#eadcc9] overflow-hidden shrink-0">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#d97706] to-[#b45309] transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

export function QuickRecommendations({ jobs, userSkills = [] }: QuickRecommendationsProps) {
  const displayJobs =
    jobs && jobs.length > 0
      ? jobs.slice(0, 3).map((job) => {
          const required = job.skills_required || []
          let matchScore = 88
          if (required.length && userSkills.length) {
            const matched = required.filter((s) =>
              userSkills.some((u) => u.toLowerCase() === s.toLowerCase())
            )
            matchScore = Math.min(99, Math.max(72, Math.round(72 + (matched.length / required.length) * 27)))
          }
          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.is_remote ? `${job.location} (Remote)` : job.location,
            salary: formatSalary(job.salary_min, job.salary_max),
            matchScore,
          }
        })
      : FALLBACK_RECOMMENDATIONS

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#572d12] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#d97706]" />
            Top Verified Job Radar Matches
          </h3>
          <p className="text-xs text-[#78716c] mt-0.5">
            Scored deterministically against your verified profile skills
          </p>
        </div>
        <Link
          href="/jobs"
          className="text-xs font-bold text-[#d97706] hover:text-[#b45309] flex items-center gap-1 transition-colors"
        >
          View All Radar
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 pb-2 mb-1 border-b border-[#eadcc9]">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#635b52]">Role / Company</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#635b52] text-right">Radar Fit</span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#635b52] text-right w-20">Action</span>
      </div>

      <div className="divide-y divide-[#eadcc9]">
        {displayJobs.map((job) => (
          <div
            key={job.id}
            className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3.5 group"
          >
            {/* Role info */}
            <div>
              <p className="text-sm font-bold text-[#572d12] leading-tight group-hover:text-[#d97706] transition-colors">
                {job.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <span className="text-xs text-[#635b52] flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#78716c]" />
                  {job.company}
                </span>
                <span className="text-xs text-[#635b52] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#78716c]" />
                  {job.location}
                </span>
                {job.salary && (
                  <span className="text-xs font-bold text-[#166534]">
                    {job.salary}
                  </span>
                )}
              </div>
            </div>

            {/* Match score */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-bold text-[#d97706] font-mono">{job.matchScore}%</span>
              <MatchBar score={job.matchScore} />
            </div>

            {/* CTA */}
            <Link
              href="/jobs"
              className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1 text-xs font-bold w-20 justify-center"
            >
              Apply
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
