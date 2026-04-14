import 'dotenv/config';
import { Router } from 'express';
import { query } from '../db/pool.js';

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
  const sla = new Date(Date.now() + 15 * 86400000).toISOString();

  await query(
    `INSERT INTO service_requests (id, citizen_id, type, request_subtype, applicant_name, address, id_proof_type, load_kw, documents, status, reference_number, sla, assigned_officer, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'submitted',$10,$11,$12,$13)`,
    [genId('REQ'), citizenId, type, requestSubtype || type, applicantName, address, idProofType, loadKW || null, documents, referenceNumber, sla, 'Er. Dipak Kalita', 'Application received. Processing in 15 working days.']
  );

  const lastHash = (await query('SELECT hash FROM integrity_ledger ORDER BY created_at DESC LIMIT 1')).rows[0]?.hash || '0'.repeat(16);
  const hash = genHash(`${referenceNumber}${type}${new Date().toISOString()}${lastHash}`);
  await query('INSERT INTO integrity_ledger (id, record_type, record_id, hash, previous_hash) VALUES ($1,$2,$3,$4,$5)',
    [genId('IR'), 'request', referenceNumber, hash, lastHash]);

  await query('INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [genId('LOG'), req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'SERVICE_REQUEST', citizenId, `Type: ${type}, Ref: ${referenceNumber}`, req.ip]);

  await query('UPDATE citizens SET points = points + 10 WHERE id = $1', [citizenId]);

  res.status(201).json({ success: true, referenceNumber, sla, estimatedDays: 15 });
});

router.get('/requests/track/:id', async (req, res) => {
  const result = await query(
    'SELECT * FROM service_requests WHERE reference_number = $1 OR id = $1',
    [req.params.id]
  );
  if (!result.rows.length)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Request not found.' } });
  res.json({ request: result.rows[0] });
});

// ─── Credentials ──────────────────────────────────────────────────────────────

router.get('/credentials/:citizenId', async (req, res) => {
  const result = await query('SELECT * FROM citizens WHERE id = $1', [req.params.citizenId]);
  if (!result.rows.length)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Citizen not found.' } });
  const c = result.rows[0];
  res.json({ citizen: {
    id: c.id, name: c.name, mobile: c.mobile, email: c.email,
    address: c.address, consumerId: c.consumer_id, points: c.points,
    aadhaar: `XXXX-XXXX-${(c.aadhaar || '0000').slice(-4)}`
  }});
});

router.patch('/credentials/:citizenId', async (req, res) => {
  const { name, mobile, email, address } = req.body;
  const { citizenId } = req.params;

  await query(
    'UPDATE citizens SET name=COALESCE($1,name), mobile=COALESCE($2,mobile), email=COALESCE($3,email), address=COALESCE($4,address), updated_at=NOW() WHERE id=$5',
    [name || null, mobile || null, email || null, address || null, citizenId]
  );

  const lastHash = (await query('SELECT hash FROM integrity_ledger ORDER BY created_at DESC LIMIT 1')).rows[0]?.hash || '0'.repeat(16);
  const receiptId = genId('UPD');
  const hash = genHash(`${receiptId}${citizenId}${new Date().toISOString()}${lastHash}`);
  await query('INSERT INTO integrity_ledger (id, record_type, record_id, hash, previous_hash) VALUES ($1,$2,$3,$4,$5)',
    [genId('IR'), 'credential_update', receiptId, hash, lastHash]);

  await query('INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [genId('LOG'), req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'CREDENTIAL_UPDATE', citizenId,
     `Updated: ${Object.keys(req.body).join(', ')}`, req.ip]);

  res.json({ success: true, receiptId });
});

// ─── Civic Alerts ─────────────────────────────────────────────────────────────

router.get('/alerts', async (_req, res) => {
  const result = await query('SELECT * FROM civic_alerts WHERE expires_at > NOW() ORDER BY created_at DESC');
  res.json({ alerts: result.rows });
});

router.post('/alerts', async (req, res) => {
  const { title, titleHindi, titleAssamese, message, messageHindi, type, severity, zones, expiresAt } = req.body;
  const id = genId('ALERT');
  await query(
    'INSERT INTO civic_alerts (id, type, title, title_hindi, title_assamese, message, message_hindi, severity, zones, expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, type, title, titleHindi || title, titleAssamese || title, message, messageHindi || message, severity, zones || ['All Zones'], expiresAt]
  );
  res.status(201).json({ success: true, alertId: id });
});

// ─── Integrity Ledger ─────────────────────────────────────────────────────────

router.get('/ledger', async (_req, res) => {
  const result = await query('SELECT * FROM integrity_ledger ORDER BY created_at DESC LIMIT 50');
  res.json({ records: result.rows });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

router.get('/admin/stats', async (_req, res) => {
  const [bills, complaints, requests, citizens, ledger] = await Promise.all([
    query('SELECT COUNT(*) total, SUM(amount) revenue FROM bill_payments'),
    query('SELECT COUNT(*) total, COUNT(*) FILTER (WHERE status=\'resolved\') resolved, COUNT(*) FILTER (WHERE status=\'pending\') pending FROM complaints'),
    query('SELECT COUNT(*) total FROM service_requests'),
    query('SELECT COUNT(*) total FROM citizens'),
    query('SELECT COUNT(*) total FROM integrity_ledger'),
  ]);
  res.json({
    totalTransactions: parseInt(bills.rows[0].total),
    totalRevenue: parseFloat(bills.rows[0].revenue || 0),
    complaintsReceived: parseInt(complaints.rows[0].total),
    complaintsResolved: parseInt(complaints.rows[0].resolved),
    pendingComplaints: parseInt(complaints.rows[0].pending),
    newConnections: parseInt(requests.rows[0].total),
    totalCitizens: parseInt(citizens.rows[0].total),
    integrityRecords: parseInt(ledger.rows[0].total),
  });
});

router.get('/admin/audit-logs', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const [logs, count] = await Promise.all([
    query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
    query('SELECT COUNT(*) total FROM audit_logs'),
  ]);
  res.json({ logs: logs.rows, total: parseInt(count.rows[0].total) });
});

// ─── Points ───────────────────────────────────────────────────────────────────

router.post('/points/award', async (req, res) => {
  const { citizenId, points, reason } = req.body;
  const result = await query('UPDATE citizens SET points = points + $1 WHERE id = $2 RETURNING points', [points, citizenId]);
  if (!result.rows.length)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Citizen not found.' } });
  res.json({ success: true, totalPoints: result.rows[0].points, reason });
});

export default router;
