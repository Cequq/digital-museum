import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Нууц үг сэргээх: Supabase и-мэйлээр /reset-password руу чиглэсэн холбоос илгээнэ.
 * Аюулгүй байдлын үүднээс и-мэйл бүртгэлтэй эсэхийг ил гаргахгүй — үргэлж ижил хариу өгнө.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Зөв и-мэйл хаяг оруулна уу.');
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    // Хэт олон хүсэлт гэх мэт техникийн алдааг л харуулна
    if (err && /rate|too many|seconds/i.test(err.message)) {
      return setError('Хэт олон удаа хүсэлт илгээлээ. Хэдэн минутын дараа дахин оролдоно уу.');
    }
    setSent(true);
    return undefined;
  }

  if (sent) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1>И-мэйлээ шалгана уу</h1>
          <p>
            <b>{email}</b> хаягаар бүртгэл байгаа бол нууц үг сэргээх холбоос илгээгдлээ.
            Холбоос дээр дарж шинэ нууц үгээ тохируулна уу. Spam хавтсаа ч шалгаарай.
          </p>
          <Link to="/login" className="btn btn--primary btn--block">Нэвтрэх хуудас</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Нууц үг сэргээх</h1>
        <p className="muted">Бүртгэлтэй и-мэйлээ оруулбал нууц үг шинэчлэх холбоос илгээнэ.</p>
        {error && <div className="notice notice--error">{error}</div>}
        <label className="field">
          <span className="field__label">И-мэйл</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Илгээж байна…' : 'Холбоос илгээх'}</button>
        <p className="auth__switch"><Link to="/login">← Нэвтрэх рүү буцах</Link></p>
      </form>
    </div>
  );
}
