import { NextResponse } from 'next/server'

export const maxDuration = 30

const MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash'
const SYSTEM = `You are a cocoa plant disease expert for Ghana. Classify the cocoa leaf or pod image into EXACTLY one of: healthy, black_pod, cssvd (cocoa swollen shoot virus), anthracnose. Respond with ONLY a JSON object, no markdown:
{"class":"healthy|black_pod|cssvd|anthracnose","confidence":0.0,"reasoning":"one short sentence"}
If you cannot tell, still pick the closest class but set confidence between 0.40 and 0.60.`

export async function POST(req: Request) {
  const { imageDataUrl } = await req.json().catch(() => ({}))
  if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image' }, { status: 400 })
  }

  const key = process.env.OPENROUTER_API_KEY
  if (!key) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Which cocoa disease is in this image?' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'LLM request failed' }, { status: 502 })

  const data = await res.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''
  const match = content.match(/\{[\s\S]*\}/) // tolerate markdown fences
  if (!match) return NextResponse.json({ error: 'Unparseable LLM output' }, { status: 502 })
  try {
    const parsed = JSON.parse(match[0])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Unparseable LLM output' }, { status: 502 })
  }
}
