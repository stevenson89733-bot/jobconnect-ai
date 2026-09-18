-- Fix: expand auto_apply_status_check to include all status values used by the cron
ALTER TABLE auto_apply_log DROP CONSTRAINT IF EXISTS auto_apply_status_check;
ALTER TABLE auto_apply_log ADD CONSTRAINT auto_apply_status_check
  CHECK (status IN (
    'pending_review',
    'sent',
    'failed',
    'skipped_no_ats_match',
    'skipped_timeout',
    'blocked_cross_border',
    'blocked_low_match',
    'no_jobs_available',
    'already_applied',
    'blocked_daily_limit'
  ));
