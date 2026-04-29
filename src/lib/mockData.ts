// Mock Data for SUVIDHA Kiosk System

export interface Citizen {
  id: string;
  name: string;
  mobile: string;
  aadhaar: string;
  address: string;
  consumerId: string;
  pin: string;
  points?: number;
  email?: string;
}

export interface Bill {
  id: string;
  consumerId: string;
  type: 'electricity' | 'gas' | 'water';
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  units?: number;
  billDate: string;
  previousPayments: { date: string; amount: number; transactionId: string }[];
}

export interface Complaint {
  id: string;
  citizenId: string;
  category: 'power_outage' | 'gas_leakage' | 'water_supply' | 'waste_management';
  description: string;
  location: string;
  status: 'pending' | 'under_review' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  attachments: string[];
  integrityHash?: string;
}

export interface ServiceRequest {
  id: string;
  citizenId: string;
  type: 'new_electricity' | 'new_gas' | 'new_water';
  applicantName: string;
  address: string;
  idProofType: string;
  status: 'submitted' | 'under_review' | 'approved' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  referenceNumber: string;
}

export interface CivicAlert {
  id: string;
  type: 'outage' | 'emergency' | 'weather' | 'maintenance';
  title: string;
  titleHindi: string;
  message: string;
  messageHindi: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  expiresAt: string;
  zones: string[];
}

export interface IntegrityRecord {
  id: string;
  recordType: 'payment' | 'complaint' | 'request';
  recordId: string;
  hash: string;
  timestamp: string;
  previousHash: string;
  verified: boolean;
}

