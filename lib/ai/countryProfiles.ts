export type CountryProfile = {
  documentName: string
  pageLimit: string
  forbiddenFields: string[]
  includePhotoPlaceholder: boolean
  sectionOrder: string[]
  toneGuidance: string
  extraRules: string[]
}

export const COUNTRY_PROFILES: Record<string, CountryProfile> = {
  US: {
    documentName: 'Resume',
    pageLimit: 'strictly 1 page',
    forbiddenFields: ['photo', 'age', 'date of birth', 'marital status', 'nationality'],
    includePhotoPlaceholder: false,
    sectionOrder: ['Summary', 'Experience', 'Skills', 'Education'],
    toneGuidance: 'Strong action verbs (Led, Built, Increased, Drove). Quantified results (%, $, time saved) for every achievement where the source text provides numbers.',
    extraRules: [
      'Address: city and state only — never a full street address.',
    ],
  },
  UK: {
    documentName: 'CV',
    pageLimit: 'up to 2 pages',
    forbiddenFields: ['photo', 'age', 'marital status'],
    includePhotoPlaceholder: false,
    sectionOrder: ['Personal Profile', 'Experience', 'Education', 'Skills', 'Interests'],
    toneGuidance: 'Factual and measured — less "sales-pitch" than the US style. Avoid superlatives like "passionate about" or "crushed targets".',
    extraRules: [
      'Use "CV" not "Resume" in any labels or headings.',
      'A brief "Interests" section is acceptable and common.',
    ],
  },
  CA: {
    documentName: 'Resume',
    pageLimit: '1 to 2 pages',
    forbiddenFields: ['photo', 'age', 'marital status', 'Social Insurance Number'],
    includePhotoPlaceholder: false,
    sectionOrder: ['Summary', 'Experience', 'Skills', 'Education'],
    toneGuidance: 'Similar to US style: strong action verbs and quantified achievements where available.',
    extraRules: [],
  },
  DE: {
    documentName: 'Lebenslauf',
    pageLimit: '1 to 2 pages, structured/tabular format',
    forbiddenFields: [],
    includePhotoPlaceholder: true,
    sectionOrder: ['Persönliche Daten', 'Berufserfahrung', 'Ausbildung', 'Kenntnisse'],
    toneGuidance: 'Factual and precise. Use exact month/year dates (e.g. "03/2021 – 08/2023"). No US-style storytelling or "passionate about" phrasing.',
    extraRules: [
      'Name the document "Lebenslauf".',
      'Include date of birth and place of birth under Persönliche Daten.',
      'Experience section uses reverse-chronological tabular format with exact dates.',
    ],
  },
  FR: {
    documentName: 'CV',
    pageLimit: 'strictly 1 page',
    forbiddenFields: [],
    includePhotoPlaceholder: false, // overridden to true by client when checkbox is checked
    sectionOrder: ["État civil / Contact", "Titre du poste visé", "Expérience", "Formation", "Compétences", "Centres d'intérêt"],
    toneGuidance: "Formal and sober French tone. Avoid US-style overstatements. Formation (education) is more prominent than in the US model.",
    extraRules: [
      'Strictly 1 page — trim ruthlessly if content is long.',
      'Include a clear "Titre du poste visé" banner line after the contact header.',
      "Centres d'intérêt (interests) section is optional but common.",
    ],
  },
}

export const COUNTRY_OPTIONS = [
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'UK', label: '🇬🇧 United Kingdom' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
] as const

export type CountryCode = typeof COUNTRY_OPTIONS[number]['code']

// Builds the country-specific instructions block injected into the resume prompt.
// Returns null when countryCode is absent or unrecognised — no-op for existing behaviour.
type CoverLetterCountryRules = {
  salutation: string
  tone: string
  structure: string
  extraRules: string[]
}

