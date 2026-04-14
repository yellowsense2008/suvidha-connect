import 'dotenv/config';
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

const genId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

const genHash = (data) => {
  let h = 0n;
  for (let i = 0; i < data.length; i++) h = (h * 31n + BigInt(data.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFn;
  return h.toString(16).padStart(16,'0') + Date.now().toString(16);
};

// GET /api/bills/:consumerId
router.get('/:consumerId', async (req, res) => {
  const { consumerId } = req.params;
  const { type } = req.query;

  let sql = 'SELECT b.*, COALESCE(json_agg(p ORDER BY p.payment_date DESC) FILTER (WHERE p.id IS NOT NULL), \'[]\') AS previous_payments FROM bills b LEFT JOIN bill_payments p ON p.bill_id = b.id WHERE b.consumer_id = $1';
  const params = [consumerId];

  if (type) { sql += ' AND b.type = $2'; params.push(type); }
  sql += ' GROUP BY b.id ORDER BY b.due_date ASC';

  const result = await query(sql, params);
  res.json({ bills: result.rows });
});

// POST /api/bills/:billId/pay
router.post('/:billId/pay', async (req, res) => {
  const { billId } = req.params;
  const { paymentMethod = 'UPI', citizenId = 'CIT001' } = req.body;

  const billRes = await query('SELECT * FROM bills WHERE id = $1', [billId]);
  if (!billRes.rows.length)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bill not found.' } });

  const bill = billRes.rows[0];
  if (bill.status === 'paid')
    return res.status(400).json({ error: { code: 'ALREADY_PAID', message: 'This bill has already been paid.' } });

  const transactionId = genId('TXN');
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // Update bill status
  await query('UPDATE bills SET status = $1 WHERE id = $2', ['paid', billId]);

  // Record payment
  await query(
    'INSERT INTO bill_payments (bill_id, amount, transaction_id, payment_date, payment_method) VALUES ($1,$2,$3,$4,$5)',
    [billId, bill.amount, transactionId, today, paymentMethod]
  );

  // Integrity ledger
  const lastHash = (await query('SELECT hash FROM integrity_ledger ORDER BY created_at DESC LIMIT 1')).rows[0]?.hash || '0'.repeat(16);
  const newHash = genHash(`${transactionId}${bill.amount}${timestamp}${lastHash}`);
  await query(
    'INSERT INTO integrity_ledger (id, record_type, record_id, hash, previous_hash) VALUES ($1,$2,$3,$4,$5)',
    [genId('IR'), 'payment', transactionId, newHash, lastHash]
  );

  // Audit log
  await query(
    'INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [genId('LOG'), req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'BILL_PAYMENT', citizenId, `${bill.type} ₹${bill.amount} via ${paymentMethod}`, req.ip]
  );

  // Award points
  await query('UPDATE citizens SET points = points + 20 WHERE id = $1', [citizenId]);

  res.json({
    success: true,
    receipt: {
      receiptId: genId('RCP'), transactionId,
      billId, type: bill.type, amount: bill.amount,
      paymentMethod, timestamp, integrityHash: newHash,
      consumerId: bill.consumer_id
    }
  });
});

export default router;
