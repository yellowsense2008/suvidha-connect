import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Navigation, Clock, Wifi, WifiOff,
  CheckCircle, AlertCircle, Loader2, Phone
} from 'lucide-react';
import { toast } from 'sonner';

interface NearbyKioskFinderProps {
  onBack: () => void;
}

interface Kiosk {
  id: string;
  name: string;
  address: string;
  distance: string;
  walkTime: string;
  status: 'online' | 'offline' | 'busy';
  services: string[];
  hours: string;
  phone: string;
  lat: number;
  lng: number;
}

const MOCK_KIOSKS: Kiosk[] = [
  {
    id: 'K001', name: 'SUVIDHA Kiosk – Sector 5 Market',
    address: 'Near Post Office, Sector 5, Main Market',
    distance: '0.3 km', walkTime: '4 min', status: 'online',
    services: ['Bills', 'Complaints', 'Documents'],
    hours: '8 AM – 8 PM', phone: '011-2345-6001',
    lat: 28.6139, lng: 77.2090
  },
  {
    id: 'K002', name: 'SUVIDHA Kiosk – Community Centre',
    address: 'Block B Community Hall, Sector 7',
    distance: '0.8 km', walkTime: '10 min', status: 'online',
    services: ['Bills', 'New Connections', 'Appointments'],
    hours: '9 AM – 6 PM', phone: '011-2345-6002',
    lat: 28.6150, lng: 77.2100
  },
  {
    id: 'K003', name: 'SUVIDHA Kiosk – Railway Station',
    address: 'Platform 1 Entrance, Central Station',
    distance: '1.2 km', walkTime: '15 min', status: 'busy',
    services: ['Bills', 'Complaints', 'Rewards'],
    hours: '6 AM – 10 PM', phone: '011-2345-6003',
    lat: 28.6160, lng: 77.2080
  },
  {
    id: 'K004', name: 'SUVIDHA Kiosk – Municipal Office',
    address: 'Ground Floor, Municipal Corporation Building',
    distance: '1.8 km', walkTime: '22 min', status: 'offline',
    services: ['All Services'],
    hours: '10 AM – 5 PM', phone: '011-2345-6004',
    lat: 28.6120, lng: 77.2110
  },
];

const NearbyKioskFinder: React.FC<NearbyKioskFinderProps> = ({ onBack }) => {
  const { language } = useAuth();
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [selected, setSelected] = useState<Kiosk | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);

  const t = {
    en: {
      title: 'Nearby SUVIDHA Kiosks',
      subtitle: 'Find the nearest kiosk for your services',
      detectLocation: 'Detect My Location',
      detecting: 'Detecting...',
      online: 'Online', offline: 'Offline', busy: 'Busy',
      walk: 'walk', away: 'away',
      services: 'Services', hours: 'Hours', phone: 'Phone',
      getDirections: 'Get Directions',
      noLocation: 'Enable location to find nearest kiosks',
      allKiosks: 'All Kiosks Nearby',
      selected: 'Selected Kiosk',
      smsDirections: 'Send Directions to Phone'
    },
    hi: {
      title: 'नजदीकी SUVIDHA कियोस्क',
      subtitle: 'अपनी सेवाओं के लिए निकटतम कियोस्क खोजें',
      detectLocation: 'मेरा स्थान पता करें',
      detecting: 'पता लगाया जा रहा है...',
      online: 'ऑनलाइन', offline: 'ऑफलाइन', busy: 'व्यस्त',
      walk: 'पैदल', away: 'दूर',
      services: 'सेवाएं', hours: 'समय', phone: 'फोन',
      getDirections: 'दिशा-निर्देश पाएं',
      noLocation: 'निकटतम कियोस्क खोजने के लिए स्थान सक्षम करें',
      allKiosks: 'सभी नजदीकी कियोस्क',
      selected: 'चयनित कियोस्क',
      smsDirections: 'फोन पर दिशा-निर्देश भेजें'
    }
  };

  const text = t[language];

  const handleDetectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocated(true);
        setLocating(false);
        // Sort kiosks by distance (mock — already sorted)
        setKiosks(MOCK_KIOSKS);
        toast.success(language === 'en' ? 'Location detected! Showing nearby kiosks.' : 'स्थान मिला! नजदीकी कियोस्क दिखाए जा रहे हैं।');
      },
      () => {
        setLocating(false);
        // Show kiosks anyway with mock data
        setKiosks(MOCK_KIOSKS);
        setLocated(true);
        toast.info(language === 'en' ? 'Showing kiosks based on your area.' : 'आपके क्षेत्र के आधार पर कियोस्क दिखाए जा रहे हैं।');
      },
      { timeout: 5000 }
    );
  };

  const handleGetDirections = (kiosk: Kiosk) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${kiosk.lat},${kiosk.lng}&travelmode=walking`;
    window.open(url, '_blank');
    toast.success(language === 'en' ? 'Opening directions in Maps' : 'मानचित्र में दिशा-निर्देश खुल रहे हैं');
  };

  const statusConfig = {
    online: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: text.online },
    offline: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', label: text.offline },
    busy: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', label: text.busy },
  };

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{text.title}</h2>
          <p className="text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Detect Location */}
      {!located && (
        <Card className="border-blue-200 bg-blue-50 mb-6 shadow-sm">
          <CardContent className="p-8 text-center">
            <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-6">{text.noLocation}</p>
            <Button
              onClick={handleDetectLocation}
              disabled={locating}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              {locating ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />{text.detecting}</>
              ) : (
                <><Navigation className="w-5 h-5 mr-2" />{text.detectLocation}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Kiosk List */}
      {kiosks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {text.allKiosks}
          </h3>
          {kiosks.map((kiosk, idx) => {
            const status = statusConfig[kiosk.status];
            const isSelected = selected?.id === kiosk.id;
            return (
              <Card
                key={kiosk.id}
                className={`cursor-pointer transition-all border-2 shadow-sm hover:shadow-md ${
                  isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'
                }`}
                onClick={() => setSelected(isSelected ? null : kiosk)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Rank badge */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                        idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-slate-900">{kiosk.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{kiosk.address}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            {kiosk.distance} {text.away}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-green-500" />
                            {kiosk.walkTime} {text.walk}
                          </span>
                        </div>
                      </div>
                    </div>
                    {kiosk.status === 'online' && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                        onClick={(e) => { e.stopPropagation(); handleGetDirections(kiosk); }}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        {text.getDirections}
                      </Button>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{text.services}</p>
                        <div className="flex flex-wrap gap-1">
                          {kiosk.services.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{text.hours}</p>
                        <p className="text-sm font-medium text-slate-700">{kiosk.hours}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{text.phone}</p>
                        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          {kiosk.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NearbyKioskFinder;
