/**
 * Run: DATABASE_URL=... npx tsx scripts/seed-dynasty.ts
 *
 * Clears and re-seeds players, contracts, and transaction_history.
 * Does NOT touch teams (they carry user_ids set in production).
 *
 * contract_status mapping:
 *   signed_not_eligible              → active, extension_eligible=false
 *                                      + a pre-seeded extension contract with real future salaries
 *   extension_eligible_drafted_2025  → active, extension_eligible=true
 *   extension_eligible_mid_season_pickup → active, extension_eligible=true
 *   contract_complete_returning_to_pool  → returning_to_pool, extension_eligible=false
 */
import { readFileSync } from 'fs'
import { Client } from 'pg'

const ROSTER_PATH = '/Users/jmoffa/Downloads/FANTRAX SALARIES 2025/rosters_normalized.json'
const TXN_PATH    = '/Users/jmoffa/Downloads/FANTRAX SALARIES 2025/transaction_history_2025.csv'
const ACTIVE_YEAR = 2026

const FANTASY_TEAM_MAP: Record<string, string> = {
  brad: 'BRAD', david: 'DAVID', doyle: 'DOYLE', jake: 'JAKE',
  joe: 'JOE', kenny: 'KENNY', mitch: 'MITCH', miz: 'MIZ',
  moffa: 'MOFFA', pat: 'PAT', pope: 'POPE', wolf: 'WOLF',
}

const TEAM_NAMES: Record<string, string> = {
  BRAD: 'Brad', DAVID: 'David', DOYLE: 'Doyle', JAKE: 'Jake',
  JOE: 'Joe', KENNY: 'Kenny', MITCH: 'Mitch', MIZ: 'Miz',
  MOFFA: 'Moffa', PAT: 'Pat', POPE: 'Pope', WOLF: 'Wolf',
}

// Standalone cut penalties for players no longer on any roster
const ORPHAN_CUT_PENALTIES: Array<{ team: string; player_name: string; amount: number }> = [
  { team: 'KENNY', player_name: 'Zack Moss',          amount: 4 },
  { team: 'KENNY', player_name: 'Anthony Richardson', amount: 5 },
]

interface RosterRow {
  team: string
  player: string
  pos: string
  nfl_team: string
  salary_2025: number
  years_remaining_after_2025: number
  contract_status:
    | 'signed_not_eligible'
    | 'extension_eligible_drafted_2025'
    | 'extension_eligible_mid_season_pickup'
    | 'contract_complete_returning_to_pool'
  acquisition_type: 'Drafted' | 'Free Agent' | 'Trade' | 'Under Contract'
  salary_by_year?: Record<string, number>
}

interface ContractFields {
  player_id: string; team_id: string
  start_year: number; length: number
  salary_by_year: number[]
  origin: string; status: string
  extension_eligible: boolean; acquisition_type: string
}

function buildContracts(
  row: RosterRow, teamId: string, playerId: string
): { base: ContractFields; ext?: ContractFields } {
  const salary = Math.round(row.salary_2025)
  const acq    = row.acquisition_type

  switch (row.contract_status) {
    case 'extension_eligible_drafted_2025':
    case 'extension_eligible_mid_season_pickup':
      return {
        base: {
          player_id: playerId, team_id: teamId,
          start_year: ACTIVE_YEAR, length: 1,
          salary_by_year: [salary],
          origin: 'free_agent', status: 'active',
          extension_eligible: true, acquisition_type: acq,
        }
      }

    case 'signed_not_eligible': {
      const base: ContractFields = {
        player_id: playerId, team_id: teamId,
        start_year: ACTIVE_YEAR, length: 1,
        salary_by_year: [salary],
        origin: 'free_agent', status: 'active',
        extension_eligible: false, acquisition_type: acq,
      }
      // salary_by_year in the JSON contains future year salaries keyed by NFL season year
      if (row.salary_by_year && Object.keys(row.salary_by_year).length > 0) {
        const futureSals = Object.entries(row.salary_by_year)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, v]) => Number(v))
        const ext: ContractFields = {
          player_id: playerId, team_id: teamId,
          start_year: ACTIVE_YEAR,
          length: futureSals.length,
          salary_by_year: futureSals,
          origin: 'extension', status: 'active',
          extension_eligible: false, acquisition_type: acq,
        }
        return { base, ext }
      }
      return { base }
    }

    case 'contract_complete_returning_to_pool':
      return {
        base: {
          player_id: playerId, team_id: teamId,
          start_year: ACTIVE_YEAR, length: 1,
          salary_by_year: [salary],
          origin: 'free_agent', status: 'returning_to_pool',
          extension_eligible: false, acquisition_type: acq,
        }
      }
  }
}

