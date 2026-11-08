-- =====================================================================
-- Migration 002 — Зураг ба сошиал эх сурвалж
-- Хэрэв өмнөх хувилбарын schema.sql-ийг АЛЬ ХЭДИЙН ажиллуулсан бол
-- зөвхөн энэ файлыг SQL Editor дээр ажиллуулна. Шинээр суулгаж буй бол
-- schema.sql-д эдгээр багана орсон тул энэ файл шаардлагагүй (давтан ажиллуулсан ч аюулгүй).
-- =====================================================================

alter table public.history_milestones add column if not exists image_url    text;
alter table public.events             add column if not exists source_url   text;
alter table public.events             add column if not exists social_posts text[] not null default '{}';
alter table public.event_photos       add column if not exists source_url   text;

-- Албан ёсны мэдээний зураг ба эх сурвалж (ufe.edu.mn)
update public.history_milestones
set image_url = 'https://backend.ufe.edu.mn/content/post_image/file/202210/71172ccf5a4767f2b51bb24396da16a0.png'
where year = 2022 and image_url is null;

update public.events
set cover_image_url = coalesce(cover_image_url,
      'https://backend.ufe.edu.mn/content/post_image/file/202210/71172ccf5a4767f2b51bb24396da16a0.png'),
    source_url = coalesce(source_url, 'https://ufe.edu.mn/widgetDetail/277')
where event_date = '2022-06-29';

update public.events
set source_url = coalesce(source_url, 'https://100.ufe.mn/contact')
where title like 'СЭЗИС 100 жилийн ой%';
