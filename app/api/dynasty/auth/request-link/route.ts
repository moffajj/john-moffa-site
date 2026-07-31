import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED = new Set(
  (process.env.DYNASTY_ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
)

export async function POST(req: NextRequest) {
  const { email, redirectTo } = await req.json() as { email: string; redirectTo: string }
  const normalized = email.trim().toLowerCase()

  if (!ALLOWED.has(normalized)) {
    return NextResponse.json(
      { error: 'This email address is not registered for the league. Contact your commissioner.' },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { emailRedirectTo: redirectTo },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
