import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { JobsBoard } from '@/components/jobs/JobsBoard'
import { syncAllJobSources, getAllDefaultJobs } from '@/lib/services/job-aggregators'
import type { Job } from '@/types'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Job & Internship Radar – CareerPilot AI',
  description: 'Internships and engineering opportunities from Internshala, Google Jobs, Adzuna India, AICTE & NCS',
}

async function JobsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch jobs
  let { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })

  let displayJobs: Job[] = jobs || []

  // If database has fewer than 15 jobs, automatically seed & sync so candidates always see 40+ openings
  if (displayJobs.length < 15) {
    try {
      await syncAllJobSources({ channel: 'all' })
      const { data: refetched } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_at', { ascending: false })
      if (refetched && refetched.length > 0) {
        displayJobs = refetched
      }
    } catch {
      // fallback below
    }

    if (displayJobs.length < 15) {
      const defaultRecords = await getAllDefaultJobs()
      const fallbackJobs: Job[] = defaultRecords.map((r, i) => ({
        id: `default-job-${i + 1}`,
        title: r.title,
        company: r.company,
        location: r.location || 'India',
        is_remote: r.is_remote ?? false,
        job_type: r.job_type ?? 'full-time',
        experience_level: r.experience_level ?? 'entry',
        salary_min: r.salary_min ?? 30000,
        salary_max: r.salary_max ?? 50000,
        salary_currency: r.salary_currency || 'INR',
        description: r.description || '',
        requirements: r.requirements || '',
        skills_required: r.skills_required || [],
        source: r.source || 'adzuna',
        source_job_id: r.source_job_id || `job-${i}`,
        source_url: r.source_url || 'https://internshala.com',
        is_active: true,
        posted_at: r.posted_at || new Date().toISOString(),
        created_at: new Date().toISOString(),
        expires_at: null,
        company_logo_url: null,
        benefits: null,
        views_count: 0,
      }))
      displayJobs = fallbackJobs
    }
  }

  // Fetch user skills from profile & existing applications
  let userSkills: string[] = []
  const appliedIds: string[] = []
  const savedIds: string[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills')
      .eq('user_id', user.id)
      .maybeSingle()
    if (profile?.skills) userSkills = profile.skills

    const { data: userApps } = await supabase
      .from('applications')
      .select('job_id, status')
      .eq('user_id', user.id)

    if (userApps) {
      userApps.forEach((app) => {
        if (app.status === 'saved') savedIds.push(app.job_id)
        else appliedIds.push(app.job_id)
      })
    }
  }

  return (
    <JobsBoard
      initialJobs={displayJobs}
      userSkills={userSkills}
      userId={user?.id}
      initialAppliedIds={appliedIds}
      initialSavedIds={savedIds}
    />
  )
}

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 text-[#78716c]">
            <Loader2 className="w-6 h-6 animate-spin text-[#d97706] mb-3" />
            <p className="text-xs">Scanning live job radar...</p>
          </div>
        }
      >
        <JobsData />
      </Suspense>
    </div>
  )
}
