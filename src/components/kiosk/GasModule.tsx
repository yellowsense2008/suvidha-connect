import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import {
  CreditCard, MessageSquareWarning, FilePlus, Search,
  FileDown, Wrench, UserCog, Volume2, ArrowLeftRight, Flame
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  onModuleSelect: (module: string) => void;
  onChangeOrg: () => void;
}

const labels = {
  en: {
    welcome: 'Assam Gas Services',
    sub: 'Select a service to continue',
    change: 'Change Department',
    tag: 'Assam Gas Company Ltd.',
    modules: [
      { id: 'newService', title: 'New Connection / Change Request', desc: 'New gas connection, reconnect, prepaid conversion & more', icon: FilePlus },
      { id: 'meter', title: 'Meter Malfunction / Damage', desc: 'Report meter issues or request replacement', icon: Wrench },
      { id: 'bills', title: 'Check / View Bills', desc: 'View gas bills and payment history', icon: CreditCard },
      { id: 'complaint', title: 'Register Complaint', desc: 'Gas leakage, supply issues & grievances', icon: MessageSquareWarning },
      { id: 'track', title: 'Track Complaint / Request', desc: 'Track via Ticket ID or Mobile Number', icon: Search },
      { id: 'credentials', title: 'Edit Consumer Profile', desc: 'Update mobile, name & personal details', icon: UserCog },
      { id: 'documents', title: 'Receipt Generation', desc: 'Download & print transaction receipts', icon: FileDown },
    ],
  },
  hi: {
    welcome: 'असम गैस सेवाएं',
    sub: 'जारी रखने के लिए एक सेवा चुनें',
    change: 'विभाग बदलें',
    tag: 'असम गैस कंपनी लिमिटेड',
    modules: [
      { id: 'newService', title: 'नया कनेक्शन / परिवर्तन अनुरोध', desc: 'नया गैस कनेक्शन, पुनः कनेक्शन, प्रीपेड रूपांतरण', icon: FilePlus },
      { id: 'meter', title: 'मीटर खराबी / क्षति', desc: 'मीटर समस्या रिपोर्ट करें या बदलाव अनुरोध', icon: Wrench },
      { id: 'bills', title: 'बिल देखें / जांचें', desc: 'गैस बिल और भुगतान इतिहास देखें', icon: CreditCard },
      { id: 'complaint', title: 'शिकायत दर्ज करें', desc: 'गैस रिसाव, आपूर्ति समस्याएं और शिकायतें', icon: MessageSquareWarning },
      { id: 'track', title: 'शिकायत / अनुरोध ट्रैक करें', desc: 'टिकट आईडी या मोबाइल नंबर से ट्रैक करें', icon: Search },
      { id: 'credentials', title: 'उपभोक्ता प्रोफ़ाइल संपादित करें', desc: 'मोबाइल, नाम और व्यक्तिगत विवरण अपडेट', icon: UserCog },
      { id: 'documents', title: 'रसीद जनरेशन', desc: 'लेनदेन रसीदें डाउनलोड और प्रिंट करें', icon: FileDown },
    ],
  },
  as: {
    welcome: 'অসম গেছ সেৱাসমূহ',
    sub: 'অব্যাহত ৰাখিবলৈ এটা সেৱা বাছক',
    change: 'বিভাগ সলনি কৰক',
    tag: 'অসম গেছ কোম্পানী লিমিটেড',
    modules: [
      { id: 'newService', title: 'নতুন সংযোগ / পৰিৱৰ্তন অনুৰোধ', desc: 'নতুন গেছ সংযোগ, পুনৰ সংযোগ, প্ৰিপেইড ৰূপান্তৰ', icon: FilePlus },
      { id: 'meter', title: 'মিটাৰ বিজুতি / ক্ষতি', desc: 'মিটাৰ সমস্যা ৰিপোৰ্ট কৰক বা সলনিৰ অনুৰোধ', icon: Wrench },
      { id: 'bills', title: 'বিল চাওক / পৰীক্ষা কৰক', desc: 'গেছ বিল আৰু পৰিশোধৰ ইতিহাস চাওক', icon: CreditCard },
      { id: 'complaint', title: 'অভিযোগ দাখিল কৰক', desc: 'গেছ লিক, যোগান সমস্যা আৰু অভিযোগ', icon: MessageSquareWarning },
      { id: 'track', title: 'অভিযোগ / অনুৰোধ ট্ৰেক কৰক', desc: 'টিকট আইডি বা মোবাইল নম্বৰেৰে ট্ৰেক কৰক', icon: Search },
      { id: 'credentials', title: 'গ্ৰাহক প্ৰফাইল সম্পাদনা', desc: 'মোবাইল, নাম আৰু ব্যক্তিগত বিৱৰণ আপডেট', icon: UserCog },
      { id: 'documents', title: 'ৰচিদ তৈয়াৰ', desc: 'লেনদেনৰ ৰচিদ ডাউনলোড আৰু প্ৰিন্ট কৰক', icon: FileDown },
    ],
  },
};

const GasModule: React.FC<Props> = ({ onModuleSelect, onChangeOrg }) => {
  const { language } = useAuth();
  const { speak, ttsEnabled } = useKiosk();
  const lang = (language as keyof typeof labels) in labels ? (language as keyof typeof labels) : 'en';
  const t = labels[lang];

  return (
    <div className="p-6 md:p-8 overflow-y-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Flame className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{t.welcome}</h2>
            <p className="text-slate-500">{t.tag}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onChangeOrg} className="gap-2 text-slate-600 border-slate-300">
          <ArrowLeftRight className="w-4 h-4" />
          {t.change}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto mb-5">
        {t.modules.map((mod) => (
          <Card
            key={mod.id}
            className="cursor-pointer border-2 border-slate-100 hover:border-orange-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group bg-white"
            onClick={() => onModuleSelect(mod.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center min-h-[180px] justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                <mod.icon className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors leading-tight mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
              {ttsEnabled && (
                <Button variant="ghost" size="sm" className="text-orange-600 border border-orange-100 hover:bg-orange-50 h-8 text-xs"
                  onClick={(e) => { e.stopPropagation(); speak(`${mod.title}. ${mod.desc}`); }}>
                  <Volume2 className="w-3 h-3 mr-1" /> Speak
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🏆 Suvidha Rewards Banner */}
      <div
        onClick={() => onModuleSelect('rewards')}
        className="max-w-6xl mx-auto cursor-pointer p-5 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white flex items-center gap-4 shadow-xl hover:scale-[1.01] transition-all"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-3xl">🏆</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-xl">
            {lang === 'en' ? 'Suvidha Rewards' : lang === 'hi' ? 'सुविधा रिवॉर्ड्स' : 'সুবিধা ৰিৱাৰ্ড'}
          </p>
          <p className="text-white/80 text-sm">
            {lang === 'en' ? 'Earn points for every action • Unlock badges • Redeem rewards'
            : lang === 'hi' ? 'हर कार्य पर अंक अर्जित करें • बैज अनलॉक करें • रिवॉर्ड्स भुनाएं'
            : 'প্ৰতিটো কাৰ্যৰ বাবে পইণ্ট অৰ্জন কৰক • বেজ আনলক কৰক • ৰিৱাৰ্ড ৰিডিম কৰক'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black">{citizen?.points || 0}</p>
          <p className="text-white/70 text-xs">pts</p>
        </div>
        <span className="text-white/80 text-2xl ml-2">→</span>
      </div>
    </div>
  );
};

export default GasModule;