function parseTransactionCsv(raw: string) {
  const lines = raw.trim().split('\n')
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
    return {
      player_name:      cols[0],
      nfl_team:         cols[1],
      position:         cols[2],
      transaction_type: cols[3],
      fantasy_team:     cols[4],
      bid:              cols[5] ? parseInt(cols[5], 10) : null,
      transaction_date: cols[6],
      week:             parseInt(cols[7], 10) || 0,
    }
  }).filter(r => r.player_name)
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')

  const rows: RosterRow[] = JSON.parse(readFileSync(ROSTER_PATH, 'utf8'))
  console.log(`Loaded ${rows.length} roster rows`)

  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()

  // ── 0. Clear existing contract/player data (keep teams) ──────────────────
  await c.query('TRUNCATE public.cut_penalties CASCADE')
  await c.query('TRUNCATE public.contracts CASCADE')
  await c.query('TRUNCATE public.team_history CASCADE')
  await c.query('TRUNCATE public.players CASCADE')
  await c.query('TRUNCATE public.transaction_history CASCADE')
  console.log('Cleared existing data')

  // ── 1. Fetch team id map ──────────────────────────────────────────────────
  const teamRes = await c.query<{ id: string; team_code: string }>('SELECT id, team_code FROM public.teams')
  const teamIdMap: Record<string, string> = {}
  for (const t of teamRes.rows) teamIdMap[t.team_code] = t.id

  const missingTeams = [...new Set(rows.map(r => r.team))].filter(code => !teamIdMap[code])
  for (const code of missingTeams) {
    const res = await c.query<{ id: string }>(
      `INSERT INTO public.teams (name, team_code, draft_cap, fa_budget)
       VALUES ($1, $2, 200, 100)
       ON CONFLICT (team_code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [TEAM_NAMES[code] ?? code, code]
    )
    teamIdMap[code] = res.rows[0].id
  }
  console.log(`Team map ready (${Object.keys(teamIdMap).length} teams)`)

  // ── 2. Insert players (deduplicated by name) ──────────────────────────────
  const playerIdMap: Record<string, string> = {}
  for (const row of rows) {
    if (playerIdMap[row.player]) continue
    const res = await c.query<{ id: string }>(
      `INSERT INTO public.players (name, position, nfl_team)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [row.player, row.pos, row.nfl_team]
    )
    playerIdMap[row.player] = res.rows.length
      ? res.rows[0].id
      : (await c.query<{ id: string }>('SELECT id FROM public.players WHERE name=$1', [row.player])).rows[0].id
  }
  console.log(`Inserted ${Object.keys(playerIdMap).length} players`)

  // ── 3. Insert contracts ───────────────────────────────────────────────────
  let baseCount = 0, extCount = 0
  for (const row of rows) {
    const teamId   = teamIdMap[row.team]
    const playerId = playerIdMap[row.player]
    if (!teamId || !playerId) { console.warn('Missing id for', row.player, row.team); continue }

    const { base, ext } = buildContracts(row, teamId, playerId)

    // Insert base contract and capture its ID
    const baseRes = await c.query<{ id: string }>(
      `INSERT INTO public.contracts
         (player_id, team_id, start_year, length, salary_by_year, origin, status, extension_eligible, acquisition_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [base.player_id, base.team_id, base.start_year, base.length,
       base.salary_by_year, base.origin, base.status, base.extension_eligible,
       base.acquisition_type]
    )
    const baseId = baseRes.rows[0].id
    baseCount++

    // Insert pre-seeded extension if present (holdover multi-year contracts)
    if (ext) {
      await c.query(
        `INSERT INTO public.contracts
           (player_id, team_id, start_year, length, salary_by_year, origin, status,
            extension_eligible, acquisition_type, extended_from_contract_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [ext.player_id, ext.team_id, ext.start_year, ext.length,
         ext.salary_by_year, ext.origin, ext.status, ext.extension_eligible,
         ext.acquisition_type, baseId]
      )
      extCount++
    }
  }
  console.log(`Inserted ${baseCount} base contracts, ${extCount} pre-seeded extension contracts`)

  // ── 4. Standalone cut penalties (prior-season, no roster entry) ───────────
  for (const p of ORPHAN_CUT_PENALTIES) {
    const teamId = teamIdMap[p.team]
    if (!teamId) { console.warn('No team id for', p.team); continue }
    await c.query(
      `INSERT INTO public.cut_penalties (team_id, year_applied, amount, player_name)
       VALUES ($1, $2, $3, $4)`,
      [teamId, ACTIVE_YEAR, p.amount, p.player_name]
    )
  }
  console.log(`Inserted ${ORPHAN_CUT_PENALTIES.length} standalone cut penalties`)

  // ── 5. Load transaction history ───────────────────────────────────────────
  const txnRaw  = readFileSync(TXN_PATH, 'utf8')
  const txnRows = parseTransactionCsv(txnRaw)
  let txnCount  = 0
  for (const t of txnRows) {
    const fantasyTeam = FANTASY_TEAM_MAP[t.fantasy_team.toLowerCase()] ?? t.fantasy_team
    await c.query(
      `INSERT INTO public.transaction_history
         (player_name, nfl_team, position, transaction_type, fantasy_team, bid, transaction_date, week)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [t.player_name, t.nfl_team, t.position, t.transaction_type, fantasyTeam, t.bid, t.transaction_date, t.week]
    )
    txnCount++
  }
  console.log(`Inserted ${txnCount} transaction history rows`)

  await c.end()
  console.log('Seed complete')
}

main().catch(e => { console.error(e); process.exit(1) })
