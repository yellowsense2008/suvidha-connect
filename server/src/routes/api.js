import 'dotenv/config';
import { Router } from 'express';
import { Citizen, ServiceRequest, CivicAlert, IntegrityLedger, AuditLog, Bill, Complaint } from '../models/index.js';

const router = Router();
const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const genHash = (d) => { let h=0n; for(let i=0;i<d.length;i++) h=(h*31n+BigInt(d.charCodeAt(i)))&0xFFFFFFFFFFFFFFFFn; return h.toString(16).padStart(16,'0')+Date.now().toString(16); };

// ─── Service Requests ─────────────────────────────────────────────────────────
router.post('/requests', async (req, res) => {
  const { citizenId, type, applicantName, address, idProofType, requestSubtype, loadKW, documents = [] } = req.body;
  if (!citizenId || !type || !applicantName || !address)
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Required fields missing.' } });

  const prefix = type.slice(0,4).toUpperCase();
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000 + 10000);
  const referenceNumber = `${prefix}-REQ-${year}-${rand}`;
  const sla = new Date(Date.now() + 15 * 86400000);

  await ServiceRequest.create({ id: genId('REQ'), citizenId, type, requestSubtype: requestSubtype || type, applicantName, address, idProofType, loadKw: loadKW || null, documents, status: 'submitted', referenceNumber, sla, assignedOfficer: 'Er. Dipak Kalita', remarks: 'Application received. Processing in 15 working days.' });

  const lastRecord = await IntegrityLedger.findOne().sort({ createdAt: -1 });
  const lastHash = lastRecord?.hash || '0'.repeat(16);
  await IntegrityLedger.create({ id: genId('IR'), recordType: 'request', recordId: referenceNumber, hash: genHash(`${referenceNumber}${type}${new Date().toISOString()}${lastHash}`), previousHash: lastHash });
  await AuditLog.create({ id: genId('LOG'), kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'SERVICE_REQUEST', userId: citizenId, details: `Type: ${type}, Ref: ${referenceNumber}`, ipAddress: req.ip });
  await Citizen.updateOne({ id: citizenId }, { $inc: { points: 10 } });

  res.status(201).json({ success: true, referenceNumber, sla, estimatedDays: 15 });
});

router.get('/requests/track/:id', async (req, res) => {
  const request = await ServiceRequest.findOne({ $or: [{ referenceNumber: req.params.id }, { id: req.params.id }] });
  if (!request) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found.' } });
  res.json({ request });
});

// ─── Credentials ──────────────────────────────────────────────────────────────
router.get('/credentials/:citizenId', async (req, res) => {
  const citizen = await Citizen.findOne({ id: req.params.citizenId });
  if (!citizen) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Citizen not found.' } });
  res.json({ citizen: { id: citizen.id, name: citizen.name, mobile: citizen.mobile, email: citizen.email, address: citizen.address, consumerId: citizen.consumerId, points: citizen.points, aadhaar: `XXXX-XXXX-${(citizen.aadhaar || '0000').slice(-4)}` } });
});

router.patch('/credentials/:citizenId', async (req, res) => {
  const { name, mobile, email, address } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (mobile) updates.mobile = mobile;
  if (email) updates.email = email;
  if (address) updates.address = address;

  await Citizen.updateOne({ id: req.params.citizenId }, { $set: updates });

  const lastRecord = await IntegrityLedger.findOne().sort({ createdAt: -1 });
  const lastHash = lastRecord?.hash || '0'.repeat(16);
  const receiptId = genId('UPD');
  await IntegrityLedger.create({ id: genId('IR'), recordType: 'credential_update', recordId: receiptId, hash: genHash(`${receiptId}${req.params.citizenId}${new Date().toISOString()}${lastHash}`), previousHash: lastHash });
  await AuditLog.create({ id: genId('LOG'), kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'CREDENTIAL_UPDATE', userId: req.params.citizenId, details: `Updated: ${Object.keys(updates).join(', ')}`, ipAddress: req.ip });

  res.json({ success: true, receiptId });
});

// ─── Civic Alerts ─────────────────────────────────────────────────────────────
router.get('/alerts', async (_req, res) => {
  const alerts = await CivicAlert.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json({ alerts });
});

router.post('/alerts', async (req, res) => {
  const { title, titleHindi, titleAssamese, message, messageHindi, type, severity, zones, expiresAt } = req.body;
  const alert = await CivicAlert.create({ id: genId('ALERT'), type, title, titleHindi: titleHindi || title, titleAssamese: titleAssamese || title, message, messageHindi: messageHindi || message, severity, zones: zones || ['All Zones'], expiresAt });
  res.status(201).json({ success: true, alertId: alert.id });
});

// ─── Integrity Ledger ─────────────────────────────────────────────────────────
router.get('/ledger', async (_req, res) => {
  const records = await IntegrityLedger.find().sort({ createdAt: -1 }).limit(50);
  res.json({ records });
});

// ─── Admin Stats ──────────────────────────────────────────────────────────────
router.get('/admin/stats', async (_req, res) => {
  const [totalCitizens, totalComplaints, pendingComplaints, resolvedComplaints, totalRequests, totalLedger, billPayments] = await Promise.all([
    Citizen.countDocuments(),
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'resolved' }),
    ServiceRequest.countDocuments(),
    IntegrityLedger.countDocuments(),
    Bill.aggregate([{ $unwind: '$previousPayments' }, { $group: { _id: null, total: { $sum: '$previousPayments.amount' }, count: { $sum: 1 } } }]),
  ]);
  res.json({ totalCitizens, totalComplaints, pendingComplaints, resolvedComplaints, newConnections: totalRequests, integrityRecords: totalLedger, totalTransactions: billPayments[0]?.count || 0, totalRevenue: billPayments[0]?.total || 0 });
});

router.get('/admin/audit-logs', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    AuditLog.countDocuments(),
  ]);
  res.json({ logs, total });
});

// ─── Points ───────────────────────────────────────────────────────────────────
router.post('/points/award', async (req, res) => {
  const { citizenId, points, reason } = req.body;
  const citizen = await Citizen.findOneAndUpdate({ id: citizenId }, { $inc: { points } }, { new: true });
  if (!citizen) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Citizen not found.' } });
  res.json({ success: true, totalPoints: citizen.points, reason });
});

export default router;
