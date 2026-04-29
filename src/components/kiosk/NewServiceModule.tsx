import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, Zap, Flame, Droplets,
  User, MapPin, Upload, CheckCircle, Loader2, FileText,
  Printer, RefreshCw, Unplug, ArrowRightLeft, Wrench, Calendar, Gauge
} from 'lucide-react';
import { toast } from 'sonner';
import ThermalReceipt from './ThermalReceipt';

interface NewServiceModuleProps { onBack: () => void; }

// ─── Translations ─────────────────────────────────────────────────────────────
const tx = {
  en: {
    title: 'New Service / Connection Request',
    subtitle: 'Apply for new connections or service changes',
    selectOrg: 'Select Service Category',
    electricity: 'Electricity', gas: 'Gas', water: 'Water',
    selectSubtype: 'Select Request Type',
    applicantName: 'Applicant Name', address: 'Installation Address',
    loadKW: 'Required Load (kW)', loadPlaceholder: 'e.g. 5',
    remarks: 'Additional Remarks (Optional)',
    idProof: 'ID Proof Type',
    aadhaar: 'Aadhaar Card', pan: 'PAN Card', voter: 'Voter ID', passport: 'Passport',
    uploadId: 'Upload ID Proof', uploaded: 'Document Uploaded',
    submit: 'Submit Application', submitting: 'Submitting...',
    success: 'Application Submitted!',
    refNumber: 'Reference Number',
    trackNote: 'Use this reference number to track your application',
    newRequest: 'Submit Another', backToHome: 'Back to Home',
    estimatedTime: 'Estimated Processing: 7–15 working days',
    pointsAwarded: '+10 Suvidha Points awarded',
    thermalReceipt: 'Thermal Receipt',
    subtypes: {
      // Electricity
      new_electricity: 'New Electricity Connection',
      load_extension: 'Load Extension / Enhancement',
      // Gas
      new_gas: 'New Gas Connection',
      meter_install: 'Meter Installation / Replacement',
      reconnect: 'Reconnect / Disconnect',
      prepaid_conversion: 'Postpaid to Prepaid Conversion',
      pipeline_inspection: 'Pipeline Inspection',
      maintenance_schedule: 'Maintenance Scheduling',
      // Water
      new_water: 'New Water Connection',
      water_upgrade: 'Connection Upgrade',
    }
  },
  hi: {
    title: 'नई सेवा / कनेक्शन अनुरोध',
    subtitle: 'नए कनेक्शन या सेवा परिवर्तन के लिए आवेदन करें',
    selectOrg: 'सेवा श्रेणी चुनें',
    electricity: 'बिजली', gas: 'गैस', water: 'पानी',
    selectSubtype: 'अनुरोध प्रकार चुनें',
    applicantName: 'आवेदक का नाम', address: 'स्थापना पता',
    loadKW: 'आवश्यक लोड (kW)', loadPlaceholder: 'जैसे 5',
    remarks: 'अतिरिक्त टिप्पणी (वैकल्पिक)',
    idProof: 'पहचान प्रमाण प्रकार',
    aadhaar: 'आधार कार्ड', pan: 'पैन कार्ड', voter: 'मतदाता पहचान पत्र', passport: 'पासपोर्ट',
    uploadId: 'पहचान प्रमाण अपलोड करें', uploaded: 'दस्तावेज़ अपलोड किया गया',
    submit: 'आवेदन जमा करें', submitting: 'जमा हो रहा है...',
    success: 'आवेदन जमा!',
    refNumber: 'संदर्भ संख्या',
    trackNote: 'अपने आवेदन को ट्रैक करने के लिए इस संदर्भ संख्या का उपयोग करें',
    newRequest: 'एक और जमा करें', backToHome: 'होम पर वापस जाएं',
    estimatedTime: 'अनुमानित प्रसंस्करण: 7–15 कार्य दिवस',
    pointsAwarded: '+10 सुविधा अंक मिले',
    thermalReceipt: 'थर्मल रसीद',
    subtypes: {
      new_electricity: 'नया बिजली कनेक्शन',
      load_extension: 'लोड विस्तार / वृद्धि',
      new_gas: 'नया गैस कनेक्शन',
      meter_install: 'मीटर स्थापना / बदलाव',
      reconnect: 'पुनः कनेक्ट / डिस्कनेक्ट',
      prepaid_conversion: 'पोस्टपेड से प्रीपेड रूपांतरण',
      pipeline_inspection: 'पाइपलाइन निरीक्षण',
      maintenance_schedule: 'रखरखाव शेड्यूलिंग',
      new_water: 'नया पानी कनेक्शन',
      water_upgrade: 'कनेक्शन अपग्रेड',
    }
  },
  as: {
    title: 'নতুন সেৱা / সংযোগ অনুৰোধ',
    subtitle: 'নতুন সংযোগ বা সেৱা পৰিৱৰ্তনৰ বাবে আবেদন কৰক',
    selectOrg: 'সেৱাৰ শ্ৰেণী বাছক',
    electricity: 'বিদ্যুৎ', gas: 'গেছ', water: 'পানী',
    selectSubtype: 'অনুৰোধৰ প্ৰকাৰ বাছক',
    applicantName: 'আবেদনকাৰীৰ নাম', address: 'স্থাপনাৰ ঠিকনা',
    loadKW: 'প্ৰয়োজনীয় লোড (kW)', loadPlaceholder: 'যেনে 5',
    remarks: 'অতিৰিক্ত মন্তব্য (বাঞ্ছনীয়)',
    idProof: 'পৰিচয় প্ৰমাণৰ প্ৰকাৰ',
    aadhaar: 'আধাৰ কাৰ্ড', pan: 'পেন কাৰ্ড', voter: 'ভোটাৰ পৰিচয়পত্ৰ', passport: 'পাছপোৰ্ট',
    uploadId: 'পৰিচয় প্ৰমাণ আপলোড কৰক', uploaded: 'দস্তাবেজ আপলোড কৰা হৈছে',
    submit: 'আবেদন দাখিল কৰক', submitting: 'দাখিল হৈছে...',
    success: 'আবেদন দাখিল!',
    refNumber: 'ৰেফাৰেন্স নম্বৰ',
    trackNote: 'আপোনাৰ আবেদন ট্ৰেক কৰিবলৈ এই ৰেফাৰেন্স নম্বৰ ব্যৱহাৰ কৰক',
    newRequest: 'আন এটা দাখিল কৰক', backToHome: 'হোমলৈ উভতি যাওক',
    estimatedTime: 'প্ৰত্যাশিত প্ৰক্ৰিয়াকৰণ: ৭–১৫ কাৰ্যদিৱস',
    pointsAwarded: '+10 সুবিধা পইণ্ট পোৱা গৈছে',
    thermalReceipt: 'থাৰ্মেল ৰচিদ',
    subtypes: {
      new_electricity: 'নতুন বিদ্যুৎ সংযোগ',
      load_extension: 'লোড বিস্তাৰ / বৃদ্ধি',
      new_gas: 'নতুন গেছ সংযোগ',
      meter_install: 'মিটাৰ স্থাপনা / সলনি',
      reconnect: 'পুনৰ সংযোগ / বিচ্ছেদ',
      prepaid_conversion: 'পোষ্টপেইড ৰপৰা প্ৰিপেইড ৰূপান্তৰ',
      pipeline_inspection: 'পাইপলাইন পৰিদৰ্শন',
      maintenance_schedule: 'ৰক্ষণাবেক্ষণ নিৰ্ধাৰণ',
      new_water: 'নতুন পানী সংযোগ',
      water_upgrade: 'সংযোগ আপগ্ৰেড',
    }
  }
};

