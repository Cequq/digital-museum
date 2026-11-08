alter table public.profiles              enable row level security;
alter table public.exhibition_categories enable row level security;
alter table public.exhibits              enable row level security;
alter table public.teachers              enable row level security;
alter table public.events                enable row level security;
alter table public.event_photos          enable row level security;
alter table public.history_milestones    enable row level security;
alter table public.timeline_photos       enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles: бүгд унших" on public.profiles;
create policy "profiles: бүгд унших"
  on public.profiles for select
  using (true);

drop policy if exists "profiles: өөрийгөө засах" on public.profiles;
create policy "profiles: өөрийгөө засах"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------- exhibits ----------
drop policy if exists "exhibits: нийтлэгдсэнийг бүгд унших" on public.exhibits;
create policy "exhibits: нийтлэгдсэнийг бүгд унших"
  on public.exhibits for select
  using (
    status = 'published'
    or creator_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "exhibits: бүтээгч нэмэх" on public.exhibits;
create policy "exhibits: бүтээгч нэмэх"
  on public.exhibits for insert
  to authenticated
  with check (creator_id = auth.uid() or public.is_admin());

drop policy if exists "exhibits: эзэмшигч эсвэл админ засах" on public.exhibits;
create policy "exhibits: эзэмшигч эсвэл админ засах"
  on public.exhibits for update
  to authenticated
  using (creator_id = auth.uid() or public.is_admin())
  with check (creator_id = auth.uid() or public.is_admin());

drop policy if exists "exhibits: эзэмшигч эсвэл админ устгах" on public.exhibits;
create policy "exhibits: эзэмшигч эсвэл админ устгах"
  on public.exhibits for delete
  to authenticated
  using (creator_id = auth.uid() or public.is_admin());

do $$
declare
  t text;
begin
  foreach t in array array[
    'exhibition_categories', 'teachers', 'events', 'event_photos', 'history_milestones', 'timeline_photos'
  ]
  loop
    execute format('drop policy if exists "%1$s: бүгд унших" on public.%1$I', t);
    execute format(
      'create policy "%1$s: бүгд унших" on public.%1$I for select using (true)', t);

    execute format('drop policy if exists "%1$s: админ нэмэх" on public.%1$I', t);
    execute format(
      'create policy "%1$s: админ нэмэх" on public.%1$I for insert to authenticated with check (public.is_admin())', t);

    execute format('drop policy if exists "%1$s: админ засах" on public.%1$I', t);
    execute format(
      'create policy "%1$s: админ засах" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);

    execute format('drop policy if exists "%1$s: админ устгах" on public.%1$I', t);
    execute format(
      'create policy "%1$s: админ устгах" on public.%1$I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;
