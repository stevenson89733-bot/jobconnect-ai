import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 })

  const { targetRole, experience, skills, education, summary } = await req.json()
  if (!targetRole || !experience) {
    return NextResponse.json({ error: 'targetRole and experience are required' }, { status: 400 })
  }

  const client = new OpenAI({ apiKey })

  const prompt = `You are an expert resume writer and ATS optimization specialist. Generate a professional, ATS-optimized resume and a resume score.

Target Job Title: ${targetRole}
Work Experience: ${experience}
Skills: ${skills || 'Not provided'}
Education: ${education || 'Not provided'}
Professional Summary: ${summary || 'Not provided'}

Return a JSON object with this exact structure:
{
  "score": <integer 0-100 representing ATS optimization score>,
  "scoreBreakdown": {
    "keywords": <0-25>,
    "formatting": <0-25>,
    "experience": <0-25>,
    "skills": <0-25>
  },
  "improvements": [<string>, <string>, <string>],
  "resume": {
    "name": "<infer a professional placeholder name or use 'Your Name'>",
    "title": "${targetRole}",
    "contact": "yourname@email.com | linkedin.com/in/yourname | github.com/yourname",
    "summary": "<2-3 sentence professional summary tailored to ${targetRole}, ATS-optimized>",
    "experience": "<formatted work experience with bullet points using action verbs and metrics, markdown-style>",
    "skills": "<comma-separated technical and soft skills relevant to ${targetRole}>",
    "education": "<formatted education section>"
  }
}`

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const content = res.choices?.[0]?.message?.content ?? '{}'
  const parsed = JSON.parse(content)
  return NextResponse.json(parsed)
}
