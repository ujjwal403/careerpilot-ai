import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/jobs', '/resume', '/applications', '/profile', '/onboarding'] as const
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'] as const

const matches = (routes: readonly string[], path: string) =>
  routes.some((r) => path.startsWith(r))

const createRedirectResponse = (
  request: NextRequest,
  path: string,
  supabaseResponse: NextResponse,
  params?: Record<string, string>
) => {
  const url = request.nextUrl.clone()
  url.pathname = path
  url.search = ''
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const redirectResponse = NextResponse.redirect(url)
  // Preserve refreshed auth cookies across redirect
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
  })
  return redirectResponse
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && matches(PROTECTED_ROUTES, pathname)) {
    return createRedirectResponse(request, '/login', supabaseResponse, { next: pathname })
  }

  if (user && matches(AUTH_ROUTES, pathname)) {
    const nextParam = request.nextUrl.searchParams.get('next') || '/profile'
    const target = nextParam.startsWith('/') ? nextParam : '/profile'
    return createRedirectResponse(request, target, supabaseResponse)
  }

  return supabaseResponse
}
