import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  if (contract.status !== 'cut') {
    return NextResponse.json({ error: 'Contract is not in cut state' }, { status: 422 })
  }

  const { data: team } = await admin.from('teams').select('id, user_id').eq('id', contract.team_id).single()
  const { data: appUser } = await admin.from('users').select('role').eq('id', user.id).single()
  const isCommissioner = appUser?.role === 'commissioner'
  if (!isCommissioner && team?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: updateErr } = await admin
    .from('contracts').update({ status: 'active' }).eq('id', contractId)
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Remove dead cap penalties recorded at cut time
  const { error: deleteErr } = await admin
    .from('cut_penalties').delete().eq('contract_id', contractId)
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
