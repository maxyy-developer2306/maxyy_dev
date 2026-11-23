import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/login', form);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-icon"><ShieldCheck size={32} /></div>
        <h1>MAXYY DEV</h1>
        <p>Permit administration</p>
        {error && <div className="alert error">{error}</div>}
        <label>Username
          <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
        </label>
        <label>Password
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required />
        </label>
        <button className="primary full" disabled={loading}><LockKeyhole size={18} /> {loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
