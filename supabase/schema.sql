create extension if not exists "pgcrypto";
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null default 'Шинэ бүтээгч',
  avatar_url    text,
  bio           text,
  student_code  text,
  role          text not null default 'creator' check (role in ('creator', 'admin')),
  created_at    timestamptz not null default now()
);

create table if not exists public.exhibition_categories (
  id           serial primary key,
  name         text not null unique,
  description  text,
  created_at   timestamptz not null default now()
);

create table if not exists public.exhibits (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (char_length(title) between 3 and 150),
  description       text not null default '',
  image_url         text,
  category_id       int references public.exhibition_categories (id) on delete set null,
  technology_stack  text[] not null default '{}',
  year_created      int check (year_created between 1924 and 2100),
  creator_id        uuid references public.profiles (id) on delete set null,
  creator_name      text,           
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


create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  event_date       date not null,
  event_type       text not null default 'Арга хэмжээ',
  description      text,
  cover_image_url  text,
  source_url       text,              
  social_posts     text[] not null default '{}', 
  created_at       timestamptz not null default now()
);
create index if not exists events_date_idx on public.events (event_date desc);


create table if not exists public.event_photos (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  image_url   text not null,
  caption     text,
  source_url  text,                 
  created_at  timestamptz not null default now()
);
create index if not exists event_photos_event_idx on public.event_photos (event_id);


create table if not exists public.history_milestones (
  id           uuid primary key default gen_random_uuid(),
  year         int not null check (year between 1900 and 2100),
  title        text not null,
  description  text,
  era          text,                
  image_url    text,                
  source_url   text,
  created_at   timestamptz not null default now()
);
create index if not exists history_year_idx on public.history_milestones (year);

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
