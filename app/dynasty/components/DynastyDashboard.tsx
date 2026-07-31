'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  computeCutPenalty, computeCapSummary,
  salaryInYear, ACTIVE_YEAR, DRAFT_CAP,
} from '@/lib/dynasty/rules'
import type { AppUser, Team, Contract, Player, CutPenalty, AcquisitionType } from '@/lib/dynasty/types'
import { FilterBar, FilterState, EMPTY_FILTERS, hasActiveFilters } from './FilterBar'
import { DynastyHeader, HeaderGhostButton } from './DynastyHeader'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ContractPair {
  base:      Contract
  extension: Contract | null
  player:    Player
}

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

export const POS_COLOR: Record<string, string> = {
  QB: '#60A5FA', RB: '#4ADE80', WR: '#FBBF24', TE: '#FB923C',
  K: '#A78BFA', DEF: '#94A3B8',
}

// Shared column widths — used by both colgroup and FakeTableHead so they can't drift
const COL = { acquired: 100, year: 82, actions: 168 } as const

function fmt(n: number) { return `$${n}` }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

// Returns the salary from an extension contract for a given year, or null if not covered.
function salaryAt(ext: Contract | null, year: number): number | null {
  if (!ext) return null
  const idx = year - ext.start_year
  if (idx < 0 || idx >= ext.salary_by_year.length) return null
  return ext.salary_by_year[idx]
}

// ── CSS injection for hover / active states ────────────────────────────────────
const STYLES = `
  .dy-row { transition: background 0.1s; }
  .dy-row:hover { background: rgba(30,99,233,0.04) !important; }
  .dy-btn-extend { transition: background 0.12s, box-shadow 0.12s, opacity 0.1s; cursor: pointer; }
  .dy-btn-extend:hover { background: #1550C2 !important; box-shadow: 0 0 0 3px rgba(30,99,233,0.22) !important; }
  .dy-btn-extend:active { opacity: 0.8; }
  .dy-btn-cut { transition: background 0.1s, opacity 0.1s; cursor: pointer; }
  .dy-btn-cut:hover { background: rgba(217,72,59,0.10) !important; }
  .dy-btn-cut:active { opacity: 0.75; }
  .dy-btn-ghost { transition: background 0.1s, opacity 0.1s; cursor: pointer; }
  .dy-btn-ghost:hover { background: rgba(30,99,233,0.08) !important; }
  .dy-btn-ghost:active { opacity: 0.75; }
  .dy-toggle:hover { background: #EFF4FC !important; }
  @media (max-width: 639px) {
    .dy-signout { min-height: 44px !important; padding: 0 16px !important; }
  }
`

// ── Atoms ─────────────────────────────────────────────────────────────────────

function PlayerAvatar({ name, pos, size = 44 }: { name: string; pos: string; size?: number }) {
  const color = POS_COLOR[pos] ?? '#94A3B8'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${color}28`, border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: size * 0.33, fontWeight: 700,
      color, letterSpacing: '-0.01em', userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  )
}


export function PosTag({ pos }: { pos: string }) {
  const color = POS_COLOR[pos] ?? '#94A3B8'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
      padding: '3px 8px', borderRadius: 99,
      background: `${color}2E`, color,
      border: `1px solid ${color}50`,
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

function AcqTag({ type }: { type: AcquisitionType | null }) {
  if (!type) return null
  const { label, color } = ACQ_META[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: SANS, fontSize: 13, fontWeight: 700, letterSpacing: '0.03em',
      padding: '4px 10px', borderRadius: 99,
      background: `${color}15`, color,
      border: `1px solid ${color}35`,
      whiteSpace: 'nowrap', lineHeight: 1.5,
    }}>
      {label}
    </span>
  )
}

// ── Draft cap gauge ───────────────────────────────────────────────────────────
function DraftCapGauge({ used, limit, penalties }: { used: number; limit: number; penalties: number }) {
  const pct  = Math.min(used / limit, 1)
  const over = used > limit
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid #E3E9F2`,
      boxShadow: '0 1px 3px rgba(20,40,80,0.06)',
      borderRadius: 10, padding: '22px 24px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#7C8AA0', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 7 }}>
            {ACTIVE_YEAR} Draft Cap
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, color: over ? '#D9483B' : '#1E63E9', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {fmt(used)}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 15, color: '#A0AEC0' }}>/ {fmt(limit)}</span>
            {over && (
              <span style={{
                fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#D9483B',
                border: `1px solid rgba(217,72,59,0.4)`, padding: '2px 7px', borderRadius: 4,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                background: 'rgba(217,72,59,0.08)',
              }}>Over Cap</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#7C8AA0', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
            {over ? 'Over by' : 'Remaining'}
          </div>
          {over ? (
            <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color: '#D9483B', lineHeight: 1, letterSpacing: '-0.01em' }}>
              {fmt(used - limit)}
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', fontFamily: MONO, fontSize: 22, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.01em', background: 'linear-gradient(120deg, #1E63E9 0%, #1AA160 100%)', borderRadius: 6, padding: '3px 12px' }}>
              {fmt(limit - used)}
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', paddingTop: 8 }}>
        {ticks.map(t => (
          <div key={t} style={{
            position: 'absolute', top: 0, left: `${t * 100}%`,
            width: 1, height: t === 0 || t === 1 ? 10 : 6,
            background: '#E3E9F2',
            transform: 'translateX(-50%)',
          }} />
        ))}
        <div style={{ height: 12, background: '#F3F6FB', border: `1px solid #E3E9F2`, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            width: `${pct * 100}%`,
            background: over ? 'linear-gradient(90deg, #FF6B6B, #D9483B)' : 'linear-gradient(90deg, #1E63E9, #1AA160)',
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
          {pct > 0 && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: `${pct * 100}%`, width: 2,
              background: '#fff', opacity: 0.55,
              transform: 'translateX(-100%)',
            }} />
          )}
        </div>
        <div style={{ position: 'relative', height: 18, marginTop: 5 }}>
          {ticks.map(t => (
            <div key={t} style={{
              position: 'absolute',
              left: `${t * 100}%`,
              transform: t === 0 ? 'none' : t === 1 ? 'translateX(-100%)' : 'translateX(-50%)',
              fontFamily: MONO, fontSize: 9, color: '#A0AEC0', whiteSpace: 'nowrap', lineHeight: 1,
            }}>
              {fmt(Math.round(t * limit))}
            </div>
          ))}
        </div>
      </div>

      {penalties > 0 && (
        <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 11, color: '#D9483B' }}>
          Includes {fmt(penalties)} dead cap
        </div>
      )}
    </div>
  )
}

