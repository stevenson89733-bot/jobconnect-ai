import { Badge, type BadgeProps } from '@/components/ui/badge'

// Reused for Missing Skills, Missing Keywords, Recommended Certifications,
// and matched job tags — one consistent pill component, variant only changes
// the accent (e.g. "primary" to highlight a genuine skill match on a job).
export default function SkillTag({ label, variant = 'default' }: { label: string; variant?: BadgeProps['variant'] }) {
  return <Badge variant={variant}>{label}</Badge>
}
