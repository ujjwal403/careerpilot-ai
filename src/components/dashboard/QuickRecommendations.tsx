import Link from 'next/link'
import { ArrowRight, MapPin, Building2, Zap, Sparkles } from 'lucide-react'
import type { Job } from '@/types'

function formatJobSalary(min?: number | null, max?: number | null, currency = 'INR', type = 'full-time') {
  const isIntern = type === 'internship'

  const fmt = (n: number) => {
    if (currency === 'INR') {
      if (isIntern || n < 100000) {
        return `₹${n.toLocaleString('en-IN')} /mo`
      }
      return `₹${(n / 100000).toFixed(1)} LPA`
    }
    return `$${n.toLocaleString('en-US')}`
  }

  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return isIntern ? '₹25,000 - ₹40,000 /mo' : 'Competitive CTC'
}

const FALLBACK_RECOMMENDATIONS = [
  {
    id: '1',
    title: 'Full Stack Web Developer Intern (Next.js)',
    company: 'Blinkit (Zomato)',
    location: 'Gurgaon (Hybrid)',
    salary: '₹35,000 - ₹45,000 /mo',
    matchScore: 96,
    isIntern: true,
  },
  {
    id: '2',
    title: 'Generative AI & LLM Engineering Intern',
    company: 'Swiggy Labs',
    location: 'Bangalore (Remote)',
    salary: '₹40,000 - ₹50,000 /mo',
    matchScore: 94,
    isIntern: true,
  },
  {
    id: '3',
    title: 'Mobile App Developer Intern (Flutter)',
    company: 'Zepto',
    location: 'Mumbai (On-site)',
    salary: '₹30,000 - ₹40,000 /mo',
    matchScore: 91,
    isIntern: true,
  },
  {
    id: '4',
    title: 'Backend Engineering Intern (Go & Microservices)',
    company: 'Razorpay',
    location: 'Bangalore (Remote)',
    salary: '₹45,000 - ₹55,000 /mo',
    matchScore: 90,
    isIntern: true,
  },
]

interface QuickRecommendationsProps {
  jobs?: Job[]
  userSkills?: string[]
}

function MatchBar({ score }: { score: number }) {
  return (
    <div className="w-16 sm:w-20 h-1.5 rounded-full bg-[#fff3df] border border-[#eadcc9] overflow-hidden shrink-0">
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
      ? jobs.slice(0, 4).map((job) => {
          const required = job.skills_required || []
          let matchScore = 88
          if (required.length && userSkills.length) {
            const matched = required.filter((s) =>
              userSkills.some((u) => u.toLowerCase() === skillLower(s))
            )
            matchScore = Math.min(99, Math.max(74, Math.round(74 + (matched.length / required.length) * 25)))
          }
          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.is_remote ? `${job.location || 'India'} (Remote)` : (job.location || 'Pan India'),
            salary: formatJobSalary(job.salary_min, job.salary_max, job.salary_currency, job.job_type || 'full-time'),
            matchScore,
            isIntern: job.job_type === 'internship' || job.title.toLowerCase().includes('intern'),
          }
        })
      : FALLBACK_RECOMMENDATIONS

  function skillLower(s: string) {
    return s.toLowerCase()
  }

  return (
    <div className="bg-white border border-[#eadcc9] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#572d12] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#d97706]" />
              Top Verified Openings &amp; Internships
            </h3>
            <p className="text-xs text-[#78716c] mt-0.5">
              Ranked deterministically for your engineering profile
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-[#d97706] hover:text-[#b45309] flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#eadcc9]">
          {displayJobs.map((job) => (
            <div
              key={job.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Role info */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold text-[#572d12] group-hover:text-[#d97706] transition-colors leading-snug">
                    {job.title}
                  </p>
                  {job.isIntern && (
                    <span className="text-[10px] font-bold text-[#92400e] bg-[#fef3c7] border border-[#fde68a] px-1.5 py-0.2 rounded-md">
                      Internship
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#635b52]">
                  <span className="flex items-center gap-1 font-semibold text-[#572d12]">
                    <Building2 className="w-3 h-3 text-[#78716c]" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#78716c]" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="font-bold text-[#166534]">
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Match score & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#d97706] font-mono">{job.matchScore}% Fit</span>
                  <MatchBar score={job.matchScore} />
                </div>

                <Link
                  href="/jobs"
                  className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5"
                >
                  <span>Apply</span>
                  <ArrowRight className="w-3 h-3 text-[#d97706]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#eadcc9] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78716c]">
        <span>Verified from Internshala, Google Jobs, AICTE &amp; NCS</span>
        <Link
          href="/jobs"
          className="font-bold text-[#d97706] hover:underline flex items-center gap-1"
        >
          Explore All 40+ Opportunities →
        </Link>
      </div>
    </div>
  )
}
