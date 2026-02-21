create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create policy "admins can read admin table"
  on public.app_admins
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.cleaning_checklist_items (
  id bigint generated always as identity primary key,
  label text not null,
  sort_order int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cleaning_checklist_items enable row level security;

create policy "authenticated can read checklist"
  on public.cleaning_checklist_items
  for select
  to authenticated
  using (true);

create policy "admins can insert checklist"
  on public.cleaning_checklist_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.app_admins a
      where a.user_id = auth.uid()
    )
  );

create policy "admins can update checklist"
  on public.cleaning_checklist_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.app_admins a
      where a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.app_admins a
      where a.user_id = auth.uid()
    )
  );

create policy "admins can delete checklist"
  on public.cleaning_checklist_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.app_admins a
      where a.user_id = auth.uid()
    )
  );

-- Optional starter rows
insert into public.cleaning_checklist_items (label, sort_order)
values
  ('Bring supplies (spray, microfiber cloth, trash bags)', 1),
  ('Open windows or ventilation', 2),
  ('Collect and remove trash', 3),
  ('Dust surfaces (high to low)', 4),
  ('Wipe counters and tables', 5),
  ('Clean sinks and faucets', 6),
  ('Scrub toilet and disinfect handle', 7),
  ('Vacuum rugs and high-traffic areas', 8),
  ('Mop hard floors', 9),
  ('Restock paper towels / soap', 10),
  ('Final walkthrough and lock up', 11)
on conflict do nothing;
