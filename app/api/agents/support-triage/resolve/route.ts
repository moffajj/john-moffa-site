import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const maxDuration = 10;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ticketId } = body as { ticketId?: string };
  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
  }

  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    await redis.sadd("resolved-ticket-ids", ticketId);
  } catch (err) {
    console.error("KV resolve error:", err);
    return NextResponse.json({ error: "Failed to persist resolution" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
