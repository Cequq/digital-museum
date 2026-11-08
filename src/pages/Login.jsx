import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const translate = (msg = '') => {
  if (/invalid login credentials/i.test(msg)) return 'И-мэйл эсвэл нууц үг буруу байна.';
  if (/email not confirmed/i.test(msg)) return 'И-мэйлээ баталгаажуулна уу (ирсэн захидлыг шалгана уу).';
  return msg;
};

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/my-exhibits'} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Зөв и-мэйл хаяг оруулна уу.');
    if (!password) return setError('Нууц үгээ оруулна уу.');
    setBusy(true);
    setError('');
    try {
      await signIn({ email: email.trim(), password });
      navigate(location.state?.from || '/my-exhibits', { replace: true });
    } catch (err) {
      setError(translate(err.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Нэвтрэх</h1>
        <p className="muted">Бүтээлээ нэмэх, засахын тулд нэвтэрнэ үү.</p>
        {error && <div className="notice notice--error">{error}</div>}
        <label className="field">
          <span className="field__label">И-мэйл</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label field__label--row">
            Нууц үг <Link to="/forgot-password" className="field__link">Нууц үгээ мартсан уу?</Link>
          </span>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Нэвтэрч байна…' : 'Нэвтрэх'}</button>
        <p className="auth__switch">Бүртгэлгүй юу? <Link to="/register">Бүртгүүлэх</Link></p>
      </form>
    </div>
  );
}
