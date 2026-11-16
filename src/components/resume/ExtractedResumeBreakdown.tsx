'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Briefcase,
  Code2,
  Users,
  FolderGit2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Edit3,
} from 'lucide-react'
import type { ResumeExtractedData } from '@/types/resume-extractor'
import { createClient } from '@/lib/supabase/client'
import { DataVerificationModal } from './DataVerificationModal'

interface ExtractedResumeBreakdownProps {
  data: ResumeExtractedData
  userId?: string
  resumeId?: string
  onProfileSynced?: () => void
  onReextract?: () => void
  isExtracting?: boolean
}

export function ExtractedResumeBreakdown({
  data,
  userId,
  resumeId,
  onProfileSynced,
  onReextract,
  isExtracting,
}: ExtractedResumeBreakdownProps) {
  const [currentData, setCurrentData] = useState<ResumeExtractedData>(data)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)

  useEffect(() => {
    setCurrentData(data)
  }, [data])

  const [activeTab, setActiveTab] = useState<
    'all' | 'contact' | 'academics' | 'skills' | 'experience' | 'projects'
  >('all')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const handleSyncToProfile = async () => {
    setSyncing(true)
    setSyncMessage(null)

    try {
      const supabase = createClient()
      let activeUserId = userId
      if (!activeUserId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        activeUserId = user?.id
      }

      if (!activeUserId) {
        setSyncMessage('Please sign in to sync with your profile.')
        return
      }

      // Fetch existing profile to preserve existing fields
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', activeUserId)
        .single()

      const currentSkills = currentProfile?.skills || []
      const mergedSkills = Array.from(
        new Set([...currentSkills, ...(currentData.skills?.hard_skills || [])])
      )

      const firstEdu = currentData.education?.[0]
      const parsedGradYear = firstEdu?.graduation_year ? parseInt(firstEdu.graduation_year, 10) : null

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: activeUserId,
          skills: mergedSkills,
          phone: currentData.contact?.phone || currentProfile?.phone || null,
          location: currentData.contact?.city || currentProfile?.location || null,
          linkedin_url: currentData.contact?.linkedin_url || currentProfile?.linkedin_url || null,
          github_url: currentData.contact?.github_url || currentProfile?.github_url || null,
          college_name: firstEdu?.college_name || currentProfile?.college_name || null,
          degree: firstEdu?.degree || currentProfile?.degree || null,
          field_of_study: firstEdu?.field_of_study || currentProfile?.field_of_study || null,
          cgpa: firstEdu?.score || currentProfile?.cgpa || null,
          passing_year: isNaN(parsedGradYear as number) ? currentProfile?.passing_year || null : parsedGradYear,
        }, { onConflict: 'user_id' })

      if (upsertErr) throw upsertErr

      setSyncMessage('Profile successfully updated with verified CV details!')
      if (onProfileSynced) onProfileSynced()
    } catch {
      setSyncMessage('Failed to sync details to profile.')
    } finally {
      setSyncing(false)
    }
  }

  const { contact, education, skills, experience, projects, certifications } = currentData

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#eadcc9] bg-white p-6 sm:p-8 shadow-xs transition-all text-[#29231e]">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#eadcc9] pb-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] border border-[#eadcc9] text-[#2563eb]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-[#572d12]">Extracted CV Intelligence</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-bold text-[#166534] border border-[#bbf7d0]">
                <CheckCircle2 className="h-3 w-3" /> Auto-Parsed
              </span>
            </div>
            <p className="text-xs text-[#635b52] mt-0.5">
              Deep structural extraction covering contacts, campus academics, categorized skills, and experience.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVerifyModalOpen(true)}
            className="pavitra-btn pavitra-btn-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Verify & Edit Data</span>
          </button>

          {onReextract && (
            <button
              type="button"
              onClick={onReextract}
              disabled={isExtracting}
              className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#2563eb] ${isExtracting ? 'animate-spin' : ''}`} />
              <span>{isExtracting ? 'Re-extracting...' : 'Re-extract'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSyncToProfile}
            disabled={syncing}
            className="pavitra-btn pavitra-btn-light pavitra-btn-sm font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {syncing ? (
              <span>Syncing...</span>
            ) : (
              <>
                <span>Sync to Profile</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#2563eb]" />
              </>
            )}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mt-4 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs font-bold text-[#166534]">
          {syncMessage}
        </div>
      )}

      {/* Segmented Filter Bar */}
      <div className="mt-5 flex flex-wrap gap-2 border-b border-[#eadcc9] pb-4">
        {[
          { id: 'all', label: 'All Fields' },
          { id: 'contact', label: 'Contact Info' },
          { id: 'academics', label: 'Academics & CGPA' },
          { id: 'skills', label: 'Skills Inventory' },
          { id: 'experience', label: 'Experience' },
          { id: 'projects', label: 'Projects & Certifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-xs'
                : 'bg-[#eff6ff] border border-[#eadcc9] text-[#635b52] hover:text-[#572d12]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-6 space-y-6">
        {/* 1. Contact Information Card */}
        {(activeTab === 'all' || activeTab === 'contact') && (
          <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              <User className="h-4 w-4 text-[#2563eb]" />
              Contact Information
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-3.5 border border-[#eadcc9]">
                <span className="text-[11px] font-semibold text-[#78716c]">Full Name</span>
                <p className="mt-0.5 text-sm font-bold text-[#572d12] truncate">
                  {contact?.name || 'Not detected'}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-[#eadcc9]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
                  <Mail className="h-3 w-3" /> Email
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#29231e] truncate">
                  {contact?.email || 'Not detected'}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-[#eadcc9]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
                  <Phone className="h-3 w-3" /> Phone
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#29231e] truncate">
                  {contact?.phone || 'Not detected'}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3.5 border border-[#eadcc9]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#78716c]">
                  <MapPin className="h-3 w-3" /> Location / City
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#29231e] truncate">
                  {contact?.city || 'Not detected'}
                </p>
              </div>
            </div>

            {/* Links row */}
            {(contact?.linkedin_url || contact?.github_url) && (
              <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-[#eadcc9]">
                {contact?.linkedin_url && (
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#eadcc9] bg-[#eff6ff] px-3 py-1.5 text-xs font-bold text-[#572d12] hover:bg-[#ffe8c4]"
                  >
                    <svg className="h-3.5 w-3.5 fill-current text-[#2563eb]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 10.24v-8.37H5.06v8.37h2.8z" />
                    </svg>
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {contact?.github_url && (
                  <a
                    href={contact.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#eadcc9] bg-[#eff6ff] px-3 py-1.5 text-xs font-bold text-[#572d12] hover:bg-[#ffe8c4]"
                  >
                    <FolderGit2 className="h-3.5 w-3.5 text-[#2563eb]" />
                    GitHub
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Education & Academics Card */}
        {(activeTab === 'all' || activeTab === 'academics') && (
          <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              <GraduationCap className="h-4 w-4 text-[#2563eb]" />
              Education & Campus Credentials
            </div>

            <div className="mt-3 space-y-3">
              {education && education.length > 0 ? (
                education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-[#eadcc9] bg-white p-4"
                  >
                    <div>
                      <h4 className="text-sm font-extrabold text-[#572d12]">{edu.college_name}</h4>
                      <p className="text-xs text-[#635b52] mt-0.5">
                        {edu.degree} {edu.field_of_study ? `• ${edu.field_of_study}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {edu.score && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] px-3 py-1 text-xs font-bold text-[#166534] border border-[#bbf7d0]">
                          <Award className="h-3 w-3" />
                          {edu.score}
                        </span>
                      )}
                      {edu.graduation_year && (
                        <span className="rounded-full bg-[#eff6ff] border border-[#eadcc9] px-2.5 py-1 text-xs font-semibold text-[#572d12]">
                          Class of {edu.graduation_year}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#78716c]">No education history parsed.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. Skills List (Hard & Soft Skills) */}
        {(activeTab === 'all' || activeTab === 'skills') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hard Skills */}
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                <Code2 className="h-4 w-4 text-[#2563eb]" />
                Technical Hard Skills ({skills?.hard_skills?.length || 0})
              </div>
              <p className="text-[11px] text-[#635b52] mt-1">
                Frameworks, programming languages, databases & cloud tooling.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills?.hard_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg border border-[#eadcc9] bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#572d12]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#166534]">
                <Users className="h-4 w-4 text-[#166534]" />
                Professional & Soft Skills ({skills?.soft_skills?.length || 0})
              </div>
              <p className="text-[11px] text-[#635b52] mt-1">
                Communication, agility, team collaboration & problem solving.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {skills?.soft_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-1 text-xs font-semibold text-[#166534]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Experience & Internships */}
        {(activeTab === 'all' || activeTab === 'experience') && (
          <div className="rounded-2xl border border-[#eadcc9] bg-[#fffaf3] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              <Briefcase className="h-4 w-4 text-[#2563eb]" />
              Work Experience & Internships
            </div>

            <div className="mt-3 space-y-3">
              {experience && experience.length > 0 ? (
                experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-[#eadcc9] bg-white p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-extrabold text-[#572d12]">{exp.role_title}</h4>
                        <p className="text-xs font-bold text-[#2563eb]">{exp.company_name}</p>
                      </div>
                      <span className="inline-block rounded-md bg-[#eff6ff] border border-[#eadcc9] px-2.5 py-1 text-[11px] font-semibold text-[#572d12] self-start sm:self-auto">
                        {exp.duration}
                      </span>
                    </div>

                    <ul className="mt-3 space-y-1.5 text-xs text-[#635b52] pl-4 list-disc marker:text-[#2563eb]">
                      {exp.bullet_points.map((pt, pIdx) => (
                        <li key={pIdx} className="leading-relaxed">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#78716c]">No experience blocks extracted.</p>
              )}
            </div>
          </div>
        )}

        {/* 5. Projects & Certifications */}
        {(activeTab === 'all' || activeTab === 'projects') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Projects */}
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#572d12]">
                <FolderGit2 className="h-4 w-4 text-[#2563eb]" />
                Projects & Hackathons
              </div>

              <div className="mt-3 space-y-3">
                {projects && projects.length > 0 ? (
                  projects.map((proj, idx) => (
                    <div key={idx} className="rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-[#572d12]">{proj.title}</h5>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#635b52] hover:text-[#2563eb]"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[#635b52] mt-1 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="rounded bg-[#eff6ff] border border-[#eadcc9] px-2 py-0.5 text-[10px] font-semibold text-[#572d12]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#78716c]">No projects parsed.</p>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="rounded-2xl border border-[#eadcc9] bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#572d12]">
                <Award className="h-4 w-4 text-[#2563eb]" />
                Certifications & Achievements
              </div>

              <div className="mt-3 space-y-2.5">
                {certifications && certifications.length > 0 ? (
                  certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#eadcc9] bg-[#fffaf3] p-3.5"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-[#572d12]">{cert.name}</h5>
                        <p className="text-[11px] text-[#635b52]">{cert.issuer || 'Professional Issuer'}</p>
                      </div>
                      {cert.year && (
                        <span className="rounded bg-[#eff6ff] border border-[#eadcc9] px-2 py-1 text-[10px] font-semibold text-[#572d12]">
                          {cert.year}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#78716c]">No certifications recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Data Verification Screen Modal */}
      <DataVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        initialData={currentData}
        resumeId={resumeId}
        onSaveSuccess={(updated) => {
          setCurrentData(updated)
          setSyncMessage('Verified details successfully saved to your profile and resume!')
          if (onProfileSynced) onProfileSynced()
        }}
      />
    </div>
  )
}
