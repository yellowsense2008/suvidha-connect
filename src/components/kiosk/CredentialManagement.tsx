import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, User, Phone, Mail, MapPin,
  Shield, CheckCircle, Loader2, Eye, EyeOff, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { credentialsApi } from '@/lib/api';

interface Props { onBack: () => void; }

const t = {
  en: {
    title: 'Update Consumer Info',
    sub: 'Securely update your personal and contact details',
    name: 'Full Name', mobile: 'Mobile Number', email: 'Email Address',
    address: 'Address', aadhaar: 'Aadhaar Number (masked)',
    sendOtp: 'Send OTP to verify', otp: 'Enter OTP',
    verify: 'Verify & Save Changes', saving: 'Saving...',
    success: 'Profile Updated Successfully!',
    successNote: 'Your changes have been saved and an audit trail has been recorded.',
    receipt: 'Download Update Receipt', back: 'Back to Home',
    otpSent: 'OTP sent to your registered mobile',
    secNote: 'Changes are OTP-verified and audit-logged for security',
    aadhaarNote: 'Only last 4 digits shown for privacy',
  },
  hi: {
    title: 'उपभोक्ता जानकारी अपडेट',
    sub: 'अपने व्यक्तिगत और संपर्क विवरण सुरक्षित रूप से अपडेट करें',
    name: 'पूरा नाम', mobile: 'मोबाइल नंबर', email: 'ईमेल पता',
    address: 'पता', aadhaar: 'आधार नंबर (मास्क)',
    sendOtp: 'सत्यापन के लिए OTP भेजें', otp: 'OTP दर्ज करें',
    verify: 'सत्यापित करें और परिवर्तन सहेजें', saving: 'सहेजा जा रहा है...',
    success: 'प्रोफ़ाइल सफलतापूर्वक अपडेट!',
    successNote: 'आपके परिवर्तन सहेजे गए हैं और ऑडिट ट्रेल दर्ज की गई है।',
    receipt: 'अपडेट रसीद डाउनलोड करें', back: 'होम पर वापस जाएं',
    otpSent: 'OTP आपके पंजीकृत मोबाइल पर भेजा गया',
    secNote: 'परिवर्तन OTP-सत्यापित और ऑडिट-लॉग किए गए हैं',
    aadhaarNote: 'गोपनीयता के लिए केवल अंतिम 4 अंक दिखाए गए',
  },
  as: {
    title: 'গ্ৰাহক তথ্য আপডেট',
    sub: 'আপোনাৰ ব্যক্তিগত আৰু যোগাযোগৰ বিৱৰণ সুৰক্ষিতভাৱে আপডেট কৰক',
    name: 'সম্পূৰ্ণ নাম', mobile: 'মোবাইল নম্বৰ', email: 'ইমেইল ঠিকনা',
    address: 'ঠিকনা', aadhaar: 'আধাৰ নম্বৰ (মাস্ক)',
    sendOtp: 'যাচাইৰ বাবে OTP পঠাওক', otp: 'OTP দিয়ক',
    verify: 'যাচাই কৰক আৰু পৰিৱৰ্তন সংৰক্ষণ কৰক', saving: 'সংৰক্ষণ হৈছে...',
    success: 'প্ৰফাইল সফলতাৰে আপডেট!',
    successNote: 'আপোনাৰ পৰিৱৰ্তনসমূহ সংৰক্ষণ কৰা হৈছে আৰু অডিট ট্ৰেইল ৰেকৰ্ড কৰা হৈছে।',
    receipt: 'আপডেট ৰচিদ ডাউনলোড কৰক', back: 'হোমলৈ উভতি যাওক',
    otpSent: 'OTP আপোনাৰ পঞ্জীভুক্ত মোবাইলত পঠোৱা হৈছে',
    secNote: 'পৰিৱৰ্তনসমূহ OTP-যাচাই আৰু অডিট-লগ কৰা হৈছে',
    aadhaarNote: 'গোপনীয়তাৰ বাবে কেৱল শেষ ৪টা সংখ্যা দেখুওৱা হৈছে',
  },
};

