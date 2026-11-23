const mongoose = require('mongoose');
const crypto = require('crypto');

const permitSchema = new mongoose.Schema({
  permitNumber: { type: String, required: true, trim: true },
  permitType: { type: String, trim: true, default: '' },
  issueDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  workerName: { type: String, required: true, trim: true },
  iqamaNumber: { type: String, required: true, trim: true },
  nationality: { type: String, trim: true, default: '' },
  jobTitle: { type: String, trim: true, default: '' },
  dateOfBirth: { type: Date, default: null },
  iqamaMosasaNumber: { type: String, trim: true, default: '' },
  establishmentName: { type: String, trim: true, default: '' },
  gender: { type: String, enum: ['ذكر', 'أنثى'], default: 'ذكر' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  qrToken: { type: String, required: true, unique: true, index: true },
  archived: { type: Boolean, default: false, index: true },
  archivedAt: { type: Date, default: null }
}, { timestamps: true });

permitSchema.pre('validate', function() {
  if (!this.qrToken) this.qrToken = crypto.randomBytes(32).toString('hex');
});

module.exports = mongoose.model('Permit', permitSchema);
