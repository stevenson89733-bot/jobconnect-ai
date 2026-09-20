/**
 * Keyword-based cross-border scoring layer.
 *
 * Runs fast, zero cost, and complements the AI classifier (lib/ai/crossBorder.ts).
 * Call this at job-creation time to pre-score before or instead of the LLM call,
 * or use it as a fallback when OpenAI is unavailable.
 *
 * Scoring thresholds:
 *   score >= 70 → confidence 'high'   (is_cross_border = true)
 *   score >= 40 → confidence 'medium' (is_cross_border = true)
 *   score <  40 → confidence 'low'    (is_cross_border = false)
 */

export type CrossBorderConfidence = 'low' | 'medium' | 'high'

export type KeywordScoreResult = {
  score: number
  confidence: CrossBorderConfidence
  isCrossBorder: boolean
  matchedSignals: string[]
}

type SignalGroup = {
  name: string
  weight: number
  keywords: string[]
}

const SIGNAL_GROUPS: SignalGroup[] = [
  {
    name: 'EOR / Employer of Record',
    weight: 25,
    keywords: [
      'employer of record',
      ' eor ',
      '(eor)',
      ' peo ',
      '(peo)',
      'via deel',
      'via remote.com',
      'via rippling',
      'via papaya global',
    ],
  },
  {
    name: 'Visa / Work Permit Support',
    weight: 20,
    keywords: [
      'visa sponsorship',
      'visa sponsor',
      'work permit',
      'right to work',
      'sponsorship available',
      'we sponsor visas',
      'immigration support',
      'relocation package',
    ],
  },
  {
    name: 'Timezone Flexibility',
    weight: 15,
    keywords: [
      'any timezone',
      'timezone flexible',
      'async-first',
      'async first',
      'no timezone requirement',
      'overlap not required',
      'work your own hours',
      'fully async',
    ],
  },
  {
    name: 'International Hiring History',
    weight: 15,
    keywords: [
      'internationally distributed team',
      'team across',
      'employees in',
      'global team',
      'hire worldwide',
      'open to international candidates',
      '30+ countries',
      '20+ countries',
      '10+ countries',
    ],
  },
]

function scoreText(text: string): KeywordScoreResult {
  const lower = text.toLowerCase()
  let score = 0
  const matchedSignals: string[] = []

  for (const group of SIGNAL_GROUPS) {
    const hit = group.keywords.find(kw => lower.includes(kw.toLowerCase()))
    if (hit) {
      score += group.weight
      matchedSignals.push(group.name)
    }
  }

  const confidence: CrossBorderConfidence =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  return {
    score,
    confidence,
    isCrossBorder: score >= 40,
    matchedSignals,
  }
}

/**
 * Score a job's description (and optionally title) for cross-border signals.
 */
export function detectCrossBorder(description: string, title = ''): KeywordScoreResult {
  return scoreText(`${title} ${description}`)
}
