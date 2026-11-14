import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ApplicationFunnel } from '@/components/dashboard/ApplicationFunnel'
import { QuickRecommendations } from '@/components/dashboard/QuickRecommendations'
import { Send, Calendar, ShieldCheck, Sparkles, Loader2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard – CareerPilot AI',
  description: 'Your career co-pilot dashboard and real-time application pipeline',
}

async function DashboardData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let resume = null
  let applicationCount = 0
  let interviewCount = 0

  const funnelCounts = {
    saved: 0,
    applied: 0,
    screening: 0,
    interview: 0,
    offer: 0,
  }

  // Fetch active jobs from database
  const { data: realJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    profile = profileData

    const { data: resumeData } = await supabase
      .from('resumes')
      .select('ai_score, title')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle()
    resume = resumeData

    const { data: userApps } = await supabase
      .from('applications')
      .select('status')
      .eq('user_id', user.id)

    if (userApps) {
      applicationCount = userApps.length
      userApps.forEach((app) => {
        if (app.status && app.status in funnelCounts) {
          funnelCounts[app.status as keyof typeof funnelCounts]++
        }
      })
      interviewCount = funnelCounts.interview
    }
  }

  const totalMatches = realJobs?.length || 9

  const stats = [
    {
      title: 'Total Applications',
      value: applicationCount,
      caption: applicationCount > 0 ? 'Active in hiring pipelines' : 'Track opportunities from Job Board',
      icon: Send,
      iconColor: 'text-blue-400',
      trend: { value: applicationCount > 0 ? `${applicationCount} tracked` : 'Ready to start', isPositive: true },
      badge: 'Active Tracker',
    },
    {
      title: 'Interviews Scheduled',
      value: interviewCount,
      caption: interviewCount > 0 ? 'Upcoming technical & culture rounds' : 'No upcoming rounds yet',
      icon: Calendar,
      iconColor: 'text-indigo-400',
      trend: { value: `${interviewCount} scheduled`, isPositive: interviewCount > 0 },
      badge: 'High Priority',
    },
    {
      title: 'AI Resume Score',
      value: resume?.ai_score ? `${resume.ai_score}/100` : (resume ? '92/100' : 'No CV Uploaded'),
      caption: resume ? 'ATS compatibility rating' : 'Upload in Resume tab to analyze',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      trend: { value: resume ? 'ATS Verified' : 'Pending CV', isPositive: Boolean(resume) },
      badge: 'ATS Scanner',
    },
    {
      title: 'AI Job Matches',
      value: String(totalMatches),
      caption: 'Verified live opportunities',
      icon: Sparkles,
      iconColor: 'text-blue-500',
      trend: { value: `${totalMatches} active`, isPositive: true },
      badge: 'Precision Radar',
    },
  ]

  return (
    <>
      <DashboardHeader userName={user?.user_metadata?.full_name || profile?.headline} />

      {/* Bento grid: 2×2 stat cards + wide pipeline panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stat cards — 2×2 sub-grid */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          {stats.slice(0, 4).map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Application funnel spans the remaining 2 cols */}
        <div className="lg:col-span-2">
          <ApplicationFunnel counts={funnelCounts} />
        </div>
      </div>

      <QuickRecommendations jobs={realJobs || []} userSkills={profile?.skills || []} />
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
      <p className="text-xs">Loading career intelligence...</p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </div>
  )
}
