create table if not exists public.cleaning_history (
  id bigint generated always as identity primary key,
  day date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  checked_items text[] not null default '{}',
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (day, user_id)
);

alter table public.cleaning_history enable row level security;

create policy "users can read own cleaning history"
  on public.cleaning_history
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can insert own cleaning history"
  on public.cleaning_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own cleaning history"
  on public.cleaning_history
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
