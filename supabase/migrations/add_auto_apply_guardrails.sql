-- Auto-apply safety guardrails schema

-- 1. Review mode preference on profiles (default true = require review before send)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_apply_review_mode BOOLEAN NOT NULL DEFAULT true;

-- 2. Candidate plan column (already exists via Paddle webhook but ensure it's present)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS candidate_plan TEXT NOT NULL DEFAULT 'free';
