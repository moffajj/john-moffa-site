import OuraDashboard from './OuraDashboard'
import { getPublicOuraStats, type OuraStatRow } from '@/lib/oura/server'

export const metadata = {
  title: 'Oura Bros',
  description: 'Health stats synced from Oura Ring.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export type OuraStat = OuraStatRow

export default async function OuraBrosPage() {
  let stats: OuraStat[]
  try {
    stats = await getPublicOuraStats()
  } catch {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: 14 }}>Failed to load stats. Try again later.</p>
      </main>
    )
  }
  return <OuraDashboard stats={stats} />
}
