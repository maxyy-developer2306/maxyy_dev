import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { formatDateInput, parseDateInput } from '../utils/dates';

const empty = {
  permitNumber: '', permitType: '', issueDate: '', expiryDate: '',
  workerName: '', iqamaNumber: '', nationality: '', jobTitle: '',
  dateOfBirth: '', iqamaMosasaNumber: '', establishmentName: '', gender: 'ذكر'
};

export default function PermitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/permits/${id}`).then(({ data }) => {
      const permit = data.permit;
      setForm({
        permitNumber: permit.permitNumber || '', permitType: permit.permitType || '',
        issueDate: formatDateInput(permit.issueDate), expiryDate: formatDateInput(permit.expiryDate),
        workerName: permit.workerName || '', iqamaNumber: permit.iqamaNumber || '',
        nationality: permit.nationality || '', jobTitle: permit.jobTitle || '',
        dateOfBirth: formatDateInput(permit.dateOfBirth),
        iqamaMosasaNumber: permit.iqamaMosasaNumber || '',
        establishmentName: permit.establishmentName || '', gender: permit.gender || 'ذكر'
      });
    }).catch(requestError => setError(requestError.response?.data?.error || 'Could not load permit'));
  }, [id]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function save(event) {
    event.preventDefault();
    setError('');

    const payload = { ...form };
    for (const [field, label] of [
      ['issueDate', 'Issue Date'],
      ['expiryDate', 'Expiry Date'],
      ['dateOfBirth', 'Date of Birth']
    ]) {
      const value = form[field].trim();
      if (!value) {
        payload[field] = null;
        continue;
      }

      const parsedDate = parseDateInput(value);
      if (!parsedDate) {
        setError(`${label} must be a valid date. Use / or - as the separator, e.g. 25-12-2026.`);
        return;
      }
      payload[field] = parsedDate;
    }

    setLoading(true);
    try {
      if (id) await axios.put(`/api/permits/${id}`, payload);
      else await axios.post('/api/permits', payload);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save permit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Back</button>
      <div className="page-heading compact"><div><h1>{id ? 'Edit Permit' : 'Add Permit'}</h1><p>{id ? 'Update permit information. The QR token is preserved.' : 'Create a new worker permit.'}</p></div></div>
      {error && <div className="alert error">{error}</div>}
      <form className="form-panel" onSubmit={save}>
        <div className="form-grid">
          <label>Permit Number <span>*</span><input name="permitNumber" value={form.permitNumber} onChange={update} required /></label>
          <label>Permit Type<input name="permitType" value={form.permitType} onChange={update} /></label>
          <label>Issue Date<input type="text" inputMode="text" placeholder="DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD" name="issueDate" value={form.issueDate} onChange={update} /></label>
          <label>Expiry Date<input type="text" inputMode="text" placeholder="DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD" name="expiryDate" value={form.expiryDate} onChange={update} /></label>
          <label>Worker Name <span>*</span><input name="workerName" value={form.workerName} onChange={update} required /></label>
          <label>Iqama / ID Number <span>*</span><input name="iqamaNumber" value={form.iqamaNumber} onChange={update} required /></label>
          <label>Nationality<input name="nationality" value={form.nationality} onChange={update} /></label>
          <label>Job Title<input name="jobTitle" value={form.jobTitle} onChange={update} /></label>
          <label>Date of Birth<input type="text" inputMode="text" placeholder="DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD" name="dateOfBirth" value={form.dateOfBirth} onChange={update} /></label>
          <label>Iqama Mosasa Number<input name="iqamaMosasaNumber" value={form.iqamaMosasaNumber} onChange={update} /></label>
          <label>Establishment Name / اسم المنشأة<input name="establishmentName" value={form.establishmentName} onChange={update} /></label>
          <label>Gender<select name="gender" value={form.gender} onChange={update}><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select></label>
        </div>
        <div className="form-actions"><button type="button" className="secondary" onClick={() => navigate(-1)}>Cancel</button><button className="primary" disabled={loading}><Save size={18} /> {loading ? 'Saving...' : 'Save Permit'}</button></div>
      </form>
    </div>
  );
}
