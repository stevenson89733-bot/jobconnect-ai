-- Applications table
create table applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  message      text,
  status       text not null default 'submitted',
  created_at   timestamptz not null default now(),
  unique (job_id, candidate_id)
);

-- RLS
alter table applications enable row level security;

-- Candidat : voit et crée ses propres candidatures
create policy "candidates_own" on applications
  for all using (auth.uid() = candidate_id);

-- Employeur : voit les candidatures des offres qu'il a postées
create policy "employer_view" on applications
  for select using (
    exists (
      select 1 from jobs
      where jobs.id = applications.job_id
        and jobs.posted_by = auth.uid()
    )
  );
