
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useKiosk } from '@/context/KioskContext';
import {
  Users, Scale, Trophy, Mic,
  CreditCard, MessageSquareWarning, FilePlus, Search, FileDown,
  Bell, Zap, Flame, Droplets, Trash2, Volume2, Calendar,
  LayoutDashboard, MapPin, UserCheck
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
    <div className="p-8">
      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {t('welcome_title')}
        </h2>
        <p className="text-lg text-muted-foreground">
          {t('welcome_subtitle')}
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 border shadow-xl ${getColorClasses(module.color)}`}
            onClick={() => onModuleSelect(module.id)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full justify-center min-h-[220px] relative overflow-hidden group">
              {/* Background Pattern */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all duration-500 opacity-20 ${
                module.color === 'primary' ? 'bg-blue-500' : 
                module.color === 'secondary' ? 'bg-orange-500' : 
                module.color === 'accent' ? 'bg-green-500' : 'bg-slate-500'
              }`} />
              
              <div className="mb-5 relative z-10">
                <div className={`p-4 rounded-2xl shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-md ${getIconColor(module.color)}`}>
                  <module.icon className="w-12 h-12" />
                </div>
                {module.subIcons && (
                  <div className="flex gap-1 absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-0.5 border border-slate-200 shadow-sm">
                    {module.subIcons.map((SubIcon, index) => (
                      <SubIcon key={index} className={`w-3.5 h-3.5 ${
                        module.color === 'primary' ? 'text-blue-500' : 
                        module.color === 'secondary' ? 'text-orange-500' : 'text-green-500'
                      }`} />
                    ))}
                  </div>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-2 z-10 tracking-tight transition-colors ${
                module.color === 'primary' ? 'text-slate-900 group-hover:text-blue-700' : 
                module.color === 'secondary' ? 'text-slate-900 group-hover:text-orange-700' : 
                'text-slate-900 group-hover:text-green-700'
              }`}>{module.title}</h3>
              <p className="text-sm text-slate-600 z-10 leading-relaxed max-w-[90%]">{module.description}</p>
              
              {ttsEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 hover:bg-blue-50 text-blue-600 border border-blue-100 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(`${module.title}. ${module.description}`);
                  }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {t('Speak')}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceModules;
