import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate, hueFrom } from '../lib/format';
import { SourceLink } from '../components/Social';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import TimelinePhotoUploader from '../components/TimelinePhotoUploader';
import { useAuth } from '../context/AuthContext';
import { removeImageByUrl } from '../lib/storage';

/**
 * БҮТЭЭЛЧ ШИЙДЭЛ — ISM Time Machine
 * history_milestones + events + exhibits хүснэгтийг он-оор нэгтгэсэн интерактив он цагийн тэнхлэг.
 *
 *  • "Кино" горим (үндсэн): он бүр нэг слайд, хэвтээ чиглэлд зөөлөн гулсана
 *    (transform: translate3d + cubic-bezier, GPU-ээр зурагдана). Зураг дээр Ken Burns эффект.
 *  • ▶ Аялал: setTimeout-ийн гинжээр он солигдож, явцын шугам CSS animation-аар тасралтгүй дүүрнэ.
 *  • Доод "он цагийн зам" дээр одоогийн оныг заагч мөн зөөлөн гулсана; цэг дээр дарж үсэрнэ.
 *  • Гар (← →, зай), утсан дээр шудрах (swipe), гулсуураар удирдана.
 *  • "Жагсаалт" горим: босоо timeline, гүйлгэхэд он автоматаар шинэчлэгдэнэ (IntersectionObserver).
 */

const STEP_MS = 4500;

// /museum/*.svg — чимэглэл зураг: эх сурвалжийн холбоос оноохгүй (тэр сайтын зураг биш)
const isIllustration = (url) => typeof url === 'string' && url.startsWith('/museum/');
const img = (url, source) => (isIllustration(url) ? { url, source: null, illustration: true } : { url, source }); // нэг онд зарцуулах хугацаа (аялалын үед)

const TYPES = {
  milestone: { label: 'Түүх', icon: '◆' },
  event: { label: 'Арга хэмжээ', icon: '●' },
  exhibit: { label: 'Бүтээл', icon: '▲' },
};

function Poster({ year, seed }) {
  const hue = hueFrom(seed || String(year));
  return (
    <div
      className="tm-slide__poster"
      style={{ background: `radial-gradient(120% 90% at 20% 10%, hsl(${hue} 70% 38%), hsl(${(hue + 60) % 360} 70% 14%))` }}
      aria-hidden="true"
    >
      <span>{year}</span>
    </div>
  );
}

/**
 * Тухайн оны бүх зургийг (түүх, арга хэмжээний нүүр + цомог, бүтээл) зөөлөн crossfade-ээр ээлжлүүлнэ.
 * Слайд идэвхтэй үед л гүйнэ. Ачаалагдаагүй зургийг алгасна.
 */
function SlideGallery({ images, year, seed, active, interval, onDelete }) {
  const [failed, setFailed] = useState(() => new Set());
  const [cur, setCur] = useState(0);
  const list = images.filter((im) => !failed.has(im.url));

  useEffect(() => {
    if (!active) { setCur(0); return undefined; }
    if (list.length < 2) return undefined;
    const t = setInterval(() => setCur((c) => (c + 1) % list.length), interval);
    return () => clearInterval(t);
  }, [active, list.length, interval]);

  if (!list.length) return <Poster year={year} seed={seed} />;
  const shown = list[cur % list.length];
  return (
    <>
      {list.map((im, i) => (
        <img
          key={im.url}
          src={im.url}
          alt=""
          decoding="async"
          className={i === cur % list.length ? 'is-shown' : ''}
          onError={() => setFailed((f) => new Set(f).add(im.url))}
        />
      ))}
      {list.length > 1 && (
        <div className="tm-slide__dots" aria-hidden="true">
          {list.map((im, i) => <span key={im.url} className={i === cur % list.length ? 'is-on' : ''} />)}
        </div>
      )}
      {shown.source && <SourceLink url={shown.source} prefix="Зураг" className="tm-slide__credit" />}
      {shown.illustration && <span className="tm-slide__credit tm-slide__credit--art">Чимэглэл</span>}
      {onDelete && shown.photoId && (
        <button type="button" className="tm-slide__delete" onClick={() => onDelete(shown)}
          title="Энэ зургийг Time Machine-ээс устгах">🗑 Устгах</button>
      )}
    </>
  );
}

