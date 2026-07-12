// Shared between the client form (ResumeBuilderClient) and the server route
// (lib/ai/generate.ts) so both agree on what counts as "enough to generate
// from" — a few words isn't enough real material to build a resume without
// the model padding the gaps with invented detail.
export const MIN_EXPERIENCE_LENGTH = 20

export function hasEnoughExperience(experience: string | null | undefined): boolean {
  return (experience ?? '').trim().length >= MIN_EXPERIENCE_LENGTH
}

// A real job title is always a single short line — never a pasted
// paragraph. Applied both at input time (client) and again server-side
// (defense in depth: covers any value that reaches generateResume() by a
// path other than the sanitized input, including old saved profile data).
export const MAX_TARGET_ROLE_LENGTH = 80

// Live version for onChange — only strips newlines and caps length, so
// typing/editing mid-sentence (spaces between words) isn't disrupted.
export function stripTargetRoleNewlines(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, MAX_TARGET_ROLE_LENGTH)
}

// Full sanitization — trims and collapses whitespace too. Used once at
// submit time and again server-side, not on every keystroke (trimming live
// would strip the trailing space a user needs while typing multiple words).
export function sanitizeTargetRole(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TARGET_ROLE_LENGTH)
}
