import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Wrench, ArrowRightLeft, CheckCircle,
  Loader2, Upload, AlertTriangle, Clock, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface Props { onBack: () => void; }

type RequestType = 'replacement' | 'shifting' | null;
type Severity = 'low' | 'medium' | 'high';

const t = {
  en: {
    title: 'Meter Replacement / Shifting',
    sub: 'Report meter malfunction or request shifting services',
    typeLabel: 'Select Request Type',
    replacement: 'Meter Replacement', replacementDesc: 'Meter malfunction, damage or not working',
    shifting: 'Meter Shifting', shiftingDesc: 'Relocate meter due to renovation or construction',
    reason: 'Reason / Description',
    reasonPlaceholder: 'Describe the issue in detail...',
    address: 'Meter Location / Address',
    addressPlaceholder: 'Enter the meter location',
    severity: 'Issue Severity',
    low: 'Low – Minor issue', medium: 'Medium – Affecting usage', high: 'High – Complete failure / Safety risk',
    upload: 'Upload Photo of Meter',
    submit: 'Submit Request', submitting: 'Submitting...',
    success: 'Request Submitted!',
    ticketId: 'Ticket ID',
    tat: 'Expected Resolution',
    tatLow: '5–7 working days', tatMed: '2–3 working days', tatHigh: '24 hours (Priority)',
    trackNote: 'Use this Ticket ID to track your request status',
    newReq: 'Submit Another Request', backHome: 'Back to Home',
    priorityNote: 'High severity requests are escalated to maintenance teams immediately',
  },
  hi: {
    title: 'मीटर बदलाव / स्थानांतरण',
    sub: 'मीटर खराबी रिपोर्ट करें या स्थानांतरण सेवाओं का अनुरोध करें',
    typeLabel: 'अनुरोध प्रकार चुनें',
    replacement: 'मीटर बदलाव', replacementDesc: 'मीटर खराबी, क्षति या काम नहीं कर रहा',
    shifting: 'मीटर स्थानांतरण', shiftingDesc: 'नवीनीकरण या निर्माण के कारण मीटर स्थानांतरित करें',
    reason: 'कारण / विवरण',
    reasonPlaceholder: 'समस्या का विस्तार से वर्णन करें...',
    address: 'मीटर स्थान / पता',
    addressPlaceholder: 'मीटर का स्थान दर्ज करें',
    severity: 'समस्या की गंभीरता',
    low: 'कम – मामूली समस्या', medium: 'मध्यम – उपयोग प्रभावित', high: 'उच्च – पूर्ण विफलता / सुरक्षा जोखिम',
    upload: 'मीटर की फोटो अपलोड करें',
    submit: 'अनुरोध जमा करें', submitting: 'जमा हो रहा है...',
    success: 'अनुरोध जमा!',
    ticketId: 'टिकट आईडी',
    tat: 'अपेक्षित समाधान',
    tatLow: '5–7 कार्य दिवस', tatMed: '2–3 कार्य दिवस', tatHigh: '24 घंटे (प्राथमिकता)',
    trackNote: 'अपने अनुरोध की स्थिति ट्रैक करने के लिए इस टिकट आईडी का उपयोग करें',
    newReq: 'एक और अनुरोध जमा करें', backHome: 'होम पर वापस जाएं',
    priorityNote: 'उच्च गंभीरता के अनुरोध तुरंत रखरखाव टीमों को भेजे जाते हैं',
  },
  as: {
    title: 'মিটাৰ সলনি / স্থানান্তৰ',
    sub: 'মিটাৰ বিজুতি ৰিপোৰ্ট কৰক বা স্থানান্তৰ সেৱাৰ অনুৰোধ কৰক',
    typeLabel: 'অনুৰোধৰ প্ৰকাৰ বাছক',
    replacement: 'মিটাৰ সলনি', replacementDesc: 'মিটাৰ বিজুতি, ক্ষতি বা কাম নকৰা',
    shifting: 'মিটাৰ স্থানান্তৰ', shiftingDesc: 'নৱীকৰণ বা নিৰ্মাণৰ বাবে মিটাৰ স্থানান্তৰ',
    reason: 'কাৰণ / বিৱৰণ',
    reasonPlaceholder: 'সমস্যাটো বিতংভাৱে বৰ্ণনা কৰক...',
    address: 'মিটাৰৰ স্থান / ঠিকনা',
    addressPlaceholder: 'মিটাৰৰ স্থান দিয়ক',
    severity: 'সমস্যাৰ গুৰুত্ব',
    low: 'কম – সামান্য সমস্যা', medium: 'মধ্যম – ব্যৱহাৰ প্ৰভাৱিত', high: 'উচ্চ – সম্পূৰ্ণ বিফলতা / সুৰক্ষা বিপদ',
    upload: 'মিটাৰৰ ফটো আপলোড কৰক',
    submit: 'অনুৰোধ দাখিল কৰক', submitting: 'দাখিল হৈছে...',
    success: 'অনুৰোধ দাখিল!',
    ticketId: 'টিকট আইডি',
    tat: 'প্ৰত্যাশিত সমাধান',
    tatLow: '৫–৭ কাৰ্যদিৱস', tatMed: '২–৩ কাৰ্যদিৱস', tatHigh: '২৪ ঘণ্টা (অগ্ৰাধিকাৰ)',
    trackNote: 'আপোনাৰ অনুৰোধৰ স্থিতি ট্ৰেক কৰিবলৈ এই টিকট আইডি ব্যৱহাৰ কৰক',
    newReq: 'আন এটা অনুৰোধ দাখিল কৰক', backHome: 'হোমলৈ উভতি যাওক',
    priorityNote: 'উচ্চ গুৰুত্বৰ অনুৰোধসমূহ তৎক্ষণাৎ ৰক্ষণাবেক্ষণ দলক পঠোৱা হয়',
  },
};

