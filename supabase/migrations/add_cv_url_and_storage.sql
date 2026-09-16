-- 1. Add cv_url column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;

-- 2. Create the cv-pdfs storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-pdfs', 'cv-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: owners can upload/read/delete their own files
--    Path convention: {user_id}/cv-{timestamp}.pdf

-- Allow authenticated users to upload to their own folder
CREATE POLICY "cv_pdfs_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cv-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own files
CREATE POLICY "cv_pdfs_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cv-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "cv_pdfs_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'cv-pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
