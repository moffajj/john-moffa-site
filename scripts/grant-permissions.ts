import { Client } from 'pg'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()
  await c.query(`
    GRANT ALL ON TABLE public.users         TO anon, authenticated, service_role;
    GRANT ALL ON TABLE public.teams         TO anon, authenticated, service_role;
    GRANT ALL ON TABLE public.players       TO anon, authenticated, service_role;
    GRANT ALL ON TABLE public.contracts     TO anon, authenticated, service_role;
    GRANT ALL ON TABLE public.cut_penalties TO anon, authenticated, service_role;
    GRANT ALL ON TABLE public.team_history  TO anon, authenticated, service_role;
  `)
  console.log('grants applied')
  await c.end()
}
main().catch(e => { console.error(e); process.exit(1) })
