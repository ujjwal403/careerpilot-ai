import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ResumeManager } from '@/components/resume/ResumeManager'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resume Builder & ATS Audit – CareerPilot AI',
  description: 'AI-driven resume optimization and ATS scoring',
}

async function ResumeData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let resume = null

  if (user) {
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle()
    resume = data
  }

  return <ResumeManager initialResume={resume} userId={user?.id} />
}

export default function ResumePage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
            <p className="text-xs">Loading resume intelligence...</p>
          </div>
        }
      >
        <ResumeData />
      </Suspense>
    </div>
  )
}
