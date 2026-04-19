import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Droplets, Flame, MapPin, AlertTriangle, RefreshCw, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OutageZone {
  id: string;
  sector: string;
  type: 'electricity' | 'water' | 'gas';
  severity: 'low' | 'medium' | 'high';
  reports: number;
  since: string;
  status: 'active' | 'resolving' | 'resolved';
  estimatedFix: string;
}

const MOCK_OUTAGES: OutageZone[] = [
  { id: 'O1', sector: 'Sector 5, Block A', type: 'electricity', severity: 'high', reports: 47, since: '2h ago', status: 'active', estimatedFix: '4:00 PM' },
  { id: 'O2', sector: 'Sector 7, Market Area', type: 'water', severity: 'medium', reports: 23, since: '45m ago', status: 'resolving', estimatedFix: '2:30 PM' },
  { id: 'O3', sector: 'Sector 3, Residential', type: 'gas', severity: 'low', reports: 8, since: '3h ago', status: 'active', estimatedFix: 'Tomorrow 9 AM' },
  { id: 'O4', sector: 'Sector 9, Commercial', type: 'electricity', severity: 'medium', reports: 31, since: '1h ago', status: 'resolving', estimatedFix: '3:00 PM' },
  { id: 'O5', sector: 'Sector 2, Colony B', type: 'water', severity: 'high', reports: 62, since: '4h ago', status: 'active', estimatedFix: '6:00 PM' },
];

interface OutageHeatmapProps { onBack: () => void; }

