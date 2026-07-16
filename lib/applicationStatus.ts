import type { BadgeProps } from '@/components/ui/badge'

// Shared between the server action (app/actions/applications.ts) and client
// components — a 'use server' file can only export async functions, so this
// plain constant/type can't live there (it would be a proxy reference on the
// client, not the real array, breaking anything that calls .map on it).
export const APPLICATION_STATUSES = ['submitted', 'viewed', 'interview', 'offer', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

// Single source for the label/color of each status — previously duplicated
// across the recruiter dashboard, the per-application status control, and
// the recent-applications widget.
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  viewed: 'Viewed',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export const APPLICATION_STATUS_VARIANT: Record<ApplicationStatus, NonNullable<BadgeProps['variant']>> = {
  submitted: 'primary',
  viewed: 'warning',
  interview: 'accent',
  offer: 'success',
  rejected: 'default',
}

// Solid bg-* classes for the recruiter dashboard's status bar chart, which
// isn't a Badge so can't reuse APPLICATION_STATUS_VARIANT directly.
export const APPLICATION_STATUS_BAR_COLOR: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-500',
  viewed: 'bg-yellow-500',
  interview: 'bg-accent',
  offer: 'bg-green-500',
  rejected: 'bg-slate-400 dark:bg-slate-600',
}
