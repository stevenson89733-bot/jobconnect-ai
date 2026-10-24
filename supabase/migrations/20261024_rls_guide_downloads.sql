-- guide_downloads: enable RLS
-- Table is only accessed via service-role (adminClient) in Next.js.
-- No user-facing SELECT policy needed — RLS enabled as defence in depth.
ALTER TABLE public.guide_downloads ENABLE ROW LEVEL SECURITY;
