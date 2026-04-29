import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Award, Trophy, Star, Gift, Crown,
  Medal, Zap, Leaf, Shield, CheckCircle, Lock, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface RewardsModuleProps { onBack: () => void; }

const tx = {
  en: {
    title: 'SUVIDHA Rewards', subtitle: 'Earn points for being a responsible citizen',
    yourPoints: 'Your Points', level: 'Level', nextLevel: 'Next Level',
    leaderboard: 'Neighborhood Leaderboard', redeem: 'Redeem',
    redeemRewards: 'Redeem Rewards', pts: 'pts', locked: 'Locked',
    howToEarn: 'How to Earn Points', redeemed: 'Redeemed!',
    notEnough: 'Not enough points', badges: 'Your Badges',
    topNeighbor: 'Top Neighbor', you: 'You',
  },
  hi: {
    title: 'सुविधा रिवॉर्ड्स', subtitle: 'जिम्मेदार नागरिक बनने के लिए अंक अर्जित करें',
    yourPoints: 'आपके अंक', level: 'स्तर', nextLevel: 'अगला स्तर',
    leaderboard: 'पड़ोस लीडरबोर्ड', redeem: 'भुनाएं',
    redeemRewards: 'रिवॉर्ड्स भुनाएं', pts: 'अंक', locked: 'बंद',
    howToEarn: 'अंक कैसे अर्जित करें', redeemed: 'भुनाया!',
    notEnough: 'पर्याप्त अंक नहीं', badges: 'आपके बैज',
    topNeighbor: 'शीर्ष पड़ोसी', you: 'आप',
  },
  as: {
    title: 'সুবিধা ৰিৱাৰ্ড', subtitle: 'দায়িত্বশীল নাগৰিক হওক আৰু পইণ্ট অৰ্জন কৰক',
    yourPoints: 'আপোনাৰ পইণ্ট', level: 'স্তৰ', nextLevel: 'পৰৱৰ্তী স্তৰ',
    leaderboard: 'চুবুৰীয়া লিডাৰবৰ্ড', redeem: 'ৰিডিম',
    redeemRewards: 'ৰিৱাৰ্ড ৰিডিম কৰক', pts: 'পইণ্ট', locked: 'বন্ধ',
    howToEarn: 'পইণ্ট কেনেকৈ অৰ্জন কৰিব', redeemed: 'ৰিডিম হৈছে!',
    notEnough: 'পৰ্যাপ্ত পইণ্ট নাই', badges: 'আপোনাৰ বেজ',
    topNeighbor: 'শীৰ্ষ চুবুৰীয়া', you: 'আপুনি',
  }
};

const LEVELS = [
  { name: 'Bronze', min: 0, max: 199, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Silver', min: 200, max: 499, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300', gradient: 'from-slate-400 to-slate-600' },
  { name: 'Gold', min: 500, max: 999, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Platinum', min: 1000, max: 9999, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-600' },
];

