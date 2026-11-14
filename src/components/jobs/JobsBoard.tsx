'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Job } from '@/types'
import {
  Search,
  MapPin,
  Building2,
  DollarSign,
  Bookmark,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Globe,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

interface JobsBoardProps {
  initialJobs: Job[]
  userSkills?: string[]
  userId?: string
  initialAppliedIds?: string[]
  initialSavedIds?: string[]
}

function formatJobSalary(min?: number | null, max?: number | null, currency = 'INR') {
  const fmt = (n: number) => {
    if (currency === 'INR' && n >= 100000) {
      return `₹${(n / 100000).toFixed(1)} LPA`
    }
    if (currency === 'INR') {
      return `₹${n.toLocaleString('en-IN')}`
    }
    return `$${n.toLocaleString('en-US')}`
  }
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return ''
}

export function JobsBoard({
  initialJobs,
  userSkills = [],
  userId,
  initialAppliedIds = [],
  initialSavedIds = [],
}: JobsBoardProps) {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'aicte' | 'ncs' | 'google_jobs' | 'adzuna'>('all')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Calculate dynamic match score between job skills and user skills
  const getMatchScore = (requiredSkills: string[] = []) => {
    if (!requiredSkills.length) return 85
    if (!userSkills.length) return 78
    const matches = requiredSkills.filter((s) =>
      userSkills.some((u) => u.toLowerCase() === s.toLowerCase())
    )
    const ratio = matches.length / requiredSkills.length
    return Math.min(99, Math.max(70, Math.round(70 + ratio * 29)))
  }

  // Sync latest openings from Google Jobs, Adzuna India, AICTE & NCS
  const handleSyncAllFeeds = async () => {
    setSyncing(true)
    setSyncMessage(null)

    try {
      const res = await fetch('/api/jobs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'all' }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to sync feeds')
      }

      setSyncMessage(
        `Synchronized ${json.totalSynced} verified openings across Google Jobs Index, Adzuna India, AICTE & NCS!`
      )

      // Refetch latest jobs from Supabase
      const supabase = createClient()
      const { data: updatedJobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_at', { ascending: false })

      if (updatedJobs) {
        setJobs(updatedJobs)
      }
      router.refresh()
    } catch {
      setSyncMessage('Failed to connect to job feeds. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  // Quietly track the application in user's pipeline when clicking Apply
  const handleTrackApply = async (jobId: string, skillsRequired?: string[]) => {
    try {
      let activeUserId = userId
      const supabase = createClient()

      if (!activeUserId) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        activeUserId = authUser?.id
      }

      if (activeUserId) {
        await supabase.from('applications').upsert(
          {
            user_id: activeUserId,
            job_id: jobId,
            status: 'applied',
            applied_at: new Date().toISOString(),
            ai_match_score: getMatchScore(skillsRequired),
          },
          { onConflict: 'user_id,job_id' }
        )
      }
    } catch {
      // Quietly ignore background tracking errors
    }
  }

  const handleSave = async (jobId: string) => {
    let activeUserId = userId
    const supabase = createClient()

    if (!activeUserId) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      activeUserId = authUser?.id
    }

    if (!activeUserId) return

    try {
      if (savedIds.includes(jobId)) {
        await supabase.from('applications').delete().eq('user_id', activeUserId).eq('job_id', jobId)
        setSavedIds((prev) => prev.filter((id) => id !== jobId))
      } else {
        await supabase.from('applications').upsert(
          {
            user_id: activeUserId,
            job_id: jobId,
            status: 'saved',
          },
          { onConflict: 'user_id,job_id' }
        )
        setSavedIds((prev) => [...prev, jobId])
      }
    } catch {
      // Save state fallback
    }
  }

  // Filter jobs by search query, seniority level, remote flag, and source channel
  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchesQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.location && job.location.toLowerCase().includes(q)) ||
      job.skills_required?.some((s) => s.toLowerCase().includes(q))

    const matchesLevel = levelFilter === 'all' || job.experience_level === levelFilter
    const matchesRemote = !remoteOnly || job.is_remote

    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'aicte' && job.source === 'aicte') ||
      (sourceFilter === 'ncs' && job.source === 'ncs') ||
      (sourceFilter === 'google_jobs' && job.source === 'google_jobs') ||
      (sourceFilter === 'adzuna' && job.source === 'adzuna')

    return matchesQuery && matchesLevel && matchesRemote && matchesSource
  })

  const aicteCount = jobs.filter((j) => j.source === 'aicte').length
  const ncsCount = jobs.filter((j) => j.source === 'ncs').length
  const googleJobsCount = jobs.filter((j) => j.source === 'google_jobs').length
  const adzunaCount = jobs.filter((j) => j.source === 'adzuna').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#29231e]">
      {/* Top Search & Filter Bar (Matching Pavitra Foundation Editorial Theme) */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            <input
              type="text"
              placeholder="Search across Google Jobs, Adzuna, Swiggy, Zomato, C-DAC, BEL (e.g. React, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#9b9186] focus:outline-hidden focus:border-[#d97706]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                remoteOnly
                  ? 'border-[#d97706] bg-[#fff3df] text-[#d97706]'
                  : 'border-[#eadcc9] bg-white text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Remote Only</span>
            </button>

            <button
              type="button"
              onClick={handleSyncAllFeeds}
              disabled={syncing}
              className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sync latest live feeds from Google Jobs, Adzuna India, AICTE & NCS"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Live Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Source Channels Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#eadcc9]">
          <span className="text-[11px] font-bold text-[#572d12] mr-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Channel:</span>
          </span>

          <button
            type="button"
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === 'all'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                : 'bg-[#fff3df] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
            }`}
          >
            All Opportunities ({jobs.length})
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('google_jobs')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
              sourceFilter === 'google_jobs'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                : 'bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <span>🌐 Google Jobs Index ({googleJobsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('adzuna')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
              sourceFilter === 'adzuna'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>⚡ Adzuna India ({adzunaCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('aicte')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
              sourceFilter === 'aicte'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                : 'bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]'
            }`}
          >
            <span>🏛️ AICTE Internships ({aicteCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setSourceFilter('ncs')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
              sourceFilter === 'ncs'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                : 'bg-[#fff3df] border border-[#eadcc9] text-[#b45309] hover:bg-[#ffe8c4]'
            }`}
          >
            <span>🇮🇳 NCS Govt Jobs ({ncsCount})</span>
          </button>
        </div>

        {/* Seniority Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-bold text-[#635b52] mr-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-[#d97706]" />
            <span>Seniority:</span>
          </span>
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'entry', label: 'Entry / Intern' },
            { id: 'mid', label: 'Mid-Level' },
            { id: 'senior', label: 'Senior' },
            { id: 'lead', label: 'Lead / Principal' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setLevelFilter(id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                levelFilter === id
                  ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                  : 'bg-[#fff3df] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Success / Info Message */}
      {syncMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-xs font-bold text-[#166534] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-[#635b52] px-1 font-medium">
        <span>Showing {filteredJobs.length} verified opportunities</span>
        <span className="text-[#d97706] font-bold">Matched to your verified skills</span>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-[#eadcc9] bg-white p-12 text-center shadow-xs space-y-3">
            <p className="text-sm font-bold text-[#572d12]">No jobs found matching your criteria.</p>
            <p className="text-xs text-[#635b52]">Try clearing filters or click &quot;Sync Live Feeds&quot; to fetch the latest openings.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setLevelFilter('all')
                  setSourceFilter('all')
                  setRemoteOnly(false)
                }}
                className="text-xs font-bold text-[#d97706] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
              <button
                type="button"
                onClick={handleSyncAllFeeds}
                className="pavitra-btn pavitra-btn-sm font-bold cursor-pointer"
              >
                Sync Live Feeds
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const matchScore = getMatchScore(job.skills_required)
            const isSaved = savedIds.includes(job.id)
            const isAICTE = job.source === 'aicte'
            const isNCS = job.source === 'ncs'
            const isGoogleJobs = job.source === 'google_jobs'
            const isAdzuna = job.source === 'adzuna'

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-[#eadcc9] bg-white p-6 shadow-xs hover:border-[#d97706] transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#572d12] group-hover:text-[#d97706] transition-colors">
                      {job.title}
                    </h3>

                    {/* Channel Badges */}
                    {isGoogleJobs && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        🌐 Google Jobs Index
                      </span>
                    )}

                    {isAdzuna && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        ⚡ Adzuna India
                      </span>
                    )}

                    {isAICTE && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                        🏛️ AICTE Verified
                      </span>
                    )}

                    {isNCS && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3df] text-[#b45309] border border-[#eadcc9]">
                        🇮🇳 NCS Govt Listing
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                      <Sparkles className="w-3 h-3" />
                      <span>{matchScore}% Match</span>
                    </span>

                    {job.is_remote && (
                      <span className="text-[10px] font-bold text-[#d97706] bg-[#fff3df] border border-[#eadcc9] px-2 py-0.5 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#635b52]">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#572d12]">
                      <Building2 className="w-3.5 h-3.5 text-[#d97706]" />
                      {job.company}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#78716c]" />
                      {job.location || 'Remote'}
                    </span>
                    {(job.salary_min || job.salary_max) && (
                      <span className="inline-flex items-center gap-1 text-[#166534] font-bold" suppressHydrationWarning>
                        <DollarSign className="w-3.5 h-3.5 text-[#166534]" />
                        {formatJobSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </span>
                    )}
                  </div>

                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills_required.map((skill) => {
                        const isMatched = userSkills.some((u) => u.toLowerCase() === skill.toLowerCase())
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                              isMatched
                                ? 'bg-[#fff3df] border-[#eadcc9] text-[#572d12]'
                                : 'bg-[#fffaf3] border-[#eadcc9] text-[#635b52]'
                            }`}
                          >
                            {skill}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSave(job.id)}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isSaved
                        ? 'border-[#d97706] bg-[#fff3df] text-[#d97706]'
                        : 'border-[#eadcc9] bg-white text-[#635b52] hover:text-[#d97706] hover:border-[#d97706]'
                    }`}
                    title={isSaved ? 'Job Saved' : 'Save Job'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <a
                    href={
                      job.source_url ||
                      `https://www.google.com/search?q=${encodeURIComponent(`${job.company} ${job.title} careers apply`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTrackApply(job.id, job.skills_required)}
                    className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-1.5 font-bold"
                    title={`Open official job posting for ${job.title} at ${job.company} in a new tab`}
                  >
                    <span>{isAICTE || isNCS ? 'Apply on Govt Portal' : 'Apply Directly'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
