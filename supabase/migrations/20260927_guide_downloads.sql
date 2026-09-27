CREATE TABLE IF NOT EXISTS public.guide_downloads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guide_downloads_user_id_idx ON public.guide_downloads(user_id);
CREATE INDEX IF NOT EXISTS guide_downloads_slug_idx ON public.guide_downloads(guide_slug);
