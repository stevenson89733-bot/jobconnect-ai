// Real arithmetic on the candidate's own real application statuses — no
// fabrication risk (just counting), but the denominator choice matters:
// all three rates use the SAME denominator (total applications), stated
// explicitly in the UI so "Interview Rate" can't be misread as "of
// applications that got a response" or some other narrower base.

export type ApplicationRates = {
  total: number
  responded: number
  responseRate: number | null
  interviewRate: number | null
  offerRate: number | null
  anyResponseYet: boolean
}

export function computeApplicationRates(statuses: string[]): ApplicationRates {
  const total = statuses.length
  if (total === 0) {
    return { total: 0, responded: 0, responseRate: null, interviewRate: null, offerRate: null, anyResponseYet: false }
  }

  const responded = statuses.filter((s) => s !== 'submitted').length
  const interviewedOrOffer = statuses.filter((s) => s === 'interview' || s === 'offer').length
  const offers = statuses.filter((s) => s === 'offer').length

  return {
    total,
    responded,
    responseRate: Math.round((responded / total) * 100),
    interviewRate: Math.round((interviewedOrOffer / total) * 100),
    offerRate: Math.round((offers / total) * 100),
    anyResponseYet: responded > 0,
  }
}

export type ResponseTimeRow = { created_at: string; status: string; status_updated_at: string | null }

export type AvgResponseTime = { avgDays: number | null; sampleSize: number }

// Real days between application and status change, averaged across every
// application that has actually moved past 'submitted' — no fabricated
// baseline when the sample is empty (mirrors ApplicationRates.responseRate
// being null at total === 0).
//
// Known limitation, disclosed rather than hidden: status_updated_at is set
// by a trigger on ANY status change (supabase/application_status_workflow.sql)
// and the schema keeps only the most recent one, not a full history. For an
// application that moved status more than once (e.g. viewed → interview),
// this measures time-to-LATEST-change, not time-to-first-response — there
// is no way to recover the first transition's timestamp from what's stored.
// Real data either way, just not guaranteed to isolate "first" specifically.
export function computeAvgResponseTime(rows: ResponseTimeRow[]): AvgResponseTime {
  const responded = rows.filter((r) => r.status !== 'submitted' && r.status_updated_at)
  if (responded.length === 0) return { avgDays: null, sampleSize: 0 }

  const totalDays = responded.reduce((sum, r) => {
    const days = (new Date(r.status_updated_at as string).getTime() - new Date(r.created_at).getTime()) / 86400000
    return sum + Math.max(0, days)
  }, 0)

  return { avgDays: Math.round((totalDays / responded.length) * 10) / 10, sampleSize: responded.length }
}
