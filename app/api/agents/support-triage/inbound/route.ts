import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const maxDuration = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InboundTicket {
  id: string;
  from: string;
  email: string;
  company: string;
  subject: string;
  body: string;
  time: string;
  priority: string;
  category: string;
  source: string;
  resolved: boolean;
  live: boolean;
  timestamp: number;
  aiTriaged?: boolean;
  triage?: {
    priority: string;
    category: string;
    l1Solvable: boolean;
    escalate: boolean;
    suggestedReply: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCompanyFromEmail(email: string): string {
  const domain = email.split("@")[1] ?? "";
  const base = domain.replace(/\.(com|io|co|net|org|edu|gov|us|uk|ca|au)(\.[a-z]{2})?$/i, "");
  return base
    .replace(/[-_.]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Unknown";
}

function formatSenderName(fromName: string | undefined, fromEmail: string): string {
  if (fromName && fromName.trim()) return fromName.trim();
  const local = fromEmail.split("@")[0];
  return local
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const secret = process.env.SUPPORT_WEBHOOK_SECRET;
  const headerSecret = req.headers.get("x-webhook-secret");
  if (!secret || headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { from_email, from_name, subject, body: emailBody, timestamp } = body as Record<string, string>;

  // Required field validation
  if (!from_email || !subject || !emailBody) {
    return NextResponse.json(
      { error: "Missing required fields: from_email, subject, body" },
      { status: 400 }
    );
  }

  const ticketId = `LIVE-${Date.now()}`;

  const ticket: InboundTicket = {
    id: ticketId,
    from: formatSenderName(from_name, from_email),
    email: from_email,
    company: formatCompanyFromEmail(from_email),
    subject: subject.trim().slice(0, 200),
    body: emailBody.trim().slice(0, 1000),
    time: "just now",
    priority: "medium",
    category: "Inbound Email",
    source: "email",
    resolved: false,
    live: true,
    timestamp: typeof timestamp === "string" ? parseInt(timestamp, 10) : Date.now(),
    aiTriaged: false,
  };

  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    await redis.lpush("support-tickets", JSON.stringify(ticket));
    await redis.ltrim("support-tickets", 0, 49);
  } catch (err) {
    console.error("KV store error:", err);
    return NextResponse.json(
      { error: "Failed to store ticket", detail: String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, ticketId: ticket.id }, { status: 200 });
}
