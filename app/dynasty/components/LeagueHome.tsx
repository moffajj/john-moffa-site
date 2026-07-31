'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AppUser, AcquisitionType } from '@/lib/dynasty/types'
import { ACTIVE_YEAR } from '@/lib/dynasty/rules'
import { FilterBar, FilterState, EMPTY_FILTERS, hasActiveFilters } from './FilterBar'
import { ROOKIE_CLASS } from '@/lib/dynasty/rookies'
import { DynastyHeader, HeaderGhostButton } from './DynastyHeader'

// ── Design tokens ─────────────────────────────────────────────────────────────
const DY = {
  bg:           '#F3F6FB',
  surface:      '#FFFFFF',
  surface2:     '#F3F6FB',
  border:       '#E3E9F2',
  borderAccent: 'rgba(30,99,233,0.22)',
  accent:       '#1E63E9',
  accentDim:    'rgba(30,99,233,0.10)',
  text:         '#1A2333',
  text2:        '#4A5568',
  text3:        '#7C8AA0',
  text4:        '#A0AEC0',
  signed:       '#1AA160',
  signedDim:    'rgba(26,161,96,0.10)',
  penalty:      '#D9483B',
  penaltyDim:   'rgba(217,72,59,0.10)',
  warning:      '#B87A1E',
  warningDim:   'rgba(184,122,30,0.10)',
  gradient:     'linear-gradient(120deg, #1E63E9 0%, #1AA160 100%)',
}

const SLAB = 'var(--font-slab), Georgia, serif'
const MONO = 'var(--font-ledger), "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const POS_COLOR: Record<string, string> = {
  QB: '#60A5FA', RB: '#4ADE80', WR: '#FBBF24', TE: '#FB923C',
  K: '#A78BFA', DEF: '#94A3B8',
}

const STYLES = `
  .dy-team-card { transition: border-color 0.14s, background 0.14s; display: block; text-decoration: none; }
  .dy-team-card:hover { background: #F7FAFF !important; border-color: rgba(30,99,233,0.35) !important; }
  .dy-list-row { transition: background 0.1s; }
  .dy-list-row:hover { background: rgba(30,99,233,0.03) !important; }
  .dy-search-link { text-decoration: none; transition: background 0.1s; display: flex; align-items: center; gap: 14px; padding: 11px 20px; border-bottom: 1px solid #E3E9F2; }
  .dy-search-link:hover { background: rgba(30,99,233,0.03) !important; }
  .dy-search-input { transition: border-color 0.15s; }
  .dy-search-input:focus { border-color: rgba(30,99,233,0.45) !important; outline: none; }
  .dy-search-input::placeholder { color: #7C8AA0; }
  .dy-btn-ghost { transition: background 0.1s; cursor: pointer; }
  .dy-btn-ghost:hover { background: rgba(30,99,233,0.06) !important; }
  .dy-btn-ghost:active { opacity: 0.75; }
  .dy-toggle:hover { background: #EFF4FC !important; }
`

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LeaguePlayer {
  contractId:        string
  name:              string
  position:          string
  nflTeam:           string
  teamId:            string
  teamName:          string
  salary:            number
  acquisitionType:   AcquisitionType | null
  extensionEligible: boolean
  contractEndYear:   number
  status:            'active' | 'returning_to_pool'
}

export interface TeamSummaryData {
  team: {
    id: string; name: string; team_code: string
    manager_email: string | null; draft_cap: number
  }
  capUsed:          number
  capRemaining:     number
  capLimit:         number
  overCap:          boolean
  activePlayers:    number
  totalPlayers:     number
  pendingDecisions: number
}

export interface ReturnPlayer {
  id: string; name: string; position: string; nfl_team: string
  teamId: string; teamName: string; salary: number
  acquisition_type: AcquisitionType | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return `$${n}` }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function matchesPlayer(p: LeaguePlayer, query: string, f: FilterState): boolean {
  if (query) {
    const q = query.toLowerCase()
    const hit = p.name.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.nflTeam.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q)
    if (!hit) return false
  }
  if (f.position && p.position !== f.position) return false
  if (f.acquisition && p.acquisitionType !== f.acquisition) return false
  if (f.teamId && p.teamId !== f.teamId) return false
  if (f.status) {
    const isPool = p.status === 'returning_to_pool'
    if (f.status === 'eligible' && !p.extensionEligible) return false
    if (f.status === 'signed'   && (p.extensionEligible || isPool || p.contractEndYear <= ACTIVE_YEAR)) return false
    if (f.status === 'complete' && !isPool) return false
  }
  return true
}

