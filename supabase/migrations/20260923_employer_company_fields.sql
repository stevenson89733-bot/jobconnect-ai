-- Add company logo and size to employer profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_logo_url text,
  ADD COLUMN IF NOT EXISTS company_size text;
