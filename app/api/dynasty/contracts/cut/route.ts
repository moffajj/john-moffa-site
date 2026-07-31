import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeCutPenalty, ACTIVE_YEAR } from '@/lib/dynasty/rules'
import type { Contract } from '@/lib/dynasty/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contractId } = await req.json() as { contractId: string }
  if (!contractId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const admin = createAdminClient()

  const { data: raw } = await admin.from('contracts').select('*').eq('id', contractId).single()
  if (!raw) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  const contract = raw as unknown as Contract

  if (contract.status !== 'active') {
    return NextResponse.json({ error: 'Only active contracts can be cut' }, { status: 422 })
  }

  // Verify ownership
  const { data: team } = await admin.from('teams').select('id, user_id').eq('id', contract.team_id).single()
  const { data: appUser } = await admin.from('users').select('role').eq('id', user.id).single()
  const isCommissioner = appUser?.role === 'commissioner'
  if (!isCommissioner && team?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: cutErr } = await admin
    .from('contracts').update({ status: 'cut' }).eq('id', contractId)
  if (cutErr) return NextResponse.json({ error: cutErr.message }, { status: 500 })

  // Extension-eligible cuts: zero penalty, salary simply freed
  if (contract.extension_eligible) {
    return NextResponse.json({ ok: true, penalty: null })
  }

  // Signed-not-eligible cuts: dead cap penalty applies
  const penalty = computeCutPenalty(contract, ACTIVE_YEAR)
  if (!penalty) {
    return NextResponse.json({ error: 'No penalty applicable for this contract' }, { status: 422 })
  }

  const { error: penaltyErr } = await admin.from('cut_penalties').insert(
    penalty.yearlyAmounts.map((amount, i) => ({
      contract_id: contractId,
      team_id: contract.team_id,
      year_applied: ACTIVE_YEAR + i,
      amount,
    }))
  )
  if (penaltyErr) return NextResponse.json({ error: penaltyErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, penalty })
}
