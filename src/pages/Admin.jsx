import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { removeImageByUrl, uploadImage } from '../lib/storage';
import { formatDate } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import CrudManager from '../components/CrudManager';
import TimelinePhotoUploader from '../components/TimelinePhotoUploader';
import { SourceLink } from '../components/Social';
import { parseSocial } from '../lib/social';
import Loader from '../components/Loader';

const TABS = [
  ['exhibits', 'Үзмэр хянах'],
  ['teachers', 'Багш нар'],
  ['events', 'Арга хэмжээ ба цомог'],
  ['timeline', 'Time Machine зураг'],
  ['history', 'Түүх (Time Machine)'],
  ['categories', 'Ангилал'],
];

// ---------- Үзмэрийн хяналт (бүх хэрэглэгчийн үзмэр) ----------
function ExhibitModeration() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('exhibits')
      .select('id, title, status, image_url, created_at, creator_name, creator:profiles(display_name)')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    setRows(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    const { error: err } = await supabase.from('exhibits').update({ status }).eq('id', id);
    if (err) setError(err.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function remove(row) {
    if (!window.confirm(`"${row.title}"-г устгах уу?`)) return;
    const { error: err } = await supabase.from('exhibits').delete().eq('id', row.id);
    if (err) return setError(err.message);
    await removeImageByUrl(row.image_url);
    return load();
  }

  if (loading) return <Loader />;
  return (
    <div className="crud">
      <h2 className="h3">Бүх үзмэр <span className="muted">({rows.length})</span></h2>
      {error && <div className="notice notice--error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Гарчиг</th><th>Зохиогч</th><th>Огноо</th><th>Төлөв</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/exhibits/${r.id}`}>{r.title}</Link></td>
                <td>{r.creator?.display_name || r.creator_name || '—'}</td>
                <td className="nowrap">{formatDate(r.created_at)}</td>
                <td>
                  <select className="input input--sm" value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}>
                    <option value="published">Нийтлэгдсэн</option>
                    <option value="pending">Хянагдаж буй</option>
                    <option value="draft">Ноорог</option>
                    <option value="archived">Архив</option>
                  </select>
                </td>
                <td><button className="btn btn--danger btn--sm" onClick={() => remove(r)}>Устгах</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Арга хэмжээний зурагт цомог ----------
function PhotoManager({ eventId }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('event_photos').select('*').eq('event_id', eventId).order('created_at');
    setPhotos(data ?? []);
  }, [eventId]);
  useEffect(() => { load(); }, [load]);

  async function handleFiles(e) {
    const list = [...(e.target.files ?? [])];
    if (!list.length) return;
    if (postUrl && !parseSocial(postUrl)) {
      setError('Постын холбоос буруу байна (https://www.instagram.com/p/… эсвэл https://www.facebook.com/…).');
      e.target.value = '';
      return;
    }
    setBusy(true);
    setError('');
    try {
      let n = 0;
      for (const file of list) {
        n += 1;
        setProgress(`${n}/${list.length}`);
        const url = await uploadImage(file, user.id, `events/${eventId}`);
        const { error: err } = await supabase.from('event_photos').insert({
          event_id: eventId,
          image_url: url,
          caption: caption.trim() || null,
          source_url: postUrl.trim() || null,
        });
        if (err) throw err;
      }
      setCaption('');
      e.target.value = '';
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  async function remove(photo) {
    const { error: err } = await supabase.from('event_photos').delete().eq('id', photo.id);
    if (err) return setError(err.message);
    await removeImageByUrl(photo.image_url);
    return load();
  }

  return (
    <div className="photo-manager">
      <p className="photo-manager__help">
        <b>Instagram / Facebook постоос зураг нэмэх:</b> 1) Постыг нээж зургийг нь хадгална (утсан дээр — screenshot эсвэл “Save”).
        2) Постын холбоосыг доор хуулна. 3) “Зураг нэмэх”-ээр хадгалсан зургуудаа нэг дор сонгоно — зураг бүр
        эх сурвалжийн тэмдэгтэй болж Time Machine болон цомогт гарна.
      </p>
      <div className="photo-manager__bar">
        <input className="input input--sm" type="url" placeholder="Постын холбоос: https://www.instagram.com/p/… эсвэл facebook.com/…"
          value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
        <input className="input input--sm" placeholder="Тайлбар (заавал биш)" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <label className="btn btn--primary btn--sm">
          {busy ? `Оруулж байна… ${progress}` : '+ Зураг нэмэх'}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleFiles} disabled={busy} />
        </label>
      </div>
      {postUrl && parseSocial(postUrl) && (
        <p className="muted small">Эх сурвалж: <SourceLink url={postUrl} prefix="" /></p>
      )}
      {error && <div className="notice notice--error">{error}</div>}
      <div className="thumbs">
        {photos.map((p) => (
          <figure key={p.id} className="thumb" title={p.source_url || ''}>
            <img src={p.image_url} alt={p.caption || ''} />
            {p.source_url && <span className={`thumb__src thumb__src--${parseSocial(p.source_url)?.platform}`}>{parseSocial(p.source_url)?.label?.[0]}</span>}
            <button onClick={() => remove(p)} aria-label="Зураг устгах">×</button>
          </figure>
        ))}
        {photos.length === 0 && <span className="muted">Цомогт зураг алга.</span>}
      </div>
    </div>
  );
}

