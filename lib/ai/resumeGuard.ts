// Shared between the client form (ResumeBuilderClient) and the server route
// (lib/ai/generate.ts) so both agree on what counts as "enough to generate
// from" — a few words isn't enough real material to build a resume without
// the model padding the gaps with invented detail.
export const MIN_EXPERIENCE_LENGTH = 20

export function hasEnoughExperience(experience: string | null | undefined): boolean {
  return (experience ?? '').trim().length >= MIN_EXPERIENCE_LENGTH
}
