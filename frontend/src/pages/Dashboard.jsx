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
    const next = permit.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Change permit ${permit.permitNumber} to ${next}?`)) return;
    try {
      await axios.patch(`/api/permits/${permit._id}/status`, { status: next });
      setMessage('Permit status updated');
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not update status');
    }
  }

  // Archive (soft delete) a permit
  async function archive(permit) {
    if (!window.confirm(`Archive permit ${permit.permitNumber}?`)) return;
    try {
      await axios.delete(`/api/permits/${permit._id}`);
      setMessage('Permit archived successfully');
      load();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not archive permit');
    }
  }

  const total = permits.length;
  const active = permits.filter(item => item.status === 'active').length;

  // Shared classes for the small icon buttons in the Actions column
  const iconBtn =
    'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] text-[#8b949e] transition hover:border-[#8b949e] hover:bg-[#30363d] hover:text-[#e6edf3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950]/50';

  const stats = [
    { label: 'Total Permits', value: total, color: 'text-[#e6edf3]' },
    { label: 'Active', value: active, color: 'text-[#3fb950]' },
    { label: 'Inactive', value: total - active, color: 'text-[#f85149]' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#c9d1d9] sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-5 flex flex-col gap-3 border-b border-[#21262d] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">Permit Dashboard</h1>
            <p className="mt-0.5 text-xs text-[#8b949e]">Manage worker permits and their verification status.</p>
          </div>
          <button
            onClick={() => navigate('/permits/new')}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#3fb950]/40 bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950]/60"
          >
            <Plus size={16} /> Add Permit
          </button>
        </div>

        {/* Message alert */}
        {message && (
          <div className="mb-4 flex items-center justify-between rounded-md border border-[#238636]/40 bg-[#238636]/10 px-3 py-2 text-sm text-[#7ee787]">
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-[#8b949e] transition hover:text-[#e6edf3]"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section className="mb-5 grid grid-cols-3 gap-3">
          {stats.map(item => (
            <article key={item.label} className="rounded-md border border-[#30363d] bg-[#161b22] px-4 py-3">
              <span className="text-xs text-[#8b949e]">{item.label}</span>
              <strong className={`mt-1 block text-2xl font-semibold ${item.color}`}>{item.value}</strong>
            </article>
          ))}
        </section>

        {/* Table panel */}
        <section className="overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
          {/* Toolbar: search + filters */}
          <div className="flex flex-col gap-3 border-b border-[#30363d] bg-[#161b22] p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full items-center gap-2 rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-[#8b949e] transition focus-within:border-[#3fb950] focus-within:ring-1 focus-within:ring-[#3fb950]/40 lg:max-w-sm">
              <Search size={15} />
              <input
                className="w-full bg-transparent text-sm text-[#e6edf3] placeholder-[#6e7681] outline-none"
                placeholder="Search permit, worker, iqama..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Segmented status filter */}
              <div className="inline-flex overflow-hidden rounded-md border border-[#30363d]">
                {['all', 'active', 'inactive'].map(value => (
                  <button
                    key={value}
                    onClick={() => setStatus(value)}
                    className={
                      status === value
                        ? 'bg-[#238636] px-3 py-1.5 text-xs font-medium text-white'
                        : 'bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#8b949e] transition hover:bg-[#30363d] hover:text-[#e6edf3]'
                    }
                  >
                    {value[0].toUpperCase() + value.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#c9d1d9] transition hover:border-[#8b949e] hover:bg-[#30363d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#30363d] bg-[#161b22] text-xs uppercase tracking-wide text-[#8b949e]">
                  <th className="px-4 py-2.5 font-medium">Permit No.</th>
                  <th className="px-4 py-2.5 font-medium">Worker</th>
                  <th className="px-4 py-2.5 font-medium">Iqama / ID</th>
                  <th className="px-4 py-2.5 font-medium">Gender</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {permits.map(permit => (
                  <tr key={permit._id} className="transition hover:bg-[#161b22]">
                    <td className="px-4 py-2.5 font-medium text-[#58a6ff]">{permit.permitNumber}</td>
                    <td className="px-4 py-2.5 text-[#e6edf3]">{permit.workerName}</td>
                    <td className="px-4 py-2.5 text-[#8b949e]">{permit.iqamaNumber}</td>
                    <td className="px-4 py-2.5 text-[#8b949e]">{permit.gender}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={
                          permit.status === 'active'
                            ? 'inline-flex items-center gap-1.5 rounded-full border border-[#3fb950]/40 bg-[#238636]/15 px-2 py-0.5 text-xs font-medium capitalize text-[#3fb950]'
                            : 'inline-flex items-center gap-1.5 rounded-full border border-[#f85149]/40 bg-[#da3633]/15 px-2 py-0.5 text-xs font-medium capitalize text-[#f85149]'
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${permit.status === 'active' ? 'bg-[#3fb950]' : 'bg-[#f85149]'}`}
                        />
                        {permit.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="View in new tab"
                          aria-label="View permit in new tab"
                          className={iconBtn}
                          onClick={() => window.open(`/permits/${permit._id}`, '_blank', 'noopener,noreferrer')}
                        >
                          <Eye size={14} />
                        </button>
                        <button title="Edit" className={iconBtn} onClick={() => navigate(`/permits/${permit._id}/edit`)}>
                          <Pencil size={14} />
                        </button>
                        <button title="Activate / Deactivate" className={iconBtn} onClick={() => changeStatus(permit)}>
                          <Power size={14} />
                        </button>
                        <button title="View QR" className={iconBtn} onClick={() => navigate(`/permits/${permit._id}?tab=qr`)}>
                          <QrCode size={14} />
                        </button>
                        <button
                          title="Delete"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#f85149]/40 bg-[#da3633]/10 text-[#f85149] transition hover:bg-[#da3633]/25 hover:text-[#ff7b72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f85149]/50"
                          onClick={() => archive(permit)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!permits.length && (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-[#6e7681]">
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