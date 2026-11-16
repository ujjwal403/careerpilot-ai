'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Resume } from '@/types'
import type { ResumeExtractedData } from '@/types/resume-extractor'
import { ExtractedResumeBreakdown } from './ExtractedResumeBreakdown'
import { DataVerificationModal } from './DataVerificationModal'
import { ATSCompatibilityReport } from './ATSCompatibilityReport'
import { SimpleATSScanner } from './SimpleATSScanner'
import { evaluateATSCompatibility, type ATSScorerResult } from '@/lib/ats-scorer'
import {
  FileText,
  FileUp,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Globe,
  Link2,
  ShieldCheck,
  Edit3,
} from 'lucide-react'

interface ResumeManagerProps {
  initialResume: Resume | null
  userId?: string
}

export function ResumeManager({ initialResume, userId }: ResumeManagerProps) {
  const [resume, setResume] = useState<Resume | null>(initialResume)
  const [activeTab, setActiveTab] = useState<'scanner' | 'ats' | 'extracted' | 'upload'>('scanner')
  const [uploadMethod, setUploadMethod] = useState<'drive' | 'profile'>('drive')
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [syncingProfile, setSyncingProfile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [driveUrl, setDriveUrl] = useState('')
  const [importingDrive, setImportingDrive] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSyncFromProfile = async () => {
    setSyncingProfile(true)
    setMessage(null)
    try {
      const res = await fetch('/api/resume/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to sync with profile.')
      }
      if (data.resume) {
        setResume(data.resume)
        setMessage({
          type: 'success',
          text: 'Resume successfully updated from your Profile credentials (College, Degree, CGPA, Branch, Skills)!',
        })
        setActiveTab('ats')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update resume from profile.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSyncingProfile(false)
    }
  }

  const processFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 10MB.' })
      return
    }

    const validExts = ['pdf', 'docx', 'doc']
    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''

    if (!validExts.includes(fileExt)) {
      setMessage({ type: 'error', text: 'Invalid file format. Please upload a .pdf or .docx file.' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to upload resume. Please check your file and try again.',
        })
        return
      }

      if (data.resume) {
        setResume(data.resume)
        setMessage({
          type: 'success',
          text: `Resume "${file.name}" uploaded successfully! Review and verify your extracted details below.`,
        })
        setShowVerifyModal(true)
        setActiveTab('ats')
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload resume. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleExtractExisting = async (resumeId: string, force = false) => {
    try {
      setExtracting(true)
      const res = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, force }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.resume) {
          setResume(json.resume)
        } else if (json.extractedData && resume) {
          setResume({
            ...resume,
            ai_feedback: {
              ...((resume.ai_feedback as Record<string, unknown>) || {}),
              extracted_data: json.extractedData,
            },
          })
        }
        setMessage({ type: 'success', text: 'Resume details extracted and verified!' })
      }
    } catch {
      // Quietly ignore background re-extract failure
    } finally {
      setExtracting(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const existingFeedback = resume?.ai_feedback as { extracted_data?: ResumeExtractedData } | null
    const hasDummyData =
      existingFeedback?.extracted_data?.experience?.[0]?.company_name === 'Tech Innovators Pvt Ltd' ||
      existingFeedback?.extracted_data?.education?.[0]?.college_name === 'Indian Institute of Information Technology' ||
      existingFeedback?.extracted_data?.education?.[0]?.college_name === 'Indian Institute of Information Technology (IIIT)'

    if (resume?.id && (!existingFeedback?.extracted_data || hasDummyData)) {
      const timer = setTimeout(() => {
        if (isMounted) {
          handleExtractExisting(resume.id, hasDummyData)
        }
      }, 50)
      return () => {
        isMounted = false
        clearTimeout(timer)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume?.id])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFileUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFileUpload(file)
  }

  const handleDriveImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driveUrl.trim()) {
      setMessage({ type: 'error', text: 'Please paste a Google Drive file link.' })
      return
    }

    setImportingDrive(true)
    setMessage(null)

    try {
      const res = await fetch('/api/resume/import-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveUrl: driveUrl.trim() }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'Failed to import from Google Drive.' })
        return
      }

      if (data.resume) {
        setResume(data.resume)
        setDriveUrl('')
        setMessage({
          type: 'success',
          text: `Resume "${data.resume.file_name}" imported successfully from Google Drive!`,
        })
        setShowVerifyModal(true)
        setActiveTab('ats')
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred while importing. Please try again.' })
    } finally {
      setImportingDrive(false)
    }
  }

  const handleReanalyze = async () => {
    if (!resume) return
    setAnalyzing(true)
    setMessage(null)

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: resume.id }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMessage({ type: 'error', text: data.error || 'Failed to analyze resume.' })
        return
      }

      if (data.resume) {
        setResume(data.resume)
        setMessage({
          type: 'success',
          text: 'ATS performance analysis updated successfully.',
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'Analysis failed. Please try again.' })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!resume) return
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('resumes').delete().eq('id', resume.id)
      if (error) throw error

      setResume(null)
      setActiveTab('upload')
      setMessage({ type: 'success', text: 'Resume deleted successfully.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete resume.' })
    }
  }

  const handleDownload = async () => {
    if (!resume) return
    setDownloading(true)

    try {
      if (resume.file_url) {
        window.open(resume.file_url, '_blank')
      } else {
        setMessage({ type: 'error', text: 'No file URL found for this resume.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not access file. Please check permissions.' })
    } finally {
      setDownloading(false)
    }
  }

  const keywords = resume?.ai_keywords?.length
    ? resume.ai_keywords
    : ['React', 'TypeScript', 'Next.js', 'PostgreSQL', 'APIs', 'Docker', 'Tailwind', 'Git']

  const extractedData = (
    resume?.ai_feedback as { extracted_data?: ResumeExtractedData } | null
  )?.extracted_data

  const atsReport: ATSScorerResult | null = (() => {
    if (!resume) return null
    const fb = resume.ai_feedback as { ats_report?: ATSScorerResult; extracted_data?: ResumeExtractedData } | null
    if (fb?.ats_report) {
      return fb.ats_report
    }
    if (extractedData) {
      return evaluateATSCompatibility(resume.content || '', extractedData)
    }
    if (resume.content) {
      return evaluateATSCompatibility(resume.content, {
        contact: {
          name: '',
          email: '',
          phone: '',
          city: '',
          linkedin_url: '',
        },
        education: [],
        skills: { hard_skills: resume.ai_keywords || [], soft_skills: [] },
        experience: [],
        projects: [],
        certifications: [],
        extracted_at: new Date().toISOString(),
      })
    }
    return null
  })()

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#29231e]">
      {/* Alert Banner */}
      {message && (
        <div
          className={`flex items-start gap-2.5 p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Resume Header Card (Clean Warm Sand - No dark boxes) */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] border border-[#eadcc9] text-[#2563eb] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#572d12]">
                  {resume ? resume.title : 'No Resume Uploaded Yet'}
                </h2>
                {resume && (
                  <span className="text-[11px] font-bold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
                    Active Primary
                  </span>
                )}
              </div>
              <p className="text-xs text-[#635b52] mt-0.5">
                {resume
                  ? `${resume.file_name} • ${(Number(resume.file_size || 0) / (1024 * 1024)).toFixed(2)} MB`
                  : 'Upload your CV in PDF/DOCX or sync directly from your verified Career Profile.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {extractedData && (
              <button
                type="button"
                onClick={() => setShowVerifyModal(true)}
                className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
                title="Verify and edit AI-extracted information"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>Verify AI Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSyncFromProfile}
              disabled={syncingProfile}
              className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
              title="Update your resume details directly from your Profile (College, Degree, CGPA, Branch, Skills)"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2563eb] ${syncingProfile ? 'animate-spin' : ''}`} />
              <span>{syncingProfile ? 'Syncing...' : 'Update from Profile'}</span>
            </button>

            {resume && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="pavitra-btn pavitra-btn-light pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download</span>
              </button>
            )}

            {resume && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 rounded-xl border border-[#eadcc9] hover:border-rose-300 hover:bg-rose-50 text-[#78716c] hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Section Tabs - No huge vertical clutter */}
        <div className="pt-4 border-t border-[#eadcc9] flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl border border-[#eadcc9] bg-[#eff6ff] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ ATS Score & Job Match</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>10-Rule ATS Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('extracted')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'extracted'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Extracted CV Data</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload & Sync CV</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#78716c] font-semibold hidden sm:block">
            Targeting Indian MNC & Product Benchmarks
          </div>
        </div>
      </div>

      {/* TAB 0: Simple ATS Score & Job Profile Matcher */}
      {activeTab === 'scanner' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SimpleATSScanner
            initialResumeText={resume?.content || ''}
            initialSkills={keywords}
          />
        </div>
      )}

      {/* TAB 1: ATS Compatibility Audit */}
      {activeTab === 'ats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {resume && atsReport ? (
            <>
              <ATSCompatibilityReport
                report={atsReport}
                onOpenVerification={() => setShowVerifyModal(true)}
                onReanalyze={handleReanalyze}
                isAnalyzing={analyzing || extracting}
              />

              {/* Keywords Tag Cloud (Warm Pavitra Style) */}
              <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#572d12]">
                    ATS Extracted Keywords ({keywords.length})
                  </span>
                  <span className="text-[11px] text-[#78716c]">High Correlation for Tech Roles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#eff6ff] border border-[#eadcc9] text-[#572d12]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : resume && !atsReport ? (
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-8 text-center space-y-4 shadow-xs">
              <TrendingUp className="w-10 h-10 text-[#2563eb] mx-auto" />
              <div>
                <h3 className="text-lg font-extrabold text-[#572d12]">ATS Scoring Engine Ready</h3>
                <p className="text-xs text-[#635b52] mt-1 max-w-md mx-auto">
                  Run our 10-rule ATS evaluation to measure contact completeness, campus metrics, active verbs, and structural scannability.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReanalyze}
                disabled={analyzing}
                className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-2 font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Scanning...' : 'Run 10-Rule ATS Audit'}</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-10 text-center space-y-4 shadow-xs">
              <FileUp className="w-10 h-10 text-[#2563eb] mx-auto" />
              <div>
                <h3 className="text-lg font-extrabold text-[#572d12]">No Resume Uploaded</h3>
                <p className="text-xs text-[#635b52] mt-1 max-w-md mx-auto">
                  Please upload your CV or sync from your Career Profile to see your comprehensive ATS compatibility score.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-2 font-bold cursor-pointer"
              >
                <span>Upload or Sync CV Now</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Extracted CV Data */}
      {activeTab === 'extracted' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {extracting && (
            <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-6 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#2563eb] animate-spin shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-[#572d12]">AI Extracting Resume Details...</h4>
                  <p className="text-xs text-[#635b52]">
                    Parsing Contact Info, Campus Academics (CGPA), Hard/Soft Skills, Experience & Projects.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!extracting && extractedData && (
            <ExtractedResumeBreakdown
              data={extractedData}
              userId={userId}
              resumeId={resume?.id}
              isExtracting={extracting}
              onReextract={() => resume?.id && handleExtractExisting(resume.id, true)}
              onProfileSynced={() => {
                setMessage({
                  type: 'success',
                  text: 'Profile synced with your extracted resume data!',
                })
              }}
            />
          )}

          {!extracting && !extractedData && resume && (
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-8 text-center space-y-4 shadow-xs">
              <Sparkles className="w-10 h-10 text-[#2563eb] mx-auto" />
              <div>
                <h4 className="text-base font-bold text-[#572d12]">AI Information Extraction Ready</h4>
                <p className="text-xs text-[#635b52] mt-1 max-w-md mx-auto">
                  Extract Contact Info, College, CGPA / Percentage, Hard & Soft Skills, Experience, and Projects from your CV.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleExtractExisting(resume.id)}
                className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <span>Extract Details Now</span>
              </button>
            </div>
          )}

          {!resume && (
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-10 text-center space-y-4 shadow-xs">
              <FileUp className="w-10 h-10 text-[#2563eb] mx-auto" />
              <div>
                <h3 className="text-lg font-extrabold text-[#572d12]">Upload Required</h3>
                <p className="text-xs text-[#635b52] mt-1 max-w-md mx-auto">
                  Upload your CV to see parsed contact, college, skills, and experience details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className="pavitra-btn pavitra-btn-sm inline-flex items-center gap-2 font-bold cursor-pointer"
              >
                <span>Go to Upload</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Upload & Sync CV */}
      {activeTab === 'upload' && (
        <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#572d12]">
              Upload or Replace Resume
            </h3>
            <p className="text-xs sm:text-sm text-[#635b52] mt-1">
              Choose your preferred method to import your resume into the evaluation engine.
            </p>
          </div>

          {/* Upload Methods Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUploadMethod('drive')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                uploadMethod === 'drive'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'bg-[#eff6ff] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Drive Import</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('profile')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                uploadMethod === 'profile'
                  ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                  : 'bg-[#eff6ff] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sync from Career Profile</span>
            </button>
          </div>

          {/* Method B: Google Drive link paste */}
          {uploadMethod === 'drive' && (
            <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-6 space-y-4">
              <form onSubmit={handleDriveImport} className="space-y-3">
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="Paste public Google Drive link (e.g. https://drive.google.com/file/d/.../view)"
                    disabled={importingDrive}
                    className="w-full pl-10 pr-32 py-3 rounded-xl border border-[#eadcc9] bg-white text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="submit"
                    disabled={importingDrive || !driveUrl.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 pavitra-btn pavitra-btn-sm font-bold disabled:opacity-40"
                  >
                    {importingDrive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <span>Import File</span>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-xs text-[#635b52] space-y-1 bg-white p-4 rounded-xl border border-[#eadcc9]">
                <p className="font-bold text-[#572d12]">How to import via Google Drive:</p>
                <p>1. In Google Drive, right click your resume → click <strong className="text-[#572d12]">Share</strong>.</p>
                <p>2. Under General access, select <strong className="text-[#2563eb]">&quot;Anyone with the link&quot;</strong> (Viewer).</p>
                <p>3. Click <strong className="text-[#572d12]">Copy link</strong> and paste it above.</p>
              </div>
            </div>
          )}

          {/* Method C: Sync from Profile */}
          {uploadMethod === 'profile' && (
            <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#572d12]">Generate or Update Resume from Profile</h4>
                  <span className="text-[10px] font-bold text-[#2563eb] bg-[#eff6ff] border border-[#eadcc9] px-2 py-0.5 rounded-full">
                    Instant ATS Sync
                  </span>
                </div>
                <p className="text-xs text-[#635b52] max-w-xl">
                  Pulls your verified College Name, Degree, Branch, CGPA, Passing Year, Technical Skills, and Contact Info directly from your Profile into your primary ATS resume.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncFromProfile}
                disabled={syncingProfile}
                className="pavitra-btn pavitra-btn-sm font-bold inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingProfile ? 'animate-spin' : ''}`} />
                <span>{syncingProfile ? 'Updating...' : 'Update Resume Now'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Data Verification Modal */}
      {showVerifyModal && extractedData && (
        <DataVerificationModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          initialData={extractedData}
          resumeId={resume?.id}
          onSaveSuccess={(verified, newAtsReport) => {
            if (resume) {
              const currentFeedback = (resume.ai_feedback as Record<string, unknown>) || {}
              setResume({
                ...resume,
                ai_score: newAtsReport?.totalScore || resume.ai_score,
                ai_feedback: {
                  ...currentFeedback,
                  extracted_data: verified,
                  ...(newAtsReport ? { ats_report: newAtsReport } : {}),
                } as unknown as Resume['ai_feedback'],
              })
            }
            setMessage({
              type: 'success',
              text: 'Verified resume details successfully saved to your profile!',
            })
          }}
        />
      )}
    </div>
  )
}