const BADGES = [
  { id: 'green', icon: Leaf, label: 'Green Citizen', desc: 'Below city avg carbon', color: 'text-green-600 bg-green-50 border-green-200', earned: true },
  { id: 'payer', icon: Zap, label: 'Prompt Payer', desc: 'Paid 3 bills on time', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', earned: true },
  { id: 'hero', icon: Shield, label: 'Civic Hero', desc: 'Filed 5+ complaints', color: 'text-blue-600 bg-blue-50 border-blue-200', earned: false },
  { id: 'star', icon: Star, label: 'Star Citizen', desc: 'Top 10 in sector', color: 'text-purple-600 bg-purple-50 border-purple-200', earned: true },
  { id: 'champ', icon: Crown, label: 'Ward Champion', desc: 'Top 3 in ward', color: 'text-orange-600 bg-orange-50 border-orange-200', earned: false },
  { id: 'medal', icon: Medal, label: 'Issue Reporter', desc: 'Reported 10+ issues', color: 'text-red-600 bg-red-50 border-red-200', earned: false },
];

const REWARDS = [
  { id: 1, title: 'Priority Service', cost: 200, icon: Star, desc: 'Skip the queue at any civic center', color: 'blue' },
  { id: 2, title: '₹50 Bill Discount', cost: 500, icon: Gift, desc: '₹50 off on your next electricity bill', color: 'green' },
  { id: 3, title: 'Tree Plantation', cost: 300, icon: Leaf, desc: 'Plant a tree in your name in Guwahati', color: 'emerald' },
  { id: 4, title: 'Free Bus Pass', cost: 1000, icon: Award, desc: '1-month city bus pass', color: 'purple' },
  { id: 5, title: 'Tax Rebate', cost: 2000, icon: Trophy, desc: '₹200 property tax rebate', color: 'yellow' },
  { id: 6, title: 'VIP Kiosk Access', cost: 1500, icon: Crown, desc: 'Dedicated kiosk lane for 3 months', color: 'orange' },
];

const HOW_TO_EARN = [
  { action: 'Pay bill on time', pts: '+20' },
  { action: 'File a complaint', pts: '+30' },
  { action: 'Complaint resolved', pts: '+50' },
  { action: 'New connection request', pts: '+10' },
  { action: 'Update profile', pts: '+10' },
  { action: 'Report outage', pts: '+15' },
  { action: 'Daily kiosk visit', pts: '+5' },
];

const LEADERBOARD = [
  { name: 'Priya Sharma', points: 2840, rank: 1 },
  { name: 'Amit Das', points: 2650, rank: 2 },
  { name: 'Sunita Bora', points: 2410, rank: 3 },
];

const fireConfetti = () => {
  // Left burst
  confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.6 }, colors: ['#FF9933', '#FFFFFF', '#138808', '#3b82f6', '#f59e0b'] });
  // Right burst
  setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.6 }, colors: ['#FF9933', '#FFFFFF', '#138808', '#8b5cf6', '#ec4899'] }), 200);
  // Center burst
  setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#10b981'] }), 400);
};

