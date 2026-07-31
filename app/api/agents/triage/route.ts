import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { subject, body: emailBody } = body as { subject?: string; body?: string };
  if (!subject || !emailBody) {
    return NextResponse.json({ error: "Missing subject or body" }, { status: 400 });
  }

  const systemPrompt =
    'You are a support triage AI for a SaaS company. Analyze this support ticket and respond with a JSON object only — no markdown, no backticks, no preamble. Format: { "priority": "critical"|"high"|"medium"|"low", "category": string, "l1_solvable": boolean, "escalate": boolean, "suggested_reply": string }. The suggested_reply should be professional, empathetic, and under 150 words.';

  const userPrompt = `Subject: ${subject}\n\nBody: ${emailBody}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Triage API error:", response.status, errText);
    return NextResponse.json({ error: "Triage failed" }, { status: 500 });
  }

  const data = await response.json();
  const text: string = data?.content?.[0]?.text ?? "{}";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error("Failed to parse triage JSON:", text);
    return NextResponse.json({ error: "Invalid triage response" }, { status: 500 });
  }

  return NextResponse.json({
    priority: parsed.priority ?? "medium",
    category: parsed.category ?? "General",
    l1Solvable: parsed.l1_solvable ?? false,
    escalate: parsed.escalate ?? false,
    suggestedReply: parsed.suggested_reply ?? "",
  });
}
