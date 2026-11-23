const router = require('express').Router();
const Permit = require('../models/Permit');

function publicFields(permit) {
  return {
    permitNumber: permit.permitNumber,
    permitType: permit.permitType,
    issueDate: permit.issueDate,
    expiryDate: permit.expiryDate,
    workerName: permit.workerName,
    iqamaNumber: permit.iqamaNumber,
    nationality: permit.nationality,
    jobTitle: permit.jobTitle,
    dateOfBirth: permit.dateOfBirth,
    iqamaMosasaNumber: permit.iqamaMosasaNumber,
    establishmentName: permit.establishmentName,
    gender: permit.gender
  };
}

router.get('/verify/:token', async (req, res) => {
  if (!/^[a-f0-9]{64}$/.test(req.params.token)) return res.status(400).json({ status: 'invalid', valid: false, message: 'Invalid permit token' });
  const permit = await Permit.findOne({ qrToken: req.params.token, archived: false }).lean();
  if (!permit) return res.status(404).json({ status: 'invalid', valid: false, message: 'Permit not found' });
  if (permit.status === 'inactive') {
    return res.json({ status: 'inactive', valid: false, message: 'This permit is inactive', permit: null });
  }
  res.json({ status: 'active', valid: true, message: 'Permit is active', permit: publicFields(permit) });
});

router.get('/q/:token', async (req, res) => {
  if (!/^[a-f0-9]{64}$/.test(req.params.token)) return res.status(400).send('Invalid QR token');
  const permit = await Permit.findOne({ qrToken: req.params.token, archived: false }).lean();
  if (!permit) return res.status(404).send('Permit not found');

  const template = process.env.AJEER_DESTINATION_URL;
  if (!template) return res.status(500).send('AJEER destination is not configured');
  let destination;
  try {
    destination = template.includes(':token')
      ? template.replace(':token', encodeURIComponent(req.params.token))
      : (() => { throw new Error('Destination must include :token'); })();
    const allowed = new URL(template.replace(':token', 'TOKEN')).origin;
    const target = new URL(destination);
    if (target.origin !== allowed) throw new Error('Destination origin mismatch');
  } catch {
    return res.status(500).send('Invalid or unsafe AJEER destination');
  }
  res.redirect(302, destination);
});

module.exports = router;
