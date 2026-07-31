import { Client } from 'pg'
import { readFileSync } from 'fs'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const sql = readFileSync('supabase/migrations/006_orphan_cut_penalties.sql', 'utf8')
  await c.query(sql)
  console.log('Migration 006 applied: contract_id nullable, player_name added to cut_penalties')
  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
