import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, AlertTriangle, Info, CloudRain, 
  Wrench, Bell, Calendar, MapPin, Phone, Shield, Flame
} from 'lucide-react';
import { civicAlerts } from '@/lib/mockData';

interface AlertsModuleProps {
  onBack: () => void;
}

const AlertsModule: React.FC<AlertsModuleProps> = ({ onBack }) => {
  const { language } = useAuth();

  const t = {
    en: {
      title: 'Civic Alerts & Notifications',
      subtitle: 'Stay informed about service updates and emergencies',
      activeAlerts: 'Active Alerts',
      noAlerts: 'No active alerts at this time',
      zones: 'Affected Zones',
      validUntil: 'Valid Until',
      backToHome: 'Back to Home'
    },
    hi: {
      title: 'नागरिक अलर्ट और सूचनाएं',
      subtitle: 'सेवा अपडेट और आपात स्थिति के बारे में सूचित रहें',
      activeAlerts: 'सक्रिय अलर्ट',
      noAlerts: 'इस समय कोई सक्रिय अलर्ट नहीं',
      zones: 'प्रभावित क्षेत्र',
      validUntil: 'तक मान्य',
      backToHome: 'होम पर वापस जाएं'
    }
  };

  const text = t[language];

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return AlertTriangle;
      case 'weather':
        return CloudRain;
      case 'maintenance':
        return Wrench;
      default:
        return Info;
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600 bg-red-100',
          badge: 'bg-red-600 text-white'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600 bg-orange-100',
          badge: 'bg-orange-600 text-white'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600 bg-blue-100',
          badge: 'bg-blue-600 text-white'
        };
    }
  };

  const activeAlerts = civicAlerts.filter(
    alert => new Date(alert.expiresAt) > new Date()
  );

  return (
    <div className="p-6 md:p-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{text.title}</h2>
          <p className="text-muted-foreground">{text.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Bell className="w-5 h-5 text-blue-600" />
              {text.activeAlerts}
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                {activeAlerts.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{text.noAlerts}</p>
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const Icon = getIcon(alert.type);
                const classes = getSeverityClasses(alert.severity);
                
                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-xl border-2 ${classes.bg} ${classes.border}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${classes.icon} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">
                            {language === 'en' ? alert.title : alert.titleHindi}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full uppercase font-semibold ${classes.badge}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {language === 'en' ? alert.message : alert.messageHindi}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{text.zones}: {alert.zones.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{text.validUntil}: {new Date(alert.expiresAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts Grid - GovTech Blue Theme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-white border-red-200 shadow-sm hover:shadow-md transition-all hover:border-red-400 group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Police Control</p>
                <p className="text-2xl font-bold text-red-900">100</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-orange-200 shadow-sm hover:shadow-md transition-all hover:border-orange-400 group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Fire Brigade</p>
                <p className="text-2xl font-bold text-orange-900">101</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-200 shadow-sm hover:shadow-md transition-all hover:border-blue-400 group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Ambulance</p>
                <p className="text-2xl font-bold text-blue-900">102</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl text-white flex justify-between items-center shadow-lg">
           <div>
             <h3 className="text-xl font-bold mb-1">Witnessed an incident?</h3>
             <p className="text-blue-100">Help your community by reporting issues instantly.</p>
           </div>
           <Button className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-lg border border-blue-100" onClick={onBack}>
             Report Now
           </Button>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={onBack}>
            {text.backToHome}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsModule;
