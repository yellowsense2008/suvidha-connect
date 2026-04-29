# SUVIDHA Connect – Smart Civic Services Kiosk (Hackathon Prototype)

SUVIDHA Connect is a Smart Urban Virtual Interactive Digital Helpdesk Assistant (SUVIDHA) prototype built for Indian civic utility offices.

This unified kiosk enables citizens to securely access essential services such as:

- Electricity bill payment
- Gas distribution services (Assam Gas focus)
- Water and municipal grievance support
- Complaint registration and tracking
- Service request applications
- Admin monitoring dashboard

---

## 🚀 Live Demo

Deployed on Vercel:

https://suvidha-connect.vercel.app

---

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** TailwindCSS + Shadcn UI
- **State Management:** React Context API
- **Routing:** React Router v6
- **i18n:** i18next (English + Hindi)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **PWA:** Vite PWA Plugin
- **Deployment:** Vercel

---

## ✨ Key Features

### Citizen Services
- 🔐 **Multi-factor Authentication** (OTP, Consumer ID, QR placeholder)
- 💳 **Bill Payment** (Electricity, Gas, Water)
- 📝 **Complaint Registration** with tracking
- 🆕 **New Connection Requests**
- 📊 **Status Tracking** with timeline
- 📄 **Document Download** (Receipts, Certificates)
- 🏆 **Rewards System** (Gamification)
- 📅 **Appointment Booking**
- ♻️ **Waste Management**

### Accessibility
- 🌐 **Multilingual** (English + Hindi)
- 🔊 **Text-to-Speech** (TTS)
- 🎤 **Voice Commands**
- 👁️ **High Contrast Mode**
- ⌨️ **Virtual Keyboard**
- 📱 **Mobile Responsive**
- ⌨️ **Keyboard Navigation**

### Admin Features
- 📊 **Real-time Dashboard**
- 📈 **Analytics & Reports**
- 🔔 **Civic Alerts Management**
- 🔒 **Security Monitoring**
- 🔗 **Integrity Ledger** (Blockchain demo)
- 📋 **Audit Logs**
- ⚠️ **Threat Detection**

### Innovation
- 💬 **AI Chat Assistant**
- 🎤 **Voice Commander**
- 🏅 **Gamification & Rewards**
- 🔔 **Real-time Notifications**
- 📱 **PWA Support** (Installable)
- ⚡ **Offline Capability**

---

## 🔐 Cybersecurity & Resilience Highlights

- Secure kiosk session timeout (3 minutes)
- Fraud-prevention controls (rate limiting design)
- Integrity Ledger for complaint/payment hashes
- AI-driven anomaly monitoring (demo module)
- DPDP Act compliant privacy-first design
- Encrypted session management

---

## 🏢 Developed By

****  
Hackathon Prototype – 2026

---

## ⚙️ Run Locally

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yellowsense2008/suvidha-connect.git
cd suvidha-connect

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser at http://localhost:8080
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Demo Credentials

### Citizen Login

**Option 1: Mobile OTP**
- Mobile: `9876543210`
- OTP: `123456`

**Option 2: Consumer ID**
- Consumer ID: `ELEC2024001`
- PIN: `1234`

### Admin Login
- Username: `admin`
- Password: `admin123`

---

## 📁 Project Structure

```
suvidha-connect/
├── public/
│   ├── locales/          # i18n translations
│   │   ├── en/
│   │   └── hi/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── admin/        # Admin dashboard components
│   │   ├── kiosk/        # Citizen kiosk components
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and mock data
│   ├── pages/            # Route pages
│   └── App.tsx           # Main app component
├── docs/                 # Documentation
└── package.json
```

---

## 🎯 Features Checklist

### Guideline Compliance
- ✅ Multi-service integration (Electricity, Gas, Water)
- ✅ Multilingual UI (English + Hindi)
- ✅ Secure authentication (OTP, Consumer ID)
- ✅ Bill payment with receipt generation
- ✅ Complaint registration & tracking
- ✅ Service request workflow
- ✅ Admin dashboard with analytics
- ✅ Real-time civic alerts
- ✅ Document download/print
- ✅ Mobile responsive design
- ✅ Accessibility features (TTS, High Contrast)
- ✅ Session timeout & security
- ✅ PWA support

---

## 🚀 Performance

- ⚡ Code splitting for optimal loading
- 📦 Lazy loading for admin routes
- 🎨 Optimized bundle size
- 📱 Mobile-first responsive design
- 🔄 PWA with offline support
- ⚡ Fast page transitions

---

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📄 License

This is a hackathon prototype. All rights reserved by .

---

## 🤝 Contributing

This is a hackathon submission. For inquiries, please contact the development team.

---

## 📞 Support

For issues or questions:
- Email: support@suvidha-connect.gov.in
- GitHub Issues: [Create an issue]

---

## 🎉 Acknowledgments

- C-DAC for organizing the SUVIDHA Challenge 2026
- Ministry of Electronics and Information Technology (MeitY)
- Smart City Mission, Government of India
- All open-source libraries and contributors

---

**Built with ❤️ for Indian Citizens**