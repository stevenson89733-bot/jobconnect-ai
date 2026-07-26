-- ============================================================
-- Copilot Conversations — chat history for the conversational Career
-- Copilot (intent classification + redirect, no function calling in V1).
-- Run this in: https://app.supabase.com → SQL Editor → New query
--
-- One row per message (role = 'user' or 'assistant'), not a separate
-- conversations+messages pair — this is a single continuous per-candidate
-- log, not multiple named threads, so a flat table is the honest model of
-- what this actually is.
--
-- Retention: 90 days, agreed as GDPR-friendly given this app's real EU-
-- language userbase (11 locales including fr/de/es/pt/ht). No pg_cron
-- dependency — rather than assume that extension is enabled on this
-- Supabase project (not guaranteed on every plan), the app opportunistically
-- deletes each candidate's own rows older than 90 days on every new message
-- write (app/api/copilot/chat/route.ts) — same "no invented infrastructure"
-- discipline as the rest of this project.
-- ============================================================

create table if not exists public.copilot_conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  message       text not null,
  intent        text,           -- classified intent for assistant replies; null for user messages
  redirect_url  text,           -- the real, validated in-app link proposed alongside this reply, if any
  created_at    timestamptz not null default now()
);

create index if not exists copilot_conversations_user_id_created_at_idx
  on public.copilot_conversations (user_id, created_at desc);

alter table public.copilot_conversations enable row level security;

-- Candidates can only ever read/write/delete their own messages — plain
-- auth.uid() = user_id comparison, no subquery into another RLS-protected
-- table, same pattern as cover_letters/career_analysis (avoids the
-- infinite-recursion bug from earlier in this project — see
-- supabase/fix_employer_read_recursion.sql).
create policy "Candidates can view own copilot messages"
  on public.copilot_conversations for select
  using (auth.uid() = user_id);

create policy "Candidates can insert own copilot messages"
  on public.copilot_conversations for insert
  with check (auth.uid() = user_id);

-- No update policy — messages are immutable once written. Delete is used
-- only by the 90-day opportunistic purge (as the candidate's own session,
-- same auth.uid() check, not a service-role bypass).
create policy "Candidates can delete own copilot messages"
  on public.copilot_conversations for delete
  using (auth.uid() = user_id);
