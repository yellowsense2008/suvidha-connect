import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Phone, Flame, Ambulance, Shield, MapPin, 
  AlertTriangle, CheckCircle, X
} from 'lucide-react';
import { toast } from 'sonner';

interface EmergencySOSProps {
  onClose: () => void;
}

const EmergencySOS: React.FC<EmergencySOSProps> = ({ onClose }) => {
  const { language, citizen } = useAuth();
  const [calling, setCalling] = useState<string | null>(null);
  const [locationShared, setLocationShared] = useState(false);

  const t = {
    en: {
      title: 'Emergency SOS',
      subtitle: 'Immediate assistance for emergencies',
      fire: 'Fire Brigade',
      ambulance: 'Ambulance',
      police: 'Police',
      calling: 'Calling...',
      shareLocation: 'Share My Location',
      locationShared: 'Location Shared',
      warning: 'For genuine emergencies only. Misuse is punishable.',
      fireNumber: '101',
      ambulanceNumber: '102',
      policeNumber: '100',
      close: 'Close'
    },
    hi: {
      title: 'आपातकालीन SOS',
      subtitle: 'आपात स्थिति के लिए तत्काल सहायता',
      fire: 'अग्निशमन विभाग',
      ambulance: 'एम्बुलेंस',
      police: 'पुलिस',
      calling: 'कॉल हो रही है...',
      shareLocation: 'मेरा स्थान साझा करें',
      locationShared: 'स्थान साझा किया गया',
      warning: 'केवल वास्तविक आपात स्थिति के लिए। दुरुपयोग दंडनीय है।',
      fireNumber: '101',
      ambulanceNumber: '102',
      policeNumber: '100',
      close: 'बंद करें'
    }
  };

  const text = t[language];

  const emergencyServices = [
    { 
      id: 'fire', 
      icon: Flame, 
      label: text.fire, 
      number: text.fireNumber,
      color: 'bg-red-500 hover:bg-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    { 
      id: 'ambulance', 
      icon: Ambulance, 
      label: text.ambulance, 
      number: text.ambulanceNumber,
      color: 'bg-blue-500 hover:bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      id: 'police', 
      icon: Shield, 
      label: text.police, 
      number: text.policeNumber,
      color: 'bg-slate-700 hover:bg-slate-800',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700'
    }
  ];

  const handleEmergencyCall = (service: string, number: string) => {
    setCalling(service);
    
    // Log emergency call in system
    const logData = {
      citizenId: citizen?.id,
      service,
      timestamp: new Date().toISOString(),
      location: locationShared ? 'GPS shared' : 'Not shared'
    };
    
    console.log('[SUVIDHA] Emergency call initiated');
    
    // Simulate call initiation
    setTimeout(() => {
      toast.success(`${language === 'en' ? 'Calling' : 'कॉल हो रही है'} ${number}...`);
      setCalling(null);
      
      // In real implementation, this would:
      // 1. Call the emergency number via WebRTC/SIP
      // 2. Send SMS with citizen details to control room
      // 3. Create high-priority ticket in admin dashboard
      // 4. Alert nearby kiosks
    }, 2000);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationShared(true);
        toast.success(`${language === 'en' ? 'Location shared' : 'स्थान साझा किया गया'}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        
        // In real implementation, send to emergency services
        console.log('[SUVIDHA] Emergency location shared');
      },
      () => {
        toast.error(language === 'en' ? 'Could not detect location' : 'स्थान पता नहीं चला');
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl border-red-200 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" />
                {text.title}
              </h2>
              <p className="text-slate-600">{text.subtitle}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-100">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-red-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {text.warning}
            </p>
          </div>

          {/* Emergency Services */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {emergencyServices.map((service) => (
              <div key={service.id} className="space-y-3">
                <div className={`${service.bgColor} p-6 rounded-xl border-2 border-slate-200 text-center`}>
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className={`font-bold text-lg ${service.textColor} mb-1`}>{service.label}</p>
                  <p className="text-2xl font-mono font-bold text-slate-900">{service.number}</p>
                </div>
                <Button
                  className={`w-full h-14 ${service.color} text-white shadow-lg hover:shadow-xl transition-all`}
                  onClick={() => handleEmergencyCall(service.id, service.number)}
                  disabled={calling !== null}
                >
                  {calling === service.id ? (
                    <span className="flex items-center gap-2">
                      <Phone className="w-5 h-5 animate-pulse" />
                      {text.calling}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Call Now
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Share Location */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{text.shareLocation}</p>
                  <p className="text-xs text-slate-600">Help emergency services locate you faster</p>
                </div>
              </div>
              {!locationShared ? (
                <Button 
                  variant="outline" 
                  onClick={handleShareLocation}
                  className="border-blue-300 hover:bg-blue-100 text-blue-700"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Share
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  {text.locationShared}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencySOS;
