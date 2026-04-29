import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ─── Citizen ──────────────────────────────────────────────────────────────────
const CitizenSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  aadhaar: String,
  address: String,
  consumerId: { type: String, unique: true, sparse: true },
  pin: String,
  email: String,
  points: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Bill ─────────────────────────────────────────────────────────────────────
const BillSchema = new Schema({
  id: { type: String, required: true, unique: true },
  consumerId: { type: String, required: true, index: true },
  type: { type: String, enum: ['electricity', 'gas', 'water'], required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  units: Number,
  billDate: Date,
  previousPayments: [{
    date: String,
    amount: Number,
    transactionId: String,
    paymentMethod: String,
  }],
}, { timestamps: true });

// ─── Complaint ────────────────────────────────────────────────────────────────
const ComplaintSchema = new Schema({
  id: { type: String, required: true, unique: true },
  citizenId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  geoLat: Number,
  geoLng: Number,
  status: { type: String, default: 'pending' },
  org: { type: String, default: 'electricity' },
  attachments: [String],
  integrityHash: String,
  sla: Date,
  assignedOfficer: String,
  assignedDept: String,
  remarks: String,
}, { timestamps: true });

// ─── Service Request ──────────────────────────────────────────────────────────
const ServiceRequestSchema = new Schema({
  id: { type: String, required: true, unique: true },
  citizenId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  requestSubtype: String,
  applicantName: { type: String, required: true },
  address: { type: String, required: true },
  idProofType: String,
  loadKw: Number,
  documents: [String],
  status: { type: String, default: 'submitted' },
  referenceNumber: { type: String, unique: true },
  sla: Date,
  assignedOfficer: String,
  remarks: String,
}, { timestamps: true });

// ─── Integrity Ledger ─────────────────────────────────────────────────────────
const IntegrityLedgerSchema = new Schema({
  id: { type: String, required: true, unique: true },
  recordType: { type: String, enum: ['payment', 'complaint', 'request', 'credential_update'], required: true },
  recordId: { type: String, required: true },
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },
  verified: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Civic Alert ──────────────────────────────────────────────────────────────
const CivicAlertSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['outage', 'emergency', 'weather', 'maintenance'], required: true },
  title: String,
  titleHindi: String,
  titleAssamese: String,
  message: String,
  messageHindi: String,
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  zones: [String],
  expiresAt: Date,
}, { timestamps: true });

// ─── Audit Log ────────────────────────────────────────────────────────────────
const AuditLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  kioskId: String,
  action: String,
  userId: String,
  details: String,
  ipAddress: String,
}, { timestamps: true });

export const Citizen = model('Citizen', CitizenSchema);
export const Bill = model('Bill', BillSchema);
export const Complaint = model('Complaint', ComplaintSchema);
export const ServiceRequest = model('ServiceRequest', ServiceRequestSchema);
export const IntegrityLedger = model('IntegrityLedger', IntegrityLedgerSchema);
export const CivicAlert = model('CivicAlert', CivicAlertSchema);
export const AuditLog = model('AuditLog', AuditLogSchema);
