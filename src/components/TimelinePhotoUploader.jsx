import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImage, validateImage } from '../lib/storage';
import { parseSocial } from '../lib/social';
import { useAuth } from '../context/AuthContext';

/**
 * Админ Time Machine-д зураг оруулах самбар.
 *  • year өгөгдсөн бол (слайд дээр) тухайн онд шууд оруулна.
 *  • year өгөгдөөгүй бол (Админ хуудсанд) он сонгох талбар гарна — шинэ он ч нэмж болно.
 * Зургийг Storage-д <uid>/timeline/<он>/ хавтаст хадгалж, timeline_photos-д бичнэ (RLS: зөвхөн админ).
 */
export default function TimelinePhotoUploader({ year: fixedYear, onUploaded, compact = false }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(!compact);
  const [year, setYear] = useState(fixedYear ?? new Date().getFullYear());
  const [postUrl, setPostUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [msg, setMsg] = useState(null);

  async function handleFiles(e) {
    const files = [...(e.target.files ?? [])];
    e.target.value = '';
    if (!files.length) return;

    const y = Number(fixedYear ?? year);
    if (!Number.isInteger(y) || y < 1900 || y > 2100) return setMsg({ type: 'error', text: 'Он 1900–2100 хооронд байна.' });
    if (postUrl && !parseSocial(postUrl)) return setMsg({ type: 'error', text: 'Постын холбоос https://-ээр эхэлнэ.' });
    const bad = files.map(validateImage).find(Boolean);
    if (bad) return setMsg({ type: 'error', text: bad });

    setBusy(true);
    setMsg(null);
    try {
      for (let i = 0; i < files.length; i += 1) {
        setProgress(`${i + 1}/${files.length}`);
        const url = await uploadImage(files[i], user.id, `timeline/${y}`);
        const { error } = await supabase.from('timeline_photos').insert({
          year: y,
          image_url: url,
          caption: caption.trim() || null,
          source_url: postUrl.trim() || null,
          created_by: user.id,
        });
        if (error) throw error;
      }
      setMsg({ type: 'success', text: `${files.length} зураг ${y} онд нэмэгдлээ.` });
      setCaption('');
      onUploaded?.(y);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
      setProgress('');
    }
    return undefined;
  }

  if (compact && !open) {
    return (
      <button type="button" className="btn btn--ghost btn--sm tl-up__toggle" onClick={() => setOpen(true)}>
        📷 {fixedYear} онд зураг нэмэх
      </button>
    );
  }

  return (
    <div className={`tl-up ${compact ? 'tl-up--compact' : ''}`}>
      <div className="tl-up__head">
        <b>{fixedYear ? `📷 ${fixedYear} онд зураг нэмэх` : '📷 Time Machine-д зураг нэмэх'}</b>
        {compact && <button type="button" className="btn btn--text btn--sm" onClick={() => setOpen(false)}>Хаах</button>}
      </div>
      <div className="tl-up__fields">
        {fixedYear == null && (
          <input className="input input--sm tl-up__year" type="number" min={1900} max={2100} value={year}
            onChange={(e) => setYear(e.target.value)} aria-label="Он" />
        )}
        <input className="input input--sm" type="url" value={postUrl} onChange={(e) => setPostUrl(e.target.value)}
          placeholder="Эх сурвалж: Instagram / Facebook постын холбоос (заавал биш)" />
        <input className="input input--sm" value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="Тайлбар (заавал биш)" />
        <label className={`btn btn--primary btn--sm ${busy ? 'is-busy' : ''}`}>
          {busy ? `Оруулж байна… ${progress}` : '+ Зураг сонгох'}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden
            onChange={handleFiles} disabled={busy} />
        </label>
      </div>
      {msg && <p className={`tl-up__msg tl-up__msg--${msg.type}`}>{msg.text}</p>}
    </div>
  );
}
