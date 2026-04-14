import 'dotenv/config';
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();
const otpStore = new Map(); // { mobile: { otp, expiresAt, attempts } }

// POST /api/auth/otp/request
router.post('/otp/request', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10)
    return res.status(400).json({ error: { code: 'INVALID_MOBILE', message: 'Enter a valid 10-digit mobile number.' } });

  const existing = otpStore.get(mobile);
  if (existing?.attempts >= 3 && Date.now() < existing.lockedUntil)
    return res.status(429).json({ error: { code: 'RATE_LIMIT', message: 'Too many OTP requests. Try again in 15 minutes.' } });

  const otp = '123456'; // demo fixed OTP
  otpStore.set(mobile, {
    otp, expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: (existing?.attempts || 0) + 1,
    lockedUntil: (existing?.attempts || 0) >= 2 ? Date.now() + 15 * 60 * 1000 : 0
  });

  console.log(`[OTP] ${mobile} → ${otp}`);
  res.json({ success: true, message: 'OTP sent to registered mobile.', expiresIn: 300 });
});

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req, res) => {
  const { mobile, otp } = req.body;
  const stored = otpStore.get(mobile);

  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt)
    return res.status(401).json({ error: { code: 'INVALID_OTP', message: 'OTP is incorrect or has expired.' } });

  otpStore.delete(mobile);

  // Fetch from DB
  let citizen = (await query('SELECT * FROM citizens WHERE mobile = $1', [mobile])).rows[0];
  if (!citizen) citizen = (await query('SELECT * FROM citizens LIMIT 1')).rows[0]; // demo fallback

  // Audit log
  await query(
    'INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [`LOG${Date.now()}`, req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'LOGIN_OTP_SUCCESS', citizen.id, `OTP login: ${mobile}`, req.ip]
  );

  res.json({ success: true, citizen: sanitizeCitizen(citizen) });
});

// POST /api/auth/consumer/login
router.post('/consumer/login', async (req, res) => {
  const { consumerId, pin } = req.body;
  const result = await query('SELECT * FROM citizens WHERE consumer_id = $1 AND pin = $2', [consumerId, pin]);

  if (!result.rows.length)
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Consumer ID or PIN is incorrect.' } });

  const citizen = result.rows[0];

  await query(
    'INSERT INTO audit_logs (id, kiosk_id, action, user_id, details, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
    [`LOG${Date.now()}`, req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', 'LOGIN_CONSUMER_SUCCESS', citizen.id, `Consumer ID: ${consumerId}`, req.ip]
  );

  res.json({ success: true, citizen: sanitizeCitizen(citizen) });
});

function sanitizeCitizen(c) {
  return {
    id: c.id, name: c.name, mobile: c.mobile,
    aadhaar: `XXXX-XXXX-${(c.aadhaar || '0000').slice(-4)}`,
    address: c.address, consumerId: c.consumer_id,
    email: c.email, points: c.points || 0
  };
}

export default router;
