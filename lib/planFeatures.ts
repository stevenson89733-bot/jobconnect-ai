// ─── Single source of truth for plan features ────────────────────────────────
// Edit here to add/remove features — pricing page consumes this automatically.
// Each feature has an icon, label (EN), and which plans include it.

export type PlanKey = 'free' | 'pro' | 'elite'
export type EmployerPlanKey = 'employer_free' | 'employer_growth' | 'employer_pro' | 'employer_enterprise'

export interface PlanFeature {
  icon: string
  label: string
  plans: PlanKey[]
}

export interface EmployerFeature {
  icon: string
  label: string
  plans: EmployerPlanKey[]
  highlight?: boolean   // show as ✦ instead of ✓
}

// ── CANDIDATE FEATURES ────────────────────────────────────────────────────────
export const CANDIDATE_FEATURES: PlanFeature[] = [
  // Free + Pro + Elite
  { icon: '🌍', label: 'Browse all remote jobs worldwide',           plans: ['free', 'pro', 'elite'] },
  { icon: '📨', label: 'Apply to unlimited jobs',                    plans: ['free', 'pro', 'elite'] },
  { icon: '📎', label: 'Manual apply — upload CV + cover letter',    plans: ['free', 'pro', 'elite'] },
  { icon: '🎯', label: 'AI Match Score 0-100 per job',               plans: ['free', 'pro', 'elite'] },
  { icon: '✈️', label: 'Cross-border detector — yes/no/unclear',     plans: ['free', 'pro', 'elite'] },
  { icon: '🔔', label: 'Basic job alerts',                           plans: ['free', 'pro', 'elite'] },
  { icon: '📊', label: 'Full candidate dashboard',                   plans: ['free', 'pro', 'elite'] },
  { icon: '📋', label: 'Application Tracker — auto-tracked',         plans: ['free', 'pro', 'elite'] },
  { icon: '🤖', label: 'Career Copilot — basic AI assistant',        plans: ['free', 'pro', 'elite'] },
  { icon: '🎤', label: 'Interview Prep — 5 Q + feedback',            plans: ['free', 'pro', 'elite'] },
  { icon: '🌐', label: 'Multilingual profile (11 languages)',         plans: ['free', 'pro', 'elite'] },
  { icon: '🛡️', label: 'Safe Application Patterns — fraud detection', plans: ['free', 'pro', 'elite'] },

  // Pro + Elite only
  { icon: '📝', label: 'AI Resume Builder GPT-4o — tailored per role',    plans: ['pro', 'elite'] },
  { icon: '📈', label: 'ATS Score 0-100 — keywords · format · skills',    plans: ['pro', 'elite'] },
  { icon: '✉️', label: 'AI Cover Letter Generator — personalized',        plans: ['pro', 'elite'] },
  { icon: '🗺️', label: 'Resume adapted by country — format per market',   plans: ['pro', 'elite'] },
  { icon: '📄', label: 'PDF download — resume + cover letter ready',       plans: ['pro', 'elite'] },
  { icon: '💡', label: '3 AI improvement tips — concrete suggestions',     plans: ['pro', 'elite'] },
  { icon: '💼', label: 'LinkedIn Optimizer — profile analysis + generation', plans: ['pro', 'elite'] },
  { icon: '🔍', label: 'Mobility Skill-Gap A→B — skills gap between markets', plans: ['pro', 'elite'] },
  { icon: '🎙️', label: 'Voice Interview Prep — simulation + feedback',    plans: ['pro', 'elite'] },
  { icon: '⚡', label: 'Auto-Apply — 10 jobs/day',                        plans: ['pro', 'elite'] },
  { icon: '🎧', label: 'Priority support',                                 plans: ['pro', 'elite'] },

  // Elite only
  { icon: '🚀', label: 'Auto-Apply — 25 jobs/day',                        plans: ['elite'] },
  { icon: '⭐', label: 'Priority matching',                                plans: ['elite'] },
  { icon: '🏆', label: 'Dedicated 24/7 support',                          plans: ['elite'] },
  { icon: '💎', label: 'Elite badge on candidate profile',                 plans: ['elite'] },
  { icon: '🔒', label: 'Safe Application Patterns — priority fraud protection', plans: ['elite'] },
]

