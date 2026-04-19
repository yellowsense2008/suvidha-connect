import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CreditCard, MessageSquareWarning, Phone, Volume2,
  ArrowLeft, ChevronRight, Zap, Flame, Droplets, HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface SeniorModeProps {
  onModuleSelect: (module: string) => void;
  onExit: () => void;
}

const SeniorCitizenMode: React.FC<SeniorModeProps> = ({ onModuleSelect, onExit }) => {
  const { language } = useAuth();
  const { speak, ttsEnabled } = useKiosk();
  const [step, setStep] = useState<'menu' | 'help'>('menu');

  const t = {
    en: {
      greeting: 'Namaste! 🙏',
      subtitle: 'How can we help you today?',
      payBill: 'Pay My Bill',
      payBillSub: 'Electricity • Gas • Water',
      complaint: 'Report a Problem',
      complaintSub: 'Power cut, water issue, gas problem',
      helpline: 'Call Helpline',
      helplineSub: 'Speak to a real person',
      back: 'Back to Normal Mode',
      helpNumber: '1800-XXX-XXXX',
      helpFree: 'Toll Free • Available 24/7',
      listen: 'Listen',
      tap: 'Tap any option to continue',
    },
    hi: {
      greeting: 'नमस्ते! 🙏',
      subtitle: 'आज हम आपकी कैसे मदद कर सकते हैं?',
      payBill: 'बिल भरें',
      payBillSub: 'बिजली • गैस • पानी',
      complaint: 'समस्या बताएं',
      complaintSub: 'बिजली गुल, पानी की समस्या, गैस की समस्या',
      helpline: 'हेल्पलाइन पर कॉल करें',
      helplineSub: 'किसी व्यक्ति से बात करें',
      back: 'सामान्य मोड पर वापस जाएं',
      helpNumber: '1800-XXX-XXXX',
      helpFree: 'टोल फ्री • 24/7 उपलब्ध',
      listen: 'सुनें',
      tap: 'जारी रखने के लिए कोई भी विकल्प दबाएं',
    }
  };

  const text = t[language];

  const handleSpeak = (msg: string) => {
    if (ttsEnabled) speak(msg);
    else toast.info('Enable TTS in settings to hear audio');
  };

  const services = [
    {
      id: 'bills',
      icon: CreditCard,
      label: text.payBill,
      sub: text.payBillSub,
      color: 'bg-blue-600 hover:bg-blue-700',
      subIcons: [Zap, Flame, Droplets]
    },
    {
      id: 'complaint',
      icon: MessageSquareWarning,
      label: text.complaint,
      sub: text.complaintSub,
      color: 'bg-orange-500 hover:bg-orange-600',
      subIcons: []
    },
    {
      id: 'helpline',
      icon: Phone,
      label: text.helpline,
      sub: text.helplineSub,
      color: 'bg-green-600 hover:bg-green-700',
      subIcons: []
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-slate-900 mb-3">{text.greeting}</h1>
        <p className="text-2xl text-slate-600">{text.subtitle}</p>
        <p className="text-lg text-slate-400 mt-2">{text.tap}</p>
      </div>

      {/* Big Service Buttons */}
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full flex-1">
        {services.map((service) => (
          <button
            key={service.id}
            className={`${service.color} text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all active:scale-95 text-left flex items-center gap-6 w-full`}
            onClick={() => {
              if (service.id === 'helpline') {
                toast.info(`${text.helpNumber} — ${text.helpFree}`);
                handleSpeak(`Calling helpline ${text.helpNumber}`);
              } else {
                onModuleSelect(service.id);
              }
            }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <service.icon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold mb-1">{service.label}</p>
              <p className="text-lg text-white/80">{service.sub}</p>
              {service.subIcons.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {service.subIcons.map((Icon, i) => (
                    <Icon key={i} className="w-5 h-5 text-white/70" />
                  ))}
                </div>
              )}
            </div>
            <ChevronRight className="w-10 h-10 text-white/60 shrink-0" />
          </button>
        ))}

        {/* TTS Help Button */}
        <button
          className="bg-purple-100 border-2 border-purple-300 text-purple-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-4 w-full"
          onClick={() => handleSpeak(`${text.greeting} ${text.subtitle}. ${services.map(s => s.label).join(', ')}`)}
        >
          <div className="w-16 h-16 bg-purple-200 rounded-2xl flex items-center justify-center shrink-0">
            <Volume2 className="w-9 h-9 text-purple-700" />
          </div>
          <div>
            <p className="text-2xl font-bold">{text.listen}</p>
            <p className="text-base text-purple-600">Read all options aloud</p>
          </div>
        </button>
      </div>

      {/* Exit Senior Mode */}
      <div className="text-center mt-8">
        <Button
          variant="ghost"
          onClick={onExit}
          className="text-slate-500 hover:text-slate-700 text-base"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {text.back}
        </Button>
      </div>
    </div>
  );
};

export default SeniorCitizenMode;
