-- =====================================================================
-- Migration 003 — Time Machine-д админ шууд зураг оруулах
-- Өмнөх хувилбарыг суулгасан бол энэ файлыг SQL Editor дээр ажиллуулна.
-- (Шинээр суулгаж буй бол schema.sql + policies.sql-д орсон; давтан ажиллуулсан ч аюулгүй.)
-- =====================================================================

create table if not exists public.timeline_photos (
  id          uuid primary key default gen_random_uuid(),
  year        int not null check (year between 1900 and 2100),
  image_url   text not null,
  caption     text,
  source_url  text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists timeline_photos_year_idx on public.timeline_photos (year);

alter table public.timeline_photos enable row level security;

drop policy if exists "timeline_photos: бүгд унших" on public.timeline_photos;
create policy "timeline_photos: бүгд унших"
  on public.timeline_photos for select using (true);

drop policy if exists "timeline_photos: админ нэмэх" on public.timeline_photos;
create policy "timeline_photos: админ нэмэх"
  on public.timeline_photos for insert to authenticated with check (public.is_admin());

drop policy if exists "timeline_photos: админ засах" on public.timeline_photos;
create policy "timeline_photos: админ засах"
  on public.timeline_photos for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "timeline_photos: админ устгах" on public.timeline_photos;
create policy "timeline_photos: админ устгах"
  on public.timeline_photos for delete to authenticated using (public.is_admin());
