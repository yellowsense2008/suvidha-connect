import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, AlertTriangle, TrendingUp, CheckCircle, User, Building2, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface EscalationTimerProps { onBack: () => void; }

const MOCK_COMPLAINTS = [
  { id: 'COMP001', category: 'Power Outage', location: 'Sector 5, Block A', status: 'in_progress', slaHours: 24, elapsedHours: 26, officer: 'Er. Suresh Baruah', dept: 'APDCL Field Ops', level: 1, escalatedTo: 'Divisional Manager' },
  { id: 'COMP002', category: 'Water Supply', location: 'Sector 3, Colony B', status: 'pending', slaHours: 72, elapsedHours: 48, officer: 'JE Bikash Nath', dept: 'GMC Water Dept', level: 0, escalatedTo: null },
  { id: 'COMP003', category: 'Gas Leakage', location: 'Sector 9, Market', status: 'escalated', slaHours: 24, elapsedHours: 52, officer: 'Insp. Mridul Hazarika', dept: 'Assam Gas Co.', level: 2, escalatedTo: 'Regional Director' },
  { id: 'COMP004', category: 'Streetlight', location: 'Sector 7, Main Road', status: 'resolved', slaHours: 168, elapsedHours: 72, officer: 'JE Sanjay Das', dept: 'GMC Electrical', level: 0, escalatedTo: null },
];

const ESCALATION_CHAIN = [
  { level: 0, title: 'Field Officer', icon: User },
  { level: 1, title: 'Divisional Manager', icon: Building2 },
  { level: 2, title: 'Regional Director', icon: TrendingUp },
  { level: 3, title: 'Commissioner', icon: ChevronUp },
];

const EscalationTimer: React.FC<EscalationTimerProps> = ({ onBack }) => {
  const { language } = useAuth();
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [tick, setTick] = useState(0);

  // Live countdown tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (slaHours: number, elapsedHours: number) => {
    const remainingHours = slaHours - elapsedHours;
    if (remainingHours <= 0) return { text: `Overdue by ${Math.abs(remainingHours)}h`, overdue: true, pct: 100 };
    const pct = (elapsedHours / slaHours) * 100;
    return { text: `${remainingHours}h remaining`, overdue: false, pct };
  };

  const handleEscalate = (id: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newLevel = Math.min(c.level + 1, 3);
      const chain = ESCALATION_CHAIN[newLevel];
      toast.success(`Escalated to ${chain.title}!`);
      return { ...c, level: newLevel, status: 'escalated', escalatedTo: chain.title };
    }));
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    escalated: 'bg-red-100 text-red-700 border-red-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-500" />
            {language === 'hi' ? 'शिकायत एस्केलेशन ट्रैकर' : language === 'as' ? 'অভিযোগ এস্কেলেচন ট্ৰেকাৰ' : 'Complaint Escalation Tracker'}
          </h2>
          <p className="text-slate-500 text-sm">
            {language === 'hi' ? 'SLA उल्लंघन पर स्वचालित एस्केलेशन' : 'Auto-escalation on SLA breach — real-time accountability'}
          </p>
        </div>
      </div>

      {/* Escalation Chain Visual */}
      <Card className="border-slate-200 mb-6 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Escalation Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {ESCALATION_CHAIN.map((level, i) => (
              <React.Fragment key={level.level}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${i === 0 ? 'bg-blue-100 border-blue-400 text-blue-600' : i === 1 ? 'bg-orange-100 border-orange-400 text-orange-600' : i === 2 ? 'bg-red-100 border-red-400 text-red-600' : 'bg-purple-100 border-purple-400 text-purple-600'}`}>
                    <level.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 text-center max-w-[70px] leading-tight">{level.title}</span>
                  <span className="text-[10px] text-slate-400">Level {level.level}</span>
                </div>
                {i < ESCALATION_CHAIN.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-300 to-orange-300 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complaints with timers */}
      <div className="space-y-4">
        {complaints.map(complaint => {
          const time = getTimeRemaining(complaint.slaHours, complaint.elapsedHours);
          const currentLevel = ESCALATION_CHAIN[complaint.level];
          return (
            <Card key={complaint.id} className={`border-2 shadow-sm transition-all ${time.overdue && complaint.status !== 'resolved' ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-slate-900">{complaint.category}</span>
                      <Badge className={`text-xs border ${statusColor[complaint.status as keyof typeof statusColor]}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {complaint.escalatedTo && (
                        <Badge className="text-xs bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Escalated to {complaint.escalatedTo}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-1">{complaint.location} • {complaint.id}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <User className="w-3 h-3" /> {complaint.officer} — {complaint.dept}
                    </p>

                    {/* SLA Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">SLA: {complaint.slaHours}h</span>
                        <span className={`font-bold ${time.overdue ? 'text-red-600' : time.pct > 75 ? 'text-orange-600' : 'text-green-600'}`}>
                          {time.text}
                        </span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div className={`h-3 rounded-full transition-all duration-1000 ${time.overdue ? 'bg-red-500 animate-pulse' : time.pct > 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, time.pct)}%` }} />
                      </div>
                    </div>

                    {/* Escalation chain progress */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-slate-500">Current Level:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${complaint.level === 0 ? 'bg-blue-100 text-blue-700' : complaint.level === 1 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {currentLevel.title}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {complaint.status === 'resolved' ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-5 h-5" /> Resolved
                      </div>
                    ) : time.overdue && complaint.level < 3 ? (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1 animate-pulse"
                        onClick={() => handleEscalate(complaint.id)}>
                        <AlertTriangle className="w-4 h-4" /> Escalate
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 text-center block">Monitoring</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EscalationTimer;
