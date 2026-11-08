import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate, hueFrom } from '../lib/format';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('events')
      .select('*, photos:event_photos(image_url, created_at)')
      .order('event_date', { ascending: false })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  const types = useMemo(() => [...new Set(events.map((e) => e.event_type))], [events]);
  const filtered = events.filter(
    (e) =>
      (!type || e.event_type === type) &&
      (!search || `${e.title} ${e.description ?? ''}`.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="container section">
      <div className="page-head">
        <p className="eyebrow eyebrow--dark">Өдөрлөг · Семинар · Тэмцээн</p>
        <h1>Арга хэмжээ ба зурагт цомог</h1>
      </div>

      <div className="filters">
        <input className="input filters__search" type="search" placeholder="Арга хэмжээ хайх…"
          value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Арга хэмжээ хайх" />
        <div className="segmented" role="group" aria-label="Төрөл">
          <button className={!type ? 'is-active' : ''} onClick={() => setType('')}>Бүгд</button>
          {types.map((t) => (
            <button key={t} className={type === t ? 'is-active' : ''} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="Арга хэмжээ олдсонгүй">Хайлтын нөхцөлөө өөрчилж үзнэ үү.</EmptyState>
      ) : (
        <div className="grid">
          {filtered.map((ev) => {
            const hue = hueFrom(ev.title);
            const photoCount = ev.photos?.length ?? 0;
            const cover = ev.cover_image_url || ev.photos?.[0]?.image_url;
            return (
              <Link key={ev.id} to={`/events/${ev.id}`} className="card">
                {cover ? (
                  <img className="card__media" src={cover} alt={ev.title} loading="lazy" />
                ) : (
                  <div className="card__media card__media--placeholder"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 30%), hsl(${(hue + 40) % 360} 70% 20%))` }}>
                    <span>{new Date(ev.event_date).getFullYear()}</span>
                  </div>
                )}
                <div className="card__body">
                  <div className="card__meta"><span className="tag">{ev.event_type}</span></div>
                  <h3 className="card__title">{ev.title}</h3>
                  <p className="card__sub">{formatDate(ev.event_date)} · {photoCount} зураг</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
