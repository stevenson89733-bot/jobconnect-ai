import { describe, it, expect } from 'vitest'
import { getGeoBadge, getEmploymentBadge } from '@/lib/geoBadge'
import type { GeoAnalysis } from '@/lib/ai/geoAnalysis'

function geo(overrides: Partial<GeoAnalysis>): GeoAnalysis {
  return {
    classification: 'true_anywhere',
    has_tax_restriction: false,
    eor_contractor_friendly: true,
    employment_type: 'EOR',
    confidence_score: 0.9,
    notes: 'test',
    ...overrides,
  }
}

describe('getGeoBadge', () => {
  it('returns null when geo_analysis is null', () => {
    expect(getGeoBadge(null)).toBeNull()
  })

  it('returns null when confidence_score < 0.7', () => {
    expect(getGeoBadge(geo({ confidence_score: 0.5 }))).toBeNull()
  })

  it('returns null at exactly 0.7 confidence — threshold is inclusive', () => {
    expect(getGeoBadge(geo({ confidence_score: 0.7 }))).not.toBeNull()
  })

  it('returns diaspora_friendly for true_anywhere + EOR + no tax restriction', () => {
    expect(getGeoBadge(geo({ classification: 'true_anywhere', employment_type: 'EOR', has_tax_restriction: false }))).toBe('diaspora_friendly')
  })

  it('returns diaspora_friendly for true_anywhere + Contractor + no tax restriction', () => {
    expect(getGeoBadge(geo({ classification: 'true_anywhere', employment_type: 'Contractor', eor_contractor_friendly: true, has_tax_restriction: false }))).toBe('diaspora_friendly')
  })

  it('returns true_anywhere when no EOR/Contractor support', () => {
    expect(getGeoBadge(geo({ employment_type: 'Unknown', eor_contractor_friendly: false }))).toBe('true_anywhere')
  })

  it('returns true_anywhere when has_tax_restriction even with EOR', () => {
    expect(getGeoBadge(geo({ has_tax_restriction: true, employment_type: 'EOR' }))).toBe('true_anywhere')
  })

  it('returns regional_remote', () => {
    expect(getGeoBadge(geo({ classification: 'regional_remote', employment_type: 'Local Contract' }))).toBe('regional_remote')
  })

  it('returns local_remote_only', () => {
    expect(getGeoBadge(geo({ classification: 'local_remote_only', employment_type: 'Local Contract' }))).toBe('local_remote_only')
  })
})

describe('getEmploymentBadge', () => {
  it('returns null when no geo_analysis', () => {
    expect(getEmploymentBadge(null, null)).toBeNull()
  })

  it('returns null when diaspora_friendly (combined badge)', () => {
    expect(getEmploymentBadge(geo({ employment_type: 'EOR' }), 'diaspora_friendly')).toBeNull()
  })

  it('returns eor when true_anywhere + EOR (not diaspora because tax restriction)', () => {
    const g = geo({ has_tax_restriction: true, employment_type: 'EOR' })
    expect(getEmploymentBadge(g, 'true_anywhere')).toBe('eor')
  })

  it('returns contractor', () => {
    const g = geo({ classification: 'regional_remote', employment_type: 'Contractor' })
    expect(getEmploymentBadge(g, 'regional_remote')).toBe('contractor')
  })

  it('returns null for Local Contract', () => {
    const g = geo({ employment_type: 'Local Contract' })
    expect(getEmploymentBadge(g, 'true_anywhere')).toBeNull()
  })

  it('returns null for Unknown employment type', () => {
    const g = geo({ employment_type: 'Unknown' })
    expect(getEmploymentBadge(g, 'true_anywhere')).toBeNull()
  })
})
