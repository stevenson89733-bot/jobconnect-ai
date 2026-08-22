-- PROMO CODES SYSTEM
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add premium_expires_at to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS premium_expires_at timestamptz;

-- 2. Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text        UNIQUE NOT NULL,
  max_uses    integer     NOT NULL DEFAULT 10,
  used_count  integer     NOT NULL DEFAULT 0,
  expires_at  timestamptz,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS: table is private — only the service role (used by API routes)
--    and admins (via session) can access it
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read promo_codes" ON public.promo_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND   profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert promo_codes" ON public.promo_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND   profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update promo_codes" ON public.promo_codes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND   profiles.is_admin = true
    )
  );

-- 4. Scheduled cleanup: expire promo premium daily at 02:00 UTC
--    Requires pg_cron (enabled on Supabase via Dashboard → Extensions → pg_cron)
--    Uncomment after enabling pg_cron:
-- SELECT cron.schedule(
--   'expire-promo-premium',
--   '0 2 * * *',
--   $$UPDATE public.profiles
--     SET is_premium = false
--     WHERE premium_expires_at IS NOT NULL
--       AND premium_expires_at < now()
--       AND is_premium = true;$$
-- );

-- 5. Seed the first promo code
INSERT INTO public.promo_codes (code, max_uses, expires_at)
VALUES ('EARLY3MONTHS', 10, '2026-12-31 23:59:59+00')
ON CONFLICT (code) DO NOTHING;
