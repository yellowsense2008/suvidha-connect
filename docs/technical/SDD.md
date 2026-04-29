# System Design Document (SDD)
## SUVIDHA Connect – Smart Civic Services Kiosk
**Version:** 1.0 | **Date:** 2026 

---

## 1. System Overview

SUVIDHA Connect follows a **3-tier layered architecture** with a stateless frontend philosophy — no sensitive citizen data persists on the kiosk device.

```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                      │
│         React 18 + TypeScript + TailwindCSS + Shadcn UI  │
├────────┬────────┬────────┬────────┬────────┬─────────────┤
│ Login  │Service │ Admin  │ Voice  │  Chat  │  Virtual    │
│Module  │Modules │Dashboard│Commands│Sahayak │  Keyboard   │
└────────┴────────┴────────┴────────┴────────┴─────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                     │
│                   React Context API                       │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ AuthContext  │ KioskContext │KeyboardContext│  i18n (EN/HI)│
└──────────────┴──────────────┴──────────────┴─────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                      DATA LAYER                           │
│           Mock Services (TypeScript interfaces)           │
├──────────────┬──────────────┬──────────────┬─────────────┤
│Bill Service  │Complaint Svc │Request Svc   │Alert Service│
└──────────────┴──────────────┴──────────────┴─────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│               FUTURE BACKEND INTEGRATIONS                 │
│  REST APIs | PostgreSQL | Payment Gateway | SMS/eKYC     │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 + TypeScript | Component-based UI with type safety |
| Build Tool | Vite | Fast HMR, code splitting, tree-shaking |
| Styling | TailwindCSS + Shadcn UI | Utility-first responsive design |
| Routing | React Router v6 | Client-side navigation |
| State | React Context API | Global auth, kiosk, keyboard state |
| i18n | i18next | English + Hindi; extensible to 10+ languages |
| Forms | React Hook Form + Zod | Validated, accessible form handling |
| Charts | Recharts | Admin analytics dashboards |
| PWA | Vite PWA Plugin | Offline capability, installable |
| Deployment | Vercel | CI/CD, CDN, 99.9% uptime |

---

## 3. Component Architecture

### 3.1 Page Routes
```
/           → Index.tsx (Kiosk entry / Login)
/admin      → Admin.tsx (Admin dashboard — lazy loaded)
*           → NotFound.tsx
```

### 3.2 Kiosk Components
```
KioskLayout.tsx          ← Shell: header, session timer, alert ticker
├── LoginScreen.tsx       ← OTP / Consumer ID authentication
├── ServiceModules.tsx    ← Service selector grid
├── BillPaymentModule.tsx ← Electricity / Gas / Water billing
├── ComplaintModule.tsx   ← Register & track complaints
├── TrackStatusModule.tsx ← Status timeline view
├── NewServiceModule.tsx  ← New connection applications
├── DocumentsModule.tsx   ← Certificate download
├── AppointmentModule.tsx ← Office visit booking
├── RewardsModule.tsx     ← Gamification & points
├── WasteModule.tsx       ← Waste management schedule
├── AlertsModule.tsx      ← Civic alerts management
├── ChatAssistant.tsx     ← SUVIDHA Sahayak (AI + TTS)
├── VoiceCommander.tsx    ← Web Speech API voice navigation
└── VirtualKeyboard.tsx   ← Custom on-screen keyboard
```

### 3.3 Admin Components
```
AdminLogin.tsx            ← Admin authentication
AdminDashboard.tsx        ← Analytics, alerts, audit logs, threat detection
```

### 3.4 Context Providers
```
AuthContext.tsx           ← User session, login/logout, role
KioskContext.tsx          ← Active module, kiosk ID, language, contrast mode
KeyboardContext.tsx       ← Virtual keyboard visibility and input target
```

---

## 4. Data Flow

### 4.1 Citizen Bill Payment Flow
```
Citizen → LoginScreen (OTP/ConsumerID)
        → AuthContext.login()
        → ServiceModules (select Electricity)
        → BillPaymentModule (fetch bill from mockData)
        → Payment confirmation
        → Receipt generation (PDF + QR)
        → Integrity Ledger entry (SHA-256 hash)
        → Session continues or auto-expires (180s)
```

### 4.2 Complaint Registration Flow
```
Citizen → ComplaintModule (fill form)
        → Submit → Reference ID generated
        → Integrity Ledger entry created
        → TrackStatusModule (poll status by Reference ID)
        → Emergency keywords → auto-escalation flag
```

### 4.3 Admin Monitoring Flow
```
Admin → AdminLogin (username/password)
      → AdminDashboard
        ├── Analytics charts (Recharts)
        ├── Civic Alerts CRUD
        ├── Audit Logs table
        ├── Integrity Ledger view
        └── Threat Detection alerts
```

---

## 5. Security Design

| Control | Implementation |
|---------|---------------|
| Session Timeout | 180s inactivity timer in KioskContext; auto-logout + cache clear |
| Aadhaar Masking | Display only last 4 digits; never stored in state |
| Integrity Ledger | SHA-256 hash chain for every transaction and complaint |
| Input Sanitization | Zod schema validation on all form inputs |
| No PII in Storage | Stateless frontend; localStorage used only for non-sensitive UI prefs |
| Anomaly Detection | Admin dashboard flags brute-force and rapid-submission patterns |
| CAPTCHA | Rate-limiting design on OTP requests |

---

## 6. PWA & Offline Design

- Service worker caches: app shell, static assets, translation JSONs
- Offline mode: UI loads fully; data operations queue for sync on reconnect
- Install prompt: citizens can install kiosk app on Android home screen
- Background sync: pending transactions sync when connectivity restores

---

## 7. Scalability Design

| Concern | Approach |
|---------|---------|
| Multi-kiosk | Each kiosk assigned unique ID; logs tagged per kiosk |
| New departments | Add new module component + route; zero core changes |
| New languages | Add JSON file under `public/locales/<lang>/translation.json` |
| Backend migration | TypeScript interfaces mirror PostgreSQL schemas; swap mock → API with no UI changes |
| Low-cost hardware | SPA is < 500KB gzipped; runs on 2GB RAM Android tablets |

---

## 8. Deployment Architecture

```
GitHub (source) → Vercel CI/CD → Global CDN Edge Nodes
                                        ↓
                              Kiosk Browser (PWA)
                              [Cached Service Worker]
```

- Zero-downtime deployments via Vercel preview + production environments
- Environment variables managed via Vercel dashboard (API keys, kiosk IDs)
