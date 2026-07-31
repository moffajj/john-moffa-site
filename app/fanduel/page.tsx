import type { Metadata } from 'next'
import FanDuelDashboard from './FanDuelDashboard'

export const metadata: Metadata = {
  title: 'AI Operations Portfolio | FanDuel Application',
  description: 'AI Initiative Portfolio Management Framework built for the Sr. Manager of AI Operations and Strategy role at FanDuel.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'AI Operations Portal — FanDuel',
    description: 'Initiative portfolio management framework for the Sr. Manager of AI Operations role. Created by John Moffa.',
    type: 'website',
    images: [{ url: '/api/og/fanduel', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Operations Portal — FanDuel',
    description: 'Initiative portfolio management framework for the Sr. Manager of AI Operations role. Created by John Moffa.',
    images: ['/api/og/fanduel'],
  },
}

export default function FanDuelPage() {
  return <FanDuelDashboard />
}
