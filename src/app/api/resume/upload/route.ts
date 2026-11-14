import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractRawTextFromBuffer, extractResumeInformation } from '@/lib/ai/extractor'
import { evaluateATSCompatibility } from '@/lib/ats-scorer'
import type { Json } from '@/types/database'

export async function POST(request: Request) {
  try {
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

    // Extract raw text from file
    let rawText = ''
    try {
      rawText = await extractRawTextFromBuffer(buffer, mimeType, file.name)
    } catch {
      rawText = ''
    }

    // Extract structured entities and calculate real ATS score
    const extractedData = await extractResumeInformation(rawText, file.name)
    const atsReport = evaluateATSCompatibility(rawText, extractedData)

    // Check if user is authenticated to save to Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If guest / unauthenticated, return the real ATS analysis immediately
    if (!user) {
      return NextResponse.json({
        success: true,
        isGuest: true,
        resume: {
          content: rawText.replace(/\0/g, ''),
          file_name: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''),
        },
        extractedData,
        atsReport,
      })
    }

    // Authenticated user: save to cloud storage and database
    const storagePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      })

    let publicUrl = ''
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(storagePath)
      publicUrl = urlData.publicUrl
    }

    // Demote any existing primary resumes
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', user.id)
      .eq('is_primary', true)

    // Insert new resume record
    const { data: newResume, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        file_name: file.name,
        file_size: file.size,
        mime_type: mimeType,
        file_url: publicUrl || null,
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

    return NextResponse.json({
      success: true,
      resume: newResume || {
        content: rawText.replace(/\0/g, ''),
        file_name: file.name,
        title: file.name.replace(/\.[^/.]+$/, ''),
      },
      extractedData,
      atsReport,
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

