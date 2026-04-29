import 'dotenv/config';
import { connectDB } from './mongo.js';
import { Citizen, Bill, CivicAlert, IntegrityLedger } from '../models/index.js';

const genHash = (d) => {
  let h = 0n;
  for (let i = 0; i < d.length; i++) h = (h * 31n + BigInt(d.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFn;
  return h.toString(16).padStart(16, '0') + Date.now().toString(16);
};

async function seed() {
  await connectDB();
  console.log('\n🌱 Seeding suvidha database...\n');

  // ── Citizens ────────────────────────────────────────────────────────────────
  await Citizen.deleteMany({});
  await Citizen.insertMany([
    { id: 'CIT001', name: 'Rajesh Kumar', mobile: '9876543210', aadhaar: 'XXXX-XXXX-1234', address: '123 MG Road, Sector 5, Guwahati', consumerId: 'ELEC2024001', pin: '1234', email: 'rajesh@example.com', points: 150 },
    { id: 'CIT002', name: 'Priya Sharma', mobile: '9876543211', aadhaar: 'XXXX-XXXX-5678', address: '456 Nehru Place, Block B, Guwahati', consumerId: 'ELEC2024002', pin: '5678', email: 'priya@example.com', points: 50 },
    { id: 'CIT003', name: 'Amit Das', mobile: '9876543212', aadhaar: 'XXXX-XXXX-9012', address: '789 Dispur Lane, Sector 3, Guwahati', consumerId: 'GAS2024001', pin: '2345', email: 'amit@example.com', points: 80 },
  ]);
  console.log('✅ Citizens seeded (3)');

  // ── Bills ───────────────────────────────────────────────────────────────────
  await Bill.deleteMany({});
  await Bill.insertMany([
    { id: 'BILL001', consumerId: 'ELEC2024001', type: 'electricity', amount: 2450, dueDate: new Date('2026-04-15'), status: 'pending', units: 245, billDate: new Date('2026-03-15'), previousPayments: [{ date: '2026-02-05', amount: 2100, transactionId: 'TXN202502001', paymentMethod: 'UPI' }] },
    { id: 'BILL002', consumerId: 'ELEC2024001', type: 'gas', amount: 850, dueDate: new Date('2026-04-20'), status: 'pending', units: 12, billDate: new Date('2026-03-20'), previousPayments: [] },
    { id: 'BILL003', consumerId: 'ELEC2024001', type: 'water', amount: 320, dueDate: new Date('2026-03-25'), status: 'overdue', units: 5000, billDate: new Date('2026-03-01'), previousPayments: [] },
    { id: 'BILL004', consumerId: 'GAS2024001', type: 'gas', amount: 1100, dueDate: new Date('2026-04-18'), status: 'pending', units: 18, billDate: new Date('2026-03-18'), previousPayments: [] },
  ]);
  console.log('✅ Bills seeded (4)');

  // ── Civic Alerts ────────────────────────────────────────────────────────────
  await CivicAlert.deleteMany({});
  await CivicAlert.insertMany([
    { id: 'ALERT001', type: 'maintenance', title: 'Scheduled Power Maintenance', titleHindi: 'निर्धारित बिजली रखरखाव', titleAssamese: 'নিৰ্ধাৰিত বিদ্যুৎ ৰক্ষণাবেক্ষণ', message: 'Power supply will be interrupted in Sectors 4-8 on Apr 5 from 10 AM to 2 PM.', messageHindi: 'सेक्टर 4-8 में 5 अप्रैल को सुबह 10 बजे से दोपहर 2 बजे तक बिजली बाधित रहेगी।', severity: 'warning', zones: ['Sector 4', 'Sector 5', 'Sector 6'], expiresAt: new Date('2030-04-05') },
    { id: 'ALERT002', type: 'emergency', title: 'Gas Leak Reported – Sector 9', titleHindi: 'सेक्टर 9 में गैस रिसाव', titleAssamese: 'ছেক্টৰ 9ত গেছ লিক', message: 'CRITICAL: Gas leak reported near Sector 9 market. Avoid open flames. Helpline: 1906.', messageHindi: 'गंभीर: सेक्टर 9 बाजार के पास गैस रिसाव। खुली आग से बचें।', severity: 'critical', zones: ['Sector 9'], expiresAt: new Date('2030-03-25') },
  ]);
  console.log('✅ Civic alerts seeded (2)');

  // ── Integrity Ledger genesis ─────────────────────────────────────────────────
  await IntegrityLedger.deleteMany({});
  await IntegrityLedger.create({ id: 'IR000', recordType: 'payment', recordId: 'GENESIS', hash: '0000000000000000', previousHash: '0000000000000000', verified: true });
  console.log('✅ Integrity ledger genesis block created');

  console.log('\n🎉 MongoDB suvidha database seeded successfully!\n');
  process.exit(0);
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
