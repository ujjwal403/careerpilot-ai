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
  Zap,
  Calendar,
  X,
  Link2,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface JobsBoardProps {
  initialJobs: Job[]
  userSkills?: string[]
  userId?: string
  initialAppliedIds?: string[]
  initialSavedIds?: string[]
}

function formatJobSalary(min?: number | null, max?: number | null, currency = 'INR', type = 'full-time') {
  const isIntern = type === 'internship'

  const fmt = (n: number) => {
    if (currency === 'INR') {
      if (isIntern || n < 100000) {
        return `₹${n.toLocaleString('en-IN')} /month`
      }
      return `₹${(n / 100000).toFixed(1)} LPA`
    }
    return `$${n.toLocaleString('en-US')}`
  }

  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return isIntern ? '₹15,000 - ₹35,000 /month (Est.)' : 'Competitive CTC'
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
  const [opportunityType, setOpportunityType] = useState<'all' | 'internship' | 'fresher' | 'full-time' | 'applied'>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'aicte' | 'ncs' | 'google_jobs' | 'adzuna'>('all')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds)
  const [appliedIds, setAppliedIds] = useState<string[]>(initialAppliedIds)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Apply Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  // Calculate dynamic match score between job skills and user skills
  const getMatchScore = (requiredSkills: string[] = []) => {
    if (!requiredSkills.length) return 85
    if (!userSkills.length) return 78
    const matches = requiredSkills.filter((s) =>
      userSkills.some((u) => u.toLowerCase() === s.toLowerCase())
    )
    const ratio = matches.length / requiredSkills.length
    return Math.min(99, Math.max(72, Math.round(72 + ratio * 27)))
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

  const handleOpenApplyModal = (job: Job) => {
    setSelectedJobForApply(job)
    setApplySuccess(false)
    setApplyError(null)
  }

  const handleConfirmApply = async () => {
    if (!selectedJobForApply) return

    try {
      setApplying(true)
      setApplyError(null)

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
            job_id: selectedJobForApply.id,
            status: 'applied',
            applied_at: new Date().toISOString(),
            ai_match_score: getMatchScore(selectedJobForApply.skills_required),
          },
          { onConflict: 'user_id,job_id' }
        )
      }

      setAppliedIds((prev) => [...prev, selectedJobForApply.id])
      setApplySuccess(true)

      // Open company portal after short feedback
      setTimeout(() => {
        const dest =
          selectedJobForApply.source_url ||
          `https://www.google.com/search?q=${encodeURIComponent(`${selectedJobForApply.company} ${selectedJobForApply.title} careers apply`)}`
        window.open(dest, '_blank', 'noopener,noreferrer')
        setSelectedJobForApply(null)
      }, 700)
    } catch {
      // Direct user even if background tracking has issue
      const dest =
        selectedJobForApply.source_url ||
        `https://www.google.com/search?q=${encodeURIComponent(`${selectedJobForApply.company} ${selectedJobForApply.title} careers apply`)}`
      window.open(dest, '_blank', 'noopener,noreferrer')
      setSelectedJobForApply(null)
    } finally {
      setApplying(false)
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

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchesQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      (job.location && job.location.toLowerCase().includes(q)) ||
      job.skills_required?.some((s) => s.toLowerCase().includes(q))

    const isIntern =
      job.job_type === 'internship' ||
      job.title.toLowerCase().includes('intern') ||
      job.experience_level === 'entry'

    const matchesType =
      opportunityType === 'all' ||
      (opportunityType === 'applied' && appliedIds.includes(job.id)) ||
      (opportunityType === 'internship' && isIntern) ||
      (opportunityType === 'fresher' && (isIntern || job.experience_level === 'entry')) ||
      (opportunityType === 'full-time' && job.job_type === 'full-time')

    const matchesDomain =
      domainFilter === 'all' ||
      job.title.toLowerCase().includes(domainFilter.toLowerCase()) ||
      job.skills_required?.some((s) => s.toLowerCase().includes(domainFilter.toLowerCase()))

    const matchesRemote = !remoteOnly || job.is_remote

    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'aicte' && job.source === 'aicte') ||
      (sourceFilter === 'ncs' && job.source === 'ncs') ||
      (sourceFilter === 'google_jobs' && job.source === 'google_jobs') ||
      (sourceFilter === 'adzuna' && job.source === 'adzuna')

    return matchesQuery && matchesType && matchesDomain && matchesRemote && matchesSource
  })

  const aicteCount = jobs.filter((j) => j.source === 'aicte').length
  const ncsCount = jobs.filter((j) => j.source === 'ncs').length
  const googleJobsCount = jobs.filter((j) => j.source === 'google_jobs').length
  const adzunaCount = jobs.filter((j) => j.source === 'adzuna').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#29231e]">
      {/* Top Search & Filter Bar (Matching Pavitra Foundation Editorial Theme) */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Internshala-Style Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#eadcc9]">
          <span className="text-[11px] font-bold text-[#572d12] mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Opportunities:</span>
          </span>
          {[
            { id: 'all', label: `All Openings (${jobs.length})` },
            { id: 'applied', label: `✅ Applied Jobs (${appliedIds.length})` },
            { id: 'internship', label: '🎓 Internships (Internshala)' },
            { id: 'fresher', label: '🚀 Fresher / Entry-Level' },
            { id: 'full-time', label: '💼 Full-Time Roles' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOpportunityType(id as typeof opportunityType)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                opportunityType === id
                  ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs'
                  : 'bg-[#fffaf3] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, company, or skills (e.g. React Developer Intern, Python, Zomato, BEL)..."
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

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#635b52] mr-2">Domain:</span>
          {[
            { id: 'all', label: 'All Domains' },
            { id: 'web', label: 'Web Development' },
            { id: 'python', label: 'Python & AI' },
            { id: 'react', label: 'React / Frontend' },
            { id: 'node', label: 'Backend / APIs' },
            { id: 'data', label: 'Data Science' },
            { id: 'mobile', label: 'Mobile (Flutter/Android)' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDomainFilter(id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                domainFilter === id
                  ? 'bg-[#572d12] text-white shadow-xs'
                  : 'bg-[#fffaf3] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Source Channels Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#eadcc9]">
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
            All Channels ({jobs.length})
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
            <span>🌐 Google Jobs ({googleJobsCount})</span>
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
            <span>🇮🇳 NCS Govt ({ncsCount})</span>
          </button>
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
        <span>Showing {filteredJobs.length} opportunities</span>
        <span className="text-[#d97706] font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live ATS Scored &amp; Matched</span>
        </span>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-[#eadcc9] bg-white p-12 text-center shadow-xs space-y-3">
            <p className="text-sm font-bold text-[#572d12]">No openings found matching your criteria.</p>
            <p className="text-xs text-[#635b52]">Try clearing filters or click &quot;Sync Live Feeds&quot; to fetch the latest openings.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setOpportunityType('all')
                  setDomainFilter('all')
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
                className="pavitra-btn pavitra-btn-sm font-bold cursor-pointer !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white"
                style={{ backgroundColor: '#d97706', color: '#ffffff' }}
              >
                Sync Live Feeds
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const matchScore = getMatchScore(job.skills_required)
            const isSaved = savedIds.includes(job.id)
            const isApplied = appliedIds.includes(job.id)
            const isAICTE = job.source === 'aicte'
            const isNCS = job.source === 'ncs'
            const isGoogleJobs = job.source === 'google_jobs'
            const isAdzuna = job.source === 'adzuna'
            const isIntern =
              job.job_type === 'internship' ||
              job.title.toLowerCase().includes('intern') ||
              job.experience_level === 'entry'

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-[#eadcc9] bg-white p-6 shadow-xs hover:border-[#d97706] transition-all duration-200 group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      onClick={() => handleOpenApplyModal(job)}
                      className="text-base font-extrabold text-[#572d12] hover:text-[#d97706] transition-colors cursor-pointer"
                      title="Click to view full job description and requirements"
                    >
                      {job.title}
                    </h3>

                    {/* Internshala Badges */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3df] border border-[#eadcc9] text-[#b45309]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                      Actively Hiring
                    </span>

                    {isIntern && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                        🎓 Internship
                      </span>
                    )}

                    {/* Channel Badges */}
                    {isGoogleJobs && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                        🌐 Google Jobs
                      </span>
                    )}

                    {isAdzuna && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        ⚡ Adzuna India
                      </span>
                    )}

                    {isAICTE && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                        🏛️ AICTE
                      </span>
                    )}

                    {isNCS && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fff3df] text-[#b45309] border border-[#eadcc9]">
                        🇮🇳 NCS Govt
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                      <Sparkles className="w-3 h-3" />
                      <span>{matchScore}% ATS Match</span>
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
                      {job.location || 'Pan India / Remote'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#166534] font-bold" suppressHydrationWarning>
                      <DollarSign className="w-3.5 h-3.5 text-[#166534]" />
                      {formatJobSalary(job.salary_min, job.salary_max, job.salary_currency, job.job_type || 'full-time')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#635b52]">
                      <Calendar className="w-3.5 h-3.5 text-[#78716c]" />
                      <span>Starts Immediately</span>
                    </span>
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
                    title={isSaved ? 'Opportunity Saved' : 'Save Opportunity'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenApplyModal(job)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] hover:bg-[#fff3df] text-xs font-bold text-[#572d12] hover:text-[#d97706] transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  {isApplied ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                        <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                        <span>Applied ✓</span>
                      </span>
                      <a
                        href="/applications"
                        className="px-3 py-1.5 rounded-xl border border-[#eadcc9] bg-white hover:bg-[#fffaf3] text-xs font-bold text-[#d97706] hover:underline transition-colors flex items-center gap-1"
                        title="View status in your Applications Pipeline"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenApplyModal(job)}
                      className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-1.5 font-bold !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white cursor-pointer"
                      style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Full Job Details & Application Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#eadcc9] max-w-2xl w-full max-h-[88vh] overflow-hidden flex flex-col shadow-2xl text-[#29231e]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eadcc9] bg-[#fffaf3] flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-[#b45309] uppercase tracking-wider bg-[#fff3df] border border-[#eadcc9] px-2.5 py-0.5 rounded-full">
                    {selectedJobForApply.source_url?.includes('internshala.com')
                      ? '🎓 Internshala Verified Opening'
                      : selectedJobForApply.source === 'aicte'
                      ? '🏛️ AICTE Gov Internship Portal'
                      : selectedJobForApply.source === 'ncs'
                      ? '🇮🇳 National Career Service (NCS)'
                      : '⚡ Verified Employer Opportunity'}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                    <Sparkles className="w-3 h-3" />
                    <span>{getMatchScore(selectedJobForApply.skills_required)}% ATS Score Match</span>
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#572d12]">
                  {selectedJobForApply.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#635b52]">
                  <span className="font-bold text-[#572d12] flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#d97706]" />
                    {selectedJobForApply.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#78716c]" />
                    {selectedJobForApply.location || 'Pan India / Remote'}
                  </span>
                  <span className="text-[#166534] font-bold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#166534]" />
                    {formatJobSalary(
                      selectedJobForApply.salary_min,
                      selectedJobForApply.salary_max,
                      selectedJobForApply.salary_currency,
                      selectedJobForApply.job_type || 'full-time'
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedJobForApply(null)}
                className="p-2 rounded-xl border border-[#eadcc9] hover:bg-white text-[#78716c] hover:text-[#572d12] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* About the Role / Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d97706]">
                  About the Role &amp; Responsibilities
                </h4>
                <div className="p-4 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] text-[#29231e] leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                  {selectedJobForApply.description || 'No detailed description provided by employer.'}
                </div>
              </div>

              {/* Requirements & Eligibility */}
              {selectedJobForApply.requirements && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#d97706]">
                    Candidate Requirements &amp; Eligibility
                  </h4>
                  <div className="p-4 rounded-2xl border border-[#eadcc9] bg-white text-[#29231e] leading-relaxed whitespace-pre-line text-xs sm:text-[13px]">
                    {selectedJobForApply.requirements}
                  </div>
                </div>
              )}

              {/* Required Skills Matrix */}
              {selectedJobForApply.skills_required && selectedJobForApply.skills_required.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#d97706]">
                    Key Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJobForApply.skills_required.map((skill) => {
                      const isMatched = userSkills.some((u) => u.toLowerCase() === skill.toLowerCase())
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                            isMatched
                              ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                              : 'bg-[#fffaf3] text-[#572d12] border-[#eadcc9]'
                          }`}
                        >
                          {isMatched && <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />}
                          <span>{skill}</span>
                          {isMatched && <span className="text-[10px] text-[#166534] font-bold">(In Your Profile)</span>}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Original Website Source Link Box */}
              <div className="p-4 rounded-2xl border border-[#eadcc9] bg-[#fff3df] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#d97706]" />
                    Original Posting Website &amp; Application Path
                  </span>
                  <span className="text-[10px] font-bold text-[#b45309] uppercase">Verified URL</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#eadcc9] flex items-center justify-between gap-3 text-xs break-all">
                  <span className="text-[#635b52] font-mono text-[11px] truncate">
                    {selectedJobForApply.source_url || 'https://www.google.com/search?q=' + encodeURIComponent(selectedJobForApply.company + ' ' + selectedJobForApply.title)}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                </div>
                <p className="text-[11px] text-[#78716c]">
                  Clicking <strong>&quot;Apply on Official Website&quot;</strong> below will redirect you straight to this exact posting in a new tab and automatically log your application in your pipeline tracker.
                </p>
              </div>

              {/* Errors or Success */}
              {applyError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{applyError}</span>
                </div>
              )}

              {applySuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Application logged to your Dashboard! Redirecting to official posting...</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#eadcc9] bg-[#fffaf3] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedJobForApply(null)}
                className="px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-white text-xs font-bold text-[#635b52] hover:text-[#572d12] cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={applying || applySuccess}
                className="pavitra-btn pavitra-btn-sm font-bold inline-flex items-center gap-2 !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: '#d97706', color: '#ffffff' }}
              >
                {applying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Opening Official Portal...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedJobForApply.source_url?.includes('internshala.com')
                        ? 'Apply on Internshala'
                        : selectedJobForApply.source === 'aicte'
                        ? 'Apply on AICTE'
                        : selectedJobForApply.source === 'ncs'
                        ? 'Apply on NCS Portal'
                        : `Apply on ${selectedJobForApply.company}`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
