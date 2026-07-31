import { Client } from 'pg'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()
  await c.query(`
    ALTER TABLE public.contracts
      ADD COLUMN IF NOT EXISTS acquisition_type text
      CHECK (acquisition_type IN ('Drafted', 'Free Agent', 'Trade', 'Under Contract'))
  `)
  console.log('Migration 005 applied: acquisition_type column added')
  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
