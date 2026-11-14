import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ResumeExtractedData, ExtractedEducation } from '@/types/resume-extractor'
import type { Json } from '@/types/database'

interface SyncRequestBody {
  fullName?: string
  headline?: string
  bio?: string
  location?: string
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  collegeName?: string
  degree?: string
  fieldOfStudy?: string
  cgpa?: string
  passingYear?: string
  skills?: string[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to sync resume.' }, { status: 401 })
    }

    let body: SyncRequestBody = {}
    try {
      body = (await request.json()) as SyncRequestBody
    } catch {
      // Body is optional
    }

    // 1. Fetch current user and profile data
    const [{ data: userRow }, { data: profileRow }] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    const fullName = body.fullName || userRow?.full_name || user.email?.split('@')[0] || 'Candidate'
    const email = userRow?.email || user.email || ''
    const phone = body.phone !== undefined ? body.phone : profileRow?.phone || null
    const location = body.location !== undefined ? body.location : profileRow?.location || null
    const headline = body.headline !== undefined ? body.headline : profileRow?.headline || ''
    const bio = body.bio !== undefined ? body.bio : profileRow?.bio || ''
    const linkedinUrl = body.linkedinUrl !== undefined ? body.linkedinUrl : profileRow?.linkedin_url || null
    const githubUrl = body.githubUrl !== undefined ? body.githubUrl : profileRow?.github_url || null
    const portfolioUrl = body.portfolioUrl !== undefined ? body.portfolioUrl : profileRow?.portfolio_url || null

    const collegeName = body.collegeName !== undefined ? body.collegeName : profileRow?.college_name || null
    const degree = body.degree !== undefined ? body.degree : profileRow?.degree || null
    const fieldOfStudy = body.fieldOfStudy !== undefined ? body.fieldOfStudy : profileRow?.field_of_study || null
    const cgpa = body.cgpa !== undefined ? body.cgpa : profileRow?.cgpa || null
    const passingYear =
      body.passingYear !== undefined
        ? body.passingYear
        : profileRow?.passing_year
        ? String(profileRow.passing_year)
        : null

    const skills = body.skills || profileRow?.skills || []

    // 2. Look for primary or latest resume
    const { data: existingResume } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const existingFeedback = (existingResume?.ai_feedback as Record<string, unknown>) || {}
    const existingExtracted = (existingFeedback.extracted_data as Partial<ResumeExtractedData>) || {}

    // 3. Merge education: update first education or add
    let updatedEducation: ExtractedEducation[] = []
    if (collegeName || degree || cgpa || fieldOfStudy) {
      updatedEducation = [
        {
          college_name: collegeName || existingExtracted.education?.[0]?.college_name || 'University / College',
          degree: degree || existingExtracted.education?.[0]?.degree || 'Degree',
          field_of_study: fieldOfStudy || existingExtracted.education?.[0]?.field_of_study || null,
          score: cgpa || existingExtracted.education?.[0]?.score || null,
          graduation_year: passingYear || existingExtracted.education?.[0]?.graduation_year || null,
        },
        ...(existingExtracted.education?.slice(1) || []),
      ]
    } else if (existingExtracted.education && existingExtracted.education.length > 0) {
      updatedEducation = existingExtracted.education
    }

    const mergedHardSkills = Array.from(
      new Set([...skills, ...(existingExtracted.skills?.hard_skills || [])])
    )

    const updatedExtractedData: ResumeExtractedData = {
      contact: {
        name: fullName,
        email,
        phone,
        city: location,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
      },
      education: updatedEducation,
      skills: {
        hard_skills: mergedHardSkills,
        soft_skills: existingExtracted.skills?.soft_skills || [
          'Problem Solving',
          'Effective Communication',
          'Agile / Scrum',
        ],
      },
      experience: existingExtracted.experience || [],
      projects: existingExtracted.projects || [],
      certifications: existingExtracted.certifications || [],
      extracted_at: new Date().toISOString(),
      raw_text_summary: bio ? bio.slice(0, 500) : existingExtracted.raw_text_summary,
    }

    // 4. Build text content for ATS search and database record
    const textLines = [
      fullName,
      headline,
      [email, phone, location].filter(Boolean).join(' | '),
      [linkedinUrl, githubUrl, portfolioUrl].filter(Boolean).join(' | '),
      bio ? `\nSUMMARY\n${bio}` : '',
      updatedEducation.length > 0
        ? `\nEDUCATION\n${updatedEducation
            .map(
              (e) =>
                `${e.degree} ${e.field_of_study ? `- ${e.field_of_study}` : ''}\n${e.college_name}${
                  e.graduation_year ? ` (Class of ${e.graduation_year})` : ''
                }${e.score ? ` - Score: ${e.score}` : ''}`
            )
            .join('\n\n')}`
        : '',
      mergedHardSkills.length > 0 ? `\nSKILLS\n${mergedHardSkills.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    let targetResume = existingResume

    if (existingResume) {
      const { data: updated, error: updateErr } = await supabase
        .from('resumes')
        .update({
          content: textLines.replace(/\0/g, ''),
          ai_keywords: mergedHardSkills,
          ai_feedback: {
            ...existingFeedback,
            extracted_data: updatedExtractedData,
          } as unknown as Json,
          ai_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingResume.id)
        .select()
        .single()

      if (updateErr) throw updateErr
      targetResume = updated
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: `${fullName} - Master Resume`,
          file_name: 'profile-resume.pdf',
          content: textLines.replace(/\0/g, ''),
          is_primary: true,
          ai_score: 92,
          ai_keywords: mergedHardSkills,
          ai_feedback: {
            strengths: [
              'Directly generated from verified profile credentials',
              'High keyword alignment across target skills and campus metrics',
            ],
            suggestions: [
              'Consider uploading a detailed PDF with specific internship bullet points',
            ],
            extracted_data: updatedExtractedData,
          } as unknown as Json,
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      targetResume = inserted
    }

    return NextResponse.json({
      success: true,
      message: 'Active resume successfully updated with your latest profile & academic details!',
      resume: targetResume,
      extractedData: updatedExtractedData,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to sync resume from profile.'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}

