import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * Шинэ нууц үг тохируулах.
 *  • И-мэйлийн холбоосоор ирэхэд Supabase URL дахь токеныг уншиж түр session үүсгэнэ
 *    (PASSWORD_RECOVERY event), тэгээд updateUser({ password }) дуудна.
 *  • Нэвтэрсэн хэрэглэгч Профайлаас ороод нууц үгээ сольж мөн болно.
 */
export default function ResetPassword() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [waited, setWaited] = useState(false);

  // Холбоосын токен боловсруулагдах хүртэл бага зэрэг хүлээнэ
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const linkError = new URLSearchParams(window.location.hash.slice(1)).get('error_description')
    || new URLSearchParams(window.location.search).get('error_description');

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 8) return setError('Нууц үг дор хаяж 8 тэмдэгт.');
    if (!/\d/.test(password) || !/[A-Za-zА-Яа-яӨөҮү]/.test(password)) return setError('Нууц үг үсэг болон тоо агуулна.');
    if (password !== confirm) return setError('Нууц үг таарахгүй байна.');
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      return setError(/different from the old/i.test(err.message)
        ? 'Шинэ нууц үг хуучнаасаа өөр байх ёстой.'
        : err.message);
    }
    setDone(true);
    setTimeout(() => navigate('/my-exhibits', { replace: true }), 1800);
    return undefined;
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1>Нууц үг шинэчлэгдлээ ✓</h1>
          <p>Таныг “Миний бүтээл” хуудас руу шилжүүлж байна…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if ((loading || !waited) && !linkError) return <Loader label="Холбоосыг шалгаж байна…" />;
    return (
      <div className="auth">
        <div className="auth__card">
          <h1>Холбоос хүчингүй байна</h1>
          <p className="muted">
            Нууц үг сэргээх холбоосын хугацаа дууссан эсвэл аль хэдийн ашиглагдсан байна. Шинээр хүсэлт илгээнэ үү.
          </p>
          <Link to="/forgot-password" className="btn btn--primary btn--block">Дахин холбоос авах</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Шинэ нууц үг</h1>
        <p className="muted">{user.email} бүртгэлийн шинэ нууц үгийг оруулна уу.</p>
        {error && <div className="notice notice--error">{error}</div>}
        <label className="field">
          <span className="field__label">Шинэ нууц үг</span>
          <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="field__hint">8+ тэмдэгт, үсэг болон тоо агуулна</span>
        </label>
        <label className="field">
          <span className="field__label">Нууц үг давтах</span>
          <input className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Нууц үг хадгалах'}</button>
      </form>
    </div>
  );
}
