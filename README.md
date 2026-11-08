# ISM Digital Museum

**СЭЗИС-ийн Мэдээллийн системийн менежментийн тэнхимийн интерактив дижитал музей**
Internet Programming · Гэрийн даалгавар №1

> 🔗 **Demo:** `https://ТАНЫ-ТӨСӨЛ.vercel.app` ← байршуулсны дараа солино
> 🔗 **GitHub:** `https://github.com/ТАНЫ-НЭР/ism-digital-museum`

Тэнхимийн түүх (1964 оны тооцоолох машины кабинетаас өнөөг хүртэл), багш нар, өдөрлөг ба арга хэмжээний зурагт цомог, оюутнуудын бүтээлийг нэг дор хадгалж, интерактив байдлаар танилцуулах веб аппликейшн.

## Боломжууд

| Шаардлага | Хэрэгжүүлэлт |
|---|---|
| Дижитал үзэсгэлэн | `/exhibits` жагсаалт, `/exhibits/:id` дэлгэрэнгүй — зураг, тайлбар, он, зохиогч, технологи, demo/GitHub |
| Тэнхимийн багш нар | `/teachers` — нэр, албан тушаал, хичээл, танилцуулга, зураг; хичээлээр хайх |
| Өдөрлөг ба арга хэмжээ | `/events` — төрлөөр шүүх, `/events/:id` зурагт цомог + lightbox |
| Тэнхимийн түүх | `history_milestones` хүснэгт + Time Machine |
| ISM Creators | `/creators` — оюутны профайл ↔ бүтээлүүд (`profiles` → `exhibits` FK) |
| Хайлт ба ангилал | Нэр/тайлбар/зохиогч (`ilike`), ангилал, он, технологи (`contains`) — сервер талд; илэрцгүй үед мэдэгдэл |
| Бүртгэл ба эрх | Supabase Auth (бүртгүүлэх, нэвтрэх, гарах), хамгаалагдсан route, 3 төрлийн хэрэглэгч |
| CRUD ба зураг | Бүтээл нэмэх/харах/засах/устгах, зургийг Supabase Storage-д; админ багш/арга хэмжээ/цомог/түүх/ангиллын CRUD |
| **Бүтээлч шийдэл** | ⭐ **ISM Time Machine** (доор дэлгэрэнгүй) |

### Хэрэглэгчийн төрлүүд

- **Зочин** — бүх нийтлэгдсэн агуулгыг үзэж, хайж, шүүнэ.
- **Бүтээгч / оюутан** — бүртгүүлээд зөвхөн **өөрийн** бүтээлийг нэмэх, засах, устгах; ноорог хадгалах; профайл засах.
- **Администратор** — бүх үзмэрийн төлвийг хянах, багш, арга хэмжээ, зурагт цомог, түүх, ангиллыг удирдах.

### ⭐ Бүтээлч шийдэл — ISM Time Machine (`/time-machine`)

Тэнхимийн түүхийн үе шат, арга хэмжээ, оюутны бүтээл гэсэн **гурван хүснэгтийг он-оор нь нэгтгэж** нэг интерактив timeline болгоно.

- Он сонгох **гулсуур**, 10 жилээр үсрэх товч
- **▶ Аялал эхлүүлэх** — оныг автоматаар дарааллуулан тоглуулж, тухайн он руу гүйлгэнэ
- Гүйлгэхэд идэвхтэй он, "N жилийн өмнө", тухайн үеийн **эрин** (Үүсэл → Өргөжилт → Олон улсад → Дижитал эрин) автоматаар шинэчлэгдэнэ (`IntersectionObserver`)
- Ирээдүйн онууд бүдэг, идэвхтэй он тодорно
- Төрлөөр шүүх (◆ Түүх / ● Арга хэмжээ / ▲ Бүтээл)
- Хажуугийн самбарт тухайн он хүртэлх **технологийн хувьсал** болон үйл явдлын тоо
- **Хэвтээ "Кино" горим:** он бүр зурагтай слайд болж, 1.1 сек-ийн `cubic-bezier` хөдөлгөөнөөр хажуу тийш гулсана; доорх он цагийн зам дээр заагч хамт гулсана, явцын шугам тасралтгүй дүүрнэ
- Тухайн оны **бүх зураг** (түүх, өдөрлөгийн нүүр зураг + цомог, бүтээл) зөөлөн crossfade-ээр ээлжилнэ, Ken Burns томролттой
- Зураг бүр **эх сурвалжийн тэмдэгтэй** (Instagram ↗ / Facebook ↗ / ufe.edu.mn ↗)
- ← → товч, утсан дээр шудрах, "Жагсаалт" (босоо) горим руу шилжих боломжтой

