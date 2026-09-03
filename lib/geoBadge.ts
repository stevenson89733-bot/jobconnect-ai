import type { GeoAnalysis, EmploymentType } from '@/lib/ai/geoAnalysis'

export type GeoBadgeKind =
  | 'diaspora_friendly'
  | 'true_anywhere'
  | 'regional_remote'
  | 'local_remote_only'

export type EmploymentBadgeKind = 'eor' | 'contractor' | null

const MIN_CONFIDENCE = 0.7

/**
 * Returns which classification badge to show (null = don't show).
 * Priority: diaspora_friendly supersedes true_anywhere.
 */
export function getGeoBadge(geo: GeoAnalysis | null | undefined): GeoBadgeKind | null {
  if (!geo || geo.confidence_score < MIN_CONFIDENCE) return null
  const { classification, has_tax_restriction, employment_type, eor_contractor_friendly } = geo
  if (
    classification === 'true_anywhere' &&
    !has_tax_restriction &&
    (employment_type === 'EOR' || employment_type === 'Contractor' || eor_contractor_friendly)
  ) {
    return 'diaspora_friendly'
  }
  return classification
}

/**
 * Returns which employment-type badge to show alongside the classification badge
 * (null when classification is diaspora_friendly — already covered, or when Unknown/Local Contract).
 */
export function getEmploymentBadge(
  geo: GeoAnalysis | null | undefined,
  classificationBadge: GeoBadgeKind | null,
): EmploymentBadgeKind {
  if (!geo || geo.confidence_score < MIN_CONFIDENCE) return null
  if (classificationBadge === 'diaspora_friendly') return null  // badge combiné
  const et: EmploymentType = geo.employment_type ?? 'Unknown'
  if (et === 'EOR') return 'eor'
  if (et === 'Contractor') return 'contractor'
  return null
}

export const GEO_BADGE_CONFIG: Record<GeoBadgeKind, { label: string; tooltip: string; className: string }> = {
  diaspora_friendly: {
    label: '⭐ Diaspora Friendly',
    tooltip: 'Fully open to international candidates with EOR or contractor support. No relocation needed.',
    className:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/50',
  },
  true_anywhere: {
    label: 'True Anywhere',
    tooltip: 'This role is open to candidates worldwide with no location or tax restrictions.',
    className:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800/50',
  },
  regional_remote: {
    label: 'Regional Remote',
    tooltip: 'This role is remote but restricted to a specific region or timezone.',
    className:
      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800/50',
  },
  local_remote_only: {
    label: 'Local Required',
    tooltip: 'Candidates must reside in a specific country for legal or tax reasons.',
    className:
      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800/50',
  },
}

export const EMPLOYMENT_BADGE_CONFIG: Record<'eor' | 'contractor', { label: string; tooltip: string }> = {
  eor: {
    label: 'EOR Supported',
    tooltip: 'This employer supports international hiring via Employer of Record (Deel, Remote.com, etc.)',
  },
  contractor: {
    label: 'Contractor',
    tooltip: 'This employer accepts B2B / freelance contractor arrangements.',
  },
}
