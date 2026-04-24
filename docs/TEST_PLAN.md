# Test Plan
## SUVIDHA Connect – Smart Civic Services Kiosk
**Version:** 1.0 | **Date:** 2026 

---

## 1. Scope

This test plan covers functional, non-functional, accessibility, and security testing for SUVIDHA Connect across all citizen-facing and admin modules.

---

## 2. Test Environment

| Item | Detail |
|------|--------|
| Framework | Vitest + React Testing Library |
| Browser Testing | Chrome, Firefox, Safari, Edge |
| Device Testing | Desktop (1440px), Tablet (768px), Mobile (375px) |
| Accessibility | axe-core, manual screen reader (NVDA/VoiceOver) |
| Performance | Lighthouse CI |
| Demo URL | https://suvidha-connect.vercel.app |

---

## 3. Functional Test Cases

### 3.1 Authentication
| TC-ID | Test Case | Input | Expected Result | Status |
|-------|-----------|-------|-----------------|--------|
| TC-AUTH-01 | OTP login – valid credentials | Mobile: 9876543210, OTP: 123456 | Login success, redirect to service menu | ✅ Pass |
| TC-AUTH-02 | OTP login – invalid OTP | Mobile: 9876543210, OTP: 000000 | Error message shown | ✅ Pass |
| TC-AUTH-03 | Consumer ID login – valid | ID: ELEC2024001, PIN: 1234 | Login success | ✅ Pass |
| TC-AUTH-04 | Consumer ID login – invalid PIN | ID: ELEC2024001, PIN: 9999 | Error message shown | ✅ Pass |
| TC-AUTH-05 | Session timeout | Idle for 180 seconds | Auto-logout, return to login screen | ✅ Pass |
| TC-AUTH-06 | Admin login – valid | admin / admin123 | Admin dashboard loads | ✅ Pass |
| TC-AUTH-07 | Admin login – invalid | admin / wrongpass | Error message shown | ✅ Pass |

### 3.2 Bill Payment
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-BILL-01 | View electricity bill | Bill amount, due date, consumption chart displayed |
| TC-BILL-02 | View gas bill | Bill details displayed |
| TC-BILL-03 | View water bill | Bill details displayed |
| TC-BILL-04 | Complete payment flow | Success screen + receipt generated |
| TC-BILL-05 | Download receipt PDF | PDF downloads with QR code |
| TC-BILL-06 | Integrity Ledger entry created | Hash entry visible in admin ledger |

### 3.3 Complaint Module
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-COMP-01 | Submit complaint – all fields valid | Reference ID generated, success message |
| TC-COMP-02 | Submit complaint – missing required field | Validation error shown |
| TC-COMP-03 | Track complaint by Reference ID | Status timeline displayed |
| TC-COMP-04 | Submit complaint with keyword "fire" | Emergency escalation flag triggered |
| TC-COMP-05 | Submit complaint with keyword "ambulance" | Emergency escalation flag triggered |

### 3.4 Accessibility
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-ACC-01 | Switch language to Hindi | All UI text renders in Hindi |
| TC-ACC-02 | Switch language to English | All UI text renders in English |
| TC-ACC-03 | Enable high-contrast mode | Black/yellow high-contrast theme applied |
| TC-ACC-04 | TTS on chat response | Response read aloud via browser TTS |
| TC-ACC-05 | Voice command "pay bill" | Navigates to Bill Payment module |
| TC-ACC-06 | Virtual keyboard input | Characters appear in input field |
| TC-ACC-07 | Keyboard-only navigation | All interactive elements reachable via Tab |

### 3.5 Admin Dashboard
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-ADMIN-01 | View analytics charts | Charts render with mock data |
| TC-ADMIN-02 | Create civic alert | Alert appears in kiosk ticker |
| TC-ADMIN-03 | View audit logs | Log table displays all entries |
| TC-ADMIN-04 | View Integrity Ledger | Hash entries displayed |
| TC-ADMIN-05 | Threat detection panel | Anomaly flags displayed |

---

## 4. Non-Functional Test Cases

### 4.1 Performance
| TC-ID | Metric | Target | Tool |
|-------|--------|--------|------|
| TC-PERF-01 | First Contentful Paint | < 1.5s | Lighthouse |
| TC-PERF-02 | Time to Interactive | < 3s | Lighthouse |
| TC-PERF-03 | Lighthouse Performance Score | ≥ 90 | Lighthouse CI |
| TC-PERF-04 | Bundle size (gzipped) | < 500KB | Vite build output |

### 4.2 Offline / PWA
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-PWA-01 | Load app with network disabled | App shell loads from service worker cache |
| TC-PWA-02 | Install PWA on Android | Install prompt appears; app installs |
| TC-PWA-03 | Translations available offline | Hindi/English text renders without network |

### 4.3 Security
| TC-ID | Test Case | Expected Result |
|-------|-----------|-----------------|
| TC-SEC-01 | Inspect localStorage after login | No PII or tokens stored |
| TC-SEC-02 | Aadhaar number display | Only last 4 digits visible |
| TC-SEC-03 | XSS attempt in complaint form | Input sanitized; no script execution |
| TC-SEC-04 | Rapid OTP submissions | Rate-limit error shown after threshold |

### 4.4 Responsiveness
| TC-ID | Viewport | Expected Result |
|-------|---------|-----------------|
| TC-RESP-01 | 1440px (kiosk desktop) | Full layout, all modules visible |
| TC-RESP-02 | 768px (tablet) | Responsive layout, no overflow |
| TC-RESP-03 | 375px (mobile) | Mobile menu, stacked layout |

---

## 5. Test Execution Summary

| Category | Total TCs | Pass | Fail | Pending |
|----------|-----------|------|------|---------|
| Authentication | 7 | 7 | 0 | 0 |
| Bill Payment | 6 | 6 | 0 | 0 |
| Complaint | 5 | 5 | 0 | 0 |
| Accessibility | 7 | 7 | 0 | 0 |
| Admin | 5 | 5 | 0 | 0 |
| Performance | 4 | 4 | 0 | 0 |
| PWA/Offline | 3 | 3 | 0 | 0 |
| Security | 4 | 4 | 0 | 0 |
| Responsiveness | 3 | 3 | 0 | 0 |
| **Total** | **44** | **44** | **0** | **0** |
