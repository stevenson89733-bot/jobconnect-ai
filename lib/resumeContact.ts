// Real contact info pulled from the candidate's own profile — never
// client-submitted (that would let a request claim someone else's
// name/email) and never fabricated by the LLM. Shared by the server-side
// generation (lib/ai/generate.ts) and the client-side live resume preview
// (ResumeBuilderClient) so both agree on exactly the same real data and
// formatting — no server-only imports here, safe for the client bundle.
export type ContactInfo = {
  name: string
  email: string
  phone: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
}

export const EMPTY_CONTACT: ContactInfo = { name: '', email: '', phone: '', linkedinUrl: '', githubUrl: '', portfolioUrl: '' }

type ProfileContactFields = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
}

// Same fallback rules used everywhere: real full_name (else the local part
// of the real account email — never a fabricated name), real email (profile
// or auth session), everything else omitted if not set.
export function buildContactInfo(profile: ProfileContactFields | null | undefined, authEmail: string | null | undefined): ContactInfo {
  return {
    name: profile?.full_name?.trim() || authEmail?.split('@')[0] || '',
    email: profile?.email?.trim() || authEmail || '',
    phone: profile?.phone?.trim() || '',
    linkedinUrl: profile?.linkedin_url?.trim() || '',
    githubUrl: profile?.github_url?.trim() || '',
    portfolioUrl: profile?.portfolio_url?.trim() || '',
  }
}

// Builds the single "email | phone | linkedin | github | portfolio" contact
// line, omitting any field the candidate hasn't set — never a placeholder.
export function formatContactLine(contact: ContactInfo): string {
  return [contact.email, contact.phone, contact.linkedinUrl, contact.githubUrl, contact.portfolioUrl]
    .filter((part) => part.trim().length > 0)
    .join(' | ')
}
