// Shared between the server action (app/actions/applications.ts) and client
// components — a 'use server' file can only export async functions, so this
// plain constant/type can't live there (it would be a proxy reference on the
// client, not the real array, breaking anything that calls .map on it).
export const APPLICATION_STATUSES = ['submitted', 'viewed', 'interview', 'offer', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
