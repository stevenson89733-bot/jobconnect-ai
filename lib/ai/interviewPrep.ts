import OpenAI from 'openai'
import { getPromptLanguageName } from './promptLocale'

/**
 * Interview Prep (text) — V1 scope: generate real interview questions
 * grounded in either a real job posting or the candidate's real profile,
 * then give per-answer written feedback. No multi-turn simulation, no
 * persistence (stateless, same reasoning as lib/ai/resumeAnalysis.ts —
 * career_analysis has its own table only because the Career Progress
 * chart has a real need to track history over time; this doesn't).
 *
 * Premium-only (gated by the caller), same as the rest of the AI Tools
 * family (Resume Builder, Cover Letter, Career Coach) — always GPT-4o,
 * consistent with that tier's existing model choice.
 *
 * Unlike lib/ai/copilot.ts / lib/ai/crossBorder.ts, both the questions and
 * the feedback ARE shown directly to the candidate, so both need the
 * language instruction (getPromptLanguageName()) — this is real generated
 * content, not an internal-only field.
 */

export class InterviewPrepError extends Error {
  status: number
  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

// Same anti-fabrication threshold/reasoning as lib/ai/resumeGuard.ts's
// MIN_EXPERIENCE_LENGTH — a few words isn't enough real material to give
// honest feedback from; never let the model pad the gap with invented praise
// or criticism.
export const MIN_ANSWER_LENGTH = 20

export function hasEnoughAnswer(answer: string | null | undefined): boolean {
  return (answer ?? '').trim().length >= MIN_ANSWER_LENGTH
}

export type InterviewPrepContext =
  | { kind: 'job'; targetRole: string; company: string; description: string }
  | { kind: 'profile'; targetRole: string; experience: string; skills: string }

function buildQuestionsPrompt(context: InterviewPrepContext, languageName: string): string {
  const contextBlock =
    context.kind === 'job'
      ? `Target role: ${context.targetRole}\nCompany: ${context.company}\nJob description: ${context.description || 'Not provided'}`
      : `Target role: ${context.targetRole}\nCandidate's real experience: ${context.experience || 'Not provided'}\nCandidate's real skills: ${context.skills || 'Not provided'}`

  return `You are helping a job candidate prepare for a real interview. Generate realistic interview questions based ONLY on the real information given below — never invent company-specific facts, technologies, or responsibilities not present in the input.

LANGUAGE: Write every question entirely in ${languageName}, regardless of what language the input below is written in.

${contextBlock}

STRICT RULES:
- Generate exactly 5 questions: a mix of behavioral ("tell me about a time...") and role-specific/technical questions grounded in the real input above.
- Every technical/situational question must reference only real skills/technologies/responsibilities present in the input above — never one not mentioned there.
- Behavioral questions may be standard/generic — they don't need to cite specific input facts.

Return a JSON object: { "questions": ["<q1>", "<q2>", "<q3>", "<q4>", "<q5>"] }`
}

function buildFeedbackPrompt(question: string, answer: string, languageName: string): string {
  return `You are an interview coach giving feedback on a candidate's real written answer to a real interview question. Base your feedback ONLY on what they actually wrote — never invent details they didn't say, never assume achievements or skills not stated in their answer.

LANGUAGE: Write the feedback entirely in ${languageName}, regardless of what language the question or answer are written in.

Question: ${question}
Candidate's answer: ${answer}

STRICT RULES:
- Comment on clarity, whether it directly answers the question, structure (for behavioral questions, whether it follows Situation/Task/Action/Result), and specificity (concrete real detail vs vague generality) — only where genuinely applicable to this specific answer.
- Never fabricate praise or criticism about something absent from the answer.
- Keep feedback to 2-4 sentences, constructive and specific to what was actually written.

Return a JSON object: { "feedback": "<2-4 sentences>" }`
}

function coerceQuestions(raw: unknown): string[] {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const arr = Array.isArray(obj.questions) ? obj.questions : []
  return arr.filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, 5)
}

function coerceFeedback(raw: unknown): string {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return typeof obj.feedback === 'string' ? obj.feedback.trim() : ''
}

async function chatJson(prompt: string, maxTokens: number): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new InterviewPrepError('OpenAI not configured', 503)

  const client = new OpenAI({ apiKey })
  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    })
    const raw = res.choices?.[0]?.message?.content ?? '{}'
    return JSON.parse(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Interview prep request failed'
    throw new InterviewPrepError(msg, 502)
  }
}

export async function generateQuestions(context: InterviewPrepContext): Promise<string[]> {
  const raw = await chatJson(buildQuestionsPrompt(context, getPromptLanguageName()), 600)
  return coerceQuestions(raw)
}

export async function generateFeedback(question: string, answer: string): Promise<string> {
  const raw = await chatJson(buildFeedbackPrompt(question, answer, getPromptLanguageName()), 300)
  return coerceFeedback(raw)
}
