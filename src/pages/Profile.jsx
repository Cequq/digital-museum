import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { removeImageByUrl, uploadImage } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ display_name: '', bio: '', student_code: '' });
  const [file, setFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        student_code: profile.student_code ?? '',
      });
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.display_name.trim().length < 2) {
      setMsg({ type: 'error', text: 'Нэр дор хаяж 2 тэмдэгт.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      let avatar = removeAvatar ? null : profile?.avatar_url ?? null;
      if (file) avatar = await uploadImage(file, user.id, 'avatars');
      // role-г илгээхгүй — RLS + триггер үүнийг хамгаална
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: form.display_name.trim(),
          bio: form.bio.trim() || null,
          student_code: form.student_code.trim() || null,
          avatar_url: avatar,
        })
        .eq('id', user.id);
      if (error) throw error;
      if ((file || removeAvatar) && profile?.avatar_url) await removeImageByUrl(profile.avatar_url);
      await refreshProfile();
      setFile(null);
      setRemoveAvatar(false);
      setMsg({ type: 'success', text: 'Профайл хадгалагдлаа.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container section narrow">
      <h1>Миний профайл</h1>
      <p className="muted">
        {user.email} · {profile?.role === 'admin' ? 'Администратор' : 'Бүтээгч'} ·{' '}
        <Link to={`/creators/${user.id}`}>Нийтийн хуудсаа харах →</Link> ·{' '}
        <Link to="/reset-password">Нууц үг солих</Link>
      </p>
      {msg && <div className={`notice notice--${msg.type}`}>{msg.text}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field__label">Харагдах нэр</span>
          <input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </label>
        <label className="field">
          <span className="field__label">Оюутны код (заавал биш)</span>
          <input className="input" value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })} />
        </label>
        <label className="field">
          <span className="field__label">Товч танилцуулга</span>
          <textarea className="input" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Сонирхол, чиглэл, курс…" />
        </label>
        <ImageUpload
          label="Профайл зураг"
          currentUrl={profile?.avatar_url}
          onFileChange={(f) => { setFile(f); if (f) setRemoveAvatar(false); }}
          onRemove={() => setRemoveAvatar(true)}
        />
        <div className="form__actions">
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button>
        </div>
      </form>
    </div>
  );
}
