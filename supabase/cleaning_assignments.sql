create table if not exists public.cleaning_assignments (
  day date primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cleaner_email text,
  created_at timestamptz not null default now()
);

alter table public.cleaning_assignments enable row level security;

create policy "read cleaning assignments"
  on public.cleaning_assignments
  for select
  to authenticated
  using (true);

create policy "insert own cleaning assignment"
  on public.cleaning_assignments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "delete own cleaning assignment"
  on public.cleaning_assignments
  for delete
  to authenticated
  using (auth.uid() = user_id);
