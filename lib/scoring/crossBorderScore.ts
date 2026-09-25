export type CrossBorderSignals = {
  positive: string[]
  warnings: string[]
}

export type CrossBorderScoreResult = {
  score: number
  confidence: 'high' | 'medium' | 'low'
  isCrossBorder: boolean
  signals: CrossBorderSignals
}

const POSITIVE_RULES: { label: string; patterns: RegExp[] }[] = [
  {
    label: 'Remote-first',
    patterns: [/fully remote/i, /work from anywhere/i, /\bremote[-\s]first/i, /\bremote\b/i],
  },
  {
    label: 'Visa sponsorship',
    patterns: [/visa sponsor/i, /work permit/i, /relocation package/i, /immigration support/i, /sponsorship available/i],
  },
  {
    label: 'Async-friendly',
    patterns: [/\basync\b/i, /asynchronous/i, /flexible hours/i, /own schedule/i, /async[-\s]first/i],
  },
  {
    label: 'Global team',
    patterns: [/global team/i, /distributed team/i, /international team/i, /hire worldwide/i, /team across/i, /employees in \d+/i],
  },
  {
    label: 'Salary disclosed',
    patterns: [/\$[\d,]+/, /€[\d,]+/, /[\d,]+ USD/i, /[\d,]+ EUR/i],
  },
]

const WARNING_RULES: { label: string; patterns: RegExp[] }[] = [
  {
    label: 'Timezone constraint',
    patterns: [/EST only/i, /PST only/i, /CET only/i, /GMT only/i, /must be in .{0,20} timezone/i],
  },
  {
    label: 'US residents only',
    patterns: [/US only/i, /must be based in the US/i, /US citizens/i, /authorized to work in the US/i, /located in the United States/i],
  },
  {
    label: 'No relocation support',
    patterns: [/no relocation/i, /local candidates only/i, /must be local/i],
  },
]

export function scoreCrossBorder(title: string, description: string, location = ''): CrossBorderScoreResult {
  const text = `${title} ${description} ${location}`

  const positive: string[] = []
  const warnings: string[] = []

  for (const rule of POSITIVE_RULES) {
    if (rule.patterns.some(p => p.test(text))) positive.push(rule.label)
  }
  for (const rule of WARNING_RULES) {
    if (rule.patterns.some(p => p.test(text))) warnings.push(rule.label)
  }

  // Score: 20 pts per positive signal, -15 pts per warning, cap 0-100
  const raw = positive.length * 20 - warnings.length * 15
  const score = Math.max(0, Math.min(100, raw))

  const confidence: 'high' | 'medium' | 'low' =
    score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'

  return {
    score,
    confidence,
    isCrossBorder: score >= 30,
    signals: { positive, warnings },
  }
}