// ── EMPLOYER FEATURES ─────────────────────────────────────────────────────────
export const EMPLOYER_FEATURES: EmployerFeature[] = [
  // Free
  { icon: '📌', label: '1 active job posting',                        plans: ['employer_free', 'employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '👥', label: 'Full candidate applications',                  plans: ['employer_free', 'employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '📊', label: 'Real application status workflow',             plans: ['employer_free', 'employer_growth', 'employer_pro', 'employer_enterprise'] },

  // Growth+
  { icon: '📦', label: '5 active job postings',                       plans: ['employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '📥', label: 'Bulk import candidates',                      plans: ['employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '⭐', label: 'Featured listing eligibility',                 plans: ['employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '🏢', label: 'Career page builder',                         plans: ['employer_growth', 'employer_pro', 'employer_enterprise'] },
  { icon: '🤝', label: 'Team collaboration (up to 5 users)',          plans: ['employer_growth', 'employer_pro', 'employer_enterprise'] },

  // Pro+
  { icon: '📋', label: '20 active job postings',                      plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '🤖', label: 'AI candidate screening',                      plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '🎯', label: 'Advanced candidate matching',                  plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '🏆', label: 'Candidate ranking — AI shortlist',            plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '📧', label: 'Automated outreach',                          plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '📈', label: 'Advanced analytics dashboard',                plans: ['employer_pro', 'employer_enterprise'], highlight: true },
  { icon: '📅', label: 'Interview scheduling link',                   plans: ['employer_pro', 'employer_enterprise'], highlight: true },

  // Enterprise only
  { icon: '♾️', label: 'Unlimited job postings',                      plans: ['employer_enterprise'] },
  { icon: '🔌', label: 'API access',                                  plans: ['employer_enterprise'] },
  { icon: '🔗', label: 'ATS integration',                             plans: ['employer_enterprise'] },
  { icon: '🎧', label: 'Dedicated support',                           plans: ['employer_enterprise'] },
  { icon: '📦', label: 'Bulk hiring tools',                           plans: ['employer_enterprise'] },
  { icon: '🧠', label: 'Advanced AI recruitment',                     plans: ['employer_enterprise'] },
  { icon: '📜', label: 'Custom contract + SLA',                       plans: ['employer_enterprise'] },
]

// ── Helper: get features for a specific plan ──────────────────────────────────
export function getCandidateFeatures(plan: PlanKey): PlanFeature[] {
  return CANDIDATE_FEATURES.filter(f => f.plans.includes(plan))
}

export function getEmployerFeatures(plan: EmployerPlanKey): EmployerFeature[] {
  return EMPLOYER_FEATURES.filter(f => f.plans.includes(plan))
}

// ── Plan metadata ─────────────────────────────────────────────────────────────
export const CANDIDATE_PLANS = [
  { key: 'free'  as PlanKey, name: 'Free',  price: '$0',     color: 'green'  },
  { key: 'pro'   as PlanKey, name: 'Pro',   price: '$19.99', color: 'blue'   },
  { key: 'elite' as PlanKey, name: 'Elite', price: '$39.99', color: 'purple' },
]

export const EMPLOYER_PLANS = [
  { key: 'employer_free'       as EmployerPlanKey, name: 'Free',       price: '$0',    color: 'green'  },
  { key: 'employer_growth'     as EmployerPlanKey, name: 'Growth',     price: '$49',   color: 'blue'   },
  { key: 'employer_pro'        as EmployerPlanKey, name: 'Pro',        price: '$99',   color: 'orange' },
  { key: 'employer_enterprise' as EmployerPlanKey, name: 'Enterprise', price: 'Custom', color: 'purple' },
]
