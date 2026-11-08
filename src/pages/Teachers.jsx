import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase
      .from('teachers')
      .select('*')
      .order('sort_order')
      .order('name')
      .then(({ data }) => {
        setTeachers(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((t) =>
      [t.name, t.position, ...(t.courses ?? [])].join(' ').toLowerCase().includes(term),
    );
  }, [teachers, search]);

  return (
    <div className="container section">
      <div className="page-head">
        <p className="eyebrow eyebrow--dark">Хамт олон</p>
        <h1>Тэнхимийн багш нар</h1>
        <p className="muted">Багшийн нэр эсвэл заадаг хичээлээр хайна уу. Карт дээр дарж дэлгэрэнгүйг харна.</p>
      </div>

      <input
        className="input filters__search"
        type="search"
        placeholder="Жишээ: Өгөгдлийн сан, Python, Эрдэнэсайхан…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Багш хайх"
      />

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState title="Багш олдсонгүй">"{search}" гэсэн нэр, хичээлтэй багш бүртгэлгүй байна.</EmptyState>
      ) : (
        <div className="grid grid--teachers">
          {filtered.map((t) => (
            <button key={t.id} className="card teacher-card" onClick={() => setSelected(t)}>
              <Avatar name={t.name} src={t.photo_url} size={72} />
              <h3 className="card__title">{t.name}</h3>
              <p className="teacher-card__pos">{t.position}</p>
              <p className="card__sub">{(t.courses ?? []).length} хичээл</p>
            </button>
          ))}
        </div>
      )}

      <p className="footnote">※ тэмдэгтэй албан тушаалыг тэнхимийн албан мэдээллээр баталгаажуулж байна.</p>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={selected.name} onClick={() => setSelected(null)}>
          <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setSelected(null)} aria-label="Хаах">×</button>
            <div className="teacher-detail">
              <Avatar name={selected.name} src={selected.photo_url} size={96} />
              <div>
                <h2>{selected.name}</h2>
                <p className="teacher-card__pos">{selected.position}</p>
              </div>
            </div>
            {selected.bio && <p className="prose">{selected.bio}</p>}
            <h3 className="h4">Заадаг хичээлүүд</h3>
            <ul className="course-list">
              {(selected.courses ?? []).map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
