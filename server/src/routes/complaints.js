import 'dotenv/config';
import { Router } from 'express';
import { Complaint, IntegrityLedger, AuditLog, Citizen } from '../models/index.js';

const router = Router();
const genId = (p) => `${p}${Date.now().toString().slice(-8)}`;
const genHash = (d) => { let h=0n; for(let i=0;i<d.length;i++) h=(h*31n+BigInt(d.charCodeAt(i)))&0xFFFFFFFFFFFFFFFFn; return h.toString(16).padStart(16,'0')+Date.now().toString(16); };

const SLA_DAYS = { power_outage:1, gas_leakage:1, water_supply:3, sewage:3, garbage:5, streetlight:7, road_damage:14, water_quality:3, property_tax:7, incorrect_bill:7, delay_connection:7, delay_meter:7, disconnection:2, other:7 };
const OFFICERS = { electricity: ['Er. Suresh Baruah','Er. Dipak Kalita','Er. Ranjit Bora'], gas: ['Insp. Mridul Hazarika','Insp. Pranjal Deka'], municipal: ['JE Bikash Nath','JE Sanjay Das','JE Anita Gogoi'] };
const DEPTS = { electricity: 'APDCL – Guwahati East Division', gas: 'Assam Gas Company Ltd.', municipal: 'Guwahati Municipal Corporation' };

// GET /api/complaints/citizen/:citizenId
router.get('/citizen/:citizenId', async (req, res) => {
  const complaints = await Complaint.find({ citizenId: req.params.citizenId }).sort({ createdAt: -1 });
  res.json({ complaints });
});

// GET /api/complaints/track/:id
router.get('/track/:id', async (req, res) => {
  const complaint = await Complaint.findOne({ id: req.params.id });
  if (!complaint) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Complaint not found.' } });
  res.json({ complaint });
});

// POST /api/complaints
router.post('/', async (req, res) => {
  const { citizenId, category, description, location, attachments = [], org = 'electricity', geoCoords } = req.body;
  if (!citizenId || !category || !description || !location)
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'All required fields must be filled.' } });

  const complaintId = genId('COMP');
  const slaDays = SLA_DAYS[category] || 7;
  const slaDate = new Date(Date.now() + slaDays * 86400000);
  const officers = OFFICERS[org] || OFFICERS.electricity;
  const assignedOfficer = officers[Math.floor(Math.random() * officers.length)];
  const assignedDept = DEPTS[org] || DEPTS.electricity;

  const lastRecord = await IntegrityLedger.findOne().sort({ createdAt: -1 });
  const lastHash = lastRecord?.hash || '0'.repeat(16);
  const integrityHash = genHash(`${complaintId}${category}${new Date().toISOString()}${lastHash}`);

  await Complaint.create({ id: complaintId, citizenId, category, description, location, geoLat: geoCoords?.lat, geoLng: geoCoords?.lng, status: 'pending', org, attachments, integrityHash, sla: slaDate, assignedOfficer, assignedDept, remarks: 'Complaint received. Under review.' });
  await IntegrityLedger.create({ id: `IR${Date.now()}`, recordType: 'complaint', recordId: complaintId, hash: integrityHash, previousHash: lastHash });
  await AuditLog.create({ id: `LOG${Date.now()}`, kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'COMPLAINT_SUBMITTED', userId: citizenId, details: `Category: ${category}`, ipAddress: req.ip });
  await Citizen.updateOne({ id: citizenId }, { $inc: { points: 30 } });

  res.status(201).json({ success: true, complaintId, sla: slaDate, assignedOfficer, assignedDept, integrityHash });
});

export default router;
