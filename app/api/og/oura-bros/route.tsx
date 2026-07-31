import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

const R1 = 140, R2 = 105, R3 = 70
const CX = 170, CY = 170
const SW = 14
const arc = (r: number, pct: number) => `${pct * 2 * Math.PI * r} ${2 * Math.PI * r}`

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          display: 'flex',
          background: '#141e2e',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: 'absolute', left: 520, top: -180, width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,36,153,0.28) 0%, transparent 65%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', left: -120, top: 180, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,20,104,0.18) 0%, transparent 65%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', right: 80, bottom: -100, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,94,36,0.2) 0%, transparent 65%)',
          display: 'flex',
        }} />

        {/* Left — text */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          paddingLeft: 80, paddingRight: 40, flex: 1,
        }}>
          <div style={{ display: 'flex', fontSize: 13, color: '#4a6090', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>
            johnmoffa.com/oura-bros
          </div>

          <div style={{ display: 'flex', fontSize: 90, fontWeight: 800, color: '#f7f1e8', lineHeight: 1, marginBottom: 22, letterSpacing: '-2px' }}>
            Oura Bros
          </div>

          <div style={{ display: 'flex', fontSize: 22, color: '#8a98b8', lineHeight: 1.6, marginBottom: 44 }}>
            Live health stats synced from Oura Ring.
          </div>

          {/* Metric pills */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Readiness', color: '#f0b84d' },
              { label: 'Sleep',     color: '#55aaff' },
              { label: 'Activity',  color: '#4ddd7a' },
              { label: 'Stress',    color: '#ff6b6b' },
            ].map(({ label, color }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: `${color}18`,
                border: `1px solid ${color}50`,
                borderRadius: 24, paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'flex' }} />
                <span style={{ color, fontSize: 14, fontWeight: 700 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — concentric rings */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 400, paddingRight: 60, flexShrink: 0,
        }}>
          <svg width={340} height={340} viewBox="0 0 340 340">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5c1468" />
                <stop offset="100%" stopColor="#f0b84d" />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0e2499" />
                <stop offset="100%" stopColor="#55aaff" />
              </linearGradient>
              <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#065e24" />
                <stop offset="100%" stopColor="#4ddd7a" />
              </linearGradient>
            </defs>

            {/* Tracks */}
            <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#1c2838" strokeWidth={SW} />
            <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#1c2838" strokeWidth={SW} />
            <circle cx={CX} cy={CY} r={R3} fill="none" stroke="#1c2838" strokeWidth={SW} />

            {/* Readiness — 82% — gold */}
            <circle cx={CX} cy={CY} r={R1} fill="none" stroke="url(#g1)" strokeWidth={SW}
              strokeDasharray={arc(R1, 0.82)} strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`} />

            {/* Sleep — 76% — blue */}
            <circle cx={CX} cy={CY} r={R2} fill="none" stroke="url(#g2)" strokeWidth={SW}
              strokeDasharray={arc(R2, 0.76)} strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`} />

            {/* Activity — 91% — green */}
            <circle cx={CX} cy={CY} r={R3} fill="none" stroke="url(#g3)" strokeWidth={SW}
              strokeDasharray={arc(R3, 0.91)} strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`} />

            {/* Center labels */}
            <text x={CX} y={CY - 6} textAnchor="middle" fill="#f7f1e8" fontSize={18} fontWeight={700} fontFamily="system-ui">RING</text>
            <text x={CX} y={CY + 14} textAnchor="middle" fill="#6878a0" fontSize={13} fontFamily="system-ui">STATS</text>
          </svg>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
