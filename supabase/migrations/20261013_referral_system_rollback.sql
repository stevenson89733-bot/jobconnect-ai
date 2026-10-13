-- ============================================================
-- ROLLBACK for 20261013_referral_system.sql
-- WARNING: permanently deletes all referral data. Run manually only.
-- No other table references these, so existing features are unaffected.
-- ============================================================

begin;

drop table if exists public.referral_rewards;
drop table if exists public.referral_events;
drop trigger if exists referral_attributions_immutable_trigger on public.referral_attributions;
drop table if exists public.referral_attributions;
drop function if exists public.referral_attributions_immutable();
drop table if exists public.referral_visits;
drop table if exists public.referral_codes;

commit;
