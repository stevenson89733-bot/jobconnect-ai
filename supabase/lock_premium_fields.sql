-- ============================================================
-- SECURITY FIX — run this in: https://app.supabase.com → SQL Editor → New query
--
-- Problem: the existing "Users can update own profile" policy
-- (supabase/profile_fields.sql) is `using (auth.uid() = user_id)
-- with check (auth.uid() = user_id)` — it restricts WHICH ROW can be
-- updated, but not WHICH COLUMNS. Any authenticated user can therefore call,
-- from the browser, e.g.:
--   supabase.from('profiles').update({ is_premium: true }).eq('user_id', user.id)
-- and grant themselves premium AI access without ever paying, since RLS
-- has no per-column granularity.
--
-- Why a trigger instead of a WITH CHECK clause: a policy's WITH CHECK only
-- sees the NEW row — it has no OLD row to diff against, so it cannot express
-- "reject this update only if is_premium changed". A BEFORE UPDATE trigger
-- has both OLD and NEW and can compare them per-column.
--
-- Why "silently revert" instead of "raise an exception": the app's own
-- update path (app/actions/profile.ts) never touches is_premium or
-- stripe_customer_id, so this should never fire in normal use. If some
-- other client-side call ever does include those fields (accidentally or
-- otherwise), silently keeping the old value is a strictly safer failure
-- mode than throwing — it can never turn a legitimate, larger profile-save
-- request (bio, skills, location, etc.) into a hard error over two fields
-- the user was never supposed to touch. The two protected fields simply
-- don't move; everything else in the same UPDATE still goes through.
--
-- Who can still change these fields: the Stripe webhook
-- (app/api/stripe/webhook/route.ts) already writes is_premium and
-- stripe_customer_id using the SERVICE ROLE client, which bypasses RLS —
-- but triggers fire regardless of RLS/service-role status, so the trigger
-- itself checks auth.role(): only requests authenticated as 'service_role'
-- are allowed to change these two columns. Everyone else (including the
-- 'authenticated' role used by a normal logged-in user's own client) has
-- those two columns pinned back to their previous value.
-- ============================================================

create or replace function public.protect_premium_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    new.is_premium := old.is_premium;
    new.stripe_customer_id := old.stripe_customer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_premium_fields_trigger on public.profiles;

create trigger protect_premium_fields_trigger
  before update on public.profiles
  for each row execute procedure public.protect_premium_fields();
