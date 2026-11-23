import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, ShieldCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PermitForm from './pages/PermitForm';
import PermitDetails from './pages/PermitDetails';
import Login from './pages/Login';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

function ProtectedLayout() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await axios.post('/api/auth/logout');
    navigate('/login', { replace: true });
  }

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><ShieldCheck size={24} /><span>MAXYY DEV</span></div>
        <button className="icon-button" onClick={logout}><LogOut size={18} /> Logout</button>
      </header>
      <main><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/permits/new" element={<PermitForm />} />
          <Route path="/permits/:id/edit" element={<PermitForm />} />
          <Route path="/permits/:id" element={<PermitDetails />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
