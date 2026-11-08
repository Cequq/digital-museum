import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EXHIBIT_SELECT } from '../lib/queries';
import { formatDate } from '../lib/format';
import Avatar from '../components/Avatar';
import ExhibitCard from '../components/ExhibitCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function CreatorDetail() {
  const { id } = useParams();
  const [creator, setCreator] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id, display_name, avatar_url, bio, created_at').eq('id', id).maybeSingle(),
      supabase.from('exhibits').select(EXHIBIT_SELECT).eq('creator_id', id).eq('status', 'published')
        .order('year_created', { ascending: false }),
    ]).then(([p, w]) => {
      setCreator(p.data);
      setWorks(w.data ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <Loader />;
  if (!creator) {
    return (
      <div className="container section">
        <EmptyState title="Бүтээгч олдсонгүй" action={<Link to="/creators" className="btn btn--primary btn--sm">Буцах</Link>} />
      </div>
    );
  }

  const techs = [...new Set(works.flatMap((w) => w.technology_stack ?? []))];

  return (
    <div className="container section">
      <Link to="/creators" className="link-back">← ISM Creators</Link>
      <div className="creator-head">
        <Avatar name={creator.display_name} src={creator.avatar_url} size={112} />
        <div>
          <h1>{creator.display_name}</h1>
          <p className="muted">{formatDate(creator.created_at)}-с хойш музейн бүтээгч · {works.length} бүтээл</p>
          {creator.bio && <p className="prose">{creator.bio}</p>}
          {techs.length > 0 && (
            <div className="chips">{techs.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          )}
        </div>
      </div>

      <h2 className="h3">Бүтээлүүд</h2>
      {works.length === 0 ? (
        <EmptyState title="Нийтлэгдсэн бүтээл алга" />
      ) : (
        <div className="grid">{works.map((w) => <ExhibitCard key={w.id} exhibit={w} />)}</div>
      )}
    </div>
  );
}
