import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CreditCard, MessageSquareWarning, Users, IndianRupee, Activity, Zap, Droplets, Flame } from 'lucide-react';

interface LiveKioskTickerProps { compact?: boolean; }

const LiveKioskTicker: React.FC<LiveKioskTickerProps> = ({ compact = false }) => {
  const [stats, setStats] = useState({
    billsPaid: 47, complaintsField: 12, revenue: 124500,
    activeUsers: 3, totalCitizens: 1247, resolvedToday: 8,
    electricity: 28, gas: 11, water: 8,
  });
  const [pulse, setPulse] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate live updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
      setLastUpdate(new Date());
      setStats(prev => ({
        ...prev,
        billsPaid: prev.billsPaid + Math.floor(Math.random() * 2),
        complaintsField: prev.complaintsField + (Math.random() > 0.7 ? 1 : 0),
        revenue: prev.revenue + Math.floor(Math.random() * 3000),
        activeUsers: Math.max(1, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1)),
        resolvedToday: prev.resolvedToday + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-6 text-xs overflow-hidden">
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </span>
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          <span>📊 Today: {stats.billsPaid} bills paid</span>
          <span>💰 ₹{(stats.revenue / 1000).toFixed(1)}K collected</span>
          <span>📝 {stats.complaintsField} complaints filed</span>
          <span>✅ {stats.resolvedToday} resolved</span>
          <span>👥 {stats.activeUsers} active now</span>
          <span>⚡ {stats.electricity} electricity | 🔥 {stats.gas} gas | 💧 {stats.water} water</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${pulse ? 'scale-[1.01]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Live Kiosk Activity
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Updated {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: CreditCard, label: 'Bills Paid Today', value: stats.billsPaid, color: 'text-blue-600 bg-blue-50', suffix: '' },
          { icon: IndianRupee, label: 'Revenue Collected', value: `₹${(stats.revenue / 1000).toFixed(1)}K`, color: 'text-green-600 bg-green-50', suffix: '' },
          { icon: MessageSquareWarning, label: 'Complaints Filed', value: stats.complaintsField, color: 'text-orange-600 bg-orange-50', suffix: '' },
          { icon: TrendingUp, label: 'Resolved Today', value: stats.resolvedToday, color: 'text-purple-600 bg-purple-50', suffix: '' },
          { icon: Users, label: 'Active Right Now', value: stats.activeUsers, color: 'text-red-600 bg-red-50', suffix: '' },
          { icon: Users, label: 'Total Citizens', value: stats.totalCitizens.toLocaleString(), color: 'text-slate-600 bg-slate-50', suffix: '' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Zap, label: 'Electricity', value: stats.electricity, color: 'bg-yellow-500' },
          { icon: Flame, label: 'Gas', value: stats.gas, color: 'bg-orange-500' },
          { icon: Droplets, label: 'Water', value: stats.water, color: 'bg-blue-500' },
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
            <item.icon className="w-5 h-5 mx-auto mb-1 text-slate-600" />
            <p className="text-xl font-bold text-slate-900">{item.value}</p>
            <p className="text-[10px] text-slate-500">{item.label} bills</p>
            <div className="mt-1 bg-slate-200 rounded-full h-1">
              <div className={`${item.color} rounded-full h-1`} style={{ width: `${(item.value / stats.billsPaid) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveKioskTicker;
