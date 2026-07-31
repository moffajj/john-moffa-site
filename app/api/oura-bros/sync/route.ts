import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { decryptOuraToken, fetchOuraRows, getOuraUsersForSync, replaceOuraRows } from '@/lib/oura/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get('authorization')
  if (!secret || !header?.startsWith('Bearer ')) return false
  const actual = Buffer.from(header.slice(7))
  const expected = Buffer.from(secret)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

async function sync(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await getOuraUsersForSync()
    const results = await Promise.allSettled(users.map(async user => {
      const token = user.encrypted ? decryptOuraToken(user.token) : user.token
      const rows = await fetchOuraRows(user.user_id, token)
      await replaceOuraRows(user.user_id, rows)
      return { userId: user.user_id, daysWritten: rows.length }
    }))

    const synced = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
    return NextResponse.json({ success: true, synced, failed: results.length - synced.length }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch {
    return NextResponse.json({ error: 'Oura sync failed' }, { status: 500 })
  }
}

export const GET = sync
export const POST = sync
