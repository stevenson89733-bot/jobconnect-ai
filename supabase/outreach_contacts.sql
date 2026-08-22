-- OUTREACH CONTACTS — Early Adopter Tracking
-- Run in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.outreach_contacts (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  channel           text        NOT NULL DEFAULT 'LinkedIn',
  status            text        NOT NULL DEFAULT 'contacted',
  notes             text,
  promo_code_given  boolean     NOT NULL DEFAULT false,
  follow_up_date    date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER outreach_contacts_updated_at
  BEFORE UPDATE ON public.outreach_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: only accessible via service role (API routes) or admin session
ALTER TABLE public.outreach_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read outreach_contacts" ON public.outreach_contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can insert outreach_contacts" ON public.outreach_contacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can update outreach_contacts" ON public.outreach_contacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Admins can delete outreach_contacts" ON public.outreach_contacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );
