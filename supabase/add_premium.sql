alter table profiles add column if not exists is_premium boolean not null default false;
alter table profiles add column if not exists stripe_customer_id text;
