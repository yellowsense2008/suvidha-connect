
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useKiosk } from '@/context/KioskContext';
import {
  Users, Scale, Trophy, Mic,
  CreditCard, MessageSquareWarning, FilePlus, Search, FileDown,
  Bell, Zap, Flame, Droplets, Trash2, Volume2, Calendar,
  LayoutDashboard, MapPin, UserCheck, Brain, Clock, Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceModulesProps {
  onModuleSelect: (module: string) => void;
}

const ServiceModules: React.FC<ServiceModulesProps> = ({ onModuleSelect }) => {
  const { t, i18n } = useTranslation();
  const { speak, ttsEnabled } = useKiosk();

  const modules = [
    {
      id: 'bills',
      icon: CreditCard,
      title: t('services.bills.title'),
      description: t('services.bills.description'),
      color: 'primary',
      subIcons: [Zap, Flame, Droplets]
    },
    {
      id: 'complaint',
      icon: MessageSquareWarning,
      title: t('services.complaint.title'),
      description: t('services.complaint.description'),
      color: 'secondary'
    },
    {
      id: 'alerts',
      icon: Bell,
      title: i18n.language === 'en' ? 'Civic Alerts' : 'नागरिक अलर्ट',
      description: i18n.language === 'en' ? 'Emergency updates & notices' : 'आपातकालीन अपडेट और नोटिस',
      color: 'secondary'
    },
    {
      id: 'appointment',
      icon: Calendar,
      title: i18n.language === 'en' ? 'Book Appointment' : 'अपॉइंटमेंट बुक करें',
      description: i18n.language === 'en' ? 'Schedule visits to government offices' : 'सरकारी कार्यालयों के लिए समय निर्धारित करें',
      color: 'accent'
    },
    {
      id: 'rewards',
      icon: Trophy,
      title: i18n.language === 'en' ? 'Suvidha Rewards' : 'सुविधा रिवॉर्ड्स',
      description: i18n.language === 'en' ? 'Earn points & redeem rewards' : 'अंक अर्जित करें और रिवॉर्ड्स पाएं',
      color: 'secondary'
    },
    {
      id: 'newService',
      icon: FilePlus,
      title: t('services.newService.title'),
      description: t('services.newService.description'),
      color: 'primary'
    },
    {
      id: 'track',
      icon: Search,
      title: t('services.track.title'),
      description: t('services.track.description'),
      color: 'primary'
    },
    {
      id: 'documents',
      icon: FileDown,
      title: t('services.documents.title'),
      description: t('services.documents.description'),
      color: 'secondary'
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      title: i18n.language === 'en' ? 'My Dashboard' : 'मेरा डैशबोर्ड',
      description: i18n.language === 'en' ? 'Usage insights, carbon footprint & bill predictions' : 'उपयोग जानकारी, कार्बन फुटप्रिंट और बिल अनुमान',
      color: 'accent'
    },
    {
      id: 'nearbyKiosk',
      icon: MapPin,
      title: i18n.language === 'en' ? 'Nearby Kiosks' : 'नजदीकी कियोस्क',
      description: i18n.language === 'en' ? 'Find nearest SUVIDHA kiosk with directions' : 'दिशा-निर्देश के साथ निकटतम कियोस्क खोजें',
      color: 'primary'
    },
    {
      id: 'waste',
      icon: Trash2,
      title: t('services.waste.title'),
      description: t('services.waste.description'),
      color: 'primary'
    },
    {
      id: 'outageMap',
      icon: MapPin,
      title: i18n.language === 'en' ? 'Live Outage Map' : 'लाइव आउटेज मैप',
      description: i18n.language === 'en' ? 'Real-time crowd-sourced utility disruptions' : 'रियल-टाइम उपयोगिता व्यवधान',
      color: 'secondary'
    },
    {
      id: 'familyBills',
      icon: Users,
      title: i18n.language === 'en' ? 'Family Bill Manager' : 'पारिवारिक बिल प्रबंधक',
      description: i18n.language === 'en' ? 'Pay bills for all family members at once' : 'एक बार में सभी के बिल भरें',
      color: 'accent'
    },
    {
      id: 'disputeAnalyzer',
      icon: Scale,
      title: i18n.language === 'en' ? 'Bill Dispute Analyzer' : 'बिल विवाद विश्लेषक',
      description: i18n.language === 'en' ? 'AI-powered bill anomaly detection & dispute filing' : 'एआई बिल विसंगति विश्लेषण',
      color: 'primary'
    },
    {
      id: 'leaderboard',
      icon: Trophy,
      title: i18n.language === 'en' ? 'Civic Leaderboard' : 'नागरिक लीडरबोर्ड',
      description: i18n.language === 'en' ? 'Earn points & rank among civic champions' : 'अंक अर्जित करें और शीर्ष नागरिक बनें',
      color: 'secondary'
    },
    {
      id: 'voiceAssistant',
      icon: Mic,
      title: i18n.language === 'en' ? 'Voice Assistant' : 'वॉयस असिस्टेंट',
      description: i18n.language === 'en' ? 'Navigate by voice in Hindi & English' : 'हिंदी और अंग्रेजी में आवाज से नेविगेट करें',
      color: 'accent'
    },
    {
      id: 'predictiveMaintenance',
      icon: Brain,
      title: i18n.language === 'en' ? 'Predictive Maintenance' : 'पूर्वानुमान रखरखाव',
      description: i18n.language === 'en' ? 'AI predicts failures before they happen' : 'AI विफलताओं की भविष्यवाणी करता है',
      color: 'primary'
    },
    {
      id: 'waterQuality',
      icon: Droplets,
      title: i18n.language === 'en' ? 'Water Quality Report' : 'जल गुणवत्ता रिपोर्ट',
      description: i18n.language === 'en' ? 'Report water quality with TDS visual scale' : 'TDS स्केल से जल गुणवत्ता रिपोर्ट करें',
      color: 'primary'
    },
    {
      id: 'escalationTimer',
      icon: Clock,
      title: i18n.language === 'en' ? 'Escalation Tracker' : 'एस्केलेशन ट्रैकर',
      description: i18n.language === 'en' ? 'Live SLA countdown & auto-escalation' : 'लाइव SLA काउंटडाउन और स्वचालित एस्केलेशन',
      color: 'secondary'
    },
    {
      id: 'civicHealth',
      icon: Activity,
      title: i18n.language === 'en' ? 'Civic Health Score' : 'नागरिक स्वास्थ्य स्कोर',
      description: i18n.language === 'en' ? 'Sector-wise city performance dashboard' : 'क्षेत्रवार शहर प्रदर्शन डैशबोर्ड',
      color: 'accent'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-gradient-to-br from-white to-blue-50 text-slate-800 shadow-sm hover:shadow-xl border-l-4 border-l-blue-500 border-y border-r border-slate-100 hover:border-blue-400 transition-all group';
      case 'secondary':
        return 'bg-gradient-to-br from-white to-orange-50 text-slate-800 shadow-sm hover:shadow-xl border-l-4 border-l-orange-500 border-y border-r border-slate-100 hover:border-orange-400 transition-all group';
      case 'accent':
        return 'bg-gradient-to-br from-white to-green-50 text-slate-800 shadow-sm hover:shadow-xl border-l-4 border-l-green-500 border-y border-r border-slate-100 hover:border-green-400 transition-all group';
      default:
        return 'bg-gradient-to-br from-white to-slate-50 text-slate-800 shadow-sm hover:shadow-xl border-l-4 border-l-slate-500 border-y border-r border-slate-100 hover:border-slate-400 transition-all group';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'primary': return 'text-blue-600 group-hover:text-blue-700 bg-blue-50 group-hover:bg-blue-100';
      case 'secondary': return 'text-orange-600 group-hover:text-orange-700 bg-orange-50 group-hover:bg-orange-100';
      case 'accent': return 'text-green-600 group-hover:text-green-700 bg-green-50 group-hover:bg-green-100';
      default: return 'text-slate-600 group-hover:text-slate-700 bg-slate-50 group-hover:bg-slate-100';
    }
  };

  return (
    <div className="p-6 md:p-8 overflow-y-auto pb-10">
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          {t('welcome_title')}
        </h2>
        <p className="text-base text-muted-foreground">
          {t('welcome_subtitle')}
        </p>
      </div>

      {/* ── TOP 6 PRIMARY SERVICES ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-4">
        {modules.slice(0, 6).map((module) => (
          <Card
            key={module.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border shadow-xl ${getColorClasses(module.color)}`}
            onClick={() => onModuleSelect(module.id)}
          >
            <CardContent className="p-4 md:p-5 flex flex-col items-center text-center h-full justify-center min-h-[150px] md:min-h-[180px] relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 ${
                module.color === 'primary' ? 'bg-blue-500' : module.color === 'secondary' ? 'bg-orange-500' : 'bg-green-500'
              }`} />
              <div className="mb-3 relative z-10">
                <div className={`p-3 rounded-2xl shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300 ${getIconColor(module.color)}`}>
                  <module.icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                {'subIcons' in module && module.subIcons && (
                  <div className="flex gap-1 absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-0.5 border border-slate-200 shadow-sm">
                    {(module.subIcons as React.ElementType[]).map((SubIcon, index) => (
                      <SubIcon key={index} className={`w-3 h-3 ${
                        module.color === 'primary' ? 'text-blue-500' : module.color === 'secondary' ? 'text-orange-500' : 'text-green-500'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              <h3 className={`text-base md:text-lg font-bold mb-1 z-10 tracking-tight ${
                module.color === 'primary' ? 'text-slate-900 group-hover:text-blue-700' :
                module.color === 'secondary' ? 'text-slate-900 group-hover:text-orange-700' :
                'text-slate-900 group-hover:text-green-700'
              }`}>{module.title}</h3>
              <p className="text-xs text-slate-500 z-10 leading-relaxed">{module.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 🏆 SUVIDHA REWARDS — FEATURED BANNER ── */}
      <div
        onClick={() => onModuleSelect('rewards')}
        className="max-w-5xl mx-auto mb-4 cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white flex items-center gap-4 shadow-xl hover:scale-[1.01] transition-all"
      >
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg">
            {i18n.language === 'en' ? '🏆 Suvidha Rewards' : i18n.language === 'hi' ? '🏆 सुविधा रिवॉर्ड्स' : '🏆 সুবিধা ৰিৱাৰ্ড'}
          </p>
          <p className="text-white/80 text-sm">
            {i18n.language === 'en' ? 'Earn points, unlock badges, redeem rewards — you have points waiting!' :
             i18n.language === 'hi' ? 'अंक अर्जित करें, बैज अनलॉक करें, रिवॉर्ड्स भुनाएं' :
             'পইণ্ট অৰ্জন কৰক, বেজ আনলক কৰক, ৰিৱাৰ্ড ৰিডিম কৰক'}
          </p>
        </div>
        <span className="text-white/80 text-2xl">→</span>
      </div>

      {/* ── MORE SERVICES ── */}
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">
          {i18n.language === 'en' ? 'More Services' : i18n.language === 'hi' ? 'अधिक सेवाएं' : 'অধিক সেৱা'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.slice(6).map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-105 hover:shadow-md ${
                module.color === 'primary' ? 'border-blue-100 bg-blue-50 hover:border-blue-300' :
                module.color === 'secondary' ? 'border-orange-100 bg-orange-50 hover:border-orange-300' :
                'border-green-100 bg-green-50 hover:border-green-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                module.color === 'primary' ? 'bg-blue-100 text-blue-600' :
                module.color === 'secondary' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600'
              }`}>
                <module.icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{module.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{module.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceModules;
