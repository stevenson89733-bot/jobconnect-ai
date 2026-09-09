-- Create enum type for better type safety
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_plan_enum') THEN
        CREATE TYPE candidate_plan_enum AS ENUM ('free', 'pro', 'elite');
    END IF;
END
$$;

-- Add candidate_plan column to profiles table
-- Tracks which plan a candidate is on: 'free', 'pro', or 'elite'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='candidate_plan') THEN
        ALTER TABLE profiles
        ADD COLUMN candidate_plan candidate_plan_enum DEFAULT 'free'::candidate_plan_enum NOT NULL;
    ELSE
        -- If column exists in TEXT, convert it to enum
        IF EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='candidate_plan'
                   AND data_type='text') THEN
            ALTER TABLE profiles
            ALTER COLUMN candidate_plan TYPE candidate_plan_enum USING candidate_plan::candidate_plan_enum,
            ALTER COLUMN candidate_plan SET DEFAULT 'free'::candidate_plan_enum;
        END IF;
    END IF;
END
$$;

-- Add index for faster lookups by plan type
CREATE INDEX IF NOT EXISTS idx_profiles_candidate_plan ON profiles(candidate_plan);

-- Add index for premium users (either pro or elite)
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium_plan ON profiles(is_premium, candidate_plan);
