// Shared types for saved cover letter drafts (lot 2: Save Draft + History).
// letter_content stores the exact generated/edited letter object — never a
// reconstructed or re-summarized version — same discipline as the resume
// export's "reuse result.resume, don't rebuild" rule.
export type CoverLetterStyleValue = 'Formal' | 'Conversational' | 'Concise'

export type SavedLetterContent = {
  subject: string
  greeting: string
  opening: string
  body: string
  closing: string
  signature: string
}

export type CoverLetterDraft = {
  id: string
  company_name: string
  target_role: string
  job_description: string | null
  style: CoverLetterStyleValue
  letter_content: SavedLetterContent
  created_at: string
  updated_at: string
}
