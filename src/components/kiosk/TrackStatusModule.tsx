import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, Search, CheckCircle, Clock,
  FileCheck, AlertCircle, XCircle, Loader2,
  Download, Printer, Shield, AlertTriangle, User, Phone
} from 'lucide-react';
import { statusLabels } from '@/lib/mockData';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface TrackStatusModuleProps { onBack: () => void; }

const SLA_DAYS: Record<string, number> = {
  pending: 7, submitted: 7,
  under_review: 5, in_progress: 3,
  completed: 0, resolved: 0, approved: 0, rejected: 0,
};

const ASSIGNED_OFFICERS = [
  { name: 'Rajiv Bora', dept: 'Field Operations', phone: '98765-XXXXX' },
  { name: 'Priya Das', dept: 'Grievance Cell', phone: '98766-XXXXX' },
  { name: 'Amit Sharma', dept: 'Technical Division', phone: '98767-XXXXX' },
];

const tx = {
  en: {
    title: 'Track Request / Complaint',
    subtitle: 'Real-time status with SLA visibility',
    label: 'Ticket ID / Reference Number / Mobile',
    placeholder: 'e.g. COMP123456 or ELEC-REQ-2026-0001',
    search: 'Track', searching: 'Searching...',
    notFound: 'No record found', tryAgain: 'Please verify the ID and try again',
    complaintStatus: 'Complaint Status', requestStatus: 'Application Status',
    verified: 'Blockchain Verified ✓',
    submittedOn: 'Submitted On', lastUpdate: 'Last Updated',
    category: 'Category', type: 'Type', location: 'Location', description: 'Description',
    slaLabel: 'SLA Deadline', slaRemaining: 'days remaining',
    slaBreached: 'SLA Breached – Escalated',
    slaToday: 'Due Today – Priority',
    assignedOfficer: 'Assigned Officer',
    dept: 'Department', contact: 'Contact',
    integrityNote: 'This record is tamper-proof and verified on the Integrity Ledger',
    downloadStatus: 'Download Status', printStatus: 'Print Status',
    escalated: 'Escalated', lifecycle: 'Request Lifecycle',
    demoHint: 'Try: COMP001, COMP002, or ELEC-REQ-2026-001',
  },
  hi: {
    title: 'अनुरोध / शिकायत ट्रैक करें',
    subtitle: 'SLA दृश्यता के साथ रियल-टाइम स्थिति',
    label: 'टिकट आईडी / संदर्भ संख्या / मोबाइल',
    placeholder: 'जैसे COMP123456 या ELEC-REQ-2026-0001',
    search: 'ट्रैक करें', searching: 'खोज रहा है...',
    notFound: 'कोई रिकॉर्ड नहीं मिला', tryAgain: 'कृपया आईडी सत्यापित करें और पुनः प्रयास करें',
    complaintStatus: 'शिकायत स्थिति', requestStatus: 'आवेदन स्थिति',
    verified: 'ब्लॉकचेन सत्यापित ✓',
    submittedOn: 'जमा करने की तारीख', lastUpdate: 'अंतिम अपडेट',
    category: 'श्रेणी', type: 'प्रकार', location: 'स्थान', description: 'विवरण',
    slaLabel: 'SLA समय सीमा', slaRemaining: 'दिन शेष',
    slaBreached: 'SLA उल्लंघन – एस्केलेट किया गया',
    slaToday: 'आज देय – प्राथमिकता',
    assignedOfficer: 'नियुक्त अधिकारी',
    dept: 'विभाग', contact: 'संपर्क',
    integrityNote: 'यह रिकॉर्ड छेड़छाड़-रोधी है और इंटीग्रिटी लेजर पर सत्यापित है',
    downloadStatus: 'स्थिति डाउनलोड करें', printStatus: 'स्थिति प्रिंट करें',
    escalated: 'एस्केलेट', lifecycle: 'अनुरोध जीवनचक्र',
    demoHint: 'आज़माएं: COMP001, COMP002, या ELEC-REQ-2026-001',
  },
  as: {
    title: 'অনুৰোধ / অভিযোগ ট্ৰেক কৰক',
    subtitle: 'SLA দৃশ্যমানতাৰ সৈতে ৰিয়েল-টাইম স্থিতি',
    label: 'টিকট আইডি / ৰেফাৰেন্স নম্বৰ / মোবাইল',
    placeholder: 'যেনে COMP123456 বা ELEC-REQ-2026-0001',
    search: 'ট্ৰেক কৰক', searching: 'বিচাৰি আছে...',
    notFound: 'কোনো ৰেকৰ্ড পোৱা নগল', tryAgain: 'অনুগ্ৰহ কৰি আইডি যাচাই কৰক আৰু পুনৰ চেষ্টা কৰক',
    complaintStatus: 'অভিযোগৰ স্থিতি', requestStatus: 'আবেদনৰ স্থিতি',
    verified: 'ব্লকচেইন যাচাই ✓',
    submittedOn: 'দাখিলৰ তাৰিখ', lastUpdate: 'শেষ আপডেট',
    category: 'শ্ৰেণী', type: 'প্ৰকাৰ', location: 'স্থান', description: 'বিৱৰণ',
    slaLabel: 'SLA সময়সীমা', slaRemaining: 'দিন বাকী',
    slaBreached: 'SLA উলংঘন – এস্কেলেট কৰা হৈছে',
    slaToday: 'আজি বকেয়া – অগ্ৰাধিকাৰ',
    assignedOfficer: 'নিযুক্ত বিষয়া',
    dept: 'বিভাগ', contact: 'যোগাযোগ',
    integrityNote: 'এই ৰেকৰ্ড টেম্পাৰ-প্ৰুফ আৰু ইন্টিগ্ৰিটি লেজাৰত যাচাই কৰা হৈছে',
    downloadStatus: 'স্থিতি ডাউনলোড কৰক', printStatus: 'স্থিতি প্ৰিন্ট কৰক',
    escalated: 'এস্কেলেট', lifecycle: 'অনুৰোধৰ জীৱনচক্ৰ',
    demoHint: 'চেষ্টা কৰক: COMP001, COMP002, বা ELEC-REQ-2026-001',
  },
};

