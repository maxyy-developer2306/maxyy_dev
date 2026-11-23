const router = require('express').Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const Permit = require('../models/Permit');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const { search = '', status = 'all' } = req.query;
  const query = { archived: false };
  if (status === 'active' || status === 'inactive') query.status = status;
  if (search) {
    query.$or = [
      { permitNumber: { $regex: search, $options: 'i' } },
      { workerName: { $regex: search, $options: 'i' } },
      { iqamaNumber: { $regex: search, $options: 'i' } }
    ];
  }
  const permits = await Permit.find(query).sort({ createdAt: -1 }).lean();
  res.json({ permits });
});

router.get('/:id', async (req, res) => {
  const permit = await Permit.findOne({ _id: req.params.id, archived: false });
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  res.json({ permit });
});

router.post('/', async (req, res) => {
  if (!req.body.permitNumber?.trim() || !req.body.workerName?.trim() || !req.body.iqamaNumber?.trim()) {
    return res.status(400).json({ error: 'Permit Number, Worker Name, and Iqama / ID Number are required' });
  }
  try {
    const permit = await Permit.create({ ...req.body, qrToken: crypto.randomBytes(32).toString('hex') });
    res.status(201).json({ permit });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'QR token already exists' });
    if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
    throw error;
  }
});

router.put('/:id', async (req, res) => {
  const permit = await Permit.findOne({ _id: req.params.id, archived: false });
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  const updates = { ...req.body };
  delete updates.qrToken;
  delete updates._id;
  delete updates.archived;
  delete updates.status;
  Object.assign(permit, updates);
  await permit.save();
  res.json({ permit });
});

router.patch('/:id/status', async (req, res) => {
  if (!['active', 'inactive'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  const permit = await Permit.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  res.json({ permit });
});

router.delete('/:id', async (req, res) => {
  const permit = await Permit.findOneAndUpdate(
    { _id: req.params.id, archived: false },
    { archived: true, archivedAt: new Date() },
    { new: true }
  );
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  res.json({ message: 'Permit archived successfully', permit });
});

router.get('/:id/qr', async (req, res) => {
  const permit = await Permit.findOne({ _id: req.params.id, archived: false });
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  const url = `${process.env.MAXYY_PUBLIC_URL.replace(/\/$/, '')}/q/${permit.qrToken}`;
  res.json({ url, qrDataUrl: await QRCode.toDataURL(url, { width: 512, margin: 2 }) });
});

router.get('/:id/qr/download', async (req, res) => {
  const permit = await Permit.findOne({ _id: req.params.id, archived: false });
  if (!permit) return res.status(404).json({ error: 'Permit not found' });
  const url = `${process.env.MAXYY_PUBLIC_URL.replace(/\/$/, '')}/q/${permit.qrToken}`;
  const png = await QRCode.toBuffer(url, { width: 1024, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="permit-${permit.permitNumber}.png"`);
  res.send(png);
});

module.exports = router;
