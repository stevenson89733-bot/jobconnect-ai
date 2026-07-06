import { generateCoverLetter } from '@/lib/ai/generate'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  return generateCoverLetter(body)
}