const MeterService: React.FC<Props> = ({ onBack }) => {
  const { language, citizen } = useAuth();
  const { submitServiceRequest } = useKiosk();
  const lang = (language as keyof typeof t) in t ? (language as keyof typeof t) : 'en';
  const tx = t[lang];

  const [reqType, setReqType] = useState<RequestType>(null);
  const [reason, setReason] = useState('');
  const [address, setAddress] = useState(citizen?.address || '');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const getTAT = () => {
    if (severity === 'high') return tx.tatHigh;
    if (severity === 'medium') return tx.tatMed;
    return tx.tatLow;
  };

  const handleSubmit = async () => {
    if (!reqType || !reason || !address) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    const ref = await submitServiceRequest({
      citizenId: citizen?.id || 'CIT001',
      type: 'new_electricity',
      applicantName: citizen?.name || '',
      address,
      idProofType: reqType,
    });
    setSubmitting(false);
    setTicketId(`MTR-${Date.now().toString().slice(-8)}`);
  };

  if (ticketId) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <Card className="border border-blue-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{tx.success}</h2>
            <div className="bg-slate-50 p-5 rounded-lg my-5 border border-slate-200 space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">{tx.ticketId}</p>
                <p className="text-2xl font-mono font-bold text-blue-700">{ticketId}</p>
              </div>
              <div className="border-t border-slate-200 pt-3 flex items-center justify-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{tx.tat}: <strong>{getTAT()}</strong></span>
              </div>
              {severity === 'high' && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {tx.priorityNote}
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm mb-6">{tx.trackNote}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => { setTicketId(null); setReqType(null); setReason(''); setSeverity('medium'); setPhotoUploaded(false); }}>
                {tx.newReq}
              </Button>
              <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>
                {tx.backHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{tx.title}</h2>
          <p className="text-slate-500">{tx.sub}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 space-y-6">
            {/* Request Type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">{tx.typeLabel} *</label>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { id: 'replacement' as RequestType, icon: Wrench, label: tx.replacement, desc: tx.replacementDesc },
                  { id: 'shifting' as RequestType, icon: ArrowRightLeft, label: tx.shifting, desc: tx.shiftingDesc },
                ]).map(opt => (
                  <div
                    key={opt.id!}
                    onClick={() => setReqType(opt.id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                      reqType === opt.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${reqType === opt.id ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-semibold ${reqType === opt.id ? 'text-blue-900' : 'text-slate-800'}`}>{opt.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">{tx.severity} *</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'low' as Severity, label: tx.low, color: 'border-green-400 bg-green-50 text-green-700', inactive: 'border-slate-200 hover:border-green-300' },
                  { id: 'medium' as Severity, label: tx.medium, color: 'border-yellow-400 bg-yellow-50 text-yellow-700', inactive: 'border-slate-200 hover:border-yellow-300' },
                  { id: 'high' as Severity, label: tx.high, color: 'border-red-400 bg-red-50 text-red-700', inactive: 'border-slate-200 hover:border-red-300' },
                ]).map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer text-center text-sm font-medium transition-all ${severity === s.id ? s.color : `${s.inactive} text-slate-600`}`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{tx.reason} *</label>
              <Textarea
                placeholder={tx.reasonPlaceholder}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="min-h-28 text-base"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{tx.address} *</label>
              <Input value={address} onChange={e => setAddress(e.target.value)} className="h-12 text-base" placeholder={tx.addressPlaceholder} />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{tx.upload}</label>
              {!photoUploaded ? (
                <Button variant="outline" className="h-14 w-full border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600"
                  onClick={() => { setTimeout(() => { setPhotoUploaded(true); toast.success('Photo uploaded'); }, 1000); }}>
                  <Upload className="w-5 h-5 mr-2" /> {tx.upload}
                </Button>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">meter_photo_{Date.now().toString().slice(-6)}.jpg</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-blue-600" onClick={() => setPhotoUploaded(false)}>Change</Button>
                </div>
              )}
            </div>

            {severity === 'high' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {tx.priorityNote}
              </div>
            )}

            <Button
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              disabled={!reqType || !reason || !address || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{tx.submitting}</> : tx.submit}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MeterService;
