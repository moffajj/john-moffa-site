"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ticket {
  id: string;
  company: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  category: string;
  age: string;
  status: string;
  l1Solvable: boolean;
  escalate: boolean;
  synced: boolean;
  triage: TriageResult | null;
  triageState?: "idle" | "loading" | "done" | "direct";
  autoResponse?: string;
  resolved?: boolean;
  originalPriority?: Ticket["priority"];
}

interface TriageResult {
  priority: string;
  category: string;
  l1: boolean;
  escalate: boolean;
  suggestedReply: string;
}

interface InternalNote {
  author: string;
  initials: string;
  time: string;
  body: string;
  ts?: number;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const S = {
  bg: "#0a0a0a",
  card: "#111",
  surface: "#0d0d0d",
  border: "rgba(255,255,255,0.08)",
  amber: "#c9a84c",
  amberBg: "rgba(201,168,76,0.1)",
  amberBorder: "rgba(201,168,76,0.2)",
  head: "#f0ede8",
  body: "#888888",
  muted: "#444444",
  green: "#34d399",
  red: "#ef4444",
  orange: "#f97316",
} as const;

// ─── Static data ──────────────────────────────────────────────────────────────

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "T-1041",
    company: "Salesforce",
    sender: "mike.chen@salesforce.com",
    subject: "SSO login broken after identity provider migration",
    preview: "Since we migrated our IdP to Okta last week, none of our users can authenticate...",
    body: "Since we migrated our IdP to Okta last week, none of our users can authenticate via SSO. We're getting SAML assertion errors in the logs. This is blocking 200+ users from accessing the platform. We need this resolved ASAP as it's production-critical.",
    priority: "Critical",
    category: "Auth/SSO",
    age: "14m",
    status: "Open",
    l1Solvable: false,
    escalate: true,
    synced: false,
    triage: null,
    triageState: "idle",
  },
  {
    id: "T-1040",
    company: "Netflix",
    sender: "api-team@netflix.com",
    subject: "Rate limit errors hitting 429s every 2 hours",
    preview: "Our integration keeps hitting rate limits despite being under our plan's quota...",
    body: "Our integration keeps hitting rate limits despite being under our plan's quota. We're seeing 429 errors every 2 hours like clockwork. Reviewed our implementation — we're batching correctly and staying under 1000 req/min. Something seems off with the rate limit counter on your end.",
    priority: "High",
    category: "API/Rate Limits",
    age: "1h",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    triageState: "idle",
  },
  {
    id: "T-1039",
    company: "Notion",
    sender: "integrations@notion.so",
    subject: "Zapier sync not pulling new records",
    preview: "Our Zapier integration stopped syncing new records as of yesterday morning...",
    body: "Our Zapier integration stopped syncing new records as of yesterday morning. Existing records are fine but nothing new is coming through. We've re-authenticated the connection twice with no luck. Affects our entire operations team's workflow.",
    priority: "High",
    category: "Integration/Sync",
    age: "3h",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    triageState: "idle",
  },
  {
    id: "T-1038",
    company: "Figma",
    sender: "product@figma.com",
    subject: "Request: bulk export feature for enterprise accounts",
    preview: "We'd like to request a bulk export capability for our enterprise tier...",
    body: "We'd like to request a bulk export capability for our enterprise tier. Currently exporting 500+ records one at a time is not scalable. Our finance team needs this for monthly reporting. Happy to provide more details on the use case if helpful.",
    priority: "Low",
    category: "Feature Request",
    age: "6h",
    status: "Open",
    l1Solvable: false,
    escalate: false,
    synced: false,
    triage: null,
    triageState: "idle",
  },
  {
    id: "T-1037",
    company: "Stripe",
    sender: "billing@stripe.com",
    subject: "Overcharged on last invoice — $2,400 discrepancy",
    preview: "Our November invoice shows $2,400 more than expected based on our contract...",
    body: "Our November invoice shows $2,400 more than expected based on our contract terms. We're on the Enterprise plan at $8k/mo but were charged $10,400. Please review and issue a corrected invoice. Our finance team is holding payment pending resolution.",
    priority: "High",
    category: "Billing",
    age: "2h",
    status: "Open",
    l1Solvable: false,
    escalate: true,
    synced: false,
    triage: null,
    triageState: "idle",
  },
  {
    id: "T-1036",
    company: "Zoom",
    sender: "admin@zoom.us",
    subject: "Need to transfer account ownership — former admin left",
    preview: "Our primary admin left the company last Friday and we need to transfer ownership...",
    body: "Our primary admin left the company last Friday and we need to transfer account ownership to our new IT director. The former admin's account is deactivated. We have documentation proving company ownership. Please advise on the process.",
    priority: "Medium",
    category: "Account Access",
    age: "4h",
    status: "Open",
    l1Solvable: false,
    escalate: false,
    synced: false,
    triage: null,
    triageState: "idle",
  },
];

const TRIAGE_RESPONSES: Record<string, TriageResult> = {
  "T-1041": {
    priority: "Critical",
    category: "Auth/SSO",
    l1: false,
    escalate: true,
    suggestedReply: `Hi Mike,\n\nThank you for reaching out — I can see this is production-critical and I'm escalating immediately.\n\nFor SAML assertion errors after an IdP migration to Okta, here's what our engineering team will need:\n1. Your current SAML metadata XML from Okta\n2. The exact error codes from your logs\n3. Your Entity ID and ACS URL configuration\n\nI've flagged this as P0 and assigned it to our Identity team. You'll hear from a senior engineer within 30 minutes.\n\nBest,\nSupport Team`,
  },
  "T-1040": {
    priority: "High",
    category: "API/Rate Limits",
    l1: true,
    escalate: false,
    suggestedReply: `Hi Netflix API Team,\n\nThanks for the detailed report — this is a known issue with our rate limit counter resetting on a rolling window rather than fixed intervals.\n\nQuick fix: add a 100ms jitter to your retry logic. Here's the updated pattern:\n\n\`\`\`\nretry_after = response.headers['Retry-After'] + random(0, 100)ms\n\`\`\`\n\nAlso, check if you're on our v2 API — v1 has a bug with burst counting that was patched in v2.3.\n\nLet me know if this resolves it!\n\nBest,\nSupport Team`,
  },
  "T-1039": {
    priority: "High",
    category: "Integration/Sync",
    l1: true,
    escalate: false,
    suggestedReply: `Hi Notion Team,\n\nThis is likely a webhook registration issue — when you re-authenticate, the old webhook endpoint sometimes persists.\n\nTo fix:\n1. Go to Settings → Integrations → Zapier\n2. Click "Disconnect" completely (not just re-auth)\n3. Clear the Zapier zap and re-create it from scratch\n4. Re-authenticate with fresh credentials\n\nThis clears the stale webhook subscription. Takes about 5 minutes.\n\nLet me know if new records start flowing!\n\nBest,\nSupport Team`,
  },
  "T-1038": {
    priority: "Low",
    category: "Feature Request",
    l1: false,
    escalate: false,
    suggestedReply: `Hi Figma Product Team,\n\nThank you for this feature request — bulk export is something we hear from our enterprise customers regularly.\n\nI've logged this in our product backlog with high priority given your use case. Our Product team reviews enterprise requests weekly.\n\nIn the meantime, our API supports bulk export with pagination — if your finance team is comfortable with a light technical implementation, I can share the endpoint documentation.\n\nWe'll follow up with an ETA within 5 business days.\n\nBest,\nSupport Team`,
  },
  "T-1037": {
    priority: "High",
    category: "Billing",
    l1: false,
    escalate: true,
    suggestedReply: `Hi Stripe Billing Team,\n\nThank you for bringing this to our attention. A $2,400 discrepancy on an enterprise invoice is something we take seriously.\n\nI've escalated this to our Billing team with urgent priority. To expedite:\n1. Please reply with your contract effective date\n2. Attach your signed order form if available\n3. Confirm your account ID: stripe-enterprise-XXX\n\nWe'll issue a reviewed invoice within 24 hours and hold any collections activity pending resolution.\n\nBest,\nSupport Team`,
  },
  "T-1036": {
    priority: "Medium",
    category: "Account Access",
    l1: false,
    escalate: false,
    suggestedReply: `Hi Zoom Admin Team,\n\nAccount ownership transfers are handled by our Trust & Safety team for verification purposes.\n\nHere's the process:\n1. Submit a formal transfer request at support.example.com/account-transfer\n2. Include: company registration doc, your ID, and the new admin's details\n3. Processing time: 2-3 business days\n\nI've pre-flagged your ticket so the review is expedited. You'll receive a secure form via email within 1 hour.\n\nBest,\nSupport Team`,
  },
};

const ADMIN_STATS = [
  { label: "Total Tickets", value: 247, suffix: "", trend: "+12%" },
  { label: "L1 Resolution Rate", value: 68, suffix: "%", trend: "+5%" },
  { label: "Avg Response Time", value: 4.2, suffix: "h", trend: "-0.8h" },
  { label: "Multi-Person Tickets", value: 34, suffix: "%", trend: "+2%" },
  { label: "Escalation Rate", value: 18, suffix: "%", trend: "-3%" },
  { label: "Open Tickets", value: 41, suffix: "", trend: "-7" },
  { label: "Resolved Today", value: 23, suffix: "", trend: "+4" },
  { label: "Avg Team Size", value: 2.1, suffix: "", trend: "+0.3" },
];

const CATEGORY_BARS = [
  { label: "Auth/SSO", pct: 28 },
  { label: "API/Integration", pct: 22 },
  { label: "Billing", pct: 18 },
  { label: "Account Access", pct: 14 },
  { label: "Feature Request", pct: 11 },
  { label: "Other", pct: 7 },
];

const AGENTS = [
  { name: "Sarah K.", tickets: 84, avgTime: "3.2h", l1Rate: "74%" },
  { name: "Marcus T.", tickets: 71, avgTime: "4.8h", l1Rate: "61%" },
  { name: "Priya M.", tickets: 92, avgTime: "2.9h", l1Rate: "79%" },
];