// ---------- Time Machine-ий зургууд (он-оор) ----------
function TimelinePhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('timeline_photos').select('*')
      .order('year', { ascending: false }).order('created_at');
    if (err) setError(err.message);
    setPhotos(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(p) {
    if (!window.confirm('Зургийг устгах уу?')) return;
    const { error: err } = await supabase.from('timeline_photos').delete().eq('id', p.id);
    if (err) { setError(err.message); return; }
    await removeImageByUrl(p.image_url);
    load();
  }

  async function updateField(p, field, value) {
    const v = value.trim() || null;
    if (v === (p[field] ?? null)) return;
    const { error: err } = await supabase.from('timeline_photos').update({ [field]: v }).eq('id', p.id);
    if (err) setError(err.message); else load();
  }

  const byYear = photos.reduce((m, p) => { (m[p.year] ||= []).push(p); return m; }, {});

  return (
    <div className="crud">
      <p className="muted">
        Энд оруулсан зургууд <Link to="/time-machine">Time Machine</Link>-ий тухайн оны слайдад ээлжлэн гарна.
        Админаар нэвтэрсэн үед Time Machine хуудсан дээрх слайд бүрт мөн “📷 зураг нэмэх” товч гарна.
      </p>
      <TimelinePhotoUploader onUploaded={load} />
      {error && <div className="notice notice--error">{error}</div>}
      {loading ? <Loader /> : Object.keys(byYear).length === 0 ? (
        <p className="muted">Одоогоор зураг алга.</p>
      ) : (
        Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([year, list]) => (
          <section key={year} className="tl-year">
            <h3 className="h4">{year} <span className="muted">({list.length})</span></h3>
            <div className="tl-grid">
              {list.map((p) => (
                <figure key={p.id} className="tl-item">
                  <img src={p.image_url} alt={p.caption || ''} loading="lazy" />
                  <button className="tl-item__del" onClick={() => remove(p)} aria-label="Устгах">×</button>
                  <input className="input input--sm" defaultValue={p.caption ?? ''} placeholder="Тайлбар"
                    onBlur={(e) => updateField(p, 'caption', e.target.value)} />
                  <input className="input input--sm" defaultValue={p.source_url ?? ''} placeholder="Эх сурвалж (пост)"
                    onBlur={(e) => updateField(p, 'source_url', e.target.value)} />
                </figure>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('exhibits');
  const [openAlbum, setOpenAlbum] = useState(null);

  return (
    <div className="container section">
      <div className="page-head">
        <p className="eyebrow eyebrow--dark">Администратор</p>
        <h1>Агуулгын удирдлага</h1>
        <p className="muted">Нийтэд харагдах мэдээлэл, үзмэр, зурагт цомгийг эндээс хянана.</p>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'exhibits' && <ExhibitModeration />}

      {tab === 'timeline' && <TimelinePhotos />}

      {tab === 'teachers' && (
        <CrudManager
          table="teachers"
          title="Багш нар"
          order="sort_order"
          ascending
          fields={[
            { name: 'name', label: 'Нэр', required: true },
            { name: 'position', label: 'Албан тушаал', required: true },
            { name: 'courses', label: 'Заадаг хичээлүүд', type: 'list' },
            { name: 'bio', label: 'Товч танилцуулга', type: 'textarea' },
            { name: 'sort_order', label: 'Эрэмбэ', type: 'number' },
            { name: 'photo_url', label: 'Зураг (зөвшөөрөлтэй)', type: 'image', folder: 'teachers' },
          ]}
          renderRow={(t) => (<><b>{t.name}</b><span className="muted"> · {t.position}</span></>)}
        />
      )}

      {tab === 'events' && (
        <CrudManager
          table="events"
          title="Арга хэмжээ"
          order="event_date"
          fields={[
            { name: 'title', label: 'Нэр', required: true },
            { name: 'event_date', label: 'Огноо', type: 'date', required: true },
            { name: 'event_type', label: 'Төрөл', required: true, placeholder: 'Өдөрлөг / Семинар / Тэмцээн' },
            { name: 'description', label: 'Тайлбар', type: 'textarea' },
            { name: 'cover_image_url', label: 'Нүүр зураг', type: 'image', folder: 'events' },
            { name: 'source_url', label: 'Эх сурвалж (мэдээ / Facebook / Instagram пост)', type: 'url' },
            { name: 'social_posts', label: 'Embed хийх постууд (Instagram, Facebook, YouTube холбоос)', type: 'list' },
          ]}
          renderRow={(ev) => (
            <>
              <b>{ev.title}</b>
              <span className="muted"> · {formatDate(ev.event_date)} · {ev.event_type}</span>
              <button className="btn btn--text btn--sm" onClick={() => setOpenAlbum(openAlbum === ev.id ? null : ev.id)}>
                {openAlbum === ev.id ? 'Цомог хаах' : 'Зурагт цомог'}
              </button>
            </>
          )}
          renderExtra={(ev) => openAlbum === ev.id && <PhotoManager eventId={ev.id} />}
        />
      )}

      {tab === 'history' && (
        <CrudManager
          table="history_milestones"
          title="Түүхийн үе шат"
          order="year"
          ascending
          fields={[
            { name: 'year', label: 'Он', type: 'number', required: true },
            { name: 'era', label: 'Эрин (жишээ: Үүсэл, Дижитал эрин)' },
            { name: 'title', label: 'Гарчиг', required: true },
            { name: 'description', label: 'Тайлбар', type: 'textarea' },
            { name: 'image_url', label: 'Time Machine-ий зураг (постоос хадгалсан зураг эсвэл URL)', type: 'image', folder: 'history' },
            { name: 'source_url', label: 'Эх сурвалжийн холбоос (мэдээ / Instagram / Facebook пост)', type: 'url' },
          ]}
          renderRow={(m) => (<><b>{m.year}</b> · {m.title}</>)}
        />
      )}

      {tab === 'categories' && (
        <CrudManager
          table="exhibition_categories"
          title="Үзмэрийн ангилал"
          order="name"
          ascending
          fields={[
            { name: 'name', label: 'Нэр', required: true },
            { name: 'description', label: 'Тайлбар', type: 'textarea' },
          ]}
          renderRow={(c) => (<><b>{c.name}</b><span className="muted"> · {c.description}</span></>)}
        />
      )}
    </div>
  );
}
