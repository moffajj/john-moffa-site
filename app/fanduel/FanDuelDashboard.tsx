'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'

type Status = 'On Track' | 'At Risk' | 'Blocked'
type Priority = 'High' | 'Medium' | 'Low'
type Milestone = { name: string; done: boolean }
type Initiative = {
  id: number; name: string; unit: string; status: Status; priority: Priority
  owner: string; impact: string; progress: number; description: string
  milestones: Milestone[]; blockers: string | null; stakeholders: string[]; updated: string
}

const FD = {
  blue:    '#1493FF',
  navy:    '#1D365E',
  green:   '#2CB459',
  bg:      '#0a1628',
  card:    '#0d1f38',
  card2:   '#112340',
  border:  'rgba(20,147,255,0.14)',
  hover:   '#142a48',
  text:    '#ffffff',
  text2:   '#d4e8fb',
  text3:   '#90b8d8',
  text4:   '#5a84a8',
  surface: '#0a1525',
}

const INITIATIVES: Initiative[] = [
  {
    id: 1, name: 'AI-Powered Bet Recommendations Engine', unit: 'Sportsbook',
    status: 'On Track', priority: 'High', owner: 'Alex Chen',
    impact: '+8% bet conversion rate', progress: 75,
    description: 'ML model that personalizes bet recommendations based on user history, preferences, and real-time odds movements. Uses collaborative filtering with real-time feature engineering on live game and odds data.',
    milestones: [
      { name: 'Model training complete', done: true },
      { name: 'A/B testing framework live', done: true },
      { name: 'Rollout to 10% of users', done: true },
      { name: 'Full production rollout', done: false },
    ],
    blockers: null,
    stakeholders: ['VP Product', 'Head of Sportsbook', 'Data Science Lead'],
    updated: '2 days ago',
  },
  {
    id: 2, name: 'Responsible Gaming Early Warning System', unit: 'Sportsbook',
    status: 'On Track', priority: 'High', owner: 'Sarah Martinez',
    impact: 'Regulatory compliance and user safety', progress: 60,
    description: 'Real-time AI model detecting early signs of problematic gambling behavior and triggering proactive intervention workflows. Integrated with the CX platform for seamless agent handoff.',
    milestones: [
      { name: 'Data pipeline built', done: true },
      { name: 'Model v1 trained and validated', done: true },
      { name: 'Compliance review with legal', done: false },
      { name: 'CX platform integration', done: false },
    ],
    blockers: null,
    stakeholders: ['Chief Compliance Officer', 'Head of Customer Experience', 'Legal'],
    updated: 'Today',
  },
  {
    id: 3, name: 'Customer Support Triage Automation', unit: 'Corporate',
    status: 'On Track', priority: 'High', owner: 'Marcus Johnson',
    impact: '40% reduction in average handle time', progress: 85,
    description: 'NLP-powered ticket classification and routing system that automatically categorizes and assigns 80% of incoming support requests. Reduces first response time from 4 hours to under 30 minutes.',
    milestones: [
      { name: 'Intent classification model built', done: true },
      { name: 'Routing logic deployed', done: true },
      { name: 'Agent handoff flows configured', done: true },
      { name: 'Final QA and stakeholder sign-off', done: false },
    ],
    blockers: null,
    stakeholders: ['Head of Customer Operations', 'VP Engineering', 'CX Platform Team'],
    updated: 'Yesterday',
  },
  {
    id: 4, name: 'Personalized Push Notification Optimizer', unit: 'Marketing',
    status: 'At Risk', priority: 'High', owner: 'Jordan Lee',
    impact: 'Projected 12% re-engagement lift', progress: 40,
    description: 'AI-driven push notification system that dynamically optimizes send time, frequency, and content per user segment based on behavioral signals and historical engagement data.',
    milestones: [
      { name: 'Data schema designed', done: true },
      { name: 'Feature engineering complete', done: true },
      { name: 'Model training', done: false },
      { name: 'Content template library', done: false },
    ],
    blockers: 'Third-party data provider contract is pending legal review. Training data access is fully blocked until contract execution, which is currently 3 weeks behind schedule.',
    stakeholders: ['CMO', 'Head of Retention Marketing', 'Data Engineering'],
    updated: '5 days ago',
  },
  {
    id: 5, name: 'Live Odds Commentary Generator', unit: 'FanDuel TV',
    status: 'On Track', priority: 'Medium', owner: 'Taylor Park',
    impact: 'Enhanced live viewer engagement metrics', progress: 55,
    description: 'Generative AI system creating real-time natural language commentary for live odds movements and key game events, enriching the FanDuel TV broadcast experience for engaged viewers.',
    milestones: [
      { name: 'LLM integration complete', done: true },
      { name: 'Commentary quality review', done: false },
      { name: 'Production load testing', done: false },
      { name: 'Broadcast launch', done: false },
    ],
    blockers: null,
    stakeholders: ['Head of FanDuel TV', 'Content Strategy', 'Engineering'],
    updated: '3 days ago',
  },
  {
    id: 6, name: 'FanDuel TV AI Highlights Curator', unit: 'FanDuel TV',
    status: 'At Risk', priority: 'Medium', owner: 'Casey Williams',
    impact: '10x faster highlights production', progress: 30,
    description: 'Computer vision model that automatically identifies and packages highlight-worthy moments from live sporting events for FanDuel TV broadcast, reducing manual curation time from hours to minutes.',
    milestones: [
      { name: 'Training data labeling', done: true },
      { name: 'Model architecture defined', done: false },
      { name: 'GPU training pipeline', done: false },
      { name: 'Broadcast system integration', done: false },
    ],
    blockers: 'GPU compute capacity on AWS has not been provisioned. Infrastructure ticket submitted 3 weeks ago, still pending FinOps budget approval.',
    stakeholders: ['VP Technology', 'Head of FanDuel TV', 'ML Platform Team'],
    updated: '1 week ago',
  },
  {
    id: 7, name: 'Fraud Detection Model Upgrade', unit: 'Casino',
    status: 'Blocked', priority: 'High', owner: 'Riley Thompson',
    impact: '$2M+ annual fraud loss prevention', progress: 20,
    description: 'Next-generation fraud detection using behavioral biometrics and graph neural networks to identify suspicious patterns across Casino products. Replacing the legacy rule-based system with adaptive ML.',
    milestones: [
      { name: 'Requirements documented', done: true },
      { name: 'Vendor evaluation complete', done: true },
      { name: 'PII compliance assessment', done: false },
      { name: 'Data access provisioned', done: false },
      { name: 'Model training', done: false },
    ],
    blockers: 'PII compliance assessment has not received legal sign-off. Data governance review is blocked with no committed resolution timeline. Estimated 4-plus week delay to program.',
    stakeholders: ['CISO', 'Head of Casino', 'Legal', 'Data Governance Team'],
    updated: '2 weeks ago',
  },
  {
    id: 8, name: 'Onboarding Flow Personalization', unit: 'Casino',
    status: 'On Track', priority: 'Medium', owner: 'Drew Anderson',
    impact: '15% improvement in day-7 retention', progress: 65,
    description: 'ML model that dynamically adjusts the Casino onboarding experience based on acquisition source, geography, and predicted game preferences, serving the highest-converting flow to each new user.',
    milestones: [
      { name: 'User segmentation model built', done: true },
      { name: 'A/B test framework live', done: true },
      { name: 'Variant testing in production', done: false },
      { name: 'Full rollout', done: false },
    ],
    blockers: null,
    stakeholders: ['Head of Casino Product', 'Growth Team', 'UX Design'],
    updated: 'Yesterday',
  },
  {
    id: 9, name: 'Voice Search Integration', unit: 'Sportsbook',
    status: 'At Risk', priority: 'Low', owner: 'Morgan Davis',
    impact: 'New mobile acquisition channel', progress: 25,
    description: 'Voice-to-search functionality powered by a fine-tuned speech recognition model, enabling users to query odds and place bets by voice within the Sportsbook mobile app.',
    milestones: [
      { name: 'Feasibility study complete', done: true },
      { name: 'Partner vendor selected', done: true },
      { name: 'SDK integration', done: false },
      { name: 'QA and testing', done: false },
    ],
    blockers: 'Mobile platform team is at capacity due to a concurrent iOS 18 compatibility sprint. No engineering bandwidth available until Q3 sprint planning cycle.',
    stakeholders: ['Head of Mobile', 'VP Product', 'Sportsbook Team'],
    updated: '3 weeks ago',
  },
  {
    id: 10, name: 'Horse Racing Handicapping Assistant', unit: 'Racing',
    status: 'On Track', priority: 'Medium', owner: 'Jamie Foster',
    impact: 'Supports 20% Racing handle growth target', progress: 50,
    description: 'AI-powered handicapping tool that analyzes race conditions, horse form, jockey performance, and track data to generate probability-weighted recommendations for Racing customers.',
    milestones: [
      { name: 'Data ingestion pipeline built', done: true },
      { name: 'Model v1 trained', done: true },
      { name: 'UI integration', done: false },
      { name: 'Beta user testing', done: false },
    ],
    blockers: null,
    stakeholders: ['Head of Racing', 'Data Science', 'Product'],
    updated: '4 days ago',
  },
  {
    id: 11, name: 'Customer Churn Prediction Model', unit: 'Corporate',
    status: 'Blocked', priority: 'High', owner: 'Sam Rivera',
    impact: 'Prevent $4M+ in annual churn', progress: 15,
    description: 'Predictive ML model that identifies customers at high risk of churning within 30 days, enabling the retention team to trigger proactive outreach and personalized incentive campaigns.',
    milestones: [
      { name: 'Feature engineering complete', done: true },
      { name: 'Model architecture defined', done: true },
      { name: 'CRM integration', done: false },
      { name: 'Training pipeline', done: false },
      { name: 'Retention workflow integration', done: false },
    ],
    blockers: 'Salesforce CRM API is rate-limited in production and cannot support the required data volume. Issue escalated to Salesforce account team with no confirmed resolution timeline.',
    stakeholders: ['Chief Revenue Officer', 'Head of Retention', 'Data Science', 'CRM Team'],
    updated: '10 days ago',
  },
  {
    id: 12, name: 'Internal Knowledge Base Assistant', unit: 'Corporate',
    status: 'On Track', priority: 'Low', owner: 'Alex Torres',
    impact: '30% fewer internal HR and IT support tickets', progress: 70,
    description: 'RAG-based AI assistant integrated with Confluence and SharePoint, enabling employees to query internal documentation, policies, and process guides via natural language chat.',
    milestones: [
      { name: 'Document ingestion pipeline built', done: true },
      { name: 'Chat interface developed', done: true },
      { name: 'RBAC access controls implemented', done: true },
      { name: 'User acceptance testing', done: false },
      { name: 'Org-wide launch', done: false },
    ],
    blockers: null,
    stakeholders: ['Head of People Operations', 'IT', 'Legal'],
    updated: 'Yesterday',
  },
]

