-- ============================================================
-- AI Cover Letter Generator — saved drafts / history
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- Unlike career_analysis (one cached row per candidate, overwritten), this
-- is multiple rows per candidate — "History" means browsing several past
-- letters, not just the latest one. RLS is scoped to a plain
-- `auth.uid() = candidate_id` comparison only — no subquery into this or
-- any other RLS-protected table, same pattern as career_analysis, to avoid
-- the infinite-recursion bug from earlier in this project (see
-- supabase/fix_employer_read_recursion.sql for that incident).
-- ============================================================

create table if not exists public.cover_letters (
  id               uuid primary key default gen_random_uuid(),
  candidate_id     uuid not null references auth.users (id) on delete cascade,
  company_name     text not null,
  target_role      text not null,
  job_description  text,
  style            text not null default 'Formal'
                     check (style in ('Formal', 'Conversational', 'Concise')),
  letter_content   jsonb not null,   -- the exact generated/edited letter object (subject, greeting, opening, body, closing, signature) — never reconstructed
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger cover_letters_updated_at
  before update on public.cover_letters
  for each row execute procedure public.set_updated_at();

create index if not exists cover_letters_candidate_id_idx on public.cover_letters (candidate_id);
create index if not exists cover_letters_created_at_idx on public.cover_letters (created_at desc);

alter table public.cover_letters enable row level security;

create policy "Candidates can view own cover letters"
  on public.cover_letters for select
  using (auth.uid() = candidate_id);

create policy "Candidates can insert own cover letters"
  on public.cover_letters for insert
  with check (auth.uid() = candidate_id);

create policy "Candidates can update own cover letters"
  on public.cover_letters for update
  using (auth.uid() = candidate_id)
  with check (auth.uid() = candidate_id);

create policy "Candidates can delete own cover letters"
  on public.cover_letters for delete
  using (auth.uid() = candidate_id);
