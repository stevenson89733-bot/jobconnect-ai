// Real arithmetic on the candidate's own real application statuses — no
// fabrication risk (just counting), but the denominator choice matters:
// all three rates use the SAME denominator (total applications), stated
// explicitly in the UI so "Interview Rate" can't be misread as "of
// applications that got a response" or some other narrower base.

export type ApplicationRates = {
  total: number
  responseRate: number | null
  interviewRate: number | null
  offerRate: number | null
  anyResponseYet: boolean
}

export function computeApplicationRates(statuses: string[]): ApplicationRates {
  const total = statuses.length
  if (total === 0) {
    return { total: 0, responseRate: null, interviewRate: null, offerRate: null, anyResponseYet: false }
  }

  const responded = statuses.filter((s) => s !== 'submitted').length
  const interviewedOrOffer = statuses.filter((s) => s === 'interview' || s === 'offer').length
  const offers = statuses.filter((s) => s === 'offer').length

  return {
    total,
    responseRate: Math.round((responded / total) * 100),
    interviewRate: Math.round((interviewedOrOffer / total) * 100),
    offerRate: Math.round((offers / total) * 100),
    anyResponseYet: responded > 0,
  }
}
