import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import {
  CreditCard, MessageSquareWarning, FilePlus, Search,
  FileDown, Wrench, UserCog, Volume2, ArrowLeftRight, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  onModuleSelect: (module: string) => void;
  onChangeOrg: () => void;
}

const labels = {
  en: {
    welcome: 'Electricity Services',
    sub: 'Select a service to continue',
    change: 'Change Department',
    modules: [
      { id: 'bills', title: 'Pay Bill', desc: 'View & pay electricity bills', icon: CreditCard },
      { id: 'newService', title: 'New Connection / Load Extension', desc: 'Apply for new connection or load increase', icon: FilePlus },
      { id: 'meter', title: 'Meter Replacement / Shifting', desc: 'Report malfunction or request shifting', icon: Wrench },
      { id: 'complaint', title: 'Register Complaint', desc: 'Incorrect bill, outage, disconnection & more', icon: MessageSquareWarning },
      { id: 'credentials', title: 'Update Consumer Info', desc: 'Update contact details & ownership', icon: UserCog },
      { id: 'track', title: 'Track Request', desc: 'Check status of complaints & applications', icon: Search },
      { id: 'documents', title: 'Receipts & Documents', desc: 'Download receipts & certificates', icon: FileDown },
    ],
  },
  hi: {
    welcome: 'बिजली सेवाएं',
    sub: 'जारी रखने के लिए एक सेवा चुनें',
    change: 'विभाग बदलें',
    modules: [
      { id: 'bills', title: 'बिल भुगतान', desc: 'बिजली बिल देखें और भुगतान करें', icon: CreditCard },
      { id: 'newService', title: 'नया कनेक्शन / लोड विस्तार', desc: 'नए कनेक्शन या लोड वृद्धि के लिए आवेदन', icon: FilePlus },
      { id: 'meter', title: 'मीटर बदलाव / स्थानांतरण', desc: 'खराबी रिपोर्ट करें या स्थानांतरण अनुरोध', icon: Wrench },
      { id: 'complaint', title: 'शिकायत दर्ज करें', desc: 'गलत बिल, बिजली गुल, कटौती और अधिक', icon: MessageSquareWarning },
      { id: 'credentials', title: 'उपभोक्ता जानकारी अपडेट', desc: 'संपर्क विवरण और स्वामित्व अपडेट करें', icon: UserCog },
      { id: 'track', title: 'अनुरोध ट्रैक करें', desc: 'शिकायतों और आवेदनों की स्थिति जांचें', icon: Search },
      { id: 'documents', title: 'रसीदें और दस्तावेज़', desc: 'रसीदें और प्रमाण पत्र डाउनलोड करें', icon: FileDown },
    ],
  },
  as: {
    welcome: 'বিদ্যুৎ সেৱাসমূহ',
    sub: 'অব্যাহত ৰাখিবলৈ এটা সেৱা বাছক',
    change: 'বিভাগ সলনি কৰক',
    modules: [
      { id: 'bills', title: 'বিল পৰিশোধ', desc: 'বিদ্যুৎ বিল চাওক আৰু পৰিশোধ কৰক', icon: CreditCard },
      { id: 'newService', title: 'নতুন সংযোগ / লোড বিস্তাৰ', desc: 'নতুন সংযোগ বা লোড বৃদ্ধিৰ বাবে আবেদন', icon: FilePlus },
      { id: 'meter', title: 'মিটাৰ সলনি / স্থানান্তৰ', desc: 'বিজুতি ৰিপোৰ্ট কৰক বা স্থানান্তৰ অনুৰোধ', icon: Wrench },
      { id: 'complaint', title: 'অভিযোগ দাখিল কৰক', desc: 'ভুল বিল, বিদ্যুৎ বিভ্ৰাট আৰু অধিক', icon: MessageSquareWarning },
      { id: 'credentials', title: 'গ্ৰাহক তথ্য আপডেট', desc: 'যোগাযোগৰ বিৱৰণ আৰু মালিকানা আপডেট', icon: UserCog },
      { id: 'track', title: 'অনুৰোধ ট্ৰেক কৰক', desc: 'অভিযোগ আৰু আবেদনৰ স্থিতি পৰীক্ষা', icon: Search },
      { id: 'documents', title: 'ৰচিদ আৰু দস্তাবেজ', desc: 'ৰচিদ আৰু প্ৰমাণপত্ৰ ডাউনলোড কৰক', icon: FileDown },
    ],
  },
};

const ElectricityModule: React.FC<Props> = ({ onModuleSelect, onChangeOrg }) => {
  const { language, citizen } = useAuth();
  const { speak, ttsEnabled } = useKiosk();
  const lang = (language as keyof typeof labels) in labels ? (language as keyof typeof labels) : 'en';
  const t = labels[lang];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900">{t.welcome}</h2>
            <p className="text-slate-500">{t.sub}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onChangeOrg} className="gap-2 text-slate-600 border-slate-300">
          <ArrowLeftRight className="w-4 h-4" />
          {t.change}
        </Button>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {t.modules.map((mod) => (
          <Card
            key={mod.id}
            className="cursor-pointer border-2 border-slate-100 hover:border-yellow-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group bg-white"
            onClick={() => onModuleSelect(mod.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center min-h-[180px] justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-50 group-hover:bg-yellow-100 flex items-center justify-center transition-colors">
                <mod.icon className="w-7 h-7 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-yellow-700 transition-colors leading-tight mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
              {ttsEnabled && (
                <Button variant="ghost" size="sm" className="text-yellow-600 border border-yellow-100 hover:bg-yellow-50 h-8 text-xs"
                  onClick={(e) => { e.stopPropagation(); speak(`${mod.title}. ${mod.desc}`); }}>
                  <Volume2 className="w-3 h-3 mr-1" /> Speak
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ElectricityModule;
