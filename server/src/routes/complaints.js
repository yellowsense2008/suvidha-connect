import 'dotenv/config';
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const genHash = (d) => { let h=0n; for(let i=0;i<d.length;i++) h=(h*31n+BigInt(d.charCodeAt(i)))&0xFFFFFFFFFFFFFFFFn; return h.toString(16).padStart(16,'0')+Date.now().toString(16); };

const SLA_DAYS = {
  power_outage:1, gas_leakage:1, water_supply:3, sewage:3,
  garbage:5, streetlight:7, road_damage:14, water_quality:3,
  property_tax:7, incorrect_bill:7, delay_connection:7,
  delay_meter:7, disconnection:2, other:7
};

const OFFICERS = {
  electricity: ['Er. Suresh Baruah','Er. Dipak Kalita','Er. Ranjit Bora'],
  gas: ['Insp. Mridul Hazarika','Insp. Pranjal Deka'],
  municipal: ['JE Bikash Nath','JE Sanjay Das','JE Anita Gogoi'],
};
const DEPTS = {
  electricity: 'APDCL – Guwahati East Division',
  gas: 'Assam Gas Company Ltd.',
  municipal: 'Guwahati Municipal Corporation',
};

// GET /api/complaints/citizen/:citizenId
router.get('/citizen/:citizenId', async (req, res) => {
  const result = await query(
    'SELECT * FROM complaints WHERE citizen_id = $1 ORDER BY created_at DESC',
    [req.params.citizenId]
  );
  res.json({ complaints: result.rows });
});

// GET /api/complaints/track/:id
router.get('/track/:id', async (req, res) => {
  const result = await query(
    'SELECT * FROM complaints WHERE id = $1',
    [req.params.id.toUpperCase()]
  );
  if (!result.rows.length)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Complaint not found.' } });
  res.json({ complaint: result.rows[0] });
});

// POST /api/complaints
router.post('/', async (req, res) => {
  const { citizenId, category, description, location, attachments = [], org = 'electricity', geoCoords } = req.body;

  if (!citizenId || !category || !description || !location)
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'All required fields must be filled.' } });

  const complaintId = genId('COMP').replace(/-/g,'').slice(0,12);
  const timestamp = new Date().toISOString();
  const slaDays = SLA_DAYS[category] || 7;
  const slaDate = new Date(Date.now() + slaDays * 86400000).toISOString();
  const officers = OFFICERS[org] || OFFICERS.electricity;
  const assignedOfficer = officers[Math.floor(Math.random() * officers.length)];
  const assignedDept = DEPTS[org] || DEPTS.electricity;

  const lastHash = (await query('SELECT hash FROM integrity_ledger ORDER BY created_at DESC LIMIT 1')).rows[0]?.hash || '0'.repeat(16);
  const integrityHash = genHash(`${complaintId}${category}${timestamp}${lastHash}`);

  await query(
    `INSERT INTO complaints (id, citizen_id, category, description, location, geo_lat, geo_lng, status, org, attachments, integrity_hash, sla, assigned_officer, assigned_dept, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10,$11,$12,$13,$14)`,
    [
      complaintId, citizenId, category, description, location,
      geoCoords?.lat || null, geoCoords?.lng || null,
      org, attachments, integrityHash, slaDate,
      assignedOfficer, assignedDept, 'Complaint received. Under review.'
    ]
  );

  await query(
    'INSERT INTO integrity_ledger (id, record_type, record_id, hash, previous_hash) VALUES ($1,$2,$3,$4,$5)',
    [genId('IR'), 'complaint', complaintId, integrityHash, lastHash]
  );

  await query(
    'INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [genId('LOG'), req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'COMPLAINT_SUBMITTED', citizenId, `Category: ${category}`, req.ip]
  );

  // Award 30 points for civic engagement
  await query('UPDATE citizens SET points = points + 30 WHERE id = $1', [citizenId]);

  res.status(201).json({ success: true, complaintId, sla: slaDate, assignedOfficer, assignedDept, integrityHash });
});

export default router;
