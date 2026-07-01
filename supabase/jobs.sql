-- ============================================================
-- JobConnect AI — Jobs Table
-- Run this in: https://app.supabase.com → SQL Editor → New query
-- ============================================================

-- Companies table (referenced by jobs)
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website     text,
  created_at  timestamptz not null default now()
);

-- Jobs table
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  company_id    uuid references public.companies (id) on delete set null,
  company_name  text not null,                          -- denormalized for fast reads
  location      text not null default 'Remote',
  salary_min    integer,                                -- in USD/year
  salary_max    integer,
  salary_label  text,                                   -- e.g. "$180k–$240k"
  job_type      text not null default 'Full-time'
                  check (job_type in ('Full-time', 'Part-time', 'Contract', 'Internship')),
  category      text not null default 'Engineering',
  tags          text[] default '{}',                    -- e.g. {"Python","ML","LLMs"}
  description   text,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  posted_by     uuid references auth.users (id) on delete set null,  -- employer user id
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists jobs_category_idx  on public.jobs (category);
create index if not exists jobs_job_type_idx  on public.jobs (job_type);
create index if not exists jobs_is_active_idx on public.jobs (is_active);
create index if not exists jobs_posted_by_idx on public.jobs (posted_by);
create index if not exists jobs_created_at_idx on public.jobs (created_at desc);

-- ── Row Level Security ────────────────────────────────────────
alter table public.jobs     enable row level security;
alter table public.companies enable row level security;

-- Anyone can read active jobs
create policy "Public can view active jobs"
  on public.jobs for select
  using (is_active = true);

-- Employers can insert their own jobs
create policy "Employers can post jobs"
  on public.jobs for insert
  with check (auth.uid() = posted_by);

-- Employers can update/delete their own jobs
create policy "Employers can manage own jobs"
  on public.jobs for update
  using (auth.uid() = posted_by);

create policy "Employers can delete own jobs"
  on public.jobs for delete
  using (auth.uid() = posted_by);

-- Anyone can read companies
create policy "Public can view companies"
  on public.companies for select
  using (true);

-- ── Seed Data ────────────────────────────────────────────────
insert into public.jobs
  (title, company_name, location, salary_min, salary_max, salary_label, job_type, category, tags, is_featured)
values
  ('Senior AI Engineer',        'Anthropic', 'Remote · USA',       180000, 240000, '$180k–$240k', 'Full-time', 'Engineering',        '{"Python","ML","LLMs"}',                true),
  ('Staff Frontend Engineer',   'Vercel',    'Remote · Worldwide', 160000, 200000, '$160k–$200k', 'Full-time', 'Engineering',        '{"React","Next.js","TypeScript"}',      true),
  ('ML Research Scientist',     'Anthropic', 'Remote · USA',       200000, 280000, '$200k–$280k', 'Full-time', 'Research',           '{"ML","PyTorch","Research"}',           true),
  ('Product Designer',          'Figma',     'Remote · US/EU',     140000, 180000, '$140k–$180k', 'Full-time', 'Design',             '{"Figma","Design Systems","UX"}',       false),
  ('Backend Engineer',          'Linear',    'Remote · Worldwide', 150000, 190000, '$150k–$190k', 'Full-time', 'Engineering',        '{"TypeScript","PostgreSQL","Go"}',      false),
  ('Growth Engineer',           'Stripe',    'Remote · USA',       155000, 195000, '$155k–$195k', 'Full-time', 'Engineering',        '{"SQL","Python","A/B Testing"}',        false),
  ('DevRel Engineer',           'Notion',    'Remote · Worldwide', 130000, 160000, '$130k–$160k', 'Contract',  'Developer Relations','{"APIs","Docs","Community"}',           false),
  ('Data Scientist',            'Stripe',    'Remote · USA',       145000, 185000, '$145k–$185k', 'Full-time', 'Data',               '{"Python","Statistics","SQL"}',         false),
  ('UX Researcher',             'Figma',     'Remote · USA',       120000, 155000, '$120k–$155k', 'Full-time', 'Design',             '{"User Research","Usability","Analytics"}', false),
  ('Platform Engineer',         'Vercel',    'Remote · Worldwide', 165000, 205000, '$165k–$205k', 'Full-time', 'Engineering',        '{"Kubernetes","Go","Cloud"}',           false),
  ('Technical Writer',          'Notion',    'Remote · Worldwide',  95000, 125000, '$95k–$125k',  'Part-time', 'Content',            '{"Writing","APIs","Markdown"}',         false),
  ('Security Engineer',         'Linear',    'Remote · EU',        140000, 175000, '$140k–$175k', 'Full-time', 'Engineering',        '{"Security","TypeScript","Pentest"}',   false);
