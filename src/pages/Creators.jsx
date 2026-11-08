import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Creators() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // profiles ← exhibits (creator_id FK) холбоогоор бүтээлийн тоог авна
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, bio, exhibits(count)')
      .eq('exhibits.status', 'published')
      .order('display_name')
      .then(({ data }) => {
        setCreators(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () => creators.filter((c) => c.display_name.toLowerCase().includes(search.toLowerCase())),
    [creators, search],
  );

  return (
    <div className="container section">
      <div className="page-head">
        <p className="eyebrow eyebrow--dark">ISM Creators</p>
        <h1>Бүтээгч оюутнууд</h1>
        <p className="muted">Оюутан бүрийн танилцуулга болон бүтээлүүд хоорондоо холбогдсон.</p>
      </div>

      <input className="input filters__search" type="search" placeholder="Бүтээгч хайх…"
        value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Бүтээгч хайх" />

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Бүтээгч олдсонгүй"
          action={<Link to="/register" className="btn btn--primary btn--sm">Анхны бүтээгч болох</Link>}
        >
          Бүртгүүлсэн оюутнууд энд харагдана.
        </EmptyState>
      ) : (
        <div className="grid grid--teachers">
          {filtered.map((c) => (
            <Link key={c.id} to={`/creators/${c.id}`} className="card teacher-card">
              <Avatar name={c.display_name} src={c.avatar_url} size={72} />
              <h3 className="card__title">{c.display_name}</h3>
              {c.bio && <p className="card__sub clamp-2">{c.bio}</p>}
              <p className="teacher-card__pos">{c.exhibits?.[0]?.count ?? 0} бүтээл</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
