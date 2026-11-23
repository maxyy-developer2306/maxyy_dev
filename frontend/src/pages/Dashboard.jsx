import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Search, Eye, Pencil, Power, Trash2, QrCode } from 'lucide-react';

export default function Dashboard() {
  const [permits, setPermits] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/permits', { params: { search, status } });
      setPermits(data.permits);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not refresh permits');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(permit) {
    if (!window.confirm(`Change permit ${permit.permitNumber} to ${permit.status === 'active' ? 'inactive' : 'active'}?`)) return;
    await axios.patch(`/api/permits/${permit._id}/status`, { status: permit.status === 'active' ? 'inactive' : 'active' });
    setMessage('Permit status updated');
    load();
  }

  async function archive(permit) {
    if (!window.confirm(`Archive permit ${permit.permitNumber}?`)) return;
    await axios.delete(`/api/permits/${permit._id}`);
    setMessage('Permit archived successfully');
    load();
  }

  const total = permits.length;
  const active = permits.filter(item => item.status === 'active').length;

  return (
    <div className="page">
      <div className="page-heading">
        <div><h1>Permit Dashboard</h1><p>Manage worker permits and their verification status.</p></div>
        <button className="primary" onClick={() => navigate('/permits/new')}><Plus size={18} /> Add Permit</button>
      </div>
      {message && <div className="alert">{message}</div>}
      <section className="summary-grid">
        <article><span>Total Permits</span><strong>{total}</strong></article>
        <article><span>Active</span><strong className="success-text">{active}</strong></article>
        <article><span>Inactive</span><strong className="danger-text">{total - active}</strong></article>
      </section>
      <section className="panel">
        <div className="toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Search permit, worker, iqama..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="filters">
            {['all', 'active', 'inactive'].map(value => <button key={value} className={status === value ? 'filter active-filter' : 'filter'} onClick={() => setStatus(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
            <button className="refresh" onClick={load} disabled={loading}><RefreshCw size={17} /> Refresh</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Permit No.</th><th>Worker</th><th>Iqama / ID</th><th>Gender</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {permits.map(permit => (
                <tr key={permit._id}>
                  <td><strong>{permit.permitNumber}</strong></td>
                  <td>{permit.workerName}</td>
                  <td>{permit.iqamaNumber}</td>
                  <td>{permit.gender}</td>
                  <td><span className={`status ${permit.status}`}>{permit.status}</span></td>
                  <td>
                    <div className="actions">
                      <button title="View" onClick={() => navigate(`/permits/${permit._id}`)}><Eye size={16} /></button>
                      <button title="Edit" onClick={() => navigate(`/permits/${permit._id}/edit`)}><Pencil size={16} /></button>
                      <button title="Activate / Deactivate" onClick={() => changeStatus(permit)}><Power size={16} /></button>
                      <button title="View QR" onClick={() => navigate(`/permits/${permit._id}?tab=qr`)}><QrCode size={16} /></button>
                      <button title="Delete" className="delete-action" onClick={() => archive(permit)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!permits.length && <tr><td colSpan="6" className="empty">No permits found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
