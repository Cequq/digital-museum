import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty">
        <h1 className="display-404">404</h1>
        <h3>Энэ танхим музейд байхгүй байна</h3>
        <p>Хайсан хуудас олдсонгүй.</p>
        <Link to="/" className="btn btn--primary btn--sm">Нүүр хуудас</Link>
      </div>
    </div>
  );
}
