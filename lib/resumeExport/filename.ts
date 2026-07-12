// Shared by both the resume and cover letter export routes — same
// sanitization logic so filenames are consistent across both features.
export function sanitizeFilenamePart(value: string, fallback = 'File'): string {
  return value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || fallback
}
