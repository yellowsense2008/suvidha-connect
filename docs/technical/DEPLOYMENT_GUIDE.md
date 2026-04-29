# Deployment & Operations Guide
## SUVIDHA Connect – Smart Civic Services Kiosk
**Version:** 1.0 | **Date:** 2026 

---

## 1. Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Git | 2.x |
| Browser | Chrome 110+ (recommended for kiosk) |

---

## 2. Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd suvidha-connect

# Install dependencies
npm install

# Start development server (http://localhost:8080)
npm run dev
```

### Demo Credentials
| Role | Method | Credentials |
|------|--------|-------------|
| Citizen | Mobile OTP | 9876543210 / 123456 |
| Citizen | Consumer ID | ELEC2024001 / 1234 |
| Admin | Username/Password | admin / admin123 |

---

## 3. Production Build

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test
```

Build output is in `dist/`. Gzipped bundle size target: < 500KB.

---

## 4. Vercel Deployment

### 4.1 Automatic (Recommended)
1. Connect GitHub repository to Vercel
2. Vercel auto-detects Vite; no configuration needed
3. Every push to `main` triggers a production deployment
4. Pull requests get preview deployments automatically

### 4.2 Manual via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4.3 Environment Variables (Vercel Dashboard)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_KIOSK_ID` | Unique identifier for this kiosk instance |
| `VITE_OTP_SERVICE_KEY` | SMS gateway API key |
| `VITE_PAYMENT_GATEWAY_KEY` | UPI/BBPS gateway key |

---

## 5. Kiosk Hardware Deployment

### 5.1 Minimum Hardware Specs
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | ARM Cortex-A53 (Raspberry Pi 4) | Intel Core i3 |
| RAM | 2GB | 4GB |
| Storage | 16GB | 32GB |
| Display | 10" 1280×800 touch | 15.6" 1920×1080 touch |
| Network | 4G LTE / Wi-Fi | Wired Ethernet + 4G backup |

### 5.2 Kiosk Browser Configuration (Chrome Kiosk Mode)
```bash
# Launch Chrome in kiosk mode (Linux/Raspberry Pi)
chromium-browser --kiosk --no-sandbox --disable-infobars \
  --disable-session-crashed-bubble \
  --app=https://suvidha-connect.vercel.app

# Auto-start on boot (add to /etc/xdg/autostart/)
```

### 5.3 Android Kiosk Setup
1. Install Chrome on Android tablet
2. Navigate to `https://suvidha-connect.vercel.app`
3. Install PWA via "Add to Home Screen"
4. Enable Android Kiosk Mode via MDM (e.g., Scalefusion, Hexnode)
5. Pin the SUVIDHA Connect PWA as the locked app

---

## 6. Multi-Kiosk Management

Each kiosk should have a unique `VITE_KIOSK_ID` set via environment variable. This ID is:
- Tagged on all audit log entries
- Used for per-kiosk analytics in the admin dashboard
- Used for remote monitoring and threat detection

### Centralized Update Process
```
Developer pushes to GitHub main branch
        ↓
Vercel CI/CD builds and deploys (< 2 minutes)
        ↓
All kiosks receive update on next page load
(PWA service worker updates automatically)
```

---

## 7. Monitoring & Maintenance

### 7.1 Uptime Monitoring
- Vercel provides built-in uptime monitoring
- Set up alerts at: Vercel Dashboard → Project → Monitoring

### 7.2 Error Tracking (Recommended)
```bash
npm install @sentry/react
# Configure VITE_SENTRY_DSN in environment variables
```

### 7.3 Session & Security Monitoring
- Admin dashboard → Security Monitoring panel
- Threat detection flags: brute-force attempts, rapid submissions
- Audit logs: all transactions tagged with kiosk ID and timestamp

### 7.4 PWA Cache Management
```javascript
// Force service worker update on all kiosks
// In browser console (admin access):
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(r => r.update())
);
```

---

## 8. Backup & Recovery

| Data Type | Storage | Backup Strategy |
|-----------|---------|-----------------|
| Transaction records | Future PostgreSQL | Daily automated backup |
| Integrity Ledger | Immutable hash chain | Replicated across nodes |
| UI/App code | GitHub + Vercel | Git history; instant rollback |
| Translations | `public/locales/` | Version controlled in Git |

### Rollback a Deployment
```bash
# Via Vercel CLI
vercel rollback

# Via Vercel Dashboard
# Deployments → Select previous deployment → Promote to Production
```

---

## 9. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Blank screen on kiosk | Service worker cache stale | Hard refresh: Ctrl+Shift+R |
| OTP not received | SMS gateway config | Check `VITE_OTP_SERVICE_KEY` env var |
| Voice commands not working | Microphone permission denied | Allow mic in Chrome site settings |
| TTS not speaking | Browser TTS not initialized | Ensure user interaction before TTS call |
| Session not timing out | KioskContext timer issue | Check browser tab is active/focused |
| Hindi text not rendering | Font not loaded | Verify Noto Sans Devanagari in CSS |
