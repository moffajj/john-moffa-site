'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const DY = {
  bg:           '#F3F6FB',
  surface:      '#FFFFFF',
  border:       '#E3E9F2',
  borderAccent: 'rgba(30,99,233,0.22)',
  accent:       '#1E63E9',
  accentDim:    'rgba(30,99,233,0.10)',
  text:         '#1A2333',
  text2:        '#4A5568',
  text3:        '#7C8AA0',
  penalty:      '#D9483B',
  gradient:     'linear-gradient(120deg, #1E63E9 0%, #1AA160 100%)',
}

const SLAB = 'var(--font-slab), Georgia, serif'
const MONO = 'var(--font-ledger), "Courier New", monospace'
const SANS = 'Inter, system-ui, sans-serif'

const ERROR_MESSAGES: Record<string, string> = {
  not_in_league: 'This email is not registered for the league. Contact your commissioner.',
  auth_failed:   'Sign-in link was invalid or expired. Request a new one.',
  missing_code:  'Incomplete sign-in link. Try requesting a new one.',
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) setError(ERROR_MESSAGES[urlError] ?? `Error: ${urlError}`)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const res = await fetch('/api/dynasty/auth/request-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo: `${window.location.origin}/dynasty/auth/callback` }),
    })
    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      background: DY.surface,
      border: `1px solid ${DY.border}`,
      borderRadius: 8,
      padding: 32,
      boxShadow: '0 1px 3px rgba(20,40,80,0.06)',
    }}>
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16, lineHeight: 1 }}>✉</div>
          <div style={{ fontFamily: SLAB, fontSize: 18, fontWeight: 700, color: DY.text, marginBottom: 8 }}>Check your inbox</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: DY.text3, lineHeight: 1.6 }}>
            Sign-in link sent to{' '}
            <span style={{ fontFamily: MONO, color: DY.text2 }}>{email}</span>.
          </div>
          <button
            onClick={() => { setSent(false); setEmail(''); setError(null) }}
            style={{ marginTop: 24, background: 'transparent', border: 'none', color: DY.accent, fontFamily: SANS, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontFamily: SANS, fontSize: 10, fontWeight: 700, color: DY.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            League email address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%', padding: '11px 13px',
              background: '#FFFFFF',
              border: `1px solid ${DY.border}`,
              borderRadius: 4, color: DY.text,
              fontFamily: MONO, fontSize: 14,
              outline: 'none', marginBottom: 14,
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ fontFamily: SANS, fontSize: 12, color: DY.penalty, marginBottom: 12, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !email}
            style={{
              width: '100%', padding: '12px 0',
              background: DY.gradient,
              border: 'none',
              borderRadius: 4, color: '#FFFFFF',
              fontFamily: SLAB, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Send sign-in link'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function DynastyLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: DY.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: SANS, fontSize: 9, color: DY.accent, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
            Dynasty League
          </div>
          <div style={{ fontFamily: SLAB, fontSize: 30, fontWeight: 700, color: DY.text, lineHeight: 1.1, marginBottom: 8 }}>
            Contract Manager
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: DY.text3 }}>
            Sign in with your league email address
          </div>
        </div>

        <Suspense fallback={
          <div style={{ background: DY.surface, border: `1px solid ${DY.border}`, borderRadius: 8, padding: 32, height: 148, boxShadow: '0 1px 3px rgba(20,40,80,0.06)' }} />
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
