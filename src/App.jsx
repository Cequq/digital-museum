import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Exhibits from './pages/Exhibits';
import ExhibitDetail from './pages/ExhibitDetail';
import ExhibitForm from './pages/ExhibitForm';
import MyExhibits from './pages/MyExhibits';
import Teachers from './pages/Teachers';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import TimeMachine from './pages/TimeMachine';
import Creators from './pages/Creators';
import CreatorDetail from './pages/CreatorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="exhibits" element={<Exhibits />} />
        <Route path="exhibits/:id" element={<ExhibitDetail />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="time-machine" element={<TimeMachine />} />
        <Route path="creators" element={<Creators />} />
        <Route path="creators/:id" element={<CreatorDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        {/* Нэвтэрсэн хэрэглэгч */}
        <Route element={<ProtectedRoute />}>
          <Route path="exhibits/new" element={<ExhibitForm />} />
          <Route path="exhibits/:id/edit" element={<ExhibitForm />} />
          <Route path="my-exhibits" element={<MyExhibits />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Зөвхөн админ */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
