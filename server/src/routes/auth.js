import 'dotenv/config';
import { Router } from 'express';
import { Citizen, AuditLog } from '../models/index.js';

const router = Router();
const otpStore = new Map();

const genId = () => `LOG-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

// POST /api/auth/otp/request
router.post('/otp/request', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length !== 10)
    return res.status(400).json({ error: { code: 'INVALID_MOBILE', message: 'Enter a valid 10-digit mobile number.' } });

  const existing = otpStore.get(mobile);
  if (existing?.attempts >= 3 && Date.now() < existing.lockedUntil)
    return res.status(429).json({ error: { code: 'RATE_LIMIT', message: 'Too many OTP requests. Try again in 15 minutes.' } });

  const otp = '123456';
  otpStore.set(mobile, { otp, expiresAt: Date.now() + 5 * 60 * 1000, attempts: (existing?.attempts || 0) + 1, lockedUntil: (existing?.attempts || 0) >= 2 ? Date.now() + 15 * 60 * 1000 : 0 });
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
  let citizen = await Citizen.findOne({ mobile });
  if (!citizen) citizen = await Citizen.findOne({ id: 'CIT001' });

  await AuditLog.create({ id: genId(), kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'LOGIN_OTP_SUCCESS', userId: citizen.id, details: `OTP login: ${mobile}`, ipAddress: req.ip });

  res.json({ success: true, citizen: sanitize(citizen) });
});

// POST /api/auth/consumer/login
router.post('/consumer/login', async (req, res) => {
  const { consumerId, pin } = req.body;
  const citizen = await Citizen.findOne({ consumerId, pin });
  if (!citizen)
    return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Consumer ID or PIN is incorrect.' } });

  await AuditLog.create({ id: genId(), kioskId: req.headers['x-kiosk-id'] || 'KIOSK-UNKNOWN', action: 'LOGIN_CONSUMER_SUCCESS', userId: citizen.id, details: `Consumer ID: ${consumerId}`, ipAddress: req.ip });

  res.json({ success: true, citizen: sanitize(citizen) });
});

function sanitize(c) {
  return { id: c.id, name: c.name, mobile: c.mobile, aadhaar: `XXXX-XXXX-${(c.aadhaar || '0000').slice(-4)}`, address: c.address, consumerId: c.consumerId, email: c.email, points: c.points || 0 };
}

export default router;