const COVER_LETTER_COUNTRY_RULES: Record<string, CoverLetterCountryRules> = {
  US: {
    salutation: '"Dear Hiring Manager," or the named recipient if known.',
    tone: 'Confident and direct. Lead with value, not pleasantries. Action-oriented language.',
    structure: '3 paragraphs: (1) hook + role, (2) real achievements relevant to the role, (3) call to action.',
    extraRules: [],
  },
  UK: {
    salutation: '"Dear Hiring Manager," or "Dear [Name]," if known. Close with "Yours sincerely" (named) or "Yours faithfully" (unnamed).',
    tone: 'Measured and factual British register. Avoid US-style superlatives ("passionate about", "crushed targets"). Understated confidence.',
    structure: '3–4 paragraphs: opening, relevant experience, fit for the role, closing.',
    extraRules: [
      'Use "CV" and "application" rather than "resume" or "candidacy".',
    ],
  },
  CA: {
    salutation: '"Dear Hiring Manager," or the named recipient if known.',
    tone: 'Similar to US but slightly more measured. Confident without being boastful.',
    structure: '3 paragraphs: (1) hook + role, (2) real achievements, (3) call to action.',
    extraRules: [],
  },
  DE: {
    salutation: '"Sehr geehrte Damen und Herren," if recipient unknown; "Sehr geehrte Frau [Name]," / "Sehr geehrter Herr [Name]," if known. Close with "Mit freundlichen Grüßen".',
    tone: 'Very formal German register (Sie-form throughout). Factual and precise. No US-style storytelling or enthusiasm markers.',
    structure: 'Structured 3-part letter: Einleitung (why you are writing + the role), Hauptteil (relevant experience and skills, 2 paragraphs), Schluss (motivation + call to action). Use exact month/year dates when citing experience.',
    extraRules: [
      'The subject line ("Betreff:") must appear before the salutation, e.g. "Bewerbung als [Rolle] — [Your Name]".',
      'No contractions. Every sentence must be complete and formally structured.',
    ],
  },
  FR: {
    salutation: '"Madame, Monsieur," if recipient unknown; "Madame [Nom]," / "Monsieur [Nom]," if known. Close with the standard French formula: "Dans l\'attente de votre réponse, je vous adresse mes cordiales salutations."',
    tone: 'Formal French register (vous-form). Avoid anglicisms and US-style boastfulness. Sober and structured.',
    structure: 'Classic French lettre de motivation: accroche (why this company/role), développement (your relevant background, 2 paragraphs), conclusion (disponibilité + formule de politesse).',
    extraRules: [
      'The candidate\'s address and the company\'s address appear at the top of the letter (mention this in the structure description, not the text itself).',
      'Avoid superlatives and generic enthusiasm phrases ("je suis passionné par", "je suis motivé").',
    ],
  },
}

export function buildCoverLetterCountryBlock(countryCode: string | undefined): string | null {
  if (!countryCode) return null
  const rules = COVER_LETTER_COUNTRY_RULES[countryCode]
  if (!rules) return null

  const lines: string[] = [
    `COUNTRY-SPECIFIC RULES FOR COVER LETTER (Target Country: ${countryCode}):`,
    `- Salutation / closing formula: ${rules.salutation}`,
    `- Tone: ${rules.tone}`,
    `- Structure: ${rules.structure}`,
  ]
  for (const rule of rules.extraRules) {
    lines.push(`- ${rule}`)
  }
  return lines.join('\n')
}

export function buildCountryBlock(countryCode: string | undefined, includePhoto?: boolean): string | null {
  if (!countryCode) return null
  const profile = COUNTRY_PROFILES[countryCode]
  if (!profile) return null

  const photoFlag = countryCode === 'FR'
    ? (includePhoto ?? false)
    : profile.includePhotoPlaceholder

  const lines: string[] = [
    `COUNTRY-SPECIFIC RULES (Target Country: ${countryCode}):`,
    `- Document name: "${profile.documentName}" (use this name in any headings or labels, not "Resume" unless that is the country norm)`,
    `- Length: ${profile.pageLimit}`,
    `- Section order: ${profile.sectionOrder.join(' → ')}`,
    `- Tone: ${profile.toneGuidance}`,
  ]

  if (profile.forbiddenFields.length > 0) {
    lines.push(`- OMIT entirely (do not request or include): ${profile.forbiddenFields.join(', ')}`)
  }

  if (photoFlag) {
    lines.push('- PHOTO (MANDATORY): start the "summary" field value with the EXACT literal text "[PHOTO — top right]" followed by two newlines, then the professional summary. Do not omit or paraphrase this text.')
  } else if (profile.forbiddenFields.includes('photo')) {
    lines.push('- NO photo of any kind.')
  }

  for (const rule of profile.extraRules) {
    lines.push(`- ${rule}`)
  }

  return lines.join('\n')
}