export interface AuditLog {
  id: string;
  kioskId: string;
  action: string;
  userId?: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

export interface ThreatAlert {
  id: string;
  type: 'failed_login' | 'rapid_submissions' | 'suspicious_upload' | 'brute_force';
  severity: 'low' | 'medium' | 'high';
  message: string;
  kioskId: string;
  timestamp: string;
  resolved: boolean;
}

// Sample Citizens
export const citizens: Citizen[] = [
  {
    id: 'CIT001',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    aadhaar: 'XXXX-XXXX-1234',
    address: '123 MG Road, Sector 5, New Delhi',
    consumerId: 'ELEC2024001',
    pin: '1234',
    points: 150
  },
  {
    id: 'CIT002',
    name: 'Priya Sharma',
    mobile: '9876543211',
    aadhaar: 'XXXX-XXXX-5678',
    address: '456 Nehru Place, Block B, New Delhi',
    consumerId: 'ELEC2024002',
    pin: '5678',
    points: 50
  }
];

// Sample Bills
export const bills: Bill[] = [
  {
    id: 'BILL001',
    consumerId: 'ELEC2024001',
    type: 'electricity',
    amount: 2450.00,
    dueDate: '2026-02-15',
    status: 'pending',
    units: 245,
    billDate: '2026-01-15',
    previousPayments: [
      { date: '2026-01-05', amount: 2100.00, transactionId: 'TXN202501001' },
      { date: '2025-12-05', amount: 1980.00, transactionId: 'TXN202412001' }
    ]
  },
  {
    id: 'BILL002',
    consumerId: 'ELEC2024001',
    type: 'gas',
    amount: 850.00,
    dueDate: '2026-02-20',
    status: 'pending',
    units: 12,
    billDate: '2026-01-20',
    previousPayments: [
      { date: '2026-01-10', amount: 780.00, transactionId: 'TXN202501002' }
    ]
  },
  {
    id: 'BILL003',
    consumerId: 'ELEC2024001',
    type: 'water',
    amount: 320.00,
    dueDate: '2026-02-25',
    status: 'overdue',
    units: 5000,
    billDate: '2026-01-01',
    previousPayments: []
  }
];

// Sample Complaints
export const complaints: Complaint[] = [
  {
    id: 'COMP001',
    citizenId: 'CIT001',
    category: 'power_outage',
    description: 'Frequent power cuts in evening hours from 6 PM to 9 PM',
    location: 'Sector 5, Block A',
    status: 'under_review',
    createdAt: '2026-01-28T10:30:00Z',
    updatedAt: '2026-01-29T14:00:00Z',
    attachments: [],
    integrityHash: 'a7f8d9c0e1b2a3b4c5d6e7f8'
  },
  {
    id: 'COMP002',
    citizenId: 'CIT001',
    category: 'water_supply',
    description: 'Low water pressure in morning hours',
    location: 'Sector 5, Block A',
    status: 'pending',
    createdAt: '2026-02-01T08:15:00Z',
    updatedAt: '2026-02-01T08:15:00Z',
    attachments: [],
    integrityHash: 'b8c9d0e1f2a3b4c5d6e7f8a9'
  }
];

// Sample Service Requests
export const serviceRequests: ServiceRequest[] = [
  {
    id: 'REQ001',
    citizenId: 'CIT001',
    type: 'new_electricity',
    applicantName: 'Rajesh Kumar',
    address: '123 MG Road, Sector 5',
    idProofType: 'Aadhaar Card',
    status: 'under_review',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-25T11:00:00Z',
    referenceNumber: 'ELEC-REQ-2026-001'
  }
];

// Civic Alerts
export const civicAlerts: CivicAlert[] = [
  {
    id: 'ALERT001',
    type: 'maintenance',
    title: 'Scheduled Power Maintenance',
    titleHindi: 'निर्धारित बिजली रखरखाव',
    message: 'Power supply will be interrupted in Sectors 4-8 on Feb 5, 2030 from 10 AM to 2 PM for maintenance work.',
    messageHindi: 'रखरखाव कार्य के लिए 5 फरवरी, 2030 को सेक्टर 4-8 में सुबह 10 बजे से दोपहर 2 बजे तक बिजली आपूर्ति बाधित रहेगी।',
    severity: 'warning',
    createdAt: '2026-02-01T00:00:00Z',
    expiresAt: '2030-02-05T14:00:00Z',
    zones: ['Sector 4', 'Sector 5', 'Sector 6', 'Sector 7', 'Sector 8']
  },
  {
    id: 'ALERT002',
    type: 'weather',
    title: 'Heavy Rain Advisory',
    titleHindi: 'भारी बारिश की सलाह',
    message: 'Heavy rainfall expected in the next 48 hours. Citizens are advised to stay indoors and avoid waterlogged areas.',
    messageHindi: 'अगले 48 घंटों में भारी वर्षा की संभावना है। नागरिकों को घर के अंदर रहने और जलभराव वाले क्षेत्रों से बचने की सलाह दी जाती है।',
    severity: 'warning',
    createdAt: '2026-02-02T06:00:00Z',
    expiresAt: '2030-02-04T06:00:00Z',
    zones: ['All Zones']
  },
  {
    id: 'ALERT003',
    type: 'outage',
    title: 'Gas Supply Restored',
    titleHindi: 'गैस आपूर्ति बहाल',
    message: 'Gas supply has been restored in Sector 12 after emergency repairs.',
    messageHindi: 'आपातकालीन मरम्मत के बाद सेक्टर 12 में गैस आपूर्ति बहाल हो गई है।',
    severity: 'info',
    createdAt: '2026-02-02T14:00:00Z',
    expiresAt: '2030-02-03T14:00:00Z',
    zones: ['Sector 12']
  },
  {
    id: 'ALERT004',
    type: 'emergency',
    title: 'Flash Flood Warning',
    titleHindi: 'अचानक बाढ़ की चेतावनी',
    message: 'CRITICAL: Flash floods reported in low-lying areas. Evacuate immediately to higher ground.',
    messageHindi: 'गंभीर: निचले इलाकों में अचानक बाढ़ की खबर है। तुरंत ऊंचे स्थानों पर जाएं।',
    severity: 'critical',
    createdAt: '2026-02-06T00:00:00Z',
    expiresAt: '2030-02-07T00:00:00Z',
    zones: ['Low-lying Areas']
  }
];

// Integrity Ledger (Blockchain Demo)
export const integrityRecords: IntegrityRecord[] = [
  {
    id: 'IR001',
    recordType: 'payment',
    recordId: 'TXN202501001',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: '2026-01-05T10:30:00Z',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    verified: true
  },
  {
    id: 'IR002',
    recordType: 'complaint',
    recordId: 'COMP001',
    hash: 'a7f8d9c0e1b2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    timestamp: '2026-01-28T10:30:00Z',
    previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verified: true
  }
];

// Audit Logs
export const auditLogs: AuditLog[] = [
  {
    id: 'LOG001',
    kioskId: 'KIOSK-SEC5-001',
    action: 'LOGIN_SUCCESS',
    userId: 'CIT001',
    timestamp: '2026-02-02T09:00:00Z',
    details: 'Citizen login via OTP',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG002',
    kioskId: 'KIOSK-SEC5-001',
    action: 'BILL_PAYMENT',
    userId: 'CIT001',
    timestamp: '2026-02-02T09:05:00Z',
    details: 'Electricity bill payment of ₹2450',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG003',
    kioskId: 'KIOSK-SEC5-001',
    action: 'COMPLAINT_SUBMITTED',
    userId: 'CIT001',
    timestamp: '2026-02-02T09:10:00Z',
    details: 'Complaint registered for water supply issue',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'LOG004',
    kioskId: 'KIOSK-SEC7-002',
    action: 'LOGIN_FAILED',
    userId: undefined,
    timestamp: '2026-02-02T08:45:00Z',
    details: 'Failed OTP attempt - Mobile: 9876XXXX00',
    ipAddress: '192.168.1.105'
  }
];

// Threat Alerts
export const threatAlerts: ThreatAlert[] = [
  {
    id: 'THREAT001',
    type: 'failed_login',
    severity: 'medium',
    message: '5 failed login attempts detected in last 10 minutes',
    kioskId: 'KIOSK-SEC7-002',
    timestamp: '2026-02-02T08:50:00Z',
    resolved: false
  },
  {
    id: 'THREAT002',
    type: 'rapid_submissions',
    severity: 'low',
    message: 'Multiple complaint submissions from same session',
    kioskId: 'KIOSK-SEC5-001',
    timestamp: '2026-02-01T15:30:00Z',
    resolved: true
  }
];

// Kiosk Statistics for Admin Dashboard
export const kioskStats = {
  totalTransactions: 1247,
  totalRevenue: 892450,
  complaintsReceived: 89,
  complaintsResolved: 67,
  newConnections: 23,
  activeKiosks: 12,
  totalKiosks: 15,
  avgSessionDuration: '4.5 min',
  peakHours: '10 AM - 12 PM',
  todayTransactions: 45,
  todayRevenue: 32500
};

// Category Labels
export const complaintCategories = {
  power_outage: { en: 'Power Outage', hi: 'बिजली गुल' },
  gas_leakage: { en: 'Gas Leakage', hi: 'गैस रिसाव' },
  water_supply: { en: 'Water Supply Issue', hi: 'जल आपूर्ति समस्या' },
  waste_management: { en: 'Waste Management', hi: 'अपशिष्ट प्रबंधन' }
};

export const serviceTypes = {
  new_electricity: { en: 'New Electricity Connection', hi: 'नया बिजली कनेक्शन' },
  new_gas: { en: 'New Gas Connection', hi: 'नया गैस कनेक्शन' },
  new_water: { en: 'New Water Pipeline', hi: 'नया पानी पाइपलाइन' }
};

export const statusLabels = {
  pending: { en: 'Pending', hi: 'लंबित', color: 'secondary' },
  under_review: { en: 'Under Review', hi: 'समीक्षाधीन', color: 'primary' },
  in_progress: { en: 'In Progress', hi: 'प्रगति पर', color: 'primary' },
  approved: { en: 'Approved', hi: 'स्वीकृत', color: 'accent' },
  completed: { en: 'Completed', hi: 'पूर्ण', color: 'accent' },
  resolved: { en: 'Resolved', hi: 'समाधान', color: 'accent' },
  rejected: { en: 'Rejected', hi: 'अस्वीकृत', color: 'destructive' },
  submitted: { en: 'Submitted', hi: 'प्रस्तुत', color: 'secondary' },
  paid: { en: 'Paid', hi: 'भुगतान', color: 'accent' },
  overdue: { en: 'Overdue', hi: 'अतिदेय', color: 'destructive' }
};

// Generate Hash (Demo Function)
export const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0') + 
         Date.now().toString(16).padStart(12, '0') +
         Math.random().toString(16).substring(2, 10);
};

// Generate Reference Number
export const generateReferenceNumber = (type: string): string => {
  const prefix = type.toUpperCase().substring(0, 4);
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-REQ-${year}-${random}`;
};

// Generate Transaction ID
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString().substring(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN${timestamp}${random}`;
};