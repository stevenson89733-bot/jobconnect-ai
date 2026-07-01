-- ============================================================
-- JobConnect AI — Supabase Schema
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- ============================================================

-- Profiles table
-- user_id mirrors auth.users.id (also the PK so one profile per user)
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  role        text not null check (role in ('candidate', 'employer')),
  full_name   text not null default '',
  email       text not null,
  company_name text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Allow insert during signup (anon key is used server-side)
create policy "Allow profile creation on signup"
  on public.profiles for insert
  with check (true);

-- ============================================================
-- Auto-create profile on auth.users insert (safety net)
-- The server action also inserts the profile; this trigger
-- handles edge cases like OAuth signups.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' ||
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
