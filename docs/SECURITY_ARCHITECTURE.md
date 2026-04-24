# Security Architecture Document
## SUVIDHA Connect – Smart Civic Services Kiosk
**Version:** 1.0 | **Date:** 2026 | **Organization:** 

---

## 1. Security Principles

SUVIDHA Connect is designed for **public kiosk deployment** where the threat model includes:
- Shared hardware used by untrusted users
- Physical access to the device
- Network interception in public spaces
- Insider threats (administrative staff tampering with records)

The platform follows a **Privacy-First, Zero-Trust** design aligned with India's **DPDP Act 2023**.

---

## 2. Authentication Security

### 2.1 OTP Authentication
- OTP is 6-digit, time-limited (5 minutes), single-use
- Rate limiting: max 3 OTP requests per mobile per 15 minutes
- OTP never stored client-side; validated server-side only

### 2.2 Consumer ID + PIN
- PIN is hashed (bcrypt, cost factor 12) before storage
- Failed login attempts locked after 5 consecutive failures
- Account lockout duration: 15 minutes

### 2.3 Session Management
- JWT tokens with 3-minute expiry (matching kiosk session timeout)
- Inactivity timer in `KioskContext` auto-logs out after 180 seconds
- On logout: JWT invalidated server-side, localStorage cleared, React state reset
- No session tokens persisted to disk

### 2.4 Admin Authentication
- Separate admin JWT with role claim `"role": "admin"`
- Admin routes protected by role-based guard in React Router
- Admin sessions: 30-minute timeout (longer than citizen sessions)

---

## 3. Data Protection

### 3.1 PII Handling
| Data Type | Storage | Display Rule |
|-----------|---------|-------------|
| Mobile number | Server only | Masked: 98XXXXX210 |
| Aadhaar number | Never stored | Last 4 digits only |
| Name | Server only | Full name shown to authenticated user only |
| Address | Server only | Shown only in authenticated session |
| Payment details | Payment gateway only | Never touches SUVIDHA servers |

### 3.2 DPDP Act 2023 Compliance
- Explicit consent collected before data processing
- Citizens can request data deletion via complaint module
- No data shared with third parties without consent
- Data minimization: only collect what is necessary for the service
- Audit trail maintained for all data access

### 3.3 Encryption
- All API communication over HTTPS/TLS 1.3
- JWT signed with RS256 (asymmetric)
- Sensitive fields encrypted at rest (AES-256) in future PostgreSQL backend
- Receipt PDFs contain tamper-evident QR codes

---

## 4. Integrity Ledger (Blockchain-Lite)

Every transaction and complaint generates an immutable audit entry:

```
Entry N:
  - type: "payment" | "complaint" | "application"
  - referenceId: unique ID
  - data: transaction details
  - timestamp: ISO 8601
  - hash: SHA-256(type + referenceId + data + timestamp + previousHash)
  - previousHash: hash of Entry N-1
```

This hash-chaining means:
- Any tampering with a past record invalidates all subsequent hashes
- Administrative staff cannot alter complaint or payment records
- Disputes can be resolved by verifying the hash chain
- Aligns with anti-corruption and transparency goals of the SUVIDHA initiative

---

## 5. Input Security

### 5.1 Validation
- All form inputs validated with **Zod schemas** before submission
- Server-side validation mirrors client-side schemas
- File uploads: type whitelist (PDF, JPG, PNG), max 5MB, virus scan (future)

### 5.2 XSS Prevention
- React's JSX escapes all dynamic content by default
- No `dangerouslySetInnerHTML` usage
- Content Security Policy (CSP) headers set via Vercel config

### 5.3 CSRF Protection
- SameSite=Strict cookies for session tokens
- CSRF tokens on all state-changing API requests

---

## 6. Kiosk Physical Security

| Threat | Mitigation |
|--------|-----------|
| User leaves session open | 180s auto-logout + screen clear |
| Shoulder surfing | Aadhaar/PIN masking; short session |
| USB/peripheral attack | Kiosk OS locks USB ports |
| Browser DevTools access | Chrome kiosk mode disables DevTools |
| Screenshot of PII | Session data cleared on logout |
| Physical device theft | Encrypted storage; remote wipe via MDM |

---

## 7. Network Security

- All traffic over HTTPS; HTTP requests redirected to HTTPS
- HSTS (HTTP Strict Transport Security) header enabled
- API endpoints protected by WAF (Web Application Firewall) on future backend
- Rate limiting at API gateway level (100 req/min per kiosk IP)
- DDoS protection via Vercel's edge network

---

## 8. Anomaly Detection (Admin Dashboard)

The threat detection module monitors for:

| Anomaly | Threshold | Action |
|---------|-----------|--------|
| Brute-force OTP | > 5 attempts in 5 min | Lock account + alert admin |
| Rapid complaint submission | > 10 complaints in 1 min | Flag as spam + alert admin |
| Unusual payment patterns | Amount > 3σ from mean | Flag for review |
| Multiple failed admin logins | > 3 attempts | Lock admin account + alert |
| Off-hours kiosk activity | Activity between 11PM–5AM | Alert admin |

---

## 9. Security Checklist

- ✅ HTTPS enforced on all endpoints
- ✅ Session auto-timeout (180 seconds)
- ✅ Aadhaar masking in all UI displays
- ✅ No PII in localStorage or client-side state
- ✅ Integrity Ledger with SHA-256 hash chaining
- ✅ Input validation with Zod (client + server)
- ✅ Rate limiting on OTP and login endpoints
- ✅ Role-based access control (citizen vs admin)
- ✅ DPDP Act 2023 compliant data handling
- ✅ Audit logs for all transactions per kiosk
- ✅ Chrome kiosk mode disables browser controls
- ✅ CSP headers prevent XSS
