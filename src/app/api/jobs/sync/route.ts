import { NextResponse } from 'next/server'
import { syncAllJobSources } from '@/lib/services/job-aggregators'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    let channel: 'all' | 'aicte' | 'ncs' | 'adzuna' | 'google_jobs' = 'all'

    try {
      const body = await req.json()
      if (
        body?.channel &&
        ['all', 'aicte', 'ncs', 'adzuna', 'google_jobs'].includes(body.channel)
      ) {
        channel = body.channel
      }
    } catch {
      // Body is optional
    }

    const result = await syncAllJobSources({ channel })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to sync job channels' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      totalSynced: result.totalSynced,
      channels: result.channels,
      message: `Successfully synchronized ${result.totalSynced} verified openings across ${result.channels.join(', ')}`,
      timestamp: new Date().toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error during sync'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  const result = await syncAllJobSources({ channel: 'all' })
  return NextResponse.json(result)
}
