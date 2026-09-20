-- Add review_before_send and daily_apply_limit to auto_apply_settings
ALTER TABLE auto_apply_settings
  ADD COLUMN IF NOT EXISTS review_before_send boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS daily_apply_limit  integer NOT NULL DEFAULT 5
    CHECK (daily_apply_limit IN (3, 5, 10, 20));

-- Add match_score to auto_apply_log for preview modal
ALTER TABLE auto_apply_log
  ADD COLUMN IF NOT EXISTS match_score integer,
  ADD COLUMN IF NOT EXISTS cv_section  text;