// ── Extension modal ───────────────────────────────────────────────────────────
function ExtensionModal({
  player, contract, onClose, onConfirm, loading,
}: {
  player: Player; contract: Contract;
  onClose: () => void; onConfirm: (years: 1 | 2 | 3) => void; loading: boolean;
}) {
  const prevSalary = contract.salary_by_year[contract.salary_by_year.length - 1]
  const extensionStartYear = contract.start_year + contract.length - 1
  const maxYears = Math.min(3, 4 - contract.length) as 1 | 2 | 3
  const [selectedYears, setSelectedYears] = useState<1 | 2 | 3>(maxYears)

  const fullRamp = [prevSalary + 5, prevSalary + 10, prevSalary + 15]
  const salaryByYear = fullRamp.slice(0, selectedYears)
  const totalValue = salaryByYear.reduce((s, v) => s + v, 0)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,51,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 480,
          background: '#FFFFFF', border: `1px solid #E3E9F2`,
          boxShadow: '0 -4px 24px rgba(30,99,233,0.10)',
          borderBottom: 'none', borderRadius: '10px 10px 0 0',
          padding: '28px 28px 36px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
          <PlayerAvatar name={player.name} pos={player.position} size={46} />
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#1E63E9', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
              Extension Offer
            </div>
            <div style={{ fontFamily: SLAB, fontSize: 20, fontWeight: 700, color: DY.text }}>{player.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <PosTag pos={player.position} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: DY.text3 }}>{player.nfl_team} · starts {extensionStartYear}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: DY.border, marginBottom: 20 }} />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
            Extension Length
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([1, 2, 3] as const).filter(y => y <= maxYears).map(y => (
              <button
                key={y}
                onClick={() => setSelectedYears(y)}
                style={{
                  flex: 1, padding: '9px 0',
                  borderRadius: 99,
                  border: `1.5px solid ${selectedYears === y ? DY.accent : DY.border}`,
                  background: selectedYears === y ? DY.accentDim : 'transparent',
                  color: selectedYears === y ? DY.accent : DY.text3,
                  fontFamily: SLAB, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {y} yr
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          {salaryByYear.map((sal, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '9px 0', borderBottom: `1px solid ${DY.border}`,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 13, color: DY.text3 }}>{extensionStartYear + i}</span>
              <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: DY.accent }}>{fmt(sal)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 0' }}>
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total value</span>
            <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 600, color: DY.text }}>{fmt(totalValue)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dy-btn-ghost" onClick={onClose} style={{ flex: 1, padding: '13px 0', borderRadius: 99, border: `1px solid ${DY.border}`, background: 'transparent', color: DY.text3, fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button className="dy-btn-extend" onClick={() => onConfirm(selectedYears)} disabled={loading} style={{ flex: 2, padding: '13px 0', borderRadius: 99, border: 'none', background: '#1E63E9', color: '#FFFFFF', fontFamily: SLAB, fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing…' : `Lock in ${selectedYears}-year extension`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cut modal ─────────────────────────────────────────────────────────────────
function CutModal({
  player, contract, onClose, onConfirm, loading,
}: {
  player: Player; contract: Contract;
  onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  const zeroPenalty = contract.extension_eligible
  const penalty = zeroPenalty ? null : computeCutPenalty(contract, ACTIVE_YEAR)
  const currentSalary = salaryInYear(contract, ACTIVE_YEAR)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,35,51,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 480,
          background: '#FFFFFF', border: `1px solid rgba(217,72,59,0.3)`,
          boxShadow: '0 -4px 24px rgba(217,72,59,0.08)',
          borderBottom: 'none', borderRadius: '10px 10px 0 0',
          padding: '28px 28px 36px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
          <PlayerAvatar name={player.name} pos={player.position} size={46} />
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#D9483B', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
              Release Player
            </div>
            <div style={{ fontFamily: SLAB, fontSize: 20, fontWeight: 700, color: DY.text }}>{player.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <PosTag pos={player.position} />
              <span style={{ fontFamily: SANS, fontSize: 12, color: DY.text3 }}>{player.nfl_team} · {fmt(currentSalary)} in {ACTIVE_YEAR}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: DY.border, marginBottom: 20 }} />

        {zeroPenalty ? (
          <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 6, padding: '14px 16px', marginBottom: 22 }}>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
              No Dead Cap
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: DY.text2 }}>
              Player is released with no penalty. Salary freed immediately, draft cap unaffected.
            </div>
          </div>
        ) : penalty ? (
          <div style={{ background: 'rgba(217,72,59,0.06)', border: `1px solid rgba(217,72,59,0.22)`, borderRadius: 6, padding: '14px 16px', marginBottom: 22 }}>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#D9483B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
              Dead Cap Penalty
            </div>
            {penalty.yearlyAmounts.map((amt, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '7px 0', borderBottom: i < penalty.yearlyAmounts.length - 1 ? `1px solid rgba(217,72,59,0.15)` : 'none',
              }}>
                <span style={{ fontFamily: SANS, fontSize: 12, color: DY.text3 }}>{ACTIVE_YEAR + i} penalty</span>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: DY.penalty }}>{fmt(amt)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 2 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Draft cap impact</span>
              <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: DY.penalty }}>{fmt(penalty.draftCapImpact)}</span>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="dy-btn-ghost" onClick={onClose} style={{ flex: 1, padding: '13px 0', borderRadius: 99, border: `1px solid ${DY.border}`, background: 'transparent', color: DY.text3, fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
            Cancel
          </button>
          <button className="dy-btn-cut" onClick={onConfirm} disabled={loading} style={{ flex: 2, padding: '13px 0', borderRadius: 99, border: `1.5px solid rgba(217,72,59,0.45)`, background: 'transparent', color: '#D9483B', fontFamily: SLAB, fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing…' : 'Confirm release'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table header ──────────────────────────────────────────────────────────────
const TH_STYLE = {
  fontFamily: SANS, fontSize: 9, fontWeight: 700 as const,
  color: DY.text3, textTransform: 'uppercase' as const, letterSpacing: '0.1em',
  padding: '9px 12px', borderBottom: `1px solid ${DY.border}`,
  background: DY.surface2, whiteSpace: 'nowrap' as const,
}

// Used only in the pool table (non-sticky, inside the table element)
function RosterTableHead({ readOnly }: { readOnly: boolean }) {
  return (
    <thead>
      <tr>
        <th style={{ ...TH_STYLE, padding: '9px 20px', textAlign: 'left' }}>Player</th>
        <th style={{ ...TH_STYLE, textAlign: 'left' }}>Acquired</th>
        <th style={{ ...TH_STYLE, textAlign: 'right' }}>2025</th>
        <th style={{ ...TH_STYLE, textAlign: 'right' }}>2026</th>
        <th style={{ ...TH_STYLE, textAlign: 'right' }}>2027</th>
        <th style={{ ...TH_STYLE, textAlign: 'right' }}>2028</th>
        {!readOnly && <th style={{ ...TH_STYLE, padding: '9px 20px 9px 12px', textAlign: 'right' }}>Actions</th>}
      </tr>
    </thead>
  )
}

// Sticky column header rendered as a flex div (lives outside the table, in sticky wrapper)
// Column widths mirror COL constants and colgroup exactly — one source of truth
function FakeTableHead({ readOnly }: { readOnly: boolean }) {
  const cell = (label: string, width: number, right = false) => (
    <div style={{
      width, flexShrink: 0,
      fontFamily: SANS, fontSize: 9, fontWeight: 700,
      color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '9px 12px', whiteSpace: 'nowrap',
      textAlign: right ? 'right' : 'left',
    }}>{label}</div>
  )
  return (
    <div style={{
      display: 'flex',
      background: DY.surface2,
      border: `1px solid ${DY.border}`,
      borderRadius: '8px 8px 0 0',
      marginTop: 16,
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1, minWidth: 0,
        fontFamily: SANS, fontSize: 9, fontWeight: 700,
        color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.1em',
        padding: '9px 20px', whiteSpace: 'nowrap',
      }}>Player</div>
      {cell('Acquired', COL.acquired)}
      {cell('2025', COL.year, true)}
      {cell('2026', COL.year, true)}
      {cell('2027', COL.year, true)}
      {cell('2028', COL.year, true)}
      {!readOnly && (
        <div style={{
          width: COL.actions, flexShrink: 0,
          fontFamily: SANS, fontSize: 9, fontWeight: 700,
          color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '9px 20px 9px 12px', whiteSpace: 'nowrap', textAlign: 'right',
        }}>Actions</div>
      )}
    </div>
  )
}

// ── Roster table row ──────────────────────────────────────────────────────────
function RosterTableRow({
  pair, readOnly, actionLoading, onExtend, onCut, onUncut,
}: {
  pair: ContractPair
  readOnly: boolean
  actionLoading: boolean
  onExtend: () => void
  onCut: () => void
  onUncut: () => void
}) {
  const { base, extension, player } = pair
  const isCut = base.status === 'cut'

  const sal25 = base.salary_by_year[0] ?? 0
  const sal26 = salaryAt(extension, 2026)
  const sal27 = salaryAt(extension, 2027)
  const sal28 = salaryAt(extension, 2028)

  const canExtend = base.status === 'active' && base.extension_eligible && !extension
  const canCut    = base.status === 'active'

  const contractEndYear = extension
    ? extension.start_year + extension.length - 1
    : base.start_year + base.length - 1
  const showSignedThru = !isCut && canCut && !canExtend && contractEndYear >= ACTIVE_YEAR

  const TD = (content: React.ReactNode, right = false, extra: React.CSSProperties = {}) => (
    <td style={{
      padding: '14px 12px', verticalAlign: 'middle',
      borderBottom: `1px solid ${DY.border}`,
      textAlign: right ? 'right' : 'left',
      ...extra,
    }}>
      {content}
    </td>
  )

  const salCell = (val: number | null, isFuture: boolean) => {
    if (isCut && isFuture) return <span style={{ fontFamily: MONO, fontSize: 16, color: DY.text4 }}>$0</span>
    if (val != null) return <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: isFuture ? DY.text2 : DY.accent }}>{fmt(val)}</span>
    return <span style={{ fontFamily: MONO, fontSize: 15, color: DY.text4 }}>—</span>
  }

  return (
    <tr className="dy-row" style={{ opacity: isCut ? 0.45 : 1 }}>
      {/* Player */}
      <td style={{ padding: '14px 20px', verticalAlign: 'middle', borderBottom: `1px solid ${DY.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PlayerAvatar name={player.name} pos={player.position} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: SANS, fontWeight: 600, fontSize: 15, color: DY.text,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
              textDecoration: isCut ? 'line-through' : 'none',
              textDecorationColor: DY.text3,
            }}>
              {player.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <PosTag pos={player.position} />
              <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3, flexShrink: 0 }}>{player.nfl_team}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Acquired */}
      {TD(<AcqTag type={base.acquisition_type} />)}

      {/* 2025 — always the base salary */}
      {TD(salCell(sal25, false), true)}

      {/* 2026–2028 — only from extension (or $0 if cut) */}
      {TD(salCell(sal26, true), true)}
      {TD(salCell(sal27, true), true)}
      {TD(salCell(sal28, true), true)}

      {/* Actions */}
      {!readOnly && (
        <td style={{ padding: '14px 20px 14px 12px', verticalAlign: 'middle', borderBottom: `1px solid ${DY.border}`, textAlign: 'right' }}>
          {isCut ? (
            <button
              className="dy-btn-ghost"
              onClick={onUncut}
              disabled={actionLoading}
              style={{
                fontFamily: SANS, fontSize: 12, fontWeight: 600, padding: '6px 14px',
                borderRadius: 99, border: `1px solid ${DY.border}`,
                background: 'transparent', color: DY.text2,
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? '…' : 'Uncut'}
            </button>
          ) : (canExtend || canCut) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              {showSignedThru && (
                <span style={{
                  fontFamily: SANS, fontSize: 10, fontWeight: 600,
                  color: DY.signed, letterSpacing: '0.02em', whiteSpace: 'nowrap',
                }}>
                  Signed thru {contractEndYear}
                </span>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {canExtend && (
                  <button
                    className="dy-btn-extend"
                    onClick={onExtend}
                    disabled={actionLoading}
                    style={{
                      fontFamily: SANS, fontSize: 12, fontWeight: 700, padding: '6px 14px',
                      borderRadius: 99, border: 'none',
                      background: '#1E63E9', color: '#FFFFFF',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    Extend
                  </button>
                )}
                {canCut && (
                  <button
                    className="dy-btn-cut"
                    onClick={onCut}
                    disabled={actionLoading}
                    style={{
                      fontFamily: SANS, fontSize: 12, fontWeight: 600, padding: '6px 14px',
                      borderRadius: 99, border: `1.5px solid rgba(217,72,59,0.45)`,
                      background: 'transparent', color: '#D9483B',
                      opacity: actionLoading ? 0.6 : 1,
                    }}
                  >
                    Cut
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </td>
      )}
    </tr>
  )
}

// ── Pool table row (returning_to_pool — no actions) ───────────────────────────
function PoolTableRow({ pair, readOnly }: { pair: ContractPair; readOnly: boolean }) {
  const { base, player } = pair
  const sal25 = base.salary_by_year[0] ?? 0

  const TD = (content: React.ReactNode, right = false) => (
    <td style={{
      padding: '12px 12px', verticalAlign: 'middle',
      borderBottom: `1px solid ${DY.border}`,
      textAlign: right ? 'right' : 'left',
      opacity: 0.45,
    }}>
      {content}
    </td>
  )

  return (
    <tr>
      <td style={{ padding: '12px 20px', verticalAlign: 'middle', borderBottom: `1px solid ${DY.border}`, opacity: 0.45 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PlayerAvatar name={player.name} pos={player.position} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: DY.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {player.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <PosTag pos={player.position} />
              <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{player.nfl_team}</span>
            </div>
          </div>
        </div>
      </td>
      {TD(<AcqTag type={base.acquisition_type} />)}
      {TD(<span style={{ fontFamily: MONO, fontSize: 13, color: DY.text3 }}>{fmt(sal25)}</span>, true)}
      {TD(<span style={{ fontFamily: MONO, fontSize: 13, color: DY.text4 }}>—</span>, true)}
      {TD(<span style={{ fontFamily: MONO, fontSize: 13, color: DY.text4 }}>—</span>, true)}
      {TD(<span style={{ fontFamily: MONO, fontSize: 13, color: DY.text4 }}>—</span>, true)}
      {!readOnly && (
        <td style={{ padding: '12px 20px 12px 12px', verticalAlign: 'middle', borderBottom: `1px solid ${DY.border}`, opacity: 0.45 }} />
      )}
    </tr>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontFamily: SLAB, fontSize: 13, fontWeight: 700, color: DY.text2, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {children}
      </span>
      {right}
    </div>
  )
}

// ── Mobile cap bar (compact sticky header) ────────────────────────────────────
function MobileCapBar({ draftCapUsed, capLimit, totalCutPenalties, overCap, decisionPill }: {
  draftCapUsed: number
  capLimit: number
  totalCutPenalties: number
  overCap: boolean
  decisionPill?: React.ReactNode
}) {
  const pct = Math.min(draftCapUsed / capLimit, 1)
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: '#FFFFFF',
      borderBottom: `1px solid #E3E9F2`,
      boxShadow: '0 2px 6px rgba(30,99,233,0.07)',
      padding: '12px 16px 10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: overCap ? '#D9483B' : '#1E63E9', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fmt(draftCapUsed)}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 13, color: '#A0AEC0' }}>/ {fmt(capLimit)}</span>
          {overCap && (
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: '#D9483B', border: `1px solid rgba(217,72,59,0.4)`, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(217,72,59,0.08)' }}>Over</span>
          )}
        </div>
        {decisionPill}
      </div>
      <div style={{ height: 3, background: '#F3F6FB', borderRadius: 2, overflow: 'hidden', border: '1px solid #E3E9F2' }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: overCap ? 'linear-gradient(90deg, #FF6B6B, #D9483B)' : 'linear-gradient(90deg, #1E63E9, #1AA160)',
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      </div>
      {totalCutPenalties > 0 && (
        <div style={{ marginTop: 5, fontFamily: SANS, fontSize: 10, color: '#D9483B' }}>
          Includes {fmt(totalCutPenalties)} dead cap
        </div>
      )}
    </div>
  )
}

// ── Mobile player card ────────────────────────────────────────────────────────
function PlayerCard({
  pair, readOnly, actionLoading, onExtend, onCut, onUncut,
}: {
  pair: ContractPair
  readOnly: boolean
  actionLoading: boolean
  onExtend: () => void
  onCut: () => void
  onUncut: () => void
}) {
  const { base, extension, player } = pair
  const isCut  = base.status === 'cut'
  const isPool = base.status === 'returning_to_pool'

  const canExtend = base.status === 'active' && base.extension_eligible && !extension
  const canCut    = base.status === 'active'

  const contractEndYear = extension
    ? extension.start_year + extension.length - 1
    : base.start_year + base.length - 1

  const sal25      = base.salary_by_year[0] ?? 0
  const hasActions = !readOnly && (isCut || canExtend || canCut)

  // Acquisition label: full-width, explicit text, per-type color
  const acqConfig = base.acquisition_type ? ({
    'Drafted':        { label: `DRAFTED ${base.start_year}`, color: '#1E63E9', bg: 'rgba(30,99,233,0.08)',   border: 'rgba(30,99,233,0.22)'   },
    'Free Agent':     { label: 'FREE AGENT PICKUP',          color: '#1AA160', bg: 'rgba(26,161,96,0.08)',   border: 'rgba(26,161,96,0.22)'   },
    'Trade':          { label: 'TRADED',                     color: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.22)'  },
    'Under Contract': { label: 'UNDER CONTRACT',             color: '#64748B', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.22)' },
  } as const)[base.acquisition_type] : null

  // Status pill: right side of salary row (or standalone for pool)
  let statusPill: { text: string; color: string; bg: string; border: string } | null = null
  if (isCut) {
    statusPill = { text: 'Released',          color: '#D9483B', bg: 'rgba(217,72,59,0.08)',   border: 'rgba(217,72,59,0.25)' }
  } else if (isPool) {
    statusPill = { text: 'Contract complete', color: '#7C8AA0', bg: 'rgba(120,138,160,0.08)', border: '#E3E9F2' }
  } else if (canExtend) {
    statusPill = { text: 'Eligible',          color: '#1E63E9', bg: 'rgba(30,99,233,0.10)',   border: 'rgba(30,99,233,0.25)' }
  } else if (extension || (canCut && contractEndYear >= ACTIVE_YEAR)) {
    statusPill = { text: `Signed thru ${contractEndYear}`, color: '#1AA160', bg: 'rgba(26,161,96,0.10)', border: 'rgba(26,161,96,0.25)' }
  }

  const salaryColor = isPool || isCut ? DY.text4 : DY.accent

  return (
    <div className="dy-row" style={{ padding: '14px 16px', borderBottom: `1px solid ${DY.border}`, opacity: isCut ? 0.45 : 1 }}>

      {/* ── Name / position row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <PlayerAvatar name={player.name} pos={player.position} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 15, color: DY.text,
            letterSpacing: '-0.01em', lineHeight: 1.25,
            textDecoration: isCut ? 'line-through' : 'none',
            textDecorationColor: DY.text3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {player.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <PosTag pos={player.position} />
            <span style={{ fontFamily: SANS, fontSize: 11, color: DY.text3 }}>{player.nfl_team}</span>
          </div>
        </div>
      </div>

      {/* ── Acquisition label row */}
      {acqConfig && (
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            padding: '5px 12px', borderRadius: 5, textTransform: 'uppercase',
            background: acqConfig.bg, color: acqConfig.color, border: `1px solid ${acqConfig.border}`,
          }}>
            {acqConfig.label}
          </span>
        </div>
      )}

      {/* ── Salary + status row (skipped for pool — status pill shown standalone) */}
      {!isPool ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: hasActions ? 14 : 0 }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text4, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 3 }}>
              2025 Salary
            </div>
            <div style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: salaryColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
              {fmt(sal25)}
            </div>
          </div>
          {statusPill && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
              padding: '6px 13px', borderRadius: 99, whiteSpace: 'nowrap',
              background: statusPill.bg, color: statusPill.color, border: `1px solid ${statusPill.border}`,
            }}>
              {statusPill.text}
            </span>
          )}
        </div>
      ) : (
        /* Pool: status pill standalone, no salary emphasis */
        statusPill && (
          <div style={{ marginBottom: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
              padding: '6px 13px', borderRadius: 99, whiteSpace: 'nowrap',
              background: statusPill.bg, color: statusPill.color, border: `1px solid ${statusPill.border}`,
            }}>
              {statusPill.text}
            </span>
          </div>
        )
      )}

      {/* ── Actions */}
      {hasActions && (
        <>
          {isCut && (
            <button className="dy-btn-ghost" onClick={onUncut} disabled={actionLoading} style={{ width: '100%', minHeight: 44, borderRadius: 8, border: `1px solid ${DY.border}`, background: 'transparent', color: DY.text2, fontFamily: SANS, fontSize: 15, fontWeight: 600, opacity: actionLoading ? 0.6 : 1 }}>
              {actionLoading ? '…' : 'Uncut'}
            </button>
          )}
          {!isCut && (
            <div style={{ display: 'flex', gap: 8 }}>
              {canExtend && (
                <button className="dy-btn-extend" onClick={onExtend} disabled={actionLoading} style={{ flex: 1, minHeight: 44, borderRadius: 8, border: 'none', background: '#1E63E9', color: '#FFFFFF', fontFamily: SLAB, fontSize: 15, fontWeight: 700, opacity: actionLoading ? 0.6 : 1 }}>
                  {actionLoading ? '…' : 'Extend'}
                </button>
              )}
              {canCut && (
                <button className="dy-btn-cut" onClick={onCut} disabled={actionLoading} style={{ flex: canExtend ? 1 : undefined, width: canExtend ? undefined : '100%', minHeight: 44, borderRadius: 8, border: `1.5px solid rgba(217,72,59,0.45)`, background: 'transparent', color: '#D9483B', fontFamily: SANS, fontSize: 15, fontWeight: 600, opacity: actionLoading ? 0.6 : 1 }}>
                  {actionLoading ? '…' : 'Cut'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function DynastyDashboard({
  appUser, team, rosterEntries, cutPenalties, orphanPenalties = [], readOnly = false, allTeams = [],
}: {
  appUser: AppUser
  team: Team
  rosterEntries: ContractPair[]
  cutPenalties: CutPenalty[]
  orphanPenalties?: CutPenalty[]
  readOnly?: boolean
  allTeams?: Team[]
}) {
  const router    = useRouter()
  const isMobile  = useIsMobile()
  const [filterState, setFilterState] = useState<FilterState>(EMPTY_FILTERS)
  const [extendTarget, setExtendTarget] = useState<ContractPair | null>(null)
  const [cutTarget,    setCutTarget]    = useState<ContractPair | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPool, setShowPool] = useState(false)

  const activeEntries   = rosterEntries.filter(r => r.base.status === 'active')
  const cutEntries      = rosterEntries.filter(r => r.base.status === 'cut')
  const returningEntries= rosterEntries.filter(r => r.base.status === 'returning_to_pool')

  const capLimit = team.draft_cap > 0 ? team.draft_cap : DRAFT_CAP
  const cap = computeCapSummary(
    activeEntries.map(r => r.base),
    [...cutPenalties, ...orphanPenalties],
    capLimit,
    ACTIVE_YEAR,
  )

  // Sort active: extension-eligible (no extension yet) first, then by position, then name
  const posOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
  const sortPair = (a: ContractPair, b: ContractPair) => {
    const aNeedsDecision = a.base.extension_eligible && !a.extension ? 0 : 1
    const bNeedsDecision = b.base.extension_eligible && !b.extension ? 0 : 1
    if (aNeedsDecision !== bNeedsDecision) return aNeedsDecision - bNeedsDecision
    const po = (posOrder.indexOf(a.player.position) ?? 99) - (posOrder.indexOf(b.player.position) ?? 99)
    if (po !== 0) return po
    return a.player.name.localeCompare(b.player.name)
  }

  const sortedActive   = [...activeEntries].sort(sortPair)
  const sortedCut      = [...cutEntries].sort((a, b) => a.player.name.localeCompare(b.player.name))
  const sortedReturning= [...returningEntries].sort((a, b) => a.player.name.localeCompare(b.player.name))

  const mainRows = [...sortedActive, ...sortedCut]

  const displayRows = useMemo(() => {
    if (!hasActiveFilters(filterState)) return mainRows
    return mainRows.filter(pair => {
      if (filterState.position && pair.player.position !== filterState.position) return false
      if (filterState.acquisition && pair.base.acquisition_type !== filterState.acquisition) return false
      return true
    })
  }, [mainRows, filterState])

  const extEligibleCount = activeEntries.filter(r => r.base.extension_eligible && !r.extension).length

  const handleExtend = useCallback(async (years: 1 | 2 | 3) => {
    if (!extendTarget) return
    setActionLoading(true); setError(null)
    try {
      const res = await fetch('/api/dynasty/contracts/extend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: extendTarget.base.id, years }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setExtendTarget(null); router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error') }
    finally { setActionLoading(false) }
  }, [extendTarget, router])

  const handleCut = useCallback(async () => {
    if (!cutTarget) return
    setActionLoading(true); setError(null)
    try {
      const res = await fetch('/api/dynasty/contracts/cut', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: cutTarget.base.id }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      setCutTarget(null); router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error') }
    finally { setActionLoading(false) }
  }, [cutTarget, router])

  const handleUncut = useCallback(async (contractId: string) => {
    setActionLoading(true); setError(null)
    try {
      const res = await fetch('/api/dynasty/contracts/uncut', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error') }
    finally { setActionLoading(false) }
  }, [router])

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/dynasty/login')
  }

  const decisionPill = extEligibleCount > 0 ? (
    <span style={{
      fontFamily: SANS, fontSize: 11, fontWeight: 700,
      padding: '3px 11px', borderRadius: 99,
      background: 'rgba(184,122,30,0.10)', color: '#B87A1E',
      border: `1px solid rgba(184,122,30,0.25)`,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {extEligibleCount} need a decision
    </span>
  ) : undefined

  return (
    <div style={{ minHeight: '100vh', background: DY.bg, fontFamily: SANS }}>
      <style>{STYLES}</style>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <DynastyHeader
        left={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Now Viewing
            </span>
            {allTeams.length > 1 ? (
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 1, minWidth: 0 }}>
                <select
                  value={team.id}
                  onChange={e => router.push(`/dynasty/team/${e.target.value}`)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    fontFamily: SLAB,
                    fontSize: 17,
                    fontWeight: 700,
                    padding: '5px 28px 5px 10px',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    maxWidth: 280,
                  }}
                >
                  {allTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 9, pointerEvents: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>▾</span>
              </div>
            ) : (
              <span style={{ fontFamily: SLAB, fontSize: 17, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                {team.name}
              </span>
            )}
            {readOnly && (
              <span style={{
                fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.15)',
                border: `1px solid rgba(255,255,255,0.3)`, padding: '1px 6px', borderRadius: 3,
                textTransform: 'uppercase', flexShrink: 0,
              }}>
                View Only
              </span>
            )}
          </div>
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <div className="hidden sm:block" style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: SANS, fontSize: 9, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Draft Cap Used</div>
              <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: cap.overCap ? '#FFB3AE' : '#FFFFFF', lineHeight: 1 }}>
                {fmt(cap.draftCapUsed)}{' '}
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>/ {fmt(capLimit)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <HeaderGhostButton href="/dynasty">Home</HeaderGhostButton>
              <HeaderGhostButton onClick={handleSignOut}>Sign out</HeaderGhostButton>
            </div>
          </div>
        }
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {isMobile ? (
        /* ── Mobile layout ── */
        <>
          <MobileCapBar
            draftCapUsed={cap.draftCapUsed}
            capLimit={capLimit}
            totalCutPenalties={cap.totalCutPenalties}
            overCap={cap.overCap}
            decisionPill={decisionPill}
          />
          <div style={{ paddingBottom: 80 }}>
            {error && (
              <div style={{ margin: '12px 16px 0', background: 'rgba(217,72,59,0.07)', border: `1px solid rgba(217,72,59,0.25)`, borderRadius: 6, padding: '12px 16px', fontFamily: SANS, fontSize: 13, color: '#D9483B' }}>
                {error}
              </div>
            )}
            <div style={{ padding: '16px 16px 8px' }}>
              <SectionLabel right={decisionPill}>
                Active Roster · {activeEntries.length} players{cutEntries.length > 0 ? ` · ${cutEntries.length} cut` : ''}
              </SectionLabel>
              <FilterBar filters={filterState} onChange={setFilterState} showStatus={false} />
            </div>
            <div style={{ margin: '0 16px 20px', background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 8, overflow: 'hidden' }}>
              {displayRows.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: DY.text3 }}>
                  {hasActiveFilters(filterState) ? 'No players match these filters' : 'No active contracts'}
                </div>
              ) : displayRows.map(pair => (
                <PlayerCard
                  key={pair.base.id}
                  pair={pair}
                  readOnly={readOnly}
                  actionLoading={actionLoading}
                  onExtend={() => setExtendTarget(pair)}
                  onCut={() => setCutTarget(pair)}
                  onUncut={() => handleUncut(pair.base.id)}
                />
              ))}
            </div>
            {returningEntries.length > 0 && (
              <div style={{ margin: '0 16px 28px' }}>
                <button
                  className="dy-toggle"
                  onClick={() => setShowPool(v => !v)}
                  style={{
                    width: '100%', minHeight: 44, padding: '12px 16px',
                    background: DY.surface, border: `1px solid ${DY.border}`,
                    borderRadius: showPool ? '8px 8px 0 0' : 8,
                    color: DY.text3, fontFamily: SLAB, fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                  }}
                >
                  <span>Contract Complete · {returningEntries.length} returning</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, transform: showPool ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
                </button>
                {showPool && (
                  <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                    {sortedReturning.map(pair => (
                      <PlayerCard key={pair.base.id} pair={pair} readOnly={true} actionLoading={false} onExtend={() => {}} onCut={() => {}} onUncut={() => {}} />
                    ))}
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${DY.border}`, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                      These players re-enter the draft pool for {ACTIVE_YEAR + 1}. No action required.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prior season penalties (orphan, mobile) */}
            {orphanPenalties.length > 0 && (
              <div style={{ margin: '0 16px 28px' }}>
                <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text4, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10 }}>
                    Prior season penalties
                  </div>
                  {orphanPenalties.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
                      <span style={{ fontFamily: SANS, fontSize: 12, color: DY.text3 }}>{p.player_name ?? 'Unknown'}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: DY.penalty }}>{fmt(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Desktop layout ── */
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 20px 60px' }}>

          <SectionLabel right={decisionPill}>
            Active Roster · {activeEntries.length} players{cutEntries.length > 0 ? ` · ${cutEntries.length} cut` : ''}
          </SectionLabel>

          <div style={{ marginBottom: 16 }}>
            <FilterBar filters={filterState} onChange={setFilterState} showStatus={false} />
          </div>

          {error && (
            <div style={{ background: 'rgba(217,72,59,0.07)', border: `1px solid rgba(217,72,59,0.25)`, borderRadius: 6, padding: '12px 16px', marginBottom: 18, fontFamily: SANS, fontSize: 13, color: '#D9483B' }}>
              {error}
            </div>
          )}

          {/* Single sticky wrapper: cap gauge + table header row */}
          <div style={{ position: 'sticky', top: 0, zIndex: 20, background: DY.bg }}>
            <DraftCapGauge used={cap.draftCapUsed} limit={capLimit} penalties={cap.totalCutPenalties} />
            <FakeTableHead readOnly={readOnly} />
          </div>

          {/* Table body — no thead; FakeTableHead above provides the visual header */}
          <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'clip', marginBottom: 28 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', minWidth: 640 }}>
                <colgroup>
                  <col />
                  <col style={{ width: COL.acquired }} />
                  <col style={{ width: COL.year }} />
                  <col style={{ width: COL.year }} />
                  <col style={{ width: COL.year }} />
                  <col style={{ width: COL.year }} />
                  {!readOnly && <col style={{ width: COL.actions }} />}
                </colgroup>
                <tbody>
                  {displayRows.length === 0 && (
                    <tr>
                      <td colSpan={readOnly ? 6 : 7} style={{ padding: '28px 20px', fontFamily: SANS, fontSize: 13, color: DY.text3, textAlign: 'center' }}>
                        {hasActiveFilters(filterState) ? 'No players match these filters' : 'No active contracts'}
                      </td>
                    </tr>
                  )}
                  {displayRows.map(pair => (
                    <RosterTableRow
                      key={pair.base.id}
                      pair={pair}
                      readOnly={readOnly}
                      actionLoading={actionLoading}
                      onExtend={() => setExtendTarget(pair)}
                      onCut={() => setCutTarget(pair)}
                      onUncut={() => handleUncut(pair.base.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Returning to pool */}
          {returningEntries.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <button
                className="dy-toggle"
                onClick={() => setShowPool(v => !v)}
                style={{
                  width: '100%', padding: '12px 20px',
                  background: DY.surface, border: `1px solid ${DY.border}`,
                  borderRadius: showPool ? '8px 8px 0 0' : 8,
                  color: DY.text3, fontFamily: SLAB, fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                }}
              >
                <span>Contract Complete · {returningEntries.length} returning to pool</span>
                <span style={{ fontFamily: SANS, fontSize: 14, transform: showPool ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
              </button>
              {showPool && (
                <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'clip' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', minWidth: 640 }}>
                      <colgroup>
                        <col />
                        <col style={{ width: COL.acquired }} />
                        <col style={{ width: COL.year }} />
                        <col style={{ width: COL.year }} />
                        <col style={{ width: COL.year }} />
                        <col style={{ width: COL.year }} />
                        {!readOnly && <col style={{ width: COL.actions }} />}
                      </colgroup>
                      <RosterTableHead readOnly={readOnly} />
                      <tbody>
                        {sortedReturning.map(pair => (
                          <PoolTableRow key={pair.base.id} pair={pair} readOnly={readOnly} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '10px 20px', borderTop: `1px solid ${DY.border}`, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                    These players re-enter the draft pool for {ACTIVE_YEAR + 1}. No action required.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prior season penalties (orphan, desktop) */}
          {orphanPenalties.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 8, padding: '14px 20px' }}>
                <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: DY.text4, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>
                  Prior season penalties
                </div>
                {orphanPenalties.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: `1px solid ${DY.border}` }}>
                    <span style={{ fontFamily: SANS, fontSize: 13, color: DY.text3 }}>{p.player_name ?? 'Unknown'}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: DY.penalty }}>{fmt(p.amount)}</span>
                  </div>
                ))}
                <div style={{ paddingTop: 10, fontFamily: SANS, fontSize: 11, color: DY.text4 }}>
                  These penalties carry over from prior-season cuts and reduce the {ACTIVE_YEAR} draft cap.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {!readOnly && extendTarget && (
        <ExtensionModal
          player={extendTarget.player}
          contract={extendTarget.base}
          onClose={() => setExtendTarget(null)}
          onConfirm={handleExtend}
          loading={actionLoading}
        />
      )}
      {!readOnly && cutTarget && (
        <CutModal
          player={cutTarget.player}
          contract={cutTarget.base}
          onClose={() => setCutTarget(null)}
          onConfirm={handleCut}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
