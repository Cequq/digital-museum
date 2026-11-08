-- =====================================================================
-- ISM Digital Museum — Supabase өгөгдлийн сангийн схем
-- Supabase Dashboard → SQL Editor дээр энэ файлыг БҮТНээр нь ажиллуулна.
-- Дараалал: 1) schema.sql  2) policies.sql  3) storage.sql  4) seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. profiles — хэрэглэгчийн профайл (auth.users-тэй 1:1 холбоотой)
--    PK: id = auth.users.id  (FK, хэрэглэгч устгагдвал профайл устна)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default 'Шинэ бүтээгч',
  avatar_url    text,
  bio           text,
  student_code  text,
  role          text not null default 'creator' check (role in ('creator', 'admin')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. exhibition_categories — үзмэрийн ангилал
-- ---------------------------------------------------------------------
create table if not exists public.exhibition_categories (
  id           serial primary key,
  name         text not null unique,
  description  text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. exhibits — музейн үзмэр / оюутны бүтээл
--    FK: category_id → exhibition_categories.id (ангилал устгавал NULL болно)
--    FK: creator_id  → profiles.id (бүтээгч; тэнхимийн архивын үзмэрт NULL)
-- ---------------------------------------------------------------------
create table if not exists public.exhibits (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 3 and 150),
  description       text not null default '',
  image_url         text,
  category_id       int references public.exhibition_categories (id) on delete set null,
  technology_stack  text[] not null default '{}',
  year_created      int check (year_created between 1924 and 2100),
  creator_id        uuid references public.profiles (id) on delete set null,
  creator_name      text,              -- архивын (бүртгэлгүй) зохиогчийн нэр
  demo_url          text,
  github_url        text,
  status            text not null default 'published'
                    check (status in ('draft', 'pending', 'published', 'archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists exhibits_category_idx on public.exhibits (category_id);
create index if not exists exhibits_creator_idx  on public.exhibits (creator_id);
create index if not exists exhibits_year_idx     on public.exhibits (year_created);

-- ---------------------------------------------------------------------
-- 4. teachers — тэнхимийн багш нар
-- ---------------------------------------------------------------------
create table if not exists public.teachers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  position    text not null default 'Багш',
  courses     text[] not null default '{}',
  bio         text,
  photo_url   text,
  sort_order  int not null default 100,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. events — өдөрлөг, семинар, тэмцээн
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  event_date       date not null,
  event_type       text not null default 'Арга хэмжээ',
  description      text,
  cover_image_url  text,
  source_url       text,               -- мэдээ / Facebook / Instagram пост
  social_posts     text[] not null default '{}',  -- embed хийх IG/FB/YouTube постын холбоосууд
  created_at       timestamptz not null default now()
);
create index if not exists events_date_idx on public.events (event_date desc);

-- ---------------------------------------------------------------------
-- 6. event_photos — арга хэмжээний зурагт цомог
--    FK: event_id → events.id (арга хэмжээ устгавал зурагнууд хамт устна)
-- ---------------------------------------------------------------------
create table if not exists public.event_photos (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  image_url   text not null,
  caption     text,
  source_url  text,                    -- зургийн эх сурвалж (зохиогчийн эрхийн тэмдэглэл)
  created_at  timestamptz not null default now()
);
create index if not exists event_photos_event_idx on public.event_photos (event_id);

-- ---------------------------------------------------------------------
-- 7. history_milestones — тэнхимийн түүхийн үе шат (ISM Time Machine)
-- ---------------------------------------------------------------------
create table if not exists public.history_milestones (
  id           uuid primary key default gen_random_uuid(),
  year         int not null check (year between 1900 and 2100),
  title        text not null,
  description  text,
  era          text,                -- жишээ: "Үүсэл", "Өргөжилт", "Дижитал эрин"
  image_url    text,                -- Time Machine-ий слайдын зураг
  source_url   text,
  created_at   timestamptz not null default now()
);
create index if not exists history_year_idx on public.history_milestones (year);

-- ---------------------------------------------------------------------
-- 8. timeline_photos — Time Machine-ий он бүрийн зургийн цомог
--    Админ Time Machine хуудаснаас шууд оруулна. Он-оор холбогдоно
--    (тухайн онд түүх/арга хэмжээ/бүтээл байхгүй байсан ч слайд үүснэ).
-- ---------------------------------------------------------------------
create table if not exists public.timeline_photos (
  id          uuid primary key default gen_random_uuid(),
  year        int not null check (year between 1900 and 2100),
  image_url   text not null,
  caption     text,
  source_url  text,                    -- Instagram / Facebook пост, мэдээ
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists timeline_photos_year_idx on public.timeline_photos (year);

-- =====================================================================
-- ТУСЛАХ ФУНКЦ, ТРИГГЕРҮҮД
-- =====================================================================

-- Одоогийн хэрэглэгч админ эсэх (RLS бодлогод ашиглана).
-- security definer: profiles-ийн RLS-ийг тойрч, рекурс үүсэхээс сэргийлнэ.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Шинэ хэрэглэгч бүртгүүлэхэд профайл автоматаар үүсгэх
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Энгийн хэрэглэгч өөрийн role-ийг "admin" болгож чадахгүй байх хамгаалалт
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Зөвхөн админ хэрэглэгчийн эрхийг өөрчилнө';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Энгийн бүтээгч үзмэрийн creator_id-г бусдын нэр рүү шилжүүлэхээс сэргийлэх,
-- updated_at-ийг шинэчлэх
create or replace function public.exhibits_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.creator_id is distinct from old.creator_id and auth.uid() is not null and not public.is_admin() then
    raise exception 'Үзмэрийн эзэмшигчийг өөрчлөх эрхгүй';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists exhibits_set_updated on public.exhibits;
create trigger exhibits_set_updated
  before update on public.exhibits
  for each row execute function public.exhibits_before_update();
