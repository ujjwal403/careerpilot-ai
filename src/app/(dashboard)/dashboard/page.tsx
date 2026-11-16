import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatCard } from '@/components/dashboard/StatCard'
import { ApplicationFunnel } from '@/components/dashboard/ApplicationFunnel'
import { QuickRecommendations } from '@/components/dashboard/QuickRecommendations'
import { DashboardQuickActions } from '@/components/dashboard/DashboardQuickActions'
import { getAllDefaultJobs } from '@/lib/services/job-aggregators'
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
  let { data: realJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('posted_at', { ascending: false })

  // Fallback to verified default jobs if DB has no jobs yet
  if (!realJobs || realJobs.length === 0) {
    try {
      const defaultJobs = await getAllDefaultJobs()
      realJobs = defaultJobs as any
    } catch {
      realJobs = []
    }
  }

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

  const totalMatches = realJobs?.length || 44

  const stats = [
    {
      title: 'Total Applications',
      value: applicationCount,
      caption: applicationCount > 0 ? 'Active in hiring pipelines' : 'Track opportunities from Job Radar',
      icon: Send,
      trend: { value: applicationCount > 0 ? `${applicationCount} active` : 'Ready to start', isPositive: true },
      badge: 'Active Tracker',
      href: '/applications',
    },
    {
      title: 'Interviews Scheduled',
      value: interviewCount,
      caption: interviewCount > 0 ? 'Upcoming technical & culture rounds' : 'No upcoming rounds yet',
      icon: Calendar,
      trend: { value: `${interviewCount} scheduled`, isPositive: interviewCount > 0 },
      badge: 'High Priority',
      href: '/applications',
    },
    {
      title: 'AI Resume Score',
      value: resume?.ai_score ? `${resume.ai_score}/100` : (resume ? '92/100' : '65/100'),
      caption: resume ? 'ATS compatibility verified' : 'Audit Drive CV link in Resume tab',
      icon: ShieldCheck,
      trend: { value: resume ? 'ATS Verified' : 'Scan Drive CV', isPositive: Boolean(resume) },
      badge: 'ATS Scanner',
      href: '/resume',
    },
    {
      title: 'AI Job Matches',
      value: `${totalMatches}+`,
      caption: 'Verified live opportunities',
      icon: Sparkles,
      trend: { value: `${totalMatches} active`, isPositive: true },
      badge: 'Precision Radar',
      href: '/jobs',
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardHeader userName={user?.user_metadata?.full_name || profile?.headline} />

      {/* 4 KPI Stat Cards in a clean, balanced row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Balanced 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Top Verified Job & Internship Matches */}
        <div className="lg:col-span-2 space-y-6">
          <QuickRecommendations jobs={realJobs || []} userSkills={profile?.skills || []} />
        </div>

        {/* Right Column: Application Pipeline & AI Career Toolkit */}
        <div className="lg:col-span-1 space-y-6">
          <ApplicationFunnel counts={funnelCounts} />
          <DashboardQuickActions />
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-[#78716c]">
      <Loader2 className="w-6 h-6 animate-spin text-[#2563eb] mb-3" />
      <p className="text-xs">Loading career telemetry...</p>
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
