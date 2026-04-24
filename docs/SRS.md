# Software Requirements Specification (SRS)
## SUVIDHA Connect – Smart Civic Services Kiosk
**Version:** 1.0 | **Date:** 2026 

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for SUVIDHA Connect — a unified, offline-capable, multilingual civic kiosk platform targeting last-mile citizens in India.

### 1.2 Scope
SUVIDHA Connect integrates Electricity, Gas, Water, and Municipal services into a single Progressive Web App (PWA) kiosk interface with AI assistance, voice navigation, and a tamper-proof audit ledger.

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Kiosk | Public self-service terminal running SUVIDHA Connect |
| Consumer ID | Unique identifier assigned to a utility subscriber |
| Integrity Ledger | SHA-256 hash-chained audit log of all transactions |
| SUVIDHA Sahayak | AI chat + TTS assistant embedded in the kiosk |
| PWA | Progressive Web App — installable, offline-capable web application |
| DPDP | Digital Personal Data Protection Act, 2023 |

---

## 2. Overall Description

### 2.1 Product Perspective
SUVIDHA Connect is a frontend-first PWA designed to run on low-cost kiosk hardware (Android tablets, Raspberry Pi, or standard PCs). It communicates with backend REST APIs (future integration) and currently uses a strictly-typed mock data layer mirroring production schemas.

### 2.2 User Classes
| User | Description |
|------|-------------|
| Citizen | Primary user — pays bills, files complaints, tracks status |
| Admin | Government officer — monitors dashboard, manages alerts |
| Kiosk Operator | Maintains hardware; no software access |

### 2.3 Operating Environment
- Browser: Chrome 110+, Firefox 110+, Safari 16+
- Hardware: Touch screen ≥ 10", 2GB RAM minimum
- Network: Online preferred; offline mode via PWA service worker cache
- OS: Android 10+, Windows 10+, Linux (Raspberry Pi OS)

---

## 3. Functional Requirements

### 3.1 Authentication Module
| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | System shall support OTP-based login via mobile number (demo: 9876543210 / 123456) |
| FR-AUTH-02 | System shall support Consumer ID + PIN login (demo: ELEC2024001 / 1234) |
| FR-AUTH-03 | Session shall auto-expire after 180 seconds of inactivity |
| FR-AUTH-04 | System shall mask Aadhaar numbers in all displays |
| FR-AUTH-05 | Admin login shall require username + password |

### 3.2 Bill Payment Module
| ID | Requirement |
|----|-------------|
| FR-BILL-01 | Citizens shall view current bills for Electricity, Gas, and Water |
| FR-BILL-02 | System shall display consumption history (last 6 months) |
| FR-BILL-03 | Payment shall generate a unique QR-coded digital receipt |
| FR-BILL-04 | Receipt shall be downloadable as PDF |
| FR-BILL-05 | Each payment shall create a SHA-256 entry in the Integrity Ledger |

### 3.3 Complaint Module
| ID | Requirement |
|----|-------------|
| FR-COMP-01 | Citizens shall register complaints for Electricity, Gas, Water, and Municipal services |
| FR-COMP-02 | Each complaint shall receive a unique Reference ID |
| FR-COMP-03 | Citizens shall track complaint status via Reference ID |
| FR-COMP-04 | Status timeline shall show: Registered → Assigned → In Progress → Resolved |
| FR-COMP-05 | Keywords like "fire" and "ambulance" shall trigger emergency auto-escalation |

### 3.4 New Service Connection
| ID | Requirement |
|----|-------------|
| FR-SERV-01 | Citizens shall apply for new Electricity, Gas, or Water connections |
| FR-SERV-02 | Application shall support document upload |
| FR-SERV-03 | Application status shall be trackable via Reference ID |

### 3.5 Accessibility & Language
| ID | Requirement |
|----|-------------|
| FR-ACC-01 | UI shall support English and Hindi; architecture shall support 10+ regional languages via i18next JSON |
| FR-ACC-02 | Text-to-Speech shall read all instructions and responses aloud |
| FR-ACC-03 | Voice commands shall navigate all primary kiosk functions in Hindi and English |
| FR-ACC-04 | High-contrast mode shall be toggleable at any screen |
| FR-ACC-05 | Virtual keyboard shall be available on all input screens |
| FR-ACC-06 | All touch targets shall be minimum 48×48px |

### 3.6 Admin Dashboard
| ID | Requirement |
|----|-------------|
| FR-ADMIN-01 | Admin shall view real-time service usage analytics and charts |
| FR-ADMIN-02 | Admin shall manage civic alert broadcasts |
| FR-ADMIN-03 | Admin shall view full audit logs per kiosk |
| FR-ADMIN-04 | Admin shall view Integrity Ledger entries |
| FR-ADMIN-05 | Threat detection module shall flag anomalous activity (brute-force, rapid submissions) |

### 3.7 AI Chat Assistant (SUVIDHA Sahayak)
| ID | Requirement |
|----|-------------|
| FR-AI-01 | Assistant shall respond to natural language queries in Hindi and English |
| FR-AI-02 | Assistant shall navigate user to the relevant service module on request |
| FR-AI-03 | All responses shall be read aloud via TTS |

### 3.8 Gamification & Rewards
| ID | Requirement |
|----|-------------|
| FR-GAM-01 | Citizens shall earn SUVIDHA Points for on-time bill payments and complaint submissions |
| FR-GAM-02 | Points shall be redeemable for civic benefits (transport passes, tax rebates) |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Page load < 2s on 4G; < 5s on 3G |
| NFR-02 | Availability | 99.9% uptime via Vercel CDN |
| NFR-03 | Security | All sessions encrypted; no PII stored in localStorage |
| NFR-04 | Scalability | Supports multi-kiosk deployment with unique kiosk IDs |
| NFR-05 | Offline | Core UI and cached data available without internet (PWA service worker) |
| NFR-06 | Compliance | DPDP Act 2023 compliant; Aadhaar masking enforced |
| NFR-07 | Accessibility | WCAG 2.1 AA compliant |
| NFR-08 | Maintainability | New service modules addable without rebuilding core app |

---

## 5. External Interface Requirements

### 5.1 Future API Integrations
- State DISCOM APIs (Electricity billing)
- GAIL / Assam Gas APIs (Gas billing)
- Municipal Corporation REST APIs
- UPI / BBPS Payment Gateway
- Aadhaar eKYC API (UIDAI)
- SMS / WhatsApp notification gateway
- Hyperledger Fabric (blockchain backend)

### 5.2 Hardware Interfaces
- Touchscreen display (resistive or capacitive, ≥ 10")
- Thermal receipt printer (optional)
- Camera (document scan / QR code reader)
- Microphone (voice commands)
- Speaker (TTS output)
