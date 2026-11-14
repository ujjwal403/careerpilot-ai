'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Wrench,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Copy,
  Layers,
  Award,
  RefreshCw,
} from 'lucide-react'
import { evaluateATSCompatibility, type ATSScorerResult } from '@/lib/ats-scorer'
import { evaluateJobProfileMatches, type JobProfileMatchResult } from '@/lib/job-profile-matcher'
import type { ResumeExtractedData } from '@/types/resume-extractor'

interface SimpleATSScannerProps {
  initialResumeText?: string
  initialSkills?: string[]
}

function createStubExtractedData(skills: string[] = []): ResumeExtractedData {
  return {
    contact: {
      name: '',
      email: null,
      phone: null,
      city: null,
      linkedin_url: null,
      github_url: null,
      portfolio_url: null,
    },
    education: [],
    experience: [],
    skills: { hard_skills: skills, soft_skills: [] },
    projects: [],
    certifications: [],
    extracted_at: new Date().toISOString(),
  }
}

export function SimpleATSScanner({
  initialResumeText = '',
  initialSkills = [],
}: SimpleATSScannerProps) {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const [resumeText, setResumeText] = useState(initialResumeText)
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedJobCategory, setSelectedJobCategory] = useState<string>('all')
  const [expandedMissingItem, setExpandedMissingItem] = useState<string | null>(null)

  // Only show ATS score report after user actively uploads a file or clicks Calculate ATS Score
  const [customReport, setCustomReport] = useState<ATSScorerResult | null>(null)

  // Evaluate Job Profile Matches based on current text & skills
  const jobMatches: JobProfileMatchResult[] = useMemo(() => {
    if (!resumeText || resumeText.length < 30) {
      return []
    }
    return evaluateJobProfileMatches(resumeText, initialSkills)
  }, [resumeText, initialSkills])

  // Handle direct file upload & text extraction
  const handleFileUpload = async (uploadedFile: File) => {
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller file.')
      return
    }

    setFile(uploadedFile)
    setError(null)
    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to parse resume.')
      }

      const extractedContent = data.resume?.content || ''
      const extractedSkills = data.extractedData?.skills?.hard_skills || []

      setResumeText(extractedContent)

      // Generate ATS report (prefer server-parsed deterministic audit)
      const report = data.atsReport || evaluateATSCompatibility(extractedContent, data.extractedData)
      setCustomReport(report)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze uploaded CV.'
      setError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  // Handle manual paste analysis
  const handleAnalyzePastedText = () => {
    if (!resumeText.trim() || resumeText.trim().length < 40) {
      setError('Please paste a substantial portion of your CV/Resume (at least 40 characters) to calculate your ATS score.')
      return
    }

    setError(null)
    setAnalyzing(true)

    setTimeout(() => {
      try {
        const report = evaluateATSCompatibility(resumeText, createStubExtractedData(initialSkills))
        setCustomReport(report)
      } catch {
        setError('Could not evaluate the provided resume text.')
      } finally {
        setAnalyzing(false)
      }
    }, 400)
  }

  // Identify Missing Elements from the report
  const missingAnalysis = useMemo(() => {
    if (!customReport) return { critical: [], warnings: [], strengths: [] }

    const criticalGaps: { id: string; title: string; desc: string; fix: string }[] = []
    const warningGaps: { id: string; title: string; desc: string; fix: string }[] = []

    for (const rule of customReport.rules) {
      if (rule.status === 'failed') {
        criticalGaps.push({
          id: rule.id,
          title: rule.name,
          desc: rule.details || rule.description,
          fix: rule.suggestion || rule.description,
        })
      } else if (rule.status === 'warning') {
        warningGaps.push({
          id: rule.id,
          title: rule.name,
          desc: rule.details || rule.description,
          fix: rule.suggestion || rule.description,
        })
      }
    }

    return {
      critical: criticalGaps,
      warnings: warningGaps,
      strengths: customReport.strengths || [],
    }
  }, [customReport])

  // Score styling
  const scoreBadgeColor = useMemo(() => {
    if (!customReport) return { bg: 'bg-[#fff3df]', text: 'text-[#d97706]', border: 'border-[#eadcc9]' }
    const s = customReport.totalScore
    if (s >= 85) return { bg: 'bg-[#f0fdf4]', text: 'text-[#166534]', border: 'border-[#bbf7d0]' }
    if (s >= 60) return { bg: 'bg-[#fff3df]', text: 'text-[#d97706]', border: 'border-[#eadcc9]' }
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  }, [customReport])

  return (
    <div className="space-y-8 text-[#29231e]">
      {/* Top Hero Section */}
      <div className="rounded-3xl border border-[#eadcc9] bg-white p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff3df] border border-[#eadcc9] text-[#d97706]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant ATS Audit & Job Profile Matcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#572d12] tracking-tight">
            Check Your ATS Score & Match Job Profiles
          </h1>
          <p className="text-xs sm:text-sm text-[#78716c] leading-relaxed">
            Drop your CV or paste your resume text below. Our 10-rule ATS engine calculates your score, pinpoints exact missing items, and shows which Indian tech job profiles you qualify for right now.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#eadcc9]">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[#fffaf3] border border-[#eadcc9]">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white text-[#d97706] shadow-xs border border-[#eadcc9]'
                  : 'text-[#78716c] hover:text-[#572d12]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF / DOCX</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                inputMode === 'paste'
                  ? 'bg-white text-[#d97706] shadow-xs border border-[#eadcc9]'
                  : 'text-[#78716c] hover:text-[#572d12]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Resume Text</span>
            </button>
          </div>

          <div className="text-xs font-bold text-[#78716c] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
            <span>Live Deterministic Analysis</span>
          </div>
        </div>

        {/* Mode A: File Upload Dropzone */}
        {inputMode === 'upload' && (
          <div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dropped = e.dataTransfer.files?.[0]
                if (dropped) handleFileUpload(dropped)
              }}
              className="border-2 border-dashed border-[#eadcc9] hover:border-[#d97706] rounded-3xl p-8 sm:p-12 text-center bg-[#fffaf3] hover:bg-[#fff3df]/40 transition-all cursor-pointer relative"
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => {
                  const selected = e.target.files?.[0]
                  if (selected) handleFileUpload(selected)
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#572d12]">
                    {file ? file.name : 'Drop your CV / Resume here to calculate ATS Score'}
                  </p>
                  <p className="text-xs text-[#78716c] mt-1">
                    Supports PDF, DOCX, or DOC (Max 10MB) • Instant Evaluation
                  </p>
                </div>
                <span className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold text-xs mt-2">
                  Browse from Computer
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mode B: Direct Text Paste */}
        {inputMode === 'paste' && (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your CV text here (e.g. Rahul Sharma, B.Tech CSE, Skills: React, Node.js, Experience...)"
                className="w-full p-4 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706] placeholder:text-[#9b9186]"
              />
              <div className="absolute right-3 bottom-3 text-[11px] font-mono font-bold text-[#78716c]">
                {resumeText.length} characters
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#78716c]">
                Paste your full summary, academics, experience, and technical skills.
              </span>
              <button
                type="button"
                onClick={handleAnalyzePastedText}
                disabled={analyzing || resumeText.trim().length < 30}
                className="pavitra-btn pavitra-btn-primary font-bold text-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing ATS Rules...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate ATS Score</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Saved Resume Shortcut if exists */}
        {!customReport && initialResumeText && initialResumeText.length > 50 && (
          <div className="p-4 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-[#572d12] block">Saved Profile Resume Available</span>
              <span className="text-[#78716c]">You have a saved CV in your profile. Click to calculate its ATS score.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const report = evaluateATSCompatibility(initialResumeText, createStubExtractedData(initialSkills))
                setResumeText(initialResumeText)
                setCustomReport(report)
              }}
              className="pavitra-btn pavitra-btn-sm font-bold text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calculate Score for Saved Resume</span>
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Empty State when no resume uploaded yet */}
      {!customReport && (
        <div className="rounded-3xl border border-dashed border-[#eadcc9] bg-white p-8 sm:p-12 text-center shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#572d12]">
            Upload Your Resume to See Your ATS Score
          </h3>
          <p className="text-xs sm:text-sm text-[#78716c] max-w-md mx-auto leading-relaxed">
            Upload your CV in PDF or DOCX format above, or paste your text to calculate your real-time ATS score, see what critical gaps are missing, and view matching job profiles.
          </p>
        </div>
      )}

      {/* RESULTS DISPLAY: Only Shown After User Uploads or Analyzes */}
      {customReport && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#eadcc9] bg-[#fffaf3]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#572d12]">
              <CheckCircle2 className="w-4 h-4 text-[#166534]" />
              <span>Resume Evaluated Successfully</span>
              {file && <span className="text-[#78716c] font-normal">• {file.name}</span>}
            </div>
            <button
              type="button"
              onClick={() => {
                setCustomReport(null)
                setFile(null)
                setResumeText('')
              }}
              className="text-xs font-bold text-[#d97706] hover:text-[#b45309] hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Another Resume</span>
            </button>
          </div>

          {/* SECTION 1: BIG ATS SCORE CARD */}
          <div className="rounded-3xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#eadcc9]">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fff3df] border border-[#eadcc9] text-[#d97706]">
                    Deterministic 10-Rule Audit
                  </span>
                  <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${scoreBadgeColor.bg} ${scoreBadgeColor.text} ${scoreBadgeColor.border}`}>
                    {customReport.ratingTier}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#572d12]">
                  Your ATS Compatibility Score
                </h2>
                <p className="text-xs sm:text-sm text-[#635b52]">
                  {customReport.ratingSummary}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#572d12] pt-1">
                  <Award className="w-4 h-4 text-[#d97706]" />
                  <span>{customReport.targetReadiness}</span>
                </div>
              </div>

              {/* Big Score Box */}
              <div className="flex items-center justify-center sm:justify-start gap-6 p-6 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] shrink-0 shadow-xs">
                <div className="text-center">
                  <div className={`text-5xl font-black font-mono tracking-tight ${scoreBadgeColor.text}`}>
                    {customReport.totalScore}
                    <span className="text-2xl text-[#78716c] font-normal">/100</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#635b52] block mt-1">
                    Overall ATS Rating
                  </span>
                </div>

                <div className="h-14 w-[1px] bg-[#eadcc9]" />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-[#166534] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{customReport.rules.filter((r) => r.status === 'passed').length} Rules Passed</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#b45309] font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{missingAnalysis.warnings.length} Improvements</span>
                  </div>
                  {missingAnalysis.critical.length > 0 && (
                    <div className="flex items-center gap-2 text-rose-700 font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>{missingAnalysis.critical.length} Critical Gaps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Strengths Summary */}
            {missingAnalysis.strengths.length > 0 && (
              <div className="pt-6">
                <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What You Did Great:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {missingAnalysis.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-xs font-medium text-[#166534] flex items-start gap-2"
                    >
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: WHAT'S MISSING IN YOUR CV */}
          <div className="rounded-3xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eadcc9] pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#572d12] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#d97706]" />
                  <span>What is Missing in Your CV & How to Fix It</span>
                </h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  Address these specific items to immediately boost your ATS compatibility score and pass recruiter filters.
                </p>
              </div>
              <span className="text-xs font-bold text-[#d97706] bg-[#fff3df] px-3 py-1 rounded-full border border-[#eadcc9] self-start sm:self-auto">
                {missingAnalysis.critical.length + missingAnalysis.warnings.length} Items to Optimize
              </span>
            </div>

            {/* Critical Missing Items (High Priority) */}
            {missingAnalysis.critical.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Critical Gaps (High Risk of Rejection)</span>
                </h4>
                <div className="space-y-3">
                  {missingAnalysis.critical.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-rose-900">{item.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                          Critical
                        </span>
                      </div>
                      <p className="text-xs text-rose-800">{item.desc}</p>
                      <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs text-[#29231e] space-y-1">
                        <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                          💡 Recommended Fix:
                        </span>
                        <p>{item.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings & Improvements (Medium Priority) */}
            {missingAnalysis.warnings.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#b45309] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                  <span>Recommended Improvements</span>
                </h4>
                <div className="space-y-3">
                  {missingAnalysis.warnings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-4 sm:p-5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#572d12]">{item.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#fff3df] text-[#d97706] px-2.5 py-0.5 rounded-full border border-[#eadcc9]">
                          Improvement
                        </span>
                      </div>
                      <p className="text-xs text-[#635b52]">{item.desc}</p>
                      <div className="p-3 rounded-xl bg-white border border-[#eadcc9] text-xs text-[#29231e] space-y-1">
                        <span className="font-bold text-[#d97706] block text-[11px] uppercase tracking-wider">
                          💡 Recommended Fix:
                        </span>
                        <p>{item.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missingAnalysis.critical.length === 0 && missingAnalysis.warnings.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-[#166534] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-[#166534]">Zero Missing Items Detected!</h4>
                <p className="text-xs text-[#635b52] mt-0.5">
                  Your resume has satisfied all 10 structural and keyword ATS dimensions.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 3: JOB PROFILE MATCHING & RECOMMENDATIONS */}
          <div className="rounded-3xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eadcc9] pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#572d12] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#d97706]" />
                  <span>Job Profiles Matching Your CV</span>
                </h3>
                <p className="text-xs text-[#78716c] mt-0.5">
                  See how well your resume matches high-demand roles in Indian tech, MNCs, and startups.
                </p>
              </div>

              <Link
                href="/jobs"
                className="pavitra-btn pavitra-btn-primary pavitra-btn-sm font-bold inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>View All Jobs on Job Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Profile Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobMatches.map((jm) => {
                const isHighMatch = jm.matchScore >= 75
                const isModerateMatch = jm.matchScore >= 50 && jm.matchScore < 75

                return (
                  <div
                    key={jm.profile.id}
                    className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-5 sm:p-6 space-y-4 flex flex-col justify-between hover:border-[#d97706] transition-colors shadow-2xs"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block">
                            {jm.profile.category}
                          </span>
                          <h4 className="text-base font-extrabold text-[#572d12]">
                            {jm.profile.title}
                          </h4>
                          <span className="text-[11px] font-bold text-[#d97706]">
                            Expected CTC: {jm.profile.salaryRangeINR}
                          </span>
                        </div>

                        {/* Match Percentage Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl font-mono text-sm font-black border ${
                              isHighMatch
                                ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                                : isModerateMatch
                                ? 'bg-[#fff3df] text-[#d97706] border-[#eadcc9]'
                                : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}
                          >
                            {jm.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-white rounded-full border border-[#eadcc9] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHighMatch
                              ? 'bg-gradient-to-r from-emerald-500 to-[#166534]'
                              : isModerateMatch
                              ? 'bg-gradient-to-r from-amber-400 to-[#d97706]'
                              : 'bg-zinc-400'
                          }`}
                          style={{ width: `${jm.matchScore}%` }}
                        />
                      </div>

                      <p className="text-xs text-[#635b52] leading-relaxed">
                        {jm.profile.description}
                      </p>

                      {/* Matched Skills */}
                      <div>
                        <span className="text-[11px] font-bold text-[#166534] uppercase tracking-wider block mb-1.5">
                          ✓ Matched Skills ({jm.matchedSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jm.matchedSkills.length > 0 ? (
                            jm.matchedSkills.map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]"
                              >
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#78716c] italic">No direct keyword overlap yet</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills for this profile */}
                      {jm.missingSkills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider block mb-1.5">
                            ✗ Missing for this Role ({jm.missingSkills.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {jm.missingSkills.slice(0, 5).map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-[#78716c] border border-[#eadcc9]"
                              >
                                {sk}
                              </span>
                            ))}
                            {jm.missingSkills.length > 5 && (
                              <span className="text-[10px] text-[#78716c] self-center">
                                +{jm.missingSkills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recommendation Note */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#eadcc9] text-[11px] text-[#572d12]">
                        <p className="font-semibold">{jm.recommendation}</p>
                      </div>
                    </div>

                    {/* Bottom Action: Find matching openings */}
                    <div className="pt-3 border-t border-[#eadcc9] flex items-center justify-between">
                      <span className="text-[11px] text-[#78716c]">
                        Google Jobs • Adzuna • AICTE
                      </span>
                      <Link
                        href={`/jobs`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#d97706] hover:text-[#b45309] hover:underline cursor-pointer"
                      >
                        <span>Find {jm.profile.title} Jobs</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