## Технологи

| | |
|---|---|
| Frontend | React 18, React Router 6, Vite 5, цэвэр CSS (responsive, dark mode) |
| Backend | Supabase — Auth, PostgreSQL, Storage, Row Level Security |
| Байршуулалт | Vercel эсвэл Netlify, GitHub |

## Төслийн бүтэц

```
ism-digital-museum/
├── supabase/
│   ├── schema.sql      # хүснэгт, FK, индекс, триггер, is_admin()
│   ├── policies.sql    # RLS бодлогууд
│   ├── storage.sql     # "museum" bucket + Storage бодлого
│   └── seed.sql        # тэнхимийн бодит анхны өгөгдөл
├── docs/
│   ├── ERD.md          # өгөгдлийн сангийн схем, PK/FK тайлбар
│   ├── WIREFRAMES.md   # wireframe, хэрэглэгчийн урсгал
│   └── DEMO_SCRIPT.md  # 5–7 мин demo + хамгаалалтын асуулт
├── src/
│   ├── lib/            # supabase клиент, storage туслах, формат
│   ├── context/        # AuthContext (session, profile, isAdmin)
│   ├── components/     # Layout, ExhibitCard, ImageUpload, CrudManager…
│   ├── pages/          # Home, Exhibits, TimeMachine, Teachers, Events, Admin…
│   └── styles/global.css
├── .env.example
├── vercel.json / public/_redirects   # SPA routing
└── package.json
```

## Суулгах заавар

### 1. Supabase төсөл үүсгэх

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor** дээр дараах файлуудыг **энэ дарааллаар** хуулж ажиллуулна:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/storage.sql`
   4. `supabase/seed.sql`
   - Өмнөх хувилбарыг аль хэдийн суулгасан бол зөвхөн `migration_002_media.sql` → `migration_003_timeline_photos.sql` → `migration_004_images.sql`-ийг дарааллаар нь ажиллуулна.
3. **Authentication → URL Configuration** дээр `Site URL`-д локал (`http://localhost:5173`) болон дараа нь Vercel хаягаа нэмнэ.
   (Туршилтын үед хурдан болгохыг хүсвэл **Authentication → Providers → Email → Confirm email**-г унтрааж болно.)

### 2. Локал орчинд ажиллуулах

