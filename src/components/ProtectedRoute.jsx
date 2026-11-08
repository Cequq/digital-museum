import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/** Нэвтрээгүй бол /login руу, админ биш бол нүүр хуудас руу шилжүүлнэ. */
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, isAdmin, loading, profile } = useAuth();
  const location = useLocation();

  if (loading || (user && !profile && adminOnly)) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) {
    return (
      <div className="container section">
        <div className="notice notice--error">Энэ хуудсанд зөвхөн администратор хандана.</div>
      </div>
    );
  }
  return <Outlet />;
}
