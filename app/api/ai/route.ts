import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })

  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  const client = new OpenAI({ apiKey })
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  })
  return NextResponse.json({ output: res.choices?.[0]?.message?.content ?? '' })
}
