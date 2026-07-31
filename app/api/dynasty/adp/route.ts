import { ROOKIE_CLASS } from '@/lib/dynasty/rookies'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const revalidate = 3600

export interface RookieAdp {
  id: string
  name: string   // "First Last" display format
  pos: string
  team: string
  adp: number
}

// Fantrax returns "Last, First" — convert to "first last" for comparison
function fantraxToNorm(fantraxName: string): string {
  const comma = fantraxName.indexOf(',')
  if (comma === -1) return fantraxName.toLowerCase()
  const last  = fantraxName.slice(0, comma).trim()
  const first = fantraxName.slice(comma + 1).trim()
  return `${first} ${last}`.toLowerCase()
}

// Fantrax "Last, First" → "First Last" for display
function fantraxToDisplay(fantraxName: string): string {
  const comma = fantraxName.indexOf(',')
  if (comma === -1) return fantraxName
  const last  = fantraxName.slice(0, comma).trim()
  const first = fantraxName.slice(comma + 1).trim()
  return first ? `${first} ${last}` : last
}

// Build a lookup: norm → team
const rookieMap = new Map(ROOKIE_CLASS.map(r => [r.name.toLowerCase(), r.team]))
const rookieNorms = Array.from(rookieMap.keys())

export async function GET() {
  try {
    const res = await fetch('https://www.fantrax.com/fxea/general/getAdp?sport=NFL', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'ADP fetch failed' }, { status: 502 })
    }

    const raw: Array<{ ADP_PPR?: number; pos?: string; name: string; id: string; tmId?: string }> = await res.json()

    const rookies: RookieAdp[] = raw
      .filter(p => p.pos && !p.tmId && p.ADP_PPR != null)
      .flatMap(p => {
        const norm = fantraxToNorm(p.name)
        const match = rookieNorms.find(r => norm === r || norm.startsWith(r) || r.startsWith(norm))
        if (!match) return []
        return [{
          id:   p.id,
          name: fantraxToDisplay(p.name),
          pos:  p.pos!,
          team: rookieMap.get(match) ?? '',
          adp:  Math.round(p.ADP_PPR! * 10) / 10,
        }]
      })
      .sort((a, b) => a.adp - b.adp)

    return NextResponse.json(rookies)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
