'use client'

import { useState } from 'react'
import type { ResumeExtractedData } from '@/types/resume-extractor'
import type { ATSScorerResult } from '@/lib/ats-scorer'
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  User,
  MapPin,
  Link2,
  Globe,
  Code2,
  Plus,
  Briefcase,
  ArrowRight,
} from 'lucide-react'

interface DataVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: ResumeExtractedData
  resumeId?: string
  onSaveSuccess: (updatedData: ResumeExtractedData, atsReport?: ATSScorerResult | null) => void
}

const COMMON_SKILL_SUGGESTIONS = [
  'React',
  'Next.js',
  'TypeScript',
  'Node.js',
  'Python',
  'Tailwind CSS',
  'PostgreSQL',
  'MongoDB',
  'Docker',
  'AWS',
  'Git',
  'REST APIs',
] as const

export function DataVerificationModal({
  isOpen,
  onClose,
  initialData,
  resumeId,
  onSaveSuccess,
}: DataVerificationModalProps) {
  // Form State
  const [activeTab, setActiveTab] = useState<'academics' | 'skills' | 'contact' | 'experience'>('academics')

  // Contact info
  const [name, setName] = useState(initialData.contact?.name || '')
  const [email, setEmail] = useState(initialData.contact?.email || '')
  const [phone, setPhone] = useState(initialData.contact?.phone || '')
  const [city, setCity] = useState(initialData.contact?.city || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.contact?.linkedin_url || '')
  const [githubUrl, setGithubUrl] = useState(initialData.contact?.github_url || '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialData.contact?.portfolio_url || '')

  // Education info (first entry)
  const firstEdu = initialData.education?.[0]
  const [collegeName, setCollegeName] = useState(firstEdu?.college_name || '')
  const [degree, setDegree] = useState(firstEdu?.degree || '')
  const [fieldOfStudy, setFieldOfStudy] = useState(firstEdu?.field_of_study || '')
  const [score, setScore] = useState(firstEdu?.score || '')
  const [graduationYear, setGraduationYear] = useState(firstEdu?.graduation_year || '')

  // Skills
  const [skillsList, setSkillsList] = useState<string[]>(initialData.skills?.hard_skills || [])
  const [newSkillInput, setNewSkillInput] = useState('')

  // Experience summary (first entry)
  const firstExp = initialData.experience?.[0]
  const [recentRole, setRecentRole] = useState(firstExp?.role_title || '')
  const [recentCompany, setRecentCompany] = useState(firstExp?.company_name || '')
  const [duration, setDuration] = useState(firstExp?.duration || '')

  // Status
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  if (!isOpen) return null

  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkillInput).trim()
    if (!s) return
    if (!skillsList.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkillsList([...skillsList, s])
    }
    setNewSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove))
  }

  const handleSaveAndContinue = async () => {
    setSaving(true)
    setErrorMsg(null)

    const updatedData: ResumeExtractedData = {
      ...initialData,
      contact: {
        ...initialData.contact,
        name: name.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        github_url: githubUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      },
      education: [
        {
          college_name: collegeName.trim() || 'Not specified',
          degree: degree.trim() || 'Degree',
          field_of_study: fieldOfStudy.trim() || null,
          score: score.trim() || null,
          graduation_year: graduationYear.trim() || null,
        },
        ...(initialData.education?.slice(1) || []),
      ],
      skills: {
        ...initialData.skills,
        hard_skills: skillsList,
        soft_skills: initialData.skills?.soft_skills || [],
      },
      experience: firstExp
        ? [
            {
              ...firstExp,
              role_title: recentRole.trim() || firstExp.role_title,
              company_name: recentCompany.trim() || firstExp.company_name,
              duration: duration.trim() || firstExp.duration,
            },
            ...(initialData.experience?.slice(1) || []),
          ]
        : initialData.experience || [],
      extracted_at: new Date().toISOString(),
    }

    try {
      const res = await fetch('/api/resume/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId,
          extractedData: updatedData,
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to save verified data.')
      }

      setSavedSuccess(true)
      onSaveSuccess(updatedData, json.atsReport || null)
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving.'
      setErrorMsg(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl border border-[#eadcc9] bg-white shadow-xl p-6 sm:p-8 space-y-6 text-[#29231e] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#eadcc9]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#fff3df] text-[#d97706] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              <span>Interactive Data Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#572d12]">
              Verify Extracted Resume Details
            </h2>
            <p className="text-xs sm:text-sm text-[#635b52] leading-relaxed max-w-xl">
              AI extraction can have minor discrepancies. Review your college name, CGPA, verified skills, or contact info before saving to your profile.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#635b52] hover:text-[#572d12] hover:bg-[#fffaf3] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#fffaf3] border border-[#eadcc9] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('academics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'academics'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs font-bold'
                : 'text-[#635b52] hover:text-[#572d12] hover:bg-[#fff3df]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academics & College</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs font-bold'
                : 'text-[#635b52] hover:text-[#572d12] hover:bg-[#fff3df]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Skills Inventory ({skillsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs font-bold'
                : 'text-[#635b52] hover:text-[#572d12] hover:bg-[#fff3df]'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact & Links</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'experience'
                ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-xs font-bold'
                : 'text-[#635b52] hover:text-[#572d12] hover:bg-[#fff3df]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Experience & Role</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-4 min-h-[280px]">
          {/* 1. Academics Tab */}
          {activeTab === 'academics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#572d12]">
                Ensure your college, branch, and CGPA match your official records for accurate ATS evaluation and profile syncing.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">College / University Name</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Indian Institute of Technology (IIT) Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Degree</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech, BCA, MCA, B.Sc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Branch / Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering (CSE)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">CGPA / Score / Percentage</label>
                  <input
                    type="text"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. 8.64 CGPA or 85%"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Graduation / Passing Year</label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#572d12]">Add an Extra Skill Tag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSkill()
                      }
                    }}
                    placeholder="Type skill name (e.g. GraphQL, Docker) and press Enter..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="pavitra-btn pavitra-btn-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#635b52]">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SKILL_SUGGESTIONS.filter((s) => !skillsList.includes(s)).slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="px-2.5 py-1 rounded-lg border border-[#eadcc9] bg-[#fff3df] hover:border-[#d97706] text-[#572d12] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Skills List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#635b52]">
                  <span className="font-bold text-[#572d12]">Verified Skills ({skillsList.length})</span>
                  <span className="text-[11px] text-[#78716c]">Click ✕ to remove any misclassified tag</span>
                </div>

                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3.5 rounded-2xl border border-[#eadcc9] bg-[#fffaf3]">
                  {skillsList.length === 0 ? (
                    <p className="text-xs text-[#78716c]">No skills added yet. Add key technologies above.</p>
                  ) : (
                    skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#eadcc9] bg-[#fff3df] text-[#572d12]"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#d97706] hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Contact & Links Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Candidate Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Location / City</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Portfolio Website</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Target Role / Professional Headline</label>
                  <input
                    type="text"
                    value={recentRole}
                    onChange={(e) => setRecentRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer / SDE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Most Recent Company / Organization</label>
                  <input
                    type="text"
                    value={recentCompany}
                    onChange={(e) => setRecentCompany(e.target.value)}
                    placeholder="e.g. TechCorp or Freelance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#572d12]">Experience Duration / Range</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. July 2024 - Present (or Fresher / 2026 Grad)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#d97706] focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback / Error Message */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Confirmation */}
        {savedSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] text-xs animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#166534]" />
            <span>Profile and resume successfully updated! Closing verification...</span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#eadcc9]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold w-full sm:w-auto"
          >
            Cancel / Keep As-Is
          </button>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={saving || savedSuccess}
            className="pavitra-btn pavitra-btn-sm font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
