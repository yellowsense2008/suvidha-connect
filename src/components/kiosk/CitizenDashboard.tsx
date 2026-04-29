import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft, Zap, Droplets, Flame, CreditCard, MessageSquareWarning,
  FilePlus, Search, Clock, CheckCircle, AlertCircle, XCircle,
  TrendingDown, TrendingUp, Leaf, Trophy, WifiOff, RefreshCw,
  Bell, User, Inbox
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface CitizenDashboardProps {
  onBack: () => void;
  onModuleSelect?: (m: string) => void;
}

const consumptionData = [
  { month: 'Sep', elec: 280, water: 48, gas: 10 },
  { month: 'Oct', elec: 310, water: 52, gas: 11 },
  { month: 'Nov', elec: 260, water: 46, gas: 13 },
  { month: 'Dec', elec: 290, water: 49, gas: 15 },
  { month: 'Jan', elec: 245, water: 50, gas: 12 },
  { month: 'Feb', elec: 220, water: 47, gas: 11 },
];

const STATUS_ICON: Record<string, React.ReactNode> = {
  pending:      <Clock className="w-4 h-4 text-yellow-500" />,
  submitted:    <Clock className="w-4 h-4 text-yellow-500" />,
  under_review: <AlertCircle className="w-4 h-4 text-blue-500" />,
  in_progress:  <RefreshCw className="w-4 h-4 text-blue-500" />,
  resolved:     <CheckCircle className="w-4 h-4 text-green-500" />,
  completed:    <CheckCircle className="w-4 h-4 text-green-500" />,
  approved:     <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected:     <XCircle className="w-4 h-4 text-red-500" />,
  paid:         <CheckCircle className="w-4 h-4 text-green-500" />,
  overdue:      <AlertCircle className="w-4 h-4 text-red-500" />,
};

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
};

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ onBack, onModuleSelect }) => {
  const { language, citizen } = useAuth();
  const { bills, complaints, serviceRequests } = useKiosk();
  const { isOnline, queueCount, syncNow, isSyncing } = useOfflineQueue();

  const lang = (language as 'en' | 'hi' | 'as');

  const tx = {
    en: {
      title: 'My Dashboard', sub: 'Welcome back',
      pendingBills: 'Pending Bills', totalDue: 'Total Due',
      myComplaints: 'My Complaints', myRequests: 'My Requests',
      quickActions: 'Quick Actions',
      payBill: 'Pay Bill', newComplaint: 'New Complaint',
      newService: 'New Service', trackStatus: 'Track Status',
      consumption: '6-Month Consumption', noBills: 'No pending bills',
      noComplaints: 'No complaints filed', noRequests: 'No requests submitted',
      carbonSaved: 'CO₂ Saved', points: 'Civic Points',
      offlineQueue: 'Offline Queue', syncNow: 'Sync Now',
      elec: 'Electricity', gas: 'Gas', water: 'Water',
      units: 'units', due: 'Due', overdue: 'OVERDUE',
      viewAll: 'View All',
    },
    hi: {
      title: 'मेरा डैशबोर्ड', sub: 'वापस स्वागत है',
      pendingBills: 'लंबित बिल', totalDue: 'कुल देय',
      myComplaints: 'मेरी शिकायतें', myRequests: 'मेरे अनुरोध',
      quickActions: 'त्वरित क्रियाएं',
      payBill: 'बिल भुगतान', newComplaint: 'नई शिकायत',
      newService: 'नई सेवा', trackStatus: 'स्थिति ट्रैक',
      consumption: '6 माह उपभोग', noBills: 'कोई लंबित बिल नहीं',
      noComplaints: 'कोई शिकायत नहीं', noRequests: 'कोई अनुरोध नहीं',
      carbonSaved: 'CO₂ बचाया', points: 'नागरिक अंक',
      offlineQueue: 'ऑफलाइन कतार', syncNow: 'अभी सिंक करें',
      elec: 'बिजली', gas: 'गैस', water: 'पानी',
      units: 'यूनिट', due: 'देय', overdue: 'अतिदेय',
      viewAll: 'सभी देखें',
    },
    as: {
      title: 'মোৰ ডেশ্ববৰ্ড', sub: 'পুনৰ স্বাগতম',
      pendingBills: 'বকেয়া বিল', totalDue: 'মুঠ বকেয়া',
      myComplaints: 'মোৰ অভিযোগ', myRequests: 'মোৰ অনুৰোধ',
      quickActions: 'দ্ৰুত কাৰ্য',
      payBill: 'বিল পৰিশোধ', newComplaint: 'নতুন অভিযোগ',
      newService: 'নতুন সেৱা', trackStatus: 'স্থিতি ট্ৰেক',
      consumption: '৬ মাহৰ ব্যৱহাৰ', noBills: 'কোনো বকেয়া বিল নাই',
      noComplaints: 'কোনো অভিযোগ নাই', noRequests: 'কোনো অনুৰোধ নাই',
      carbonSaved: 'CO₂ ৰক্ষা', points: 'নাগৰিক পইণ্ট',
      offlineQueue: 'অফলাইন কিউ', syncNow: 'এতিয়াই সিংক',
      elec: 'বিদ্যুৎ', gas: 'গেছ', water: 'পানী',
      units: 'ইউনিট', due: 'বকেয়া', overdue: 'অতিদেয়',
      viewAll: 'সকলো চাওক',
    },
  };
  const t = tx[lang] ?? tx.en;

  const pendingBills = bills.filter(b => b.status !== 'paid');
  const totalDue = pendingBills.reduce((s, b) => s + b.amount, 0);
  const carbonKg = Math.round(consumptionData[consumptionData.length - 1].elec * 0.82);
  const carbonGood = carbonKg < 220;

  const quickActions = [
    { id: 'bills', icon: CreditCard, label: t.payBill, color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
    { id: 'complaint', icon: MessageSquareWarning, label: t.newComplaint, color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
    { id: 'newService', icon: FilePlus, label: t.newService, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { id: 'track', icon: Search, label: t.trackStatus, color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  ];

  const getTypeLabel = (type: string) => {
    const map: Record<string, Record<string, string>> = {
      electricity: { en: 'Electricity', hi: 'बिजली', as: 'বিদ্যুৎ' },
      gas: { en: 'Gas', hi: 'गैस', as: 'গেছ' },
      water: { en: 'Water', hi: 'पानी', as: 'পানী' },
    };
    return map[type]?.[lang] ?? type;
  };

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
            <p className="text-slate-500">{t.sub}, <span className="font-semibold text-blue-700">{citizen?.name}</span></p>
          </div>
        </div>
        {/* Offline badge */}
        {(!isOnline || queueCount > 0) && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${!isOnline ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Inbox className="w-4 h-4" />}
            {!isOnline ? 'Offline' : `${queueCount} ${t.offlineQueue}`}
            {isOnline && queueCount > 0 && (
              <Button size="sm" className="h-6 px-2 text-xs ml-1 bg-amber-600 hover:bg-amber-700 text-white border-0" onClick={syncNow} disabled={isSyncing}>
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : t.syncNow}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Due */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
          <CardContent className="p-5">
            <p className="text-orange-100 text-sm font-medium mb-1">{t.totalDue}</p>
            <p className="text-3xl font-bold">₹{totalDue.toLocaleString('en-IN')}</p>
            <p className="text-orange-100 text-xs mt-1">{pendingBills.length} {t.pendingBills}</p>
          </CardContent>
        </Card>
        {/* Complaints */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
          <CardContent className="p-5">
            <p className="text-blue-100 text-sm font-medium mb-1">{t.myComplaints}</p>
            <p className="text-3xl font-bold">{complaints.length}</p>
            <p className="text-blue-100 text-xs mt-1">{complaints.filter(c => c.status === 'pending' || c.status === 'under_review').length} active</p>
          </CardContent>
        </Card>
        {/* Carbon */}
        <Card className={`border shadow-lg ${carbonGood ? 'border-green-200 bg-gradient-to-br from-green-500 to-emerald-600' : 'border-orange-200 bg-gradient-to-br from-orange-400 to-orange-500'} text-white`}>
          <CardContent className="p-5">
            <p className="text-white/80 text-sm font-medium mb-1">{t.carbonSaved}</p>
            <p className="text-3xl font-bold">{carbonKg}<span className="text-lg font-normal ml-1">kg</span></p>
            <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
              {carbonGood ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {carbonGood ? 'Below avg ✓' : 'Above avg'}
            </p>
          </CardContent>
        </Card>
        {/* Points */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="p-5">
            <p className="text-purple-100 text-sm font-medium mb-1">{t.points}</p>
            <p className="text-3xl font-bold">{citizen?.points ?? 0}</p>
            <p className="text-purple-100 text-xs mt-1 flex items-center gap-1"><Trophy className="w-3 h-3" /> Civic Hero</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{t.quickActions}</p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(a => (
            <button
              key={a.id}
              onClick={() => onModuleSelect?.(a.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-[1.03] active:scale-95 ${a.color}`}
            >
              <a.icon className="w-7 h-7" />
              <span className="text-sm font-semibold text-center leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Bills */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />{t.pendingBills}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7" onClick={() => onModuleSelect?.('bills')}>
              {t.viewAll}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBills.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p className="text-sm">{t.noBills}</p>
              </div>
            ) : pendingBills.map(bill => {
              const icons = { electricity: Zap, gas: Flame, water: Droplets };
              const Icon = icons[bill.type as keyof typeof icons] ?? Zap;
              const colors = { electricity: 'text-yellow-600 bg-yellow-50', gas: 'text-orange-600 bg-orange-50', water: 'text-blue-600 bg-blue-50' };
              const c = colors[bill.type as keyof typeof colors] ?? 'text-slate-600 bg-slate-50';
              return (
                <div key={bill.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{getTypeLabel(bill.type)}</p>
                    <p className="text-xs text-slate-500">{t.due}: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">₹{bill.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLOR[bill.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {bill.status === 'overdue' ? t.overdue : bill.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Consumption Chart */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />{t.consumption}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={consumptionData}>
                <defs>
                  <linearGradient id="elecG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="elec" stroke="#3b82f6" fill="url(#elecG)" strokeWidth={2} name="Electricity (units)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Complaints */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-red-500" />{t.myComplaints}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7" onClick={() => onModuleSelect?.('complaint')}>
              {t.viewAll}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.noComplaints}</p>
              </div>
            ) : complaints.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5">{STATUS_ICON[c.status] ?? <Clock className="w-4 h-4 text-slate-400" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm capitalize">{c.category.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500 truncate">{c.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{c.id}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[c.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {c.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Service Requests */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-blue-500" />{t.myRequests}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7" onClick={() => onModuleSelect?.('track')}>
              {t.viewAll}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {serviceRequests.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <FilePlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t.noRequests}</p>
              </div>
            ) : serviceRequests.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5">{STATUS_ICON[r.status] ?? <Clock className="w-4 h-4 text-slate-400" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm capitalize">{r.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-mono text-slate-400">{r.referenceNumber}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_COLOR[r.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {r.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard;
