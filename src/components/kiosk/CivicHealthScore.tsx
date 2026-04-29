import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, TrendingUp, TrendingDown, Minus, Zap, Droplets, Flame, Trash2, Activity } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CivicHealthScoreProps { onBack: () => void; }

const SECTORS = [
  { id: 'S1', name: 'Sector 5', score: 87, trend: 'up', electricity: 92, water: 85, gas: 88, sanitation: 83, complaints: 3, resolved: 12, billRate: 94 },
  { id: 'S2', name: 'Sector 3', score: 72, trend: 'down', electricity: 78, water: 65, gas: 80, sanitation: 65, complaints: 8, resolved: 6, billRate: 78 },
  { id: 'S3', name: 'Sector 7', score: 91, trend: 'up', electricity: 95, water: 90, gas: 92, sanitation: 87, complaints: 1, resolved: 15, billRate: 97 },
  { id: 'S4', name: 'Sector 9', score: 54, trend: 'down', electricity: 45, water: 60, gas: 55, sanitation: 56, complaints: 15, resolved: 4, billRate: 62 },
  { id: 'S5', name: 'Sector 2', score: 79, trend: 'stable', electricity: 82, water: 78, gas: 79, sanitation: 77, complaints: 5, resolved: 9, billRate: 85 },
  { id: 'S6', name: 'Sector 6', score: 65, trend: 'up', electricity: 70, water: 62, gas: 68, sanitation: 60, complaints: 9, resolved: 7, billRate: 71 },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50 border-green-200', label: 'Excellent' };
  if (score >= 70) return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50 border-blue-200', label: 'Good' };
  if (score >= 55) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50 border-yellow-200', label: 'Average' };
  return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50 border-red-200', label: 'Poor' };
};

const CivicHealthScore: React.FC<CivicHealthScoreProps> = ({ onBack }) => {
  const [selected, setSelected] = useState(SECTORS[0]);

  const radarData = [
    { subject: 'Electricity', value: selected.electricity },
    { subject: 'Water', value: selected.water },
    { subject: 'Gas', value: selected.gas },
    { subject: 'Sanitation', value: selected.sanitation },
    { subject: 'Bill Rate', value: selected.billRate },
  ];

  const cityAvg = Math.round(SECTORS.reduce((s, sec) => s + sec.score, 0) / SECTORS.length);

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" /> Sector Civic Health Score
          </h2>
          <p className="text-slate-500 text-sm">City average: {cityAvg}/100 — Live monitoring across all sectors</p>
        </div>
      </div>

      {/* City Grid Heatmap */}
      <Card className="border-slate-200 mb-6 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" /> City Health Map — Click a sector to drill down
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {SECTORS.map(sector => {
              const sc = getScoreColor(sector.score);
              const isSelected = selected.id === sector.id;
              return (
                <button key={sector.id} onClick={() => setSelected(sector)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'} ${sc.light}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">{sector.name}</span>
                    <div className="flex items-center gap-1">
                      {sector.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : sector.trend === 'down' ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black ${sc.text}`}>{sector.score}</span>
                    <span className="text-slate-400 text-sm mb-1">/100</span>
                  </div>
                  <div className="mt-2 bg-white/60 rounded-full h-2">
                    <div className={`${sc.bg} rounded-full h-2 transition-all`} style={{ width: `${sector.score}%` }} />
                  </div>
                  <Badge className={`mt-2 text-xs ${sc.light} border`}>{sc.label}</Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Drill Down */}
      <div className="grid grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{selected.name} — Service Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name={selected.name} dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">{selected.name} — Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Zap, label: 'Electricity Score', value: selected.electricity, color: 'text-yellow-600' },
              { icon: Droplets, label: 'Water Score', value: selected.water, color: 'text-blue-600' },
              { icon: Flame, label: 'Gas Score', value: selected.gas, color: 'text-orange-600' },
              { icon: Trash2, label: 'Sanitation Score', value: selected.sanitation, color: 'text-green-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-800">{item.value}</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-1.5">
                    <div className={`${item.color.replace('text', 'bg')} rounded-full h-1.5`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                <p className="text-xl font-bold text-red-600">{selected.complaints}</p>
                <p className="text-[10px] text-slate-500">Open</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                <p className="text-xl font-bold text-green-600">{selected.resolved}</p>
                <p className="text-[10px] text-slate-500">Resolved</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                <p className="text-xl font-bold text-blue-600">{selected.billRate}%</p>
                <p className="text-[10px] text-slate-500">Bill Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CivicHealthScore;
