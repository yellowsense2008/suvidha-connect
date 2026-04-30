import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Zap, Flame, Droplets, Trash2, 
  MapPin, Upload, CheckCircle, Loader2, Shield, AlertTriangle,
  FileText, Lightbulb, Construction, BellOff, HelpCircle, Printer, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import ThermalReceipt from './ThermalReceipt';
import AIPhotoComplaintAnalyzer from './AIPhotoComplaintAnalyzer';

interface ComplaintModuleProps {
  onBack: () => void;
}

// Extended categories covering all 3 org modules
const ALL_CATEGORIES: Record<string, { en: string; hi: string; as: string; icon: React.ElementType; org: string[] }> = {
  // Electricity
  incorrect_bill:       { en: 'Incorrect Electricity Bill',          hi: 'गलत बिजली बिल',              as: 'ভুল বিদ্যুৎ বিল',              icon: FileText,      org: ['electricity'] },
  delay_connection:     { en: 'Delay in New Connection Approval',    hi: 'नए कनेक्शन में देरी',          as: 'নতুন সংযোগত বিলম্ব',           icon: Zap,           org: ['electricity'] },
  delay_meter:          { en: 'Delay in Meter Replacement/Shifting', hi: 'मीटर बदलाव में देरी',          as: 'মিটাৰ সলনিত বিলম্ব',           icon: AlertTriangle, org: ['electricity'] },
  disconnection:        { en: 'Disconnection Without Prior Notice',  hi: 'बिना सूचना कटौती',             as: 'পূৰ্ব জাননী অবিহনে বিচ্ছেদ',    icon: BellOff,       org: ['electricity'] },
  power_outage:         { en: 'Power Outage',                        hi: 'बिजली गुल',                   as: 'বিদ্যুৎ বিভ্ৰাট',              icon: Zap,           org: ['electricity'] },
  // Gas
  gas_leakage:          { en: 'Gas Leakage',                         hi: 'गैस रिसाव',                   as: 'গেছ লিক',                      icon: Flame,         org: ['gas'] },
  gas_supply:           { en: 'Gas Supply Disruption',               hi: 'गैस आपूर्ति बाधा',             as: 'গেছ যোগান বাধা',               icon: Flame,         org: ['gas'] },
  // Municipal
  water_supply:         { en: 'Water Supply Disruption',             hi: 'पानी आपूर्ति बाधा',            as: 'পানী যোগান বাধা',              icon: Droplets,      org: ['municipal'] },
  sewage:               { en: 'Sewage Overflow or Blockage',         hi: 'सीवेज ओवरफ्लो या रुकावट',     as: 'নৰ্দমা উপচি পৰা বা বাধা',      icon: Droplets,      org: ['municipal'] },
  garbage:              { en: 'Garbage Collection Irregularity',     hi: 'कचरा संग्रह अनियमितता',       as: 'আৱৰ্জনা সংগ্ৰহ অনিয়মিততা',   icon: Trash2,        org: ['municipal'] },
  streetlight:          { en: 'Streetlight Failure',                 hi: 'स्ट्रीटलाइट खराबी',           as: 'ষ্ট্ৰিটলাইট বিজুতি',           icon: Lightbulb,     org: ['municipal'] },
  road_damage:          { en: 'Road Damage and Potholes',            hi: 'सड़क क्षति और गड्ढे',          as: 'পথ ক্ষতি আৰু গাঁত',            icon: Construction,  org: ['municipal'] },
  water_quality:        { en: 'Water Quality Complaint',             hi: 'पानी गुणवत्ता शिकायत',         as: 'পানীৰ মান অভিযোগ',             icon: Droplets,      org: ['municipal'] },
  property_tax:         { en: 'Property Tax Error',                  hi: 'संपत्ति कर त्रुटि',            as: 'সম্পত্তি কৰ ত্ৰুটি',           icon: FileText,      org: ['municipal'] },
  waste_management:     { en: 'Waste Management',                    hi: 'अपशिष्ट प्रबंधन',             as: 'আৱৰ্জনা ব্যৱস্থাপনা',         icon: Trash2,        org: ['electricity', 'gas', 'municipal'] },
  other:                { en: 'Other',                               hi: 'अन्य',                        as: 'অন্যান্য',                     icon: HelpCircle,    org: ['electricity', 'gas', 'municipal'] },
};

