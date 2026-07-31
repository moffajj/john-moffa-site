import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const logoUrl = `${origin}/fanduel-logo.png`

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#0a1628',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Blue left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 5,
            height: 630,
            background: 'linear-gradient(180deg, #1493FF 0%, #2CB459 100%)',
          }}
        />

        {/* Radial glow — top left */}
        <div
          style={{
            position: 'absolute',
            left: -200,
            top: -200,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20,147,255,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Radial glow — bottom right */}
        <div
          style={{
            position: 'absolute',
            right: -100,
            bottom: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(44,180,89,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Dot grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(20,147,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Left column — text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 80,
            paddingRight: 48,
            width: 680,
            gap: 0,
            position: 'relative',
          }}
        >
          {/* Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#2CB459',
              }}
            />
            <div
              style={{
                color: '#2CB459',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              Application Project · FanDuel
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 20,
              letterSpacing: '-1px',
            }}
          >
            AI Operations
            <br />
            Portal
          </div>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 3,
              background: '#1493FF',
              borderRadius: 2,
              marginBottom: 20,
            }}
          />

          {/* Description */}
          <div
            style={{
              color: '#90b8d8',
              fontSize: 20,
              lineHeight: 1.55,
              marginBottom: 40,
            }}
          >
            Initiative portfolio management framework for
            the Sr. Manager of AI Operations role.
          </div>

          {/* Created by */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 2,
                background: 'rgba(20,147,255,0.4)',
                borderRadius: 1,
              }}
            />
            <div
              style={{
                color: '#5a84a8',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              Created by John Moffa · johnmoffa.com
            </div>
          </div>
        </div>

        {/* Right column — logo + stat cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 520,
            gap: 28,
            position: 'relative',
          }}
        >
          {/* Logo card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(20,147,255,0.07)',
              border: '1px solid rgba(20,147,255,0.2)',
              borderRadius: 20,
              padding: '28px 40px',
              width: 360,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="FanDuel"
              width={280}
              height={158}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Mini stat row */}
          <div
            style={{
              display: 'flex',
              gap: 12,
            }}
          >
            {[
              { label: 'Initiatives', value: '12', color: '#1493FF' },
              { label: 'On Track', value: '7', color: '#2CB459' },
              { label: 'At Risk', value: '3', color: '#f59e0b' },
              { label: 'Blocked', value: '2', color: '#ef4444' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(13,31,56,0.8)',
                  border: `1px solid rgba(20,147,255,0.15)`,
                  borderRadius: 12,
                  padding: '12px 18px',
                  minWidth: 72,
                }}
              >
                <div
                  style={{
                    color: s.color,
                    fontSize: 26,
                    fontWeight: 800,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    color: '#5a84a8',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