const RewardsModule: React.FC<RewardsModuleProps> = ({ onBack }) => {
  const { citizen, language, updateCitizen } = useAuth();
  const lang = (language as keyof typeof tx) in tx ? (language as keyof typeof tx) : 'en';
  const t = tx[lang];
  const points = citizen?.points || 0;
  const [tab, setTab] = useState<'rewards' | 'badges' | 'earn'>('rewards');
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);

  const currentLevel = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.min > points);
  const progressToNext = nextLevel ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  // Fire confetti on mount if points > 100
  useEffect(() => {
    if (points >= 100) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 55, origin: { x: 0.5, y: 0.3 }, colors: ['#FF9933', '#FFFFFF', '#138808'] });
      }, 600);
    }
  }, []);

  const handleRedeem = (reward: typeof REWARDS[0]) => {
    if (points < reward.cost) { toast.error(t.notEnough); return; }
    if (redeemedIds.includes(reward.id)) return;
    fireConfetti();
    setRedeemedIds(prev => [...prev, reward.id]);
    if (updateCitizen) updateCitizen({ points: points - reward.cost });
    toast.success(`🎉 ${t.redeemed} ${reward.title}!`);
  };

  const rankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-slate-300 to-slate-500';
    return 'from-orange-300 to-orange-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" /> {t.title}
          </h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>
      </div>

      {/* Points Hero Card */}
      <Card className={`border-2 ${currentLevel.border} mb-6 overflow-hidden shadow-xl`}>
        <div className={`bg-gradient-to-r ${currentLevel.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">{t.yourPoints}</p>
              <p className="text-6xl font-black tracking-tight">{points.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-2xl border border-white/30`}>
                <Award className="w-5 h-5" />
                <span className="font-bold text-lg">{currentLevel.name}</span>
              </div>
              {nextLevel && <p className="text-white/70 text-xs mt-2">{nextLevel.min - points} pts to {nextLevel.name}</p>}
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3">
            <div className="bg-white rounded-full h-3 transition-all duration-1000" style={{ width: `${Math.min(100, progressToNext)}%` }} />
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="border-slate-200 mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" /> {t.leaderboard}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LEADERBOARD.map(user => (
            <div key={user.rank} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankColor(user.rank)} flex items-center justify-center text-white font-bold text-sm`}>
                {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                {user.rank === 1 && <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-yellow-200">{t.topNeighbor}</Badge>}
              </div>
              <span className="font-bold text-slate-700">{user.points.toLocaleString()}</span>
            </div>
          ))}
          {/* Current user */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border-2 border-blue-300">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">#4</div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900 text-sm">{citizen?.name} <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 ml-1">{t.you}</Badge></p>
            </div>
            <span className="font-bold text-blue-700">{points.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['rewards', 'badges', 'earn'] as const).map(tab_ => (
          <Button key={tab_} size="sm" variant={tab === tab_ ? 'default' : 'outline'}
            onClick={() => setTab(tab_)} className="capitalize">
            {tab_ === 'rewards' ? `🎁 ${t.redeemRewards}` : tab_ === 'badges' ? `🏅 ${t.badges}` : `💡 ${t.howToEarn}`}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      {tab === 'rewards' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {REWARDS.map(reward => {
            const canRedeem = points >= reward.cost;
            const isRedeemed = redeemedIds.includes(reward.id);
            return (
              <Card key={reward.id} className={`border-2 transition-all ${canRedeem && !isRedeemed ? 'border-blue-200 hover:border-blue-400 hover:shadow-lg cursor-pointer' : 'border-slate-200 opacity-70'}`}>
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${canRedeem ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <reward.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{reward.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{reward.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${canRedeem ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {reward.cost} {t.pts}
                    </span>
                    <Button size="sm" className={`h-8 text-xs ${canRedeem && !isRedeemed ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400'}`}
                      disabled={!canRedeem || isRedeemed} onClick={() => handleRedeem(reward)}>
                      {isRedeemed ? <><CheckCircle className="w-3 h-3 mr-1" />{t.redeemed}</> : canRedeem ? <><Sparkles className="w-3 h-3 mr-1" />{t.redeem}</> : <><Lock className="w-3 h-3 mr-1" />{t.locked}</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Badges */}
      {tab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map(badge => (
            <Card key={badge.id} className={`border-2 text-center transition-all ${badge.earned ? `${badge.color} shadow-sm` : 'border-slate-200 bg-slate-50 opacity-50 grayscale'}`}>
              <CardContent className="p-5">
                <badge.icon className={`w-12 h-12 mx-auto mb-3 ${badge.earned ? '' : 'text-slate-400'}`} />
                <p className="font-bold text-sm mb-1">{badge.label}</p>
                <p className="text-xs text-slate-500">{badge.desc}</p>
                {badge.earned && <Badge className="mt-2 text-xs bg-white/60 border-0">✓ Earned</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* How to Earn */}
      {tab === 'earn' && (
        <div className="space-y-3">
          {HOW_TO_EARN.map((item, i) => (
            <Card key={i} className="border-slate-200 hover:border-blue-200 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">{i + 1}</div>
                  <p className="font-medium text-slate-800">{item.action}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 font-bold">{item.pts}</Badge>
              </CardContent>
            </Card>
          ))}
          <Card className="border-yellow-200 bg-yellow-50 mt-4">
            <CardContent className="p-4 text-center">
              <p className="text-yellow-800 font-semibold">🎁 Redemption Value</p>
              <p className="text-yellow-700 text-sm mt-1">200pts = Priority Service | 500pts = ₹50 off bill | 1000pts = Free bus pass | 2000pts = Tax rebate</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RewardsModule;
