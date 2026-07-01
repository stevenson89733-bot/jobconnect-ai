import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })

  const { targetRole, company, strengths, tone } = await req.json()
  if (!targetRole || !company) {
    return NextResponse.json({ error: 'targetRole and company are required' }, { status: 400 })
  }

  const client = new OpenAI({ apiKey })

  const prompt = `You are an expert career coach and professional cover letter writer. Generate a compelling, personalized cover letter and a quality score.

Target Job Title: ${targetRole}
Company: ${company}
Candidate Strengths / Key Points: ${strengths || 'Not provided'}
Tone: ${tone || 'Professional and enthusiastic'}

Return a JSON object with this exact structure:
{
  "score": <integer 0-100 representing cover letter quality>,
  "scoreBreakdown": {
    "relevance": <0-25, how well it targets the role and company>,
    "impact": <0-25, strength of achievements and value proposition>,
    "tone": <0-25, appropriateness of tone and voice>,
    "structure": <0-25, clarity and professional formatting>
  },
  "improvements": [<string>, <string>, <string>],
  "letter": {
    "subject": "Application for ${targetRole} — [Candidate Name]",
    "greeting": "Dear Hiring Manager,",
    "opening": "<compelling 2-3 sentence opening paragraph that hooks the reader and states the role>",
    "body": "<2 paragraphs: first highlights the candidate's top strengths and achievements relevant to ${company} and ${targetRole}; second shows knowledge of ${company} and cultural fit>",
    "closing": "<strong closing paragraph with clear call to action>",
    "signature": "Sincerely,\\n[Your Name]\\n[Your Email] | [Your LinkedIn] | [Your Phone]"
  }
}`

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1800,
  })

  const raw = res.choices?.[0]?.message?.content ?? '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
  return NextResponse.json(parsed)
}