// ── Atom components ───────────────────────────────────────────────────────────

function TeamAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(30,99,233,0.10)', border: `1.5px solid rgba(30,99,233,0.22)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SLAB, fontSize: size * 0.36, fontWeight: 700,
      color: '#1E63E9', userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  )
}

function PlayerAvatar({ name, pos, size = 38 }: { name: string; pos: string; size?: number }) {
  const color = POS_COLOR[pos] ?? '#94A3B8'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${color}28`, border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: size * 0.33, fontWeight: 700,
      color, userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  )
}

function PosTag({ pos }: { pos: string }) {
  const color = POS_COLOR[pos] ?? '#94A3B8'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
      padding: '3px 8px', borderRadius: 99,
      background: `${color}2E`, color, border: `1px solid ${color}50`,
      whiteSpace: 'nowrap', lineHeight: 1.5,
    }}>
      {pos}
    </span>
  )
}

const ACQ_META: Record<AcquisitionType, { label: string; color: string }> = {
  'Drafted':        { label: 'Drafted',  color: '#1E63E9' },
  'Free Agent':     { label: 'FA',       color: '#1AA160' },
  'Trade':          { label: 'Trade',    color: '#7C3AED' },
  'Under Contract': { label: 'Contract', color: '#64748B' },
}

function AcqTag({ type }: { type: AcquisitionType | null | undefined }) {
  if (!type) return null
  const { label, color } = ACQ_META[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
      padding: '2px 6px', borderRadius: 99,
      background: `${color}15`, color,
      border: `1px solid ${color}35`,
      whiteSpace: 'nowrap', lineHeight: 1.5,
    }}>
      {label}
    </span>
  )
}

function MiniCapBar({ used, limit }: { used: number; limit: number }) {
  const pct  = Math.min(used / limit, 1)
  const over = used > limit
  return (
    <div style={{ height: 6, background: '#F3F6FB', borderRadius: 3, overflow: 'hidden', border: `1px solid #E3E9F2` }}>
      <div style={{ width: `${pct * 100}%`, height: '100%', background: over ? 'linear-gradient(90deg, #FF6B6B, #D9483B)' : 'linear-gradient(90deg, #1E63E9, #1AA160)', transition: 'width 0.4s' }} />
    </div>
  )
}

// ── League summary strip ──────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid #E3E9F2`, boxShadow: '0 1px 3px rgba(20,40,80,0.06)', borderRadius: 10, padding: '18px 20px', flex: 1, minWidth: 120 }}>
      <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 5 }}>
        {value}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{sub}</div>
    </div>
  )
}

// ── Search result row ─────────────────────────────────────────────────────────

function SearchResultRow({ player }: { player: LeaguePlayer }) {
  const isPool = player.status === 'returning_to_pool'
  const statusText = isPool ? 'Contract complete' :
    player.extensionEligible ? 'Eligible' :
    `Signed thru ${player.contractEndYear}`
  const statusColor = isPool ? '#A0AEC0' :
    player.extensionEligible ? '#1E63E9' :
    '#1AA160'

  return (
    <a href={`/dynasty/team/${player.teamId}`} className="dy-search-link">
      <PlayerAvatar name={player.name} pos={player.position} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: DY.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {player.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2, flexWrap: 'wrap' }}>
          <PosTag pos={player.position} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{player.nflTeam}</span>
          <AcqTag type={player.acquisitionType} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 13, color: DY.text2 }}>{player.teamName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: '#1E63E9' }}>{fmt(player.salary)}</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: statusColor }}>{statusText}</span>
        </div>
      </div>
    </a>
  )
}

// ── Team card ─────────────────────────────────────────────────────────────────

