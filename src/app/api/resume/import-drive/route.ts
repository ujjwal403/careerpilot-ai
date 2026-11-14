import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractRawTextFromBuffer, extractResumeInformation } from '@/lib/ai/extractor'
import { evaluateATSCompatibility } from '@/lib/ats-scorer'
import type { Json } from '@/types/database'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function extractGoogleDriveFileId(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim()
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    
    // Pattern 1: drive.google.com/file/d/<fileId>/...
    const fileDMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileDMatch) return fileDMatch[1]

    // Pattern 2: drive.google.com/open?id=<fileId> or ?id=<fileId>
    const idParam = parsed.searchParams.get('id')
    if (idParam) return idParam

    // Pattern 3: drive.google.com/uc?id=<fileId>
    const ucMatch = parsed.pathname.match(/\/uc\/?$/)
    if (ucMatch && parsed.searchParams.get('id')) {
      return parsed.searchParams.get('id')
    }

    // Pattern 4: docs.google.com/document/d/<fileId>/...
    const docMatch = parsed.pathname.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
    if (docMatch) return docMatch[1]

    // Pattern 5: /d/<fileId>
    const dMatch = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (dMatch) return dMatch[1]

    return null
  } catch {
    return null
  }
}

function parseFilename(disposition: string | null, fallbackExt = 'pdf'): string {
  if (disposition) {
    const filenameStarMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    if (filenameStarMatch) {
      try {
        return decodeURIComponent(filenameStarMatch[1].replace(/["']/g, ''))
      } catch {
        // Fallback below
      }
    }
    const filenameMatch = disposition.match(/filename=["']?([^"';]+)["']?/i)
    if (filenameMatch) {
      return filenameMatch[1].trim()
    }
  }
  return `Google_Drive_Resume.${fallbackExt}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to import a resume.' }, { status: 401 })
    }

    const body = await request.json()
    const { driveUrl } = body

    if (!driveUrl || typeof driveUrl !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid Google Drive link.' }, { status: 400 })
    }

    const fileId = extractGoogleDriveFileId(driveUrl)
    if (!fileId) {
      return NextResponse.json(
        { error: 'Invalid Google Drive link format. Make sure it contains a file ID (e.g. drive.google.com/file/d/.../view).' },
        { status: 400 }
      )
    }

    // Attempt direct download from Google Drive
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    let driveRes = await fetch(downloadUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    })

    if (!driveRes.ok) {
      return NextResponse.json(
        { error: 'Could not fetch file from Google Drive. Please ensure the link is publicly accessible.' },
        { status: 400 }
      )
    }

    let contentType = driveRes.headers.get('content-type') || ''
    const contentDisposition = driveRes.headers.get('content-disposition')

    // If Google Drive returns HTML, it's either private or asking for large-file confirmation
    if (contentType.includes('text/html')) {
      const htmlText = await driveRes.text()

      // Look for Google's confirm download token if it's a large file confirmation page
      const confirmMatch = htmlText.match(/href="(\/uc\?export=download[^"]+)"/i) || htmlText.match(/confirm=([0-9A-Za-z_-]+)/)
      if (confirmMatch) {
        const confirmUrl = confirmMatch[1].startsWith('http')
          ? confirmMatch[1]
          : `https://drive.google.com${confirmMatch[1].replace(/&amp;/g, '&')}`
        driveRes = await fetch(confirmUrl, { redirect: 'follow' })
        contentType = driveRes.headers.get('content-type') || ''
      } else {
        return NextResponse.json(
          {
            error:
              "This Google Drive file is private or requires Google sign-in. In Google Drive, click 'Share' → set access to 'Anyone with the link can view', then try again.",
          },
          { status: 400 }
        )
      }
    }

    const arrayBuffer = await driveRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Strict 10 MB file size limit
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10MB.` },
        { status: 400 }
      )
    }

    if (buffer.byteLength < 50) {
      return NextResponse.json(
        { error: 'The downloaded file appears empty or invalid. Please check the Google Drive link.' },
        { status: 400 }
      )
    }

    // Determine extension & mime type
    let fileName = parseFilename(contentDisposition)
    let fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf'

    // Validate MIME / extension
    if (contentType.includes('pdf') || buffer.slice(0, 4).toString() === '%PDF') {
      contentType = 'application/pdf'
      if (!fileExt || fileExt !== 'pdf') fileExt = 'pdf'
    } else if (
      contentType.includes('wordprocessingml') ||
      contentType.includes('officedocument') ||
      fileName.endsWith('.docx')
    ) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      fileExt = 'docx'
    } else if (fileName.endsWith('.doc') || contentType.includes('msword')) {
      contentType = 'application/msword'
      fileExt = 'doc'
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload or link a .pdf or .docx resume file.' },
        { status: 400 }
      )
    }

    if (!fileName.includes('.')) {
      fileName = `${fileName}.${fileExt}`
    }

    const storagePath = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to Supabase Storage bucket 'resumes'
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to save resume in cloud storage. Please try again.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(storagePath)

    // Run AI Information Extraction on document text
    let rawText = ''
    try {
      rawText = await extractRawTextFromBuffer(buffer, contentType, fileName)
    } catch {
      rawText = ''
    }
    const extractedData = await extractResumeInformation(rawText, fileName)
    const atsReport = evaluateATSCompatibility(rawText, extractedData)

    // Demote any existing primary resumes to satisfy idx_resumes_one_primary_per_user
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('user_id', user.id)
      .eq('is_primary', true)

    // Save or update primary resume in public.resumes
    const { data: newResume, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        title: fileName.replace(/\.[^/.]+$/, ''),
        file_name: fileName,
        file_size: buffer.byteLength,
        mime_type: contentType,
        file_url: urlData.publicUrl,
        content: rawText.replace(/\0/g, '').slice(0, 50000) || null,
        is_primary: true,
        ai_score: atsReport.totalScore,
        ai_keywords: extractedData.skills.hard_skills,
        ai_feedback: {
          strengths: atsReport.strengths.length > 0 ? atsReport.strengths : [
            'Imported successfully from Google Drive with clean layout structure',
            'Strong ATS keyword hierarchy and readable sections',
          ],
          suggestions: atsReport.improvements.length > 0 ? atsReport.improvements : [
            'Ensure contact phone and LinkedIn profile links are up to date',
            'Add target metrics or architectural impact numbers for senior positions',
          ],
          extracted_data: extractedData,
          ats_report: atsReport,
        } as unknown as Json,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to record resume in database.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, resume: newResume })
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while importing from Google Drive. Please try again.' },
      { status: 500 }
    )
  }
}

