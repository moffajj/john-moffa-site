import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { InboundTicket } from "../inbound/route";

export const maxDuration = 10;

export async function GET() {
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
    const [raw, resolvedIds] = await Promise.all([
      redis.lrange("support-tickets", 0, 49),
      redis.smembers("resolved-ticket-ids"),
    ]);
    const resolvedSet = new Set(resolvedIds.map(String));
    const tickets: InboundTicket[] = raw
      .map((t) => (typeof t === "string" ? JSON.parse(t) : t))
      .filter((t: InboundTicket) => !resolvedSet.has(String(t.id)));
    const sorted = tickets.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json(
      { tickets: sorted },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("KV fetch error:", err);
    return NextResponse.json(
      { tickets: [] },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