function TeamCard({ summary, isOwnTeam }: { summary: TeamSummaryData; isOwnTeam: boolean }) {
  const { team } = summary
  const hasPending = summary.pendingDecisions > 0

  const cardBorder = isOwnTeam ? '1.5px solid #1E63E9' : `1px solid ${hasPending ? DY.borderAccent : DY.border}`
  const cardShadow = isOwnTeam
    ? '0 0 0 4px rgba(30,99,233,0.10), 0 4px 14px rgba(30,99,233,0.15)'
    : undefined

  return (
    <a
      href={`/dynasty/team/${team.id}`}
      className="dy-team-card"
      style={{ background: DY.surface, border: cardBorder, boxShadow: cardShadow, borderRadius: 10, padding: '20px 22px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {isOwnTeam ? (
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(120deg, #1E63E9 0%, #1AA160 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: SLAB, fontSize: 40 * 0.36, fontWeight: 700,
              color: '#FFFFFF', userSelect: 'none',
            }}>
              {team.name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          ) : (
            <TeamAvatar name={team.name} size={40} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: SLAB, fontSize: 16, fontWeight: 700, color: DY.text, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                {team.name}
              </div>
              {isOwnTeam && (
                <span style={{
                  fontFamily: SANS, fontSize: 9, fontWeight: 800,
                  color: '#FFFFFF', background: '#1E63E9',
                  padding: '2px 7px', borderRadius: 4,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  flexShrink: 0,
                }}>
                  Your Team
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: DY.text3, flexShrink: 0, marginTop: 2 }}>View →</div>
      </div>

      <MiniCapBar used={summary.capUsed} limit={summary.capLimit} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 9, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: summary.overCap ? '#D9483B' : '#1AA160', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {summary.overCap ? `+$${summary.capUsed - summary.capLimit}` : `$${summary.capRemaining}`}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: DY.text3 }}>
            {summary.overCap ? 'over' : 'left'}
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: DY.text4 }}>
          ${summary.capUsed} / ${summary.capLimit}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', columnGap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: DY.text2 }}>{summary.activePlayers}</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>active</span>
        </div>
        <div style={{ width: 1, height: 12, background: DY.border, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: DY.text2 }}>{summary.totalPlayers}</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>total</span>
        </div>
        <div style={{ width: 1, height: 12, background: DY.border, flexShrink: 0 }} />
        {hasPending ? (
          <span style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            padding: '2px 9px', borderRadius: 99,
            background: 'rgba(184,122,30,0.10)', color: '#B87A1E',
            border: `1px solid rgba(184,122,30,0.22)`,
            letterSpacing: '0.03em', whiteSpace: 'nowrap',
          }}>
            {summary.pendingDecisions} pending
          </span>
        ) : (
          <span style={{
            fontFamily: SANS, fontSize: 10, fontWeight: 700,
            padding: '2px 9px', borderRadius: 99,
            background: '#1AA160', color: '#FFFFFF',
            letterSpacing: '0.03em', whiteSpace: 'nowrap',
          }}>
            TEAM READY
          </span>
        )}
      </div>
    </a>
  )
}

// ── List row (shared by under-contract and pool sections) ─────────────────────

function PlayerListRow({
  player, sub, last,
}: {
  player: { name: string; position: string; nflTeam: string; teamName: string; teamId: string; salary: number; acquisitionType: AcquisitionType | null }
  sub: React.ReactNode
  last: boolean
}) {
  return (
    <a
      href={`/dynasty/team/${player.teamId}`}
      className="dy-list-row"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '11px 20px',
        borderBottom: last ? 'none' : `1px solid ${DY.border}`,
        textDecoration: 'none',
      }}
    >
      <PlayerAvatar name={player.name} pos={player.position} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: DY.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {player.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <PosTag pos={player.position} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{player.nflTeam}</span>
          <AcqTag type={player.acquisitionType} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 13, color: DY.text2 }}>{player.teamName}</div>
        <div style={{ marginTop: 2 }}>{sub}</div>
      </div>
    </a>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontFamily: SLAB, fontSize: 13, fontWeight: 700, color: DY.text2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {children}
      </span>
      {right}
    </div>
  )
}

