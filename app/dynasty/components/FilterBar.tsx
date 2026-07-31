'use client'

import type { AcquisitionType } from '@/lib/dynasty/types'

export const FILTER_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const
export type PosFilter = '' | (typeof FILTER_POSITIONS)[number]
export type AcqFilter = '' | AcquisitionType
export type StatusFilter = '' | 'eligible' | 'signed' | 'complete'

export interface FilterState {
  position: PosFilter
  acquisition: AcqFilter
  status: StatusFilter
  teamId: string
}

export const EMPTY_FILTERS: FilterState = { position: '', acquisition: '', status: '', teamId: '' }

export function hasActiveFilters(f: FilterState): boolean {
  return !!(f.position || f.acquisition || f.status || f.teamId)
}

export interface StatusOption {
  key: StatusFilter
  label: string
}

export const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { key: 'eligible', label: 'Eligible'  },
  { key: 'signed',   label: 'Signed'    },
  { key: 'complete', label: 'Complete'  },
]

// ── Design tokens (minimal, intentionally standalone) ─────────────────────────
const _b   = '#E3E9F2'
const _ba  = 'rgba(30,99,233,0.25)'
const _acc = '#1E63E9'
const _adm = 'rgba(30,99,233,0.10)'
const _t3  = '#7C8AA0'
const _s2  = '#FFFFFF'
const _SANS = 'Inter, system-ui, sans-serif'

const POS_COLOR: Record<string, string> = {
  QB: '#60A5FA', RB: '#4ADE80', WR: '#FBBF24', TE: '#FB923C', K: '#A78BFA', DEF: '#94A3B8',
}

const ACQ_LABELS: Record<AcquisitionType, string> = {
  'Drafted':        'Drafted',
  'Free Agent':     'FA',
  'Trade':          'Trade',
  'Under Contract': 'Contract',
}

// ── FilterBar component ───────────────────────────────────────────────────────
export function FilterBar({
  filters,
  onChange,
  teams = [],
  showTeam = false,
  showStatus = true,
  statusOptions = DEFAULT_STATUS_OPTIONS,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  teams?: { id: string; name: string }[]
  showTeam?: boolean
  showStatus?: boolean
  statusOptions?: StatusOption[]
}) {
  const active = hasActiveFilters(filters)

  function chip(
    label: string,
    isOn: boolean,
    onToggle: () => void,
    color = _acc,
    bg    = _adm,
    border = _ba,
  ) {
    return (
      <button
        key={label}
        onClick={onToggle}
        style={{
          padding: '5px 11px', borderRadius: 99, cursor: 'pointer',
          border: `1px solid ${isOn ? border : _b}`,
          background: isOn ? bg : '#FFFFFF',
          color: isOn ? color : _t3,
          fontFamily: _SANS, fontSize: 11, fontWeight: isOn ? 700 : 500,
          transition: 'all 0.12s', whiteSpace: 'nowrap', lineHeight: 1.5,
        }}
      >
        {label}
      </button>
    )
  }

  const sep = <div key="sep" style={{ width: 1, height: 16, background: _b, flexShrink: 0 }} />

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>

      {/* Position */}
      {FILTER_POSITIONS.map(pos => {
        const c = POS_COLOR[pos] ?? '#94A3B8'
        const isOn = filters.position === pos
        return chip(pos, isOn, () => onChange({ ...filters, position: isOn ? '' : pos }), c, `${c}22`, `${c}60`)
      })}

      {sep}

      {/* Acquisition type */}
      {(Object.keys(ACQ_LABELS) as AcquisitionType[]).map(acq => {
        const isOn = filters.acquisition === acq
        return chip(ACQ_LABELS[acq], isOn, () => onChange({ ...filters, acquisition: isOn ? '' : acq }))
      })}

      {showStatus && statusOptions.length > 0 && (
        <>
          {sep}
          {statusOptions.map(({ key, label }) => {
            const isOn = filters.status === key
            return chip(label, isOn, () => onChange({ ...filters, status: isOn ? '' : key }))
          })}
        </>
      )}

      {showTeam && teams.length > 0 && (
        <>
          {sep}
          <select
            value={filters.teamId}
            onChange={e => onChange({ ...filters, teamId: e.target.value })}
            style={{
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${filters.teamId ? _ba : _b}`,
              background: _s2,
              color: filters.teamId ? _acc : _t3,
              fontFamily: _SANS, fontSize: 11,
              appearance: 'none', outline: 'none',
            }}
          >
            <option value="">All teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </>
      )}

      {active && (
        <>
          {sep}
          {chip('Reset ×', false, () => onChange(EMPTY_FILTERS))}
        </>
      )}
    </div>
  )
}
