"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { OuraStat } from './page'

const COLOR_PALETTE = ['#ddaa61', '#3184ff', '#55dc83', '#c0865d', '#e7a7c6', '#d7e2e8']

const USER_DISPLAY_NAMES: Record<string, string> = { me: 'John' }
const displayName = (id: string) =>
  USER_DISPLAY_NAMES[id] ?? id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const formatLastUpdated = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

const formatDataDay = (value?: string) => {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

type MetricKey = 'readiness_score' | 'sleep_score' | 'activity_score' | 'steps' | 'active_calories' | 'temperature_deviation' | 'stress_high'

const METRIC_STYLES: Record<MetricKey, {
  gradId: string; from: string; to: string; color: string; scoreColor: string; label: string; isScore: boolean
}> = {
  readiness_score:       { gradId: 'og-readiness', from: '#5c1468', to: '#f0b84d', color: '#ddaa61', scoreColor: '#f0b84d', label: 'Readiness', isScore: true },
  sleep_score:           { gradId: 'og-sleep',     from: '#0e2499', to: '#55aaff', color: '#3184ff', scoreColor: '#55aaff', label: 'Sleep',     isScore: true },
  activity_score:        { gradId: 'og-activity',  from: '#065e24', to: '#4ddd7a', color: '#55dc83', scoreColor: '#4ddd7a', label: 'Activity',  isScore: true },
  steps:                 { gradId: 'og-steps',     from: '#065e24', to: '#4ddd7a', color: '#55dc83', scoreColor: '#4ddd7a', label: 'Steps',     isScore: false },
  active_calories:       { gradId: 'og-cals',      from: '#7a3b00', to: '#f0b84d', color: '#ddaa61', scoreColor: '#f0b84d', label: 'Active Cal',isScore: false },
  temperature_deviation: { gradId: 'og-temp',      from: '#213040', to: '#b8d4e0', color: '#d7e2e8', scoreColor: '#b8d4e0', label: 'Temp °C',  isScore: false },
  stress_high:           { gradId: 'og-stress',    from: '#6e1515', to: '#ff6b6b', color: '#ff6b6b', scoreColor: '#ff6b6b', label: 'Stress',   isScore: false },
}

const METRICS = Object.entries(METRIC_STYLES).map(([key, s]) => ({ key: key as MetricKey, ...s }))

function formatValue(key: MetricKey, v: number): string {
  if (key === 'steps') return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)
  if (key === 'temperature_deviation') return `${v > 0 ? '+' : ''}${v.toFixed(2)}°C`
  if (key === 'stress_high') return v >= 60 ? `${(v / 60).toFixed(1)}h` : `${v.toFixed(0)}m`
  return v.toFixed(0)
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function ScoreRing({ score, label, gradientId, scoreColor }: {
  score: number; label: string; gradientId: string; scoreColor: string
}) {
  const R = 34
  const circ = 2 * Math.PI * R
  const filled = Math.min(1, Math.max(0, score / 100)) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={84} height={84} viewBox="0 0 84 84">
        <circle cx={42} cy={42} r={R} fill="none" stroke="#1c2838" strokeWidth={6} />
        <circle
          cx={42} cy={42} r={R}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={6}
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <text x={42} y={47} textAnchor="middle" fill={scoreColor} fontSize={17} fontWeight={700} fontFamily="inherit">
          {score || '—'}
        </text>
      </svg>
      <span style={{ fontSize: 10, color: '#8a98b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  )
}

function TrendBadge({ current, prev }: { current: number; prev: number | null }) {
  if (prev === null || Math.abs(current - prev) < 1) return <span style={{ fontSize: 11, color: '#6878a0' }}>—</span>
  const diff = current - prev
  return (
    <span style={{ fontSize: 11, color: diff > 0 ? '#4ddd7a' : '#d22c15', fontWeight: 600 }}>
      {diff > 0 ? '↑' : '↓'} {Math.abs(diff).toFixed(0)}
    </span>
  )
}

function UserCard({ userId, stats, color, isMobile }: { userId: string; stats: OuraStat[]; color: string; isMobile: boolean }) {
  const sorted = [...stats].sort((a, b) => b.day.localeCompare(a.day))
  const pf = (v: string | null | undefined) => { const n = parseFloat(v as string); return isNaN(n) ? null : n }

  // Daily scores are complete only after Oura processes sleep/readiness. Activity
  // fields can arrive earlier, so display the newest partial activity row instead
  // of holding all four supporting metrics on the completed-score day.
  const scoreDayIdx = sorted.findIndex(s => pf(s.readiness_score) !== null && pf(s.readiness_score)! > 0)
  const scoreDay = scoreDayIdx >= 0 ? sorted[scoreDayIdx] : sorted[0]
  const previousScoreDay = sorted.slice(scoreDayIdx + 1).find(s => pf(s.readiness_score) !== null) ?? null
  const activityDay = sorted.find(s => pf(s.steps) !== null || pf(s.active_calories) !== null) ?? scoreDay
  const stressDay = sorted.find(s => pf(s.stress_high) !== null) ?? activityDay

  const r = pf(scoreDay.readiness_score)
  const s = pf(scoreDay.sleep_score)
  const a = pf(scoreDay.activity_score)
  const rY = previousScoreDay ? pf(previousScoreDay.readiness_score) : null
  const sY = previousScoreDay ? pf(previousScoreDay.sleep_score) : null
  const aY = previousScoreDay ? pf(previousScoreDay.activity_score) : null

  const steps = pf(activityDay.steps)
  const aCal = pf(activityDay.active_calories)
  const temp = pf(scoreDay.temperature_deviation)
  const stress = pf(stressDay.stress_high)

  const fmt = (v: number | null, fn: (n: number) => string) => v != null ? fn(v) : '—'

  const rings = [
    { score: r ?? 0, label: 'Readiness', gradientId: 'og-readiness', scoreColor: METRIC_STYLES.readiness_score.scoreColor, trend: { current: r ?? 0, prev: rY } },
    { score: s ?? 0, label: 'Sleep',     gradientId: 'og-sleep',     scoreColor: METRIC_STYLES.sleep_score.scoreColor,     trend: { current: s ?? 0, prev: sY } },
    { score: a ?? 0, label: 'Activity',  gradientId: 'og-activity',  scoreColor: METRIC_STYLES.activity_score.scoreColor,  trend: { current: a ?? 0, prev: aY } },
  ]

  const statItems = [
    { label: 'Steps',      val: fmt(steps,  n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)),              color: METRIC_STYLES.steps.scoreColor },
    { label: 'Active Cal', val: fmt(aCal,   n => n.toFixed(0)),                                                          color: METRIC_STYLES.active_calories.scoreColor },
    { label: 'Stress',     val: fmt(stress, n => n >= 60 ? `${(n / 60).toFixed(1)}h` : `${n.toFixed(0)}m`),             color: METRIC_STYLES.stress_high.scoreColor },
    { label: 'Temp',       val: fmt(temp,   n => `${n > 0 ? '+' : ''}${n.toFixed(2)}°C`),                               color: METRIC_STYLES.temperature_deviation.scoreColor },
  ]

  return (
    <div style={{
      background: `linear-gradient(145deg, ${color}50 0%, #263048 55%)`,
      borderRadius: 17,
      padding: 1,
      ...(isMobile
        ? { flex: '0 0 82vw', scrollSnapAlign: 'start' }
        : { flex: '1 1 280px', maxWidth: 440 }),
    }}>
      <div style={{
        background: `linear-gradient(145deg, ${color}12 0%, #1b2640 55%)`,
        borderRadius: 16,
        padding: isMobile ? 20 : 24,
        height: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}80` }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f7f1e8' }}>{displayName(userId)}</span>
          <span style={{ fontSize: 11, color: '#6878a0', marginLeft: 'auto', textAlign: 'right' }}>
            Scores {formatDataDay(scoreDay.day)}
            {activityDay.day !== scoreDay.day && <><br />Activity {formatDataDay(activityDay.day)}</>}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {rings.map(({ score, label, gradientId, scoreColor, trend }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <ScoreRing score={score} label={label} gradientId={gradientId} scoreColor={scoreColor} />
              <TrendBadge {...trend} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid #1c2838', paddingTop: 16 }}>
          {statItems.map(({ label, val, color: c }) => (
            <div key={label}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c }}>{val}</div>
              <div style={{ fontSize: 9, color: '#8a98b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const W = 640, H = 220
const PAD = { top: 16, right: 16, bottom: 44, left: 44 }

function LineChart({ stats, metricKey, users, colors, barMode }: {
  stats: OuraStat[]
  metricKey: MetricKey
  users: string[]
  colors: Record<string, string>
  barMode?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<{ px: number; py: number; dayIdx: number; containerWidth: number } | null>(null)

  const allDays = [...new Set(stats.map(s => s.day))].sort()
  const metric = METRIC_STYLES[metricKey]

  const byUser: Record<string, Record<string, number>> = {}
  for (const s of stats) {
    const v = parseFloat((s as unknown as Record<string, string>)[metricKey])
    if (!isNaN(v)) {
      if (!byUser[s.user_id]) byUser[s.user_id] = {}
      byUser[s.user_id][s.day] = v
    }
  }

  const allValues = Object.values(byUser).flatMap(u => Object.values(u))
  if (allValues.length === 0) {
    return <p style={{ color: '#8a98b8', textAlign: 'center', padding: '32px 0', fontSize: 13 }}>No data yet</p>
  }

  const yMin = metric.isScore ? 0 : Math.max(0, Math.min(...allValues) * 0.85)
  const yMax = metric.isScore ? 100 : Math.max(...allValues) * 1.1
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom
  const yBottom = H - PAD.bottom

  const xS = (i: number) => PAD.left + (allDays.length > 1 ? i / (allDays.length - 1) : 0.5) * chartW
  const yS = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * chartH

  const groupW = chartW / Math.max(allDays.length, 1)
  const barGap = 3
  const barW = Math.max(6, Math.min(28, (groupW - 12) / Math.max(users.length, 1)))
  const groupCenter = (i: number) => PAD.left + (i + 0.5) * groupW
  const barX = (i: number, j: number) => {
    const totalW = users.length * barW + (users.length - 1) * barGap
    return groupCenter(i) - totalW / 2 + j * (barW + barGap)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const svgX = (px / rect.width) * W
    const idx = barMode
      ? Math.max(0, Math.min(allDays.length - 1, Math.floor((svgX - PAD.left) / groupW)))
      : Math.max(0, Math.min(allDays.length - 1, Math.round((svgX - PAD.left) / (chartW / Math.max(allDays.length - 1, 1)))))
    setHover({ px, py, dayIdx: idx, containerWidth: rect.width })
  }

  const hoverDay = hover !== null ? allDays[hover.dayIdx] : null
  const yTickVals = Array.from({ length: 5 }, (_, i) => yMin + (i / 4) * (yMax - yMin))
  const xLabelStep = Math.ceil(allDays.length / 8)
  const animKey = `${metricKey}-${allDays[0] ?? ''}-${allDays.at(-1) ?? ''}-${allDays.length}`

  return (
    <div ref={containerRef} style={{ position: 'relative' }} onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {!barMode && users.map(u => (
            <linearGradient key={u} id={`area-${u}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[u]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={colors[u]} stopOpacity={0} />
            </linearGradient>
          ))}
          {barMode && users.map(u => (
            <linearGradient key={u} id={`bar-grad-${u}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[u]} stopOpacity={0.95} />
              <stop offset="100%" stopColor={colors[u]} stopOpacity={0.45} />
            </linearGradient>
          ))}
        </defs>

        {yTickVals.map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={yS(v)} x2={W - PAD.right} y2={yS(v)} stroke="#1c2838" strokeWidth={1} />
            <text x={PAD.left - 6} y={yS(v) + 4} textAnchor="end" fill="#6878a0" fontSize={9}>
              {metricKey === 'steps' && v >= 1000
                ? `${(v / 1000).toFixed(0)}k`
                : metricKey === 'stress_high' && v >= 60
                  ? `${(v / 60).toFixed(0)}h`
                  : v.toFixed(metricKey === 'temperature_deviation' ? 1 : 0)}
            </text>
          </g>
        ))}

        {allDays.map((day, i) => {
          if (!barMode && allDays.length > 8 && i % xLabelStep !== 0 && i !== allDays.length - 1) return null
          const x = barMode ? groupCenter(i) : xS(i)
          return (
            <text key={day} x={x} y={H - PAD.bottom + 16} textAnchor="middle" fill="#6878a0" fontSize={9}>
              {day.slice(5)}
            </text>
          )
        })}

        <g key={animKey}>
        {barMode ? (
          users.map((userId, j) =>
            allDays.map((day, i) => {
              const v = byUser[userId]?.[day]
              if (v === undefined) return null
              const bh = Math.max(2, ((v - yMin) / (yMax - yMin)) * chartH)
              return (
                <rect
                  key={`${userId}-${day}`}
                  x={barX(i, j)} y={PAD.top + chartH - bh}
                  width={barW} height={bh}
                  rx={3} ry={3}
                  fill={`url(#bar-grad-${userId})`}
                  opacity={hover?.dayIdx === i ? 1 : 0.8}
                  className="chart-bar"
                  style={{ animation: `barRise 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.07 + j * 0.04}s both` }}
                />
              )
            })
          )
        ) : (
          users.map((userId, j) => {
            const color = colors[userId]
            const pts = allDays
              .map((day, i) => {
                const v = byUser[userId]?.[day]
                return v !== undefined ? { i, v } : null
              })
              .filter((p): p is { i: number; v: number } => p !== null)

            if (pts.length === 0) return null

            const linePoints = pts.map(({ i, v }) => `${xS(i)},${yS(v)}`).join(' ')
            const areaPath = pts.length > 1
              ? `M ${pts.map(({ i, v }) => `${xS(i)},${yS(v)}`).join(' L ')} L ${xS(pts[pts.length - 1].i)},${yBottom} L ${xS(pts[0].i)},${yBottom} Z`
              : null

            return (
              <g key={userId}>
                {areaPath && (
                  <path
                    d={areaPath}
                    fill={`url(#area-${userId})`}
                    style={{ animation: `chartAreaIn 0.6s ease-out ${j * 0.15 + 0.4}s both` }}
                  />
                )}
                <polyline
                  pathLength={1}
                  points={linePoints}
                  fill="none" stroke={color} strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="1"
                  style={{ animation: `chartLineIn 0.9s cubic-bezier(0.4, 0, 0.2, 1) ${j * 0.15}s both` }}
                />
                {pts.map(({ i, v }) => (
                  <circle
                    key={i} cx={xS(i)} cy={yS(v)} r={3.5} fill={color}
                    className="chart-dot"
                    style={{ animation: `dotPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${j * 0.15 + 0.55 + i * 0.04}s both` }}
                  />
                ))}
              </g>
            )
          })
        )}
        </g>

        {hover !== null && (() => {
          const cx = barMode ? groupCenter(hover.dayIdx) : xS(hover.dayIdx)
          return (
            <line x1={cx} y1={PAD.top} x2={cx} y2={yBottom} stroke="#6878a0" strokeWidth={1} strokeDasharray="4 2" />
          )
        })()}
      </svg>

      {hover && hoverDay && (
        <div style={{
          position: 'absolute',
          top: Math.max(4, hover.py - 72),
          left: hover.px > hover.containerWidth * 0.6 ? hover.px - 144 : hover.px + 12,
          background: 'linear-gradient(145deg, #212e48 0%, #1b2640 100%)',
          border: '1px solid #2a3848',
          borderRadius: 8,
          padding: '8px 12px',
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 100,
        }}>
          <div style={{ fontSize: 9, color: '#8a98b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{hoverDay}</div>
          {users.map(u => {
            const v = byUser[u]?.[hoverDay]
            return v !== undefined ? (
              <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors[u], flexShrink: 0 }} />
                <span style={{ color: '#8a98b8' }}>{displayName(u)}:</span>
                <span style={{ color: '#f7f1e8', fontWeight: 600 }}>{formatValue(metricKey, v)}</span>
              </div>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

type TimeRange = 'day' | 'week' | 'all'

const TIME_RANGES: { key: TimeRange; label: string; days: number | null }[] = [
  { key: 'day',  label: 'Day',  days: 1 },
  { key: 'week', label: 'Week', days: 7 },
  { key: 'all',  label: 'All',  days: null },
]

export default function OuraDashboard({ stats }: { stats: OuraStat[] }) {
  const isMobile = useIsMobile()
  const [activeMetric, setActiveMetric] = useState<MetricKey>('readiness_score')
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [joinOpen, setJoinOpen] = useState(false)

  const users = [...new Set(stats.map(s => s.user_id))].sort()
  const colors: Record<string, string> = {}
  users.forEach((u, i) => { colors[u] = COLOR_PALETTE[i % COLOR_PALETTE.length] })

  const byUser: Record<string, OuraStat[]> = {}
  for (const s of stats) {
    if (!byUser[s.user_id]) byUser[s.user_id] = []
    byUser[s.user_id].push(s)
  }

  const latestUpdate = formatLastUpdated(
    [...stats.map(s => s.updated_at)].sort().at(-1),
  )
  const latestDataDay = formatDataDay([...stats.map(s => s.day)].sort().at(-1))

  const filteredStats = (() => {
    const rangeDef = TIME_RANGES.find(r => r.key === timeRange)!
    if (rangeDef.days === null) return stats
    const allDaysSorted = [...new Set(stats.map(s => s.day))].sort()
    const cutoff = allDaysSorted.slice(-rangeDef.days)[0]
    return stats.filter(s => s.day >= cutoff)
  })()

  const router = useRouter()
  const [joinName, setJoinName] = useState('')
  const [joinToken, setJoinToken] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinState, setJoinState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [joinError, setJoinError] = useState('')

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinState('loading')
    setJoinError('')
    try {
      const res = await fetch('/api/oura-bros/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: joinName, token: joinToken, inviteCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setJoinState('error')
        setJoinError(data.error ?? 'Something went wrong')
        return
      }
      setJoinState('success')
      setJoinName('')
      setJoinToken('')
      setInviteCode('')
      setTimeout(() => { router.refresh(); setJoinOpen(false); setJoinState('idle') }, 2000)
    } catch {
      setJoinState('error')
      setJoinError('Network error — please try again')
    }
  }

  if (stats.length === 0) {
    return (
      <main style={{ minHeight: '100dvh', background: '#141e2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f7f1e8', marginBottom: 8 }}>Oura Bros</h1>
          <p style={{ fontSize: 14, color: '#8a98b8', marginBottom: 32 }}>Use your invite code and Oura token to add your stats.</p>
          {joinState === 'success' ? (
            <p style={{ fontSize: 14, color: '#4ddd7a', fontWeight: 600 }}>Added! Loading your data…</p>
          ) : (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="text"
                placeholder="Your name"
                required
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
                style={{
                  background: '#1c2838', border: '1px solid #2a3a54', borderRadius: 10,
                  color: '#f7f1e8', fontSize: 16, padding: '12px 14px', outline: 'none', width: '100%',
                }}
              />
              <input
                type="password"
                placeholder="Oura Personal Access Token"
                required
                value={joinToken}
                onChange={e => setJoinToken(e.target.value)}
                style={{
                  background: '#1c2838', border: '1px solid #2a3a54', borderRadius: 10,
                  color: '#f7f1e8', fontSize: 16, padding: '12px 14px', outline: 'none', width: '100%',
                  fontFamily: 'monospace',
                }}
              />
              <input
                type="password"
                placeholder="Invite code"
                required
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                autoComplete="off"
                style={{
                  background: '#1c2838', border: '1px solid #2a3a54', borderRadius: 10,
                  color: '#f7f1e8', fontSize: 16, padding: '12px 14px', outline: 'none', width: '100%',
                }}
              />
              {joinState === 'error' && (
                <p style={{ fontSize: 12, color: '#d22c15', margin: 0 }}>{joinError}</p>
              )}
              <button
                type="submit"
                disabled={joinState === 'loading'}
                style={{
                  padding: '13px 0', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 15,
                  background: joinState === 'loading' ? '#1c2838' : 'linear-gradient(135deg, #5c1468 0%, #f0b84d 100%)',
                  color: joinState === 'loading' ? '#8a98b8' : '#fff',
                  cursor: joinState === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {joinState === 'loading' ? 'Adding…' : 'Add my data →'}
              </button>
            </form>
          )}
          <p style={{ marginTop: 20, fontSize: 11, color: '#4a5878' }}>
            Get your token at <span style={{ color: '#6a88c8' }}>cloud.ouraring.com → Personal Access Tokens</span>
          </p>
        </div>
      </main>
    )
  }

  const px = isMobile ? 16 : 24

  return (
    <>
      <style>{`
        body { overscroll-behavior: none; }
        .oura-scroll-x { -ms-overflow-style: none; scrollbar-width: none; }
        .oura-scroll-x::-webkit-scrollbar { display: none; }
        input, textarea, select { font-size: 16px !important; }
        @keyframes chartLineIn {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes chartAreaIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dotPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes barRise {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        .chart-dot { transform-box: fill-box; transform-origin: center; }
        .chart-bar { transform-box: fill-box; transform-origin: bottom; }
      `}</style>

      <main style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse 110% 50% at 50% -10%, rgba(40,90,180,0.4) 0%, transparent 60%), radial-gradient(ellipse 60% 35% at 100% 0%, rgba(30,70,160,0.2) 0%, transparent 50%), #141e2e',
        paddingBottom: 'env(safe-area-inset-bottom, 40px)',
      }}>

        {/* Global SVG gradient defs */}
        <svg width={0} height={0} style={{ position: 'absolute', pointerEvents: 'none' }}>
          <defs>
            {METRICS.map(({ gradId, from, to }) => (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </linearGradient>
            ))}
          </defs>
        </svg>

        {/* Sticky header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(20, 30, 46, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(38, 52, 80, 0.6)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}>
          <div style={{
            maxWidth: 940,
            margin: '0 auto',
            padding: `${isMobile ? 14 : 16}px ${px}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: '#f7f1e8', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                Oura Bros
              </h1>
              {!isMobile && (
                <p style={{ fontSize: 12, color: '#8a98b8', marginTop: 3, marginBottom: 0 }}>
                  Health stats dashboard · last sync attempt {latestUpdate} · data through {latestDataDay}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
              {isMobile && (
                <span style={{ fontSize: 10, color: '#6878a0', textAlign: 'right', lineHeight: 1.35 }}>
                  Synced {latestUpdate}<br />Data through {latestDataDay}
                </span>
              )}
              <a
                href="https://ouraring.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://ouraring.com/assets/icons/favicon-32x32.png"
                  alt="Oura"
                  width={18}
                  height={18}
                  style={{ borderRadius: 4 }}
                />
                {!isMobile && <span style={{ fontSize: 11, color: '#8a98b8' }}>ouraring.com</span>}
              </a>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 940, margin: '0 auto', padding: `${isMobile ? 20 : 32}px ${px}px 48px` }}>

          {/* Join form */}
          {joinOpen ? (
            <div style={{
              marginBottom: isMobile ? 24 : 40,
              background: 'linear-gradient(135deg, rgba(92,20,104,0.12) 0%, rgba(221,170,97,0.07) 100%)',
              border: '1px solid rgba(221,170,97,0.2)',
              borderRadius: 16,
              padding: isMobile ? 16 : 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f7f1e8', margin: '0 0 4px' }}>
                    Want to see your stats here?
                  </h2>
                  <p style={{ fontSize: 13, color: '#887c6c', margin: 0 }}>
                    Get your{' '}
                    <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer" style={{ color: '#f0b84d', textDecoration: 'none' }}>
                      Oura personal access token
                    </a>
                    {' '}and add yourself.
                  </p>
                </div>
                <button
                  onClick={() => setJoinOpen(false)}
                  aria-label="Dismiss"
                  style={{ background: 'none', border: 'none', color: '#8a98b8', cursor: 'pointer', fontSize: 24, padding: '0 0 0 16px', lineHeight: 1, flexShrink: 0, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
                >
                  ×
                </button>
              </div>

              {joinState === 'success' ? (
                <p style={{ fontSize: 14, color: '#4ddd7a', margin: 0, fontWeight: 600 }}>You&apos;re in! Loading your data…</p>
              ) : (
                <form onSubmit={handleJoin}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: '#887c6c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Name</label>
                      <input
                        type="text"
                        value={joinName}
                        onChange={e => setJoinName(e.target.value)}
                        placeholder="First name"
                        required
                        style={{
                          background: '#111826', border: '1px solid #263450', borderRadius: 10,
                          padding: '12px 14px', color: '#f7f1e8', fontSize: 16, outline: 'none',
                          width: '100%', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: '#887c6c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Personal Access Token</label>
                      <input
                        type="password"
                        value={joinToken}
                        onChange={e => setJoinToken(e.target.value)}
                        placeholder="Paste your Oura PAT"
                        required
                        autoComplete="off"
                        style={{
                          background: '#111826', border: '1px solid #263450', borderRadius: 10,
                          padding: '12px 14px', color: '#f7f1e8', fontSize: 16, outline: 'none',
                          fontFamily: 'monospace', width: '100%', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 10, color: '#887c6c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Invite Code</label>
                      <input
                        type="password"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                        placeholder="Enter your invite code"
                        required
                        autoComplete="off"
                        style={{
                          background: '#111826', border: '1px solid #263450', borderRadius: 10,
                          padding: '12px 14px', color: '#f7f1e8', fontSize: 16, outline: 'none',
                          width: '100%', boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {joinState === 'error' && (
                    <p style={{ fontSize: 12, color: '#d22c15', margin: '0 0 12px' }}>{joinError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={joinState === 'loading'}
                    style={{
                      width: '100%',
                      padding: '13px 24px',
                      background: joinState === 'loading' ? '#1c2838' : 'linear-gradient(135deg, #5c1468 0%, #f0b84d 100%)',
                      color: joinState === 'loading' ? '#8a98b8' : '#fff',
                      border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                      cursor: joinState === 'loading' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {joinState === 'loading' ? 'Adding…' : 'Add my data →'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <button
              onClick={() => setJoinOpen(true)}
              style={{
                display: 'block', width: '100%', marginBottom: isMobile ? 24 : 40,
                background: 'transparent', border: '1px dashed #263450', borderRadius: 14,
                padding: isMobile ? '14px 20px' : '13px 24px', color: '#8a98b8', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', textAlign: 'left', minHeight: 48,
              }}
            >
              <span style={{ color: '#f0b84d', marginRight: 8 }}>+</span>
              Add your stats to the dashboard
            </button>
          )}

          {/* User cards — carousel on mobile, flex-wrap on desktop */}
          <div
            className="oura-scroll-x"
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: isMobile ? 24 : 40,
              ...(isMobile ? {
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
                paddingBottom: 4,
                marginLeft: -px,
                marginRight: -px,
                paddingLeft: px,
                paddingRight: px,
              } : {
                flexWrap: 'wrap' as const,
              }),
            }}
          >
            {users.map(userId => (
              <UserCard key={userId} userId={userId} stats={byUser[userId]} color={colors[userId]} isMobile={isMobile} />
            ))}
            {/* Spacer so last card doesn't hug the right edge on mobile */}
            {isMobile && <div style={{ flex: '0 0 4px' }} />}
          </div>

          {/* Comparison chart */}
          <div style={{
            background: 'linear-gradient(145deg, #212e48 0%, #1b2640 60%)',
            border: '1px solid #263450',
            borderRadius: 16,
            padding: isMobile ? '16px 16px 14px' : '24px 24px 20px',
            overflow: 'hidden',
          }}>
            {/* Header row: title + time range */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 12, fontWeight: 600, color: '#8a98b8', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                Comparison
              </h2>
              <div style={{ display: 'flex', gap: 2, background: '#111826', borderRadius: 8, padding: 2, border: '1px solid #263450' }}>
                {TIME_RANGES.map(r => (
                  <button
                    key={r.key}
                    onClick={() => setTimeRange(r.key)}
                    style={{
                      padding: isMobile ? '6px 14px' : '3px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: timeRange === r.key ? '#263450' : 'transparent',
                      color: timeRange === r.key ? '#f7f1e8' : '#8a98b8',
                      fontSize: isMobile ? 13 : 11,
                      fontWeight: timeRange === r.key ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      minHeight: isMobile ? 36 : 'auto',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric tabs — horizontal scroll on mobile */}
            <div
              className="oura-scroll-x"
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 14,
                ...(isMobile ? {
                  overflowX: 'auto',
                  flexWrap: 'nowrap' as const,
                  marginLeft: -16,
                  marginRight: -16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  paddingBottom: 2,
                } : {
                  flexWrap: 'wrap' as const,
                }),
              }}
            >
              {METRICS.map(m => {
                const active = activeMetric === m.key
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveMetric(m.key)}
                    style={{
                      padding: isMobile ? '7px 14px' : '4px 12px',
                      borderRadius: 20,
                      border: `1px solid ${active ? m.color : '#263450'}`,
                      background: active
                        ? `linear-gradient(135deg, ${m.from}30 0%, ${m.to}30 100%)`
                        : 'transparent',
                      color: active ? m.color : '#8a98b8',
                      fontSize: isMobile ? 13 : 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                      minHeight: isMobile ? 36 : 'auto',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              {users.map(u => (
                <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 2, background: colors[u], borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: '#8a98b8' }}>{displayName(u)}</span>
                </div>
              ))}
            </div>

            <LineChart stats={filteredStats} metricKey={activeMetric} users={users} colors={colors} barMode={timeRange === 'day'} />
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <a
              href="https://ouraring.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                background: 'linear-gradient(135deg, #1c2838 0%, #1b2640 100%)',
                border: '1px solid #263450', borderRadius: 10, padding: '10px 16px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://ouraring.com/assets/icons/favicon-32x32.png" alt="Oura" width={16} height={16} style={{ borderRadius: 3 }} />
              <span style={{ fontSize: 12, color: '#887c6c' }}>Don&apos;t have an Oura Ring?</span>
              <span style={{ fontSize: 12, color: '#f0b84d', fontWeight: 600 }}>Get yours →</span>
            </a>
            <a href="/oura-bros/privacy" style={{ fontSize: 11, color: '#263450', textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </div>

        </div>
      </main>
    </>
  )
}
