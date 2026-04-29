import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Medal, Star, Zap, Leaf, Shield, TrendingUp, Crown, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number; name: string; sector: string;
  points: number; badges: string[]; trend: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Priya Sharma', sector: 'Sector 3', points: 2840, badges: ['🌱', '⚡', '🏆'], trend: 'up' },
  { rank: 2, name: 'Amit Das', sector: 'Sector 7', points: 2650, badges: ['💧', '🌱', '⭐'], trend: 'same' },
  { rank: 3, name: 'Sunita Bora', sector: 'Sector 5', points: 2410, badges: ['🏆', '⚡'], trend: 'up' },
  { rank: 4, name: 'Rajesh Kumar', sector: 'Sector 5', points: 1890, badges: ['⭐', '💧'], trend: 'up', isCurrentUser: true },
  { rank: 5, name: 'Mohan Kalita', sector: 'Sector 2', points: 1750, badges: ['🌱'], trend: 'down' },
  { rank: 6, name: 'Anita Gogoi', sector: 'Sector 8', points: 1620, badges: ['⚡', '⭐'], trend: 'up' },
  { rank: 7, name: 'Ranjit Nath', sector: 'Sector 4', points: 1480, badges: ['💧'], trend: 'same' },
  { rank: 8, name: 'Dipika Hazarika', sector: 'Sector 6', points: 1350, badges: ['🌱', '⭐'], trend: 'down' },
];

const ACHIEVEMENTS = [
  { id: 'green', icon: Leaf, label: 'Green Citizen', desc: 'Below city avg carbon footprint', color: 'text-green-600 bg-green-50 border-green-200', earned: true },
  { id: 'prompt', icon: Zap, label: 'Prompt Payer', desc: 'Paid 3 bills before due date', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', earned: true },
  { id: 'hero', icon: Shield, label: 'Civic Hero', desc: 'Filed 5+ complaints resolved', color: 'text-blue-600 bg-blue-50 border-blue-200', earned: false },
  { id: 'star', icon: Star, label: 'Star Citizen', desc: 'Top 10 in your sector', color: 'text-purple-600 bg-purple-50 border-purple-200', earned: true },
  { id: 'champion', icon: Crown, label: 'Ward Champion', desc: 'Top 3 in your ward', color: 'text-orange-600 bg-orange-50 border-orange-200', earned: false },
  { id: 'reporter', icon: Award, label: 'Issue Reporter', desc: 'Reported 10+ civic issues', color: 'text-red-600 bg-red-50 border-red-200', earned: false },
];

const HOW_TO_EARN = [
  { action: 'Pay bill on time', points: '+20 pts' },
  { action: 'File a complaint', points: '+30 pts' },
  { action: 'Complaint resolved', points: '+50 pts' },
  { action: 'Report outage', points: '+15 pts' },
  { action: 'Update profile', points: '+10 pts' },
  { action: 'Refer a neighbor', points: '+100 pts' },
];

interface CivicLeaderboardProps { onBack: () => void; }

const CivicLeaderboard: React.FC<CivicLeaderboardProps> = ({ onBack }) => {
  const { language, citizen } = useAuth();
  const [tab, setTab] = useState<'board' | 'achievements' | 'howto'>('board');

  const userEntry = LEADERBOARD.find(e => e.isCurrentUser);
  const userPoints = citizen?.points || 1890;

  // Fire confetti when leaderboard opens if user is in top 5
  useEffect(() => {
    if (userEntry && userEntry.rank <= 5) {
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 60, origin: { x: 0.5, y: 0.4 }, colors: ['#FF9933', '#FFFFFF', '#138808', '#3b82f6'] });
      }, 800);
    }
  }, []);

  const rankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-slate-300 text-slate-700';
    if (rank === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-slate-100 text-slate-600';
  };

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
    return <span className="w-3 h-3 text-slate-400 text-xs">—</span>;
  };

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Civic Leaderboard
          </h2>
          <p className="text-slate-500 text-sm">Earn points for civic participation</p>
        </div>
      </div>

      {/* User Rank Card */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-6 shadow-xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Your Rank</p>
              <p className="text-5xl font-black">#{userEntry?.rank || 4}</p>
              <p className="text-blue-200 text-sm mt-1">out of {LEADERBOARD.length} in your area</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">SUVIDHA Points</p>
              <p className="text-4xl font-black">{userPoints.toLocaleString()}</p>
              <p className="text-blue-200 text-sm mt-1">{userEntry?.badges.join(' ')}</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.min(100, (userPoints / 3000) * 100)}%` }} />
          </div>
          <p className="text-blue-200 text-xs mt-1">{3000 - userPoints} points to reach #1</p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['board', 'achievements', 'howto'] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'}
            onClick={() => setTab(t)} className="capitalize">
            {t === 'board' ? '🏆 Rankings' : t === 'achievements' ? '🎖️ Badges' : '💡 How to Earn'}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'board' && (
        <div className="space-y-2">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((entry, i) => (
              <Card key={entry.rank} className={`border-2 text-center ${entry.rank === 1 ? 'border-yellow-400 bg-yellow-50/50 scale-105' : 'border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-lg ${rankColor(entry.rank)}`}>
                    {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉'}
                  </div>
                  <p className="font-bold text-sm text-slate-900 truncate">{entry.name}</p>
                  <p className="text-xs text-slate-500">{entry.sector}</p>
                  <p className="text-lg font-black text-blue-600 mt-1">{entry.points.toLocaleString()}</p>
                  <p className="text-sm">{entry.badges.join(' ')}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full List */}
          {LEADERBOARD.map(entry => (
            <Card key={entry.rank} className={`border transition-all ${entry.isCurrentUser ? 'border-blue-400 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${rankColor(entry.rank)}`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${entry.isCurrentUser ? 'text-blue-700' : 'text-slate-900'}`}>
                      {entry.name} {entry.isCurrentUser && <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 ml-1">You</Badge>}
                    </p>
                    {trendIcon(entry.trend)}
                  </div>
                  <p className="text-xs text-slate-500">{entry.sector}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{entry.points.toLocaleString()}</p>
                  <p className="text-sm">{entry.badges.join(' ')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Achievements */}
      {tab === 'achievements' && (
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map(a => (
            <Card key={a.id} className={`border-2 transition-all ${a.earned ? `${a.color} shadow-sm` : 'border-slate-200 bg-slate-50 opacity-50 grayscale'}`}>
              <CardContent className="p-5 text-center">
                <a.icon className={`w-12 h-12 mx-auto mb-3 ${a.earned ? '' : 'text-slate-400'}`} />
                <p className="font-bold text-sm mb-1">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
                {a.earned && <Badge className="mt-2 text-xs bg-white/60 border-0">Earned ✓</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How to Earn */}
      {tab === 'howto' && (
        <div className="space-y-3">
          {HOW_TO_EARN.map((item, i) => (
            <Card key={i} className="border-slate-200 hover:border-blue-200 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{i + 1}</div>
                  <p className="font-medium text-slate-800">{item.action}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 font-bold">{item.points}</Badge>
              </CardContent>
            </Card>
          ))}
          <Card className="border-yellow-200 bg-yellow-50 mt-4">
            <CardContent className="p-4 text-center">
              <p className="text-yellow-800 font-semibold">🎁 Redeem Points</p>
              <p className="text-yellow-700 text-sm mt-1">500 pts = ₹50 off next bill | 1000 pts = Free bus pass | 2000 pts = Property tax rebate</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CivicLeaderboard;
