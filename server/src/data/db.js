// In-memory database — replace with PostgreSQL in production
import { randomUUID } from 'crypto';

// ─── Helpers ────────────────────────────────────────────────────────────────
export const generateHash = (data) => {
  let hash = 0n;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 31n + BigInt(data.charCodeAt(i))) & 0xFFFFFFFFFFFFFFFFn;
  }
  return hash.toString(16).padStart(16, '0') + Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
};

export const generateRefId = (prefix) => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000 + 10000);
  return `${prefix}-${year}-${rand}`;
};

// ─── Citizens ────────────────────────────────────────────────────────────────
export const citizens = [
  {
    id: 'CIT001', name: 'Rajesh Kumar', mobile: '9876543210',
    aadhaar: 'XXXX-XXXX-1234', address: '123 MG Road, Sector 5, Guwahati',
    consumerId: 'ELEC2024001', pin: '1234', points: 150, email: 'rajesh@example.com'
  },
  {
    id: 'CIT002', name: 'Priya Sharma', mobile: '9876543211',
    aadhaar: 'XXXX-XXXX-5678', address: '456 Nehru Place, Block B, Guwahati',
    consumerId: 'ELEC2024002', pin: '5678', points: 50, email: 'priya@example.com'
  },
  {
    id: 'CIT003', name: 'Amit Das', mobile: '9876543212',
    aadhaar: 'XXXX-XXXX-9012', address: '789 Dispur Lane, Sector 3, Guwahati',
    consumerId: 'GAS2024001', pin: '2345', points: 80, email: 'amit@example.com'
  }
];

// ─── Bills ───────────────────────────────────────────────────────────────────
export const bills = [
  {
    id: 'BILL001', consumerId: 'ELEC2024001', type: 'electricity',
    amount: 2450.00, dueDate: '2026-04-15', status: 'pending',
    units: 245, billDate: '2026-03-15',
    previousPayments: [
      { date: '2026-02-05', amount: 2100.00, transactionId: 'TXN202502001' },
      { date: '2026-01-05', amount: 1980.00, transactionId: 'TXN202501001' }
    ]
  },
  {
    id: 'BILL002', consumerId: 'ELEC2024001', type: 'gas',
    amount: 850.00, dueDate: '2026-04-20', status: 'pending',
    units: 12, billDate: '2026-03-20',
    previousPayments: [{ date: '2026-02-10', amount: 780.00, transactionId: 'TXN202502002' }]
  },
  {
    id: 'BILL003', consumerId: 'ELEC2024001', type: 'water',
    amount: 320.00, dueDate: '2026-03-25', status: 'overdue',
    units: 5000, billDate: '2026-03-01', previousPayments: []
  },
  {
    id: 'BILL004', consumerId: 'GAS2024001', type: 'gas',
    amount: 1100.00, dueDate: '2026-04-18', status: 'pending',
    units: 18, billDate: '2026-03-18',
    previousPayments: [{ date: '2026-02-15', amount: 950.00, transactionId: 'TXN202502003' }]
  }
];

// ─── Complaints ───────────────────────────────────────────────────────────────
export const complaints = [
  {
    id: 'COMP001', citizenId: 'CIT001', category: 'power_outage',
    description: 'Frequent power cuts in evening hours from 6 PM to 9 PM',
    location: 'Sector 5, Block A', status: 'under_review',
    createdAt: '2026-03-20T10:30:00Z', updatedAt: '2026-03-21T14:00:00Z',
    attachments: [], integrityHash: 'a7f8d9c0e1b2a3b4',
    sla: '2026-03-27T10:30:00Z', assignedOfficer: 'Er. Suresh Baruah',
    assignedDept: 'APDCL – Guwahati East Division', remarks: 'Field team dispatched'
  },
  {
    id: 'COMP002', citizenId: 'CIT001', category: 'water_supply',
    description: 'Low water pressure in morning hours',
    location: 'Sector 5, Block A', status: 'pending',
    createdAt: '2026-03-22T08:15:00Z', updatedAt: '2026-03-22T08:15:00Z',
    attachments: [], integrityHash: 'b8c9d0e1f2a3b4c5',
    sla: '2026-03-29T08:15:00Z', assignedOfficer: null,
    assignedDept: 'GMC Water Supply', remarks: ''
  }
];

// ─── Service Requests ─────────────────────────────────────────────────────────
export const serviceRequests = [
  {
    id: 'REQ001', citizenId: 'CIT001', type: 'new_electricity',
    applicantName: 'Rajesh Kumar', address: '123 MG Road, Sector 5',
    idProofType: 'Aadhaar Card', status: 'under_review',
    createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-15T11:00:00Z',
    referenceNumber: 'ELEC-REQ-2026-00123',
    sla: '2026-03-25T09:00:00Z', assignedOfficer: 'Er. Dipak Kalita',
    remarks: 'Site inspection scheduled for March 28'
  }
];

// ─── Integrity Ledger ─────────────────────────────────────────────────────────
export const integrityRecords = [
  {
    id: 'IR001', recordType: 'payment', recordId: 'TXN202502001',
    hash: 'e3b0c44298fc1c14', timestamp: '2026-02-05T10:30:00Z',
    previousHash: '0000000000000000', verified: true
  }
];

// ─── Civic Alerts ─────────────────────────────────────────────────────────────
export const civicAlerts = [
  {
    id: 'ALERT001', type: 'maintenance',
    title: 'Scheduled Power Maintenance', titleHindi: 'निर्धारित बिजली रखरखाव',
    titleAssamese: 'নিৰ্ধাৰিত বিদ্যুৎ ৰক্ষণাবেক্ষণ',
    message: 'Power supply will be interrupted in Sectors 4-8 on Apr 5 from 10 AM to 2 PM.',
    messageHindi: 'सेक्टर 4-8 में 5 अप्रैल को सुबह 10 बजे से दोपहर 2 बजे तक बिजली बाधित रहेगी।',
    severity: 'warning', createdAt: '2026-03-24T00:00:00Z',
    expiresAt: '2030-04-05T14:00:00Z', zones: ['Sector 4', 'Sector 5', 'Sector 6']
  },
  {
    id: 'ALERT002', type: 'emergency',
    title: 'Gas Leak Reported – Sector 9', titleHindi: 'सेक्टर 9 में गैस रिसाव',
    titleAssamese: 'ছেক্টৰ 9ত গেছ লিক',
    message: 'CRITICAL: Gas leak reported near Sector 9 market. Avoid open flames. Helpline: 1906.',
    messageHindi: 'गंभीर: सेक्टर 9 बाजार के पास गैस रिसाव। खुली आग से बचें। हेल्पलाइन: 1906।',
    severity: 'critical', createdAt: '2026-03-24T06:00:00Z',
    expiresAt: '2030-03-25T06:00:00Z', zones: ['Sector 9']
  }
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = [
  {
    id: 'LOG001', kioskId: 'KIOSK-SEC5-001', action: 'LOGIN_SUCCESS',
    userId: 'CIT001', timestamp: '2026-03-24T09:00:00Z',
    details: 'Citizen login via OTP', ipAddress: '192.168.1.100'
  }
];

// ─── Kiosk Stats ──────────────────────────────────────────────────────────────
export const kioskStats = {
  totalTransactions: 1247, totalRevenue: 892450,
  complaintsReceived: 89, complaintsResolved: 67,
  newConnections: 23, activeKiosks: 12, totalKiosks: 15,
  avgSessionDuration: '4.5 min', peakHours: '10 AM – 12 PM',
  todayTransactions: 45, todayRevenue: 32500
};
