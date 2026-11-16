import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AskAICopilotView } from '@/components/ai/AskAICopilotView'

export const metadata: Metadata = {
  title: 'Ask AI Copilot – CareerPilot AI',
  description: 'Instant career coaching, resume feedback, cold email templates, and interview prep powered by CareerPilot AI',
}

export default async function AskAIPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    profile = data
  }

  const userProfile = profile
    ? {
        degree: profile.degree || undefined,
        field_of_study: profile.field_of_study || undefined,
        college_name: profile.college_name || undefined,
        skills: profile.skills || undefined,
        desired_roles: profile.desired_roles || undefined,
        headline: profile.headline || undefined,
      }
    : undefined

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AskAICopilotView userProfile={userProfile} />
    </div>
  )
}

