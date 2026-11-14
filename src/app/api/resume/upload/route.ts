import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractRawTextFromBuffer, extractResumeInformation } from '@/lib/ai/extractor'
import { evaluateATSCompatibility } from '@/lib/ats-scorer'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload a resume. Please sign in and try again.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No resume file selected.' }, { status: 400 })
    }

    // 10 MB strict limit
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
    const validExts = ['pdf', 'docx', 'doc']

    if (!validExts.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a .pdf or .docx file.' },
        { status: 400 }
      )
    }

    // Normalize MIME type based on extension
    let mimeType = file.type || ''
    if (fileExt === 'pdf') {
      mimeType = 'application/pdf'
    } else if (fileExt === 'docx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } else if (fileExt === 'doc') {
      mimeType = 'application/msword'
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const storagePath = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage bucket 'resumes'
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Cloud storage error: ${uploadError.message || 'Failed to save file.'}` },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(storagePath)

    // Extract text and analyze with AI
    let rawText = ''
    try {
      rawText = await extractRawTextFromBuffer(buffer, mimeType, file.name)
    } catch {
      rawText = ''
    }

    const extractedData = await extractResumeInformation(rawText, file.name)

    // Demote any existing primary resumes to satisfy idx_resumes_one_primary_per_user
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', user.id)
      .eq('is_primary', true)

    // Calculate real 10-rule ATS Compatibility score
    const atsReport = evaluateATSCompatibility(rawText, extractedData)

    // Insert new resume record
    const { data: newResume, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
        file_url: urlData.publicUrl,
        content: rawText.replace(/\0/g, '').slice(0, 50000) || null,
        is_primary: true,
        ai_score: atsReport.totalScore,
        ai_keywords: extractedData.skills.hard_skills,
        ai_feedback: {
          strengths: atsReport.strengths,
          suggestions: atsReport.improvements,
          extracted_data: extractedData,
          ats_report: atsReport,
        } as unknown as Json,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: `Database error: ${insertError.message || 'Could not save resume record.'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      resume: newResume,
      extractedData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while processing your resume.',
      },
      { status: 500 }
    )
  }
}

