// Section-header labels for the PDF/DOCX exports, resolved by the caller
// (app/api/resume/export/route.ts, via next-intl's getTranslations) from
// the resumeBuilder.section* i18n keys — never hardcoded here, so the
// exported document's headings match whatever language the live preview
// is already showing.
export type ResumeLabels = {
  summary: string
  experience: string
  skills: string
  education: string
  contact: string
}
