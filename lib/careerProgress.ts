// Real ATS Score / Profile Strength history from career_analysis rows —
// one point per real "Refresh Analysis" click, never interpolated or
// backfilled. History only starts accumulating from whenever this shipped;
// there is no way to reconstruct genuine past scores that were never
// recorded (the table used to overwrite a single row).

export type CareerProgressPoint = { generatedAt: string; atsScore: number; profileStrength: number }

type HistoryRow = { analysis_json: unknown; generated_at: string }

export function buildCareerProgressPoints(rows: HistoryRow[]): CareerProgressPoint[] {
  return rows
    .map((row) => {
      const json = row.analysis_json as { atsScore?: { score?: unknown }; profileStrength?: { score?: unknown } } | null
      const atsScore = json?.atsScore?.score
      const profileStrength = json?.profileStrength?.score
      if (typeof atsScore !== 'number' || typeof profileStrength !== 'number') return null
      return { generatedAt: row.generated_at, atsScore, profileStrength }
    })
    .filter((p): p is CareerProgressPoint => p !== null)
}
