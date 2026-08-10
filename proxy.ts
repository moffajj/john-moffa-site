import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Access gate ───────────────────────────────────────────────────────────────

const ACCESS_COOKIE = 'app_access_token'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function passwordPage(showError: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Access Required</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0a;color:#f0ede8;font-family:-apple-system,BlinkMacSystemFont,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:40px;width:100%;max-width:360px}
  h1{font-size:18px;font-weight:600;margin-bottom:8px}
  p{color:#888;font-size:14px;margin-bottom:24px;line-height:1.5}
  input{width:100%;padding:10px 14px;background:#1a1a1a;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#f0ede8;font-size:14px;outline:none;margin-bottom:12px}
  input:focus{border-color:rgba(201,168,76,.5)}
  button{width:100%;padding:10px;background:#c9a84c;color:#000;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
  button:hover{opacity:.9}
  .error{color:#ef4444;font-size:13px;margin-bottom:12px}
</style>
</head>
<body>
<div class="card">
  <h1>Access Required</h1>
  <p>Enter your access code to continue.</p>
  ${showError ? '<p class="error">Incorrect access code. Please try again.</p>' : ''}
  <form method="GET">
    <input type="password" name="token" placeholder="Access code" autofocus autocomplete="current-password" />
    <button type="submit">Continue &rarr;</button>
  </form>
</div>
</body>
</html>`
}

// ── Main proxy ────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ── 1. APP_ACCESS_TOKEN gate ─────────────────────────────────────────────────
  const appToken = process.env.APP_ACCESS_TOKEN
  if (appToken) {
    // The inbound webhook carries its own SUPPORT_WEBHOOK_SECRET — exempt it
    const isWebhook = pathname === '/api/agents/support-triage/inbound'

    if (!isWebhook) {
      const cookieToken = request.cookies.get(ACCESS_COOKIE)?.value
      const queryToken = searchParams.get('token')

      if (cookieToken === appToken) {
        // valid cookie — fall through to downstream logic
      } else if (queryToken === appToken) {
        // valid token in URL — set cookie and redirect to clean URL
        const url = request.nextUrl.clone()
        url.searchParams.delete('token')
        const res = NextResponse.redirect(url)
        res.cookies.set(ACCESS_COOKIE, appToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: ACCESS_COOKIE_MAX_AGE,
          path: '/',
        })
        return res
      } else {
        // not authenticated
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const showError = queryToken !== null
        return new NextResponse(passwordPage(showError), {
          status: 401,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }
    }
  }

  // ── 2. Supabase auth (dynasty routes only) ───────────────────────────────────
  if (!pathname.startsWith('/dynasty')) {
    return NextResponse.next({ request })
  }

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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
