import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 500 })

  const { initiatives } = await req.json()

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: `You are the Sr. Manager of AI Operations at FanDuel presenting a weekly portfolio update to the VP of Technology. Using the initiative data provided, write a sharp executive update.

Your response must begin with a single thematic headline on the very first line. This headline is 6-10 words. It captures the dominant story or tension of this week's portfolio (e.g. "Compliance Blockers Threatening Q3 Delivery Window" or "Strong Momentum Offset by Two Critical Escalations"). No punctuation at the end. Then leave one blank line and write the structured update below using these exact section headers as plain all-caps text:

PORTFOLIO HEALTH
One sentence only. State the headline: X of 12 initiatives on track (X%), X at risk, X blocked.

WHAT IS DRIVING STATUS
Three bullet points maximum. Each bullet is one sentence starting with "- ". Focus on the systemic reasons behind current portfolio health, not individual initiatives.

ESCALATIONS REQUIRED THIS WEEK
One bolded headline per blocked or critical at-risk initiative, formatted exactly as: **Initiative Name - $XM at risk** (use a single hyphen surrounded by spaces as the separator). Under each headline write two sentences: what is blocked and what specific action leadership needs to take this week.

MOMENTUM
Two bullet points. One sentence each starting with "- ". Name the initiative, the progress percentage, and the specific business outcome it is approaching.

TOP 3 PRIORITIES FOR THE NEXT TWO WEEKS
Numbered list. Each item starts with "1.", "2.", "3." and is one specific actionable sentence, not general guidance.

Tone is direct and data-driven. No filler sentences. No double dashes. No em dashes. No markdown except for **bold** on escalation headlines. Use the section headers exactly as shown in plain all-caps.`,
      messages: [{ role: 'user', content: JSON.stringify(initiatives) }],
    }),
  })

  const data = await response.json()
  const full = (data.content?.[0]?.text ?? '') as string
  const firstBreak = full.indexOf('\n')
  const title = firstBreak > -1 ? full.slice(0, firstBreak).trim() : 'Portfolio Update'
  const text = firstBreak > -1 ? full.slice(firstBreak).trim() : full
  return NextResponse.json({ title, text })
}
