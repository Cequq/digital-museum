update public.history_milestones m
set image_url = '/museum/' || m.year || '.svg'
where m.image_url is null
  and m.year in (1924, 1964, 1992, 2005, 2010, 2012, 2015, 2019, 2024);

-- Үзэсгэлэнгийн үзмэрүүд
update public.exhibits set image_url = '/museum/1964.svg'
where image_url is null and title = '1964 оны тооцоолох машины кабинет';
update public.exhibits set image_url = '/museum/exhibit-internship.svg'
where image_url is null and title like 'Оюутны дадлага бүртгэлийн систем%';
update public.exhibits set image_url = '/museum/exhibit-ml.svg'
where image_url is null and title like 'Эдийн засгийн тодорхой бус байдлын индекс%';
update public.exhibits set image_url = '/museum/exhibit-risk.svg'
where image_url is null and title like 'Байгууллагын мэдээллийн системийн эрсдэл%';
update public.exhibits set image_url = '/museum/exhibit-museum.svg'
where image_url is null and title = 'ISM Digital Museum';

-- Арга хэмжээний нүүр зураг
update public.events set cover_image_url = '/museum/2024.svg'
where cover_image_url is null and title like 'СЭЗИС 100 жилийн ой%';
update public.events set cover_image_url = '/museum/event-competition.svg'
where cover_image_url is null and title like 'Оюутны бүтээлийн уралдаан%';
update public.events set cover_image_url = '/museum/event-olympiad.svg'
where cover_image_url is null and title like 'Менежментийн улсын XV олимпиад%';
