// Maps the raw DB values stored in jobs.job_type / jobs.category (English,
// used for filtering/matching logic) to their `jobs` namespace translation
// keys. Job tags/skills (Python, React, etc.) are deliberately NOT mapped
// here — those are free-form and conventionally kept in English regardless
// of UI language, same reasoning as not translating AI-generated content.
export const JOB_TYPE_KEY: Record<string, string> = {
  'Full-time': 'typeFullTime',
  'Part-time': 'typePartTime',
  Contract: 'typeContract',
  Internship: 'typeInternship',
}

export const CATEGORY_KEY: Record<string, string> = {
  Engineering: 'categoryEngineering',
  Design: 'categoryDesign',
  Data: 'categoryData',
  Research: 'categoryResearch',
  'Developer Relations': 'categoryDevRel',
  Content: 'categoryContent',
}
