import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, Flame, Droplets, ArrowLeft, CreditCard, 
  Smartphone, Building, CheckCircle, Loader2, Download,
  Calendar, Receipt, History, Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import ThermalReceipt, { type ThermalReceiptData } from './ThermalReceipt';

interface BillPaymentModuleProps {
  onBack: () => void;
}

const BillPaymentModule: React.FC<BillPaymentModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const { bills, payBill } = useKiosk();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState<{
    transactionId: string;
    amount: number;
    timestamp: string;
  } | null>(null);
  const [showThermal, setShowThermal] = useState(false);

  const t = {
    en: {
      title: 'Bill Payment',
      subtitle: 'Pay your utility bills securely',
      electricity: 'Electricity',
      gas: 'Gas',
      water: 'Water',
      selectBill: 'Select Bill to Pay',
      noBills: 'No pending bills',
      amount: 'Amount Due',
      dueDate: 'Due Date',
      billDate: 'Bill Date',
      units: 'Units',
      viewHistory: 'Payment History',
      payNow: 'Pay Now',
      selectPayment: 'Select Payment Method',
      upi: 'UPI',
      card: 'Card',
      netbanking: 'Netbanking',
      processing: 'Processing Payment...',
      success: 'Payment Successful!',
      transactionId: 'Transaction ID',
      downloadReceipt: 'Download Receipt',
      printReceipt: 'Print Receipt',
      newPayment: 'Make Another Payment',
      backToHome: 'Back to Home',
      overdue: 'OVERDUE',
      previousPayments: 'Previous Payments'
    },
    hi: {
      title: 'बिल भुगतान',
      subtitle: 'अपने उपयोगिता बिलों का सुरक्षित भुगतान करें',
      electricity: 'बिजली',
      gas: 'गैस',
      water: 'पानी',
      selectBill: 'भुगतान के लिए बिल चुनें',
      noBills: 'कोई लंबित बिल नहीं',
      amount: 'देय राशि',
      dueDate: 'नियत तारीख',
      billDate: 'बिल तारीख',
      units: 'यूनिट',
      viewHistory: 'भुगतान इतिहास',
      payNow: 'अभी भुगतान करें',
      selectPayment: 'भुगतान विधि चुनें',
      upi: 'UPI',
      card: 'कार्ड',
      netbanking: 'नेटबैंकिंग',
      processing: 'भुगतान प्रोसेस हो रहा है...',
      success: 'भुगतान सफल!',
      transactionId: 'लेनदेन आईडी',
      downloadReceipt: 'रसीद डाउनलोड करें',
      printReceipt: 'रसीद प्रिंट करें',
      newPayment: 'एक और भुगतान करें',
      backToHome: 'होम पर वापस जाएं',
      overdue: 'अतिदेय',
      previousPayments: 'पिछले भुगतान'
    }
  };

  const text = t[language];

  const getIcon = (type: string) => {
    switch (type) {
      case 'electricity': return Zap;
      case 'gas': return Flame;
      case 'water': return Droplets;
      default: return Zap;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'electricity': return text.electricity;
      case 'gas': return text.gas;
      case 'water': return text.water;
      default: return type;
    }
  };

  const getServiceStyles = (type: string) => {
    switch (type) {
      case 'electricity':
        return {
          bg: 'bg-yellow-50',
          hoverBg: 'hover:bg-yellow-50',
          border: 'border-yellow-200',
          borderActive: 'border-yellow-500',
          text: 'text-yellow-700',
          iconBg: 'bg-yellow-100',
          iconText: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          highlight: 'bg-yellow-50/50'
        };
      case 'gas':
        return {
          bg: 'bg-orange-50',
          hoverBg: 'hover:bg-orange-50',
          border: 'border-orange-200',
          borderActive: 'border-orange-500',
          text: 'text-orange-700',
          iconBg: 'bg-orange-100',
          iconText: 'text-orange-600',
          button: 'bg-orange-600 hover:bg-orange-700',
          highlight: 'bg-orange-50/50'
        };
      case 'water':
        return {
          bg: 'bg-blue-50',
          hoverBg: 'hover:bg-blue-50',
          border: 'border-blue-200',
          borderActive: 'border-blue-500',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          highlight: 'bg-blue-50/50'
        };
      default:
        return {
          bg: 'bg-slate-50',
          hoverBg: 'hover:bg-slate-50',
          border: 'border-slate-200',
          borderActive: 'border-slate-500',
          text: 'text-slate-700',
          iconBg: 'bg-slate-100',
          iconText: 'text-slate-600',
          button: 'bg-slate-600 hover:bg-slate-700',
          highlight: 'bg-slate-50/50'
        };
    }
  };

  const citizenBills = bills.filter(b => b.status !== 'paid');
  const selectedBillData = bills.find(b => b.id === selectedBill);
  const totalDue = citizenBills.reduce((sum, bill) => sum + bill.amount, 0);

  const handlePayment = async () => {
    if (!selectedBill || !paymentMethod) return;
    
    setProcessing(true);
    const result = await payBill(selectedBill, paymentMethod);
    setProcessing(false);

    if (result.success) {
      setPaymentComplete({
        transactionId: result.transactionId,
        amount: result.amount,
        timestamp: result.timestamp
      });
      
      // Award Suvidha Points for digital payment
      if (citizen && updateCitizen) {
        updateCitizen({ points: (citizen.points || 0) + 20 });
        toast.success(`${text.success} (+20 Points)`);
      } else {
        toast.success(text.success);
      }
    } else {
      toast.error(language === 'en' ? 'Payment failed. Please try again.' : 'भुगतान विफल. कृपया पुनः प्रयास करें।');
    }
  };

  const resetPayment = () => {
    setSelectedBill(null);
    setPaymentMethod(null);
    setPaymentComplete(null);
  };

  const handleDownloadReceipt = () => {
    if (!paymentComplete || !selectedBillData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('SUVIDHA PAYMENT RECEIPT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Smart Urban Virtual Interactive Digital Helpdesk Assistant', 105, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Transaction ID:`, 20, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(paymentComplete.transactionId, 80, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Date & Time:`, 20, 60);
    doc.text(new Date(paymentComplete.timestamp).toLocaleString(), 80, 60);
    
    doc.text(`Service Type:`, 20, 70);
    doc.text(getTypeLabel(selectedBillData.type), 80, 70);
    
    doc.text(`Consumer ID:`, 20, 80);
    doc.text(selectedBillData.consumerId, 80, 80);
    
    // Amount Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 95, 170, 20, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Amount Paid:`, 30, 108);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(`INR ${paymentComplete.amount.toLocaleString('en-IN')}`, 180, 108, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for using SUVIDHA Kiosk Services.', 105, 270, { align: 'center' });
    doc.text('This is a computer generated receipt.', 105, 280, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Generated via SUVIDHA Kiosk System', 105, 285, { align: 'center' });
    
    doc.save(`receipt_${paymentComplete.transactionId}.pdf`);
    toast.success(language === 'en' ? 'Receipt downloaded successfully' : 'रसीद सफलतापूर्वक डाउनलोड की गई');
  };

  const handlePrintReceipt = () => {
    if (!paymentComplete || !selectedBillData) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('SUVIDHA PAYMENT RECEIPT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Smart Urban Virtual Interactive Digital Helpdesk Assistant', 105, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Transaction ID:`, 20, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(paymentComplete.transactionId, 80, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Date & Time:`, 20, 60);
    doc.text(new Date(paymentComplete.timestamp).toLocaleString(), 80, 60);
    
    doc.text(`Service Type:`, 20, 70);
    doc.text(getTypeLabel(selectedBillData.type), 80, 70);
    
    doc.text(`Consumer ID:`, 20, 80);
    doc.text(selectedBillData.consumerId, 80, 80);
    
    // Amount Box
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 95, 170, 20, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Amount Paid:`, 30, 108);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(`INR ${paymentComplete.amount.toLocaleString('en-IN')}`, 180, 108, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for using SUVIDHA Kiosk Services.', 105, 270, { align: 'center' });
    doc.text('This is a computer generated receipt.', 105, 280, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Generated via SUVIDHA Kiosk System', 105, 285, { align: 'center' });
    
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    toast.success(language === 'en' ? 'Opening Print Preview...' : 'प्रिंट प्रीव्यू खुल रहा है...');
  };

  // Payment Complete Screen
  if (paymentComplete) {
    const styles = selectedBillData ? getServiceStyles(selectedBillData.type) : getServiceStyles('default');

    return (
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
        <Card className={`border ${styles.border} shadow-xl`}>
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${styles.highlight} ${styles.border}`}>
              <CheckCircle className={`w-12 h-12 ${styles.text}`} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{text.success}</h2>
            <p className={`text-slate-600 mb-6 text-2xl font-bold ${styles.text}`}>
              ₹{paymentComplete.amount.toLocaleString('en-IN')}
            </p>

            <div className={`p-6 rounded-lg mb-6 text-left space-y-3 border ${styles.highlight} ${styles.border}`}>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">{text.transactionId}</span>
                <span className="font-mono font-bold text-slate-900">{paymentComplete.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time</span>
                <span className="text-slate-900">{new Date(paymentComplete.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="text-slate-900 font-medium">{selectedBillData ? getTypeLabel(selectedBillData.type) : ''}</span>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <QRCodeSVG 
                  value={JSON.stringify(paymentComplete)} 
                  size={180} 
                  level="H"
                  includeMargin={true}
                />
                <p className="text-xs text-center mt-2 text-slate-500 font-medium">Scan to Download Receipt</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
              <Button className={`flex-1 h-14 border hover:bg-opacity-10 hover:text-opacity-90 ${styles.border} ${styles.text} ${styles.hoverBg}`} variant="outline" onClick={handleDownloadReceipt}>
                <Download className="w-5 h-5 mr-2" />
                {text.downloadReceipt}
              </Button>
              <Button className={`flex-1 h-14 border hover:bg-opacity-10 hover:text-opacity-90 ${styles.border} ${styles.text} ${styles.hoverBg}`} variant="outline" onClick={handlePrintReceipt}>
                <Receipt className="w-5 h-5 mr-2" />
                {text.printReceipt}
              </Button>
              <Button className={`flex-1 h-14 border ${styles.border} ${styles.text} ${styles.hoverBg}`} variant="outline" onClick={() => setShowThermal(true)}>
                <Printer className="w-5 h-5 mr-2" />Thermal Receipt
              </Button>
            </div>
            {showThermal && paymentComplete && selectedBillData && (
              <ThermalReceipt
                language={language as 'en' | 'hi' | 'as'}
                onClose={() => setShowThermal(false)}
                data={{
                  type: 'payment',
                  title: `${getTypeLabel(selectedBillData.type)} Bill Receipt`,
                  refId: paymentComplete.transactionId,
                  timestamp: new Date(paymentComplete.timestamp).toLocaleString('en-IN'),
                  rows: [
                    { label: 'Consumer ID', value: selectedBillData.consumerId },
                    { label: 'Service', value: getTypeLabel(selectedBillData.type) },
                    { label: 'Bill Date', value: new Date(selectedBillData.billDate).toLocaleDateString() },
                    { label: 'Amount Paid', value: `INR ${paymentComplete.amount.toLocaleString('en-IN')}`, bold: true },
                    { label: 'Payment Mode', value: 'Digital' },
                    { label: 'Status', value: 'PAID', bold: true },
                  ],
                  footer: 'Keep this receipt for your records',
                }}
              />
            )}

            <div className="flex gap-4">
              <Button className="flex-1 h-14 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50" variant="secondary" onClick={resetPayment}>
                {text.newPayment}
              </Button>
              <Button className={`flex-1 h-14 text-white ${styles.button}`} onClick={onBack}>
                {text.backToHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{text.title}</h2>
          <p className="text-slate-500">{text.subtitle}</p>
        </div>
      </div>

      {/* Dashboard Summary */}
      {citizenBills.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-slate-400 font-medium mb-2">{text.amount}</p>
              <h3 className="text-5xl font-bold tracking-tight">₹{totalDue.toLocaleString('en-IN')}</h3>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-sm font-medium border border-blue-500/30">
                  {citizenBills.length} Bills Pending
                </span>
                {citizenBills.some(b => b.status === 'overdue') && (
                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm font-medium border border-red-500/30">
                    Overdue Items
                  </span>
                )}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-3">
            {text.selectBill}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 py-3">
            {text.viewHistory}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Bill Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5" /> Pending Bills
              </h3>
              {citizenBills.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="text-center py-12 text-slate-400">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500/20" />
                    <p className="text-lg font-medium text-slate-600">{text.noBills}</p>
                    <p className="text-sm">You're all caught up!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {citizenBills.map((bill) => {
                    const Icon = getIcon(bill.type);
                    const styles = getServiceStyles(bill.type);
                    const isOverdue = bill.status === 'overdue';
                    const isSelected = selectedBill === bill.id;
                    
                    // Calculate days left
                    const daysLeft = Math.ceil((new Date(bill.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const dueLabel = daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} days` : `Due in ${daysLeft} days`;
                    
                    return (
                      <div
                        key={bill.id}
                        className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isSelected
                            ? `${styles.borderActive} ${styles.bg} shadow-md ring-1 ring-offset-2 ${styles.borderActive.replace('border', 'ring')}`
                            : `border-slate-200 bg-white hover:border-slate-300`
                        } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                        onClick={() => setSelectedBill(bill.id)}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? `bg-white ${styles.iconText} shadow-sm` : `${styles.iconBg} ${styles.iconText} group-hover:scale-110`
                          }`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className={`font-bold text-lg ${isSelected ? styles.text : 'text-slate-800'}`}>
                                  {getTypeLabel(bill.type)}
                                </h4>
                                <p className="text-sm text-slate-500 font-mono mt-0.5">{bill.consumerId}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-bold tracking-tight ${isSelected ? styles.text : 'text-slate-900'}`}>
                                  ₹{bill.amount.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/50">
                              <div className="flex items-center gap-3">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  daysLeft < 0 ? 'bg-red-100 text-red-700' : 
                                  daysLeft < 5 ? 'bg-orange-100 text-orange-700' : 
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {dueLabel}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {bill.units} {text.units}
                                </span>
                              </div>
                              
                              {!isSelected && (
                                <span className={`text-sm font-semibold ${styles.text} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                                  Select to Pay <ArrowLeft className="w-4 h-4 rotate-180" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Panel */}
            <div className={`space-y-6 transition-all duration-500 ${selectedBill ? 'opacity-100 translate-x-0' : 'opacity-50 translate-x-4 grayscale'}`}>
              <div className="sticky top-8">
                {selectedBillData ? (() => {
                  const styles = getServiceStyles(selectedBillData.type);
                  return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-2 text-slate-800 mb-2">
                        <CreditCard className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Payment Details</h3>
                      </div>
                      
                      {/* Bill Summary */}
                      <Card className={`border shadow-lg overflow-hidden ${styles.border}`}>
                        <div className={`h-2 w-full ${styles.button}`}></div>
                        <CardHeader className={`${styles.bg} border-b ${styles.border} pb-4`}>
                          <CardTitle className={`text-lg flex justify-between items-center ${styles.text}`}>
                            <span>Bill Summary</span>
                            <span className="text-sm font-normal px-2 py-1 bg-white/50 rounded-md border border-black/5">
                              {selectedBillData.consumerId}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{text.billDate}</p>
                              <p className="font-medium text-slate-900">{new Date(selectedBillData.billDate).toLocaleDateString()}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{text.dueDate}</p>
                              <p className="font-medium text-slate-900">{new Date(selectedBillData.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <div className={`flex justify-between items-end py-4 px-5 rounded-xl border-2 ${styles.border} ${styles.highlight}`}>
                            <span className="text-slate-600 font-medium mb-1">{text.amount}</span>
                            <span className={`text-3xl font-bold ${styles.text}`}>₹{selectedBillData.amount.toLocaleString('en-IN')}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Payment Method */}
                      <Card className="border-slate-200 shadow-md">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-slate-700">{text.selectPayment}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { id: 'upi', label: text.upi, icon: Smartphone },
                            { id: 'card', label: text.card, icon: CreditCard },
                            { id: 'netbanking', label: text.netbanking, icon: Building }
                          ].map((method) => (
                            <div
                              key={method.id}
                              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === method.id
                                  ? `${styles.borderActive} ${styles.bg} shadow-sm`
                                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                              }`}
                              onClick={() => setPaymentMethod(method.id)}
                            >
                              <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-white' : 'bg-slate-100'}`}>
                                <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? styles.text : 'text-slate-500'}`} />
                              </div>
                              <span className={`font-medium ${paymentMethod === method.id ? styles.text : 'text-slate-700'}`}>
                                {method.label}
                              </span>
                              {paymentMethod === method.id && (
                                <div className={`ml-auto w-4 h-4 rounded-full ${styles.button} flex items-center justify-center`}>
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Action Button */}
                      <Button 
                        size="lg" 
                        className={`w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all ${styles.button} ${!paymentMethod ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePayment}
                        disabled={!paymentMethod || processing}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {text.processing}
                          </>
                        ) : (
                          text.payNow
                        )}
                      </Button>
                    </div>
                  );
                })() : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 border-2 border-dashed border-slate-200 rounded-2xl">
                    <ArrowLeft className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg">Select a bill from the left to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bills.filter(b => b.status === 'paid').length > 0 ? (
                <div className="space-y-4">
                  {bills.filter(b => b.status === 'paid').map((bill) => {
                     const styles = getServiceStyles(bill.type);
                     return (
                      <div key={bill.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                            {React.createElement(getIcon(bill.type), { className: `w-5 h-5 ${styles.iconText}` })}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{getTypeLabel(bill.type)} Bill</p>
                            <p className="text-sm text-slate-500">Paid on {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">₹{bill.amount.toLocaleString('en-IN')}</p>
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Paid Successfully</span>
                        </div>
                      </div>
                     );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>No payment history available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillPaymentModule;
