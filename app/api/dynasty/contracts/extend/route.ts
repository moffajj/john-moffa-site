import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ACTIVE_YEAR } from '@/lib/dynasty/rules'
import type { Contract } from '@/lib/dynasty/types'

export async function POST(req: NextRequest) {
  // Auth check via cookie session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contractId, years } = await req.json() as { contractId: string; years: number }
  if (!contractId || ![1, 2, 3].includes(years)) {
    return NextResponse.json({ error: 'contractId and years (1|2|3) are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch contract
  const { data: raw } = await admin.from('contracts').select('*').eq('id', contractId).single()
  if (!raw) return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  const contract = raw as unknown as Contract

  // Verify ownership
  const { data: team } = await admin.from('teams').select('id, user_id').eq('id', contract.team_id).single()
  const { data: appUser } = await admin.from('users').select('role').eq('id', user.id).single()
  const isCommissioner = appUser?.role === 'commissioner'
  if (!isCommissioner && team?.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Must be extension-eligible
  if (!contract.extension_eligible || contract.status !== 'active') {
    return NextResponse.json({ error: 'Contract is not extension eligible' }, { status: 422 })
  }

  // No duplicate extension
  const { data: existing } = await admin
    .from('contracts').select('id').eq('extended_from_contract_id', contractId).single()
  if (existing) return NextResponse.json({ error: 'Contract already extended' }, { status: 409 })

  // 4-year consecutive max check
  if (contract.length + years > 4) {
    return NextResponse.json(
      { error: `Extension of ${years} year(s) would exceed the 4-year consecutive max` },
      { status: 422 }
    )
  }

  const prevSalary = contract.salary_by_year[contract.salary_by_year.length - 1]
  const salaryByYear = [prevSalary + 5, prevSalary + 10, prevSalary + 15].slice(0, years)
  const extensionStartYear = contract.start_year + contract.length - 1

  const { data: newContract, error: insertErr } = await admin
    .from('contracts')
    .insert({
      player_id: contract.player_id,
      team_id: contract.team_id,
      start_year: extensionStartYear,
      length: years,
      salary_by_year: salaryByYear,
      origin: 'extension',
      status: 'active',
      extension_eligible: false,
      extended_from_contract_id: contractId,
    })
    .select()
    .single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
  return NextResponse.json({ contract: newContract })
}
