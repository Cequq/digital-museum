import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SetupNotice from './SetupNotice';
import { SourceLink } from './Social';
import { OFFICIAL_CHANNELS } from '../lib/social';

const NAV = [
  { to: '/exhibits', label: 'Үзэсгэлэн' },
  { to: '/time-machine', label: 'Time Machine' },
  { to: '/teachers', label: 'Багш нар' },
  { to: '/events', label: 'Арга хэмжээ' },
  { to: '/creators', label: 'ISM Creators' },
];

export default function Layout() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="app">
      <SetupNotice />
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label="ISM Digital Museum нүүр">
            <img src="/favicon.svg" alt="" width="34" height="34" />
            <span>
              <strong>ISM</strong> Digital Museum
            </span>
          </Link>

          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-label="Цэс"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav ${open ? 'nav--open' : ''}`}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav__link">
                {item.label}
              </NavLink>
            ))}
            <div className="nav__auth">
              {user ? (
                <>
                  <NavLink to="/my-exhibits" className="nav__link">Миний бүтээл</NavLink>
                  {isAdmin && <NavLink to="/admin" className="nav__link nav__link--admin">Админ</NavLink>}
                  <NavLink to="/profile" className="nav__link" title="Профайл">
                    {profile?.display_name || 'Профайл'}
                  </NavLink>
                  <button className="btn btn--ghost btn--sm" onClick={handleSignOut}>Гарах</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="nav__link">Нэвтрэх</NavLink>
                  <Link to="/register" className="btn btn--primary btn--sm">Бүртгүүлэх</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <strong>ISM Digital Museum</strong>
            <p>Санхүү эдийн засгийн их сургууль · Мэдээллийн системийн менежментийн тэнхим</p>
            <div className="footer__social">
              {OFFICIAL_CHANNELS.map((c) => <SourceLink key={c.url} url={c.url} prefix="" />)}
            </div>
          </div>
          <div className="footer__links">
            <a href="https://ufe.edu.mn" target="_blank" rel="noreferrer">ufe.edu.mn</a>
            <a href="mailto:ism_dpt@ufe.edu.mn">ism_dpt@ufe.edu.mn</a>
            <span>Internet Programming · Гэрийн даалгавар №1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