const VOLUME_BARS = [42, 38, 55, 61, 47, 53, 49];
const VOLUME_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONNECTORS = [
  {
    id: "gmail",
    name: "Gmail",
    category: "Communication",
    description: "Pull support emails directly into your inbox",
    favicon: "https://www.google.com/s2/favicons?domain=gmail.com&sz=32",
    status: "connected",
    lastSync: "2m ago",
    dataPills: ["Emails", "Attachments", "Threads"],
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    description: "Monitor support channels and DMs",
    favicon: "https://www.google.com/s2/favicons?domain=slack.com&sz=32",
    status: "connected",
    lastSync: "5m ago",
    dataPills: ["Messages", "Channels", "Mentions"],
  },
  {
    id: "roam",
    name: "Roam",
    category: "Communication",
    description: "Pull support requests directly from Roam virtual office spaces, meeting chats, and session recordings",
    favicon: "https://www.google.com/s2/favicons?domain=ro.am&sz=32",
    status: "connected",
    lastSync: "5m ago",
    dataPills: ["Space messages", "Meeting transcripts", "Session recordings", "Direct messages", "Support flags"],
  },
  {
    id: "outlook",
    name: "Outlook",
    category: "Communication",
    description: "Connect your Microsoft email inbox",
    favicon: "https://www.google.com/s2/favicons?domain=outlook.com&sz=32",
    status: "disconnected",
    lastSync: null,
    dataPills: ["Emails", "Calendar"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Sync contacts, companies, and deal history",
    favicon: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=32",
    status: "connected",
    lastSync: "1m ago",
    dataPills: ["Contacts", "Companies", "Deals"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "CRM",
    description: "Pull account and opportunity context",
    favicon: "https://www.google.com/s2/favicons?domain=salesforce.com&sz=32",
    status: "error",
    lastSync: "Auth expired",
    dataPills: ["Accounts", "Cases"],
  },
  {
    id: "zoom",
    name: "Zoom",
    category: "Meetings",
    description: "Import meeting recordings and transcripts",
    favicon: "https://www.google.com/s2/favicons?domain=zoom.us&sz=32",
    status: "connected",
    lastSync: "12m ago",
    dataPills: ["Recordings", "Transcripts"],
  },
  {
    id: "loom",
    name: "Loom",
    category: "Meetings",
    description: "Pull Loom recordings attached to tickets",
    favicon: "https://www.google.com/s2/favicons?domain=loom.com&sz=32",
    status: "disconnected",
    lastSync: null,
    dataPills: ["Videos", "Comments"],
  },
  {
    id: "calendly",
    name: "Calendly",
    category: "Meetings",
    description: "Sync scheduled calls with ticket context",
    favicon: "https://www.google.com/s2/favicons?domain=calendly.com&sz=32",
    status: "disconnected",
    lastSync: null,
    dataPills: ["Bookings", "Attendees"],
  },
  {
    id: "claude",
    name: "Claude",
    category: "AI",
    description: "Powers AI triage, suggested responses, and ticket summarization natively",
    favicon: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=32",
    status: "connected",
    lastSync: "real-time",
    dataPills: ["Ticket analysis", "Response drafting", "Sentiment scoring", "Escalation logic"],
    native: true,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "AI",
    description: "Optional secondary AI layer for response drafting and knowledge base search",
    favicon: "https://www.google.com/s2/favicons?domain=openai.com&sz=32",
    status: "disconnected",
    lastSync: null,
    dataPills: ["Response drafting", "Knowledge search", "Summarization", "Translation"],
    native: false,
  },
];

const LIVE_FEED = [
  { icon: "https://anthropic.com/favicon.ico", source: "Claude", text: "Claude analyzed and triaged 3 new tickets", time: "just now" },
  { icon: "https://www.google.com/s2/favicons?domain=gmail.com&sz=32", source: "Gmail", text: "New ticket from mike.chen@salesforce.com", time: "1m" },
  { icon: "https://www.google.com/s2/favicons?domain=ro.am&sz=32", source: "Roam", text: "Roam session recording flagged support issue — TechFlow onboarding space", time: "3m" },
  { icon: "https://www.google.com/s2/favicons?domain=slack.com&sz=32", source: "Slack", text: "#support-enterprise: mention from @priya", time: "4m" },
  { icon: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=32", source: "HubSpot", text: "Salesforce contact updated — 3 open deals", time: "4m" },
  { icon: "https://www.google.com/s2/favicons?domain=zoom.us&sz=32", source: "Zoom", text: "Recording available: Netflix API review call", time: "11m" },
  { icon: "https://www.google.com/s2/favicons?domain=gmail.com&sz=32", source: "Gmail", text: "Reply from billing@stripe.com", time: "18m" },
];

const SIMULATE_POOL: Omit<Ticket, "id" | "triageState">[] = [
  {
    company: "Atlassian",
    sender: "enterprise@atlassian.com",
    subject: "Jira webhook failing on large payloads",
    preview: "Our Jira webhook integration times out on payloads over 1MB...",
    body: "Our Jira webhook integration times out on payloads over 1MB. This affects our CI/CD pipeline that sends build events. We have 50+ projects triggering webhooks concurrently.",
    priority: "High",
    category: "API/Integration",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
  },
  {
    company: "Datadog",
    sender: "ops@datadog.com",
    subject: "Custom metrics not appearing in dashboards",
    preview: "Custom metrics we're sending via the API aren't showing up in our dashboards...",
    body: "Custom metrics we're sending via the API aren't showing up in our dashboards after the latest ingestion pipeline update. Standard metrics are fine. Affects real-time monitoring for our on-call team.",
    priority: "Critical",
    category: "Auth/SSO",
    age: "just now",
    status: "Open",
    l1Solvable: false,
    escalate: true,
    synced: false,
    triage: null,
  },
  {
    company: "Figma",
    sender: "james.park@figma.com",
    subject: "Password reset email not arriving",
    preview: "Hi, I forgot my password and the reset email isn't showing up...",
    body: "Hi, I forgot my password and the reset email isn't showing up. Can you help?",
    priority: "Low",
    category: "Account Access",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    autoResponse: `Hi James,\n\nNo worries! Click "Forgot Password" on the login page and check your spam folder. If it still doesn't arrive within 5 minutes, reply here and I'll manually reset it for you.\n\nHere's a quick guide: [help.platform.com/password-reset]\n\nBest,\nSupport Team`,
  },
  {
    company: "Notion",
    sender: "sara.kim@notion.so",
    subject: "How do I export all my data?",
    preview: "Quick question — how do I export all my data? I can't find the option anywhere...",
    body: "Quick question — how do I export all my data? I can't find the option anywhere.",
    priority: "Low",
    category: "How-To",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    autoResponse: `Hi Sara,\n\nGreat question! Go to Settings > Account > Export Data and choose your format (CSV or JSON).\n\nFull walkthrough here: [help.platform.com/export-data]\n\nLet me know if you get stuck!\n\nBest,\nSupport Team`,
  },
  {
    company: "Linear",
    sender: "dev@linear.app",
    subject: "How do I add another user to our workspace?",
    preview: "How do I add another user to our workspace? I'm the admin...",
    body: "How do I add another user to our workspace? I'm the admin.",
    priority: "Low",
    category: "Account Management",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    autoResponse: `Hi there,\n\nAdding a team member is easy. Go to Settings > Team > Members > Invite Member and enter their email. They'll get an invite within a few minutes.\n\nGuide here: [help.platform.com/invite-members]\n\nBest,\nSupport Team`,
  },
  {
    company: "Stripe",
    sender: "ops@stripe.com",
    subject: "Dashboard loading very slowly — 15-20 seconds",
    preview: "Our dashboard has been loading really slowly for the past day or so...",
    body: "Our dashboard has been loading really slowly for the past day or so. Takes about 15-20 seconds to load. Other pages seem fine.",
    priority: "Medium",
    category: "Performance",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    autoResponse: `Hi,\n\nThanks for flagging this. Slow dashboard loads are usually caused by a large number of active widgets or a date range pulling a lot of data. Try:\n\n1) Reducing your default date range to 30 days\n2) Removing unused widgets\n\nIf it persists after trying these, reply here with your account ID and I'll escalate to our performance team.\n\nGuide: [help.platform.com/dashboard-performance]\n\nBest,\nSupport Team`,
  },
  {
    company: "Shopify",
    sender: "analytics@shopify.com",
    subject: "Reports showing wrong timezone — UTC instead of EST",
    preview: "Our reports are showing the wrong timezone. We're in EST but everything shows as UTC...",
    body: "Our reports are showing the wrong timezone. We're based in EST but everything is showing as UTC.",
    priority: "Low",
    category: "Settings",
    age: "just now",
    status: "Open",
    l1Solvable: true,
    escalate: false,
    synced: false,
    triage: null,
    autoResponse: `Hi,\n\nEasy fix! Go to Settings > Preferences > Timezone and update it to Eastern Time (US & Canada). Reports will refresh automatically.\n\nHere's the guide: [help.platform.com/timezone-settings]\n\nBest,\nSupport Team`,
  },
];

const _PRESET_BASE = Date.now();
const PRESET_NOTES: Record<string, InternalNote[]> = {
  "T-1041": [
    { author: "John Moffa", initials: "JM", time: "1 hour ago", ts: _PRESET_BASE - 3600000, body: "Flagged this to the auth engineering team. Suspect the ACS URL changed during their Okta infrastructure upgrade. Asked Tyler to take a look at the backend logs." },
    { author: "Tyler Brooks", initials: "TB", time: "45 min ago", ts: _PRESET_BASE - 2700000, body: "Confirmed — their certificate also expired last night. Two issues at once. Working on a fix now." },
  ],
  "T-1040": [
    { author: "Maria Santos", initials: "MS", time: "2 hours ago", ts: _PRESET_BASE - 7200000, body: "Marcus has been asking about Enterprise pricing for 2 months. This is a good opportunity to push the upgrade conversation. Looping in sales." },
  ],
  "T-1039": [
    { author: "John Moffa", initials: "JM", time: "30 min ago", ts: _PRESET_BASE - 1800000, body: "This is the same OAuth permissions issue from their April setup call. I have the transcript. Going to reference it in my response." },
    { author: "Tyler Brooks", initials: "TB", time: "20 min ago", ts: _PRESET_BASE - 1200000, body: "Escalating to integrations engineering. Board meeting deadline makes this urgent." },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityColor(p: string): string {
  if (p === "Critical") return S.red;
  if (p === "High") return S.orange;
  if (p === "Medium") return "#7C3AED";
  if (p === "Low") return S.green;
  return S.muted;
}

function priorityBg(p: string): string {
  if (p === "Critical") return "rgba(239,68,68,0.12)";
  if (p === "High") return "rgba(249,115,22,0.12)";
  if (p === "Medium") return "#7C3AED";
  if (p === "Low") return "rgba(29,158,117,0.12)";
  return "rgba(85,85,85,0.12)";
}

function statusDot(s: string): string {
  if (s === "connected") return S.green;
  if (s === "error") return S.red;
  return S.muted;
}

function statusLabel(s: string): string {
  if (s === "connected") return "Connected";
  if (s === "error") return "Error";
  return "Disconnected";
}

const STATUS_OPTIONS = ["Open", "In Progress", "Pending Customer", "Escalated", "Resolved"] as const;
function ticketStatusColor(s: string): string {
  if (s === "Open") return "#2997ff";
  if (s === "In Progress") return S.amber;
  if (s === "Pending Customer") return "#a855f7";
  if (s === "Escalated") return S.red;
  if (s === "Resolved") return S.green;
  return S.body;
}
const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"] as const;

let simCounter = 1035;

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 4,
        background: priorityBg(priority),
        color: priority === "Medium" ? "#ffffff" : priorityColor(priority),
        border: `1px solid ${priorityColor(priority)}33`,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        flexShrink: 0,
      }}
    >
      {priority}
    </span>
  );
}

function TabBar({
  active,
  onChange,
  openCount,
}: {
  active: string;
  onChange: (t: string) => void;
  openCount?: number;
}) {
  const tabs = ["inbox", "admin", "connectors", "settings"];
  const labels: Record<string, string> = { inbox: "Inbox", admin: "Admin", connectors: "Connectors", settings: "⚙ Settings" };
  return (
    <div className="sta-nav-tabs" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {tabs.map((t) => (
        <button
          key={t}
          className="sta-nav-tab"
          onClick={() => onChange(t)}
          style={{
            padding: "6px 16px",
            borderRadius: 20,
            border: `1px solid ${active === t ? S.amber : "#2a2a2a"}`,
            background: active === t ? S.amberBg : "transparent",
            color: active === t ? S.amber : "#666",
            fontSize: 13,
            fontWeight: active === t ? 600 : 400,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            if (active !== t) {
              e.currentTarget.style.borderColor = S.amber + "88";
              e.currentTarget.style.color = S.head;
            }
          }}
          onMouseLeave={(e) => {
            if (active !== t) {
              e.currentTarget.style.borderColor = "#2a2a2a";
              e.currentTarget.style.color = "#666";
            }
          }}
        >
          {labels[t]}
          {t === "inbox" && openCount !== undefined && openCount > 0 && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 8,
              background: active === t ? S.amber : "#333",
              color: active === t ? "#0a0a0a" : "#aaa",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
            }}>
              {openCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Inbox view ───────────────────────────────────────────────────────────────

function InboxView({ tickets, setTickets, liveTicketIds = new Set(), aiTriagedIds = new Set() }: {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  liveTicketIds?: Set<string>;
  aiTriagedIds?: Set<string>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null);
  const [filter, setFilter] = useState<"all" | "open" | "critical" | "resolved">("all");
  const [search, setSearch] = useState("");
  const [insightTab, setInsightTab] = useState<"overview" | "meetings" | "nextsteps" | "sla">("overview");
  const [copiedReply, setCopiedReply] = useState(false);
  const [editHistory, setEditHistory] = useState<Record<string, Array<{ field: string; value: string }>>>({});
  const [replyDirty, setReplyDirty] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const replyRef = useRef<HTMLDivElement>(null);
  const threadBottomRef = useRef<HTMLDivElement>(null);
  const threadContainerRef = useRef<HTMLDivElement>(null);
  // CC/BCC
  const [ccBccOpen, setCcBccOpen] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  // Reply / internal note mode
  const [replyMode, setReplyMode] = useState<"reply" | "note">("reply");
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [notes, setNotes] = useState<Record<string, InternalNote[]>>(PRESET_NOTES);
  // Send state
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");
  const [sendHighlighted, setSendHighlighted] = useState(false);
  const [sentReplies, setSentReplies] = useState<Record<string, Array<{ text: string; ccEmails: string[]; time: string; ts: number }>>>({});
  // Customer replies
  const [customerReplies, setCustomerReplies] = useState<Record<string, Array<{ text: string; ts: number }>>>({});
  const [simulatingReply, setSimulatingReply] = useState<Record<string, boolean>>({});
  const [hasNewReply, setHasNewReply] = useState<Record<string, boolean>>({});
  // Canned responses
  const [cannedOpen, setCannedOpen] = useState(false);
  // Assignee
  const [assignees, setAssignees] = useState<Record<string, string>>({});
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  // Toast
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setReplyDirty(false); setPriorityOpen(false); setStatusOpen(false); setCategoryOpen(false);
    setCcBccOpen(false); setCcEmails([]); setBccEmails([]); setCcInput(""); setBccInput("");
    setReplyMode("reply"); setSendState("idle"); setSendHighlighted(false);
    setCannedOpen(false); setAssigneeOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const el = threadContainerRef.current;
    if (!el) return;
    const target = el.scrollHeight - el.clientHeight - 60;
    el.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentReplies[selectedId ?? ""]?.length, customerReplies[selectedId ?? ""]?.length, notes[selectedId ?? ""]?.length]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function addEmailTag(emails: string[], setEmails: React.Dispatch<React.SetStateAction<string[]>>, setInput: React.Dispatch<React.SetStateAction<string>>, val: string) {
    const trimmed = val.replace(/,/g, "").trim();
    if (trimmed && trimmed.includes("@") && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setInput("");
  }

  function addNote(ticketId: string) {
    const body = noteRef.current?.value.trim();
    if (!body) return;
    const newNote: InternalNote = { author: "John Moffa", initials: "JM", time: "just now", ts: Date.now(), body };
    setNotes((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), newNote] }));
    if (noteRef.current) noteRef.current.value = "";
  }

  function addHistory(ticketId: string, field: string, value: string) {
    setEditHistory((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), { field, value }] }));
  }
  const PRIORITY_RANK: Record<Ticket["priority"], number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

  function changePriority(ticketId: string, priority: Ticket["priority"]) {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== ticketId) return t;
      const wasEscalated = t.escalate;
      const original = t.originalPriority ?? t.priority;
      const isRaisedAboveOriginal = PRIORITY_RANK[priority] > PRIORITY_RANK[original];
      const nowEscalated = isRaisedAboveOriginal || wasEscalated;
      if (isRaisedAboveOriginal && !wasEscalated) {
        // Add timeline note
        const escalationNote = {
          author: "John Moffa",
          initials: "JM",
          time: "just now",
          ts: Date.now(),
          body: `Ticket escalated — priority raised from ${original} to ${priority} by John Moffa`,
        };
        setNotes((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), escalationNote] }));
      }
      return { ...t, priority, escalate: nowEscalated };
    }));
    addHistory(ticketId, "Priority", priority);
    setPriorityOpen(false);
  }
  function changeStatus(ticketId: string, status: string) {
    if (status === "Resolved") {
      handleResolve(ticketId);
      addHistory(ticketId, "Status", "Resolved");
      setStatusOpen(false);
      return;
    }
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    addHistory(ticketId, "Status", status);
    setStatusOpen(false);
  }
  function changeCategory(ticketId: string, category: string) {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, category } : t));
    addHistory(ticketId, "Category", category);
    setCategoryOpen(false);
  }

  const filtered = tickets.filter((t) => {
    if (filter === "resolved") return !!t.resolved;
    if (t.resolved) return false;
    const matchSearch =
      search === "" ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (
      filter === "all" ||
      (filter === "open" && t.status === "Open") ||
      (filter === "critical" && t.priority === "Critical")
    );
  });

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  function runTriage(ticketId: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, triageState: "loading" } : t))
    );
    setTimeout(() => {
      const result = TRIAGE_RESPONSES[ticketId] ?? TRIAGE_RESPONSES["T-1040"];
      const aiPriority = result.priority as Ticket["priority"];
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, triageState: "done", triage: result, priority: aiPriority, originalPriority: aiPriority, category: result.category, l1Solvable: result.l1, escalate: result.escalate }
            : t
        )
      );
    }, 1500);
  }

  function handleResolve(ticketId: string) {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, resolved: true, status: "Resolved" } : t));
    if (selectedId === ticketId) {
      const remaining = filtered.filter((t) => !t.resolved && t.id !== ticketId);
      setSelectedId(remaining[0]?.id ?? null);
    }
    // Persist to KV in background — fire and forget
    fetch("/api/agents/support-triage/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticketId }),
    }).catch((err) => console.error("Resolve persist failed:", err));
  }

  function setDirectReply(ticketId: string) {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, triageState: "direct" } : t));
  }

  function formatAutoResponse(text: string): string {
    return text.replace(/\[([^\]]+)\]/g, (_, url) =>
      `<a href="https://${url}" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:underline;">${url}</a>`
    );
  }

  function handleAutoRespond(ticket: Ticket) {
    if (!ticket.autoResponse) return;
    if (replyRef.current) {
      replyRef.current.innerHTML = formatAutoResponse(ticket.autoResponse);
      setReplyDirty(true);
    }
    setSendHighlighted(true);
    setReplyMode("reply");
  }

  function handleSend(ticketId: string) {
    if (sendState !== "idle") return;
    const replyText = replyRef.current?.innerText ?? "";
    if (!replyText.trim()) return;
    setSendState("sending");
    const ccSnapshot = [...ccEmails];
    setTimeout(() => {
      setSendState("sent");
      setSentReplies((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] ?? []), { text: replyText, ccEmails: ccSnapshot, time: "just now", ts: Date.now() }],
      }));
      addHistory(ticketId, "Reply sent", "");
      if (replyRef.current) replyRef.current.innerHTML = "";
      setReplyDirty(false);
      setTimeout(() => setSendState("idle"), 1500);
    }, 1000);
  }

  function simulateCustomerReply(ticketId: string, category: string) {
    if (simulatingReply[ticketId]) return;
    setSimulatingReply((prev) => ({ ...prev, [ticketId]: true }));
    const replyText = CUSTOMER_REPLIES_BY_CATEGORY[category]
      ?? "Thanks for the update! I'll give that a try and let you know how it goes.";
    setTimeout(() => {
      setCustomerReplies((prev) => ({ ...prev, [ticketId]: [...(prev[ticketId] ?? []), { text: replyText, ts: Date.now() }] }));
      setSimulatingReply((prev) => ({ ...prev, [ticketId]: false }));
      setHasNewReply((prev) => ({ ...prev, [ticketId]: true }));
      changeStatus(ticketId, "Open");
      addHistory(ticketId, "Customer replied", "");
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, triageState: "idle" } : t));
      setSendState("idle");
    }, 1500);
  }

  function reassignTicket(ticketId: string, agentName: string) {
    const prev = assignees[ticketId] ?? "John Moffa";
    setAssignees((p) => ({ ...p, [ticketId]: agentName }));
    addHistory(ticketId, `Reassigned to ${agentName}`, "");
    setAssigneeOpen(false);
    showToast(`Ticket reassigned to ${agentName}`);
    void prev;
  }

  function insertCannedResponse(text: string) {
    if (replyRef.current) {
      replyRef.current.innerHTML = text.replace(/\[([^\]]+)\]/g, (_, url) =>
        `<a href="https://${url}" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:underline;">${url}</a>`
      );
      setReplyDirty(true);
    }
    setCannedOpen(false);
  }

  function simulateTicket() {
    simCounter--;
    const base = SIMULATE_POOL[Math.floor(Math.random() * SIMULATE_POOL.length)];
    const newTicket: Ticket = { ...base, id: `T-${simCounter}`, triageState: "idle" };
    setTickets((prev) => [newTicket, ...prev]);
    setSelectedId(newTicket.id);
    setMobileTab("ticket");
  }

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0 },
  };

  const insightTabs = ["overview", "meetings", "nextsteps", "sla"] as const;
  const insightLabels: Record<string, string> = { overview: "Overview", meetings: "Meetings", nextsteps: "Next Steps", sla: "SLA" };

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mobileTab, setMobileTab] = useState<"inbox" | "ticket" | "insights">("inbox");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("support-banner-dismissed");
    }
  }, []);

  function dismissBanner() {
    setBannerDismissed(true);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <m.div
            key="toast"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "#1a1a1a", border: `1px solid ${S.amberBorder}`, borderRadius: 20, padding: "6px 16px", fontSize: 12, color: S.amber, fontWeight: 500, whiteSpace: "nowrap" as const, pointerEvents: "none" }}
          >
            {toast}
          </m.div>
        )}
      </AnimatePresence>
    {/* Mobile top tab bar — only visible on mobile (≤768px), only in Inbox view */}
    <div className="sta-mobile-tabs" style={{ display: "none", background: "#111", borderBottom: "1px solid #1e1e1e", marginBottom: 0 }}>
      {(["inbox", "ticket", "insights"] as const).map((tab) => {
        const active = mobileTab === tab;
        const label = tab === "inbox" ? "Inbox" : tab === "ticket" ? "Ticket" : "Insights";
        const icon = tab === "inbox"
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></svg>
          : tab === "ticket"
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
        const openCount = tickets.filter(t => !t.resolved).length;
        return (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            style={{
              flex: 1,
              height: 40,
              background: "none",
              border: "none",
              borderBottom: active ? `2px solid #c9a84c` : "2px solid transparent",
              color: active ? "#c9a84c" : "#555",
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              transition: "all 0.15s",
              position: "relative",
            }}
          >
            {icon}
            {label}
            {tab === "inbox" && openCount > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 8, padding: "1px 4px", lineHeight: 1.4, marginLeft: 2 }}>
                {openCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
    <div className="sta-three-col" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {/* Left: ticket list */}
      <div className={`sta-sidebar${mobileTab === "inbox" ? " mobile-active" : ""}`} style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, height: 600, minHeight: 0 }}>
        {/* Live demo banner */}
        {!bannerDismissed && (
          <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, padding: "10px 10px 10px 10px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <style>{`
              @keyframes support-glow {
                from { box-shadow: 0 0 6px rgba(201,168,76,0.4); }
                to   { box-shadow: 0 0 16px rgba(201,168,76,0.8), 0 0 32px rgba(201,168,76,0.3); }
              }
              .agent-gh-link:hover { text-decoration: underline; }
              .support-copy-btn {
                animation: support-glow 2s ease-in-out infinite alternate;
                transition: box-shadow 0.2s ease, transform 0.2s ease;
              }
              .support-copy-btn:hover {
                box-shadow: 0 0 24px rgba(201,168,76,1), 0 0 48px rgba(201,168,76,0.4) !important;
                transform: scale(1.02);
              }
              .support-ticket-scroll { scrollbar-width: thin; scrollbar-color: #2a2a2a transparent; }
              .support-ticket-scroll::-webkit-scrollbar { width: 4px; }
              .support-ticket-scroll::-webkit-scrollbar-track { background: transparent; }
              .support-ticket-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
              .support-ticket-scroll::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }
              @media (max-width: 768px) {
                .sta-three-col { flex-direction: column !important; gap: 0 !important; height: auto !important; }
                .sta-sidebar { display: none !important; }
                .sta-sidebar.mobile-active { display: flex !important; width: 100% !important; height: auto !important; flex: none !important; }
                .sta-ticket-detail { display: none !important; }
                .sta-ticket-detail.mobile-active { display: flex !important; width: 100% !important; flex: none !important; }
                .sta-insights { display: none !important; }
                .sta-insights.mobile-active { display: block !important; width: 100% !important; flex: none !important; }
                .sta-mobile-tabs { display: flex !important; }
                .sta-nav-tabs { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
                .sta-nav-tabs::-webkit-scrollbar { display: none; }
                .sta-nav-tab { padding: 5px 10px !important; white-space: nowrap !important; flex-shrink: 0 !important; }
                .sta-filter-chips { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
                .sta-filter-chips::-webkit-scrollbar { display: none; }
                .sta-triage-buttons { flex-direction: column !important; }
                .sta-triage-buttons > button, .sta-triage-buttons > * { width: 100% !important; flex: none !important; }
                .sta-action-buttons { flex-wrap: wrap !important; }
                .sta-action-buttons > button, .sta-action-buttons > * { min-height: 44px !important; }
                .sta-ticket-card { min-height: 44px !important; }
                .sta-insight-subtabs { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
                .sta-insight-subtabs::-webkit-scrollbar { display: none; }
                .sta-admin-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
                .sta-connectors-grid { grid-template-columns: 1fr !important; }
                .sta-table-wrap { overflow-x: auto !important; }
              }
              @media (min-width: 769px) {
                .sta-mobile-tabs { display: none !important; }
                .sta-mobile-back { display: none !important; }
              }
            `}</style>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, color: "#aaa", lineHeight: 1.4 }}>
                Send an email and watch it appear live ↓
              </span>
              <button
                onClick={dismissBanner}
                style={{ fontSize: 11, color: S.muted, background: "none", border: "none", cursor: "pointer", padding: "0 2px", lineHeight: 1, transition: "color 0.15s", flexShrink: 0, marginLeft: 6 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = S.head)}
                onMouseLeave={(e) => (e.currentTarget.style.color = S.muted)}
              >×</button>
            </div>
            <button
              className="support-copy-btn"
              onClick={async () => {
                await navigator.clipboard.writeText("johnmoffa.support@gmail.com");
                setCopiedEmail(true);
                setTimeout(() => setCopiedEmail(false), 2000);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: copiedEmail ? "1px solid rgba(52,211,153,0.5)" : "1px solid #c9a84c",
                background: copiedEmail ? "rgba(52,211,153,0.15)" : "#c9a84c",
                color: copiedEmail ? S.green : "#0a0a0a",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center" as const,
              }}
            >
              {copiedEmail ? "✓ Copied!" : "📧 johnmoffa.support@gmail.com — click to copy"}
            </button>
          </div>
        )}

        {/* Simulate button — ghost amber style */}
        <m.button
          onClick={simulateTicket}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 0.55, ease: "easeInOut", delay: 0.4 }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${S.amber}`,
            background: "#0a0a0a",
            color: S.amber,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1a1a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#0a0a0a"; }}
        >
          ⚡ Simulate incoming ticket
        </m.button>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets..."
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "#1a1a1a",
            border: `1px solid ${S.border}`,
            borderRadius: 8,
            color: S.head,
            fontSize: 14,
            outline: "none",
          }}
        />

        {/* Filter chips */}
        <div className="sta-filter-chips" style={{ display: "flex", gap: 4, flexWrap: "wrap" as const }}>
          {(["all", "open", "critical", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "3px 10px",
                borderRadius: 12,
                border: `1px solid ${filter === f ? S.amber : S.border}`,
                background: filter === f ? S.amberBg : "transparent",
                color: filter === f ? S.amber : S.muted,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize" as const,
              }}
            >
              {f === "resolved" && tickets.filter((t) => t.resolved).length > 0
                ? `Resolved (${tickets.filter((t) => t.resolved).length})`
                : f}
            </button>
          ))}
        </div>

        {/* Ticket items */}
        <div
          style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
          className="support-ticket-scroll"
        >
          <AnimatePresence>
            {filtered.map((t) => {
              const isSelected = t.id === selectedId;
              const isResolved = !!t.resolved;
              return (
                <m.div
                  key={t.id}
                  className="sta-ticket-card"
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={() => { setSelectedId(t.id); setMobileTab("ticket"); setHasNewReply((p) => ({ ...p, [t.id]: false })); }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#0f0f0f"; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  style={{
                    flexShrink: 0,
                    minHeight: 88,
                    padding: "10px 12px",
                    borderLeft: isSelected ? `2px solid ${S.amber}` : "2px solid transparent",
                    borderBottom: "1px solid #1a1a1a",
                    background: isSelected ? "#141414" : "transparent",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Row 1: company + timestamp */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 18, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.head, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "65%" }}>{t.company}</span>
                    <span style={{ fontSize: 10, color: "#555", flexShrink: 0 }}>{t.age}</span>
                  </div>
                  {/* Row 2: subject */}
                  <div style={{ fontSize: 12, color: "#aaa", minHeight: 16, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {t.subject}
                  </div>
                  {/* Row 3: body preview */}
                  <div style={{ fontSize: 11, color: "#555", minHeight: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, marginBottom: 5 }}>
                    {t.preview}
                  </div>
                  {/* Row 4: badges */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center", minHeight: 20, flexWrap: "wrap" as const }}>
                    {/* Priority badge */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: t.priority === "Critical" ? "#E24B4A" : t.priority === "High" ? "#EF9F27" : t.priority === "Medium" ? "#7C3AED" : "#1D9E75",
                      color: t.priority === "High" ? "#0a0a0a" : "#ffffff",
                      flexShrink: 0,
                    }}>
                      {t.priority}
                    </span>
                    {liveTicketIds.has(t.id) && (
                      <span style={{ fontSize: 10, color: S.green, background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 8, fontWeight: 500 }}>
                        ● Live
                      </span>
                    )}
                    {t.escalate && (
                      <span style={{ fontSize: 10, color: S.red, background: "rgba(239,68,68,0.1)", padding: "2px 6px", borderRadius: 8, fontWeight: 500 }}>
                        ESC
                      </span>
                    )}
                    {hasNewReply[t.id] && !isResolved && (
                      <span style={{ fontSize: 10, color: "#2997ff", background: "rgba(41,151,255,0.1)", padding: "2px 6px", borderRadius: 8, fontWeight: 500 }}>
                        Reply
                      </span>
                    )}
                    {isResolved && (
                      <span style={{ fontSize: 10, color: "#666", background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 8, fontWeight: 500 }}>
                        DONE
                      </span>
                    )}
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
          <AnimatePresence>
            {filtered.length === 0 && filter !== "resolved" && (
              <m.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ textAlign: "center" as const, padding: "32px 8px", color: S.muted, fontSize: 13 }}
              >
                All caught up 🎉
              </m.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Center: ticket detail */}
      <div className={`sta-ticket-detail${mobileTab === "ticket" ? " mobile-active" : ""}`} style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
            {/* Email header */}
            <div ref={threadContainerRef} style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10, overflowY: "auto", maxHeight: 420 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0, flex: 1, minWidth: 0 }}>
                  {/* Mobile back button */}
                  <button
                    className="sta-mobile-back"
                    onClick={() => setMobileTab("inbox")}
                    style={{ background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer", padding: "0 8px 0 0", lineHeight: 1, minHeight: 44, display: "flex", alignItems: "center" }}
                  >
                    ←
                  </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: S.head, marginBottom: 3 }}>{selected.subject}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>From: <span style={{ color: S.head }}>{selected.sender}</span></div>

                  {/* Assigned to */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, position: "relative" }}>
                    <span style={{ fontSize: 12, color: S.muted }}>Assigned:</span>
                    <m.button
                      onClick={() => setAssigneeOpen((o) => !o)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: S.amberBg, border: `1px solid ${S.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: S.amber, flexShrink: 0 }}>
                        {(assignees[selected.id] ?? "John Moffa").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, color: S.head }}>{assignees[selected.id] ?? "John Moffa"}</span>
                      <span style={{ fontSize: 9, color: "#555", lineHeight: 1 }}>▾</span>
                    </m.button>
                    {assigneeOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setAssigneeOpen(false)} />
                        <div style={{ position: "absolute", left: 64, top: "calc(100% + 4px)", zIndex: 99, background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, overflow: "hidden", minWidth: 200 }}>
                          {DEFAULT_AGENTS.map((agent) => {
                            const isCurrent = (assignees[selected.id] ?? "John Moffa") === agent.name;
                            return (
                              <button
                                key={agent.id}
                                onClick={() => reassignTicket(selected.id, agent.name)}
                                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" as const, transition: "background 0.12s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                              >
                                <div style={{ width: 24, height: 24, borderRadius: "50%", background: S.amberBg, border: `1px solid ${S.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: S.amber, flexShrink: 0 }}>
                                  {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, color: S.head, fontWeight: 500 }}>{agent.name}</div>
                                  <div style={{ fontSize: 10, color: S.muted }}>{agent.role}</div>
                                </div>
                                {isCurrent && <span style={{ fontSize: 12, color: S.amber }}>✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  {!ccBccOpen ? (
                    <button onClick={() => setCcBccOpen(true)} style={{ background: "none", border: "none", padding: 0, fontSize: 11, color: "#555", cursor: "pointer", transition: "color 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = S.amber)} onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}>
                      + Add CC / BCC
                    </button>
                  ) : null}
                  </div>

                  {ccBccOpen && (
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" as const }}>
                      {/* CC */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: S.muted, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>CC</div>
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, padding: "5px 8px", background: "#111", border: `1px solid ${ccInput ? S.amber : "#2a2a2a"}`, borderRadius: 6, minHeight: 30, transition: "border-color 0.15s", alignItems: "center" }}>
                          {ccEmails.map((e) => (
                            <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#aaa", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "2px 7px" }}>
                              {e} <button onClick={() => setCcEmails((p) => p.filter((x) => x !== e))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1 }}>×</button>
                            </span>
                          ))}
                          <input value={ccInput} onChange={(e) => setCcInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmailTag(ccEmails, setCcEmails, setCcInput, ccInput); } }}
                            onBlur={() => { if (ccInput) addEmailTag(ccEmails, setCcEmails, setCcInput, ccInput); }}
                            placeholder="email@domain.com" style={{ flex: 1, minWidth: 80, background: "none", border: "none", outline: "none", fontSize: 11, color: S.head }} />
                        </div>
                      </div>
                      {/* BCC */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: S.muted, marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>BCC</div>
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, padding: "5px 8px", background: "#111", border: `1px solid ${bccInput ? S.amber : "#2a2a2a"}`, borderRadius: 6, minHeight: 30, transition: "border-color 0.15s", alignItems: "center" }}>
                          {bccEmails.map((e) => (
                            <span key={e} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "#aaa", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "2px 7px" }}>
                              {e} <button onClick={() => setBccEmails((p) => p.filter((x) => x !== e))} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 10, padding: 0, lineHeight: 1 }}>×</button>
                            </span>
                          ))}
                          <input value={bccInput} onChange={(e) => setBccInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmailTag(bccEmails, setBccEmails, setBccInput, bccInput); } }}
                            onBlur={() => { if (bccInput) addEmailTag(bccEmails, setBccEmails, setBccInput, bccInput); }}
                            placeholder="email@domain.com" style={{ flex: 1, minWidth: 80, background: "none", border: "none", outline: "none", fontSize: 11, color: S.head }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: S.muted }}>{selected.id}</span>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setPriorityOpen((o) => !o)}
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                    >
                      <PriorityBadge priority={selected.priority} />
                      <span style={{ fontSize: 9, color: S.muted, lineHeight: 1 }}>▾</span>
                    </button>
                    {editHistory[selected.id]?.some((h) => h.field === "Priority") && (
                      <span style={{ fontSize: 9, color: S.amber, position: "absolute", top: -9, right: 0, fontWeight: 700, letterSpacing: "0.03em" }}>edited</span>
                    )}
                    {priorityOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setPriorityOpen(false)} />
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 99, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden", minWidth: 120 }}>
                          {PRIORITY_OPTIONS.map((p) => (
                            <button
                              key={p}
                              onClick={() => changePriority(selected.id, p)}
                              style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 12px", background: "transparent", border: "none", color: priorityColor(p), fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left" as const }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: priorityColor(p), display: "inline-block", flexShrink: 0 }} />
                              {p}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: S.body, lineHeight: 1.6, marginTop: 8, whiteSpace: "pre-wrap" as const }}>
                {selected.body}
              </p>

              {/* Unified chronological thread */}
              {(() => {
                type ThreadItem =
                  | { type: "agent"; ts: number; text: string; ccEmails: string[]; time: string }
                  | { type: "customer"; ts: number; text: string }
                  | { type: "note"; ts: number; author: string; initials: string; time: string; body: string };

                const items: ThreadItem[] = [
                  ...(sentReplies[selected.id] ?? []).map((r) => ({ type: "agent" as const, ts: r.ts, text: r.text, ccEmails: r.ccEmails, time: r.time })),
                  ...(customerReplies[selected.id] ?? []).map((r) => ({ type: "customer" as const, ts: r.ts, text: r.text })),
                  ...(notes[selected.id] ?? []).map((n) => ({ type: "note" as const, ts: n.ts ?? 0, author: n.author, initials: n.initials, time: n.time, body: n.body })),
                ].sort((a, b) => a.ts - b.ts);

                const senderName = selected.sender.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const senderInitials = senderName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <>
                    {items.map((item, i) => {
                      if (item.type === "agent") {
                        return (
                          <div key={`agent-${i}`} style={{ marginTop: 12, padding: "10px 12px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                              <div style={{ width: 20, height: 20, borderRadius: "50%", background: S.amberBg, border: `1px solid ${S.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: S.amber, flexShrink: 0 }}>JM</div>
                              <span style={{ fontSize: 11, color: S.body, fontWeight: 500 }}>You</span>
                              <span style={{ fontSize: 10, color: S.muted }}>· {item.time}</span>
                              {item.ccEmails.length > 0 && (
                                <span style={{ fontSize: 10, color: S.muted }}>· CC {item.ccEmails.length}</span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" as const }}>{item.text}</p>
                          </div>
                        );
                      }
                      if (item.type === "customer") {
                        return (
                          <m.div
                            key={`customer-${i}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ marginTop: 12, padding: "12px", background: "#111", border: "1px solid #1e1e1e", borderRadius: 10 }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: S.body, flexShrink: 0 }}>{senderInitials}</div>
                              <span style={{ fontSize: 11, color: S.body, fontWeight: 500 }}>{senderName}</span>
                              <span style={{ fontSize: 10, color: S.muted }}>· just now</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                          </m.div>
                        );
                      }
                      return (
                        <div key={`note-${i}`} style={{ marginTop: 10, padding: "10px 12px", background: "rgba(201,168,76,0.04)", borderLeft: `2px solid ${S.amber}`, borderRadius: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: S.amber, background: S.amberBg, border: `1px solid ${S.amberBorder}`, borderRadius: 3, padding: "1px 5px", letterSpacing: "0.04em" }}>🔒 INTERNAL</span>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: S.amberBg, border: `1px solid ${S.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: S.amber, flexShrink: 0 }}>{item.initials}</div>
                            <span style={{ fontSize: 11, color: S.body, fontWeight: 500 }}>{item.author}</span>
                            <span style={{ fontSize: 10, color: S.muted }}>· {item.time}</span>
                          </div>
                          <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5, margin: 0 }}>{item.body}</p>
                        </div>
                      );
                    })}

                    {/* Simulate customer reply — fixed at bottom, shown after at least one agent reply */}
                    {(sentReplies[selected.id]?.length ?? 0) > 0 && (
                      <div style={{ marginTop: 14 }}>
                        {simulatingReply[selected.id] ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: S.muted, padding: "7px 0" }}>
                            <m.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              style={{ width: 12, height: 12, border: `1.5px solid ${S.amber}33`, borderTop: `1.5px solid ${S.amber}`, borderRadius: "50%" }}
                            />
                            Customer typing…
                          </div>
                        ) : (
                          <button
                            onClick={() => { simulateCustomerReply(selected.id, selected.category); setHasNewReply((p) => ({ ...p, [selected.id]: false })); }}
                            style={{ width: "100%", background: "none", border: `1px solid ${S.amberBorder}`, color: S.amber, fontSize: 11, padding: "7px 12px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s", textAlign: "center" as const }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = S.amberBg; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                          >
                            ↩ Simulate customer reply
                          </button>
                        )}
                      </div>
                    )}

                    <div ref={threadBottomRef} />
                  </>
                );
              })()}
            </div>

            {/* Triage box */}
            <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10 }}>
              {(!selected.triageState || selected.triageState === "idle") && (
                <div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: S.head, marginBottom: 3 }}>How would you like to handle this?</div>
                    <div style={{ fontSize: 12, color: S.muted }}>Let AI classify and draft a reply, or respond directly.</div>
                  </div>
                  <div className="sta-triage-buttons" style={{ display: "flex", gap: 8 }}>
                    <m.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => runTriage(selected.id)}
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: S.amber,
                        color: "#0a0a0a",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✦ Triage with AI
                    </m.button>
                    <m.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDirectReply(selected.id)}
                      style={{
                        flex: 1,
                        padding: "8px 14px",
                        borderRadius: 8,
                        border: `1px solid ${S.amber}`,
                        background: "transparent",
                        color: S.amber,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Respond directly
                    </m.button>
                  </div>
                </div>
              )}

              {selected.triageState === "loading" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <m.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: 16, height: 16, border: `2px solid ${S.amber}33`, borderTop: `2px solid ${S.amber}`, borderRadius: "50%" }}
                  />
                  <span style={{ fontSize: 13, color: S.muted }}>Analyzing ticket...</span>
                </div>
              )}

              {selected.triageState === "direct" && (
                <AnimatePresence mode="wait">
                  <m.div
                    key="direct-reply"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Reply / Internal Note tabs */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                      {(["reply", "note"] as const).map((mode) => (
                        <button key={mode} onClick={() => setReplyMode(mode)}
                          style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${replyMode === mode ? S.amber : "#2a2a2a"}`, background: replyMode === mode ? S.amberBg : "transparent", color: replyMode === mode ? S.amber : "#666", fontSize: 12, fontWeight: replyMode === mode ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                          {mode === "reply" ? "Reply" : "🔒 Internal Note"}
                        </button>
                      ))}
                    </div>

                    {replyMode === "reply" ? (
                      <>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Reply</div>
                          <div
                            key={selected.id + "_direct"}
                            ref={replyRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => setReplyDirty(true)}
                            onFocus={(e) => (e.currentTarget.style.borderColor = S.amber)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                            style={{ padding: "10px 12px", background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 12, color: S.body, lineHeight: 1.65, minHeight: 80, maxHeight: 180, overflowY: "auto" as const, outline: "none", cursor: "text", transition: "border-color 0.15s ease", whiteSpace: "pre-wrap" as const }}
                            data-placeholder="Type your response..."
                          />
                          {(ccEmails.length > 0 || bccEmails.length > 0) && (
                            <div style={{ fontSize: 10, color: S.muted, marginTop: 5 }}>
                              Sending to: {selected.sender}{ccEmails.length > 0 && ` + ${ccEmails.length} CC`}{bccEmails.length > 0 && ` + ${bccEmails.length} BCC`}
                            </div>
                          )}
                        </div>
                        <div className="sta-action-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
                          <m.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSend(selected.id)}
                            style={{
                              padding: "6px 14px", borderRadius: 6,
                              border: sendState === "sent" ? "1px solid rgba(52,211,153,0.3)" : "none",
                              background: sendState === "sent" ? "rgba(52,211,153,0.15)" : S.amber,
                              color: sendState === "sent" ? S.green : "#0a0a0a",
                              fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                            }}
                          >
                            {sendState === "sending" ? "Sending…" : sendState === "sent" ? "✓ Sent" : "Send Reply"}
                          </m.button>
                          {/* Canned responses — single source of truth for triageState==="direct" */}
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => setCannedOpen((o) => !o)}
                              style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${S.border}`, background: cannedOpen ? S.amberBg : "transparent", color: cannedOpen ? S.amber : "#555", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = S.amber; }}
                              onMouseLeave={(e) => { if (!cannedOpen) e.currentTarget.style.color = "#555"; }}
                            >
                              ☰ Templates
                            </button>
                            {cannedOpen && (
                              <>
                                <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setCannedOpen(false)} />
                                <div style={{ position: "absolute", left: 0, bottom: "calc(100% + 6px)", zIndex: 99, background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, width: 300, maxHeight: 280, overflowY: "auto" as const }}>
                                  <div style={{ padding: "10px 14px 6px", fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                                    Canned Responses
                                  </div>
                                  {Array.from(new Set(CANNED_RESPONSES_DEFAULT.map((r) => r.category))).map((cat) => (
                                    <div key={cat}>
                                      <div style={{ padding: "4px 14px 2px", fontSize: 10, color: S.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600 }}>{cat}</div>
                                      {CANNED_RESPONSES_DEFAULT.filter((r) => r.category === cat).map((r) => (
                                        <button
                                          key={r.id}
                                          onClick={() => insertCannedResponse(r.text)}
                                          style={{ display: "block", width: "100%", textAlign: "left" as const, padding: "7px 14px", background: "transparent", border: "none", borderLeft: "2px solid transparent", cursor: "pointer", transition: "all 0.12s" }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.borderLeftColor = S.amber; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; }}
                                        >
                                          <div style={{ fontSize: 11, color: S.body, lineHeight: 1.4 }}>
                                            {r.text.length > 60 ? r.text.slice(0, 60) + "…" : r.text}
                                          </div>
                                          <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>Use response →</div>
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              const text = replyRef.current?.innerText ?? "";
                              await navigator.clipboard.writeText(text);
                              setCopiedReply(true);
                              setTimeout(() => setCopiedReply(false), 1500);
                            }}
                            style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: copiedReply ? S.green : S.body, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}
                          >
                            {copiedReply ? "Copied!" : "Copy Reply"}
                          </button>
                          <button
                            onClick={() => handleResolve(selected.id)}
                            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: S.green, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            Resolve
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: S.amber, marginBottom: 6 }}>🔒 Internal only — not visible to customer</div>
                          <textarea
                            ref={noteRef}
                            placeholder="Add an internal note..."
                            rows={4}
                            style={{ width: "100%", padding: "10px 12px", background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 8, fontSize: 12, color: S.body, lineHeight: 1.65, outline: "none", resize: "vertical" as const, cursor: "text", fontFamily: "inherit" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = S.amber)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                          />
                        </div>
                        <button
                          onClick={() => addNote(selected.id)}
                          style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${S.amber}`, background: S.amberBg, color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = S.amber; e.currentTarget.style.color = "#000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = S.amberBg; e.currentTarget.style.color = S.amber; }}
                        >
                          Add Note
                        </button>
                      </>
                    )}
                  </m.div>
                </AnimatePresence>
              )}

              {selected.triageState === "done" && selected.triage && (
                <AnimatePresence mode="wait">
                  <m.div
                    key="triage-result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Classification row */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: S.muted }}>Classification:</span>
                      <PriorityBadge priority={selected.triage.priority} />
                      <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: S.amberBg, color: S.amber, border: `1px solid ${S.amberBorder}`, fontWeight: 500 }}>
                        {selected.triage.category}
                      </span>
                      {selected.triage.l1 ? (
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "rgba(52,211,153,0.1)", color: S.green, border: "1px solid rgba(52,211,153,0.2)", fontWeight: 500 }}>
                          L1 Solvable
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "rgba(85,85,85,0.12)", color: S.muted, border: `1px solid ${S.border}`, fontWeight: 500 }}>
                          Needs L2
                        </span>
                      )}
                      {selected.triage.escalate && (
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: "rgba(239,68,68,0.1)", color: S.red, border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }}>
                          Escalate
                        </span>
                      )}
                    </div>

                    {/* Reply / Internal Note tabs */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                      {(["reply", "note"] as const).map((mode) => (
                        <button key={mode} onClick={() => setReplyMode(mode)}
                          style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${replyMode === mode ? S.amber : "#2a2a2a"}`, background: replyMode === mode ? S.amberBg : "transparent", color: replyMode === mode ? S.amber : "#666", fontSize: 12, fontWeight: replyMode === mode ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                          {mode === "reply" ? "Reply" : "🔒 Internal Note"}
                        </button>
                      ))}
                    </div>

                    {replyMode === "reply" ? (
                      <>
                        {/* Suggested reply — editable */}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Suggested Reply</div>
                            <span style={{ fontSize: 10, color: S.muted }}>✎ Edit reply</span>
                          </div>
                          <div
                            key={selected.id}
                            ref={replyRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => setReplyDirty(true)}
                            onFocus={(e) => (e.currentTarget.style.borderColor = S.amber)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                            style={{ padding: "10px 12px", background: S.surface, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 12, color: S.body, lineHeight: 1.65, whiteSpace: "pre-wrap" as const, maxHeight: 180, overflowY: "auto" as const, outline: "none", cursor: "text", transition: "border-color 0.15s ease" }}
                          >
                            {selected.triage.suggestedReply}
                          </div>
                          {(ccEmails.length > 0 || bccEmails.length > 0) && (
                            <div style={{ fontSize: 10, color: S.muted, marginTop: 5 }}>
                              Sending to: {selected.sender}{ccEmails.length > 0 && ` + ${ccEmails.length} CC`}{bccEmails.length > 0 && ` + ${bccEmails.length} BCC`}
                            </div>
                          )}
                        </div>
                        {/* Action buttons */}
                        <div className="sta-action-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" }}>
                          <m.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSend(selected.id)}
                            style={{
                              padding: "6px 14px", borderRadius: 6,
                              border: sendState === "sent" ? "1px solid rgba(52,211,153,0.3)" : "none",
                              background: sendState === "sent" ? "rgba(52,211,153,0.15)" : S.amber,
                              color: sendState === "sent" ? S.green : "#0a0a0a",
                              fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
                            }}
                          >
                            {sendState === "sending" ? "Sending…" : sendState === "sent" ? "✓ Sent" : "Send Reply"}
                          </m.button>
                          {/* Canned responses — single source of truth for triageState==="done" */}
                          <div style={{ position: "relative" }}>
                            <button
                              onClick={() => setCannedOpen((o) => !o)}
                              style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${S.border}`, background: cannedOpen ? S.amberBg : "transparent", color: cannedOpen ? S.amber : "#555", fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = S.amber; }}
                              onMouseLeave={(e) => { if (!cannedOpen) e.currentTarget.style.color = "#555"; }}
                            >
                              ☰ Templates
                            </button>
                            {cannedOpen && (
                              <>
                                <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setCannedOpen(false)} />
                                <div style={{ position: "absolute", left: 0, bottom: "calc(100% + 6px)", zIndex: 99, background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, width: 300, maxHeight: 280, overflowY: "auto" as const }}>
                                  <div style={{ padding: "10px 14px 6px", fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                                    Canned Responses
                                  </div>
                                  {Array.from(new Set(CANNED_RESPONSES_DEFAULT.map((r) => r.category))).map((cat) => (
                                    <div key={cat}>
                                      <div style={{ padding: "4px 14px 2px", fontSize: 10, color: S.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontWeight: 600 }}>{cat}</div>
                                      {CANNED_RESPONSES_DEFAULT.filter((r) => r.category === cat).map((r) => (
                                        <button
                                          key={r.id}
                                          onClick={() => insertCannedResponse(r.text)}
                                          style={{ display: "block", width: "100%", textAlign: "left" as const, padding: "7px 14px", background: "transparent", border: "none", borderLeft: "2px solid transparent", cursor: "pointer", transition: "all 0.12s" }}
                                          onMouseEnter={(e) => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.borderLeftColor = S.amber; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; }}
                                        >
                                          <div style={{ fontSize: 11, color: S.body, lineHeight: 1.4 }}>
                                            {r.text.length > 60 ? r.text.slice(0, 60) + "…" : r.text}
                                          </div>
                                          <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>Use response →</div>
                                        </button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              const text = replyRef.current?.innerText ?? selected.triage!.suggestedReply;
                              await navigator.clipboard.writeText(text);
                              setCopiedReply(true);
                              setTimeout(() => setCopiedReply(false), 1500);
                            }}
                            style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${replyDirty ? S.amber : S.border}`, background: replyDirty ? S.amberBg : "transparent", color: copiedReply ? S.green : replyDirty ? S.amber : S.body, fontSize: 12, fontWeight: replyDirty ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}
                          >
                            {copiedReply ? "Copied!" : replyDirty ? "Copy Edited Reply" : "Copy Reply"}
                          </button>
                          {selected.triage.l1 && selected.autoResponse && (
                            <m.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleAutoRespond(selected)}
                              style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${S.amber}`, background: "transparent", color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                            >
                              ⚡ Auto-respond
                            </m.button>
                          )}
                          {selected.triage.escalate && (
                            <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: S.red, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              Escalate
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(selected.id)}
                            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.08)", color: S.green, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            Resolve
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Internal note */}
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: S.amber, marginBottom: 6 }}>🔒 Internal only — not visible to customer</div>
                          <textarea
                            ref={noteRef}
                            placeholder="Add an internal note..."
                            rows={4}
                            style={{ width: "100%", padding: "10px 12px", background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 8, fontSize: 12, color: S.body, lineHeight: 1.65, outline: "none", resize: "vertical" as const, cursor: "text", fontFamily: "inherit" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = S.amber)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                          />
                        </div>
                        <button
                          onClick={() => addNote(selected.id)}
                          style={{ padding: "6px 16px", borderRadius: 6, border: `1px solid ${S.amber}`, background: S.amberBg, color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = S.amber; e.currentTarget.style.color = "#000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = S.amberBg; e.currentTarget.style.color = S.amber; }}
                        >
                          Add Note
                        </button>
                      </>
                    )}
                  </m.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: S.muted, fontSize: 13 }}>
            Select a ticket to view details
          </div>
        )}
      </div>

      {/* Right: insights panel */}
      <div className={`sta-insights${mobileTab === "insights" ? " mobile-active" : ""}`} style={{ width: 260, flexShrink: 0 }}>
        <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10, height: "100%" }}>
          {/* Insight sub-tabs */}
          <div className="sta-insight-subtabs" style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" as const }}>
            {insightTabs.map((t) => (
              <button
                key={t}
                onClick={() => setInsightTab(t)}
                style={{
                  padding: "3px 9px",
                  borderRadius: 10,
                  border: `1px solid ${insightTab === t ? S.amber : S.border}`,
                  background: insightTab === t ? S.amberBg : "transparent",
                  color: insightTab === t ? S.amber : S.muted,
                  fontSize: 11,
                  fontWeight: insightTab === t ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {insightLabels[t]}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <m.div
              key={insightTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {insightTab === "overview" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    Account Context
                  </div>
                  {selected ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Row label="Company" value={selected.company} />
                      <Row label="Sender" value={selected.sender} />

                      {/* Editable Category */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: S.muted, flexShrink: 0 }}>Category</span>
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => setCategoryOpen((o) => !o)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, textAlign: "right" as const }}
                          >
                            <span style={{ fontSize: 12, color: S.amber }}>{selected.category}</span>
                            <span style={{ fontSize: 9, color: S.muted, lineHeight: 1 }}>▾</span>
                          </button>
                          {categoryOpen && (
                            <>
                              <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setCategoryOpen(false)} />
                              <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 99, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden", minWidth: 160, maxHeight: 200, overflowY: "auto" as const }}>
                                {DEFAULT_CATEGORIES.map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => changeCategory(selected.id, cat)}
                                    style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 12px", background: "transparent", border: "none", color: selected.category === cat ? S.amber : S.body, fontSize: 12, cursor: "pointer", textAlign: "left" as const }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.amber, opacity: selected.category === cat ? 1 : 0.3, display: "inline-block", flexShrink: 0 }} />
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Editable Status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: S.muted, flexShrink: 0 }}>Status</span>
                        <div style={{ position: "relative" }}>
                          <button
                            onClick={() => setStatusOpen((o) => !o)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}
                          >
                            <span style={{ fontSize: 12, color: ticketStatusColor(selected.status), fontWeight: 500 }}>{selected.status}</span>
                            <span style={{ fontSize: 9, color: S.muted, lineHeight: 1 }}>▾</span>
                          </button>
                          {statusOpen && (
                            <>
                              <div style={{ position: "fixed", inset: 0, zIndex: 98 }} onClick={() => setStatusOpen(false)} />
                              <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 99, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, overflow: "hidden", minWidth: 160 }}>
                                {STATUS_OPTIONS.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => changeStatus(selected.id, s)}
                                    style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 12px", background: "transparent", border: "none", color: ticketStatusColor(s), fontSize: 12, fontWeight: 500, cursor: "pointer", textAlign: "left" as const }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                  >
                                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: ticketStatusColor(s), display: "inline-block", flexShrink: 0 }} />
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <Row label="Priority" value={selected.priority} valueColor={priorityColor(selected.priority)} />
                      <Row label="L1 Solvable" value={selected.l1Solvable ? "Yes" : "No"} valueColor={selected.l1Solvable ? S.green : S.muted} />
                      <Row label="Escalate" value={selected.escalate ? "Yes" : "No"} valueColor={selected.escalate ? S.red : S.muted} />

                      {/* Edit history */}
                      {(editHistory[selected.id]?.length ?? 0) > 0 && (
                        <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 8, marginTop: 2 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>
                            Edit Log
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {editHistory[selected.id].map((entry, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                                <span style={{ fontSize: 10, flexShrink: 0, marginTop: 1 }}>{entry.field === "Reply sent" ? "✉" : "✎"}</span>
                                <span style={{ fontSize: 11, color: S.muted, lineHeight: 1.4 }}>
                                  {entry.field === "Reply sent"
                                    ? <><span style={{ color: S.body, fontWeight: 500 }}>Reply sent</span> by John Moffa <span style={{ color: S.muted }}>· just now</span></>
                                    : entry.field === "Customer replied"
                                    ? <><span style={{ color: "#2997ff", fontWeight: 500 }}>Customer replied</span> <span style={{ color: S.muted }}>· just now</span></>
                                    : entry.field.startsWith("Reassigned to")
                                    ? <><span style={{ color: S.body, fontWeight: 500 }}>{entry.field}</span> by John Moffa <span style={{ color: S.muted }}>· just now</span></>
                                    : <>{entry.field} changed to <span style={{ color: S.body, fontWeight: 500 }}>{entry.value}</span> by John Moffa <span style={{ color: S.muted }}>· just now</span></>
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Internal notes timeline */}
                      {(notes[selected.id]?.length ?? 0) > 0 && (
                        <div style={{ borderTop: `1px solid ${S.border}`, paddingTop: 8, marginTop: 2 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: S.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>
                            Internal Notes
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {notes[selected.id].map((note, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1, color: S.amber }}>🔒</span>
                                <span style={{ fontSize: 11, color: S.muted, lineHeight: 1.4 }}>
                                  <span style={{ color: S.body, fontWeight: 500 }}>{note.author}</span>
                                  {" — "}
                                  {note.body.slice(0, 60)}{note.body.length > 60 ? "…" : ""}
                                  <span style={{ color: S.muted }}> · {note.time}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: S.muted }}>No ticket selected</span>
                  )}
                </div>
              )}

              {insightTab === "meetings" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    Related Meetings
                  </div>
                  {[
                    { title: "Quarterly Business Review", date: "Nov 12", attendees: 5 },
                    { title: "API Integration Sync", date: "Nov 8", attendees: 3 },
                    { title: "Onboarding Check-in", date: "Oct 30", attendees: 2 },
                  ].map((m) => (
                    <div key={m.title} style={{ padding: "8px 0", borderBottom: `1px solid ${S.border}` }}>
                      <div style={{ fontSize: 12, color: S.head, marginBottom: 2 }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: S.muted }}>{m.date} · {m.attendees} attendees</div>
                    </div>
                  ))}
                </div>
              )}

              {insightTab === "nextsteps" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    Recommended Actions
                  </div>
                  {[
                    "Review SAML config logs",
                    "Notify account manager",
                    "Schedule follow-up call",
                    "Update internal ticket tracker",
                  ].map((step, i) => (
                    <div key={step} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0" }}>
                      <span style={{ fontSize: 11, color: S.amber, fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12, color: S.body, lineHeight: 1.4 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {insightTab === "sla" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    SLA Status
                  </div>
                  {[
                    { label: "First Response", target: "1h", current: "14m", ok: true },
                    { label: "Resolution", target: "8h", current: "In progress", ok: null },
                    { label: "Escalation SLA", target: "30m", current: "On track", ok: true },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.border}` }}>
                      <div>
                        <div style={{ fontSize: 12, color: S.head }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: S.muted }}>Target: {item.target}</div>
                      </div>
                      <m.span
                        animate={item.ok === null ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                        transition={item.ok === null ? { repeat: Infinity, duration: 1.5 } : {}}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: item.ok === true ? S.green : item.ok === false ? S.red : S.amber,
                        }}
                      >
                        {item.current}
                      </m.span>
                    </div>
                  ))}
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 12, color: S.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: valueColor ?? S.body, textAlign: "right" as const, wordBreak: "break-all" as const }}>{value}</span>
    </div>
  );
}

