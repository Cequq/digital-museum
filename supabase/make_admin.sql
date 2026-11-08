update public.profiles
set role = 'admin',
    display_name = 'ISM Админ',
    bio = 'ISM Digital Museum-ийн агуулгыг удирдагч'
where id = (select id from auth.users where email = 'admin@ism-museum.mn');

-- Шалгах: 1 мөр, role = admin гарах ёстой
select p.display_name, p.role, u.email
from public.profiles p join auth.users u on u.id = p.id
where p.role = 'admin';
