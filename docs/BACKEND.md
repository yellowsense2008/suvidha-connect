# Backend Architecture
## SUVIDHA Connect – Express.js REST API
**Version:** 1.0 | **Date:** 2026

---

## Overview

The backend is a lightweight **Node.js + Express** REST API that serves as the data layer for the SUVIDHA Connect kiosk frontend. It runs alongside the frontend and the frontend automatically detects whether the backend is online — falling back to mock data if offline.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 4.x |
| CORS | cors middleware |
| Storage | In-memory (production: PostgreSQL) |
| Auth | OTP + Consumer ID (stateless) |

---

## Start Backend

```bash
cd server
npm install
node src/index.js
# Running on http://localhost:3001
```

Or start both frontend + backend together:
```bash
chmod +x start.sh
./start.sh
```

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/otp/request | Request OTP for mobile |
| POST | /api/auth/otp/verify | Verify OTP and login |
| POST | /api/auth/consumer/login | Login with Consumer ID + PIN |

### Bills
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/bills/:consumerId | Get bills for consumer |
| POST | /api/bills/:billId/pay | Pay a bill, get receipt |

### Complaints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/complaints/citizen/:citizenId | Get citizen's complaints |
| GET | /api/complaints/track/:id | Track by complaint ID |
| POST | /api/complaints | Submit new complaint |

### Service Requests
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/requests | Submit new connection/service request |
| GET | /api/requests/track/:id | Track by reference number |

### Credentials
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/credentials/:citizenId | Get citizen profile |
| PATCH | /api/credentials/:citizenId | Update profile fields |

### Admin & Misc
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/alerts | Get active civic alerts |
| POST | /api/alerts | Create civic alert (admin) |
| GET | /api/ledger | Get integrity ledger records |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/audit-logs | Audit log entries |
| POST | /api/points/award | Award citizen points |
| GET | /health | Health check |

---

## Frontend Integration

The frontend uses `src/lib/api.ts` which:
1. Tries the real backend first
2. Falls back to mock data if backend is offline
3. Shows "API Online" / "Offline Mode" badge in the header

Set `VITE_API_URL` in `.env.local` to point to your backend.

---

## Requirements Compliance

### Part 1 – Electricity Module
| Requirement | Status |
|-------------|--------|
| Welcome Screen & User Login (OTP + Consumer ID) | ✅ |
| New Connection & Load Extension Requests | ✅ |
| Meter Replacement / Shifting Services | ✅ |
| Complaint Registration (5 categories) | ✅ |
| Credential Management / Update Consumer Info | ✅ |
| Track Request (by ID, mobile) | ✅ |
| Receipt Generation & Printing (PDF + Thermal) | ✅ |
| SLA visibility on tracking | ✅ |
| Assigned officer details on tracking | ✅ |
| Integrity Ledger (SHA-256 hash chain) | ✅ |
| Audit trail of credential updates | ✅ |

### Part 2 – Assam Gas Module
| Requirement | Status |
|-------------|--------|
| Welcome Screen & User Login (CA Number / OTP) | ✅ |
| Main Menu & Service Navigation | ✅ |
| New Gas Connection / Change Request (6 subtypes) | ✅ |
| Register Complaint (text + voice + upload) | ✅ |
| Track Complaint / Service Request | ✅ |
| Edit Credentials / Consumer Profile | ✅ |
| Receipt Generation (thermal + digital) | ✅ |

### Part 3 – Municipal Module
| Requirement | Status |
|-------------|--------|
| Welcome Screen & User Login | ✅ |
| New Water Connection / Upgrade | ✅ |
| Register Municipal Grievances (8 categories) | ✅ |
| Receipt Generation | ✅ |
| Track Request / Complaint | ✅ |
| Credential Management / Update Profile | ✅ |

### Other Requirements
| Requirement | Status |
|-------------|--------|
| AI Chatbot (SUVIDHA Sahayak) | ✅ |
| Touch-friendly UI (48px+ targets) | ✅ |
| Accessibility (TTS, High Contrast, Virtual Keyboard) | ✅ |
| Admin Dashboard | ✅ |
| Multilingual (English + Hindi + Assamese) | ✅ |
| Voice Commands | ✅ |
| PWA / Offline Support | ✅ |
| Session Timeout (180s) | ✅ |
| DPDP Act Compliance | ✅ |
| 55" Kiosk Portrait Layout | ✅ |

### Additional Winning Features
| Feature | Description |
|---------|-------------|
| Emergency SOS | One-tap Fire/Ambulance/Police with GPS |
| Citizen Dashboard | Carbon footprint, bill predictions, badges |
| Nearby Kiosk Finder | GPS-based with Google Maps directions |
| Senior Citizen Mode | Extra-large simplified 3-button UI |
| Geo-tagged Complaints | GPS coordinates captured on complaint |
| Backend API | Real Express.js REST API with mock fallback |
| Integrity Ledger | SHA-256 hash chain on all transactions |
| Gamification | Points, badges, civic score, leaderboard |
