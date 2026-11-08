import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EXHIBIT_SELECT } from '../lib/queries';
import ExhibitCard from '../components/ExhibitCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

// PostgREST-ийн .or() шүүлтүүрийг эвдэх тэмдэгтүүдийг арилгана
const sanitize = (s) => s.replace(/[,()%*\\]/g, ' ').trim();

export default function Exhibits() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const year = params.get('year') ?? '';
  const tech = params.get('tech') ?? '';
  const sort = params.get('sort') ?? 'newest';

  const [searchInput, setSearchInput] = useState(q);
  const [categories, setCategories] = useState([]);
  const [facetRows, setFacetRows] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  // Шүүлтүүрийн сонголтууд (ангилал, он, технологи)
  useEffect(() => {
    supabase.from('exhibition_categories').select('id, name').order('name')
      .then(({ data }) => setCategories(data ?? []));
    supabase.from('exhibits').select('year_created, technology_stack').eq('status', 'published')
      .then(({ data }) => setFacetRows(data ?? []));
  }, []);

  const years = useMemo(
    () => [...new Set(facetRows.map((r) => r.year_created).filter(Boolean))].sort((a, b) => b - a),
    [facetRows],
  );
  const techs = useMemo(
    () => [...new Set(facetRows.flatMap((r) => r.technology_stack ?? []))].sort((a, b) => a.localeCompare(b)),
    [facetRows],
  );

  // Хайлтын талбарыг 350мс хойшлуулж URL-д бичнэ (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== q) setParam('q', searchInput);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Сервер талд шүүх
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    let query = supabase.from('exhibits').select(EXHIBIT_SELECT).eq('status', 'published');
    const term = sanitize(q);
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,creator_name.ilike.%${term}%`,
      );
    }
    if (category) query = query.eq('category_id', Number(category));
    if (year) query = query.eq('year_created', Number(year));
    if (tech) query = query.contains('technology_stack', [tech]);

    if (sort === 'oldest') query = query.order('year_created', { ascending: true, nullsFirst: false });
    else if (sort === 'title') query = query.order('title');
    else query = query.order('created_at', { ascending: false });

    query.then(({ data, error: err }) => {
      if (!active) return;
      if (err) setError(err.message);
      setItems(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [q, category, year, tech, sort]);

  const hasFilters = q || category || year || tech;

  return (
    <div className="container section">
      <div className="page-head">
        <p className="eyebrow eyebrow--dark">Дижитал үзэсгэлэн</p>
        <h1>Үзмэр ба бүтээлүүд</h1>
        <p className="muted">Нэр, он, ангилал эсвэл технологиор хайж шүүнэ үү.</p>
      </div>

      <div className="filters" role="search">
        <input
          className="input filters__search"
          type="search"
          placeholder="Нэр, тайлбар, зохиогчоор хайх…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Хайх"
        />
        <select className="input" value={category} onChange={(e) => setParam('category', e.target.value)} aria-label="Ангилал">
          <option value="">Бүх ангилал</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" value={year} onChange={(e) => setParam('year', e.target.value)} aria-label="Он">
          <option value="">Бүх он</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="input" value={tech} onChange={(e) => setParam('tech', e.target.value)} aria-label="Технологи">
          <option value="">Бүх технологи</option>
          {techs.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Эрэмбэ">
          <option value="newest">Шинээр нэмэгдсэн</option>
          <option value="oldest">Он (эртнээс)</option>
          <option value="title">Нэрээр (А-Я)</option>
        </select>
      </div>

      <div className="results-bar">
        <span>{loading ? 'Хайж байна…' : `${items.length} үзмэр олдлоо`}</span>
        {hasFilters && (
          <button
            className="btn btn--text btn--sm"
            onClick={() => {
              setSearchInput('');
              setParams({}, { replace: true });
            }}
          >
            Шүүлтүүр цэвэрлэх
          </button>
        )}
      </div>

      {error && <div className="notice notice--error">Алдаа: {error}</div>}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title="Таны хайлтад тохирох үзмэр олдсонгүй"
          action={<Link to="/exhibits/new" className="btn btn--primary btn--sm">Шинэ бүтээл нэмэх</Link>}
        >
          {q ? `"${q}" гэсэн үгээр илэрц алга. ` : ''}Өөр түлхүүр үг оролдох эсвэл шүүлтүүрээ цэвэрлэнэ үү.
        </EmptyState>
      ) : (
        <div className="grid">
          {items.map((ex) => <ExhibitCard key={ex.id} exhibit={ex} />)}
        </div>
      )}
    </div>
  );
}
