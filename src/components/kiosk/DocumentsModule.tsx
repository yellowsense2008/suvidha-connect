import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, Download, Receipt, FileText, 
  Zap, Flame, Droplets, Calendar, CheckCircle,
  Scan, Camera, Loader2, User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface DocumentsModuleProps {
  onBack: () => void;
}

const DocumentsModule: React.FC<DocumentsModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const { bills } = useKiosk();
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);

  const t = {
    en: {
      title: 'Download Documents',
      subtitle: 'Access your receipts and certificates',
      digitizeDocs: 'Digitize Documents',
      digitizeDesc: 'Scan physical documents to save them digitally',
      scanNow: 'Scan Now',
      scanning: 'Scanning...',
      scanComplete: 'Scan Complete',
      paymentReceipts: 'Payment Receipts',
      noReceipts: 'No receipts available',
      certificates: 'Certificates',
      serviceSummary: 'Service Summary',
      download: 'Download',
      print: 'Print',
      transactionId: 'Transaction ID',
      amount: 'Amount',
      date: 'Date',
      service: 'Service',
      connectionCertificate: 'Connection Certificate',
      complianceCertificate: 'Compliance Certificate',
      usageSummary: 'Annual Usage Summary',
      backToHome: 'Back to Home',
      pointsAwarded: '+5 Suvidha Points awarded'
    },
    hi: {
      title: 'दस्तावेज़ डाउनलोड करें',
      subtitle: 'अपनी रसीदें और प्रमाण पत्र एक्सेस करें',
      digitizeDocs: 'दस्तावेज़ डिजिटाइज़ करें',
      digitizeDesc: 'भौतिक दस्तावेज़ों को डिजिटल रूप से सहेजने के लिए स्कैन करें',
      scanNow: 'अभी स्कैन करें',
      scanning: 'स्कैनिंग...',
      scanComplete: 'स्कैन पूर्ण',
      paymentReceipts: 'भुगतान रसीदें',
      noReceipts: 'कोई रसीदें उपलब्ध नहीं',
      certificates: 'प्रमाण पत्र',
      serviceSummary: 'सेवा सारांश',
      download: 'डाउनलोड',
      print: 'प्रिंट',
      transactionId: 'लेनदेन आईडी',
      amount: 'राशि',
      date: 'तारीख',
      service: 'सेवा',
      connectionCertificate: 'कनेक्शन प्रमाण पत्र',
      complianceCertificate: 'अनुपालन प्रमाण पत्र',
      usageSummary: 'वार्षिक उपयोग सारांश',
      backToHome: 'होम पर वापस जाएं',
      pointsAwarded: '+5 सुविधा अंक मिले'
    }
  };

  const text = t[language];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'electricity': return 'text-yellow-600 bg-yellow-50';
      case 'gas': return 'text-orange-600 bg-orange-50';
      case 'water': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'electricity': return Zap;
      case 'gas': return Flame;
      case 'water': return Droplets;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'electricity': return language === 'en' ? 'Electricity' : 'बिजली';
      case 'gas': return language === 'en' ? 'Gas' : 'गैस';
      case 'water': return language === 'en' ? 'Water' : 'पानी';
      default: return type;
    }
  };

  // Get all payments from bills
  const allPayments = bills.flatMap(bill => 
    bill.previousPayments.map(payment => ({
      ...payment,
      type: bill.type
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            if (updateCitizen) {
              updateCitizen({ points: (citizen?.points || 0) + 5 });
              toast.success(text.pointsAwarded);
            }
            toast.success(text.scanComplete);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleDownload = (type: string, id?: string) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`SUVIDHA ${type.toUpperCase()}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Document ID: ${id || 'DOC-' + Math.floor(Math.random() * 10000)}`, 20, 40);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 50);
    doc.text('This is a certified document from the SUVIDHA Smart City Portal.', 20, 70);
    
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Generated via SUVIDHA Kiosk System', 105, 285, { align: 'center' });
    
    doc.save(`${type.replace(/\s+/g, '_')}.pdf`);
    
    if (updateCitizen) {
      updateCitizen({ points: (citizen?.points || 0) + 5 });
      toast.success(text.pointsAwarded);
    }
    toast.success(language === 'en' ? `Downloading ${type}...` : `${type} डाउनलोड हो रहा है...`);
  };

  const handlePrint = (type: string) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`SUVIDHA ${type.toUpperCase()}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('PRINT PREVIEW', 105, 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 50);
    doc.text('This is a certified document.', 20, 70);
    
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Generated via SUVIDHA Kiosk System', 105, 285, { align: 'center' });
    
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    toast.success(language === 'en' ? `Opening Print Preview for ${type}...` : `${type} प्रिंट प्रीव्यू खुल रहा है...`);
  };

  const certificates = [
    { id: 'conn', title: text.connectionCertificate, icon: CheckCircle },
    { id: 'comp', title: text.complianceCertificate, icon: FileText },
    { id: 'usage', title: text.usageSummary, icon: Calendar }
  ];

  return (
    <div className="p-6 md:p-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 hover:bg-blue-50 hover:text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{text.title}</h2>
          <p className="text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Digitize Documents (New Feature) */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Scan className="w-5 h-5" />
                {text.digitizeDocs}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 mb-4">{text.digitizeDesc}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200">
                    <Camera className="w-4 h-4" />
                    {text.scanNow}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{text.digitizeDocs}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-6 gap-4">
                    {!isScanning ? (
                      <div className="w-full aspect-video bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center group cursor-pointer border-2 border-slate-700 hover:border-blue-500 transition-all" onClick={handleScan}>
                        <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:text-blue-400 transition-colors">
                          <Camera className="w-12 h-12" />
                          <span className="text-sm">Tap to Capture</span>
                        </div>
                        {/* Corner markers */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-slate-500 group-hover:border-blue-500 transition-colors" />
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-slate-500 group-hover:border-blue-500 transition-colors" />
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-slate-500 group-hover:border-blue-500 transition-colors" />
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-slate-500 group-hover:border-blue-500 transition-colors" />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-slate-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                        {/* Scanning animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                        <div className="text-blue-400 flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin" />
                          <span className="text-sm font-mono">{scanProgress}%</span>
                        </div>
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                      </div>
                    )}
                    <p className="text-sm text-slate-500 text-center">
                      {isScanning ? text.scanning : 'Place your document within the frame'}
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Payment Receipts */}
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Receipt className="w-5 h-5 text-blue-600" />
                {text.paymentReceipts}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {allPayments.length > 0 ? (
                allPayments.slice(0, 3).map((payment, index) => {
                  const Icon = getIcon(payment.type);
                  const colorClass = getIconColor(payment.type);
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{getTypeLabel(payment.type)} Bill</p>
                        <p className="text-sm text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handleDownload(`${payment.type} Bill`, payment.transactionId)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => handlePrint(`${payment.type} Bill`)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>{text.noReceipts}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Certificates */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-blue-600" />
                {text.certificates}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <cert.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{cert.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700" onClick={() => handleDownload(cert.title)}>
                      <Download className="w-4 h-4 mr-1" />
                      {text.download}
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700" onClick={() => handlePrint(cert.title)}>
                      {text.print}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg border-none">
            <CardContent className="p-6">
              <h4 className="font-semibold mb-6 text-blue-100 flex items-center gap-2">
                <User className="w-4 h-4" />
                {language === 'en' ? 'Account Information' : 'खाता जानकारी'}
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-blue-200">{language === 'en' ? 'Name' : 'नाम'}</span>
                  <span className="font-medium text-lg">{citizen?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-blue-200">{language === 'en' ? 'Consumer ID' : 'उपभोक्ता आईडी'}</span>
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{citizen?.consumerId}</span>
                </div>
                <div className="flex justify-between items-start pt-2">
                  <span className="text-blue-200">{language === 'en' ? 'Address' : 'पता'}</span>
                  <span className="text-right max-w-[60%] text-blue-50">{citizen?.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          {text.backToHome}
        </Button>
      </div>
    </div>
  );
};

export default DocumentsModule;
