import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { encryptOuraToken, fetchOuraRows, replaceOuraRows, saveOuraUser } from '@/lib/oura/server'
import { checkRateLimit, getRequestIp } from '@/lib/security/rate-limit'

export const maxDuration = 30

function secretsMatch(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)
  return candidateBuffer.length === expectedBuffer.length
    && timingSafeEqual(candidateBuffer, expectedBuffer)
}

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(`oura-join:${getRequestIp(request)}`, 5, 15 * 60_000)
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfter), 'Cache-Control': 'no-store' },
    })
  }

  const inviteSecret = process.env.OURA_JOIN_SECRET
  if (!inviteSecret) {
    return NextResponse.json({ error: 'Joining is temporarily unavailable.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const values = body as Record<string, unknown>
  const name = typeof values.name === 'string' ? values.name.trim() : ''
  const token = typeof values.token === 'string' ? values.token.trim() : ''
  const inviteCode = typeof values.inviteCode === 'string' ? values.inviteCode.trim() : ''

  if (name.length < 1 || name.length > 60 || token.length < 20 || token.length > 500) {
    return NextResponse.json({ error: 'Enter a valid name and Oura token.' }, { status: 400 })
  }
  if (!secretsMatch(inviteCode, inviteSecret)) {
    return NextResponse.json({ error: 'Invalid invite code.' }, { status: 403 })
  }

  const userId = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40)
  if (!userId) return NextResponse.json({ error: 'Enter a valid name.' }, { status: 400 })

  try {
    const rows = await fetchOuraRows(userId, token)
    if (!rows.length) {
      return NextResponse.json({ error: 'No recent Oura data was found.' }, { status: 404 })
    }

    await replaceOuraRows(userId, rows)
    await saveOuraUser(userId, name, encryptOuraToken(token))

    return NextResponse.json(
      { success: true, userId, displayName: name, daysAdded: rows.length },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const message = error instanceof Error && error.message.startsWith('Oura rejected')
      ? 'Oura rejected that personal access token.'
      : 'Unable to add your Oura account. Please try again.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