// ─── Admin view ───────────────────────────────────────────────────────────────

function AdminView() {
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08 } }),
  };

  const maxVol = Math.max(...VOLUME_BARS);

  return (
    <m.div
      key="admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Stats grid */}
      <div className="sta-admin-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {ADMIN_STATS.map((stat, i) => {
          const trendPositive = stat.trend.startsWith("+");
          const trendNeutral = stat.label.includes("Escalation") || stat.label.includes("Multi-Person");
          const trendColor = trendPositive
            ? trendNeutral ? S.red : S.green
            : trendNeutral ? S.green : S.green;
          return (
            <m.div
              key={stat.label}
              custom={i}
              variants={statVariants}
              initial="hidden"
              animate="show"
              style={{
                padding: "12px 14px",
                background: "#111",
                border: `1px solid ${S.border}`,
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700, color: S.head, lineHeight: 1.1 }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{ fontSize: 11, color: S.muted, marginTop: 3 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: trendColor, marginTop: 4, fontWeight: 600 }}>{stat.trend}</div>
            </m.div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {/* Category breakdown */}
        <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
            By Category
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CATEGORY_BARS.map((cat, i) => (
              <div key={cat.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: S.body }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: S.muted }}>{cat.pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: S.border, overflow: "hidden" }}>
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                    style={{ height: "100%", background: S.amber, borderRadius: 2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent performance */}
        <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
            Agent Performance
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AGENTS.map((agent) => (
              <div key={agent.name} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: S.head, fontWeight: 600 }}>{agent.name}</span>
                  <span style={{ fontSize: 11, color: S.green, fontWeight: 600 }}>{agent.l1Rate}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: S.muted }}>{agent.tickets} tickets</span>
                  <span style={{ fontSize: 11, color: S.muted }}>avg {agent.avgTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume chart */}
        <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
            Volume (7 days)
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
            {VOLUME_BARS.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: S.border, borderRadius: 3, overflow: "hidden", height: 60, display: "flex", alignItems: "flex-end" }}>
                  <m.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxVol) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                    style={{ width: "100%", background: S.amber, borderRadius: "3px 3px 0 0" }}
                  />
                </div>
                <span style={{ fontSize: 9, color: S.muted }}>{VOLUME_DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </m.div>
  );
}

