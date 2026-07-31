import type { Metadata } from 'next'
import { Roboto_Slab, IBM_Plex_Mono } from 'next/font/google'
import Image from 'next/image'

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-slab',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ledger',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Dynasty Contract Manager',
  description: 'Dynasty fantasy football contract and salary cap management.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Dynasty Contract Manager',
    description: 'Fantasy Football · Contract & Cap Management',
    images: [{ url: '/api/og/dynasty', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynasty Contract Manager',
    description: 'Fantasy Football · Contract & Cap Management',
    images: ['/api/og/dynasty'],
  },
}

export default function DynastyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${robotoSlab.variable} ${ibmPlexMono.variable}`}
      style={{ minHeight: '100vh', background: '#F3F6FB' }}
    >
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E3E9F2', padding: '7px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src="/fantrax-logo.webp" alt="Fantrax" width={80} height={22} style={{ objectFit: 'contain' }} />
      </div>
      {children}
    </div>
  )
}
