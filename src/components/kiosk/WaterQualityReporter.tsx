import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Droplets, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface WaterQualityReporterProps { onBack: () => void; }

const TDS_LEVELS = [
  { id: 'clear', label: 'Clear', labelHi: 'साफ', labelAs: 'পৰিষ্কাৰ', color: '#e0f2fe', textColor: '#0369a1', tds: '< 50 ppm', quality: 'Excellent', severity: 'low', desc: 'Water appears clean and clear. Normal quality.' },
  { id: 'slight', label: 'Slightly Cloudy', labelHi: 'थोड़ा धुंधला', labelAs: 'অলপ ঘোলা', color: '#fef9c3', textColor: '#854d0e', tds: '50-150 ppm', quality: 'Acceptable', severity: 'low', desc: 'Minor cloudiness detected. May need monitoring.' },
  { id: 'yellow', label: 'Yellowish', labelHi: 'पीला', labelAs: 'হালধীয়া', color: '#fef08a', textColor: '#713f12', tds: '150-300 ppm', quality: 'Poor', severity: 'medium', desc: 'Yellow tint indicates possible iron/rust contamination.' },
  { id: 'brown', label: 'Brown / Muddy', labelHi: 'भूरा / मटमैला', labelAs: 'বাদামী / কাদাময়', color: '#d97706', textColor: '#ffffff', tds: '300-600 ppm', quality: 'Bad', severity: 'high', desc: 'Brown water indicates sediment or pipe corrosion. Do not drink.' },
  { id: 'black', label: 'Black / Dark', labelHi: 'काला / गहरा', labelAs: 'কলা / গাঢ়', color: '#1e293b', textColor: '#ffffff', tds: '> 600 ppm', quality: 'Dangerous', severity: 'critical', desc: 'Severely contaminated. Possible sewage mixing. Emergency!' },
];

const SMELL_OPTIONS = [
  { id: 'none', label: 'No Smell', labelHi: 'कोई गंध नहीं', labelAs: 'কোনো গোন্ধ নাই' },
  { id: 'chlorine', label: 'Chlorine', labelHi: 'क्लोरीन', labelAs: 'ক্লৰিন' },
  { id: 'sulfur', label: 'Sulfur/Rotten Egg', labelHi: 'सल्फर/सड़े अंडे', labelAs: 'ছালফাৰ/পচা কণী' },
  { id: 'sewage', label: 'Sewage', labelHi: 'सीवेज', labelAs: 'নৰ্দমা' },
];