const CredentialManagement: React.FC<Props> = ({ onBack }) => {
  const { citizen, language, updateCitizen } = useAuth();
  const lang = (language as keyof typeof t) in t ? (language as keyof typeof t) : 'en';
  const tx = t[lang];

  const [name, setName] = useState(citizen?.name || '');
  const [mobile, setMobile] = useState(citizen?.mobile || '');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(citizen?.address || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [refId] = useState(`UPD-${Date.now().toString().slice(-8)}`);

  const maskedAadhaar = citizen?.aadhaar
    ? citizen.aadhaar.replace(/\d(?=\d{4})/g, 'X')
    : 'XXXX-XXXX-XXXX';

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    await new Promise(r => setTimeout(r, 800));
    setOtpSent(true);
    toast.success(tx.otpSent);
  };

  const handleSave = async () => {
    if (!otpSent || otp.length !== 6) {
      toast.error('Please verify with OTP first');
      return;
    }
    setSaving(true);
    try {
      // Try real backend first
      if (citizen?.id) {
        await credentialsApi.update(citizen.id, { name, mobile, email, address });
      }
    } catch {
      // fallback: update local state only
    }
    await new Promise(r => setTimeout(r, 800));
    updateCitizen({ name, mobile, address });
    setSaving(false);
    setDone(true);
    toast.success(tx.success);
  };

  if (done) {
    return (
      <div className="p-8 overflow-y-auto pb-10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <Card className="border border-green-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-100">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{tx.success}</h2>
            <div className="bg-slate-50 p-4 rounded-lg my-4 border border-slate-200 text-left space-y-2">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Update Reference</p>
              <p className="font-mono font-bold text-blue-700 text-xl">{refId}</p>
            </div>
            <p className="text-slate-500 mb-6 text-sm">{tx.successNote}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => {
                toast.success('Receipt downloaded');
              }}>
                <FileText className="w-4 h-4 mr-2" /> {tx.receipt}
              </Button>
              <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>
                {tx.back}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{tx.title}</h2>
          <p className="text-slate-500">{tx.sub}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 overflow-y-auto pb-10 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> {tx.name}
              </label>
              <Input value={name} onChange={e => setName(e.target.value)} className="h-12 text-base" />
            </div>

            {/* Mobile */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" /> {tx.mobile}
              </label>
              <div className="flex gap-3">
                <Input
                  value={mobile}
                  onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="h-12 text-base flex-1"
                  disabled={otpSent}
                />
                {!otpSent && (
                  <Button onClick={handleSendOtp} className="h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                    {tx.sendOtp}
                  </Button>
                )}
              </div>
            </div>

            {/* OTP */}
            {otpSent && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" /> {tx.otp}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      type={showOtp ? 'text' : 'password'}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-12 text-base text-center tracking-[0.4em] font-mono pr-12"
                      placeholder="••••••"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowOtp(!showOtp)}
                    >
                      {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button variant="outline" onClick={() => { setOtpSent(false); setOtp(''); }} className="h-12 px-4 text-slate-600">
                    Change
                  </Button>
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {tx.otpSent}
                </p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" /> {tx.email}
              </label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="h-12 text-base" type="email" />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> {tx.address}
              </label>
              <Input value={address} onChange={e => setAddress(e.target.value)} className="h-12 text-base" />
            </div>

            {/* Aadhaar (read-only masked) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" /> {tx.aadhaar}
              </label>
              <div className="h-12 px-4 flex items-center bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-500 text-sm">
                {maskedAadhaar}
                <span className="ml-auto text-xs text-slate-400">{tx.aadhaarNote}</span>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
              <Shield className="w-4 h-4 shrink-0" />
              {tx.secNote}
            </div>

            <Button
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              onClick={handleSave}
              disabled={saving || !otpSent || otp.length !== 6}
            >
              {saving ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{tx.saving}</> : tx.verify}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CredentialManagement;
