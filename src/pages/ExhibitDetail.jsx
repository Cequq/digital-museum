import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EXHIBIT_SELECT } from '../lib/queries';
import { removeImageByUrl } from '../lib/storage';
import { formatDate } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import { ExhibitCover } from '../components/ExhibitCard';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function ExhibitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [exhibit, setExhibit] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from('exhibits')
      .select(EXHIBIT_SELECT)
      .eq('id', id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!active) return;
        setExhibit(data);
        setLoading(false);
        if (data?.category_id) {
          const { data: rel } = await supabase
            .from('exhibits')
            .select('id, title, year_created')
            .eq('status', 'published')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          if (active) setRelated(rel ?? []);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader />;
  if (!exhibit) {
    return (
      <div className="container section">
        <EmptyState title="Үзмэр олдсонгүй" action={<Link to="/exhibits" className="btn btn--primary btn--sm">Үзэсгэлэн рүү буцах</Link>}>
          Устгагдсан эсвэл танд харах эрхгүй үзмэр байж болно.
        </EmptyState>
      </div>
    );
  }

  const canEdit = user && (exhibit.creator_id === user.id || isAdmin);

  async function handleDelete() {
    if (!window.confirm(`"${exhibit.title}" үзмэрийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    setDeleting(true);
    const { error: err } = await supabase.from('exhibits').delete().eq('id', exhibit.id);
    if (err) {
      setError(err.message);
      setDeleting(false);
      return;
    }
    await removeImageByUrl(exhibit.image_url);
    navigate('/my-exhibits');
  }

  return (
    <article className="container section detail">
      <Link to="/exhibits" className="link-back">← Үзэсгэлэн</Link>

      <div className="detail__grid">
        <div className="detail__media">
          <ExhibitCover exhibit={exhibit} className="detail__image" />
        </div>

        <div className="detail__info">
          <div className="card__meta">
            {exhibit.category?.name && (
              <Link to={`/exhibits?category=${exhibit.category.id}`} className="tag">{exhibit.category.name}</Link>
            )}
            {exhibit.status !== 'published' && <span className="tag tag--warn">{exhibit.status}</span>}
          </div>
          <h1>{exhibit.title}</h1>

          <dl className="facts">
            <div>
              <dt>Зохиогч</dt>
              <dd>
                {exhibit.creator ? (
                  <Link to={`/creators/${exhibit.creator.id}`} className="author">
                    <Avatar name={exhibit.creator.display_name} src={exhibit.creator.avatar_url} size={28} />
                    {exhibit.creator.display_name}
                  </Link>
                ) : (
                  exhibit.creator_name || 'Тодорхойгүй'
                )}
              </dd>
            </div>
            <div>
              <dt>Он</dt>
              <dd>{exhibit.year_created ?? '—'}</dd>
            </div>
            <div>
              <dt>Нэмэгдсэн</dt>
              <dd>{formatDate(exhibit.created_at)}</dd>
            </div>
          </dl>

          {exhibit.technology_stack?.length > 0 && (
            <div className="detail__block">
              <h3>Ашигласан технологи</h3>
              <div className="chips">
                {exhibit.technology_stack.map((t) => (
                  <Link key={t} to={`/exhibits?tech=${encodeURIComponent(t)}`} className="chip">{t}</Link>
                ))}
              </div>
            </div>
          )}

          <div className="detail__block">
            <h3>Тайлбар</h3>
            <p className="prose">{exhibit.description || 'Тайлбар оруулаагүй байна.'}</p>
          </div>

          <div className="detail__actions">
            {exhibit.demo_url && (
              <a href={exhibit.demo_url} target="_blank" rel="noreferrer" className="btn btn--primary">Demo / эх сурвалж ↗</a>
            )}
            {exhibit.github_url && (
              <a href={exhibit.github_url} target="_blank" rel="noreferrer" className="btn btn--ghost">GitHub ↗</a>
            )}
          </div>

          {canEdit && (
            <div className="owner-bar">
              <span>{isAdmin && exhibit.creator_id !== user.id ? 'Админ эрхээр' : 'Таны бүтээл'}</span>
              <Link to={`/exhibits/${exhibit.id}/edit`} className="btn btn--ghost btn--sm">Засах</Link>
              <button className="btn btn--danger btn--sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Устгаж байна…' : 'Устгах'}
              </button>
            </div>
          )}
          {error && <div className="notice notice--error">{error}</div>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2 className="h3">Ижил ангиллын бусад үзмэр</h2>
          <ul className="related">
            {related.map((r) => (
              <li key={r.id}>
                <Link to={`/exhibits/${r.id}`}>{r.title}</Link>
                <span className="muted">{r.year_created ?? ''}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
