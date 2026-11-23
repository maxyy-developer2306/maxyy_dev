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

  // Fetch permits from the API whenever search or status filter changes
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

  // Toggle permit between active and inactive
  async function changeStatus(permit) {
    if (!window.confirm(`Change permit ${permit.permitNumber} to ${permit.status === 'active' ? 'inactive' : 'active'}?`)) return;
    await axios.patch(`/api/permits/${permit._id}/status`, { status: permit.status === 'active' ? 'inactive' : 'active' });
    setMessage('Permit status updated');
    load();
  }

  // Archive (soft delete) a permit
  async function archive(permit) {
    if (!window.confirm(`Archive permit ${permit.permitNumber}?`)) return;
    await axios.delete(`/api/permits/${permit._id}`);
    setMessage('Permit archived successfully');
    load();
  }

  const total = permits.length;
  const active = permits.filter(item => item.status === 'active').length;

  // Shared classes for the small icon buttons in the Actions column
  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-neutral-600 hover:bg-neutral-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-neutral-200 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Permit Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-500">Manage worker permits and their verification status.</p>
          </div>
          <button
            onClick={() => navigate('/permits/new')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Plus size={18} /> Add Permit
          </button>
        </div>

        {/* Message alert */}
        {message && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-neutral-500 transition hover:text-white"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-sm text-neutral-500">Total Permits</span>
            <strong className="mt-2 block text-3xl font-semibold text-white">{total}</strong>
          </article>
          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-sm text-neutral-500">Active</span>
            <strong className="mt-2 block text-3xl font-semibold text-emerald-400">{active}</strong>
          </article>
          <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <span className="text-sm text-neutral-500">Inactive</span>
            <strong className="mt-2 block text-3xl font-semibold text-red-400">{total - active}</strong>
          </article>
        </section>

        {/* Table panel */}
        <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
          {/* Toolbar: search + filters */}
          <div className="flex flex-col gap-3 border-b border-neutral-800 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full items-center gap-2 rounded-lg border border-neutral-800 bg-black px-3 py-2 text-neutral-500 transition focus-within:border-neutral-500 lg:max-w-md">
              <Search size={18} />
              <input
                className="w-full bg-transparent text-sm text-white placeholder-neutral-600 outline-none"
                placeholder="Search permit, worker, iqama..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['all', 'active', 'inactive'].map(value => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={
                    status === value
                      ? 'rounded-lg border border-white bg-white px-3.5 py-1.5 text-sm font-medium text-black'
                      : 'rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-sm font-medium text-neutral-400 transition hover:border-neutral-600 hover:text-white'
                  }
                >
                  {value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-500">
                  <th className="px-4 py-3 font-medium">Permit No.</th>
                  <th className="px-4 py-3 font-medium">Worker</th>
                  <th className="px-4 py-3 font-medium">Iqama / ID</th>
                  <th className="px-4 py-3 font-medium">Gender</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {permits.map(permit => (
                  <tr key={permit._id} className="transition hover:bg-neutral-900/50">
                    <td className="px-4 py-3.5 font-semibold text-white">{permit.permitNumber}</td>
                    <td className="px-4 py-3.5 text-neutral-300">{permit.workerName}</td>
                    <td className="px-4 py-3.5 text-neutral-400">{permit.iqamaNumber}</td>
                    <td className="px-4 py-3.5 text-neutral-400">{permit.gender}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          permit.status === 'active'
                            ? 'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium capitalize text-emerald-400'
                            : 'inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium capitalize text-red-400'
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${permit.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}
                        />
                        {permit.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          title="View in new tab"
                          aria-label="View permit in new tab"
                          className={iconBtn}
                          onClick={() => window.open(`/permits/${permit._id}`, '_blank', 'noopener,noreferrer')}
                        >
                          <Eye size={16} />
                        </button>
                        <button title="Edit" className={iconBtn} onClick={() => navigate(`/permits/${permit._id}/edit`)}>
                          <Pencil size={16} />
                        </button>
                        <button title="Activate / Deactivate" className={iconBtn} onClick={() => changeStatus(permit)}>
                          <Power size={16} />
                        </button>
                        <button title="View QR" className={iconBtn} onClick={() => navigate(`/permits/${permit._id}?tab=qr`)}>
                          <QrCode size={16} />
                        </button>
                        <button
                          title="Delete"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 transition hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                          onClick={() => archive(permit)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!permits.length && (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-neutral-600">
                      No permits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}