const ALL_UNITS = ['Sportsbook', 'Casino', 'Racing', 'FanDuel TV', 'Marketing', 'Corporate']
const ALL_STATUSES: Status[] = ['On Track', 'At Risk', 'Blocked']
const ALL_PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

const STATUS_STYLE: Record<Status, { bg: string; text: string; ring: string }> = {
  'On Track': { bg: 'rgba(44,180,89,0.1)',  text: '#2CB459', ring: 'rgba(44,180,89,0.25)' },
  'At Risk':  { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', ring: 'rgba(245,158,11,0.25)' },
  'Blocked':  { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', ring: 'rgba(239,68,68,0.25)' },
}

const PROGRESS_COLOR: Record<Status, string> = {
  'On Track': FD.green,
  'At Risk':  '#f59e0b',
  'Blocked':  '#ef4444',
}

const PRIORITY_COLOR: Record<Priority, string> = {
  'High':   FD.blue,
  'Medium': '#f59e0b',
  'Low':    FD.text3,
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.text, border: `1px solid ${s.ring}`,
      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.text, display: 'inline-block', flexShrink: 0 }} />
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span style={{ fontSize: 12, fontWeight: 600, color: PRIORITY_COLOR[priority] }}>{priority}</span>
}

function ProgressBar({ progress, status }: { progress: number; status: Status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: PROGRESS_COLOR[status], borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, color: FD.text3, minWidth: 30 }}>{progress}%</span>
    </div>
  )
}

