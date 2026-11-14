import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { JobsBoard } from '@/components/jobs/JobsBoard'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Job Board – CareerPilot AI',
  description: 'AI-curated job opportunities matched to your skill stack',
}

async function JobsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })

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
      initialJobs={jobs || []}
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
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
            <p className="text-xs">Scanning live job radar...</p>
          </div>
        }
      >
        <JobsData />
      </Suspense>
    </div>
  )
}
