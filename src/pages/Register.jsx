import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signUp, user } = useAuth();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/my-exhibits" replace />;

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function validate() {
    const er = {};
    if (form.displayName.trim().length < 2) er.displayName = 'Нэрээ оруулна уу (2+ тэмдэгт).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Зөв и-мэйл хаяг оруулна уу.';
    if (form.password.length < 8) er.password = 'Нууц үг дор хаяж 8 тэмдэгт.';
    else if (!/\d/.test(form.password) || !/[A-Za-zА-Яа-яӨөҮү]/.test(form.password)) {
      er.password = 'Нууц үг үсэг болон тоо агуулна.';
    }
    if (form.confirm !== form.password) er.confirm = 'Нууц үг таарахгүй байна.';
    return er;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setServerError('');
    try {
      const data = await signUp({
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
      });
      // И-мэйл баталгаажуулалт асаалттай бол session ирэхгүй
      if (!data.session) setDone(true);
    } catch (err) {
      setServerError(/already registered/i.test(err.message) ? 'Энэ и-мэйлээр бүртгэл үүссэн байна.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1>Бараг боллоо!</h1>
          <p><b>{form.email}</b> хаяг руу баталгаажуулах холбоос илгээлээ. Холбоос дээр дараад нэвтэрнэ үү.</p>
          <Link to="/login" className="btn btn--primary btn--block">Нэвтрэх хуудас</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form className="auth__card" onSubmit={handleSubmit} noValidate>
        <h1>Бүртгүүлэх</h1>
        <p className="muted">ISM Creators-д нэгдэж өөрийн бүтээлээ музейд үлдээгээрэй.</p>
        {serverError && <div className="notice notice--error">{serverError}</div>}
        {[
          ['displayName', 'Нэр (харагдах)', 'text', 'name'],
          ['email', 'И-мэйл', 'email', 'email'],
          ['password', 'Нууц үг', 'password', 'new-password'],
          ['confirm', 'Нууц үг давтах', 'password', 'new-password'],
        ].map(([name, label, type, ac]) => (
          <label className="field" key={name}>
            <span className="field__label">{label}</span>
            <input className="input" name={name} type={type} autoComplete={ac} value={form[name]} onChange={update} />
            {errors[name] && <span className="field__error">{errors[name]}</span>}
          </label>
        ))}
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Бүртгэж байна…' : 'Бүртгүүлэх'}</button>
        <p className="auth__switch">Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link></p>
      </form>
    </div>
  );
}
