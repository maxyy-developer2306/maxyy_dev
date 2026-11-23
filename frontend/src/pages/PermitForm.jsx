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

// Shared classes for inputs and selects (GitHub dark style)
const inputClass =
  'w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-sm text-[#e6edf3] placeholder-[#6e7681] outline-none transition focus:border-[#3fb950] focus:ring-1 focus:ring-[#3fb950]/40';

const datePlaceholder = 'DD/MM/YYYY or YYYY-MM-DD';

export default function PermitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing permit when editing
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

  // Validate dates, then create or update the permit
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

  // Small helper to render one labeled field
  function Field({ label, name, required, placeholder }) {
    return (
      <label className="flex flex-col gap-1.5 text-xs font-medium text-[#8b949e]">
        <span>
          {label} {required && <span className="text-[#f85149]">*</span>}
        </span>
        <input
          name={name}
          value={form[name]}
          onChange={update}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] px-4 py-6 text-[#c9d1d9] sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#8b949e] transition hover:text-[#58a6ff]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Page heading */}
        <div className="mb-5 border-b border-[#21262d] pb-5">
          <h1 className="text-xl font-semibold tracking-tight text-[#e6edf3]">
            {id ? 'Edit Permit' : 'Add Permit'}
          </h1>
          <p className="mt-0.5 text-xs text-[#8b949e]">
            {id ? 'Update permit information. The QR token is preserved.' : 'Create a new worker permit.'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 rounded-md border border-[#f85149]/40 bg-[#da3633]/10 px-3 py-2 text-sm text-[#ff7b72]">
            {error}
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={save} className="overflow-hidden rounded-md border border-[#30363d] bg-[#161b22]">
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field label="Permit Number" name="permitNumber" required />
            <Field label="Permit Type" name="permitType" />
            <Field label="Issue Date" name="issueDate" placeholder={datePlaceholder} />
            <Field label="Expiry Date" name="expiryDate" placeholder={datePlaceholder} />
            <Field label="Worker Name" name="workerName" required />
            <Field label="Iqama / ID Number" name="iqamaNumber" required />
            <Field label="Nationality" name="nationality" />
            <Field label="Job Title" name="jobTitle" />
            <Field label="Date of Birth" name="dateOfBirth" placeholder={datePlaceholder} />
            <Field label="Iqama Mosasa Number" name="iqamaMosasaNumber" />
            <Field label="Establishment Name / اسم المنشأة" name="establishmentName" />

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[#8b949e]">
              <span>Gender</span>
              <select name="gender" value={form.gender} onChange={update} className={inputClass}>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-[#30363d] bg-[#0d1117] px-5 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-sm font-medium text-[#c9d1d9] transition hover:border-[#8b949e] hover:bg-[#30363d]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#3fb950]/40 bg-[#238636] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2ea043] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950]/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} /> {loading ? 'Saving...' : 'Save Permit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}