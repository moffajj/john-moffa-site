import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED = new Set(
  (process.env.DYNASTY_ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/dynasty/login?error=missing_code`)
  }

  let response = NextResponse.redirect(`${origin}/dynasty`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError || !data.user) {
    return NextResponse.redirect(`${origin}/dynasty/login?error=auth_failed`)
  }

  const email = data.user.email?.toLowerCase() ?? ''
  if (!ALLOWED.has(email)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/dynasty/login?error=not_in_league`)
  }

  return response
}
