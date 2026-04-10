import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import {
  Droplets, MessageSquareWarning, FilePlus, Search,
  FileDown, UserCog, Volume2, ArrowLeftRight, Building2, Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  onModuleSelect: (module: string) => void;
  onChangeOrg: () => void;
}

const labels = {
  en: {
    welcome: 'Municipal Services',
    sub: 'Select a service to continue',
    change: 'Change Department',
    tag: 'Municipal Corporation / GMC',
    modules: [
      { id: 'newService', title: 'New Water Connection / Upgrade', desc: 'Apply for new water connection or upgrade existing', icon: FilePlus },
      { id: 'complaint', title: 'Register Grievance', desc: 'Water supply, sewage, streetlight, road damage & more', icon: MessageSquareWarning },
      { id: 'bills', title: 'Property Tax Payment', desc: 'Pay property tax and view dues', icon: Droplets },
      { id: 'track', title: 'Track Request / Complaint', desc: 'Track via Ticket ID, Application ID or Mobile', icon: Search },
      { id: 'documents', title: 'Receipt Generation', desc: 'Download receipts for payments & requests', icon: FileDown },
      { id: 'credentials', title: 'Update Consumer Profile', desc: 'Update contact details with OTP verification', icon: UserCog },
      { id: 'waste', title: 'Waste Management', desc: 'Schedule garbage pickup & pay fees', icon: Trash2 },
    ],
  },
  hi: {
    welcome: 'नगर पालिका सेवाएं',
    sub: 'जारी रखने के लिए एक सेवा चुनें',
    change: 'विभाग बदलें',
    tag: 'नगर निगम / GMC',
    modules: [
      { id: 'newService', title: 'नया पानी कनेक्शन / अपग्रेड', desc: 'नए पानी कनेक्शन या अपग्रेड के लिए आवेदन', icon: FilePlus },
      { id: 'complaint', title: 'शिकायत दर्ज करें', desc: 'पानी आपूर्ति, सीवेज, स्ट्रीटलाइट, सड़क क्षति', icon: MessageSquareWarning },
      { id: 'bills', title: 'संपत्ति कर भुगतान', desc: 'संपत्ति कर का भुगतान करें और बकाया देखें', icon: Droplets },
      { id: 'track', title: 'अनुरोध / शिकायत ट्रैक करें', desc: 'टिकट आईडी, आवेदन आईडी या मोबाइल से ट्रैक', icon: Search },
      { id: 'documents', title: 'रसीद जनरेशन', desc: 'भुगतान और अनुरोधों की रसीदें डाउनलोड करें', icon: FileDown },
      { id: 'credentials', title: 'उपभोक्ता प्रोफ़ाइल अपडेट', desc: 'OTP सत्यापन के साथ संपर्क विवरण अपडेट', icon: UserCog },
      { id: 'waste', title: 'अपशिष्ट प्रबंधन', desc: 'कचरा पिकअप शेड्यूल करें और शुल्क भुगतान', icon: Trash2 },
    ],
  },
  as: {
    welcome: 'পৌৰসভা সেৱাসমূহ',
    sub: 'অব্যাহত ৰাখিবলৈ এটা সেৱা বাছক',
    change: 'বিভাগ সলনি কৰক',
    tag: 'পৌৰ নিগম / GMC',
    modules: [
      { id: 'newService', title: 'নতুন পানী সংযোগ / আপগ্ৰেড', desc: 'নতুন পানী সংযোগ বা আপগ্ৰেডৰ বাবে আবেদন', icon: FilePlus },
      { id: 'complaint', title: 'অভিযোগ দাখিল কৰক', desc: 'পানী যোগান, নৰ্দমা, ষ্ট্ৰিটলাইট, পথ ক্ষতি', icon: MessageSquareWarning },
      { id: 'bills', title: 'সম্পত্তি কৰ পৰিশোধ', desc: 'সম্পত্তি কৰ পৰিশোধ কৰক আৰু বকেয়া চাওক', icon: Droplets },
      { id: 'track', title: 'অনুৰোধ / অভিযোগ ট্ৰেক কৰক', desc: 'টিকট আইডি, আবেদন আইডি বা মোবাইলেৰে ট্ৰেক', icon: Search },
      { id: 'documents', title: 'ৰচিদ তৈয়াৰ', desc: 'পৰিশোধ আৰু অনুৰোধৰ ৰচিদ ডাউনলোড কৰক', icon: FileDown },
      { id: 'credentials', title: 'গ্ৰাহক প্ৰফাইল আপডেট', desc: 'OTP যাচাইৰ সৈতে যোগাযোগৰ বিৱৰণ আপডেট', icon: UserCog },
      { id: 'waste', title: 'আৱৰ্জনা ব্যৱস্থাপনা', desc: 'আৱৰ্জনা পিকআপ নিৰ্ধাৰণ কৰক আৰু মাচুল পৰিশোধ', icon: Trash2 },
    ],
  },
};

const MunicipalModule: React.FC<Props> = ({ onModuleSelect, onChangeOrg }) => {
  const { language } = useAuth();
  const { speak, ttsEnabled } = useKiosk();
  const lang = (language as keyof typeof labels) in labels ? (language as keyof typeof labels) : 'en';
  const t = labels[lang];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
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

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {t.modules.map((mod) => (
          <Card
            key={mod.id}
            className="cursor-pointer border-2 border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group bg-white"
            onClick={() => onModuleSelect(mod.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center min-h-[180px] justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <mod.icon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
              </div>
              {ttsEnabled && (
                <Button variant="ghost" size="sm" className="text-blue-600 border border-blue-100 hover:bg-blue-50 h-8 text-xs"
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

export default MunicipalModule;
