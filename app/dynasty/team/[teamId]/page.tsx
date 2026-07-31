import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import DynastyDashboard from '../../components/DynastyDashboard'
import type { Contract, Player, Team, AppUser, CutPenalty } from '@/lib/dynasty/types'
import { ACTIVE_YEAR } from '@/lib/dynasty/rules'

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>
}) {
  const { teamId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dynasty/login')

  const admin = createAdminClient()

  const [
    { data: appUser },
    { data: team },
    { data: userTeam },
    { data: allTeamRows },
  ] = await Promise.all([
    admin.from('users').select('*').eq('id', user.id).single(),
    admin.from('teams').select('*').eq('id', teamId).single(),
    admin.from('teams').select('id').eq('manager_email', user.email!.toLowerCase()).single(),
    admin.from('teams').select('id, name').order('name'),
  ])

  if (!team) redirect('/dynasty')

  const isCommissioner = appUser?.role === 'commissioner'
  const isOwnTeam = userTeam?.id === teamId
  const readOnly = !isCommissioner && !isOwnTeam

  const [{ data: contractRows }, { data: penalties }] = await Promise.all([
    admin
      .from('contracts')
      .select('*')
      .eq('team_id', teamId)
      .in('status', ['active', 'cut', 'returning_to_pool'])
      .order('created_at'),
    admin
      .from('cut_penalties')
      .select('*')
      .eq('team_id', teamId)
      .eq('year_applied', ACTIVE_YEAR),
  ])

  const playerIds = [...new Set((contractRows ?? []).map(c => c.player_id))]
  const { data: playerRows } = playerIds.length
    ? await admin.from('players').select('*').in('id', playerIds)
    : { data: [] as typeof contractRows }

  const playerMap = Object.fromEntries(
    (playerRows ?? []).map(p => [p.id, p as unknown as Player])
  )

  const allContracts = (contractRows ?? []).map(r => r as unknown as Contract)
  const baseContracts = allContracts.filter(c => !c.extended_from_contract_id)
  const extContracts  = allContracts.filter(c => !!c.extended_from_contract_id)
  const extByBaseId   = new Map(extContracts.map(e => [e.extended_from_contract_id!, e]))

  const rosterEntries = baseContracts
    .filter(c => playerMap[c.player_id])
    .map(c => ({
      base:      c,
      extension: extByBaseId.get(c.id) ?? null,
      player:    playerMap[c.player_id],
    }))

  const allPenalties = (penalties ?? []) as unknown as CutPenalty[]
  // Orphan penalties have no contract_id — they're from prior-season cuts with no roster entry
  const activePenalties = allPenalties.filter(p => p.contract_id !== null)
  const orphanPenalties = allPenalties.filter(p => p.contract_id === null)

  return (
    <DynastyDashboard
      appUser={(appUser ?? { id: user.id, email: user.email ?? '', role: 'manager' }) as AppUser}
      team={team as unknown as Team}
      rosterEntries={rosterEntries}
      cutPenalties={activePenalties}
      orphanPenalties={orphanPenalties}
      readOnly={readOnly}
      allTeams={(allTeamRows ?? []) as unknown as Team[]}
    />
  )
}
