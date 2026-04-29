import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, CreditCard, QrCode, Loader2, Shield, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { loginWithOTP, loginWithConsumerId, language } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [consumerId, setConsumerId] = useState('');
  const [pin, setPin] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    en: {
      title: 'Citizen Authentication',
      subtitle: 'Secure login to access your utility services',
      mobileTab: 'Mobile OTP',
      consumerTab: 'Consumer ID',
      qrTab: 'QR/Aadhaar',
      mobileNumber: 'Mobile Number',
      enterMobile: 'Enter 10-digit mobile number',
      sendOtp: 'Send OTP',
      enterOtp: 'Enter OTP',
      otpSent: 'OTP sent to your mobile',
      verifyLogin: 'Verify & Login',
      consumerId: 'Consumer ID',
      enterConsumerId: 'Enter your Consumer ID',
      pin: 'PIN',
      enterPin: 'Enter 4-digit PIN',
      login: 'Login',
      qrScan: 'QR Code / Aadhaar Scan',
      qrInstructions: 'Position your Aadhaar QR code in front of the scanner',
      scanNow: 'Scan Now',
      demoNote: 'Demo: Use mobile 9876543210 with OTP 123456, or Consumer ID ELEC2024001 with PIN 1234',
      secureSession: 'Your session is encrypted and secure',
      autoLogout: 'Auto-logout after 3 minutes of inactivity'
    },
    hi: {
      title: 'नागरिक प्रमाणीकरण',
      subtitle: 'अपनी उपयोगिता सेवाओं तक पहुंचने के लिए सुरक्षित लॉगिन',
      mobileTab: 'मोबाइल OTP',
      consumerTab: 'उपभोक्ता आईडी',
      qrTab: 'QR/आधार',
      mobileNumber: 'मोबाइल नंबर',
      enterMobile: '10 अंकों का मोबाइल नंबर दर्ज करें',
      sendOtp: 'OTP भेजें',
      enterOtp: 'OTP दर्ज करें',
      otpSent: 'OTP आपके मोबाइल पर भेजा गया',
      verifyLogin: 'सत्यापित करें और लॉगिन करें',
      consumerId: 'उपभोक्ता आईडी',
      enterConsumerId: 'अपना उपभोक्ता आईडी दर्ज करें',
      pin: 'पिन',
      enterPin: '4 अंकों का पिन दर्ज करें',
      login: 'लॉगिन',
      qrScan: 'QR कोड / आधार स्कैन',
      qrInstructions: 'स्कैनर के सामने अपना आधार QR कोड रखें',
      scanNow: 'अभी स्कैन करें',
      demoNote: 'डेमो: मोबाइल 9876543210 और OTP 123456, या उपभोक्ता आईडी ELEC2024001 और पिन 1234 का उपयोग करें',
      secureSession: 'आपका सत्र एन्क्रिप्टेड और सुरक्षित है',
      autoLogout: '3 मिनट की निष्क्रियता के बाद स्वचालित लॉगआउट'
    }
  };

  const text = t[language];

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      toast.error(language === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया एक वैध 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setLoading(false);
    toast.success(language === 'en' ? 'OTP sent to your mobile' : 'OTP आपके मोबाइल पर भेजा गया');
  };

  const handleOTPLogin = async () => {
    if (otp.length !== 6) {
      toast.error(language === 'en' ? 'Please enter a valid 6-digit OTP' : 'कृपया एक वैध 6 अंकों का OTP दर्ज करें');
      return;
    }
    setLoading(true);
    const success = await loginWithOTP(mobile, otp);
    setLoading(false);
    
    if (success) {
      toast.success(language === 'en' ? 'Login successful!' : 'लॉगिन सफल!');
      onSuccess();
    } else {
      toast.error(language === 'en' ? 'Invalid OTP. Please try again.' : 'अमान्य OTP. कृपया पुनः प्रयास करें।');
    }
  };

  const handleConsumerLogin = async () => {
    if (!consumerId || pin.length !== 4) {
      toast.error(language === 'en' ? 'Please enter valid Consumer ID and PIN' : 'कृपया वैध उपभोक्ता आईडी और पिन दर्ज करें');
      return;
    }
    setLoading(true);
    const success = await loginWithConsumerId(consumerId, pin);
    setLoading(false);
    
    if (success) {
      toast.success(language === 'en' ? 'Login successful!' : 'लॉगिन सफल!');
      onSuccess();
    } else {
      toast.error(language === 'en' ? 'Invalid credentials. Please try again.' : 'अमान्य प्रमाण-पत्र. कृपया पुनः प्रयास करें।');
    }
  };

  const handleQRScan = () => {
    toast.info(language === 'en' ? 'QR Scanner is a placeholder for demo' : 'QR स्कैनर डेमो के लिए प्लेसहोल्डर है');
  };

  return (
    <div className="min-h-full flex items-start justify-center p-8 bg-muted/30 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-0 ring-1 ring-black/5 z-10 bg-white/80 backdrop-blur-xl">
        {/* Tricolor Branding Bar */}
        <div className="h-2 w-full bg-[linear-gradient(90deg,#FF9933_0%,#FFFFFF_50%,#138808_100%)]" />
        <CardHeader className="text-center space-y-2 pb-6 pt-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
              {language === 'en' ? 'Government of India' : 'भारत सरकार'}
            </h2>
            <CardTitle className="text-3xl font-serif text-slate-800">
              {text.title}
            </CardTitle>
          </div>
          <CardDescription className="text-base font-medium text-slate-500 max-w-xs mx-auto">
            {text.subtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-11 bg-slate-100 rounded-xl p-1">
              <TabsTrigger value="mobile" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                <Smartphone className="w-4 h-4 mr-1.5" />
                {text.mobileTab}
              </TabsTrigger>
              <TabsTrigger value="consumer" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                <CreditCard className="w-4 h-4 mr-1.5" />
                {text.consumerTab}
              </TabsTrigger>
              <TabsTrigger value="qr" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
                <QrCode className="w-4 h-4 mr-1.5" />
                {text.qrTab}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="space-y-5 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">{text.mobileNumber}</label>
                <Input
                  type="tel"
                  placeholder={text.enterMobile}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="text-lg h-14 bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  disabled={otpSent}
                />
              </div>
              
              {!otpSent ? (
                <Button 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/20 rounded-xl transition-all hover:scale-[1.01]"
                  onClick={handleSendOTP}
                  disabled={loading || mobile.length !== 10}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {text.sendOtp}
                </Button>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 text-green-700 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{text.otpSent}</p>
                        <p className="text-xs text-green-600 mt-0.5 font-mono tracking-wide">+91 {mobile}</p>
                      </div>
                    </div>
                    <Button variant="link" size="sm" onClick={() => setOtpSent(false)} className="text-green-700 h-auto p-0 text-xs">
                       Change
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{text.enterOtp}</label>
                    <Input
                      type="password"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-lg h-14 text-center tracking-[0.5em] font-mono bg-white border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 rounded-xl transition-all hover:scale-[1.01]"
                    onClick={handleOTPLogin}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {text.verifyLogin}
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="consumer" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{text.consumerId}</label>
                <Input
                  type="text"
                  placeholder={text.enterConsumerId}
                  value={consumerId}
                  onChange={(e) => setConsumerId(e.target.value.toUpperCase())}
                  className="text-lg h-14"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{text.pin}</label>
                <Input
                  type="password"
                  placeholder={text.enterPin}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-lg h-14 text-center tracking-widest"
                  maxLength={4}
                />
              </div>
              <Button 
                className="w-full h-14 text-lg"
                onClick={handleConsumerLogin}
                disabled={loading || !consumerId || pin.length !== 4}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {text.login}
              </Button>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center py-8">
                <div className="w-48 h-48 mx-auto border-4 border-dashed border-primary/30 rounded-2xl flex items-center justify-center bg-muted/50 mb-4">
                  <QrCode className="w-24 h-24 text-primary/40" />
                </div>
                <p className="text-muted-foreground mb-4">{text.qrInstructions}</p>
                <Button 
                  className="h-14 px-8 text-lg"
                  onClick={handleQRScan}
                >
                  {text.scanNow}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-sm text-muted-foreground text-center">
              💡 {text.demoNote}
            </p>
          </div>

          {/* Security Notes */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {text.secureSession}
            </div>
            <div>•</div>
            <div>{text.autoLogout}</div>
          </div>

          {/* Certifications */}
          <div className="mt-4 pt-4 border-t border-border flex justify-center gap-4 opacity-70">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded border border-green-500/20">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-semibold text-green-700">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="text-[10px] font-semibold text-blue-700">ISO 27001</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
