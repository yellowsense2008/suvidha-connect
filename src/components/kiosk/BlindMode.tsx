import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Eye, Mic, Volume2, ArrowLeft, CreditCard, MessageSquareWarning, Search, Phone } from 'lucide-react';

interface BlindModeProps {
  onModuleSelect: (module: string) => void;
  onExit: () => void;
}

const MENU_ITEMS = [
  { id: 'bills', icon: CreditCard, en: 'Pay Bills. Electricity, Gas and Water bills.', hi: 'बिल भरें। बिजली, गैस और पानी के बिल।', as: 'বিল পৰিশোধ কৰক। বিদ্যুৎ, গেছ আৰু পানীৰ বিল।' },
  { id: 'complaint', icon: MessageSquareWarning, en: 'Register Complaint. Report civic issues.', hi: 'शिकायत दर्ज करें। नागरिक समस्याएं रिपोर्ट करें।', as: 'অভিযোগ দাখিল কৰক। নাগৰিক সমস্যা ৰিপোৰ্ট কৰক।' },
  { id: 'track', icon: Search, en: 'Track Status. Check your complaint or request status.', hi: 'स्थिति ट्रैक करें। अपनी शिकायत या अनुरोध की स्थिति जांचें।', as: 'স্থিতি ট্ৰেক কৰক। আপোনাৰ অভিযোগ বা অনুৰোধৰ স্থিতি পৰীক্ষা কৰক।' },
  { id: 'helpline', icon: Phone, en: 'Call Helpline. Speak to a support officer.', hi: 'हेल्पलाइन पर कॉल करें। सहायता अधिकारी से बात करें।', as: 'হেল্পলাইনত ফোন কৰক। সহায়তা বিষয়াৰ সৈতে কথা পাতক।' },
];

const BlindMode: React.FC<BlindModeProps> = ({ onModuleSelect, onExit }) => {
  const { language, citizen } = useAuth();
  const { speak } = useKiosk();
  const [focusIndex, setFocusIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const lang = language as 'en' | 'hi' | 'as';

  const speakItem = useCallback((index: number) => {
    const item = MENU_ITEMS[index];
    const text = item[lang] || item.en;
    speak(`Option ${index + 1}. ${text}`);
  }, [lang, speak]);

  // Auto-announce on mount
  useEffect(() => {
    const greeting = lang === 'hi'
      ? `नमस्ते ${citizen?.name || 'नागरिक'}। ब्लाइंड मोड सक्रिय है। ${MENU_ITEMS.length} विकल्प उपलब्ध हैं।`
      : lang === 'as'
      ? `নমস্কাৰ ${citizen?.name || 'নাগৰিক'}। ব্লাইণ্ড মোড সক্ৰিয়। ${MENU_ITEMS.length}টা বিকল্প উপলব্ধ।`
      : `Hello ${citizen?.name || 'Citizen'}. Blind mode activated. ${MENU_ITEMS.length} options available. Swipe up or down to navigate. Double tap to select.`;
    setTimeout(() => speak(greeting), 500);
    setTimeout(() => speakItem(0), 2500);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { const next = (focusIndex + 1) % MENU_ITEMS.length; setFocusIndex(next); speakItem(next); }
      if (e.key === 'ArrowUp') { const prev = (focusIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length; setFocusIndex(prev); speakItem(prev); }
      if (e.key === 'Enter') handleSelect(MENU_ITEMS[focusIndex].id);
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusIndex]);

  const handleSelect = (id: string) => {
    if (id === 'helpline') { speak('Calling helpline 1800-XXX-XXXX'); return; }
    speak(lang === 'hi' ? 'खुल रहा है...' : lang === 'as' ? 'খোলা হৈছে...' : 'Opening...');
    setTimeout(() => { onModuleSelect(id); }, 1000);
  };

  const handleVoiceNav = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      speak('Voice not supported'); return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'as' ? 'as-IN' : 'en-IN';
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript.toLowerCase();
      const match = MENU_ITEMS.find(item => t.includes(item.id) || t.includes(item.en.split('.')[0].toLowerCase()));
      if (match) handleSelect(match.id);
      else speak('Command not recognized. Please try again.');
    };
    rec.start();
    speak(lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-6" role="main" aria-label="Blind Mode Navigation">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">
              {lang === 'hi' ? 'ब्लाइंड मोड' : lang === 'as' ? 'ব্লাইণ্ড মোড' : 'Blind Mode'}
            </p>
            <p className="text-slate-400 text-sm">
              {lang === 'hi' ? 'ऑडियो नेविगेशन सक्रिय' : lang === 'as' ? 'অডিঅ নেভিগেচন সক্ৰিয়' : 'Audio navigation active'}
            </p>
          </div>
        </div>
        <Button variant="ghost" onClick={onExit} className="text-slate-400 hover:text-white gap-2">
          <ArrowLeft className="w-4 h-4" />
          {lang === 'hi' ? 'सामान्य मोड' : lang === 'as' ? 'সাধাৰণ মোড' : 'Normal Mode'}
        </Button>
      </div>

      {/* Menu Items — Large touch targets */}
      <div className="flex-1 space-y-4">
        {MENU_ITEMS.map((item, i) => (
          <button key={item.id} onClick={() => { setFocusIndex(i); handleSelect(item.id); }}
            onFocus={() => { setFocusIndex(i); speakItem(i); }}
            className={`w-full p-8 rounded-3xl border-4 transition-all text-left flex items-center gap-6 focus:outline-none ${focusIndex === i ? 'border-blue-500 bg-blue-900/50 scale-[1.02] shadow-2xl shadow-blue-500/20' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            aria-label={item[lang] || item.en} tabIndex={0}>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${focusIndex === i ? 'bg-blue-600' : 'bg-slate-700'}`}>
              <item.icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-2xl font-bold mb-1">{i + 1}. {(item[lang] || item.en).split('.')[0]}</p>
              <p className="text-slate-400 text-base">{(item[lang] || item.en).split('.').slice(1).join('.').trim()}</p>
            </div>
            {focusIndex === i && (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">●</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Voice + Speak buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button onClick={() => speakItem(focusIndex)}
          className="p-6 bg-green-700 hover:bg-green-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg transition-all active:scale-95">
          <Volume2 className="w-8 h-8" />
          {lang === 'hi' ? 'दोबारा सुनें' : lang === 'as' ? 'পুনৰ শুনক' : 'Repeat'}
        </button>
        <button onClick={handleVoiceNav}
          className={`p-6 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg transition-all active:scale-95 ${listening ? 'bg-red-600 animate-pulse' : 'bg-purple-700 hover:bg-purple-600'}`}>
          <Mic className="w-8 h-8" />
          {listening ? (lang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...') : (lang === 'hi' ? 'बोलें' : lang === 'as' ? 'কওক' : 'Speak')}
        </button>
      </div>

      <p className="text-slate-600 text-center text-sm mt-4">
        {lang === 'hi' ? '↑↓ नेविगेट करें • Enter चुनें • Esc बाहर निकलें' : '↑↓ Navigate • Enter Select • Esc Exit'}
      </p>
    </div>
  );
};

export default BlindMode;
