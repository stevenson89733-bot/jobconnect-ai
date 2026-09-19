ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS featured_listing_credits INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_featured_listing_credits(uid UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE profiles
  SET featured_listing_credits = featured_listing_credits + 1
  WHERE user_id = uid;
$$;
