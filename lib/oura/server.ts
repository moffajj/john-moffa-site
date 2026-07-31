import 'server-only'

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const OURA_BASE = 'https://api.ouraring.com/v2/usercollection'

export type OuraStatRow = {
  user_id: string
  day: string
  readiness_score: string | null
  sleep_id: string | null
  sleep_score: string | null
  temperature_deviation: string | null
  activity_score: string | null
  steps: string | null
  active_calories: string | null
  total_calories: string | null
  stress_high: string | null
  updated_at: string
}

function getDatabase() {
  // Oura and Dynasty use separate Supabase projects. SUPABASE_URL is the
  // dedicated Oura project; NEXT_PUBLIC_SUPABASE_URL belongs to Dynasty.
  const url = process.env.SUPABASE_URL
  const key = process.env.OURA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Oura database is not configured')

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function encryptionKey() {
  const encoded = process.env.OURA_TOKEN_ENCRYPTION_KEY
  if (!encoded) throw new Error('OURA_TOKEN_ENCRYPTION_KEY is not configured')
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== 32) throw new Error('OURA_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key')
  return key
}

export function encryptOuraToken(token: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`
}

export function decryptOuraToken(payload: string): string {
  const [version, ivValue, tagValue, ciphertextValue] = payload.split('.')
  if (version !== 'v1' || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error('Invalid encrypted Oura token')
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivValue, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

async function fetchOura(path: string, token: string, start: string, end: string) {
  const response = await fetch(`${OURA_BASE}/${path}?start_date=${start}&end_date=${end}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (response.status === 401) throw new Error('Oura rejected the personal access token')
  if (!response.ok) throw new Error(`Oura API returned ${response.status}`)
  return response.json()
}

export async function fetchOuraRows(userId: string, token: string): Promise<OuraStatRow[]> {
  const today = new Date()
  const end = today.toISOString().slice(0, 10)
  const startDate = new Date(today)
  startDate.setUTCDate(today.getUTCDate() - 13)
  const start = startDate.toISOString().slice(0, 10)

  const [readiness, sleep, activity, stress] = await Promise.all([
    fetchOura('daily_readiness', token, start, end),
    fetchOura('daily_sleep', token, start, end),
    fetchOura('daily_activity', token, start, end),
    fetchOura('daily_stress', token, start, end),
  ])

  type PartialDay = Record<string, string | undefined>
  const byDay: Record<string, PartialDay> = {}
  const day = (value: string) => (byDay[value] ??= {})

  for (const value of readiness.data ?? []) Object.assign(day(value.day), {
    readiness_score: String(value.score ?? ''),
    temperature_deviation: String(value.temperature_deviation ?? ''),
  })
  for (const value of sleep.data ?? []) Object.assign(day(value.day), {
    sleep_score: String(value.score ?? ''), sleep_id: String(value.id ?? ''),
  })
  for (const value of activity.data ?? []) Object.assign(day(value.day), {
    activity_score: String(value.score ?? ''), steps: String(value.steps ?? ''),
    active_calories: String(value.active_calories ?? ''), total_calories: String(value.total_calories ?? ''),
  })
  for (const value of stress.data ?? []) Object.assign(day(value.day), {
    stress_high: value.stress_high == null ? '' : String(Math.round(value.stress_high / 60)),
  })

  const nullable = (value?: string) => value ? value : null
  return Object.entries(byDay).map(([date, values]) => ({
    user_id: userId,
    day: date,
    readiness_score: nullable(values.readiness_score),
    temperature_deviation: nullable(values.temperature_deviation),
    sleep_score: nullable(values.sleep_score),
    sleep_id: nullable(values.sleep_id),
    activity_score: nullable(values.activity_score),
    steps: nullable(values.steps),
    active_calories: nullable(values.active_calories),
    total_calories: nullable(values.total_calories),
    stress_high: nullable(values.stress_high),
    updated_at: new Date().toISOString(),
  }))
}

export async function replaceOuraRows(userId: string, rows: OuraStatRow[]) {
  if (!rows.length) return
  const database = getDatabase()
  const days = rows.map(row => row.day).sort()
  const { error: deleteError } = await database.from('oura_stats').delete()
    .eq('user_id', userId).gte('day', days[0]).lte('day', days.at(-1)!)
  if (deleteError) throw new Error('Unable to replace existing Oura statistics')
  const { error: insertError } = await database.from('oura_stats').insert(rows)
  if (insertError) throw new Error('Unable to save Oura statistics')
}

export async function getPublicOuraStats(): Promise<OuraStatRow[]> {
  const { data, error } = await getDatabase().from('oura_stats').select([
    'user_id', 'day', 'readiness_score', 'sleep_id', 'sleep_score', 'temperature_deviation',
    'activity_score', 'steps', 'active_calories', 'total_calories', 'stress_high', 'updated_at',
  ].join(',')).order('day', { ascending: true })
  if (error) throw new Error('Unable to load Oura statistics')
  return (data ?? []) as unknown as OuraStatRow[]
}

export async function saveOuraUser(userId: string, displayName: string, encryptedToken: string) {
  const { error } = await getDatabase().from('oura_users').upsert({
    user_id: userId,
    display_name: displayName,
    token_ciphertext: encryptedToken,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw new Error('Unable to save Oura account')
}

export type OuraSyncUser = {
  user_id: string
  token: string
  encrypted: boolean
}

export async function getOuraUsersForSync(): Promise<OuraSyncUser[]> {
  const database = getDatabase()
  const encrypted = await database.from('oura_users')
    .select('user_id, token_ciphertext').not('token_ciphertext', 'is', null)

  if (!encrypted.error) {
    return (encrypted.data ?? []).map(user => ({
      user_id: user.user_id as string,
      token: user.token_ciphertext as string,
      encrypted: true,
    }))
  }

  // Compatibility for the original Oura schema. Migration 007 removes this
  // path by dropping oura_pat after members have rejoined with encrypted tokens.
  if (encrypted.error.code === '42703' || encrypted.error.code === 'PGRST204') {
    const legacy = await database.from('oura_users').select('user_id, oura_pat').not('oura_pat', 'is', null)
    if (!legacy.error) {
      return (legacy.data ?? []).map(user => ({
        user_id: user.user_id as string,
        token: user.oura_pat as string,
        encrypted: false,
      }))
    }
  }

  throw new Error('Unable to load Oura accounts')
}