```bash
git clone https://github.com/ТАНЫ-НЭР/ism-digital-museum.git
cd ism-digital-museum
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

`.env` файлд **Project Settings → API**-аас `Project URL` болон **anon public** түлхүүрийг оруулна:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

```bash
npm run dev               # http://localhost:5173
```

### 2.1. Instagram / Facebook-ийн постоос зураг нэмэх

Instagram, Facebook нь гадны программд зураг татахыг хориглодог, зургийн шууд холбоос нь хэсэг хугацааны дараа хүчингүй болдог. Тиймээс зургийг Supabase Storage-д хуулж хадгалаад, эх постын холбоосыг нь тэмдэглэнэ:

1. Тэнхим / сургуулийн постыг нээж ([facebook.com/ufe.edu.mn](https://www.facebook.com/ufe.edu.mn), [instagram.com/ufe.edu.mn](https://www.instagram.com/ufe.edu.mn/)) зургуудыг нь хадгална.
2. **Админ → Арга хэмжээ ба цомог → "Зурагт цомог"** дээр **постын холбоосыг** тавиад, хадгалсан зургуудаа **"+ Зураг нэмэх"**-ээр нэг дор сонгоно.
3. Зураг бүр `event_photos.source_url`-д постын холбоостой хадгалагдаж, цомог, lightbox, **Time Machine**-д "Зураг: Instagram ↗" гэсэн тэмдэгтэй гарна.
4. Түүхийн үе шатад зураг нэмэх бол **Админ → Түүх** хэсгээс зураг оруулж (эсвэл URL тавьж), эх сурвалжид постын холбоосыг бичнэ.
5. Постыг бүхэлд нь (тайлбар, like-тай нь) харуулах бол арга хэмжээний **"Embed хийх постууд"** талбарт Instagram / Facebook / YouTube холбоосыг таслалаар тавина.

> ⚠️ Хүн харагдаж буй зургийг нийтлэхээс өмнө тэнхимээс зөвшөөрөл авна уу.

### 2.2. Time Machine-д админаас шууд зураг оруулах

- Админаар нэвтэрч **Time Machine**-ийг нээхэд слайд бүрийн доор **“📷 {он} онд зураг нэмэх”** товч гарна. Постын холбоос (заавал биш), тайлбар бичээд олон зургийг нэг дор сонгоход тэр даруй слайд дээр гарч ээлжилнэ.
- Слайд дээр харагдаж буй админы зургийг **🗑 Устгах** товчоор устгана.
- **Админ → Time Machine зураг** табаас дурын онд (шинэ он ч болно) зураг нэмэх, тайлбар / эх сурвалжийг засах, устгах боломжтой. Зөвхөн зурагтай он ч Time Machine-д слайд болж гарна.
- Зургууд `timeline_photos` хүснэгт (он, зураг, тайлбар, эх сурвалж) болон Storage-ийн `<uid>/timeline/<он>/` хавтаст хадгалагдана; RLS-ээр зөвхөн админ бичнэ.

### 3. Админ данс үүсгэх

1. **Authentication → Users → Add user → Create new user**
   - Email: `admin@ism-museum.mn` · Password: *(тусад нь өгсөн нууц үг)* · **☑ Auto Confirm User**
2. SQL Editor дээр `supabase/make_admin.sql`-ийг ажиллуулна → нэр нь **ISM Админ**, эрх нь `admin` болно.
3. Сайт руу энэ данс руу нэвтэрвэл цэсэнд **Админ** гарч ирнэ.

> 🔒 Нууц үгийг кодонд, GitHub-д бүү бичээрэй. Сайтаа нийтэд нээхээс өмнө Профайл → “Нууц үг солих”-оор сольж болно.

### 3.1. Нууц үг сэргээх (Forgot password)

- Нэвтрэх хуудсан дээрх **“Нууц үгээ мартсан уу?”** → и-мэйл оруулна → Supabase холбоос илгээнэ → `/reset-password` хуудсанд шинэ нууц үг тохируулна.
- Нэвтэрсэн хэрэглэгч **Профайл → Нууц үг солих**-оор шууд сольж болно.
- **Заавал тохируулах:** Supabase → **Authentication → URL Configuration → Redirect URLs**-д
  `http://localhost:5173/reset-password` болон `https://ТАНЫ-ТӨСӨЛ.vercel.app/reset-password`-г нэмнэ.
- Supabase-ийн үнэгүй и-мэйл үйлчилгээ цагт цөөн и-мэйл л илгээдэг; туршилтын үед хэдэн минут хүлээх хэрэгтэй байж болно.

### 4. Байршуулах (Vercel)

