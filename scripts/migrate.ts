/**
 * Run: npx tsx scripts/migrate.ts
 * Applies supabase/migrations/001_dynasty_schema.sql against DATABASE_URL.
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { Client } from 'pg'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set in environment')

  const sql = readFileSync(
    join(process.cwd(), 'supabase/migrations/001_dynasty_schema.sql'),
    'utf8'
  )

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('Connected to database')

  await client.query(sql)
  console.log('Migration applied successfully')

  await client.end()
}

main().catch(err => { console.error(err); process.exit(1) })
