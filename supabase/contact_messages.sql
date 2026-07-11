-- ============================================================
-- Contact form submissions
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- ============================================================

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit a contact message.
-- No select/update/delete policy is defined, so only the service role
-- (or the Supabase dashboard) can read submissions — visitors cannot
-- read back other people's messages.
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);
