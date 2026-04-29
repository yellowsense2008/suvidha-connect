import React, { useState } from 'react';
import { useAuth, type Language, type Organization } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Zap, Flame, Building2, Globe, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
];

const ORGS: {
  id: Organization;
  icon: React.ElementType;
  color: string;
  iconBg: string;
  border: string;
  label: Record<Language, string>;
  desc: Record<Language, string>;
  tag: Record<Language, string>;
}[] = [
  {
    id: 'electricity',
    icon: Zap,
    color: 'text-yellow-600',
    iconBg: 'bg-yellow-50 group-hover:bg-yellow-100',
    border: 'hover:border-yellow-400 data-[selected=true]:border-yellow-500 data-[selected=true]:bg-yellow-50/60',
    label: { en: 'Electricity', hi: 'बिजली विभाग', as: 'বিদ্যুৎ বিভাগ' },
    desc: { en: 'Bill payment, new connections, complaints & meter services', hi: 'बिल भुगतान, नए कनेक्शन, शिकायत और मीटर सेवाएं', as: 'বিল পৰিশোধ, নতুন সংযোগ, অভিযোগ আৰু মিটাৰ সেৱা' },
    tag: { en: 'APDCL / State Discom', hi: 'APDCL / राज्य डिस्कॉम', as: 'APDCL / ৰাজ্য ডিস্কম' },
  },
  {
    id: 'gas',
    icon: Flame,
    color: 'text-orange-600',
    iconBg: 'bg-orange-50 group-hover:bg-orange-100',
    border: 'hover:border-orange-400 data-[selected=true]:border-orange-500 data-[selected=true]:bg-orange-50/60',
    label: { en: 'Assam Gas', hi: 'असम गैस विभाग', as: 'অসম গেছ বিভাগ' },
    desc: { en: 'New gas connections, meter services, complaints & bill view', hi: 'नया गैस कनेक्शन, मीटर सेवाएं, शिकायत और बिल देखें', as: 'নতুন গেছ সংযোগ, মিটাৰ সেৱা, অভিযোগ আৰু বিল চাওক' },
    tag: { en: 'Assam Gas Company Ltd.', hi: 'असम गैस कंपनी लिमिटेड', as: 'অসম গেছ কোম্পানী লিমিটেড' },
  },
  {
    id: 'municipal',
    icon: Building2,
    color: 'text-blue-600',
    iconBg: 'bg-blue-50 group-hover:bg-blue-100',
    border: 'hover:border-blue-400 data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50/60',
    label: { en: 'Municipality', hi: 'नगर पालिका', as: 'পৌৰসভা' },
    desc: { en: 'Water connections, grievances, property tax & civic services', hi: 'पानी कनेक्शन, शिकायत, संपत्ति कर और नागरिक सेवाएं', as: 'পানী সংযোগ, অভিযোগ, সম্পত্তি কৰ আৰু নাগৰিক সেৱা' },
    tag: { en: 'Municipal Corporation / GMC', hi: 'नगर निगम / GMC', as: 'পৌৰ নিগম / GMC' },
  },
];

const HEADING: Record<Language, string> = {
  en: 'Select Your Language',
  hi: 'अपनी भाषा चुनें',
  as: 'আপোনাৰ ভাষা বাছক',
};

const ORG_HEADING: Record<Language, string> = {
  en: 'Select Department',
  hi: 'विभाग चुनें',
  as: 'বিভাগ বাছক',
};

const ORG_SUB: Record<Language, string> = {
  en: 'Which service do you need today?',
  hi: 'आज आपको कौन सी सेवा चाहिए?',
  as: 'আজি আপোনাৰ কোন সেৱাৰ প্ৰয়োজন?',
};

const PROCEED: Record<Language, string> = {
  en: 'Proceed',
  hi: 'आगे बढ़ें',
  as: 'আগবাঢ়ক',
};

const GOVT: Record<Language, string> = {
  en: 'Government of India',
  hi: 'भारत सरकार',
  as: 'ভাৰত চৰকাৰ',
};

interface LandingPageProps {
  onComplete: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
  const { setLanguage, setOrganization } = useAuth();
  const { i18n } = useTranslation();

  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [selectedOrg, setSelectedOrg] = useState<Organization>(null);
  const [step, setStep] = useState<'language' | 'org'>('language');

