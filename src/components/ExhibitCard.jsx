import { Link } from 'react-router-dom';
import { hueFrom } from '../lib/format';

export function ExhibitCover({ exhibit, className = 'card__media' }) {
  if (exhibit.image_url) {
    return <img className={className} src={exhibit.image_url} alt={exhibit.title} loading="lazy" />;
  }
  const hue = hueFrom(exhibit.title);
  return (
    <div
      className={`${className} card__media--placeholder`}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 32%), hsl(${(hue + 50) % 360} 65% 22%))`,
      }}
      aria-hidden="true"
    >
      <span>{exhibit.year_created ?? '—'}</span>
    </div>
  );
}

export default function ExhibitCard({ exhibit }) {
  const author = exhibit.creator?.display_name || exhibit.creator_name || 'Тодорхойгүй';
  const statusLabel = { draft: 'Ноорог', pending: 'Хянагдаж буй', archived: 'Архив' }[exhibit.status];

  return (
    <Link to={`/exhibits/${exhibit.id}`} className="card exhibit-card">
      <ExhibitCover exhibit={exhibit} />
      <div className="card__body">
        <div className="card__meta">
          {exhibit.category?.name && <span className="tag">{exhibit.category.name}</span>}
          {statusLabel && <span className="tag tag--warn">{statusLabel}</span>}
        </div>
        <h3 className="card__title">{exhibit.title}</h3>
        <p className="card__sub">
          {author}
          {exhibit.year_created ? ` · ${exhibit.year_created}` : ''}
        </p>
        {exhibit.technology_stack?.length > 0 && (
          <div className="chips">
            {exhibit.technology_stack.slice(0, 4).map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
