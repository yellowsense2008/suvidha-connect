import React, { useState, useEffect } from 'react';
import { Zap, Flame, Building2, Shield, Wifi, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IdleScreenProps {
  onTouch: () => void;
}

const SLIDES = [
  {
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bg: 'from-yellow-950 to-orange-950',
    en: { title: 'Electricity Services', sub: 'Pay bills · New connections · Complaints' },
    hi: { title: 'बिजली सेवाएं', sub: 'बिल भुगतान · नए कनेक्शन · शिकायत' },
    as: { title: 'বিদ্যুৎ সেৱা', sub: 'বিল পৰিশোধ · নতুন সংযোগ · অভিযোগ' },
  },
  {
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    bg: 'from-orange-950 to-red-950',
    en: { title: 'Assam Gas Services', sub: 'New connections · Meter services · Complaints' },
    hi: { title: 'असम गैस सेवाएं', sub: 'नए कनेक्शन · मीटर सेवाएं · शिकायत' },
    as: { title: 'অসম গেছ সেৱা', sub: 'নতুন সংযোগ · মিটাৰ সেৱা · অভিযোগ' },
  },
  {
    icon: Building2,
    color: 'from-blue-500 to-cyan-500',
    bg: 'from-blue-950 to-cyan-950',
    en: { title: 'Municipal Services', sub: 'Water connections · Grievances · Property tax' },
    hi: { title: 'नगर पालिका सेवाएं', sub: 'पानी कनेक्शन · शिकायत · संपत्ति कर' },
    as: { title: 'পৌৰসভা সেৱা', sub: 'পানী সংযোগ · অভিযোগ · সম্পত্তি কৰ' },
  },
];

const TOUCH_LABELS = {
  en: 'Touch anywhere to begin',
  hi: 'शुरू करने के लिए कहीं भी स्पर्श करें',
  as: 'আৰম্ভ কৰিবলৈ যিকোনো ঠাইত স্পৰ্শ কৰক',
};

const LANG_CYCLE: ('en' | 'hi' | 'as')[] = ['en', 'hi', 'as'];

const IdleScreen: React.FC<IdleScreenProps> = ({ onTouch }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const [langIdx, setLangIdx] = useState(0);
  const [time, setTime] = useState(new Date());
  const [visible, setVisible] = useState(true);

  // Cycle slides every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % SLIDES.length);
        setLangIdx(i => (i + 1) % LANG_CYCLE.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[slideIdx];
  const lang = LANG_CYCLE[langIdx];
  const Icon = slide.icon;

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-between bg-gradient-to-b ${slide.bg} cursor-pointer select-none transition-colors duration-1000`}
      onClick={onTouch}
      onTouchStart={onTouch}
    >
      {/* Tricolor top */}
      <div className="w-full h-2 bg-[linear-gradient(90deg,#FF9933_0%,#FFFFFF_50%,#138808_100%)] shrink-0" />

      {/* Top bar */}
      <div className="w-full flex items-center justify-between px-10 pt-6 text-white/60 text-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="font-mono tracking-widest text-xs">SUVIDHA CONNECT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-xs font-semibold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Govt branding */}
        <div className="mb-10">
          <p className="text-white/50 text-sm font-bold tracking-[0.3em] uppercase mb-2">Government of India</p>
          <h1 className="text-6xl font-serif font-bold text-white tracking-wide drop-shadow-2xl">SUVIDHA</h1>
          <p className="text-white/60 text-base tracking-widest uppercase mt-2">Smart Civic Services Kiosk</p>
        </div>

        {/* Animated service card */}
        <div
          className={`transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 mb-8 shadow-2xl max-w-lg">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${slide.color} flex items-center justify-center mx-auto mb-6 shadow-xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">{slide[lang].title}</h2>
            <p className="text-white/70 text-lg">{slide[lang].sub}</p>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex gap-3 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ${i === slideIdx ? 'w-8 h-3 bg-white' : 'w-3 h-3 bg-white/30'}`}
            />
          ))}
        </div>

        {/* Touch to begin */}
        <div className="kiosk-idle-pulse">
          <Button
            className="h-20 px-16 text-2xl font-bold bg-white text-slate-900 hover:bg-white/90 rounded-2xl shadow-2xl border-0 gap-3"
            onClick={onTouch}
          >
            👆 {TOUCH_LABELS[lang]}
          </Button>
        </div>
      </div>

      {/* Language strip */}
      <div className="w-full flex justify-center gap-8 pb-6 text-white/40 text-sm font-medium">
        <span className={lang === 'en' ? 'text-white font-bold' : ''}>English</span>
        <span className="opacity-30">|</span>
        <span className={lang === 'hi' ? 'text-white font-bold' : ''}>हिंदी</span>
        <span className="opacity-30">|</span>
        <span className={lang === 'as' ? 'text-white font-bold' : ''}>অসমীয়া</span>
      </div>

      {/* Bottom bar */}
      <div className="w-full flex items-center justify-between px-10 pb-4 text-white/30 text-xs font-mono">
        <span>KIOSK-SEC5-001</span>
        <span>DPDP COMPLIANT • ISO 27001 • SECURE</span>
        <span>{time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>
  );
};

export default IdleScreen;
