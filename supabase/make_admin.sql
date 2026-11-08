-- =====================================================================
-- Админ данс тохируулах
--
-- 1) Supabase Dashboard → Authentication → Users → "Add user" → "Create new user"
--      Email:    admin@ism-museum.mn
--      Password: (README / багшид өгсөн нууц үг — GitHub-д БҮҮ бич)
--      ☑ Auto Confirm User   ← заавал чагтална
-- 2) Дараа нь энэ файлыг SQL Editor дээр ажиллуулна.
--
-- Жинхэнэ и-мэйлээ ашиглавал "Нууц үгээ мартсан уу?" функц тэр хаяг руу ажиллана.
-- Өөр и-мэйл ашиглах бол доорх хаягийг солино.
-- =====================================================================

update public.profiles
set role = 'admin',
    display_name = 'ISM Админ',
    bio = 'ISM Digital Museum-ийн агуулгыг удирдагч'
where id = (select id from auth.users where email = 'admin@ism-museum.mn');

-- Шалгах: 1 мөр, role = admin гарах ёстой
select p.display_name, p.role, u.email
from public.profiles p join auth.users u on u.id = p.id
where p.role = 'admin';
