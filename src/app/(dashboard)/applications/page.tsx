import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ApplicationsPipeline } from '@/components/applications/ApplicationsPipeline'
import type { ApplicationWithJob } from '@/types'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Application Pipeline – CareerPilot AI',
  description: 'Track and manage your active job application lifecycle',
}

async function ApplicationsData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let applications: ApplicationWithJob[] = []

  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('*, job:jobs(*)')
      .eq('user_id', user.id)
      .order('last_activity_at', { ascending: false })

    applications = (data as unknown as ApplicationWithJob[]) || []
  }

  return <ApplicationsPipeline initialApplications={applications} userId={user?.id} />
}

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
            <p className="text-xs">Loading application pipeline...</p>
          </div>
        }
      >
        <ApplicationsData />
      </Suspense>
    </div>
  )
}