  const handleLangSelect = (lang: Language) => {
    setSelectedLang(lang);
  };

  const handleLangProceed = () => {
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
    setStep('org');
  };

  const handleOrgProceed = () => {
    if (!selectedOrg) return;
    setOrganization(selectedOrg);
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[hsl(220,90%,18%)] to-[hsl(220,90%,28%)] relative overflow-y-auto">
      {/* Tricolor top bar */}
      <div className="h-2 w-full bg-[linear-gradient(90deg,#FF9933_0%,#FFFFFF_50%,#138808_100%)] shrink-0" />

      {/* Background circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      {/* Header branding */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-6 px-6 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 shadow-xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <p className="text-xs font-bold tracking-[0.25em] text-blue-200 uppercase mb-1">{GOVT[selectedLang]}</p>
        <h1 className="text-4xl font-serif font-bold tracking-wide">SUVIDHA</h1>
        <p className="text-blue-200 text-sm mt-1 tracking-widest uppercase opacity-80">Smart Civic Services Kiosk</p>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-2xl">

          {step === 'language' && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{HEADING[selectedLang]}</h2>
                    <p className="text-sm text-slate-500">Choose language / भाषा चुनें / ভাষা বাছক</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangSelect(lang.code)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        selectedLang === lang.code
                          ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      {selectedLang === lang.code && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-3xl mb-3">{lang.flag}</div>
                      <p className={`text-xl font-bold mb-1 ${selectedLang === lang.code ? 'text-blue-700' : 'text-slate-800'}`}>
                        {lang.native}
                      </p>
                      <p className="text-xs text-slate-500">{lang.label}</p>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 shadow-lg rounded-xl gap-2"
                  onClick={handleLangProceed}
                >
                  {PROCEED[selectedLang]}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 'org' && (
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{ORG_HEADING[selectedLang]}</h2>
                  <p className="text-slate-500 mt-1">{ORG_SUB[selectedLang]}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {ORGS.map((org) => {
                    const Icon = org.icon;
                    const isSelected = selectedOrg === org.id;
                    return (
                      <button
                        key={org.id}
                        data-selected={isSelected}
                        onClick={() => setSelectedOrg(org.id)}
                        className={`group w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isSelected
                            ? `border-current shadow-md scale-[1.01] ${org.border.split(' ').filter(c => c.startsWith('data-[selected=true]')).map(c => c.replace('data-[selected=true]:', '')).join(' ')}`
                            : `border-slate-200 ${org.border.split(' ').filter(c => c.startsWith('hover:')).join(' ')}`
                        } ${isSelected ? (org.id === 'electricity' ? 'border-yellow-500 bg-yellow-50/60' : org.id === 'gas' ? 'border-orange-500 bg-orange-50/60' : 'border-blue-500 bg-blue-50/60') : ''}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${org.iconBg}`}>
                          <Icon className={`w-8 h-8 ${org.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-bold ${isSelected ? org.color : 'text-slate-900'}`}>
                              {org.label[selectedLang]}
                            </h3>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                              {org.tag[selectedLang]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed">{org.desc[selectedLang]}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          isSelected
                            ? (org.id === 'electricity' ? 'border-yellow-500 bg-yellow-500' : org.id === 'gas' ? 'border-orange-500 bg-orange-500' : 'border-blue-500 bg-blue-500')
                            : 'border-slate-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-xl border-slate-300 text-slate-600"
                    onClick={() => setStep('language')}
                  >
                    ← {selectedLang === 'en' ? 'Back' : selectedLang === 'hi' ? 'वापस' : 'উভতি'}
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 shadow-lg rounded-xl gap-2 disabled:opacity-50"
                    onClick={handleOrgProceed}
                    disabled={!selectedOrg}
                  >
                    {PROCEED[selectedLang]}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className={`w-3 h-3 rounded-full transition-all ${step === 'language' ? 'bg-white scale-125' : 'bg-white/40'}`} />
            <div className={`w-3 h-3 rounded-full transition-all ${step === 'org' ? 'bg-white scale-125' : 'bg-white/40'}`} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-blue-200/60 text-xs pb-4 tracking-wider">
        SUVIDHA CONNECT • SMART CITY MISSION • GOVT. OF INDIA
      </div>
    </div>
  );
};

export default LandingPage;