// ─── Connectors view ──────────────────────────────────────────────────────────

function ConnectorsView() {
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "done">("idle");

  function handleSync() {
    setSyncState("syncing");
    setTimeout(() => setSyncState("done"), 2200);
    setTimeout(() => setSyncState("idle"), 4000);
  }

  const connectorVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const connectorItem = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  const categories = ["Communication", "CRM", "Meetings", "AI"] as const;

  return (
    <m.div
      key="connectors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        {/* Left: connector grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: S.muted }}>
              {CONNECTORS.filter((c) => c.status === "connected").length} connected · {CONNECTORS.filter((c) => c.status === "disconnected").length} available
            </span>
            <button
              onClick={handleSync}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${S.amberBorder}`,
                background: S.amberBg,
                color: S.amber,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <m.span
                animate={{ rotate: syncState === "syncing" ? 360 : 0 }}
                transition={{ repeat: syncState === "syncing" ? Infinity : 0, duration: 1, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                ↻
              </m.span>
              {syncState === "syncing" ? "Syncing..." : syncState === "done" ? "Synced!" : "Sync All"}
            </button>
          </div>

          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>
                {cat}
              </div>
              <m.div
                variants={connectorVariants}
                initial="hidden"
                animate="show"
                className="sta-connectors-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
              >
                {CONNECTORS.filter((c) => c.category === cat).map((conn) => {
                  const isNative = (conn as typeof conn & { native?: boolean }).native;
                  return (
                  <m.div
                    key={conn.id}
                    variants={connectorItem}
                    style={{
                      padding: "12px 14px",
                      background: "#111",
                      border: `1px solid ${isNative ? S.amberBorder : conn.status === "error" ? "rgba(239,68,68,0.3)" : S.border}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={conn.favicon}
                          alt=""
                          width={24}
                          height={24}
                          style={{ borderRadius: 4, objectFit: "contain" }}
                          onError={(e) => { e.currentTarget.src = "https://anthropic.com/favicon.ico"; }}
                        />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: S.head }}>{conn.name}</span>
                      {isNative && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: S.amberBg, color: S.amber, border: `1px solid ${S.amberBorder}`, letterSpacing: "0.05em" }}>
                          Native
                        </span>
                      )}
                      <span
                        style={{
                          marginLeft: "auto",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: statusDot(conn.status),
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: S.muted, marginBottom: 6, lineHeight: 1.4 }}>{conn.description}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 6 }}>
                      {conn.dataPills.map((pill) => (
                        <span
                          key={pill}
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#1a1a1a",
                            color: S.muted,
                            border: `1px solid ${S.border}`,
                          }}
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: conn.status === "error" ? S.red : S.muted }}>
                        {conn.lastSync ? conn.lastSync : statusLabel(conn.status)}
                      </span>
                      <button
                        style={{
                          fontSize: 11,
                          padding: "3px 9px",
                          borderRadius: 5,
                          border: `1px solid ${conn.status === "connected" ? S.border : S.amberBorder}`,
                          background: conn.status === "connected" ? "transparent" : S.amberBg,
                          color: conn.status === "error" ? S.red : conn.status === "connected" ? S.muted : S.amber,
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        {conn.status === "connected" ? "Manage" : conn.status === "error" ? "Fix Auth" : "Connect"}
                      </button>
                    </div>
                  </m.div>
                  );
                })}
              </m.div>
            </div>
          ))}
        </div>

        {/* Right: live feed */}
        <div>
          <div style={{ padding: "14px 16px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>
              Live Feed
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LIVE_FEED.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                      style={{ borderRadius: 4, objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.src = "https://anthropic.com/favicon.ico"; }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: S.body, lineHeight: 1.4 }}>{item.text}</div>
                    <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>{item.source} · {item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}

// ─── Settings view ────────────────────────────────────────────────────────────

const CUSTOMER_REPLIES_BY_CATEGORY: Record<string, string> = {
  "Auth/SSO": "Thanks John — I tried re-uploading the metadata XML but we're still getting the same error. The ACS URL looks correct on our end. Could it be the certificate? Also our demo is in 3 hours so we really need this resolved ASAP.",
  "Auth / SSO": "Thanks John — I tried re-uploading the metadata XML but we're still getting the same error. The ACS URL looks correct on our end. Could it be the certificate? Also our demo is in 3 hours so we really need this resolved ASAP.",
  "API/Rate Limits": "Thanks for the quick response. We implemented the backoff logic and it helped a bit but we're still seeing occasional 429s during peak load. Is there any way to get a temporary rate limit increase while we work on the queuing solution?",
  "API / Rate Limits": "Thanks for the quick response. We implemented the backoff logic and it helped a bit but we're still seeing occasional 429s during peak load. Is there any way to get a temporary rate limit increase while we work on the queuing solution?",
  "Integration/Sync": "Hi, I checked the sync logs and I'm seeing this error: 'OAuth token expired — refresh failed'. Does that help narrow it down? The Salesforce admin says they didn't change anything on their end.",
  "Integration / Sync": "Hi, I checked the sync logs and I'm seeing this error: 'OAuth token expired — refresh failed'. Does that help narrow it down? The Salesforce admin says they didn't change anything on their end.",
  "Feature Request": "Thanks for the update! The API workaround looks doable for our engineering team. One follow up — is there an ETA on the Q3 release? We have a board presentation in August and it would be great to include it.",
  "Billing": "Hi, I found the invoice. The extra charge is listed as 'Overage — API calls (May)'. We definitely didn't think we were over our limit. Can you show me where I can track our usage in real time so this doesn't happen again?",
  "How-To": "That worked perfectly, thank you! Super quick response too. Really appreciate it.",
  "Account Access": "That worked perfectly, thank you! Super quick response too. Really appreciate it.",
  "Account Management": "That worked perfectly, thank you! Super quick response too. Really appreciate it.",
  "Settings": "That worked perfectly, thank you! Super quick response too. Really appreciate it.",
  "Performance": "Thanks, I tried reducing the date range and it did help a bit. Still slightly slow but much more usable. I'll keep an eye on it and follow up if it gets worse again.",
};

const CANNED_RESPONSES_DEFAULT = [
  { id: "g1", category: "General", text: "Thanks for reaching out — I'm looking into this now and will get back to you within the hour." },
  { id: "g2", category: "General", text: "Happy to help with this! Let me pull up your account and take a look." },
  { id: "g3", category: "General", text: "I've escalated this to our engineering team and flagged it as high priority. You'll hear back within 2 hours." },
  { id: "a1", category: "Auth / SSO", text: "This is typically caused by an ACS URL mismatch or an expired certificate. Can you re-upload the metadata XML from your IdP admin panel?" },
  { id: "a2", category: "Auth / SSO", text: "SSO issues after a config change are usually resolved by refreshing the metadata. Here's the step-by-step guide: [help.platform.com/sso-setup]" },
  { id: "r1", category: "API", text: "You're hitting the rate limit for your current plan. The quickest fix is to implement exponential backoff. Here's the pattern: [help.platform.com/rate-limits]" },
  { id: "r2", category: "API", text: "A 429 error means too many requests. Try spacing your calls out over a few minutes or upgrading to Enterprise for higher limits." },
  { id: "b1", category: "Billing", text: "I've pulled up your invoice and can see the charge. Let me walk you through each line item so nothing is a surprise going forward." },
  { id: "c1", category: "Closing", text: "Is there anything else I can help you with today?" },
  { id: "c2", category: "Closing", text: "I'm marking this as resolved — feel free to reply if anything else comes up." },
  { id: "c3", category: "Closing", text: "Great news that this is working! I'll mark the ticket resolved. Don't hesitate to reach out anytime." },
];

const DEFAULT_SLA = { Critical: 1, High: 4, Medium: 8, Low: 24 };
const DEFAULT_AGENTS = [
  { id: "1", name: "John Moffa", role: "Head of Support", active: true },
  { id: "2", name: "Maria Santos", role: "Support Engineer", active: true },
  { id: "3", name: "Tyler Brooks", role: "Support Engineer", active: true },
];
const DEFAULT_CATEGORIES = [
  "Auth / SSO", "API / Rate Limits", "Integration / Sync", "Feature Request",
  "Billing", "Account Access", "Bug Report", "Onboarding", "General",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function SectionDivider() {
  return <div style={{ borderTop: `1px solid #1e1e1e`, margin: "20px 0" }} />;
}

function SettingsView({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [sla, setSla] = useState<Record<string, number>>(DEFAULT_SLA);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [saved, setSaved] = useState(false);
  // Canned responses
  const [cannedResponses, setCannedResponses] = useState(CANNED_RESPONSES_DEFAULT);
  const [showCannedForm, setShowCannedForm] = useState(false);
  const [newCannedCat, setNewCannedCat] = useState("General");
  const [newCannedText, setNewCannedText] = useState("");

  const priorities = ["Critical", "High", "Medium", "Low"] as const;
  const priorityColors: Record<string, string> = {
    Critical: S.red, High: S.orange, Medium: "#7C3AED", Low: S.green,
  };

  const connectedTools = CONNECTORS.filter((c) => c.status === "connected");

  function addAgent() {
    if (!newAgentName.trim()) return;
    setAgents((prev) => [...prev, {
      id: String(Date.now()),
      name: newAgentName.trim(),
      role: newAgentRole.trim() || "Support Agent",
      active: true,
    }]);
    setNewAgentName("");
    setNewAgentRole("");
    setShowAgentForm(false);
  }

  function removeAgent(id: string) {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  function toggleAgent(id: string) {
    setAgents((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  }

  function addCategory() {
    const val = newCategory.trim();
    if (!val || categories.includes(val)) return;
    setCategories((prev) => [...prev, val]);
    setNewCategory("");
    setShowCategoryInput(false);
  }

  function removeCategory(cat: string) {
    setCategories((prev) => prev.filter((c) => c !== cat));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: S.head,
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  return (
    <m.div
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* SLA Thresholds */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
        SLA Thresholds
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {priorities.map((p) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, width: 100, flexShrink: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColors[p], flexShrink: 0, display: "inline-block" }} />
              <span style={{ fontSize: 13, color: S.head, fontWeight: 500 }}>{p}</span>
            </div>
            <span style={{ fontSize: 12, color: S.body, flexShrink: 0 }}>First response within</span>
            <input
              type="number"
              min={1}
              value={sla[p]}
              onChange={(e) => setSla((prev) => ({ ...prev, [p]: Math.max(1, parseInt(e.target.value) || 1) }))}
              style={{ ...inputStyle, width: 60, textAlign: "center" as const, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, color: S.muted }}>hours</span>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Agent Roster */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
        Agent Roster
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", background: "#111",
              border: `1px solid ${S.border}`, borderRadius: 8,
              opacity: agent.active ? 1 : 0.5,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: S.amberBg,
              border: `1px solid ${S.amberBorder}`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 11, fontWeight: 700, color: S.amber, flexShrink: 0,
            }}>
              {initials(agent.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: S.head }}>{agent.name}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{agent.role}</div>
            </div>
            {/* Toggle */}
            <div
              onClick={() => toggleAgent(agent.id)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: agent.active ? S.amber : "#2a2a2a",
                position: "relative", cursor: "pointer", transition: "background 0.2s ease", flexShrink: 0,
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 3,
                left: agent.active ? 19 : 3,
                transition: "left 0.2s ease",
              }} />
            </div>
            <button
              onClick={() => removeAgent(agent.id)}
              style={{ background: "none", border: "none", color: S.muted, fontSize: 14, cursor: "pointer", padding: "0 2px", lineHeight: 1, flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = S.red)}
              onMouseLeave={(e) => (e.currentTarget.style.color = S.muted)}
            >
              ✕
            </button>
          </div>
        ))}
        {showAgentForm ? (
          <div style={{ padding: "12px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              autoFocus
              placeholder="Full name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAgent()}
              style={inputStyle}
            />
            <input
              placeholder="Role (e.g. Support Engineer)"
              value={newAgentRole}
              onChange={(e) => setNewAgentRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAgent()}
              style={inputStyle}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addAgent} style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${S.amber}`, background: S.amberBg, color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Add
              </button>
              <button onClick={() => { setShowAgentForm(false); setNewAgentName(""); setNewAgentRole(""); }} style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAgentForm(true)}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1px dashed #2a2a2a`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.amber + "66"; e.currentTarget.style.color = S.amber; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = S.muted; }}
          >
            <span style={{ fontSize: 14 }}>＋</span> Add agent
          </button>
        )}
      </div>

      <SectionDivider />

      {/* Ticket Categories */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
        Ticket Categories
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
        {categories.map((cat) => (
          <div
            key={cat}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", background: "#111",
              border: `1px solid ${S.border}`, borderRadius: 20, fontSize: 12, color: S.body,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.amber, flexShrink: 0, display: "inline-block" }} />
            {cat}
            <button
              onClick={() => removeCategory(cat)}
              style={{ background: "none", border: "none", color: S.muted, fontSize: 12, cursor: "pointer", padding: 0, lineHeight: 1, marginLeft: 2, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = S.red)}
              onMouseLeave={(e) => (e.currentTarget.style.color = S.muted)}
            >
              ✕
            </button>
          </div>
        ))}
        {showCategoryInput ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              autoFocus
              placeholder="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") { setShowCategoryInput(false); setNewCategory(""); } }}
              style={{ ...inputStyle, width: 160, padding: "5px 10px", fontSize: 12 }}
            />
            <button onClick={addCategory} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${S.amber}`, background: S.amberBg, color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
              Add
            </button>
            <button onClick={() => { setShowCategoryInput(false); setNewCategory(""); }} style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer" }}>
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCategoryInput(true)}
            style={{ padding: "5px 10px", borderRadius: 20, border: `1px dashed #2a2a2a`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.amber + "66"; e.currentTarget.style.color = S.amber; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = S.muted; }}
          >
            <span style={{ fontSize: 13 }}>＋</span> Add category
          </button>
        )}
      </div>

      <SectionDivider />

      {/* Connected Software */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
        Connected Software
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {connectedTools.map((tool) => (
          <div
            key={tool.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", background: "#111",
              border: `1px solid ${S.border}`, borderRadius: 8,
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 5, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tool.favicon} alt="" width={18} height={18} style={{ borderRadius: 3, objectFit: "contain" }} onError={(e) => { e.currentTarget.src = "https://anthropic.com/favicon.ico"; }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: S.head, flex: 1 }}>{tool.name}</span>
            <span style={{ fontSize: 11, color: S.green, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
              Connected
            </span>
            <button
              onClick={() => onNavigate?.("connectors")}
              style={{ fontSize: 11, color: S.amber, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontWeight: 500, transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Manage ↗
            </button>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Canned Responses */}
      <div style={{ fontSize: 11, fontWeight: 700, color: S.amber, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
        Canned Responses
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {Array.from(new Set(cannedResponses.map((r) => r.category))).map((cat) => (
          <div key={cat} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: S.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 5, fontWeight: 600 }}>{cat}</div>
            {cannedResponses.filter((r) => r.category === cat).map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 7, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: S.body, flex: 1, lineHeight: 1.4 }}>{r.text.length > 80 ? r.text.slice(0, 80) + "…" : r.text}</span>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => { /* edit: pre-fill form */ setNewCannedCat(r.category); setNewCannedText(r.text); setCannedResponses((p) => p.filter((x) => x.id !== r.id)); setShowCannedForm(true); }}
                    style={{ background: "none", border: "none", color: S.muted, fontSize: 12, cursor: "pointer", transition: "color 0.15s", padding: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = S.amber)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = S.muted)}
                    title="Edit"
                  >✎</button>
                  <button
                    onClick={() => setCannedResponses((p) => p.filter((x) => x.id !== r.id))}
                    style={{ background: "none", border: "none", color: S.muted, fontSize: 12, cursor: "pointer", transition: "color 0.15s", padding: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = S.red)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = S.muted)}
                    title="Delete"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {showCannedForm ? (
          <div style={{ padding: "12px", background: "#111", border: `1px solid ${S.border}`, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <select
              value={newCannedCat}
              onChange={(e) => setNewCannedCat(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {["General", "Auth / SSO", "API", "Billing", "Closing"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <textarea
              autoFocus
              placeholder="Response text..."
              value={newCannedText}
              onChange={(e) => setNewCannedText(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  if (!newCannedText.trim()) return;
                  setCannedResponses((p) => [...p, { id: String(Date.now()), category: newCannedCat, text: newCannedText.trim() }]);
                  setNewCannedText(""); setShowCannedForm(false);
                }}
                style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${S.amber}`, background: S.amberBg, color: S.amber, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >Save</button>
              <button
                onClick={() => { setShowCannedForm(false); setNewCannedText(""); }}
                style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${S.border}`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer" }}
              >Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCannedForm(true)}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1px dashed #2a2a2a`, background: "transparent", color: S.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.amber + "66"; e.currentTarget.style.color = S.amber; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = S.muted; }}
          >
            <span style={{ fontSize: 14 }}>＋</span> Add canned response
          </button>
        )}
      </div>

      <SectionDivider />

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          width: "100%", padding: "11px", borderRadius: 8,
          border: saved ? "1px solid rgba(52,211,153,0.3)" : "none",
          background: saved ? "rgba(52,211,153,0.15)" : S.amber,
          color: saved ? S.green : "#0a0a0a",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          transition: "all 0.2s ease",
        } as React.CSSProperties}
      >
        {saved ? "✓ Settings Saved" : "Save Settings"}
      </button>
    </m.div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const times = [0, 0.18];
    const freqs = [880, 1108];
    times.forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freqs[i];
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.4);
    });
  } catch {
    // Web Audio not available — silent fail
  }
}

function liveTicketToTicket(lt: {
  id: string; from: string; email: string; company: string;
  subject: string; body: string; time: string; priority: string;
  category: string; aiTriaged?: boolean;
  triage?: { priority: string; category: string; l1Solvable: boolean; escalate: boolean; suggestedReply: string };
}): Ticket {
  const priority = (["Critical","High","Medium","Low"].includes(
    lt.priority.charAt(0).toUpperCase() + lt.priority.slice(1).toLowerCase()
  ) ? lt.priority.charAt(0).toUpperCase() + lt.priority.slice(1).toLowerCase() : "Medium") as Ticket["priority"];

  const triage: TriageResult | null = lt.triage
    ? { priority: lt.triage.priority, category: lt.triage.category, l1: lt.triage.l1Solvable, escalate: lt.triage.escalate, suggestedReply: lt.triage.suggestedReply }
    : null;

  return {
    id: lt.id,
    company: lt.company,
    sender: lt.email,
    subject: lt.subject,
    preview: lt.body.slice(0, 100) + (lt.body.length > 100 ? "…" : ""),
    body: lt.body,
    priority,
    category: lt.category,
    age: lt.time,
    status: "Open",
    l1Solvable: lt.triage?.l1Solvable ?? false,
    escalate: lt.triage?.escalate ?? false,
    synced: false,
    triage,
    triageState: lt.aiTriaged ? "done" : "idle",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupportTriageAgent() {
  const [activeTab, setActiveTab] = useState<"inbox" | "admin" | "connectors" | "settings">("inbox");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [liveTicketIds, setLiveTicketIds] = useState<Set<string>>(new Set());
  const [aiTriagedIds, setAiTriagedIds] = useState<Set<string>>(new Set());
  const [inboxToast, setInboxToast] = useState<string | null>(null);
  const seenLiveIds = useRef<Set<string>>(new Set());

  function showInboxToast(msg: string) {
    setInboxToast(msg);
    setTimeout(() => setInboxToast(null), 3000);
  }

  // Auto-triage a live ticket via the API
  async function autoTriage(ticketId: string, subject: string, body: string) {
    try {
      const res = await fetch("/api/agents/triage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                priority: (["Critical","High","Medium","Low"].includes(
                  (data.priority as string).charAt(0).toUpperCase() + (data.priority as string).slice(1).toLowerCase()
                ) ? (data.priority as string).charAt(0).toUpperCase() + (data.priority as string).slice(1).toLowerCase() : "Medium") as Ticket["priority"],
                category: data.category ?? t.category,
                l1Solvable: data.l1Solvable ?? t.l1Solvable,
                escalate: data.escalate ?? t.escalate,
                triage: {
                  priority: data.priority ?? "medium",
                  category: data.category ?? t.category,
                  l1: data.l1Solvable ?? false,
                  escalate: data.escalate ?? false,
                  suggestedReply: data.suggestedReply ?? "",
                },
                triageState: "done",
              }
            : t
        )
      );
      setAiTriagedIds((prev) => new Set([...prev, ticketId]));
    } catch {
      // Silent fail — live ticket just stays un-triaged
    }
  }

  // Poll for new live tickets every 5s
  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/agents/support-triage/tickets");
        if (!res.ok) return;
        const data: { tickets: Array<{ id: string; from: string; email: string; company: string; subject: string; body: string; time: string; priority: string; category: string; aiTriaged?: boolean; triage?: { priority: string; category: string; l1Solvable: boolean; escalate: boolean; suggestedReply: string } }> } = await res.json();
        const incoming = data.tickets ?? [];
        const newOnes = incoming.filter((lt) => !seenLiveIds.current.has(lt.id));
        if (newOnes.length === 0) return;

        newOnes.forEach((lt) => seenLiveIds.current.add(lt.id));

        const newTickets = newOnes.map(liveTicketToTicket);
        setTickets((prev) => [...newTickets, ...prev]);
        setLiveTicketIds((prev) => {
          const next = new Set(prev);
          newTickets.forEach((t) => next.add(t.id));
          return next;
        });

        // Toast + chime for first new ticket
        const first = newOnes[0];
        showInboxToast(`📧 New ticket from ${first.from || first.email}`);
        playChime();

        // Auto-triage after 2s
        newTickets.forEach((t) => {
          setTimeout(() => autoTriage(t.id, t.subject, t.body), 2000);
        });
      } catch {
        // Network error — ignore
      }
    }

    poll(); // fetch immediately on mount
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .sta-container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; border-left-width: 0 !important; border-right-width: 0 !important; }
        .sta-content-pad { padding-left: 12px !important; padding-right: 12px !important; }
        .sta-header-pad { padding: 16px 12px !important; }
        .sta-footer-pad { padding: 0 12px 16px 12px !important; }
      }
    `}</style>
    <div
      className="rounded-2xl sta-container"
      style={{
        background: S.bg,
        border: `1px solid ${S.amberBorder}`,
        borderLeft: `3px solid ${S.amber}`,
        borderRadius: 16,
        position: "relative",
      }}
    >
      {/* Inbox live ticket toast — slides up from bottom */}
      <AnimatePresence>
        {inboxToast && (
          <m.div
            key="inbox-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 300,
              background: "#111",
              border: `1px solid ${S.amberBorder}`,
              borderRadius: 24,
              padding: "8px 18px",
              fontSize: 12,
              color: S.amber,
              fontWeight: 500,
              whiteSpace: "nowrap" as const,
              pointerEvents: "none",
            }}
          >
            {inboxToast}
          </m.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="px-7 pt-7 pb-6 sta-header-pad" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold" style={{ letterSpacing: "-0.02em", margin: 0 }}>
            <span style={{ color: S.head }}>Support Triage Agent</span>
            <span style={{ color: S.amber }}> — Live Demo</span>
          </h3>
          <span
            className="shrink-0 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
          >
            ● Live
          </span>
        </div>
        <p style={{ color: "#aaa", fontSize: 15, lineHeight: 1.7, marginBottom: 0 }}>
          Reads incoming support tickets, classifies priority and category, drafts personalized replies, and routes to the right team — all automatically. Connected to Gmail, Slack, HubSpot, Zoom, and more.
        </p>
      </div>

      {/* Tab content */}
      <div className="sta-content-pad" style={{ padding: "20px 28px 0 28px" }}>
        <TabBar active={activeTab} onChange={(t) => setActiveTab(t as typeof activeTab)} openCount={tickets.filter((t) => !t.resolved).length} />
      </div>
      <div className="sta-content-pad" style={{ padding: "0 28px 20px 28px" }}>
        <AnimatePresence mode="wait">
          {activeTab === "inbox" && (
            <m.div
              key="inbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <InboxView tickets={tickets} setTickets={setTickets} liveTicketIds={liveTicketIds} aiTriagedIds={aiTriagedIds} />
            </m.div>
          )}
          {activeTab === "admin" && <AdminView />}
          {activeTab === "connectors" && <ConnectorsView />}
          {activeTab === "settings" && <SettingsView onNavigate={(tab) => setActiveTab(tab as typeof activeTab)} />}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="sta-footer-pad" style={{ padding: "0 28px 24px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <p style={{ fontSize: 11, color: S.muted, letterSpacing: "1px" }}>
          Powered by Claude · Built by John Moffa
        </p>
        <a
          href="https://github.com/moffajj/support-triage-agent"
          target="_blank"
          rel="noopener noreferrer"
          className="agent-gh-link"
          style={{ fontSize: 11, color: "#555", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.google.com/s2/favicons?domain=github.com&sz=32" alt="" width={12} height={12} />
          View on GitHub
        </a>
      </div>
    </div>
    </>
  );
}