const OutageHeatmap: React.FC<OutageHeatmapProps> = ({ onBack }) => {
  const { language } = useAuth();
  const [outages, setOutages] = useState<OutageZone[]>(MOCK_OUTAGES);
  const [filter, setFilter] = useState<'all' | 'electricity' | 'water' | 'gas'>('all');
  const [reporting, setReporting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [userReported, setUserReported] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Live Outage Map',
      subtitle: 'Real-time crowd-sourced utility disruptions',
      all: 'All', electricity: 'Electricity', water: 'Water', gas: 'Gas',
      active: 'Active', resolving: 'Resolving', resolved: 'Resolved',
      reports: 'reports', since: 'Since', estimatedFix: 'Est. Fix',
      reportOutage: 'Report Outage in My Area',
      reporting: 'Reporting...',
      reported: 'Reported! Thank you',
      refresh: 'Refresh',
      totalAffected: 'Total Affected Areas',
      highSeverity: 'High Severity',
      lastUpdated: 'Last updated',
      noOutages: 'No active outages in this category',
    },
    hi: {
      title: 'लाइव आउटेज मैप',
      subtitle: 'रियल-टाइम भीड़-स्रोत उपयोगिता व्यवधान',
      all: 'सभी', electricity: 'बिजली', water: 'पानी', gas: 'गैस',
      active: 'सक्रिय', resolving: 'समाधान हो रहा', resolved: 'समाधान',
      reports: 'रिपोर्ट', since: 'से', estimatedFix: 'अनुमानित समाधान',
      reportOutage: 'मेरे क्षेत्र में आउटेज रिपोर्ट करें',
      reporting: 'रिपोर्ट हो रहा है...',
      reported: 'रिपोर्ट किया! धन्यवाद',
      refresh: 'रिफ्रेश',
      totalAffected: 'कुल प्रभावित क्षेत्र',
      highSeverity: 'उच्च गंभीरता',
      lastUpdated: 'अंतिम अपडेट',
      noOutages: 'इस श्रेणी में कोई सक्रिय आउटेज नहीं',
    }
  };
  const tx = t[language as 'en' | 'hi'] || t.en;

  const filtered = filter === 'all' ? outages : outages.filter(o => o.type === filter);
  const highCount = outages.filter(o => o.severity === 'high' && o.status === 'active').length;

  const typeIcon = { electricity: Zap, water: Droplets, gas: Flame };
  const typeColor = { electricity: 'text-yellow-600 bg-yellow-50 border-yellow-200', water: 'text-blue-600 bg-blue-50 border-blue-200', gas: 'text-orange-600 bg-orange-50 border-orange-200' };
  const severityColor = { high: 'bg-red-500', medium: 'bg-orange-400', low: 'bg-yellow-400' };
  const statusColor = { active: 'bg-red-100 text-red-700 border-red-200', resolving: 'bg-yellow-100 text-yellow-700 border-yellow-200', resolved: 'bg-green-100 text-green-700 border-green-200' };

  const handleReport = () => {
    setReporting(true);
    setTimeout(() => {
      // Add user's report to the nearest outage
      setOutages(prev => prev.map((o, i) => i === 0 ? { ...o, reports: o.reports + 1 } : o));
      setReporting(false);
      setUserReported('O1');
      toast.success(tx.reported);
    }, 1500);
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // Simulate live update
    setOutages(prev => prev.map(o => ({ ...o, reports: o.reports + Math.floor(Math.random() * 3) })));
    toast.success('Data refreshed');
  };

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {tx.title}
            <span className="flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
          </h2>
          <p className="text-slate-500 text-sm">{tx.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />{tx.refresh}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-900">{outages.filter(o => o.status === 'active').length}</p>
            <p className="text-xs text-slate-500 mt-1">{tx.active} Outages</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{highCount}</p>
            <p className="text-xs text-slate-500 mt-1">{tx.highSeverity}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{outages.reduce((s, o) => s + o.reports, 0)}</p>
            <p className="text-xs text-slate-500 mt-1">Citizen Reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Heatmap Grid */}
      <Card className="border-slate-200 mb-6 overflow-hidden">
        <div className="bg-slate-800 p-4">
          <p className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-400" /> City Grid — Live Status
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 15 }, (_, i) => {
              const sectorNum = i + 1;
              const outage = outages.find(o => o.sector.includes(`Sector ${sectorNum}`));
              const color = outage
                ? outage.severity === 'high' ? 'bg-red-500 animate-pulse'
                : outage.severity === 'medium' ? 'bg-orange-400'
                : 'bg-yellow-400'
                : 'bg-green-500/40';
              return (
                <div key={i} className={`${color} rounded-lg p-3 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                  title={outage ? `${outage.sector}: ${outage.type} outage` : `Sector ${sectorNum}: Normal`}>
                  <p className="text-white text-xs font-bold">S{sectorNum}</p>
                  {outage && <p className="text-white text-[9px] mt-0.5">{outage.reports}⚠</p>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/40 inline-block" /> Normal</span>
          </div>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'electricity', 'water', 'gas'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)} className="capitalize">
            {tx[f]}
          </Button>
        ))}
      </div>

      {/* Outage List */}
      <div className="space-y-3 mb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>{tx.noOutages}</p>
          </div>
        ) : filtered.map(outage => {
          const Icon = typeIcon[outage.type];
          return (
            <Card key={outage.id} className={`border ${outage.status === 'active' && outage.severity === 'high' ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${typeColor[outage.type]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-slate-900">{outage.sector}</p>
                      <Badge className={`text-xs border ${statusColor[outage.status]}`}>{tx[outage.status]}</Badge>
                      <span className={`w-2 h-2 rounded-full ${severityColor[outage.severity]}`} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{outage.reports} {tx.reports}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tx.since} {outage.since}</span>
                      <span className="text-blue-600 font-medium">{tx.estimatedFix}: {outage.estimatedFix}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Button */}
      <Button
        className={`w-full h-14 text-lg shadow-lg ${userReported ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
        onClick={handleReport}
        disabled={reporting || !!userReported}
      >
        {reporting ? <><RefreshCw className="w-5 h-5 animate-spin mr-2" />{tx.reporting}</>
          : userReported ? <><AlertTriangle className="w-5 h-5 mr-2" />{tx.reported}</>
          : <><AlertTriangle className="w-5 h-5 mr-2" />{tx.reportOutage}</>}
      </Button>
      <p className="text-center text-xs text-slate-400 mt-2">{tx.lastUpdated}: {lastRefresh.toLocaleTimeString()}</p>
    </div>
  );
};

export default OutageHeatmap;
