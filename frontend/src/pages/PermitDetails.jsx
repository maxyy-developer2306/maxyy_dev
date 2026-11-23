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

  useEffect(() => {
    axios.get(`/api/permits/${id}`).then(({ data }) => setPermit(data.permit));
    axios.get(`/api/permits/${id}/qr`).then(({ data }) => setQr(data));
  }, [id]);

  async function copyUrl() {
    await navigator.clipboard.writeText(qr.url);
    setMessage('QR URL copied');
  }

  async function downloadQr() {
    const response = await axios.get(`/api/permits/${id}/qr/download`, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `permit-${permit.permitNumber}.png`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  if (!permit) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      {message && <div className="alert">{message}</div>}
      <div className="details-layout">
        <section className="form-panel">
          <div className="details-heading"><div><h1>Permit Details</h1><p>{permit.permitNumber}</p></div><span className={`status ${permit.status}`}>{permit.status}</span></div>
          <dl className="details-grid">
            <div><dt>Permit Type</dt><dd>{permit.permitType || '-'}</dd></div>
            <div><dt>Issue Date</dt><dd>{formatDisplayDate(permit.issueDate)}</dd></div>
            <div><dt>Expiry Date</dt><dd>{formatDisplayDate(permit.expiryDate)}</dd></div>
            <div><dt>Worker Name</dt><dd>{permit.workerName}</dd></div>
            <div><dt>Iqama / ID Number</dt><dd>{permit.iqamaNumber}</dd></div>
            <div><dt>Nationality</dt><dd>{permit.nationality || '-'}</dd></div>
            <div><dt>Job Title</dt><dd>{permit.jobTitle || '-'}</dd></div>
            <div><dt>Date of Birth</dt><dd>{formatDisplayDate(permit.dateOfBirth)}</dd></div>
            <div><dt>Iqama Mosasa Number</dt><dd>{permit.iqamaMosasaNumber || '-'}</dd></div>
            <div><dt>Establishment Name / اسم المنشأة</dt><dd>{permit.establishmentName || '-'}</dd></div>
            <div><dt>Gender</dt><dd>{permit.gender}</dd></div>
          </dl>
          <button className="primary" onClick={() => navigate(`/permits/${id}/edit`)}><Pencil size={18} /> Edit Permit</button>
        </section>
        <aside className="qr-panel">
          <h2>Permanent QR</h2>
          {qr && <><img src={qr.qrDataUrl} alt="Permit QR code" /><code>{qr.url}</code></>}
          <div className="qr-actions">
            {qr && <button className="secondary" onClick={copyUrl}><Copy size={17} /> Copy QR URL</button>}
            <button className="primary link-button" onClick={downloadQr}><Download size={17} /> Download QR</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