export default function TimeMachine() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState({ milestone: true, event: true, exhibit: true });
  const [view, setView] = useState('stage'); // 'stage' | 'list'
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [photos, setPhotos] = useState([]); // timeline_photos
  const { isAdmin } = useAuth();
  const groupRefs = useRef({});
  const touchX = useRef(null);
  const nowYear = new Date().getFullYear();

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase.from('timeline_photos').select('*').order('created_at');
    setPhotos(data ?? []);
  }, []);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  async function deletePhoto(im) {
    if (!window.confirm('Энэ зургийг Time Machine-ээс устгах уу?')) return;
    const { error } = await supabase.from('timeline_photos').delete().eq('id', im.photoId);
    if (error) { window.alert(error.message); return; }
    await removeImageByUrl(im.url);
    setPhotos((list) => list.filter((p) => p.id !== im.photoId));
  }

  useEffect(() => {
    (async () => {
      const [ms, ev, ex] = await Promise.all([
        supabase.from('history_milestones').select('*').order('year'),
        supabase
          .from('events')
          .select('id, title, event_date, event_type, description, cover_image_url, source_url, photos:event_photos(image_url, source_url, created_at)'),
        supabase
          .from('exhibits')
          .select('id, title, year_created, image_url, technology_stack, creator_name, creator:profiles(display_name)')
          .eq('status', 'published')
          .not('year_created', 'is', null),
      ]);
      setItems([
        ...(ms.data ?? []).map((m) => ({
          key: `m-${m.id}`, type: 'milestone', year: m.year, title: m.title,
          text: m.description, era: m.era, source: m.source_url, image: m.image_url,
          images: m.image_url ? [img(m.image_url, m.source_url)] : [],
        })),
        ...(ev.data ?? []).map((e) => ({
          key: `e-${e.id}`, type: 'event', year: new Date(e.event_date).getFullYear(), title: e.title,
          text: `${formatDate(e.event_date)} · ${e.event_type}`, link: `/events/${e.id}`,
          source: e.source_url, image: e.cover_image_url || e.photos?.[0]?.image_url || null,
          images: [
            ...(e.cover_image_url ? [img(e.cover_image_url, e.source_url)] : []),
            ...(e.photos ?? [])
              .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
              .map((p) => img(p.image_url, p.source_url || e.source_url)),
          ],
        })),
        ...(ex.data ?? []).map((x) => ({
          key: `x-${x.id}`, type: 'exhibit', year: x.year_created, title: x.title,
          text: x.creator?.display_name || x.creator_name || '', tech: x.technology_stack ?? [],
          link: `/exhibits/${x.id}`, image: x.image_url,
          images: x.image_url ? [img(x.image_url, null)] : [],
        })),
      ]);
      setLoading(false);
    })();
  }, []);

  const groups = useMemo(() => {
    const order = { milestone: 0, event: 1, exhibit: 2 };
    const map = new Map();
    items
      .filter((i) => enabled[i.type] && Number.isInteger(i.year))
      .sort((a, b) => a.year - b.year || order[a.type] - order[b.type])
      .forEach((item) => {
        if (!map.has(item.year)) map.set(item.year, []);
        map.get(item.year).push(item);
      });
    // Зөвхөн зурагтай онууд ч слайд болно
    photos.forEach((p) => { if (!map.has(p.year)) map.set(p.year, []); });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [items, enabled, photos]);

  const photosByYear = useMemo(() => {
    const m = {};
    photos.forEach((p) => {
      (m[p.year] ||= []).push({ url: p.image_url, source: p.source_url, photoId: p.id, caption: p.caption });
    });
    return m;
  }, [photos]);

  const years = groups.map(([y]) => y);
  const last = years.length - 1;
  const safeIndex = Math.min(index, Math.max(0, last));
  const currentYear = years[safeIndex];
  const minYear = years[0] ?? 0;
  const span = Math.max(1, (years[last] ?? 1) - minYear);
  const railPos = (y) => ((y - minYear) / span) * 100;

  useEffect(() => {
    if (index > last && last >= 0) setIndex(last);
  }, [index, last]);

  const currentEra = useMemo(() => {
    const ms = items.filter((i) => i.type === 'milestone' && i.era && i.year <= (currentYear ?? 0));
    return ms.length ? ms[ms.length - 1].era : null;
  }, [items, currentYear]);

  const techSoFar = useMemo(() => {
    const set = new Set();
    items.filter((i) => i.type === 'exhibit' && Number.isInteger(i.year) && i.year <= (currentYear ?? 0))
      .forEach((i) => i.tech.forEach((t) => set.add(t)));
    return [...set].slice(-8);
  }, [items, currentYear]);

  // Зураг оруулсны дараа: цомгийг дахин уншиж, тухайн он руу шилжинэ (шинэ он үүссэн байж болно)
  const [pendingYear, setPendingYear] = useState(null);
  const afterUpload = useCallback(async (y) => {
    await loadPhotos();
    setPlaying(false);
    setPendingYear(y);
  }, [loadPhotos]);
  useEffect(() => {
    if (pendingYear == null) return;
    const i = years.indexOf(pendingYear);
    if (i >= 0) setIndex(i);
    setPendingYear(null);
  }, [pendingYear, years]);

  const go = useCallback(
    (i) => {
      const next = Math.max(0, Math.min(last, i));
      setIndex(next);
      if (view === 'list') {
        groupRefs.current[years[next]]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [last, view, years],
  );

  // ▶ Аялал: он бүрт STEP_MS хүлээгээд дараагийн слайд руу
  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => {
      if (safeIndex >= last) setPlaying(false);
      else setIndex(safeIndex + 1);
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, safeIndex, last]);

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    setView('stage');
    if (safeIndex >= last) setIndex(0);
    setPlaying(true);
  }

  // Гарын товчлуур (кино горимд)
  useEffect(() => {
    if (view !== 'stage') return undefined;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { setPlaying(false); go(safeIndex + 1); }
      if (e.key === 'ArrowLeft') { setPlaying(false); go(safeIndex - 1); }
      if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Жагсаалт горимд гүйлгэхэд идэвхтэй оныг дагах
  useEffect(() => {
    if (view !== 'list' || !groups.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setIndex(years.indexOf(Number(entry.target.dataset.year)));
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Object.values(groupRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, groups]);

  function onTouchStart(e) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) { setPlaying(false); go(safeIndex + (dx < 0 ? 1 : -1)); }
  }

  if (loading) return <Loader />;

  const renderCard = (item, i, compact = false) => {
    const body = (
      <>
        {compact && item.image && <img className="tm-card__thumb" src={item.image} alt="" loading="lazy" />}
        <div>
          <span className={`tm__type tm__type--${item.type}`}>{TYPES[item.type].icon} {TYPES[item.type].label}</span>
          <h3>{item.title}</h3>
          {item.text && <p>{item.text}</p>}
          {item.tech?.length > 0 && (
            <div className="chips">{item.tech.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}</div>
          )}
          {item.source && <SourceLink url={item.source} className="tm__source" />}
        </div>
      </>
    );
    const cls = `tm-card tm__card tm__card--${item.type} ${compact && item.image ? 'tm-card--thumb' : ''}`;
    const style = { '--i': i };
    return item.link
      ? <Link key={item.key} to={item.link} className={cls} style={style}>{body}</Link>
      : <div key={item.key} className={cls} style={style}>{body}</div>;
  };

  return (
    <div className="tm">
      <section className="tm__hero">
        <div className="container">
          <p className="eyebrow">Бүтээлч шийдэл · ISM Time Machine</p>
          <h1>Цаг хугацаагаар аялах</h1>
          <p className="hero__lead">
            Тэнхимийн түүх, арга хэмжээ, оюутны бүтээлүүдийг он цагийн дарааллаар. “▶ Аялал эхлүүлэх”-ийг
            дарахад он бүр зураг, мэдээллийнхээ хамт хажуу тийш гулсаж солигдоно.
          </p>
        </div>
      </section>

      {groups.length === 0 ? (
        <div className="container section">
          <EmptyState title="Он цагийн мэдээлэл алга">Шүүлтүүрээ өөрчлөх эсвэл seed өгөгдлөө шалгана уу.</EmptyState>
        </div>
      ) : (
        <>
          <div className="tm__console">
            <div className="container tm__console-inner">
              <div className="tm__year" aria-live="polite">
                <span className="tm__year-num" key={currentYear}>{currentYear}</span>
                <span className="tm__year-sub">
                  {nowYear - currentYear} жилийн өмнө{currentEra ? ` · ${currentEra}` : ''}
                </span>
              </div>

              <div className="tm__controls">
                <button className="btn btn--ghost btn--sm" onClick={() => { setPlaying(false); go(safeIndex - 1); }}
                  disabled={safeIndex === 0} aria-label="Өмнөх он">‹</button>
                <input
                  type="range" min={0} max={last} value={safeIndex} className="tm__slider" aria-label="Он сонгох"
                  onChange={(e) => { setPlaying(false); go(Number(e.target.value)); }}
                />
                <button className="btn btn--ghost btn--sm" onClick={() => { setPlaying(false); go(safeIndex + 1); }}
                  disabled={safeIndex === last} aria-label="Дараах он">›</button>
                <button className="btn btn--primary btn--sm tm__play" onClick={togglePlay}>
                  {playing ? '❚❚ Зогсоох' : '▶ Аялал эхлүүлэх'}
                </button>
              </div>

              <div className="tm__filters">
                <div className="segmented segmented--sm" role="group" aria-label="Харагдац">
                  <button className={view === 'stage' ? 'is-active' : ''} onClick={() => setView('stage')}>⇆ Кино</button>
                  <button className={view === 'list' ? 'is-active' : ''} onClick={() => { setPlaying(false); setView('list'); }}>⇅ Жагсаалт</button>
                </div>
                {Object.entries(TYPES).map(([key, t]) => (
                  <label key={key} className={`tm__toggle tm__toggle--${key}`}>
                    <input type="checkbox" checked={enabled[key]}
                      onChange={() => setEnabled((s) => ({ ...s, [key]: !s[key] }))} />
                    <span>{t.icon} {t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {view === 'stage' ? (
            <div className="container tm-stage-wrap">
              <div className="tm-progress" aria-hidden="true">
                <span
                  key={`${currentYear}-${playing}`}
                  className={playing ? 'is-running' : ''}
                  style={{ animationDuration: `${STEP_MS}ms` }}
                />
              </div>

              <div className="tm-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <div className="tm-stage__track" style={{ transform: `translate3d(${-safeIndex * 100}%, 0, 0)` }}>
                  {groups.map(([year, list], i) => {
                    const gallery = [...(photosByYear[year] ?? []), ...list.flatMap((it) => it.images)].filter(
                      (im, k, arr) => arr.findIndex((x) => x.url === im.url) === k,
                    );
                    const headline = list.find((it) => it.type === 'milestone') || list[0]
                      || { title: photosByYear[year]?.find((p) => p.caption)?.caption || 'Тэнхимийн дурсамж' };
                    const active = i === safeIndex;
                    return (
                      <section key={year} className={`tm-slide ${active ? 'is-active' : ''}`}
                        aria-hidden={!active} aria-label={`${year} он`}>
                        <div className="tm-slide__media">
                          {Math.abs(i - safeIndex) <= 1
                            ? <SlideGallery images={gallery} year={year} seed={headline.title} active={active}
                                onDelete={isAdmin ? deletePhoto : undefined}
                                interval={Math.max(1400, Math.floor(STEP_MS / Math.max(1, Math.min(gallery.length, 3))))} />
                            : <Poster year={year} seed={headline.title} />}
                          <div className="tm-slide__shade" />
                          <div className="tm-slide__caption">
                            <span className="tm-slide__year">{year}</span>
                            <span className="tm-slide__headline">{headline.title}</span>
                          </div>
                        </div>
                        <div className="tm-slide__content">
                          {list.map((item, k) => renderCard(item, k, false))}
                          {list.length === 0 && (
                            <p className="muted">Энэ оны зургууд. {photosByYear[year]?.length ?? 0} зураг.</p>
                          )}
                          {isAdmin && active && (
                            <TimelinePhotoUploader key={year} year={year} compact onUploaded={afterUpload} />
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>

                <button className="tm-stage__nav tm-stage__nav--prev" onClick={() => { setPlaying(false); go(safeIndex - 1); }}
                  disabled={safeIndex === 0} aria-label="Өмнөх он">‹</button>
                <button className="tm-stage__nav tm-stage__nav--next" onClick={() => { setPlaying(false); go(safeIndex + 1); }}
                  disabled={safeIndex === last} aria-label="Дараах он">›</button>
              </div>

              <div className="tm-rail" role="tablist" aria-label="Он цагийн зам">
                <div className="tm-rail__line" />
                <div className="tm-rail__fill" style={{ width: `${railPos(currentYear)}%` }} />
                {years.map((y, i) => (
                  <button key={y} role="tab" aria-selected={i === safeIndex} title={String(y)}
                    className={`tm-rail__dot ${i <= safeIndex ? 'is-past' : ''}`}
                    style={{ left: `${railPos(y)}%` }}
                    onClick={() => { setPlaying(false); go(i); }} />
                ))}
                <div className="tm-rail__pin" style={{ left: `${railPos(currentYear)}%` }}>{currentYear}</div>
                <span className="tm-rail__end tm-rail__end--start">{years[0]}</span>
                <span className="tm-rail__end tm-rail__end--end">{years[last]}</span>
              </div>

              <div className="tm-meta">
                <div>
                  <h3>Он хүртэлх технологи</h3>
                  {techSoFar.length
                    ? <div className="chips">{techSoFar.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                    : <p className="muted">Энэ хүртэл бүтээлийн технологи бүртгэгдээгүй.</p>}
                </div>
                <ul className="tm__counts">
                  {Object.entries(TYPES).map(([key, t]) => (
                    <li key={key}><span>{t.icon} {t.label}</span>
                      <b>{items.filter((it) => it.type === key && it.year <= currentYear).length}</b></li>
                  ))}
                </ul>
              </div>
              <p className="footnote">Зөвлөмж: ← → товч, эсвэл утсан дээр хуруугаараа шударч он солино.</p>
            </div>
          ) : (
            <div className="container tm__body">
              <ol className="tm__line">
                {groups.map(([year, list], i) => (
                  <li key={year} data-year={year} ref={(el) => { groupRefs.current[year] = el; }}
                    className={`tm__group ${i === safeIndex ? 'is-current' : ''} ${i > safeIndex ? 'is-future' : ''}`}>
                    <button className="tm__marker" onClick={() => go(i)}>{year}</button>
                    <div className="tm__cards">{list.map((item, k) => renderCard(item, k, true))}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}
