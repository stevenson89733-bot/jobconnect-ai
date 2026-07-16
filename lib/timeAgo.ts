// Shared by every "how long ago" label in the app (job cards, recruiter
// dashboard, application status). Two styles, matching what each call site
// already rendered before this was deduplicated — never silently changing
// either format so this stays a pure refactor:
//   'compact' — "Today" / "1d ago" / "3d ago" / "2w ago"
//   'verbose' — "today" / "1 day ago" / "3 days ago" / "2w ago"
export function timeAgo(dateStr: string, style: 'compact' | 'verbose' = 'compact'): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)

  if (style === 'verbose') {
    if (days === 0) return 'today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    return `${Math.floor(days / 7)}w ago`
  }

  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}
