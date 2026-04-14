-- SUVIDHA Connect — PostgreSQL Schema
-- Run: node server/src/db/migrate.js

CREATE TABLE IF NOT EXISTS citizens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  aadhaar TEXT,
  address TEXT,
  consumer_id TEXT UNIQUE,
  pin TEXT,
  email TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  consumer_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('electricity','gas','water')),
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
  units NUMERIC(10,2),
  bill_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_payments (
  id SERIAL PRIMARY KEY,
  bill_id TEXT REFERENCES bills(id),
  amount NUMERIC(10,2) NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'UPI',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  geo_lat NUMERIC(10,7),
  geo_lng NUMERIC(10,7),
  status TEXT NOT NULL DEFAULT 'pending',
  org TEXT DEFAULT 'electricity',
  attachments TEXT[],
  integrity_hash TEXT,
  sla TIMESTAMPTZ,
  assigned_officer TEXT,
  assigned_dept TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  citizen_id TEXT REFERENCES citizens(id),
  type TEXT NOT NULL,
  request_subtype TEXT,
  applicant_name TEXT NOT NULL,
  address TEXT NOT NULL,
  id_proof_type TEXT,
  load_kw NUMERIC(6,2),
  documents TEXT[],
  status TEXT NOT NULL DEFAULT 'submitted',
  reference_number TEXT UNIQUE NOT NULL,
  sla TIMESTAMPTZ,
  assigned_officer TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrity_ledger (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL CHECK (record_type IN ('payment','complaint','request','credential_update')),
  record_id TEXT NOT NULL,
  hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS civic_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('outage','emergency','weather','maintenance')),
  title TEXT NOT NULL,
  title_hindi TEXT,
  title_assamese TEXT,
  message TEXT NOT NULL,
  message_hindi TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  zones TEXT[],
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  kiosk_id TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bills_consumer ON bills(consumer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_requests_citizen ON service_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_requests_ref ON service_requests(reference_number);
CREATE INDEX IF NOT EXISTS idx_audit_kiosk ON audit_logs(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_alerts_expires ON civic_alerts(expires_at);