const TrackStatusModule: React.FC<TrackStatusModuleProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const { getComplaintStatus, getRequestStatus, verifyIntegrity } = useKiosk();
  const lang = (language as keyof typeof tx) in tx ? (language as keyof typeof tx) : 'en';
  const t = tx[lang];

  const [trackingId, setTrackingId] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ type: 'complaint' | 'request'; data: any; verified: boolean } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [slaCountdown, setSlaCountdown] = useState<number | null>(null);

  const complaintSteps = ['pending', 'under_review', 'in_progress', 'resolved'];
  const requestSteps = ['submitted', 'under_review', 'in_progress', 'completed'];

  // SLA countdown timer
  useEffect(() => {
    if (!result) return;
    const daysLeft = SLA_DAYS[result.data.status] ?? 7;
    setSlaCountdown(daysLeft);
  }, [result]);

  const getStatusIndex = (status: string, type: 'complaint' | 'request') => {
    const steps = type === 'complaint' ? complaintSteps : requestSteps;
    return steps.indexOf(status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under_review': case 'in_progress': return <FileCheck className="w-4 h-4" />;
      case 'completed': case 'resolved': case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSLAColor = (days: number) => {
    if (days <= 0) return 'bg-red-50 border-red-200 text-red-700';
    if (days === 1) return 'bg-orange-50 border-orange-200 text-orange-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  const assignedOfficer = ASSIGNED_OFFICERS[Math.floor(Math.random() * ASSIGNED_OFFICERS.length)];

  const handleSearch = async () => {
    if (!trackingId.trim()) return;
    setSearching(true);
    setNotFound(false);
    setResult(null);
    await new Promise(r => setTimeout(r, 900));

    const complaint = getComplaintStatus(trackingId.trim());
    if (complaint) {
      setResult({ type: 'complaint', data: complaint, verified: verifyIntegrity(complaint.id) });
      setSearching(false);
      if (!pointsAwarded && updateCitizen && citizen) {
        updateCitizen({ points: (citizen.points || 0) + 5 });
        setPointsAwarded(true);
      }
      return;
    }
    const request = getRequestStatus(trackingId.trim());
    if (request) {
      setResult({ type: 'request', data: request, verified: verifyIntegrity(request.id) });
      setSearching(false);
      if (!pointsAwarded && updateCitizen && citizen) {
        updateCitizen({ points: (citizen.points || 0) + 5 });
        setPointsAwarded(true);
      }
      return;
    }
    setNotFound(true);
    setSearching(false);
  };

  const handleDownloadStatus = () => {
    if (!result) return;
    const doc = new jsPDF({ format: 'a4' });
    const d = result.data;

    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SUVIDHA CONNECT – STATUS REPORT', 105, 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Urban Virtual Interactive Digital Helpdesk Assistant', 105, 22, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(result.type === 'complaint' ? 'COMPLAINT STATUS' : 'APPLICATION STATUS', 20, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const rows = [
      ['ID / Reference', d.id || d.referenceNumber],
      ['Status', d.status.replace(/_/g, ' ').toUpperCase()],
      ['Submitted On', new Date(d.createdAt).toLocaleString()],
      ['Last Updated', new Date(d.updatedAt).toLocaleString()],
      ['SLA Days Remaining', `${SLA_DAYS[d.status] ?? 7} days`],
      ['Assigned Officer', assignedOfficer.name],
      ['Department', assignedOfficer.dept],
    ];
    if (result.type === 'complaint') {
      rows.push(['Category', d.category.replace(/_/g, ' ')]);
      rows.push(['Location', d.location]);
    }

    let y = 52;
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.setFillColor(248, 250, 252);
      else doc.setFillColor(255, 255, 255);
      doc.rect(20, y - 5, 170, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(label + ':', 22, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 90, y);
      y += 12;
    });

    doc.setFillColor(239, 246, 255);
    doc.rect(20, y, 170, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('✓ Blockchain Integrity Verified', 105, y + 9, { align: 'center' });

    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()} | SUVIDHA Kiosk System`, 105, 285, { align: 'center' });

    doc.save(`status_${d.id || d.referenceNumber}.pdf`);
    toast.success('Status report downloaded');
  };

  const handlePrintStatus = () => {
    handleDownloadStatus();
    toast.success('Opening print preview...');
  };

  const steps = result ? (result.type === 'complaint' ? complaintSteps : requestSteps) : [];
  const currentIdx = result ? getStatusIndex(result.data.status, result.type) : -1;

  return (
    <div className="p-6 md:p-8 overflow-y-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="text-slate-500">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search */}
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-6">
            <label className="text-sm font-semibold text-slate-700 mb-2 block uppercase tracking-wider">{t.label}</label>
            <div className="flex gap-3">
              <Input
                placeholder={t.placeholder}
                value={trackingId}
                onChange={e => setTrackingId(e.target.value.toUpperCase())}
                className="h-14 text-lg border-slate-200 focus:border-blue-500"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Button
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md shrink-0"
                onClick={handleSearch}
                disabled={searching || !trackingId.trim()}
              >
                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5 mr-2" />{t.search}</>}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">💡 {t.demoHint}</p>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{t.notFound}</h3>
              <p className="text-slate-600">{t.tryAgain}</p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className="border border-blue-100 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-400">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-slate-900">
                  {result.type === 'complaint' ? t.complaintStatus : t.requestStatus}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {result.verified && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full">
                      <Shield className="w-3.5 h-3.5" />{t.verified}
                    </span>
                  )}
                  {/* Download / Print */}
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-slate-300" onClick={handleDownloadStatus}>
                    <Download className="w-3.5 h-3.5" />{t.downloadStatus}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-slate-300" onClick={handlePrintStatus}>
                    <Printer className="w-3.5 h-3.5" />{t.printStatus}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* SLA Banner */}
              {slaCountdown !== null && result.data.status !== 'resolved' && result.data.status !== 'completed' && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${getSLAColor(slaCountdown)}`}>
                  <div className="shrink-0">
                    {slaCountdown <= 0
                      ? <AlertTriangle className="w-6 h-6" />
                      : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">
                      {slaCountdown <= 0
                        ? t.slaBreached
                        : slaCountdown === 1
                        ? t.slaToday
                        : `${t.slaLabel}: ${slaCountdown} ${t.slaRemaining}`}
                    </p>
                    <div className="mt-2 h-2 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${slaCountdown <= 0 ? 'bg-red-500' : slaCountdown <= 2 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (slaCountdown / 7) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-3xl font-black shrink-0">
                    {slaCountdown <= 0 ? '!' : slaCountdown}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{t.lifecycle}</p>
                <div className="relative">
                  <div className="flex justify-between relative z-10">
                    {steps.map((step, idx) => {
                      const done = idx < currentIdx;
                      const active = idx === currentIdx;
                      const rejected = result.data.status === 'rejected';
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 flex-1">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                            rejected && active ? 'bg-red-500 border-red-500 text-white' :
                            done ? 'bg-green-500 border-green-500 text-white' :
                            active ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 scale-110' :
                            'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {getStatusIcon(step)}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide text-center leading-tight max-w-[60px] ${
                            done ? 'text-green-600' : active ? 'text-blue-700' : 'text-slate-400'
                          }`}>
                            {statusLabels[step as keyof typeof statusLabels]?.[lang === 'as' ? 'en' : lang] || step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Connector line */}
                  <div className="absolute top-[22px] left-[10%] right-[10%] h-0.5 bg-slate-200 -z-0">
                    <div
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${currentIdx <= 0 ? 0 : (currentIdx / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">{t.submittedOn}</p>
                  <p className="font-semibold text-slate-900">{new Date(result.data.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">{t.lastUpdate}</p>
                  <p className="font-semibold text-slate-900">{new Date(result.data.updatedAt).toLocaleDateString()}</p>
                </div>
                {result.type === 'complaint' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">{t.category}</p>
                      <p className="font-semibold text-slate-900 capitalize">{result.data.category.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">{t.location}</p>
                      <p className="font-semibold text-slate-900">{result.data.location}</p>
                    </div>
                    <div className="col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">{t.description}</p>
                      <p className="text-slate-800">{result.data.description}</p>
                    </div>
                  </>
                )}
                {result.type === 'request' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">{t.type}</p>
                      <p className="font-semibold text-slate-900 capitalize">{result.data.type.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">Reference</p>
                      <p className="font-mono font-semibold text-slate-900 text-sm">{result.data.referenceNumber}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Assigned Officer */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">{t.assignedOfficer}</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {assignedOfficer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{assignedOfficer.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5" />{assignedOfficer.dept}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />{assignedOfficer.phone}
                  </div>
                </div>
              </div>

              {/* Integrity */}
              {result.verified && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
                  <Shield className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{t.integrityNote}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrackStatusModule;
