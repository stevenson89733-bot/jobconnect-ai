// Real, enforced active-job-posting limits per employer plan — one
// definition shared by the /api/jobs POST limit check and the /pricing
// page, so the number displayed to employers can never drift from the
// number actually enforced.
export type EmployerPlan = 'free' | 'growth'

export const EMPLOYER_PLAN_LIMITS: Record<EmployerPlan, number> = {
  free: 1,
  growth: 5,
}

export function employerPlanLimit(plan: string | null | undefined): number {
  return EMPLOYER_PLAN_LIMITS[(plan as EmployerPlan) ?? 'free'] ?? EMPLOYER_PLAN_LIMITS.free
}
