import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import LeagueHome from './components/LeagueHome'
import type { LeaguePlayer } from './components/LeagueHome'
import type { Contract, Player, Team, AppUser, CutPenalty, AcquisitionType } from '@/lib/dynasty/types'
import { computeCapSummary, ACTIVE_YEAR, DRAFT_CAP } from '@/lib/dynasty/rules'

export default async function DynastyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dynasty/login')

  const admin = createAdminClient()

  const [
    { data: appUser },
    { data: teams },
    { data: contractRows },
    { data: penalties },
  ] = await Promise.all([
    admin.from('users').select('*').eq('id', user.id).single(),
    admin.from('teams').select('*').order('name'),
    admin.from('contracts').select('*').in('status', ['active', 'returning_to_pool']),
    admin.from('cut_penalties').select('*').eq('year_applied', ACTIVE_YEAR),
  ])

  // All players referenced by these contracts
  const playerIds = [...new Set((contractRows ?? []).map(c => c.player_id))]
  const { data: playerRows } = playerIds.length
    ? await admin.from('players').select('*').in('id', playerIds)
    : { data: [] as typeof contractRows }

  const playerMap: Record<string, Player> = Object.fromEntries(
    (playerRows ?? []).map(p => [p.id, p as unknown as Player])
  )
  const teamMap: Record<string, string> = Object.fromEntries(
    (teams ?? []).map(t => [t.id, t.name])
  )

  // Group base + extension contracts for true end-year calculation
  const allContracts = (contractRows ?? []) as unknown as Contract[]
  const baseContracts = allContracts.filter(c => !c.extended_from_contract_id)
  const extContracts  = allContracts.filter(c => !!c.extended_from_contract_id)
  const extByBaseId   = new Map(extContracts.map(e => [e.extended_from_contract_id!, e]))

  // Which base contracts have already been extended (for eligibility)
  const extendedFromIds = new Set<string>(extContracts.map(e => e.extended_from_contract_id!))

  // League-wide player list for search and section data
  const leaguePlayers: LeaguePlayer[] = baseContracts
    .filter(c => playerMap[c.player_id])
    .map(c => {
      const ext = extByBaseId.get(c.id) ?? null
      const trueEndYear = ext
        ? ext.start_year + ext.length - 1
        : c.start_year + c.length - 1
      const isExtEligible = c.status === 'active' && c.extension_eligible && !extendedFromIds.has(c.id)
      return {
        contractId:        c.id,
        name:              playerMap[c.player_id].name,
        position:          playerMap[c.player_id].position,
        nflTeam:           playerMap[c.player_id].nfl_team,
        teamId:            c.team_id,
        teamName:          teamMap[c.team_id] ?? 'Unknown',
        salary:            c.salary_by_year[0] ?? 0,
        acquisitionType:   c.acquisition_type as AcquisitionType | null,
        extensionEligible: isExtEligible,
        contractEndYear:   trueEndYear,
        status:            c.status as 'active' | 'returning_to_pool',
      }
    })

  // Per-team summaries
  const teamSummaries = (teams ?? []).map(team => {
    const teamContracts = allContracts.filter(c => c.team_id === team.id)
    const activeContracts = teamContracts.filter(c => c.status === 'active')
    const cap = computeCapSummary(
      activeContracts,
      (penalties ?? []).filter(p => p.team_id === team.id) as unknown as CutPenalty[],
      (team as unknown as Team).draft_cap ?? DRAFT_CAP,
      ACTIVE_YEAR,
    )
    const distinctActive = new Set(activeContracts.map(c => c.player_id)).size
    const distinctTotal  = new Set(teamContracts.map(c => c.player_id)).size
    const pending = activeContracts.filter(
      c => c.extension_eligible && !extendedFromIds.has(c.id)
    ).length

    return {
      team: {
        id: team.id,
        name: team.name,
        team_code: (team as unknown as Team).team_code,
        manager_email: (team as unknown as Team & { manager_email: string | null }).manager_email ?? null,
        draft_cap: (team as unknown as Team).draft_cap ?? DRAFT_CAP,
      },
      capUsed:          cap.draftCapUsed,
      capRemaining:     cap.draftCapRemaining,
      capLimit:         (team as unknown as Team).draft_cap ?? DRAFT_CAP,
      overCap:          cap.overCap,
      activePlayers:    distinctActive,
      totalPlayers:     distinctTotal,
      pendingDecisions: pending,
    }
  })

  // Returning-to-pool (base contracts only)
  const returningPlayers = baseContracts
    .filter(c => c.status === 'returning_to_pool' && playerMap[c.player_id])
    .map(c => ({
      id:               c.id,
      name:             playerMap[c.player_id].name,
      position:         playerMap[c.player_id].position,
      nfl_team:         playerMap[c.player_id].nfl_team,
      teamId:           c.team_id,
      teamName:         teamMap[c.team_id] ?? 'Unknown',
      salary:           c.salary_by_year[0] ?? 0,
      acquisition_type: c.acquisition_type as AcquisitionType | null,
    }))

  const userTeam = (teams ?? []).find(
    t => (t as unknown as Team & { manager_email: string | null }).manager_email?.toLowerCase() === user.email?.toLowerCase()
  )

  return (
    <LeagueHome
      appUser={(appUser ?? { id: user.id, email: user.email ?? '', role: 'manager' }) as AppUser}
      currentUserTeamId={userTeam?.id ?? null}
      teamSummaries={teamSummaries}
      returningPlayers={returningPlayers}
      leaguePlayers={leaguePlayers}
      teams={(teams ?? []).map(t => ({ id: t.id, name: t.name }))}
    />
  )
}
