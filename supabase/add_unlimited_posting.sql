-- Add unlimited posting bypass for admin/owner accounts
alter table public.profiles add column if not exists is_unlimited_posting boolean not null default false;

-- Create index for efficient lookups
create index if not exists idx_profiles_is_unlimited_posting on public.profiles(is_unlimited_posting) where is_unlimited_posting = true;
