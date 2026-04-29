import 'dotenv/config';
import { Router } from 'express';
import { Bill, IntegrityLedger, AuditLog, Citizen } from '../models/index.js';

const router = Router();
const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const genHash = (d) => { let h=0n; for(let i=0;i<d.length;i++) h=(h*31n+BigInt(d.charCodeAt(i)))&0xFFFFFFFFFFFFFFFFn; return h.toString(16).padStart(16,'0')+Date.now().toString(16); };

// GET /api/bills/:consumerId
router.get('/:consumerId', async (req, res) => {
  const query = { consumerId: req.params.consumerId };
  if (req.query.type) query.type = req.query.type;
  const bills = await Bill.find(query).sort({ dueDate: 1 });
  res.json({ bills });
});

// POST /api/bills/:billId/pay
router.post('/:billId/pay', async (req, res) => {
  const { paymentMethod = 'UPI', citizenId = 'CIT001' } = req.body;
  const bill = await Bill.findOne({ id: req.params.billId });
  if (!bill) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bill not found.' } });
  if (bill.status === 'paid') return res.status(400).json({ error: { code: 'ALREADY_PAID', message: 'This bill has already been paid.' } });

  const transactionId = genId('TXN');
  const today = new Date().toISOString().split('T')[0];

  bill.status = 'paid';
  bill.previousPayments.unshift({ date: today, amount: bill.amount, transactionId, paymentMethod });
  await bill.save();

  const lastRecord = await IntegrityLedger.findOne().sort({ createdAt: -1 });
  const lastHash = lastRecord?.hash || '0'.repeat(16);
  const newHash = genHash(`${transactionId}${bill.amount}${new Date().toISOString()}${lastHash}`);

  await IntegrityLedger.create({ id: genId('IR'), recordType: 'payment', recordId: transactionId, hash: newHash, previousHash: lastHash });
  await AuditLog.create({ id: genId('LOG'), kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'BILL_PAYMENT', userId: citizenId, details: `${bill.type} ₹${bill.amount} via ${paymentMethod}`, ipAddress: req.ip });
  await Citizen.updateOne({ id: citizenId }, { $inc: { points: 20 } });

  res.json({ success: true, receipt: { receiptId: genId('RCP'), transactionId, billId: bill.id, type: bill.type, amount: bill.amount, paymentMethod, timestamp: new Date().toISOString(), integrityHash: newHash, consumerId: bill.consumerId } });
});

export default router;