// ── Accordion toggle button ───────────────────────────────────────────────────

function AccordionToggle({
  label, count, open, onToggle, borderRadius,
}: {
  label: string; count: number; open: boolean; onToggle: () => void; borderRadius?: string
}) {
  return (
    <button
      className="dy-toggle"
      onClick={onToggle}
      style={{
        width: '100%', padding: '12px 20px',
        background: '#FFFFFF', border: `1px solid #E3E9F2`,
        borderRadius: borderRadius ?? (open ? '8px 8px 0 0' : '8px'),
        color: '#7C8AA0', fontFamily: SLAB, fontSize: 12, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
      }}
    >
      <span>{label} · {count}</span>
      <span style={{ fontFamily: SANS, fontSize: 14, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
    </button>
  )
}

// ── Rookie row ────────────────────────────────────────────────────────────────

interface RookieAdp { id: string; name: string; pos: string; team: string; adp: number }

function RookieListRow({ rookie, last }: { rookie: RookieAdp; last: boolean }) {
  return (
    <div
      className="dy-list-row"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '11px 20px',
        borderBottom: last ? 'none' : `1px solid ${DY.border}`,
      }}
    >
      <PlayerAvatar name={rookie.name} pos={rookie.pos} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: DY.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
          {rookie.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
          <PosTag pos={rookie.pos} />
          {rookie.team && (
            <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{rookie.team}</span>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>ADP</div>
        <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: DY.accent }}>{rookie.adp}</div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const POS_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']

const ROOKIE_INITIAL_COUNT = 50

export default function LeagueHome({
  appUser,
  currentUserTeamId,
  teamSummaries,
  returningPlayers,
  leaguePlayers,
  teams,
}: {
  appUser: AppUser
  currentUserTeamId: string | null
  teamSummaries: TeamSummaryData[]
  returningPlayers: ReturnPlayer[]
  leaguePlayers: LeaguePlayer[]
  teams: { id: string; name: string }[]
}) {
  const router = useRouter()

  const [query, setQuery]                       = useState('')
  const [filters, setFilters]                   = useState<FilterState>(EMPTY_FILTERS)
  const [showUnderContract, setShowUnderContract] = useState(false)
  const [showPool, setShowPool]                 = useState(false)
  const [showRookies, setShowRookies]           = useState(false)
  const [rookiesData, setRookiesData]           = useState<RookieAdp[]>([])
  const [rookiesLoading, setRookiesLoading]     = useState(false)
  const [rookiesLoaded, setRookiesLoaded]       = useState(false)
  const [showAllRookies, setShowAllRookies]     = useState(false)

  useEffect(() => {
    if (!showRookies || rookiesLoaded) return
    setRookiesLoading(true)
    fetch('/api/dynasty/adp')
      .then(r => r.json())
      .then((data: RookieAdp[]) => { setRookiesData(Array.isArray(data) ? data : []); setRookiesLoaded(true) })
      .catch(() => setRookiesData([]))
      .finally(() => setRookiesLoading(false))
  }, [showRookies, rookiesLoaded])

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/dynasty/login')
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  const isFiltering = query.trim().length > 0 || hasActiveFilters(filters)

  const filteredPlayers = useMemo(() => {
    if (!isFiltering) return []
    const q = query.trim().toLowerCase()
    return leaguePlayers.filter(p => matchesPlayer(p, q, filters))
  }, [isFiltering, query, filters, leaguePlayers])

  const underContract = useMemo(() =>
    leaguePlayers.filter(p => p.status === 'active' && !p.extensionEligible && p.contractEndYear >= ACTIVE_YEAR)
  , [leaguePlayers])

  const pool = useMemo(() =>
    leaguePlayers.filter(p => p.status === 'returning_to_pool')
  , [leaguePlayers])

  const totalPending = teamSummaries.reduce((n, s) => n + s.pendingDecisions, 0)

  // Sort teams: own team first → pending → over cap → alpha
  const sortedTeams = useMemo(() =>
    [...teamSummaries].sort((a, b) => {
      const aOwn = a.team.id === currentUserTeamId ? 0 : 1
      const bOwn = b.team.id === currentUserTeamId ? 0 : 1
      if (aOwn !== bOwn) return aOwn - bOwn
      if (b.pendingDecisions !== a.pendingDecisions) return b.pendingDecisions - a.pendingDecisions
      if (a.overCap !== b.overCap) return a.overCap ? -1 : 1
      return a.team.name.localeCompare(b.team.name)
    })
  , [teamSummaries, currentUserTeamId])

  const sortedUnderContract = useMemo(() =>
    [...underContract].sort((a, b) => {
      const ai = POS_ORDER.indexOf(a.position)
      const bi = POS_ORDER.indexOf(b.position)
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      return a.name.localeCompare(b.name)
    })
  , [underContract])

  const sortedPool = useMemo(() =>
    [...returningPlayers].sort((a, b) => {
      const ai = POS_ORDER.indexOf(a.position)
      const bi = POS_ORDER.indexOf(b.position)
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      return a.name.localeCompare(b.name)
    })
  , [returningPlayers])

  return (
    <div style={{ minHeight: '100vh', background: DY.bg, fontFamily: SANS }}>
      <style>{STYLES}</style>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <DynastyHeader
        left={
          <div>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
              Dynasty League · Contract Manager
            </div>
            <div style={{ fontFamily: SLAB, fontSize: 22, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.05 }}>
              {ACTIVE_YEAR} Season Overview
            </div>
          </div>
        }
        right={<HeaderGhostButton onClick={handleSignOut}>Sign out</HeaderGhostButton>}
      />

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" stroke="#7C8AA0" strokeWidth="1.5" />
              <path d="M10 10L13.5 13.5" stroke="#7C8AA0" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search players, positions, or NFL teams…"
              className="dy-search-input"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#FFFFFF', border: `1px solid #E3E9F2`,
                borderRadius: 8, padding: '11px 16px 11px 40px',
                fontFamily: SANS, fontSize: 14, color: '#1A2333',
              }}
            />
          </div>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            teams={teams}
            showTeam={true}
            showStatus={true}
          />
        </div>

        {/* ── League summary strip ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <SummaryCard
            label="Under contract"
            value={underContract.length}
            sub="active multi-year deals"
            color={DY.signed}
          />
          <SummaryCard
            label="Pending decisions"
            value={totalPending}
            sub={totalPending === 1 ? 'extension to decide' : 'extensions to decide'}
            color={DY.accent}
          />
          <SummaryCard
            label="Returning to pool"
            value={pool.length}
            sub={`available ${ACTIVE_YEAR + 1} draft`}
            color={DY.text2}
          />
        </div>

        {isFiltering ? (
          /* ── Search / filter results ─────────────────────────────────────── */
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionLabel>
                {query.trim()
                  ? `Results for "${query.trim()}"`
                  : 'Filtered players'}
              </SectionLabel>
              <span style={{ fontFamily: SANS, fontSize: 12, color: DY.text3 }}>
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 8, overflow: 'hidden' }}>
              {filteredPlayers.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: DY.text3 }}>
                  No players match — try adjusting your search or filters
                </div>
              ) : (
                filteredPlayers.map(p => (
                  <SearchResultRow key={p.contractId} player={p} />
                ))
              )}
            </div>
          </div>
        ) : (
          /* ── Normal dashboard ────────────────────────────────────────────── */
          <>
            {/* Pending decisions banner */}
            {totalPending > 0 && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'rgba(184,122,30,0.07)', border: `1px solid rgba(184,122,30,0.22)`,
                borderRadius: 8, padding: '13px 18px', marginBottom: 24,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#B87A1E', flexShrink: 0, marginTop: 5 }} />
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#B87A1E', marginBottom: 3 }}>
                    {totalPending} extension decision{totalPending !== 1 ? 's' : ''} still pending
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: '#4A5568' }}>
                    {teamSummaries.filter(s => s.pendingDecisions > 0).map(t => t.team.name).join(' · ')}
                  </div>
                </div>
              </div>
            )}

            {/* Team grid */}
            <SectionLabel right={
              totalPending === 0
                ? <span style={{ fontFamily: SANS, fontSize: 12, color: '#1AA160' }}>✓ All extensions decided</span>
                : undefined
            }>
              All Teams · {teamSummaries.length}
            </SectionLabel>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 40 }}>
              {sortedTeams.map(summary => (
                <TeamCard
                  key={summary.team.id}
                  summary={summary}
                  isOwnTeam={summary.team.id === currentUserTeamId}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Under contract (collapsible) ──────────────────────────────────── */}
        {sortedUnderContract.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <AccordionToggle
              label="Under Contract"
              count={sortedUnderContract.length}
              open={showUnderContract}
              onToggle={() => setShowUnderContract(v => !v)}
            />
            {showUnderContract && (
              <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                {sortedUnderContract.map((p, i) => (
                  <PlayerListRow
                    key={p.contractId}
                    player={{ name: p.name, position: p.position, nflTeam: p.nflTeam, teamName: p.teamName, teamId: p.teamId, salary: p.salary, acquisitionType: p.acquisitionType }}
                    sub={
                      <span style={{ fontFamily: MONO, fontSize: 11, color: DY.signed }}>
                        Signed thru {p.contractEndYear} · {fmt(p.salary)}
                      </span>
                    }
                    last={i === sortedUnderContract.length - 1}
                  />
                ))}
                <div style={{ padding: '10px 20px', borderTop: `1px solid ${DY.border}`, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                  Players with active contracts extending beyond {ACTIVE_YEAR}.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Returning to pool (collapsible) ───────────────────────────────── */}
        {sortedPool.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <AccordionToggle
              label="Returning to Draft Pool"
              count={sortedPool.length}
              open={showPool}
              onToggle={() => setShowPool(v => !v)}
            />
            {showPool && (
              <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                {sortedPool.map((rp, i) => (
                  <PlayerListRow
                    key={rp.id}
                    player={{ name: rp.name, position: rp.position, nflTeam: rp.nfl_team, teamName: rp.teamName, teamId: rp.teamId, salary: rp.salary, acquisitionType: rp.acquisition_type }}
                    sub={
                      <span style={{ fontFamily: MONO, fontSize: 11, color: DY.text4 }}>{fmt(rp.salary)}</span>
                    }
                    last={i === sortedPool.length - 1}
                  />
                ))}
                <div style={{ padding: '10px 20px', borderTop: `1px solid ${DY.border}`, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                  These players re-enter the draft pool for {ACTIVE_YEAR + 1}. No action required.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Rookies (collapsible, lazy-loaded) ────────────────────────────── */}
        <div>
          <AccordionToggle
            label="Rookies"
            count={rookiesLoaded ? rookiesData.length : ROOKIE_CLASS.length}
            open={showRookies}
            onToggle={() => setShowRookies(v => !v)}
          />
          {showRookies && (
            <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
              {rookiesLoading ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: DY.text3 }}>
                  Loading ADP data…
                </div>
              ) : rookiesData.length === 0 ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: DY.text3 }}>
                  No rookie ADP data available.
                </div>
              ) : (
                <>
                  {(showAllRookies ? rookiesData : rookiesData.slice(0, ROOKIE_INITIAL_COUNT)).map((r, i, arr) => (
                    <RookieListRow key={r.id} rookie={r} last={i === arr.length - 1 && (showAllRookies || rookiesData.length <= ROOKIE_INITIAL_COUNT)} />
                  ))}
                  {!showAllRookies && rookiesData.length > ROOKIE_INITIAL_COUNT && (
                    <button
                      onClick={() => setShowAllRookies(true)}
                      style={{
                        width: '100%', padding: '10px 20px',
                        borderTop: `1px solid ${DY.border}`, border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: SANS, fontSize: 11, color: DY.accent, fontWeight: 600,
                        textAlign: 'left',
                      }}
                    >
                      Show all {rookiesData.length} rookies ↓
                    </button>
                  )}
                  <div style={{ padding: '10px 20px', borderTop: `1px solid ${DY.border}`, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                    ADP from Fantrax, sorted ascending. Skill positions only.
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
