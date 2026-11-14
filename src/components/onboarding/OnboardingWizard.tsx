'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import {
  GraduationCap,
  BookOpen,
  MapPin,
  Briefcase,
  Wrench,
  FileUp,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  FileText,
  AlertCircle,
  Link2,
  Award,
  Calendar,
  Landmark,
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

const SUGGESTED_ROLES = [
  'Full Stack Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Java / Spring Developer',
  'Python Developer',
  'AI / Machine Learning Engineer',
  'Data Analyst / Scientist',
  'Cloud / DevOps Engineer',
  'Mobile Developer (Flutter / React Native)',
  'Software Engineer (SDE-1)',
] as const

const SUGGESTED_SKILLS = [
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
  'Data Structures & Algorithms',
  'Git',
  'REST APIs',
] as const

export function OnboardingWizard() {
  const router = useRouter()
  const { user } = useUser()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Regional & Academic Details
  const [country, setCountry] = useState('India')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [collegeState, setCollegeState] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [degree, setDegree] = useState('B.Tech / B.E. (Bachelor of Technology / Engineering)')
  const [fieldOfStudy, setFieldOfStudy] = useState('Computer Science & Engineering (CSE)')
  const [cgpa, setCgpa] = useState('')
  const [passingYear, setPassingYear] = useState('2025')

  // Step 2 & 3: Roles & Skills
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [customRole, setCustomRole] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')

  // Step 4: Resume
  const [uploadMethod, setUploadMethod] = useState<'direct' | 'drive'>('direct')
  const [isDragging, setIsDragging] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [driveUrl, setDriveUrl] = useState('')
  const [importingDrive, setImportingDrive] = useState(false)
  const [importedResumeTitle, setImportedResumeTitle] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dynamic calculations
  const availableCities = useMemo(() => getCitiesForState(state), [state])
  const effectiveCollegeState = collegeState || state
  const availableUniversities = useMemo(() => getUniversitiesForState(effectiveCollegeState, city), [effectiveCollegeState, city])
  const availableSpecializations = useMemo(() => getSpecializationsForDegree(degree), [degree])

  const handleStateChange = (newState: string) => {
    setState(newState)
    if (!collegeState || collegeState === state) {
      setCollegeState(newState)
    }
  }

  // Role toggle & add
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const addCustomRole = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = customRole.trim()
    if (trimmed && !selectedRoles.includes(trimmed)) {
      setSelectedRoles((prev) => [...prev, trimmed])
      setCustomRole('')
    }
  }

  // Skill toggle & add
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const addCustomSkill = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = customSkill.trim()
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed])
      setCustomSkill('')
    }
  }

  // File validation & drop handler
  const validateAndSetFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]
    const validExts = ['pdf', 'docx', 'doc']
    const ext = file.name.split('.').pop()?.toLowerCase() || ''

    if (!validTypes.includes(file.type) && !validExts.includes(ext)) {
      setError('Invalid file type. Only PDF and DOCX files are supported.')
      return
    }

    setError(null)
    setResumeFile(file)
    setImportedResumeTitle(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  // Google Drive import
  const handleDriveImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driveUrl.trim()) {
      setError('Please paste a public Google Drive link.')
      return
    }

    setImportingDrive(true)
    setError(null)

    try {
      const res = await fetch('/api/resume/import-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveUrl: driveUrl.trim() }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to import resume from Google Drive.')
        return
      }

      if (data.resume) {
        setImportedResumeTitle(data.resume.file_name)
        setResumeFile(null)
        setDriveUrl('')
      }
    } catch {
      setError('An unexpected error occurred while importing from Google Drive. Please try again.')
    } finally {
      setImportingDrive(false)
    }
  }

  // Finish Onboarding
  const handleComplete = async (skipResume = false) => {
    if (!user) {
      router.push('/dashboard')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const hasResume = (resumeFile || importedResumeTitle) && !skipResume
      const parsedGradYear = passingYear ? parseInt(passingYear.trim(), 10) : null
      const compiledLocation = [city, state, country].filter(Boolean).join(', ')

      // 1. Update Profile (academic + regional + roles + skills)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            country: country.trim() || 'India',
            state: state.trim() || null,
            city: city.trim() || null,
            location: compiledLocation || null,
            college_name: collegeName.trim() || null,
            degree: degree.trim() || null,
            field_of_study: fieldOfStudy.trim() || null,
            cgpa: cgpa.trim() || null,
            passing_year: isNaN(parsedGradYear as number) ? null : parsedGradYear,
            desired_roles: selectedRoles.length > 0 ? selectedRoles : ['Full Stack Engineer'],
            skills: selectedSkills.length > 0 ? selectedSkills : ['React', 'Python', 'SQL'],
            profile_complete: hasResume ? 85 : 65,
          },
          { onConflict: 'user_id' }
        )

      if (profileError) {
        setError(profileError.message)
      }

      // 2. Upload Resume if Method A direct file was provided
      if (resumeFile && !skipResume) {
        const formData = new FormData()
        formData.append('file', resumeFile)

        await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData,
        })
      }

      // 3. Auto-sync profile to resume
      try {
        await fetch('/api/resume/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: compiledLocation,
            collegeName,
            degree,
            fieldOfStudy,
            cgpa,
            passingYear,
            skills: selectedSkills,
          }),
        })
      } catch {
        // Continue
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. You can still continue to your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-[#eadcc9] bg-white p-6 sm:p-10 shadow-xs text-[#29231e] relative">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#eadcc9]">
        {[
          { num: 1, label: 'Academics & Region' },
          { num: 2, label: 'Target Roles' },
          { num: 3, label: 'Key Skills' },
          { num: 4, label: 'Resume' },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === num
                  ? 'bg-[#d97706] text-white shadow-xs'
                  : step > num
                  ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                  : 'bg-[#fffaf3] text-[#78716c] border border-[#eadcc9]'
              }`}
            >
              {step > num ? <Check className="w-3.5 h-3.5" /> : num}
            </span>
            <span
              className={`text-xs font-bold hidden sm:inline ${
                step === num ? 'text-[#572d12]' : 'text-[#78716c]'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-xs mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: REGIONAL & ACADEMIC INFO */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#fff3df] text-xs font-bold text-[#d97706] mb-3">
              <Landmark className="w-3.5 h-3.5" />
              <span>Indian Higher Education & Placement Filter</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">
              Where do you study or reside?
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c]">
              Selecting your state unlocks accredited Indian universities, state colleges, and regional AICTE/NCS hiring opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'India' ? '🇮🇳 India' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                State / Union Territory <span className="text-[#d97706]">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              >
                <option value="">-- Select Your State / UT --</option>
                {INDIAN_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                City / Tech Hub <span className="text-[#d97706]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                <input
                  type="text"
                  list="onboarding-cities-list"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                  placeholder={state ? `e.g. ${availableCities[0] || 'City'}` : 'Select state first or type city'}
                />
                <datalist id="onboarding-cities-list">
                  {availableCities.map((cityName) => (
                    <option key={cityName} value={cityName} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* College State */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                College State <span className="text-[#d97706]">*</span>
              </label>
              <select
                value={effectiveCollegeState}
                onChange={(e) => setCollegeState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              >
                <option value="">-- Select College State --</option>
                {INDIAN_STATES_AND_UTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* College / University Name (Interactive Combobox) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                University / College Name <span className="text-[#d97706]">*</span>
              </label>
              <CollegeCombobox
                value={collegeName}
                onChange={(val) => setCollegeName(val)}
                colleges={availableUniversities}
                selectedState={effectiveCollegeState}
                placeholder={
                  effectiveCollegeState
                    ? `Click to browse or search ${effectiveCollegeState} colleges...`
                    : 'Click to browse all Indian colleges or type...'
                }
              />
              <p className="text-[11px] text-[#78716c] mt-1">
                Showing {availableUniversities.length} premier accredited institutions {effectiveCollegeState ? `in ${effectiveCollegeState}` : 'across India'}
              </p>
            </div>

            {/* Degree */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                Degree / Course <span className="text-[#d97706]">*</span>
              </label>
              <select
                value={degree}
                onChange={(e) => {
                  setDegree(e.target.value)
                  const specs = getSpecializationsForDegree(e.target.value)
                  if (specs.length > 0) setFieldOfStudy(specs[0])
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
              >
                {INDIAN_DEGREES.map((deg) => (
                  <option key={deg} value={deg}>
                    {deg}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch / Stream (Cascaded) */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                Branch / Specialization <span className="text-[#d97706]">*</span>
              </label>
              <input
                type="text"
                list="onboarding-specializations-list"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                placeholder="e.g. Computer Science & Engineering (CSE)"
              />
              <datalist id="onboarding-specializations-list">
                {availableSpecializations.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>

            {/* CGPA */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                CGPA / SGPA / % <span className="text-[#d97706]">*</span>
              </label>
              <div className="relative">
                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                  placeholder="e.g. 8.6 / 10 CGPA or 82%"
                />
              </div>
            </div>

            {/* Passing Year */}
            <div>
              <label className="block text-xs font-bold text-[#572d12] mb-1.5 uppercase tracking-wider">
                Graduation Year <span className="text-[#d97706]">*</span>
              </label>
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
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!state) {
                  setError('Please select your state to continue.')
                  return
                }
                setError(null)
                setStep(2)
              }}
              className="pavitra-btn pavitra-btn-primary font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Target Roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TARGET ROLES */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#fff3df] text-xs font-bold text-[#d97706] mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career Trajectory</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">
              What roles are you targeting?
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c]">
              Choose one or more roles so CareerPilot AI matches live Indian tech & government opportunities accurately.
            </p>
          </div>

          {/* Suggested roles */}
          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-2.5 uppercase tracking-wider">
              Popular Positions
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#d97706] bg-[#fff3df] text-[#d97706] shadow-xs'
                        : 'border-[#eadcc9] bg-[#fffaf3] text-[#635b52] hover:text-[#572d12] hover:border-[#d97706]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1 text-[#d97706]" />}
                    {role}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom role input */}
          <form onSubmit={addCustomRole} className="flex gap-2">
            <input
              type="text"
              placeholder="Or type a custom role title..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
            />
            <button
              type="submit"
              disabled={!customRole.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#572d12] hover:bg-[#3d1f0c] disabled:opacity-40 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Selected Roles list */}
          {selectedRoles.length > 0 && (
            <div className="pt-2 border-t border-[#eadcc9]">
              <span className="text-xs font-bold text-[#572d12] block mb-2 uppercase tracking-wider">
                Selected ({selectedRoles.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff3df] border border-[#eadcc9] text-[#d97706] text-xs font-bold"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#eadcc9]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="pavitra-btn pavitra-btn-light font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={selectedRoles.length === 0}
              onClick={() => setStep(3)}
              className="pavitra-btn pavitra-btn-primary font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Next: Skills</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TECHNICAL SKILLS */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#fff3df] text-xs font-bold text-[#d97706] mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>Placement Core Skills</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">
              Highlight your top skills
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c]">
              These drive ATS score ranking and automated recruiter keyword screening.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#572d12] mb-2.5 uppercase tracking-wider">
              Popular Technologies
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#d97706] bg-[#fff3df] text-[#d97706] shadow-xs'
                        : 'border-[#eadcc9] bg-[#fffaf3] text-[#635b52] hover:text-[#572d12] hover:border-[#d97706]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1 text-[#d97706]" />}
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={addCustomSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Or add custom skill (e.g. PyTorch, Microservices)..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
            />
            <button
              type="submit"
              disabled={!customSkill.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#572d12] hover:bg-[#3d1f0c] disabled:opacity-40 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {selectedSkills.length > 0 && (
            <div className="pt-2 border-t border-[#eadcc9]">
              <span className="text-xs font-bold text-[#572d12] block mb-2 uppercase tracking-wider">
                Selected ({selectedSkills.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff3df] border border-[#eadcc9] text-[#d97706] text-xs font-bold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#eadcc9]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="pavitra-btn pavitra-btn-light font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={selectedSkills.length === 0}
              onClick={() => setStep(4)}
              className="pavitra-btn pavitra-btn-primary font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Next: Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESUME UPLOAD */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#eadcc9] bg-[#fff3df] text-xs font-bold text-[#d97706] mb-3">
              <FileUp className="w-3.5 h-3.5" />
              <span>ATS Telemetry Check</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#572d12] mb-1.5">
              Upload your resume
            </h2>
            <p className="text-xs sm:text-sm text-[#78716c]">
              We evaluate ATS formatting, extract projects, and index your academic achievements.
            </p>
          </div>

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#fffaf3] border border-[#eadcc9]">
            <button
              type="button"
              onClick={() => setUploadMethod('direct')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploadMethod === 'direct'
                  ? 'bg-white text-[#d97706] shadow-xs border border-[#eadcc9]'
                  : 'text-[#78716c] hover:text-[#572d12]'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Method A: Direct Upload</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMethod('drive')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploadMethod === 'drive'
                  ? 'bg-white text-[#d97706] shadow-xs border border-[#eadcc9]'
                  : 'text-[#78716c] hover:text-[#572d12]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Method B: Google Drive</span>
            </button>
          </div>

          {/* METHOD A: Direct File Upload */}
          {uploadMethod === 'direct' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) validateAndSetFile(file)
                }}
                className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative bg-[#fffaf3] ${
                  isDragging
                    ? 'border-[#d97706] bg-[#fff3df]'
                    : resumeFile
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-[#eadcc9] hover:border-[#d97706]'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                  {resumeFile ? (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#166534] flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#166534]">{resumeFile.name}</p>
                        <p className="text-xs text-[#78716c] mt-0.5">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI Extraction
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#fff3df] border border-[#eadcc9] text-[#d97706] flex items-center justify-center">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#572d12]">
                          Drag & drop your resume file here
                        </p>
                        <p className="text-xs text-[#78716c] mt-0.5">or click to browse from device</p>
                      </div>
                      <span className="text-[11px] font-semibold text-[#78716c]">
                        Supports PDF and DOCX (Max 10MB)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {resumeFile && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
          )}

          {/* METHOD B: Google Drive Link */}
          {uploadMethod === 'drive' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-[#eadcc9] bg-[#fffaf3] text-xs text-[#635b52] space-y-1.5">
                <p className="font-bold text-[#572d12]">How to import from Google Drive:</p>
                <ol className="list-decimal pl-4 space-y-1 text-[#78716c]">
                  <li>Right click your resume in Google Drive & click <b>Share</b>.</li>
                  <li>Set General Access to <b>&quot;Anyone with the link&quot;</b>.</li>
                  <li>Paste the copied link below to extract your profile instantly.</li>
                </ol>
              </div>

              <form onSubmit={handleDriveImport} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716c] pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#eadcc9] bg-[#fffaf3] text-xs sm:text-sm text-[#29231e] focus:outline-hidden focus:border-[#d97706]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={importingDrive || !driveUrl.trim()}
                    className="pavitra-btn pavitra-btn-primary font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {importingDrive ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Import</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {importedResumeTitle && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-[#166534]">
                    <Check className="w-4 h-4" />
                    <span className="font-bold">{importedResumeTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportedResumeTitle(null)}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eadcc9]">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="pavitra-btn pavitra-btn-light font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleComplete(true)}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-[#78716c] hover:text-[#572d12] cursor-pointer"
              >
                Skip for now
              </button>

              <button
                type="button"
                onClick={() => handleComplete(false)}
                disabled={loading}
                className="pavitra-btn pavitra-btn-primary font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finalizing Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
