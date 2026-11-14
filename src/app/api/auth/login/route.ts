import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body?.email?.trim()
    const password = body?.password

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Email not confirmed. Please check your inbox to confirm your account.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      redirectTo: '/profile',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server authentication error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

