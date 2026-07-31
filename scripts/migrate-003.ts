import { Client } from 'pg'
import { readFileSync } from 'fs'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const sql = readFileSync('supabase/migrations/003_returning_to_pool.sql', 'utf8')
  await c.query(sql)
  console.log('Migration 003 applied')
  await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