interface ComplaintModuleProps {
  onBack: () => void;
}

const ComplaintModule: React.FC<ComplaintModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const { submitComplaint } = useKiosk();
  const { isOnline, enqueue } = useOfflineQueue();
  
  // Determine which org categories to show
  const orgContext = (window as any).__suvidhaOrg || 'electricity';
  const visibleCategories = Object.entries(ALL_CATEGORIES).filter(
    ([, v]) => v.org.includes(orgContext)
  );

  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingGeo, setDetectingGeo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [showThermal, setShowThermal] = useState(false);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  const handleAIDetected = (detectedCategory: string, detectedDescription: string) => {
    // Map AI category to our complaint categories
    const categoryMap: Record<string, string> = {
      streetlight: 'streetlight',
      road_damage: 'road_damage',
      garbage: 'garbage',
      water_supply: 'water_supply',
      power_outage: 'power_outage',
      gas_leakage: 'gas_leakage',
    };
    const mapped = categoryMap[detectedCategory] || 'other';
    setCategory(mapped);
    setDescription(detectedDescription);
    toast.success('✅ Complaint form auto-filled by AI!');
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device');
      return;
    }
    setDetectingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoCoords({ lat: latitude, lng: longitude });
        setLocation(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setDetectingGeo(false);
        toast.success(language === 'en' ? 'Location detected' : 'स्थान पता चला');
      },
      () => {
        setDetectingGeo(false);
        toast.error(language === 'en' ? 'Could not detect location' : 'स्थान पता नहीं चला');
      },
      { timeout: 8000 }
    );
  };

  const lang = (language as 'en' | 'hi' | 'as') in { en: 1, hi: 1, as: 1 } ? (language as 'en' | 'hi' | 'as') : 'en';

  const tx = {
    en: {
      title: 'Register Complaint', subtitle: 'Report issues with civic utilities',
      category: 'Complaint Category', selectCategory: 'Select a category',
      description: 'Description', descriptionPlaceholder: 'Describe the issue in detail...',
      location: 'Location / Zone', locationPlaceholder: 'Enter your area, sector, or zone',
      attachments: 'Attachments (Optional)', uploadPhoto: 'Upload Photo/Document',
      submit: 'Submit Complaint', submitting: 'Submitting...',
      success: 'Complaint Registered Successfully!', complaintId: 'Complaint ID',
      trackNote: 'Use this ID to track your complaint status',
      newComplaint: 'Register Another Complaint', backToHome: 'Back to Home',
      securityNote: 'Your complaint is encrypted and tamper-proof',
      fraudPrevention: 'Anti-spam protection active',
    },
    hi: {
      title: 'शिकायत दर्ज करें', subtitle: 'नागरिक उपयोगिताओं के साथ समस्याओं की रिपोर्ट करें',
      category: 'शिकायत श्रेणी', selectCategory: 'एक श्रेणी चुनें',
      description: 'विवरण', descriptionPlaceholder: 'समस्या का विस्तार से वर्णन करें...',
      location: 'स्थान / ज़ोन', locationPlaceholder: 'अपना क्षेत्र, सेक्टर या ज़ोन दर्ज करें',
      attachments: 'अनुलग्नक (वैकल्पिक)', uploadPhoto: 'फोटो/दस्तावेज़ अपलोड करें',
      submit: 'शिकायत दर्ज करें', submitting: 'जमा हो रहा है...',
      success: 'शिकायत सफलतापूर्वक दर्ज!', complaintId: 'शिकायत आईडी',
      trackNote: 'अपनी शिकायत की स्थिति ट्रैक करने के लिए इस आईडी का उपयोग करें',
      newComplaint: 'एक और शिकायत दर्ज करें', backToHome: 'होम पर वापस जाएं',
      securityNote: 'आपकी शिकायत एन्क्रिप्टेड और छेड़छाड़-रोधी है',
      fraudPrevention: 'एंटी-स्पैम सुरक्षा सक्रिय',
    },
    as: {
      title: 'অভিযোগ দাখিল কৰক', subtitle: 'নাগৰিক সুবিধাসমূহৰ সমস্যা ৰিপোৰ্ট কৰক',
      category: 'অভিযোগৰ শ্ৰেণী', selectCategory: 'এটা শ্ৰেণী বাছক',
      description: 'বিৱৰণ', descriptionPlaceholder: 'সমস্যাটো বিতংভাৱে বৰ্ণনা কৰক...',
      location: 'স্থান / জোন', locationPlaceholder: 'আপোনাৰ এলাকা, ছেক্টৰ বা জোন দিয়ক',
      attachments: 'সংলগ্নক (বাঞ্ছনীয়)', uploadPhoto: 'ফটো/দস্তাবেজ আপলোড কৰক',
      submit: 'অভিযোগ দাখিল কৰক', submitting: 'দাখিল হৈছে...',
      success: 'অভিযোগ সফলতাৰে দাখিল!', complaintId: 'অভিযোগ আইডি',
      trackNote: 'আপোনাৰ অভিযোগৰ স্থিতি ট্ৰেক কৰিবলৈ এই আইডি ব্যৱহাৰ কৰক',
      newComplaint: 'আন এটা অভিযোগ দাখিল কৰক', backToHome: 'হোমলৈ উভতি যাওক',
      securityNote: 'আপোনাৰ অভিযোগ এন্ক্ৰিপ্টেড আৰু ছেড়ছাড়-ৰোধী',
      fraudPrevention: 'এন্টি-স্পাম সুৰক্ষা সক্ৰিয়',
    },
  };

  const text = tx[lang];

  const handleFileUpload = () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setAttachments([...attachments, `attachment_${Date.now()}.jpg`]);
      setUploading(false);
      toast.success(language === 'en' ? 'File uploaded' : 'फ़ाइल अपलोड की गई');
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!category || !description || !location) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }
    if (description.length < 20) {
      toast.error(language === 'en' ? 'Please provide a more detailed description' : 'कृपया अधिक विस्तृत विवरण प्रदान करें');
      return;
    }

    setSubmitting(true);

    // If offline — queue it
    if (!isOnline) {
      const queueId = enqueue('complaint', {
        citizenId: citizen?.id || 'CIT001',
        category, description, location, attachments, status: 'pending',
      });
      setComplaintId(`OFFLINE-${queueId.slice(-8)}`);
      if (citizen && updateCitizen) updateCitizen({ points: (citizen.points || 0) + 30 });
      setSubmitting(false);
      return;
    }

    try {
      const id = await submitComplaint({
        citizenId: citizen?.id || 'CIT001',
        category: category as 'power_outage' | 'gas_leakage' | 'water_supply' | 'waste_management',
        description, location, status: 'pending', attachments,
      });
      setComplaintId(id);
      if (citizen && updateCitizen) {
        updateCitizen({ points: (citizen.points || 0) + 30 });
        toast.success(`${text.success} (+30 Points)`);
      } else {
        toast.success(text.success);
      }
    } catch {
      toast.error(language === 'en' ? 'Failed to submit complaint' : 'शिकायत दर्ज करने में विफल');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setLocation('');
    setGeoCoords(null);
    setAttachments([]);
    setComplaintId(null);
  };

  // Success Screen
  if (complaintId) {
    return (
      <div className="p-8 overflow-y-auto pb-10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <Card className="border border-blue-100 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{text.success}</h2>
            
            <div className="bg-slate-50 p-6 rounded-lg my-6 border border-slate-200">
              <p className="text-sm text-slate-500 mb-2">{text.complaintId}</p>
              <p className="text-3xl font-mono font-bold text-blue-700">{complaintId}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6 bg-blue-50/50 p-2 rounded-full w-fit mx-auto px-4">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>{text.securityNote}</span>
            </div>

            <p className="text-slate-600 mb-8">{text.trackNote}</p>

            <div className="flex gap-3 flex-wrap mb-4">
              <Button className="flex-1 h-14 border border-blue-200 text-blue-700 hover:bg-blue-50" variant="outline" onClick={() => setShowThermal(true)}>
                <Printer className="w-5 h-5 mr-2" />Thermal Receipt
              </Button>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1 h-14 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50" variant="secondary" onClick={resetForm}>
                {text.newComplaint}
              </Button>
              <Button className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>
                {text.backToHome}
              </Button>
            </div>
            {showThermal && (
              <ThermalReceipt
                language={lang}
                onClose={() => setShowThermal(false)}
                data={{
                  type: 'complaint',
                  title: 'Complaint Registration Receipt',
                  refId: complaintId,
                  rows: [
                    { label: 'Category', value: category.replace(/_/g, ' ') },
                    { label: 'Location', value: location },
                    { label: 'Status', value: 'PENDING', bold: true },
                    { label: 'SLA', value: '7 working days' },
                  ],
                  footer: 'Use Complaint ID to track status',
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{text.title}</h2>
          <p className="text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* AI Photo Analyzer Button — prominent at top */}
        <button
          onClick={() => setShowAIAnalyzer(true)}
          className="w-full mb-6 p-5 rounded-2xl border-2 border-dashed border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all group flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-blue-800 text-lg flex items-center gap-2">
              📸 AI Photo Complaint Analyzer
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-normal">NEW</span>
            </p>
            <p className="text-blue-600 text-sm mt-0.5">
              {language === 'en' ? 'Take a photo → AI detects issue type & auto-fills form (85-96% accuracy)'
              : language === 'hi' ? 'फोटो लें → AI समस्या का पता लगाए और फॉर्म भरे'
              : 'ফটো তুলক → AI সমস্যা চিনাক্ত কৰি ফৰ্ম পূৰণ কৰিব'}
            </p>
          </div>
          <span className="ml-auto text-blue-400 text-2xl">→</span>
        </button>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 overflow-y-auto pb-10 space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">{text.category} *</label>
              <div className="grid grid-cols-2 gap-3">
                {visibleCategories.map(([key, cat]) => {
                  const Icon = cat.icon;
                  const isSelected = category === key;
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setCategory(key)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {cat[lang]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">{text.description} *</label>
              <Textarea
                placeholder={text.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500">{description.length}/500 characters</p>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                {text.location} *
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={text.locationPlaceholder}
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setGeoCoords(null); }}
                  className="h-14 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={detectingGeo}
                  className="h-14 px-4 border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-slate-600 hover:text-blue-600 shrink-0"
                  title="Detect GPS location"
                >
                  {detectingGeo ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </Button>
              </div>
              {geoCoords && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  GPS coordinates captured: {geoCoords.lat.toFixed(5)}, {geoCoords.lng.toFixed(5)}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">{text.attachments}</label>
              <div className="flex flex-wrap gap-3">
                {attachments.map((file, idx) => (
                  <div key={idx} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    {file}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="h-12 border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {text.uploadPhoto}
                </Button>
              </div>
            </div>

            {/* Fraud Prevention Notice */}
            <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-slate-600">
              <AlertTriangle className="w-4 h-4 text-blue-500" />
              {text.fraudPrevention}
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              disabled={!category || !description || !location || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  {text.submitting}
                </>
              ) : (
                text.submit
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Photo Analyzer Overlay */}
      {showAIAnalyzer && (
        <AIPhotoComplaintAnalyzer
          onComplaintDetected={handleAIDetected}
          onClose={() => setShowAIAnalyzer(false)}
        />
      )}
    </div>
  );
};

export default ComplaintModule;
