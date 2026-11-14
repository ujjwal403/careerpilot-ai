import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluateATSCompatibility } from '@/lib/ats-scorer'
import type { ResumeExtractedData } from '@/types/resume-extractor'
import type { Json } from '@/types/database'

interface VerifyRequestBody {
  resumeId?: string
  extractedData: ResumeExtractedData
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to verify your profile.' }, { status: 401 })
    }

    const body = (await request.json()) as VerifyRequestBody
    const { resumeId, extractedData } = body

    if (!extractedData) {
      return NextResponse.json({ error: 'Extracted data is required.' }, { status: 400 })
    }

    const { contact, education, skills } = extractedData
    const firstEdu = education?.[0]
    const parsedGradYear = firstEdu?.graduation_year ? parseInt(firstEdu.graduation_year, 10) : null

    // 1. Update public.profiles
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          phone: contact?.phone || null,
          location: contact?.city || null,
          linkedin_url: contact?.linkedin_url || null,
          github_url: contact?.github_url || null,
          portfolio_url: contact?.portfolio_url || null,
          college_name: firstEdu?.college_name || null,
          degree: firstEdu?.degree || null,
          field_of_study: firstEdu?.field_of_study || null,
          cgpa: firstEdu?.score || null,
          passing_year: !isNaN(parsedGradYear as number) && parsedGradYear ? parsedGradYear : null,
          skills: skills?.hard_skills || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 })
    }

    // 2. Update user's full_name if extracted
    if (contact?.name && contact.name.trim().length >= 2) {
      await supabase
        .from('users')
        .update({ full_name: contact.name.trim() })
        .eq('id', user.id)
    }

    // 3. Update the resume in public.resumes with verified extracted data
    let targetResumeId = resumeId
    if (!targetResumeId) {
      const { data: primaryResume } = await supabase
        .from('resumes')
        .select('id, ai_feedback')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle()
      targetResumeId = primaryResume?.id
    }

    let calculatedAtsReport = null

    if (targetResumeId) {
      const { data: existingResume } = await supabase
        .from('resumes')
        .select('content, ai_feedback')
        .eq('id', targetResumeId)
        .single()

      const currentFeedback = (existingResume?.ai_feedback as Record<string, unknown>) || {}
      const atsReport = evaluateATSCompatibility(existingResume?.content || '', extractedData)
      calculatedAtsReport = atsReport

      await supabase
        .from('resumes')
        .update({
          ai_score: atsReport.totalScore,
          ai_feedback: {
            ...currentFeedback,
            extracted_data: extractedData as unknown as Json,
            ats_report: atsReport,
            strengths: atsReport.strengths.length > 0 ? atsReport.strengths : currentFeedback.strengths,
            suggestions: atsReport.improvements.length > 0 ? atsReport.improvements : currentFeedback.suggestions,
          } as unknown as Json,
          ai_keywords: skills?.hard_skills || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetResumeId)
    }

    return NextResponse.json({
      success: true,
      message: 'Verified profile and resume data saved successfully!',
      verifiedData: extractedData,
      atsReport: calculatedAtsReport,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