// ─── Subtype config per org ───────────────────────────────────────────────────
const SUBTYPES = {
  electricity: [
    { id: 'new_electricity', icon: Zap },
    { id: 'load_extension', icon: Gauge },
  ],
  gas: [
    { id: 'new_gas', icon: Flame },
    { id: 'meter_install', icon: Wrench },
    { id: 'reconnect', icon: RefreshCw },
    { id: 'prepaid_conversion', icon: ArrowRightLeft },
    { id: 'pipeline_inspection', icon: Unplug },
    { id: 'maintenance_schedule', icon: Calendar },
  ],
  municipal: [
    { id: 'new_water', icon: Droplets },
    { id: 'water_upgrade', icon: Gauge },
  ],
};

const ORG_ICONS = { electricity: Zap, gas: Flame, municipal: Droplets };
const ORG_COLORS = {
  electricity: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  gas: 'border-orange-400 bg-orange-50 text-orange-700',
  municipal: 'border-blue-400 bg-blue-50 text-blue-700',
};

const NewServiceModule: React.FC<NewServiceModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen, organization } = useAuth();
  const { submitServiceRequest } = useKiosk();
  const lang = (language as keyof typeof tx) in tx ? (language as keyof typeof tx) : 'en';
  const t = tx[lang];

  // Pre-select org from context
  const [selectedOrg, setSelectedOrg] = useState<'electricity' | 'gas' | 'municipal'>(
    (organization as 'electricity' | 'gas' | 'municipal') || 'electricity'
  );
  const [subtype, setSubtype] = useState('');
  const [applicantName, setApplicantName] = useState(citizen?.name || '');
  const [address, setAddress] = useState(citizen?.address || '');
  const [loadKW, setLoadKW] = useState('');
  const [remarks, setRemarks] = useState('');
  const [idProofType, setIdProofType] = useState('');
  const [idUploaded, setIdUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [showThermal, setShowThermal] = useState(false);

  const idProofs = [
    { id: 'aadhaar', label: t.aadhaar },
    { id: 'pan', label: t.pan },
    { id: 'voter', label: t.voter },
    { id: 'passport', label: t.passport },
  ];

  const handleUpload = () => {
    setTimeout(() => {
      setIdUploaded(true);
      toast.success(lang === 'en' ? 'Document uploaded successfully' : 'दस्तावेज़ सफलतापूर्वक अपलोड किया गया');
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!subtype || !applicantName || !address || !idProofType) {
      toast.error(lang === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }
    setSubmitting(true);
    try {
      const refNum = await submitServiceRequest({
        citizenId: citizen?.id || 'CIT001',
        type: subtype as any,
        applicantName,
        address,
        idProofType,
        requestSubtype: subtype,
        loadKW: loadKW ? parseFloat(loadKW) : undefined,
        documents: idUploaded ? [`id_proof_${Date.now()}.jpg`] : [],
      } as any);
      if (updateCitizen) {
        updateCitizen({ points: (citizen?.points || 0) + 10 });
        toast.success(t.pointsAwarded);
      }
      setReferenceNumber(refNum);
    } catch {
      toast.error(lang === 'en' ? 'Failed to submit. Please try again.' : 'जमा करने में विफल। पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubtype(''); setApplicantName(citizen?.name || '');
    setAddress(citizen?.address || ''); setLoadKW('');
    setRemarks(''); setIdProofType('');
    setIdUploaded(false); setReferenceNumber(null);
  };

  // ─── Success Screen ──────────────────────────────────────────────────────────
  if (referenceNumber) {
    return (
      <div className="p-8 overflow-y-auto pb-10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <Card className="border border-blue-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{t.success}</h2>
            <div className="bg-slate-50 p-6 rounded-lg my-6 border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">{t.refNumber}</p>
              <p className="text-3xl font-mono font-bold text-blue-700">{referenceNumber}</p>
            </div>
            <p className="text-slate-600 mb-2">{t.trackNote}</p>
            <p className="text-sm text-blue-600 mb-6 font-medium bg-blue-50 py-2 px-4 rounded-full inline-block">
              {t.estimatedTime}
            </p>
            <div className="flex gap-3 flex-wrap mb-4">
              <Button className="flex-1 h-12 border border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" onClick={() => setShowThermal(true)}>
                <Printer className="w-4 h-4 mr-2" />{t.thermalReceipt}
              </Button>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1 h-12 border border-slate-300" variant="outline" onClick={resetForm}>{t.newRequest}</Button>
              <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>{t.backToHome}</Button>
            </div>
            {showThermal && (
              <ThermalReceipt
                language={lang}
                onClose={() => setShowThermal(false)}
                data={{
                  type: 'request',
                  title: 'New Service Application Receipt',
                  refId: referenceNumber,
                  rows: [
                    { label: 'Applicant', value: applicantName },
                    { label: 'Service', value: t.subtypes[subtype as keyof typeof t.subtypes] || subtype },
                    { label: 'Address', value: address },
                    { label: 'ID Proof', value: idProofType },
                    { label: 'Status', value: 'SUBMITTED', bold: true },
                    { label: 'TAT', value: '7–15 working days' },
                  ],
                  footer: 'Use Reference Number to track application',
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtypes = SUBTYPES[selectedOrg] || [];

  return (
    <div className="p-6 md:p-8 overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 hover:bg-blue-50 hover:text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-200 shadow-lg">
          <CardContent className="p-8 overflow-y-auto pb-10 space-y-8">

            {/* Org selector (only if not pre-selected) */}
            {!organization && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t.selectOrg} *</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['electricity', 'gas', 'municipal'] as const).map((org) => {
                    const Icon = ORG_ICONS[org];
                    const isSelected = selectedOrg === org;
                    return (
                      <div
                        key={org}
                        onClick={() => { setSelectedOrg(org); setSubtype(''); }}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all text-center ${isSelected ? ORG_COLORS[org] : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-semibold text-sm">{t[org as 'electricity' | 'gas' | 'water']}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subtype Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{t.selectSubtype} *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subtypes.map(({ id, icon: Icon }) => {
                  const label = t.subtypes[id as keyof typeof t.subtypes] || id;
                  const isSelected = subtype === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setSubtype(id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected ? 'border-blue-500 bg-blue-50/60 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applicant Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />{t.applicantName} *
              </label>
              <Input value={applicantName} onChange={e => setApplicantName(e.target.value)} className="h-12 text-base" placeholder="Enter full name" />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />{t.address} *
              </label>
              <Input value={address} onChange={e => setAddress(e.target.value)} className="h-12 text-base" placeholder="Enter installation address" />
            </div>

            {/* Load kW — only for electricity */}
            {(subtype === 'new_electricity' || subtype === 'load_extension') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-yellow-500" />{t.loadKW}
                </label>
                <Input value={loadKW} onChange={e => setLoadKW(e.target.value)} className="h-12 text-base" placeholder={t.loadPlaceholder} type="number" min="1" />
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">{t.remarks}</label>
              <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="min-h-20 text-base" placeholder="Any additional information..." />
            </div>

            {/* ID Proof */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />{t.idProof} *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {idProofs.map(proof => (
                  <div
                    key={proof.id}
                    onClick={() => setIdProofType(proof.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center text-sm ${
                      idProofType === proof.id ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 hover:border-blue-200 text-slate-600'
                    }`}
                  >
                    {proof.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload */}
            {idProofType && (
              <div className="animate-in fade-in slide-in-from-top-2">
                {!idUploaded ? (
                  <Button variant="outline" className="h-14 w-full border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600" onClick={handleUpload}>
                    <Upload className="w-5 h-5 mr-2" />{t.uploadId}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t.uploaded}</span>
                    <Button variant="ghost" size="sm" className="ml-auto text-blue-600" onClick={() => setIdUploaded(false)}>Change</Button>
                  </div>
                )}
              </div>
            )}

            {/* Submit */}
            <Button
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              disabled={!subtype || !applicantName || !address || !idProofType || submitting}
              onClick={handleSubmit}
            >
              {submitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{t.submitting}</> : t.submit}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewServiceModule;
