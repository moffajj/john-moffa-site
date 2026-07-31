import { Client } from 'pg'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  const users = await c.query('select id, email, role from public.users')
  console.log('public.users rows:', JSON.stringify(users.rows, null, 2))
  const teams = await c.query('select team_code, user_id, manager_email from public.teams order by team_code')
  console.log('teams:', JSON.stringify(teams.rows, null, 2))
  await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