1. Кодоо GitHub руу push хийнэ.
2. [vercel.com](https://vercel.com) → **Add New Project** → repository-г сонгоно (Framework: Vite).
3. **Environment Variables**-д `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`-г нэмнэ → **Deploy**.
4. Гарсан хаягаа Supabase **Site URL / Redirect URLs**-д нэмнэ.

Netlify: Build command `npm run build`, Publish directory `dist`. `public/_redirects` SPA routing-ийг шийднэ.

## Аюулгүй байдал

- **RLS** бүх хүснэгтэд идэвхтэй. Бүтээгч зөвхөн `creator_id = auth.uid()` мөрийг өөрчилнө; бусад агуулгыг зөвхөн админ.
- `protect_profile_role` триггер — энгийн хэрэглэгч өөрийгөө админ болгож чадахгүй.
- `exhibits_before_update` триггер — үзмэрийн эзэмшигчийг бусдын нэр рүү шилжүүлэхийг хориглоно.
- **Storage** — хэрэглэгч зөвхөн `<өөрийн uid>/…` хавтас руу бичнэ; 5 MB, зөвхөн зураг.
- Frontend-д зөвхөн **anon** түлхүүр. `service_role` түлхүүр кодонд байхгүй, `.env` нь `.gitignore`-д.
- Бүх RLS бодлогыг PostgreSQL 16 дээр Supabase-ийн `auth`/`storage` орчныг дуурайлган туршсан: зочин бичих, хэрэглэгч бусдын үзмэр/профайл засах, өөрийгөө админ болгох, бусдын хавтаст файл оруулах, эзэмшигч шилжүүлэх — бүгд татгалзагдсан; эзэмшигч ба админы зөвшөөрөгдсөн үйлдэл амжилттай.

Дэлгэрэнгүй: [`docs/ERD.md`](docs/ERD.md)

## Зургууд

- Time Machine болон үзэсгэлэнгийн зургууд `public/museum/*.svg` — сэдэвт тохирсон **чимэглэл** (бодит гэрэл зураг биш), `scripts/make_illustrations.py`-аар үүсгэсэн. Сайттайгаа хамт байршдаг тул нэмэлт тохиргоо хэрэггүй.
- 2022 оны магадлан итгэмжлэлийн зураг — [ufe.edu.mn](https://ufe.edu.mn/widgetDetail/277)-ийн албан ёсны мэдээний зураг.
- Бодит гэрэл зураг гарвал Админ хэсгээс солино — бодит зураг оруулсан мөрийг migration дахин ажиллуулсан ч дарж бичихгүй.

## Өгөгдлийн эх сурвалж

Seed өгөгдлийг нийтэд нээлттэй дараах эх сурвалжаас цуглуулав (2026.11):

- [ufe.edu.mn — "Мэдээллийн систем" хөтөлбөрийн магадлан итгэмжлэл](https://ufe.edu.mn/widgetDetail/277) — 2005, 2022 оны үйл явдал, хөтөлбөрийн шинэчлэл
- [network.mn — СЭЗИС-ийн танилцуулга](https://network.mn/product/678) — 1964 оны кабинет, 2010 оны нэр өөрчлөлт, ACBSP
- [online.ufe.edu.mn — МСМ тэнхимийн хичээлүүд](https://online.ufe.edu.mn/course/index.php?categoryid=20) — багш нар, хичээлийн код
- [ufe.edu.mn/c/11 — Эрдмийн зөвлөл](https://ufe.edu.mn/c/11), [repository.ufe.edu.mn](https://repository.ufe.edu.mn/xmlui/handle/8524/3634), [100.ufe.mn](https://100.ufe.mn/contact), [Википедиа](https://mn.wikipedia.org/wiki/Санхүү_Эдийн_Засгийн_Их_Сургууль)

> ℹ️ `infosys.ufe.edu.mn` нь оюутны нэвтрэх систем (нэвтрэх шаардлагатай) тул тэндээс нийтийн мэдээлэл авах боломжгүй.

**Анхааруулга:** seed-д `※` тэмдэгтэй албан тушаал, огноог тэнхимээс баталгаажуулж засна уу. Багш, оюутны **зургийг зөвшөөрөл авсны дараа** л оруулна — зураггүй үед апп нэрийн эхний үсгээр дүрс үүсгэнэ.

## Хөгжүүлэлтийн төлөвлөгөө (commit-ийн дараалал)

| Өдөр | Ажил | Жишээ commit |
|---|---|---|
| 1–2 | Шаардлага, wireframe, ERD | `docs: add ERD and wireframes` |
| 3–4 | Vite + React, Layout, хуудсууд | `feat: layout, routing and exhibit cards` |
| 5–6 | Supabase схем, Auth, Storage, RLS | `feat(db): schema, RLS policies and storage bucket` |
| 7–8 | CRUD, зураг, хайлт, шүүлтүүр | `feat: exhibit CRUD with image upload and search` |
| 9–10 | Багш, цомог, Time Machine | `feat: ISM Time Machine timeline` |
| 11–12 | Тест, responsive, алдаа засвар | `fix: mobile nav and empty states` |
| 13 | README, байршуулалт | `docs: README and deploy instructions` |
| 14 | Demo, хамгаалалт | `chore: final polish` |

## Зохиогч

**[Таны нэр]** · [Оюутны код] · СЭЗИС, Мэдээллийн системийн менежментийн тэнхим
