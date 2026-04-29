import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, ArrowLeft, Calendar, CreditCard, 
  CheckCircle, Loader2, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface WasteModuleProps {
  onBack: () => void;
}

const WasteModule: React.FC<WasteModuleProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { citizen, updateCitizen } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<{
    type: 'schedule' | 'payment';
    id: string;
    details: string;
  } | null>(null);

  const handleSchedule = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess({
        type: 'schedule',
        id: 'W-' + Math.floor(Math.random() * 10000),
        details: 'Pickup scheduled for tomorrow morning'
      });
      
      if (citizen && updateCitizen) {
        updateCitizen({ points: (citizen.points || 0) + 15 });
        toast.success(t('waste.schedule_success') + ' (+15 Points)' || 'Pickup Scheduled Successfully! (+15 Points)');
      } else {
        toast.success(t('waste.schedule_success') || 'Pickup Scheduled Successfully!');
      }
    }, 2000);
  };

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess({
        type: 'payment',
        id: 'TXN-' + Math.floor(Math.random() * 100000),
        details: 'Monthly waste collection fee paid'
      });

      if (citizen && updateCitizen) {
        updateCitizen({ points: (citizen.points || 0) + 20 });
        toast.success(t('waste.payment_success') + ' (+20 Points)' || 'Payment Successful! (+20 Points)');
      } else {
        toast.success(t('waste.payment_success') || 'Payment Successful!');
      }
    }, 2000);
  };

  if (success) {
    return (
      <div className="p-6 overflow-y-auto pb-10 h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
        <div className="bg-green-50 p-6 rounded-full mb-6 border border-green-100">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-center text-slate-900">{t('success') || 'Success!'}</h2>
        <p className="text-slate-600 text-center mb-8 text-lg">
          {success.details}
        </p>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-slate-200">
          <QRCodeSVG 
            value={JSON.stringify(success)} 
            size={200}
            level="H"
            includeMargin={true}
          />
          <p className="text-center text-xs text-slate-500 mt-4 font-medium">Scan for Receipt</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg w-full max-w-md mb-8 border border-slate-200">
          <div className="flex justify-between mb-3 border-b border-slate-200 pb-2">
            <span className="text-slate-500">Reference ID</span>
            <span className="font-mono font-bold text-slate-900">{success.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={() => setSuccess(null)} className="border-green-200 hover:bg-green-50 hover:text-green-700">
            {t('back') || 'Back'}
          </Button>
          <Button size="lg" onClick={onBack} className="bg-green-600 hover:bg-green-700 text-white">
            {t('home') || 'Home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('services.waste.title') || 'Waste Management'}</h1>
          <p className="text-slate-500">{t('services.waste.description') || 'Schedule pickups & pay fees'}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-16 bg-slate-100 p-1">
          <TabsTrigger 
            value="schedule" 
            className="text-lg h-full data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
          >
            <Calendar className="mr-2 w-5 h-5" />
            {t('waste.schedule') || 'Schedule Pickup'}
          </TabsTrigger>
          <TabsTrigger 
            value="pay" 
            className="text-lg h-full data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
          >
            <CreditCard className="mr-2 w-5 h-5" />
            {t('waste.pay_fee') || 'Pay Fees'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-xl text-slate-800">Schedule Waste Pickup</CardTitle>
              <CardDescription className="text-slate-500">Select a type of waste and preferred time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Household', 'E-Waste', 'Construction'].map((type) => (
                  <Button 
                    key={type} 
                    variant="outline" 
                    className="h-32 flex flex-col items-center justify-center gap-3 text-lg border-slate-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-colors">
                      <Trash2 className="w-6 h-6 text-slate-600 group-hover:text-green-600" />
                    </div>
                    {type}
                  </Button>
                ))}
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 border border-green-100">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-slate-700">Pickup Location: <strong className="text-slate-900">Registered Home Address</strong></span>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all" 
                onClick={handleSchedule} 
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Confirm Pickup'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pay" className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-xl text-slate-800">Pay Waste Collection Fee</CardTitle>
              <CardDescription className="text-slate-500">Monthly municipal waste collection charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-6 border border-green-100 rounded-lg bg-green-50/50 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-slate-700">Monthly Fee (Feb 2026)</span>
                  <span className="text-3xl font-bold text-green-700">₹150.00</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 border-t border-green-100 pt-4">
                  <span>Due Date</span>
                  <span className="font-medium text-slate-700">10 Feb 2026</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all" 
                onClick={handlePay}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WasteModule;