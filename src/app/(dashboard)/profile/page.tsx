import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Profile – CareerPilot AI',
  description: 'Manage your professional background, skills, and target roles',
}

async function ProfileData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let userRow = null

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
    profile = p

    const { data: u } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle()
    userRow = u
  }

  return <ProfileForm initialUser={userRow} initialProfile={profile} />
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
            <p className="text-xs">Loading profile parameters...</p>
          </div>
        }
      >
        <ProfileData />
      </Suspense>
    </div>
  )
}
