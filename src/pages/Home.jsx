import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { EXHIBIT_SELECT } from '../lib/queries';
import ExhibitCard from '../components/ExhibitCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

// 1964 — "Механикжсан цахилгаан тооцооны хичээлийн кабинет" (тэнхимийн суурь)
const DEPARTMENT_FOUNDED = 1964;

async function count(table, filter) {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

export default function Home() {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [exhibits, teachers, events, creators, latestRes, msRes] = await Promise.all([
        count('exhibits', (q) => q.eq('status', 'published')),
        count('teachers'),
        count('events'),
        count('profiles'),
        supabase
          .from('exhibits')
          .select(EXHIBIT_SELECT)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6),
        supabase.from('history_milestones').select('id, year, title').order('year'),
      ]);
      if (!active) return;
      setStats({ exhibits, teachers, events, creators });
      setLatest(latestRes.data ?? []);
      setMilestones(msRes.data ?? []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);


  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">СЭЗИС · Мэдээллийн системийн менежментийн тэнхим</p>
          <h1>
            {new Date().getFullYear() - DEPARTMENT_FOUNDED} жилийн түүх,
            <br />
            <em>нэг дижитал музейд.</em>
          </h1>
          <p className="hero__lead">
            1964 оны тооцоолох машины кабинетаас өнөөгийн AI, блокчэйн, мобайл төслүүд хүртэл —
            тэнхимийн түүх, багш нар, арга хэмжээ, оюутнуудын бүтээлийг интерактив байдлаар үзээрэй.
          </p>
          <div className="hero__actions">
            <Link to="/time-machine" className="btn btn--light">Time Machine-ээр аялах →</Link>
            <Link to="/exhibits" className="btn btn--outline-light">Үзэсгэлэн үзэх</Link>
          </div>
        </div>
        {milestones.length > 0 && (
          <div className="hero__ribbon" aria-hidden="true">
            <div className="hero__ribbon-track">
              {[...milestones, ...milestones].map((m, i) => (
                <span key={`${m.id}-${i}`}>
                  <b>{m.year}</b> {m.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="container section">
        {loading ? (
          <Loader />
        ) : (
          <div className="stats">
            <Link to="/exhibits" className="stat"><b>{stats.exhibits}</b><span>Үзмэр</span></Link>
            <Link to="/teachers" className="stat"><b>{stats.teachers}</b><span>Багш</span></Link>
            <Link to="/events" className="stat"><b>{stats.events}</b><span>Арга хэмжээ</span></Link>
            <Link to="/creators" className="stat"><b>{stats.creators}</b><span>Бүтээгч</span></Link>
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section__head">
          <div>
            <p className="eyebrow eyebrow--dark">Шинэ үзмэр</p>
            <h2>Сүүлд нэмэгдсэн бүтээлүүд</h2>
          </div>
          <Link to="/exhibits" className="link-arrow">Бүгдийг харах →</Link>
        </div>
        {loading ? (
          <Loader />
        ) : latest.length === 0 ? (
          <EmptyState title="Одоогоор үзмэр алга">
            Supabase дээр seed.sql-ийг ажиллуулсан эсэхээ шалгана уу.
          </EmptyState>
        ) : (
          <div className="grid">
            {latest.map((ex) => <ExhibitCard key={ex.id} exhibit={ex} />)}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="promo">
          <div>
            <p className="eyebrow eyebrow--dark">ISM Creators</p>
            <h2>Өөрийн бүтээлээ музейд үлдээ</h2>
            <p>
              Бүртгүүлээд төслийнхөө зураг, тайлбар, GitHub болон demo холбоосыг нэмээрэй.
              Таны бүтээл ирээдүйн оюутнуудад тэнхимийн түүхийн нэг хэсэг болно.
            </p>
          </div>
          <Link to="/exhibits/new" className="btn btn--primary">Бүтээл нэмэх</Link>
        </div>
      </section>
    </>
  );
}
