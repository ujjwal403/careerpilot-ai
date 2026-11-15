'use client'

import { useState } from 'react'
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Plus,
  BookOpen,
  Compass,
  ArrowRight,
  TrendingUp,
  Loader2,
  Lightbulb,
  Award,
} from 'lucide-react'

interface AIProfileOptimizerProps {
  profile: {
    headline?: string
    bio?: string
    college_name?: string
    degree?: string
    field_of_study?: string
    cgpa?: string
    passing_year?: number | string
    skills?: string[]
    desired_roles?: string[]
    location?: string
  }
  onApplyHeadline: (headline: string) => void
  onApplyBio: (bio: string) => void
  onAddSkill: (skill: string) => void
}

interface AIAnalysisResult {
  profileStrengthScore: number
  recommendedHeadline: string
  aiBioFresher: string
  aiBioTech: string
  criticalMissingSkills: string[]
  suggestedProjects: Array<{
    title: string
    techStack: string
    description: string
  }>
  internshipStrategy: string[]
}

export function AIProfileOptimizer({
  profile,
  onApplyHeadline,
  onApplyBio,
  onAddSkill,
}: AIProfileOptimizerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [appliedHeadline, setAppliedHeadline] = useState(false)
  const [appliedBioType, setAppliedBioType] = useState<'fresher' | 'tech' | null>(null)
  const [addedSkills, setAddedSkills] = useState<string[]>([])

  const handleRunOptimization = async () => {
    try {
      setAnalyzing(true)
      const res = await fetch('/api/ai/optimize-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const json = await res.json()
      if (json.data) {
        setResult(json.data)
      }
    } catch {
      // error handled silently
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-7 shadow-xs space-y-6 text-[#29231e]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#eadcc9] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d97706] to-[#b45309] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-[#572d12]">Gemini AI Profile Coach</h3>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#fff3df] border border-[#eadcc9] text-[#b45309]">
                Internshala Ready
              </span>
            </div>
            <p className="text-xs text-[#635b52] mt-0.5">
              Audits your engineering profile, rewrites summaries, and suggests high-impact skills for recruiters.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunOptimization}
          disabled={analyzing}
          className="pavitra-btn pavitra-btn-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 !bg-gradient-to-r !from-[#d97706] !to-[#b45309] !text-white"
          style={{ backgroundColor: '#d97706', color: '#ffffff' }}
        >
          {analyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Profile...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{result ? 'Re-Audit with AI' : 'Audit Profile with Gemini'}</span>
            </>
          )}
        </button>
      </div>

      {!result && !analyzing && (
        <div className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-[#572d12]">Enhance Your Profile for Top Internship Openings</h4>
            <p className="text-xs text-[#635b52] leading-relaxed">
              Click &quot;Audit Profile with Gemini&quot; above. Our AI evaluates your current branch, college, skills, and target roles to give you high-converting bios and missing keywords recruiters search for.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 pt-1 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#eadcc9] bg-[#fff3df] p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white border-2 border-[#d97706] flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                <span className="text-lg font-black text-[#d97706] leading-none">
                  {result.profileStrengthScore}
                </span>
                <span className="text-[9px] font-bold text-[#78716c] uppercase">/ 100</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#572d12] uppercase tracking-wider">
                  Profile Strength
                </span>
                <p className="text-xs text-[#635b52] mt-0.5">
                  {result.profileStrengthScore >= 80
                    ? 'Excellent profile! Ready for top-tier tech internships.'
                    : 'Good foundation. Complete the suggestions below to reach 90+.'}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#d97706]" />
                  Recommended Headline
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyHeadline(result.recommendedHeadline)
                    setAppliedHeadline(true)
                  }}
                  disabled={appliedHeadline}
                  className="text-[11px] font-bold text-[#d97706] hover:text-[#b45309] hover:underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {appliedHeadline ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Applied</span>
                    </>
                  ) : (
                    'Apply to Profile →'
                  )}
                </button>
              </div>
              <p className="text-xs font-semibold text-[#29231e] bg-white p-2.5 rounded-lg border border-[#eadcc9]">
                {result.recommendedHeadline}
              </p>
            </div>
          </div>

          {/* AI Generated Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fresher/Internship Bio */}
            <div className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#d97706]" />
                    Campus &amp; Internship Bio
                  </span>
                  <span className="text-[10px] font-bold text-[#b45309] bg-[#fff3df] px-2 py-0.5 rounded-full border border-[#eadcc9]">
                    Internshala Focus
                  </span>
                </div>
                <p className="text-xs text-[#635b52] leading-relaxed bg-white p-3 rounded-lg border border-[#eadcc9]">
                  {result.aiBioFresher}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyBio(result.aiBioFresher)
                  setAppliedBioType('fresher')
                }}
                disabled={appliedBioType === 'fresher'}
                className="w-full py-2 px-3 rounded-lg border border-[#eadcc9] bg-white hover:bg-[#fff3df] text-xs font-bold text-[#572d12] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {appliedBioType === 'fresher' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Applied to Profile</span>
                  </>
                ) : (
                  <>
                    <span>Use this Summary</span>
                    <ArrowRight className="w-3 h-3 text-[#d97706]" />
                  </>
                )}
              </button>
            </div>

            {/* Technical Bio */}
            <div className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#d97706]" />
                    Product &amp; Technical Bio
                  </span>
                  <span className="text-[10px] font-bold text-[#b45309] bg-[#fff3df] px-2 py-0.5 rounded-full border border-[#eadcc9]">
                    Tech Startups Focus
                  </span>
                </div>
                <p className="text-xs text-[#635b52] leading-relaxed bg-white p-3 rounded-lg border border-[#eadcc9]">
                  {result.aiBioTech}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyBio(result.aiBioTech)
                  setAppliedBioType('tech')
                }}
                disabled={appliedBioType === 'tech'}
                className="w-full py-2 px-3 rounded-lg border border-[#eadcc9] bg-white hover:bg-[#fff3df] text-xs font-bold text-[#572d12] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {appliedBioType === 'tech' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Applied to Profile</span>
                  </>
                ) : (
                  <>
                    <span>Use this Summary</span>
                    <ArrowRight className="w-3 h-3 text-[#d97706]" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Missing Skills Section */}
          {result.criticalMissingSkills?.length > 0 && (
            <div className="rounded-xl border border-[#eadcc9] bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#d97706]" />
                  High-Priority In-Demand Skills (Click to add to Profile)
                </span>
                <span className="text-[11px] text-[#78716c]">1-Click Add</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {result.criticalMissingSkills.map((skill) => {
                  const isAdded = addedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        onAddSkill(skill)
                        setAddedSkills((prev) => [...prev, skill])
                      }}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-[#fffaf3] hover:bg-[#fff3df] border border-[#eadcc9] text-[#572d12] hover:border-[#d97706]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{skill} (Added)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 text-[#d97706]" />
                          <span>{skill}</span>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommended Projects & Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suggested Projects */}
            <div className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-4 space-y-3">
              <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#d97706]" />
                Standout Project Ideas to Build
              </span>
              <div className="space-y-2.5">
                {result.suggestedProjects?.map((proj, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-[#eadcc9] space-y-1">
                    <p className="text-xs font-bold text-[#572d12]">{proj.title}</p>
                    <p className="text-[11px] font-semibold text-[#d97706]">{proj.techStack}</p>
                    <p className="text-[11px] text-[#635b52] leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tactical Internship Strategy */}
            <div className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-4 space-y-3">
              <span className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#d97706]" />
                Internship Application Strategy
              </span>
              <div className="space-y-2">
                {result.internshipStrategy?.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-[#eadcc9]">
                    <span className="w-5 h-5 rounded-full bg-[#fff3df] text-[#d97706] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-[#635b52] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
