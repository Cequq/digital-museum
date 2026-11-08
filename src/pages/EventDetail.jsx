import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/format';
import Loader from '../components/Loader';
import { SocialEmbed, SourceLink } from '../components/Social';
import { parseSocial } from '../lib/social';
import EmptyState from '../components/EmptyState';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(-1); // lightbox-ийн идэвхтэй зураг

  useEffect(() => {
    supabase
      .from('events')
      .select('*, photos:event_photos(id, image_url, caption, source_url, created_at)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  const photos = [...(event?.photos ?? [])].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  const close = useCallback(() => setActive(-1), []);
  const step = useCallback(
    (d) => setActive((i) => (i + d + photos.length) % photos.length),
    [photos.length],
  );

  useEffect(() => {
    if (active < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close, step]);

  if (loading) return <Loader />;
  if (!event) {
    return (
      <div className="container section">
        <EmptyState title="Арга хэмжээ олдсонгүй" action={<Link to="/events" className="btn btn--primary btn--sm">Буцах</Link>} />
      </div>
    );
  }

  return (
    <div className="container section">
      <Link to="/events" className="link-back">← Арга хэмжээ</Link>
      <div className="page-head">
        <span className="tag">{event.event_type}</span>
        <h1>{event.title}</h1>
        <p className="muted">{formatDate(event.event_date)}</p>
        {event.source_url && <SourceLink url={event.source_url} />}
      </div>
      {event.cover_image_url && <img className="event-cover" src={event.cover_image_url} alt={event.title} />}
      {event.description && <p className="prose lead">{event.description}</p>}

      <h2 className="h3">Зурагт цомог ({photos.length})</h2>
      {photos.length === 0 ? (
        <EmptyState title="Зураг оруулаагүй байна">Админ хэсгээс энэ арга хэмжээнд зураг нэмнэ.</EmptyState>
      ) : (
        <div className="gallery">
          {photos.map((p, i) => (
            <button key={p.id} className="gallery__item" onClick={() => setActive(i)}>
              <img src={p.image_url} alt={p.caption || event.title} loading="lazy" />
              {p.caption && <span>{p.caption}</span>}
              {p.source_url && (
                <i className={`gallery__src gallery__src--${parseSocial(p.source_url)?.platform}`}>
                  {parseSocial(p.source_url)?.label}
                </i>
              )}
            </button>
          ))}
        </div>
      )}

      {event.social_posts?.length > 0 && (
        <section className="section">
          <h2 className="h3">Сошиал сүлжээнд ({event.social_posts.length})</h2>
          <div className="embeds">
            {event.social_posts.map((url) => <SocialEmbed key={url} url={url} />)}
          </div>
        </section>
      )}

      {active >= 0 && photos[active] && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={close}>
          <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Өмнөх">‹</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={photos[active].image_url} alt={photos[active].caption || ''} />
            <figcaption>
              {photos[active].caption} <span>{active + 1} / {photos.length}</span>
              {(photos[active].source_url || event.source_url) && (
                <SourceLink url={photos[active].source_url || event.source_url} prefix="Зураг" className="lightbox__src" />
              )}
            </figcaption>
          </figure>
          <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Дараах">›</button>
          <button className="lightbox__close" onClick={close} aria-label="Хаах">×</button>
        </div>
      )}
    </div>
  );
}
