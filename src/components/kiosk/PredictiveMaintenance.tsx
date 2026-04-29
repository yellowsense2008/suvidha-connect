import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, CheckCircle, Zap, Droplets, Flame, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PredictiveMaintenanceProps { onBack: () => void; }

const PREDICTIONS = [
  { id: 'P1', sector: 'Sector 5', type: 'electricity', issue: 'Transformer Overload Risk', probability: 87, complaints: 8, trend: 'rising', timeframe: '48 hours', action: 'Preventive maintenance ticket auto-generated', status: 'active', color: 'red' },
  { id: 'P2', sector: 'Sector 3', type: 'water', issue: 'Pipeline Pressure Drop', probability: 73, complaints: 5, trend: 'rising', timeframe: '72 hours', action: 'Inspection team scheduled', status: 'scheduled', color: 'blue' },
  { id: 'P3', sector: 'Sector 9', type: 'gas', issue: 'Gas Pressure Irregularity', probability: 65, complaints: 4, trend: 'stable', timeframe: '5 days', action: 'Monitoring in progress', status: 'monitoring', color: 'orange' },
  { id: 'P4', sector: 'Sector 7', type: 'electricity', issue: 'Streetlight Grid Failure', probability: 91, complaints: 12, trend: 'critical', timeframe: '24 hours', action: 'Emergency team dispatched', status: 'critical', color: 'red' },
];

const TREND_DATA = [
  { day: 'Mon', complaints: 3, predicted: 4 },
  { day: 'Tue', complaints: 5, predicted: 6 },
  { day: 'Wed', complaints: 4, predicted: 5 },
  { day: 'Thu', complaints: 8, predicted: 9 },
  { day: 'Fri', complaints: 12, predicted: 14 },
  { day: 'Sat', complaints: 9, predicted: 11 },
  { day: 'Today', complaints: 15, predicted: 18 },
];

const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({ onBack }) => {
  const { language } = useAuth();
  const [autoTickets, setAutoTickets] = useState(2);
  const [lastScan, setLastScan] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastScan(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    critical: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' },
    active: { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
    scheduled: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    monitoring: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  };

  const typeIcon = { electricity: Zap, water: Droplets, gas: Flame };

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            Predictive Maintenance AI
          </h2>
          <p className="text-slate-500 text-sm">Pattern analysis across {PREDICTIONS.reduce((s, p) => s + p.complaints, 0)} complaints — auto-generating preventive tickets</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Last scan: {lastScan.toLocaleTimeString()}</p>
          <p className="text-green-600 font-medium">● Live monitoring</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Predictions Active', value: PREDICTIONS.length, icon: Brain, color: 'text-purple-600 bg-purple-50' },
          { label: 'Critical Alerts', value: PREDICTIONS.filter(p => p.status === 'critical').length, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'Auto Tickets Created', value: autoTickets, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Complaints Analyzed', value: PREDICTIONS.reduce((s, p) => s + p.complaints, 0), icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="border-slate-200 mb-6 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Complaint Trend vs AI Prediction (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={TREND_DATA}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} name="Actual Complaints" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="AI Predicted" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-400 text-center mt-1">— Actual &nbsp;&nbsp; - - - AI Predicted</p>
        </CardContent>
      </Card>

      {/* Predictions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Active Predictions
        </h3>
        {PREDICTIONS.map(pred => {
          const Icon = typeIcon[pred.type as keyof typeof typeIcon] || Zap;
          const sc = statusConfig[pred.status as keyof typeof statusConfig];
          return (
            <Card key={pred.id} className={`border-2 shadow-sm ${pred.status === 'critical' ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pred.type === 'electricity' ? 'bg-yellow-50 text-yellow-600' : pred.type === 'water' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-900">{pred.sector} — {pred.issue}</p>
                      <Badge className={`text-xs border ${sc.color} flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {pred.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{pred.complaints} complaints triggered this</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Predicted within {pred.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className={`rounded-full h-2 transition-all ${pred.probability > 85 ? 'bg-red-500' : pred.probability > 70 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                          style={{ width: `${pred.probability}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${pred.probability > 85 ? 'text-red-600' : 'text-orange-600'}`}>{pred.probability}%</span>
                    </div>
                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {pred.action}
                    </p>
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

export default PredictiveMaintenance;
