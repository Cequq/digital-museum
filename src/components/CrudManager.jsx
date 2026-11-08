import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { removeImageByUrl, uploadImage } from '../lib/storage';
import { parseList } from '../lib/format';
import { useAuth } from '../context/AuthContext';
import ImageUpload from './ImageUpload';
import Loader from './Loader';

/**
 * Админы ерөнхий CRUD удирдлага.
 * fields: [{ name, label, type: 'text'|'textarea'|'number'|'date'|'list'|'image', required, folder }]
 * Хамгаалалтыг RLS хийнэ: админ биш хэрэглэгч энэ хүсэлтийг илгээсэн ч өгөгдлийн сан татгалзана.
 */
export default function CrudManager({ table, fields, order = 'created_at', ascending = false, title, renderRow, renderExtra }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (шинэ) | row
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase.from(table).select('*').order(order, { ascending });
    if (err) setError(err.message);
    setRows(data ?? []);
    setLoading(false);
  }, [table, order, ascending]);

  useEffect(() => { load(); }, [load]);

  function startEdit(row) {
    setError('');
    setFiles({});
    setEditing(row);
    const v = {};
    fields.forEach((f) => {
      const raw = row?.[f.name];
      v[f.name] = f.type === 'list' ? (raw ?? []).join(', ') : raw ?? '';
    });
    setValues(v);
  }

  async function save(e) {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(values[f.name] ?? '').trim());
    if (missing) {
      setError(`"${missing.label}" талбарыг бөглөнө үү.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {};
      const oldImages = [];
      for (const f of fields) {
        const v = values[f.name];
        if (f.type === 'image') {
          if (files[f.name]) {
            payload[f.name] = await uploadImage(files[f.name], user.id, f.folder || table);
            if (editing?.[f.name]) oldImages.push(editing[f.name]);
          } else if (files[f.name] === null) {
            payload[f.name] = null;
            if (editing?.[f.name]) oldImages.push(editing[f.name]);
          } else {
            // Файл сонгоогүй бол URL талбарын утгыг хадгална (жишээ: мэдээний зургийн холбоос)
            const next = String(v ?? '').trim() || null;
            payload[f.name] = next;
            if (editing?.[f.name] && editing[f.name] !== next) oldImages.push(editing[f.name]);
          }
        } else if (f.type === 'list') payload[f.name] = parseList(v);
        else if (f.type === 'number') payload[f.name] = v === '' ? null : Number(v);
        else payload[f.name] = typeof v === 'string' ? v.trim() || null : v;
      }
      const res = editing?.id
        ? await supabase.from(table).update(payload).eq('id', editing.id)
        : await supabase.from(table).insert(payload);
      if (res.error) throw res.error;
      await Promise.all(oldImages.map(removeImageByUrl));
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(row) {
    if (!window.confirm('Энэ бичлэгийг устгах уу?')) return;
    const { error: err } = await supabase.from(table).delete().eq('id', row.id);
    if (err) {
      setError(err.message);
      return;
    }
    await Promise.all(fields.filter((f) => f.type === 'image').map((f) => removeImageByUrl(row[f.name])));
    load();
  }

  return (
    <div className="crud">
      <div className="crud__head">
        <h2 className="h3">{title} <span className="muted">({rows.length})</span></h2>
        <button className="btn btn--primary btn--sm" onClick={() => startEdit({})}>+ Шинээр нэмэх</button>
      </div>
      {error && !editing && <div className="notice notice--error">{error}</div>}

      {editing && (
        <form className="form crud__form" onSubmit={save}>
          <h3 className="h4">{editing.id ? 'Засах' : 'Шинэ бичлэг'}</h3>
          {error && <div className="notice notice--error">{error}</div>}
          {fields.map((f) => {
            if (f.type === 'image') {
              return (
                <div key={f.name} className="field-group">
                  <ImageUpload label={f.label} currentUrl={files[f.name] === undefined ? values[f.name] : editing[f.name]}
                    onFileChange={(file) => setFiles((s) => ({ ...s, [f.name]: file }))}
                    onRemove={() => {
                      setFiles((s) => ({ ...s, [f.name]: null }));
                      setValues((s) => ({ ...s, [f.name]: '' }));
                    }} />
                  {!files[f.name] && (
                    <input className="input input--sm" type="url" placeholder="…эсвэл зургийн шууд URL (https://…/зураг.jpg)"
                      value={values[f.name] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValues((s) => ({ ...s, [f.name]: val }));
                        setFiles((s) => { const n = { ...s }; delete n[f.name]; return n; });
                      }} />
                  )}
                </div>
              );
            }
            const common = {
              className: 'input',
              value: values[f.name] ?? '',
              onChange: (e) => setValues((s) => ({ ...s, [f.name]: e.target.value })),
            };
            return (
              <label key={f.name} className="field">
                <span className="field__label">{f.label}{f.required ? ' *' : ''}</span>
                {f.type === 'textarea' ? <textarea rows={4} {...common} />
                  : <input type={f.type === 'list' ? 'text' : f.type || 'text'} {...common}
                      placeholder={f.type === 'list' ? 'Таслалаар тусгаарлана' : f.placeholder} />}
              </label>
            );
          })}
          <div className="form__actions">
            <button className="btn btn--primary btn--sm" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button>
            <button type="button" className="btn btn--text btn--sm" onClick={() => setEditing(null)}>Болих</button>
          </div>
        </form>
      )}

      {loading ? <Loader /> : (
        <ul className="crud__list">
          {rows.map((row) => (
            <li key={row.id} className="crud__row">
              <div className="crud__main">{renderRow(row)}</div>
              <div className="crud__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => startEdit(row)}>Засах</button>
                <button className="btn btn--danger btn--sm" onClick={() => remove(row)}>Устгах</button>
              </div>
              {renderExtra?.(row)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
