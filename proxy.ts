import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Guard: only run Supabase auth logic for /dynasty routes.
  // The matcher should enforce this but proxy.ts runs for all requests in Next.js 16.
  if (!pathname.startsWith('/dynasty')) {
    return NextResponse.next({ request })
  }

  // Guard: skip if env vars aren't configured (prevents crash on misconfigured deploys)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be awaited before any server component reads the session
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicDynastyRoute =
    pathname.startsWith('/dynasty/login') ||
    pathname.startsWith('/dynasty/auth')

  if (!isPublicDynastyRoute && !user) {
    return NextResponse.redirect(new URL('/dynasty/login', request.url))
  }

  if (pathname === '/dynasty/login' && user) {
    return NextResponse.redirect(new URL('/dynasty', request.url))
  }

  return supabaseResponse
}

export const proxyConfig = {
  matcher: ['/dynasty/:path*'],
}
