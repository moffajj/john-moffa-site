import { readFileSync } from 'fs'
import { join } from 'path'
import { Client } from 'pg'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const sql = readFileSync(join(process.cwd(), 'supabase/migrations/002_manager_emails.sql'), 'utf8')
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  await client.query(sql)
  console.log('Migration 002 applied')
  await client.end()
}

main().catch(err => { console.error(err); process.exit(1) })
