import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, User, Briefcase, Building } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface AppointmentModuleProps {
  onBack: () => void;
}

const AppointmentModule: React.FC<AppointmentModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const text = {
    en: {
      title: 'Book Appointment',
      subtitle: 'Schedule a visit to government offices',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      selectOffice: 'Select Office',
      purpose: 'Purpose of Visit',
      book: 'Book Appointment',
      success: 'Appointment Booked Successfully!',
      refId: 'Appointment ID',
      office1: 'Municipal Corporation HQ',
      office2: 'Zonal Office - Sector 18',
      office3: 'Water Dept. Office',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']
    },
    hi: {
      title: 'अपॉइंटमेंट बुक करें',
      subtitle: 'सरकारी कार्यालयों में जाने का समय निर्धारित करें',
      selectDate: 'तारीख चुनें',
      selectTime: 'समय चुनें',
      selectOffice: 'कार्यालय चुनें',
      purpose: 'यात्रा का उद्देश्य',
      book: 'अपॉइंटमेंट बुक करें',
      success: 'अपॉइंटमेंट सफलतापूर्वक बुक किया गया!',
      refId: 'अपॉइंटमेंट आईडी',
      office1: 'नगर निगम मुख्यालय',
      office2: 'क्षेत्रीय कार्यालय - सेक्टर 18',
      office3: 'जल विभाग कार्यालय',
      timeSlots: ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']
    }
  };

  const t = text[language];

  const offices = [
    { id: 'hq', name: t.office1, address: 'Civil Lines, Main Road' },
    { id: 'zone18', name: t.office2, address: 'Sector 18 Market Complex' },
    { id: 'water', name: t.office3, address: 'Near Water Tank, Phase 2' }
  ];

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !selectedOffice) {
      toast.error(language === 'en' ? 'Please fill all details' : 'कृपया सभी विवरण भरें');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setReferenceId(`APT-${Math.floor(Math.random() * 10000)}`);
      setIsSubmitted(true);
      
      // Award points
      if (citizen && updateCitizen) {
         updateCitizen({ points: (citizen.points || 0) + 50 });
         toast.success(`${t.success} (+50 Points)`);
      } else {
         toast.success(t.success);
      }
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 overflow-y-auto pb-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" /> {language === 'en' ? 'Back' : 'वापस'}
        </Button>
        
        <Card className="text-center py-12 border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800">{t.success}</h2>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
               <span className="text-xl">🏆</span> +50 Suvidha Points
            </div>
            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm w-full max-w-md mt-4">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">{t.refId}</p>
              <p className="text-3xl font-mono font-bold text-green-700 mb-6">{referenceId}</p>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">{t.selectDate}</span>
                  <span className="font-medium">{selectedDate ? format(selectedDate, 'PPP') : ''}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">{t.selectTime}</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">{t.selectOffice}</span>
                  <span className="font-medium">{offices.find(o => o.id === selectedOffice)?.name}</span>
                </div>
              </div>
            </div>
            <Button onClick={onBack} className="mt-6 bg-green-600 hover:bg-green-700 text-white">
              {language === 'en' ? 'Done' : 'हो गया'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Office & Date Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                {t.selectOffice}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {offices.map((office) => (
                <div
                  key={office.id}
                  onClick={() => setSelectedOffice(office.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOffice === office.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-100 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900">{office.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {office.address}
                      </p>
                    </div>
                    {selectedOffice === office.id && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t.selectDate}
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex justify-center border rounded-lg p-4 bg-white">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Time & Confirmation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t.selectTime}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {t.timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={`h-12 ${selectedTime === time ? 'bg-primary text-white' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 text-slate-700">{language === 'en' ? 'Summary' : 'सारांश'}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.selectOffice}:</span>
                  <span className="font-medium text-slate-900">
                    {offices.find(o => o.id === selectedOffice)?.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.selectDate}:</span>
                  <span className="font-medium text-slate-900">
                    {selectedDate ? format(selectedDate, 'PPP') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.selectTime}:</span>
                  <span className="font-medium text-slate-900">{selectedTime || '-'}</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90 text-white h-12 text-lg shadow-lg"
                disabled={!selectedDate || !selectedTime || !selectedOffice}
                onClick={handleSubmit}
              >
                {t.book}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModule;