function FilterChip({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 min-h-[44px] md:min-h-0"
      style={{
        padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', border: `1px solid ${active ? (color ?? FD.blue) : FD.border}`,
        background: active ? (color ? `${color}18` : 'rgba(20,147,255,0.15)') : 'transparent',
        color: active ? (color ?? FD.blue) : FD.text3,
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  )
}

function InitiativeCard({ initiative: ini, onClick }: { initiative: Initiative; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
      style={{ background: FD.card, border: `1px solid ${FD.border}` }}
    >
      <div className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ background: PROGRESS_COLOR[ini.status] }} />
      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div style={{ fontSize: 15, fontWeight: 700, color: FD.text, lineHeight: 1.3 }}>{ini.name}</div>
          <StatusBadge status={ini.status} />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span style={{ fontSize: 13, color: FD.blue, fontWeight: 500 }}>{ini.unit}</span>
          <span style={{ fontSize: 13, color: PRIORITY_COLOR[ini.priority], fontWeight: 600 }}>{ini.priority}</span>
        </div>
        <ProgressBar progress={ini.progress} status={ini.status} />
      </div>
    </div>
  )
}

function SidePanel({ initiative: ini, onClose }: { initiative: Initiative; onClose: () => void }) {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50 overflow-auto rounded-t-2xl max-h-[90vh]
        md:top-0 md:right-0 md:bottom-0 md:left-auto md:w-[480px] md:max-w-full md:max-h-screen md:rounded-none
      "
      style={{ background: FD.card, border: `1px solid ${FD.border}` }}
    >
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${FD.blue}, ${FD.green})` }} />

      {/* Mobile drag handle */}
      <div className="flex justify-center pt-4 pb-1 md:hidden">
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
      </div>

      <div className="p-5 md:p-8 pt-4 md:pt-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-5 md:right-5 flex items-center justify-center"
          style={{
            background: FD.card2, border: `1px solid ${FD.border}`, color: FD.text3,
            borderRadius: 8, width: 44, height: 44, cursor: 'pointer', fontSize: 18,
          }}
        >×</button>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', paddingRight: 52 }}>
          <StatusBadge status={ini.status} />
          <span style={{
            display: 'inline-block', background: FD.card2, color: PRIORITY_COLOR[ini.priority],
            border: `1px solid ${FD.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
          }}>
            {ini.priority} Priority
          </span>
        </div>

        <h2 style={{ fontSize: 19, fontWeight: 700, color: FD.text, margin: '0 0 6px', lineHeight: 1.3, paddingRight: 8 }}>
          {ini.name}
        </h2>

        <div style={{ display: 'flex', gap: 24, marginBottom: 24, marginTop: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1 }}>Business Unit</div>
            <div style={{ fontSize: 13, color: FD.blue, fontWeight: 600, marginTop: 3 }}>{ini.unit}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1 }}>Owner</div>
            <div style={{ fontSize: 13, color: FD.text, fontWeight: 600, marginTop: 3 }}>{ini.owner}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1 }}>Last Updated</div>
            <div style={{ fontSize: 13, color: FD.text3, marginTop: 3 }}>{ini.updated}</div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}><ProgressBar progress={ini.progress} status={ini.status} /></div>
        <div style={{ fontSize: 11, color: FD.text4, marginBottom: 24 }}>Business Impact: {ini.impact}</div>

        <div style={{ borderTop: `1px solid ${FD.border}`, paddingTop: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Description</div>
          <p style={{ fontSize: 14, color: FD.text2, lineHeight: 1.7, margin: 0 }}>{ini.description}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Key Milestones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ini.milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: m.done ? 'rgba(44,180,89,0.15)' : FD.card2,
                  color: m.done ? FD.green : FD.text4,
                  border: `1px solid ${m.done ? 'rgba(44,180,89,0.3)' : FD.border}`,
                }}>
                  {m.done ? '✓' : '○'}
                </span>
                <span style={{ fontSize: 13, color: m.done ? FD.text2 : FD.text3 }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {ini.blockers && (
          <div style={{ marginBottom: 24, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>Blocker</div>
            <p style={{ fontSize: 13, color: 'rgba(239,68,68,0.85)', lineHeight: 1.6, margin: 0 }}>{ini.blockers}</p>
          </div>
        )}

        <div>
          <div style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Stakeholders</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ini.stakeholders.map(s => (
              <span key={s} style={{ background: FD.card2, border: `1px solid ${FD.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, color: FD.text3 }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: FD.text, fontWeight: 700 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function renderExecMarkdown(text: string) {
  const lines = text.split('\n')
  const out: React.ReactNode[] = []
  let i = 0
  for (const line of lines) {
    const t = line.trim()
    if (/^[A-Z0-9][A-Z0-9\s]{4,}$/.test(t)) {
      out.push(
        <div key={i++} style={{ fontSize: 10, color: FD.blue, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, marginTop: out.length === 0 ? 0 : 22, marginBottom: 10, borderBottom: `1px solid rgba(20,147,255,0.15)`, paddingBottom: 6 }}>
          {t}
        </div>
      )
    } else if (!t) {
      out.push(<div key={i++} style={{ height: 4 }} />)
    } else if (t.startsWith('- ')) {
      out.push(
        <div key={i++} style={{ display: 'flex', gap: 10, marginBottom: 5, alignItems: 'flex-start' }}>
          <span style={{ color: FD.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
          <span style={{ fontSize: 13.5, color: FD.text2, lineHeight: 1.7 }}>{renderInline(t.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(t)) {
      const match = t.match(/^(\d+)\.\s+(.+)/)!
      out.push(
        <div key={i++} style={{ display: 'flex', gap: 10, marginBottom: 5, alignItems: 'flex-start' }}>
          <span style={{ color: FD.blue, fontWeight: 700, flexShrink: 0, minWidth: 18, marginTop: 1 }}>{match[1]}.</span>
          <span style={{ fontSize: 13.5, color: FD.text2, lineHeight: 1.7 }}>{renderInline(match[2])}</span>
        </div>
      )
    } else {
      out.push(
        <div key={i++} style={{ fontSize: 13.5, color: FD.text2, lineHeight: 1.75, marginBottom: 4 }}>
          {renderInline(t)}
        </div>
      )
    }
  }
  return out
}

const GENERATING_STEPS = [
  'Analyzing portfolio data...',
  'Identifying risks and blockers...',
  'Drafting executive summary...',
  'Formatting briefing for leadership...',
]

function GeneratingOverlay() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPct(prev => {
        if (prev < 28) return prev + 2.8
        if (prev < 58) return prev + 1.2
        if (prev < 80) return prev + 0.6
        if (prev < 92) return prev + 0.2
        return prev
      })
    }, 200)
    return () => clearInterval(id)
  }, [])

  const step =
    pct < 25 ? GENERATING_STEPS[0] :
    pct < 55 ? GENERATING_STEPS[1] :
    pct < 80 ? GENERATING_STEPS[2] :
               GENERATING_STEPS[3]

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: 'rgba(6,16,30,0.88)', zIndex: 60 }}>
      <div className="w-full max-w-[440px] relative" style={{ background: FD.card, border: `1px solid ${FD.border}`, borderRadius: 16, padding: '36px 32px' }}>
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${FD.blue}, ${FD.green})` }} />

        <div className="flex items-center gap-3 mb-6">
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: FD.blue, display: 'inline-block', animation: 'fd-pulse 1.2s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: FD.text }}>Generating Executive Update</span>
        </div>

        <div className="mb-4 min-h-[20px]" style={{ fontSize: 13, color: FD.text3, transition: 'opacity 0.3s' }}>{step}</div>

        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{
            height: '100%', borderRadius: 3,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${FD.blue}, ${FD.green})`,
            transition: 'width 0.22s ease',
          }} />
        </div>

        <div className="flex items-center justify-between">
          <span style={{ fontSize: 11, color: FD.text4 }}>Typically takes 10–15 seconds</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: FD.blue }}>{Math.round(pct)}%</span>
        </div>
      </div>
    </div>
  )
}

function ExecutiveModal({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const generatedAt = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <div
      className="fixed inset-0 flex flex-col md:items-center md:justify-center md:p-6"
      style={{ background: 'rgba(6,16,30,0.88)', zIndex: 60 }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full h-full md:h-auto md:max-h-[88vh] md:rounded-2xl md:max-w-[720px]"
        style={{ background: FD.card, border: `1px solid ${FD.border}`, position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] md:rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${FD.blue}, ${FD.green})` }} />

        {/* Header */}
        <div className="shrink-0 px-5 pt-7 pb-4 md:px-8 md:pt-7" style={{ borderBottom: `1px solid ${FD.border}` }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center"
            style={{ background: FD.card2, border: `1px solid ${FD.border}`, color: FD.text3, borderRadius: 8, width: 44, height: 44, cursor: 'pointer', fontSize: 18 }}
          >×</button>
          <div style={{ fontSize: 10, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{generatedAt}</div>
          <h2 className="text-[18px] md:text-[20px] pr-12" style={{ fontSize: undefined, fontWeight: 800, color: FD.text, margin: 0, lineHeight: 1.3 }}>{title}</h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-8">
          {renderExecMarkdown(text)}
        </div>

        {/* Footer — sticky at bottom on mobile via flex, normal flow on desktop */}
        <div
          className="shrink-0 px-5 py-4 md:px-8 md:py-5 flex items-center justify-between md:justify-end gap-3"
          style={{ borderTop: `1px solid ${FD.border}` }}
        >
          <button
            onClick={copy}
            className="flex-1 md:flex-initial min-h-[44px] md:min-h-0"
            style={{ background: FD.card2, border: `1px solid ${FD.border}`, color: copied ? FD.green : FD.text3, borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
          >
            {copied ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoTip({ text }: { text: string }) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setAnchor({ x: r.left + r.width / 2, y: r.top })
    }
  }

  return (
    <>
      <style>{`@keyframes fd-tip-in{from{opacity:0;transform:translateX(-50%) translateY(calc(-100% + 6px))}to{opacity:1;transform:translateX(-50%) translateY(-100%)}}`}</style>
      <span
        ref={ref}
        style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 5, cursor: 'help', flexShrink: 0, verticalAlign: 'middle' }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setAnchor(null)}
      >
        <span style={{
          width: 15, height: 15, borderRadius: '50%',
          background: 'rgba(20,147,255,0.15)', border: '1px solid rgba(20,147,255,0.35)',
          color: FD.blue, fontSize: 9, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
        }}>i</span>
        {anchor && (
          <span style={{
            position: 'fixed', top: anchor.y - 10, left: anchor.x,
            background: '#13253f', border: `1px solid rgba(20,147,255,0.25)`,
            borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: FD.text2,
            lineHeight: 1.65, width: 240, zIndex: 9999,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            pointerEvents: 'none', whiteSpace: 'normal',
            textTransform: 'none', letterSpacing: 0, fontWeight: 400,
            animation: 'fd-tip-in 0.15s ease forwards',
          }}>
            {text}
          </span>
        )}
      </span>
    </>
  )
}

function StatCard({ label, value, color, sub, tip }: { label: string; value: number; color: string; sub?: string; tip?: string }) {
  return (
    <div style={{ background: FD.card, border: `1px solid ${FD.border}`, borderRadius: 14, padding: '20px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: color, opacity: 0.6 }} />
      <div className="text-[32px] md:text-[38px]" style={{ fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: FD.text3, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
        {label}{tip && <InfoTip text={tip} />}
      </div>
      {sub && <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600, opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

export default function FanDuelDashboard() {
  const [contextOpen, setContextOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [unitFilter, setUnitFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All')
  const [selected, setSelected] = useState<Initiative | null>(null)
  const [execUpdate, setExecUpdate] = useState<{ title: string; text: string } | null>(null)
  const [generating, setGenerating] = useState(false)

  const filtered = useMemo(() =>
    INITIATIVES.filter(i =>
      (statusFilter === 'All' || i.status === statusFilter) &&
      (unitFilter === 'All' || i.unit === unitFilter) &&
      (priorityFilter === 'All' || i.priority === priorityFilter)
    ), [statusFilter, unitFilter, priorityFilter])

  const unitStats = useMemo(() =>
    ALL_UNITS.map(unit => {
      const items = INITIATIVES.filter(i => i.unit === unit)
      return {
        unit, total: items.length,
        onTrack: items.filter(i => i.status === 'On Track').length,
        atRisk: items.filter(i => i.status === 'At Risk').length,
        blocked: items.filter(i => i.status === 'Blocked').length,
      }
    }), [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/fanduel/executive-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiatives: INITIATIVES }),
      })
      const data = await res.json()
      setExecUpdate({ title: data.title ?? 'Portfolio Update', text: data.text ?? 'Failed to generate update.' })
    } catch {
      setExecUpdate({ title: 'Portfolio Update', text: 'Unable to generate update. Please check API configuration and try again.' })
    } finally {
      setGenerating(false)
    }
  }

  const now = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: FD.bg, color: FD.text, fontFamily: 'var(--font-body, Inter, system-ui, sans-serif)', paddingBottom: 80 }}>
      <style>{`@keyframes fd-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.45;transform:scale(0.8)}}`}</style>

      {/* Nav bar */}
      <div style={{ background: FD.navy, borderBottom: `1px solid rgba(20,147,255,0.2)` }} className="px-4 md:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div style={{ background: '#fff', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
            <Image src="/fanduel-logo.png" alt="FanDuel" width={88} height={24} style={{ display: 'block', objectFit: 'contain' }} />
          </div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: 0.5 }}>AI Operations Portal</span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{now}</span>
      </div>

      <div className="max-w-[1380px] mx-auto px-4 md:px-7 pt-6 md:pt-9">

        {/* Intro Banner */}
        <div style={{ borderLeft: `3px solid ${FD.blue}`, background: `linear-gradient(135deg, rgba(20,147,255,0.06), rgba(29,54,94,0.4))`, borderRadius: '0 12px 12px 0' }} className="mb-8 md:mb-10">
          <button
            onClick={() => setContextOpen(o => !o)}
            className="w-full flex flex-col items-center px-4 md:px-6 pt-4 md:pt-5 pb-3 cursor-pointer gap-2"
            style={{ background: 'transparent', border: 'none' }}
          >
            <div className="w-full" style={{ fontSize: 11, color: FD.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Application Context
            </div>
            {/* Centered clickable chevron */}
            <div className="flex items-center gap-1.5" style={{ color: FD.green }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>
                {contextOpen ? 'collapse' : 'read more'}
              </span>
              <svg
                width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{ transform: contextOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.28s ease', flexShrink: 0 }}
              >
                <path d="M3 5.5L8 10.5L13 5.5" stroke={FD.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {/* Animated content */}
          <div style={{
            maxHeight: contextOpen ? '2400px' : '0',
            opacity: contextOpen ? 1 : 0,
            overflow: contextOpen ? 'visible' : 'hidden',
            transition: 'max-height 0.38s ease, opacity 0.25s ease',
          }}>
            <div className="px-4 md:px-6 pb-5">
              <div style={{ borderTop: `1px solid rgba(20,147,255,0.12)`, paddingTop: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: FD.text, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>What This Is</div>
                <p style={{ fontSize: 14, color: FD.text2, lineHeight: 1.75, margin: 0 }}>
                  A working prototype of the AI initiative portfolio management framework described in FanDuel&apos;s Sr. Manager of AI Operations and Strategy role. It demonstrates how I would give the VP of Technology real-time visibility into every active AI initiative across Sportsbook, Casino, Racing, FanDuel TV, Marketing, and Corporate — including status, priority, ownership, business impact, and escalation requirements. The Generate Executive Update button uses the Claude API to produce a structured briefing in seconds, formatted for executive consumption.
                </p>
              </div>

              <div style={{ borderTop: `1px solid rgba(20,147,255,0.12)`, paddingTop: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: FD.text, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Why It Exists</div>
                <p style={{ fontSize: 14, color: FD.text2, lineHeight: 1.75, margin: 0 }}>
                  The job description asks for someone who can build a repeatable planning and prioritization process for AI initiatives and give leadership a clear view of active initiatives, delivery status, risks, blockers, and measurable business impact within the first six months. Rather than describe how I would do that, I built it. This page is what the first deliverable looks like.
                </p>
              </div>

              <div style={{ borderTop: `1px solid rgba(20,147,255,0.12)`, paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: FD.text, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>How It Would Work In Real Life</div>
                <p style={{ fontSize: 14, color: FD.text2, lineHeight: 1.75, margin: 0 }}>
                  In production this dashboard would connect to FanDuel&apos;s existing program management tools such as Jira or Confluence via API to pull live initiative data automatically rather than using the static data shown here. Each initiative record would be owned by the responsible team and updated in real time. The executive summary would be generated on demand or scheduled for automatic delivery to leadership every Monday morning. Access would be role-gated so AI Engineering leads see their initiatives, the VP of Technology sees the full portfolio, and the CTO sees the cross-functional risk summary. The framework would expand to include budget tracking, headcount dependencies, and milestone velocity over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-4 mb-6 md:mb-7">
          <div>
            <div style={{ fontSize: 11, color: FD.blue, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, fontWeight: 700 }}>FanDuel Group</div>
            <h1 className="text-[24px] md:text-[30px]" style={{ fontWeight: 800, color: FD.text, margin: 0, letterSpacing: '-0.5px' }}>AI Operations Portfolio</h1>
            <p style={{ fontSize: 14, color: FD.text3, margin: '4px 0 0' }}>Enterprise AI Initiative Tracker</p>
          </div>

          {/* Generate button */}
          <div className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-2 flex-1 md:flex-initial">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full md:w-auto min-h-[44px] md:min-h-0"
                style={{
                  background: generating ? FD.card : `linear-gradient(135deg, ${FD.blue} 0%, #0f7fe0 100%)`,
                  color: generating ? FD.text3 : '#fff',
                  border: generating ? `1px solid ${FD.border}` : 'none',
                  borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  boxShadow: generating ? 'none' : '0 4px 20px rgba(20,147,255,0.3)',
                }}
              >
                {generating ? 'Generating...' : 'Generate Executive Update'}
              </button>
              {!generating && !execUpdate && (
                <div onClick={handleGenerate} className="flex items-center gap-2 cursor-pointer select-none">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: FD.blue, display: 'inline-block', animation: 'fd-pulse 2s ease-in-out infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: FD.blue, fontWeight: 600, letterSpacing: 0.3 }}>Try it — live AI briefing in seconds</span>
                </div>
              )}
            </div>
            <InfoTip text="Uses Claude AI to produce a VP-ready briefing covering portfolio health, top risks, strong performers, and recommended priorities for the next two weeks." />
          </div>
        </div>

        {/* Stat Cards — 2×2 on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-[14px] mb-6 md:mb-7">
          <StatCard label="Total Initiatives" value={12} color={FD.blue} tip="Active AI initiatives being tracked across all business units." />
          <StatCard label="On Track" value={7} color={FD.green} sub="58% of portfolio" tip="Initiatives progressing on schedule with no critical blockers." />
          <StatCard label="At Risk" value={3} color="#f59e0b" sub="Needs attention" tip="Initiatives with identified risks or delays that may impact delivery if not addressed soon." />
          <StatCard label="Blocked" value={2} color="#ef4444" sub="Escalation required" tip="Initiatives with hard blockers preventing forward progress — require immediate stakeholder escalation." />
        </div>

        {/* Filters */}
        <div style={{ background: FD.card, border: `1px solid ${FD.border}`, borderRadius: 12 }} className="px-4 py-3 md:px-[18px] md:py-[14px] mb-4 md:mb-[18px]">
          {/* Status row — horizontally scrollable on mobile */}
          <div className="flex gap-2 items-center overflow-x-auto md:overflow-x-visible md:flex-wrap pb-1 md:pb-0 mb-2 md:mb-[10px]" style={{ scrollbarWidth: 'none' }}>
            <span className="shrink-0" style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginRight: 4, minWidth: 50 }}>Status</span>
            <FilterChip label="All" active={statusFilter === 'All'} onClick={() => setStatusFilter('All')} />
            {ALL_STATUSES.map(s => (
              <FilterChip key={s} label={s} active={statusFilter === s} color={STATUS_STYLE[s].text} onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)} />
            ))}
          </div>
          {/* Unit row */}
          <div className="flex gap-2 items-center overflow-x-auto md:overflow-x-visible md:flex-wrap pb-1 md:pb-0 mb-2 md:mb-[10px]" style={{ scrollbarWidth: 'none' }}>
            <span className="shrink-0" style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginRight: 4, minWidth: 50 }}>Unit</span>
            <FilterChip label="All" active={unitFilter === 'All'} onClick={() => setUnitFilter('All')} />
            {ALL_UNITS.map(u => (
              <FilterChip key={u} label={u} active={unitFilter === u} onClick={() => setUnitFilter(unitFilter === u ? 'All' : u)} />
            ))}
          </div>
          {/* Priority row */}
          <div className="flex gap-2 items-center overflow-x-auto md:overflow-x-visible md:flex-wrap" style={{ scrollbarWidth: 'none' }}>
            <span className="shrink-0" style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 1, marginRight: 4, minWidth: 50 }}>Priority</span>
            <FilterChip label="All" active={priorityFilter === 'All'} onClick={() => setPriorityFilter('All')} />
            {ALL_PRIORITIES.map(p => (
              <FilterChip key={p} label={p} active={priorityFilter === p} color={PRIORITY_COLOR[p]} onClick={() => setPriorityFilter(priorityFilter === p ? 'All' : p)} />
            ))}
          </div>
        </div>

        {/* Mobile: initiative cards */}
        <div className="flex flex-col gap-3 mb-6 md:hidden">
          {filtered.map(ini => (
            <InitiativeCard key={ini.id} initiative={ini} onClick={() => setSelected(ini)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: FD.text4, fontSize: 14 }}>No initiatives match the selected filters.</div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block mb-7" style={{ background: FD.card, border: `1px solid ${FD.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${FD.border}`, background: FD.surface }}>
                  {(['Initiative', 'Business Unit', 'Status', 'Priority', 'Owner'] as const).map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: FD.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: FD.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      Business Impact<InfoTip text="The projected business outcome this initiative is expected to move — e.g. conversion rate lift, cost reduction, or compliance milestone." />
                    </span>
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: FD.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      Progress<InfoTip text="Percentage of key milestones completed toward full delivery. Click any row to see the milestone breakdown." />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ini, idx) => (
                  <tr
                    key={ini.id}
                    onClick={() => setSelected(ini)}
                    style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${FD.border}` : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = FD.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                      <div style={{ fontSize: 13, color: FD.text, fontWeight: 600, lineHeight: 1.3 }}>{ini.name}</div>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: FD.blue, fontWeight: 500 }}>{ini.unit}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={ini.status} /></td>
                    <td style={{ padding: '14px 16px' }}><PriorityBadge priority={ini.priority} /></td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: FD.text3 }}>{ini.owner}</span>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 200 }}>
                      <span style={{ fontSize: 12, color: FD.text3, lineHeight: 1.4 }}>{ini.impact}</span>
                    </td>
                    <td style={{ padding: '14px 16px', minWidth: 130 }}>
                      <ProgressBar progress={ini.progress} status={ini.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: FD.text4, fontSize: 13 }}>No initiatives match the selected filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Unit Health */}
        <div>
          <div style={{ fontSize: 11, color: FD.text4, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            Business Unit Health<InfoTip text="Initiative status breakdown by business unit — showing how many are On Track, At Risk, or Blocked within each group." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-[14px]">
            {unitStats.map(u => (
              <div key={u.unit} style={{ background: FD.card, border: `1px solid ${FD.border}`, borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 15, color: FD.text, fontWeight: 600 }}>{u.unit}</span>
                  <span style={{ fontSize: 11, color: FD.text4 }}>{u.total} initiative{u.total !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {u.onTrack > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: FD.green, background: 'rgba(44,180,89,0.1)', border: '1px solid rgba(44,180,89,0.2)', borderRadius: 20, padding: '3px 10px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: FD.green, display: 'inline-block' }} />
                      {u.onTrack} On Track
                    </span>
                  )}
                  {u.atRisk > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '3px 10px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                      {u.atRisk} At Risk
                    </span>
                  )}
                  {u.blocked > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '3px 10px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                      {u.blocked} Blocked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Backdrop */}
      {selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0" style={{ background: 'rgba(6,16,30,0.6)', zIndex: 40 }} />
      )}
      {selected && <SidePanel initiative={selected} onClose={() => setSelected(null)} />}
      {generating && <GeneratingOverlay />}
      {execUpdate && <ExecutiveModal title={execUpdate.title} text={execUpdate.text} onClose={() => setExecUpdate(null)} />}
    </div>
  )
}
