import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EXHIBIT_SELECT } from '../lib/queries';
import { useAuth } from '../context/AuthContext';
import ExhibitCard from '../components/ExhibitCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function MyExhibits() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('exhibits')
      .select(EXHIBIT_SELECT)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <div className="container section">
      <div className="section__head">
        <div>
          <p className="eyebrow eyebrow--dark">Бүтээгчийн самбар</p>
          <h1>Миний бүтээлүүд</h1>
        </div>
        <Link to="/exhibits/new" className="btn btn--primary">+ Шинэ бүтээл</Link>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title="Та одоогоор бүтээл нэмээгүй байна"
          action={<Link to="/exhibits/new" className="btn btn--primary btn--sm">Анхны бүтээлээ нэмэх</Link>}
        >
          Төслийнхөө зураг, тайлбар, холбоосыг оруулаад музейн нэг хэсэг болоорой.
        </EmptyState>
      ) : (
        <div className="grid">
          {items.map((ex) => <ExhibitCard key={ex.id} exhibit={ex} />)}
        </div>
      )}
    </div>
  );
}
