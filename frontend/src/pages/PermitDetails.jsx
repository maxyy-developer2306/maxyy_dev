import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Download, Pencil } from 'lucide-react';
import { formatDisplayDate } from '../utils/dates';

export default function PermitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [permit, setPermit] = useState(null);
  const [qr, setQr] = useState(null);
  const [message, setMessage] = useState('');

  // Load permit and its QR data
  useEffect(() => {
    axios.get(`/api/permits/${id}`).then(({ data }) => setPermit(data.permit));
    axios.get(`/api/permits/${id}/qr`).then(({ data }) => setQr(data));
  }, [id]);

  // Copy the QR verification URL to clipboard
  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(qr.url);
      setMessage('QR URL copied');
    } catch {
      setMessage('Could not copy URL');
    }
  }

  // Download the QR code as a PNG file
  async function downloadQr() {
    const response = await axios.get(`/api/permits/${id}/qr/download`, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `permit-${permit.permitNumber}.png`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  if (!permit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117] text-sm text-[#8b949e]">
        Loading...
      </div>
    );
  }

  // Fields shown in the details grid
  const fields = [
    ['Permit Type', permit.permitType || '-'],
    ['Issue Date', formatDisplayDate(permit.issueDate)],
    ['Expiry Date', formatDisplayDate(permit.expiryDate)],
    ['Worker Name', permit.workerName],
    ['Iqama / ID Number', permit.iqamaNumber],
    ['Nationality', permit.nationality || '-'],
    ['Job Title', permit.jobTitle || '-'],
    ['Date of Birth', formatDisplayDate(permit.dateOfBirth)],
    ['Iqama Mosasa Number', permit.iqamaMosasaNumber || '-'],
    ['Establishment Name / اسم المنشأة', permit.establishmentName || '-'],
    ['Gender', permit.gender],
  ];

  const isActive = permit.status === 'active';

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#c9d1d9] sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#8b949e] transition hover:text-[#58a6ff]"
        >
          <ArrowLeft size={16} /> Back
        </button>

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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          {/* Details panel */}
          <section className="overflow-hidden rounded-md border border-[#30363d] bg-[#161b22]">
            <div className="flex items-center justify-between border-b border-[#30363d] px-5 py-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">Permit Details</h1>
                <p className="mt-0.5 text-sm font-medium text-[#58a6ff]">{permit.permitNumber}</p>
              </div>
              <span
                className={
                  isActive
                    ? 'inline-flex items-center gap-1.5 rounded-full border border-[#3fb950]/40 bg-[#238636]/15 px-2 py-0.5 text-xs font-medium capitalize text-[#3fb950]'
                    : 'inline-flex items-center gap-1.5 rounded-full border border-[#f85149]/40 bg-[#da3633]/15 px-2 py-0.5 text-xs font-medium capitalize text-[#f85149]'
                }
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#3fb950]' : 'bg-[#f85149]'}`} />
                {permit.status}
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="border-b border-[#21262d] pb-3">
                  <dt className="text-xs text-[#8b949e]">{label}</dt>
                  <dd className="mt-1 text-sm text-[#e6edf3]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex justify-end border-t border-[#30363d] bg-[#0d1117] px-5 py-3">
              <button
                onClick={() => navigate(`/permits/${id}/edit`)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#3fb950]/40 bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950]/60"
              >
                <Pencil size={16} /> Edit Permit
              </button>
            </div>
          </section>

          {/* QR panel */}
          <aside className="h-fit rounded-md border border-[#30363d] bg-[#161b22]">
            <div className="border-b border-[#30363d] px-5 py-4">
              <h2 className="text-base font-semibold text-[#e6edf3]">Permanent QR</h2>
            </div>
            <div className="flex flex-col items-center gap-4 p-5">
              {qr && (
                <>
                  <img
                    src={qr.qrDataUrl}
                    alt="Permit QR code"
                    className="w-full max-w-[220px] rounded-md border border-[#30363d] bg-white p-2"
                  />
                  <code className="w-full break-all rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#8b949e]">
                    {qr.url}
                  </code>
                </>
              )}
              <div className="flex w-full flex-col gap-2">
                {qr && (
                  <button
                    onClick={copyUrl}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm font-medium text-[#c9d1d9] transition hover:border-[#8b949e] hover:bg-[#30363d]"
                  >
                    <Copy size={15} /> Copy QR URL
                  </button>
                )}
                <button
                  onClick={downloadQr}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#3fb950]/40 bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950]/60"
                >
                  <Download size={15} /> Download QR
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}