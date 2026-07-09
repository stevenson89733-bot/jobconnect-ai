-- ============================================================
-- JobConnect AI — Avatar storage bucket + policies
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Bucket is PUBLIC (readable via plain URL) — profile photos aren't
-- sensitive, and this avoids needing signed URLs everywhere the avatar is
-- displayed (dashboard, employer candidates list, candidate detail page).
-- Uploads/updates/deletes are still restricted to the owning user.
--
-- Path convention: avatars/{user_id}/{random-filename}.{ext} — the first
-- path segment must equal the uploader's own auth.uid().
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatar images (public bucket — same as any public profile photo).
create policy "Public read access for avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- A user may only upload into their own folder: avatars/{their own user_id}/...
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Included for forward compatibility (e.g. a future "remove/replace photo"
-- action) even though the current upload flow always creates a new file
-- rather than overwriting one.
create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
