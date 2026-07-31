'use client'

import React from 'react'

const SANS = 'Inter, system-ui, sans-serif'

const BTN: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  fontWeight: 500,
  padding: '7px 14px',
  borderRadius: 99,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.9)',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  lineHeight: 1.4,
  transition: 'background 0.1s',
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
}

export function HeaderGhostButton({
  onClick,
  href,
  children,
}: {
  onClick?: () => void
  href?: string
  children: React.ReactNode
}) {
  if (href) {
    return <a href={href} className="dy-hdr-btn" style={BTN}>{children}</a>
  }
  return <button type="button" onClick={onClick} className="dy-hdr-btn" style={BTN}>{children}</button>
}

export function DynastyHeader({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode
}) {
  return (
    <div style={{ background: 'linear-gradient(120deg, #1E63E9 0%, #1AA160 100%)', boxShadow: '0 2px 12px rgba(30,99,233,0.18)' }}>
      <style>{`.dy-hdr-btn:hover { background: rgba(255,255,255,0.25) !important; } .dy-hdr-btn:active { opacity: 0.8; }`}</style>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {left}
        {right}
      </div>
    </div>
  )
}