const WaterQualityReporter: React.FC<WaterQualityReporterProps> = ({ onBack }) => {
  const { language, citizen } = useAuth();
  const { submitComplaint } = useKiosk();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSmell, setSelectedSmell] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const lang = language as 'en' | 'hi' | 'as';
  const labelKey = lang === 'hi' ? 'labelHi' : lang === 'as' ? 'labelAs' : 'label';

  const selectedLevel = TDS_LEVELS.find(l => l.id === selectedColor);

  const handleSubmit = async () => {
    if (!selectedColor || !location) { toast.error('Please select water color and enter location'); return; }
    setSubmitting(true);
    const desc = `Water Quality Report: Color=${selectedLevel?.label}, TDS=${selectedLevel?.tds}, Quality=${selectedLevel?.quality}, Smell=${selectedSmell || 'None'}. ${selectedLevel?.desc}`;
    const id = await submitComplaint({
      citizenId: citizen?.id || 'CIT001',
      category: 'water_quality' as any,
      description: desc,
      location,
      status: 'pending',
      attachments: [],
      org: 'municipal',
    } as any);
    setSubmitting(false);
    setSubmitted(id);
    toast.success('Water quality report submitted!');
  };

  if (submitted) return (
    <div className="p-8 overflow-y-auto pb-10 max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
      <Card className="border-green-200 shadow-xl">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
          <p className="font-mono font-bold text-blue-700 text-xl mb-4">{submitted}</p>
          <p className="text-slate-500 text-sm mb-6">Water quality team will inspect within {selectedLevel?.severity === 'critical' ? '2 hours' : selectedLevel?.severity === 'high' ? '24 hours' : '3 days'}.</p>
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            {lang === 'hi' ? 'जल गुणवत्ता रिपोर्ट' : lang === 'as' ? 'পানীৰ মান ৰিপোৰ্ট' : 'Water Quality Report'}
          </h2>
          <p className="text-slate-500 text-sm">
            {lang === 'hi' ? 'पानी का रंग चुनें और समस्या रिपोर्ट करें' : lang === 'as' ? 'পানীৰ ৰং বাছক আৰু সমস্যা ৰিপোৰ্ট কৰক' : 'Select water color and report the issue'}
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm mb-6">
        <CardContent className="p-6">
          {/* TDS Color Scale */}
          <p className="text-sm font-semibold text-slate-700 mb-4">
            {lang === 'hi' ? 'पानी का रंग चुनें *' : lang === 'as' ? 'পানীৰ ৰং বাছক *' : 'Select Water Color *'}
          </p>
          <div className="grid grid-cols-5 gap-3 mb-4">
            {TDS_LEVELS.map(level => (
              <button key={level.id} onClick={() => setSelectedColor(level.id)}
                className={`relative p-4 rounded-2xl border-3 transition-all flex flex-col items-center gap-2 ${selectedColor === level.id ? 'ring-4 ring-blue-500 ring-offset-2 scale-105 shadow-lg' : 'border-slate-200 hover:scale-102'}`}
                style={{ backgroundColor: level.color, borderColor: selectedColor === level.id ? '#3b82f6' : '#e2e8f0' }}>
                <div className="w-10 h-10 rounded-full border-2 border-white/50 shadow-inner" style={{ backgroundColor: level.color === '#e0f2fe' ? '#bae6fd' : level.color }} />
                <span className="text-xs font-bold text-center leading-tight" style={{ color: level.textColor }}>{level[labelKey as keyof typeof level] as string}</span>
                {selectedColor === level.id && <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
              </button>
            ))}
          </div>

          {/* Selected Level Info */}
          {selectedLevel && (
            <div className={`p-4 rounded-xl border-2 mb-4 animate-in fade-in duration-200 ${selectedLevel.severity === 'critical' ? 'border-red-300 bg-red-50' : selectedLevel.severity === 'high' ? 'border-orange-300 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                {selectedLevel.severity === 'critical' || selectedLevel.severity === 'high' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <Droplets className="w-5 h-5 text-blue-600" />}
                <span className="font-bold">TDS: {selectedLevel.tds} — Quality: {selectedLevel.quality}</span>
              </div>
              <p className="text-sm text-slate-600">{selectedLevel.desc}</p>
            </div>
          )}

          {/* Smell */}
          <p className="text-sm font-semibold text-slate-700 mb-3">
            {lang === 'hi' ? 'गंध (वैकल्पिक)' : lang === 'as' ? 'গোন্ধ (বাঞ্ছনীয়)' : 'Smell (Optional)'}
          </p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SMELL_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setSelectedSmell(opt.id)}
                className={`p-3 rounded-xl border-2 text-xs font-medium text-center transition-all ${selectedSmell === opt.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}`}>
                {opt[labelKey as keyof typeof opt] as string}
              </button>
            ))}
          </div>

          {/* Location */}
          <p className="text-sm font-semibold text-slate-700 mb-2">
            {lang === 'hi' ? 'स्थान *' : lang === 'as' ? 'স্থান *' : 'Location *'}
          </p>
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder={lang === 'hi' ? 'अपना क्षेत्र दर्ज करें' : lang === 'as' ? 'আপোনাৰ এলাকা দিয়ক' : 'Enter your area / sector'}
            className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-base focus:border-blue-500 focus:outline-none mb-4" />

          <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            disabled={!selectedColor || !location || submitting} onClick={handleSubmit}>
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Submitting...</> : <><Droplets className="w-5 h-5 mr-2" />{lang === 'hi' ? 'रिपोर्ट दर्ज करें' : lang === 'as' ? 'ৰিপোৰ্ট দাখিল কৰক' : 'Submit Water Quality Report'}</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityReporter;
