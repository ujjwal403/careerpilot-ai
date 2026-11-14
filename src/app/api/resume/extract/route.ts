import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractRawTextFromBuffer, extractResumeInformation } from '@/lib/ai/extractor'
import { evaluateATSCompatibility } from '@/lib/ats-scorer'
import type { ResumeExtractedData } from '@/types/resume-extractor'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to extract resume information.' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let extractedData: ResumeExtractedData | null = null
    let rawText = ''
    let targetResumeId: string | null = null

    // Handling 1: FormData upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null
      const resumeId = formData.get('resumeId') as string | null
      targetResumeId = resumeId

      if (!file) {
        return NextResponse.json({ error: 'No resume file provided for extraction.' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      rawText = await extractRawTextFromBuffer(buffer, file.type, file.name)
      extractedData = await extractResumeInformation(rawText, file.name)
    } else {
      // Handling 2: JSON payload with resumeId or fileUrl
      const body = await request.json()
      const { resumeId, fileUrl, fileName, force } = body
      targetResumeId = resumeId || null

      if (resumeId) {
        // Fetch existing resume row
        const { data: resumeRow, error: fetchErr } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .eq('user_id', user.id)
          .single()

        if (fetchErr || !resumeRow) {
          return NextResponse.json({ error: 'Resume not found.' }, { status: 404 })
        }

        // Check if already extracted (unless force=true or stale dummy data detected)
        const existingFeedback = resumeRow.ai_feedback as { extracted_data?: ResumeExtractedData } | null
        const isDummyData =
          existingFeedback?.extracted_data?.experience?.[0]?.company_name === 'Tech Innovators Pvt Ltd' ||
          existingFeedback?.extracted_data?.education?.[0]?.college_name === 'Indian Institute of Information Technology' ||
          existingFeedback?.extracted_data?.education?.[0]?.college_name === 'Indian Institute of Information Technology (IIIT)'

        if (existingFeedback?.extracted_data && !force && !isDummyData) {
          return NextResponse.json({
            success: true,
            extractedData: existingFeedback.extracted_data,
            resume: resumeRow,
          })
        }

        // Try downloading file from storage
        let storagePath = ''
        if (resumeRow.file_url && resumeRow.file_url.includes('/resumes/')) {
          const parts = resumeRow.file_url.split('/resumes/')
          storagePath = decodeURIComponent(parts[parts.length - 1].split('?')[0])
        } else if (resumeRow.file_name) {
          storagePath = `${user.id}/${resumeRow.file_name}`
        }

        if (storagePath) {
          const { data: fileBlob } = await supabase.storage.from('resumes').download(storagePath)
          if (fileBlob) {
            const buffer = Buffer.from(await fileBlob.arrayBuffer())
            rawText = await extractRawTextFromBuffer(
              buffer,
              resumeRow.mime_type || 'application/pdf',
              resumeRow.file_name || 'resume.pdf'
            )
          }
        }

        if (!rawText && resumeRow.content) {
          rawText = resumeRow.content
        }

        extractedData = await extractResumeInformation(rawText, resumeRow.file_name || undefined)
      } else if (fileUrl) {
        // Download via public link
        const res = await fetch(fileUrl)
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer())
          rawText = await extractRawTextFromBuffer(buffer, res.headers.get('content-type') || 'application/pdf', fileName)
          extractedData = await extractResumeInformation(rawText, fileName)
        }
      }
    }

    if (!extractedData) {
      extractedData = await extractResumeInformation(rawText || 'Resume Document')
    }

    // If we have a target resume row, update it in public.resumes
    let updatedResume = null
    if (targetResumeId) {
      const { data: existingResume } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', targetResumeId)
        .eq('user_id', user.id)
        .single()

      if (existingResume) {
        const fullContent = rawText.replace(/\0/g, '').slice(0, 50000) || existingResume.content || ''
        const atsReport = evaluateATSCompatibility(fullContent, extractedData)

        const existingFeedback = (existingResume.ai_feedback as Record<string, unknown>) || {}
        const mergedFeedback = {
          ...existingFeedback,
          extracted_data: extractedData,
          ats_report: atsReport,
          strengths: atsReport.strengths.length > 0 ? atsReport.strengths : existingFeedback.strengths,
          suggestions: atsReport.improvements.length > 0 ? atsReport.improvements : existingFeedback.suggestions,
        }

        const { data: saved } = await supabase
          .from('resumes')
          .update({
            content: fullContent || null,
            ai_score: atsReport.totalScore,
            ai_keywords: Array.from(
              new Set([...(existingResume.ai_keywords || []), ...extractedData.skills.hard_skills])
            ),
            ai_feedback: mergedFeedback as unknown as Json,
            ai_analyzed_at: new Date().toISOString(),
          })
          .eq('id', targetResumeId)
          .select()
          .single()

        updatedResume = saved
      }
    }

    return NextResponse.json({
      success: true,
      extractedData,
      resume: updatedResume,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to extract resume details.' }, { status: 500 })
  }
}
