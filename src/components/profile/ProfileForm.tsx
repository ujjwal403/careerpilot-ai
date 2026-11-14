'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Profile } from '@/types'
import {
  User as UserIcon,
  Phone,
  MapPin,
  Briefcase,
  Wrench,
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  DollarSign,
  Globe,
  Link2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Loader2,
  Landmark,
  Lock,
} from 'lucide-react'
import {
  COUNTRIES,
  INDIAN_STATES_AND_UTS,
  INDIAN_DEGREES,
  getCitiesForState,
  getUniversitiesForState,
  getSpecializationsForDegree,
} from '@/lib/data/india-data'
import { CollegeCombobox } from '@/components/common/CollegeCombobox'

interface ProfileFormProps {
  initialUser: User | null
  initialProfile: Profile | null
}

const COMMON_SKILLS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'C++',
  'SQL',
  'PostgreSQL',
  'Tailwind CSS',
  'Docker',
  'AWS',
  'FastAPI',
  'Git',
  'Data Structures & Algorithms',
] as const

export function ProfileForm({ initialUser, initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialUser?.full_name || '')
  const [headline, setHeadline] = useState(initialProfile?.headline || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  
  // Regional & Geographic Hierarchy
  const [country, setCountry] = useState(initialProfile?.country || 'India')
  const [state, setState] = useState(initialProfile?.state || '')
  const [city, setCity] = useState(initialProfile?.city || '')
  const [phone, setPhone] = useState(initialProfile?.phone || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '')
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '')

  // Indian Compensation (INR in LPA / Annual CTC)
  const [salaryMin, setSalaryMin] = useState(initialProfile?.desired_salary_min?.toString() || '600000')
  const [salaryMax, setSalaryMax] = useState(initialProfile?.desired_salary_max?.toString() || '1800000')
  const [openToWork, setOpenToWork] = useState(initialProfile?.open_to_work ?? true)
  const [roles, setRoles] = useState<string[]>(initialProfile?.desired_roles || ['Full Stack Engineer'])
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || ['React', 'TypeScript', 'Next.js', 'PostgreSQL'])

  // Academic & College Details
  const [collegeState, setCollegeState] = useState(initialProfile?.state || '')
  const [collegeName, setCollegeName] = useState(initialProfile?.college_name || '')
  const [degree, setDegree] = useState(initialProfile?.degree || 'B.Tech / B.E. (Bachelor of Technology / Engineering)')
  const [fieldOfStudy, setFieldOfStudy] = useState(initialProfile?.field_of_study || '')
  const [cgpa, setCgpa] = useState(initialProfile?.cgpa || '')
  const [passingYear, setPassingYear] = useState(
    initialProfile?.passing_year ? initialProfile.passing_year.toString() : ''
  )

  // Institutional Placement Locks: Basic identity and college/degree records cannot be changed once established
  const isIdentityLocked = Boolean(initialUser?.full_name && initialUser.full_name.trim().length > 0)
  const isAcademicsLocked = Boolean(initialProfile?.college_name && initialProfile.college_name.trim().length > 0)

  // Resume Synchronization State
  const [syncWithResume, setSyncWithResume] = useState(true)
  const [syncingResume, setSyncingResume] = useState(false)
  const [resumeSyncSuccess, setResumeSyncSuccess] = useState(false)

  const [newRole, setNewRole] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Dynamic lists based on selections
  const availableCities = useMemo(() => getCitiesForState(state), [state])
  const effectiveCollegeState = collegeState || state
  const availableUniversities = useMemo(() => getUniversitiesForState(effectiveCollegeState, city), [effectiveCollegeState, city])
  const availableSpecializations = useMemo(() => getSpecializationsForDegree(degree), [degree])

  // Handle Indian State selection change
  const handleStateChange = (newState: string) => {
    setState(newState)
    if (!collegeState || collegeState === state) {
      setCollegeState(newState)
    }
  }

  // Calculate completion percentage
  const calcScore = () => {
    let score = 0
    if (fullName) score += 10
    if (headline) score += 10
    if (state && city) score += 10
    if (collegeName && degree) score += 20 // academic presence
    if (cgpa && passingYear) score += 10
    if (skills.length > 0) score += 20
    if (roles.length > 0) score += 10
    if (bio || linkedinUrl) score += 10
    return Math.min(score, 100)
  }

  const completionScore = calcScore()
  const isAcademicsMissing = !collegeName || !passingYear || !cgpa

  const handleAddRole = (e?: React.FormEvent) => {
    e?.preventDefault()
    const r = newRole.trim()
    if (r && !roles.includes(r)) {
      setRoles([...roles, r])
      setNewRole('')
    }
  }

  const handleAddSkill = (skillToAdd?: string) => {
    const s = (skillToAdd || newSkill).trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setNewSkill('')
    }
  }

  // Explicitly trigger resume update from profile
  const handleSyncResumeExplicitly = async () => {
    setSyncingResume(true)
    setResumeSyncSuccess(false)
    setStatusMessage(null)

    const compiledLocation = [city, state, country].filter(Boolean).join(', ')

    try {
      const res = await fetch('/api/resume/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          headline,
          bio,
          location: compiledLocation,
          phone,
          linkedinUrl,
          githubUrl,
          portfolioUrl,
          collegeName,
          degree,
          fieldOfStudy,
          cgpa,
          passingYear,
          skills,
        }),
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Failed to update resume from profile.')
      }

      setResumeSyncSuccess(true)
      setStatusMessage({
        type: 'success',
        text: 'Your active resume has been successfully updated with your latest academic & regional placement details!',
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update resume from profile.'
      setStatusMessage({ type: 'error', text: msg })
    } finally {
      setSyncingResume(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMessage(null)

    try {
      const supabase = createClient()
      let activeUserId = initialUser?.id

      if (!activeUserId) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        activeUserId = authUser?.id
      }

      if (!activeUserId) {
        setStatusMessage({ type: 'error', text: 'You must be logged in to save profile changes.' })
        return
      }

      // 1. Ensure public.users row exists/is updated
      await supabase
        .from('users')
        .upsert(
          {
            id: activeUserId,
            email: initialUser?.email || '',
            full_name: fullName.trim(),
          },
          { onConflict: 'id' }
        )

      // 2. Format location string
      const compiledLocation = [city, state, country].filter(Boolean).join(', ')

      // 3. Upsert public.profiles (including regional and academic details)
      const parsedPassingYear = passingYear ? parseInt(passingYear.trim(), 10) : null

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: activeUserId,
            headline: headline.trim(),
            bio: bio.trim(),
            country: country.trim() || 'India',
            state: state.trim() || null,
            city: city.trim() || null,
            location: compiledLocation,
            phone: phone.trim(),
            linkedin_url: linkedinUrl.trim(),
            github_url: githubUrl.trim(),
            portfolio_url: portfolioUrl.trim(),
            desired_salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
            desired_salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
            open_to_work: openToWork,
            desired_roles: roles,
            skills: skills,
            profile_complete: completionScore,
            // Academic and Education details
            college_name: collegeName.trim() || null,
            degree: degree.trim() || null,
            field_of_study: fieldOfStudy.trim() || null,
            cgpa: cgpa.trim() || null,
            passing_year: isNaN(parsedPassingYear as number) ? null : parsedPassingYear,
          },
          { onConflict: 'user_id' }
        )

      if (profileError) {
        setStatusMessage({ type: 'error', text: profileError.message })
        return
      }

      // 4. Update active resume from profile if sync is enabled
      if (syncWithResume) {
        try {
          await fetch('/api/resume/sync-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName,
              headline,
              bio,
              location: compiledLocation,
              phone,
              linkedinUrl,
              githubUrl,
              portfolioUrl,
              collegeName,
              degree,
              fieldOfStudy,
              cgpa,
              passingYear,
              skills,
            }),
          })
          setResumeSyncSuccess(true)
        } catch {
          // Handled gracefully without blocking profile update
        }
      }

      setStatusMessage({
        type: 'success',
        text: syncWithResume
          ? 'Profile & Academic details saved! Active resume has been automatically updated with your latest Indian placement information.'
          : 'Profile & Academic details successfully saved!',
      })
      router.refresh()
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto text-[#29231e]">
      {/* Top Banner / Completion Card */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center font-black text-xl uppercase shrink-0">
            {fullName ? fullName.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#572d12]">{fullName || 'Your Name'}</h2>
              {openToWork && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse" />
                  Open to Work
                </span>
              )}
            </div>
            <p className="text-xs text-[#635b52] mt-0.5">
              {headline || (collegeName ? `${degree} • ${collegeName}` : 'Add your professional details')}
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="sm:text-right">
          <div className="flex items-center sm:justify-end gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            <span className="text-xs font-bold text-[#572d12]">Profile Strength: {completionScore}%</span>
          </div>
          <div className="w-48 h-2 bg-[#fff3df] border border-[#eadcc9] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#d97706] to-[#b45309] rounded-full transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Academic Onboarding Prompt Banner */}
      {isAcademicsMissing && (
        <div className="relative overflow-hidden rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#fff3df] border border-[#eadcc9] flex items-center justify-center text-[#d97706] shrink-0 mt-0.5 sm:mt-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#572d12]">Indian Campus & Placement Readiness</h4>
              <p className="text-xs text-[#635b52] mt-0.5">
                Companies and national portals (AICTE, NCS) require your State, College Name, Degree Course, CGPA/Percentage, and Passing Year.
              </p>
            </div>
          </div>
          <a
            href="#academics-section"
            className="pavitra-btn pavitra-btn-sm font-bold shrink-0"
          >
            Fill Academic Details
          </a>
        </div>
      )}

      {statusMessage && (
        <div
          className={`flex items-start gap-2.5 p-4 rounded-2xl border text-xs ${
            statusMessage.type === 'success'
              ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#166534] mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="font-semibold">{statusMessage.text}</span>
            {statusMessage.type === 'success' && (
              <a
                href="/resume"
                className="inline-flex items-center gap-1 font-bold text-[#d97706] hover:underline underline-offset-4 shrink-0"
              >
                <span>View Updated Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 1. Personal & Contact Information */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#eadcc9] pb-3">
          <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#d97706]" />
            <span>Basic Information</span>
          </h3>
          {isIdentityLocked && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ede3d7] border border-[#eadcc9] text-[#572d12]">
              <Lock className="w-3 h-3 text-[#d97706]" />
              Identity Record Locked
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">Full Name</label>
              {isIdentityLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            <input
              type="text"
              value={fullName}
              disabled={isIdentityLocked}
              readOnly={isIdentityLocked}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                isIdentityLocked
                  ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                  : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
              }`}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">Headline / Role Summary</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              placeholder="e.g. B.Tech Computer Science Graduate | Full Stack Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">Country</label>
              {isIdentityLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            <select
              value={country}
              disabled={isIdentityLocked}
              onChange={(e) => setCountry(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                isIdentityLocked
                  ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                  : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
              }`}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'India' ? '🇮🇳 India' : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                State / Union Territory {country === 'India' && <span className="text-[#d97706]">*</span>}
              </label>
              {isIdentityLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            {country === 'India' ? (
              <select
                value={state}
                disabled={isIdentityLocked}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                  isIdentityLocked
                    ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                    : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
                }`}
              >
                <option value="">-- Select Your State / UT --</option>
                {INDIAN_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={state}
                disabled={isIdentityLocked}
                readOnly={isIdentityLocked}
                onChange={(e) => setState(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                  isIdentityLocked
                    ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                    : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
                }`}
                placeholder="State or Province"
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                City / Tech Hub {country === 'India' && <span className="text-[#d97706]">*</span>}
              </label>
              {isIdentityLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="text"
                list="indian-cities-list"
                value={city}
                disabled={isIdentityLocked}
                readOnly={isIdentityLocked}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                  isIdentityLocked
                    ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                    : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
                }`}
                placeholder={state ? `e.g. ${availableCities[0] || 'City'}` : 'Select state or type city'}
              />
              <datalist id="indian-cities-list">
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName} />
                ))}
              </datalist>
            </div>
            {state && availableCities.length > 0 && !isIdentityLocked && (
              <p className="text-[11px] text-[#78716c] mt-1">
                Popular hubs in {state}: {availableCities.slice(0, 4).join(', ')}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">Professional Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706] resize-none"
            placeholder="Tell recruiters about your background, projects, academic honors, and career goals..."
          />
        </div>
      </div>

      {/* 2. Education & Academic Details (Dynamic State -> University & Course) */}
      <div id="academics-section" className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eadcc9] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#d97706]" />
              <span>Education & Academics (India Placement Standard)</span>
            </h3>
            <p className="text-xs text-[#78716c] mt-0.5">
              Accredited degree, college, branch, CGPA, and passing year matching campus recruitment drives.
            </p>
          </div>
          {isAcademicsLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ede3d7] border border-[#eadcc9] text-[#572d12] self-start sm:self-auto">
              <Lock className="w-3.5 h-3.5 text-[#d97706]" />
              Academic Record Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#fff3df] border border-[#eadcc9] text-[#d97706] self-start sm:self-auto">
              <Landmark className="w-3.5 h-3.5" />
              AICTE & Campus Filter Ready
            </span>
          )}
        </div>

        {/* Lock Notice Banner */}
        {isAcademicsLocked && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#572d12]">
            <Lock className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Institutional Record Fixed:</strong> In accordance with Indian university placement standards, your registered college, degree, and specialization cannot be changed once established.
              <span className="text-[#166534] font-semibold block mt-1">
                ✓ You can freely update your latest CGPA/SGPA and graduation year as new semester scorecards arrive.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* College State Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                College Location / State <span className="text-[#d97706]">*</span>
              </label>
              {isAcademicsLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Locked
                </span>
              )}
            </div>
            <select
              value={effectiveCollegeState}
              disabled={isAcademicsLocked}
              onChange={(e) => setCollegeState(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                isAcademicsLocked
                  ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                  : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
              }`}
            >
              <option value="">-- Select College State --</option>
              {INDIAN_STATES_AND_UTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#78716c] mt-1">
              Filter universities and colleges in this state
            </p>
          </div>

          {/* College / University Name with Interactive Combobox */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                College / University Name <span className="text-[#d97706]">*</span>
              </label>
              {isAcademicsLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            <CollegeCombobox
              value={collegeName}
              disabled={isAcademicsLocked}
              onChange={(val) => setCollegeName(val)}
              colleges={availableUniversities}
              selectedState={effectiveCollegeState}
              placeholder={
                effectiveCollegeState
                  ? `Click to browse ${availableUniversities.length} colleges in ${effectiveCollegeState}...`
                  : 'Click to browse all Indian colleges or type...'
              }
            />
            <p className="text-[11px] text-[#78716c] mt-1">
              Showing {availableUniversities.length} accredited institutions {effectiveCollegeState ? `in ${effectiveCollegeState}` : 'across India'}
            </p>
          </div>

          {/* Degree / Course Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                Degree / Program <span className="text-[#d97706]">*</span>
              </label>
              {isAcademicsLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Locked
                </span>
              )}
            </div>
            <select
              value={degree}
              disabled={isAcademicsLocked}
              onChange={(e) => {
                setDegree(e.target.value)
                const specs = getSpecializationsForDegree(e.target.value)
                if (specs.length > 0 && !specs.includes(fieldOfStudy)) {
                  setFieldOfStudy(specs[0])
                }
              }}
              className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                isAcademicsLocked
                  ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                  : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
              }`}
            >
              {INDIAN_DEGREES.map((deg) => (
                <option key={deg} value={deg}>
                  {deg}
                </option>
              ))}
            </select>
          </div>

          {/* Branch / Specialization (Cascaded from Degree) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                Branch / Specialization <span className="text-[#d97706]">*</span>
              </label>
              {isAcademicsLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#78716c] bg-[#ede3d7] px-2 py-0.5 rounded-md">
                  <Lock className="w-2.5 h-2.5 text-[#78716c]" /> Permanent
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                list="branch-specializations-list"
                value={fieldOfStudy}
                disabled={isAcademicsLocked}
                readOnly={isAcademicsLocked}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] text-xs sm:text-sm transition-colors ${
                  isAcademicsLocked
                    ? 'bg-[#f7f2eb] text-[#635b52] cursor-not-allowed select-none'
                    : 'bg-[#fffaf3] text-[#29231e] focus:outline-hidden focus:border-[#d97706]'
                }`}
                placeholder="e.g. Computer Science & Engineering (CSE)"
              />
              <datalist id="branch-specializations-list">
                {availableSpecializations.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>
            <p className="text-[11px] text-[#78716c] mt-1">
              Select or type your academic stream/major
            </p>
          </div>

          {/* CGPA / Percentage (FREELY EDITABLE) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                CGPA / SGPA / Percentage <span className="text-[#d97706]">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3 text-[#166534]" /> Editable Every Semester
              </span>
            </div>
            <div className="relative">
              <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="text"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="e.g. 8.75 / 10 CGPA or 85%"
              />
            </div>
            <p className="text-[11px] text-[#78716c] mt-1">
              Screening threshold for corporate & PSU eligibility
            </p>
          </div>

          {/* Passing / Graduation Year (FREELY EDITABLE) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#572d12] uppercase tracking-wider">
                Graduation / Passing Year <span className="text-[#d97706]">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-[#166534]" /> Editable
              </span>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="number"
                min="2012"
                max="2032"
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="e.g. 2025"
              />
            </div>
            <p className="text-[11px] text-[#78716c] mt-1">
              Used to match Batch 2024, 2025, 2026 hiring drives
            </p>
          </div>
        </div>
      </div>

      {/* 3. Resume Synchronization Card */}
      <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eadcc9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#572d12]">Resume Placement Synchronization</h3>
                {resumeSyncSuccess && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]">
                    <CheckCircle2 className="w-3 h-3" />
                    Resume Synced
                  </span>
                )}
              </div>
              <p className="text-xs text-[#635b52] mt-0.5">
                Automatically formats and injects your University, Degree, Branch, CGPA, and Location into your active ATS resume.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncResumeExplicitly}
            disabled={syncingResume}
            className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d97706] ${syncingResume ? 'animate-spin' : ''}`} />
            <span>{syncingResume ? 'Updating Resume...' : 'Update Resume Now'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-sm font-bold text-[#572d12] block">Auto-Sync with Primary Resume</span>
            <span className="text-xs text-[#78716c]">
              When enabled, saving this profile instantly refreshes your primary resume file for recruiter queries.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSyncWithResume(!syncWithResume)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              syncWithResume ? 'bg-[#d97706]' : 'bg-[#e5e7eb]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                syncWithResume ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Target Roles & Skills */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-[#d97706]" />
            <span>Target Roles</span>
          </h3>
          <p className="text-xs text-[#78716c] mb-3">Roles matched with incoming Google Jobs, Adzuna India, AICTE & NCS feeds</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff3df] border border-[#eadcc9] text-[#d97706] text-xs font-bold"
              >
                {r}
                <button
                  type="button"
                  onClick={() => setRoles(roles.filter((item) => item !== r))}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Add another role (e.g. AI / ML Engineer, Java Developer)..."
              className="flex-1 px-4 py-2 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
            />
            <button
              type="button"
              onClick={() => handleAddRole()}
              className="px-4 py-2 rounded-xl bg-[#572d12] hover:bg-[#3d1f0c] text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Technical Skills Section */}
        <div className="pt-4 border-t border-[#eadcc9]">
          <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-[#d97706]" />
            <span>Technical Skills</span>
          </h3>
          <p className="text-xs text-[#78716c] mb-3">Core competencies for ATS benchmark calculation and recruiter screening</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fffaf3] border border-[#eadcc9] text-[#572d12] text-xs font-semibold"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((item) => item !== s))}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Spring Boot, PyTorch, Next.js, Redis)..."
              className="flex-1 px-4 py-2 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-4 py-2 rounded-xl bg-[#572d12] hover:bg-[#3d1f0c] text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-[#78716c] block mb-2 uppercase tracking-wider">Quick Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#eadcc9] bg-[#fffdfa] text-[#572d12] hover:bg-[#fff3df] hover:border-[#d97706] transition-colors cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Compensation & Availability (Indian INR Format in LPA) */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#d97706]" />
          <span>Expected CTC & Placement Availability (₹ INR)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
              Desired Minimum Salary (₹ Annual / LPA)
            </label>
            <input
              type="number"
              step="50000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              placeholder="e.g. 600000 (6 LPA)"
            />
            <p className="text-[11px] text-[#78716c] mt-1">
              ₹{(parseInt(salaryMin || '0', 10) / 100000).toFixed(1)} Lakhs per Annum (LPA)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
              Desired Target Salary (₹ Annual / LPA)
            </label>
            <input
              type="number"
              step="50000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              placeholder="e.g. 1800000 (18 LPA)"
            />
            <p className="text-[11px] text-[#78716c] mt-1">
              ₹{(parseInt(salaryMax || '0', 10) / 100000).toFixed(1)} Lakhs per Annum (LPA)
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#eadcc9]">
          <div>
            <span className="text-sm font-bold text-[#572d12] block">Open to Work / Campus Drives</span>
            <span className="text-xs text-[#78716c]">Signals to recruiters and placement coordinators that you are actively interviewing</span>
          </div>
          <button
            type="button"
            onClick={() => setOpenToWork(!openToWork)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              openToWork ? 'bg-[#d97706]' : 'bg-[#e5e7eb]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                openToWork ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6. Professional Links */}
      <div className="rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#572d12] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#d97706]" />
          <span>Professional & Code Portfolios</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">LinkedIn URL</label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">GitHub / GitLab</label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">Portfolio / Live Demos</label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="https://myportfolio.dev"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button & Resume Sync Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleSyncResumeExplicitly}
          disabled={syncingResume}
          className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-4 h-4 text-[#d97706]" />
          <span>Update Resume from Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="submit"
          disabled={loading}
          className="pavitra-btn pavitra-btn-primary font-bold w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Academic Profile...</span>
            </>
          ) : (
            <>
              <span>Save Profile & Sync Resume</span>
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
