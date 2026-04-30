import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { useTranslation } from 'react-i18next';
import {
  Shield, Globe, LogOut, Clock, User, Eye, Volume2, VolumeX,
  Bell, AlertTriangle, Siren, UserCheck, LayoutDashboard,
  Server, ChevronDown, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { civicAlerts } from '@/lib/mockData';

interface KioskHeaderProps {
  onSOS?: () => void;
  onSeniorMode?: () => void;
  onDashboard?: () => void;
  onNearbyKiosk?: () => void;
  onBlindMode?: () => void;
  onHome?: () => void;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({
  onSOS, onSeniorMode, onDashboard, onNearbyKiosk, onBlindMode, onHome
}) => {
  const { isAuthenticated, citizen, language, setLanguage, logout, sessionTimeout } = useAuth();
  const { ttsEnabled, toggleTTS, backendOnline } = useKiosk();
  const { t, i18n } = useTranslation();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const activeAlerts = civicAlerts.filter(a => new Date(a.expiresAt) > new Date());

  useEffect(() => { i18n.changeLanguage(language); }, [language, i18n]);
  useEffect(() => { document.body.classList.toggle('high-contrast', highContrast); }, [highContrast]);
  useEffect(() => { document.documentElement.style.fontSize = largeText ? '118%' : '100%'; }, [largeText]);

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextLang = () => {
    const langs: ('en' | 'hi' | 'as')[] = ['en', 'hi', 'as'];
    setLanguage(langs[(langs.indexOf(language as 'en' | 'hi' | 'as') + 1) % 3]);
  };

  const langLabel = language === 'en' ? 'हिंदी' : language === 'hi' ? 'অসমীয়া' : 'English';

  return (
    <header className="z-50 shadow-xl">
      {/* Tricolor */}
      <div className="h-1.5 w-full bg-[linear-gradient(90deg,#FF9933_0%,#FFFFFF_50%,#138808_100%)]" />

      {/* ── ROW 1: Branding + Core Actions ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[hsl(220,90%,28%)] text-white">

        {/* Left: Logo — click to go home */}
        <button
          onClick={onHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          title="Go to Home"
        >
          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide font-serif leading-none">SUVIDHA</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none mt-0.5">
              {language === 'en' ? 'Smart Civic Services' : language === 'hi' ? 'स्मार्ट नागरिक सेवा' : 'স্মাৰ্ট নাগৰিক সেৱা'}
            </p>
          </div>
        </button>
        {/* Backend status dot */}
        <div className="hidden lg:flex items-center gap-1 ml-2 pl-3 border-l border-white/20">
          <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
          <span className="text-[10px] text-blue-300">{backendOnline ? 'Live' : 'Offline'}</span>
        </div>

        {/* Center: Date + Timer */}
        <div className="hidden xl:flex flex-col items-center gap-1">
          <span className="text-sm font-mono font-bold text-white">
            {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
              weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
            })}
          </span>
          {isAuthenticated && (
            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono ${sessionTimeout < 30000 ? 'bg-red-500/40 text-red-200' : 'bg-white/10 text-blue-200'}`}>
              <Clock className="w-3 h-3" /> {formatTime(sessionTimeout)}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* SOS */}
          <Button size="sm" onClick={onSOS}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5 h-9 px-3 font-bold animate-pulse hover:animate-none border border-red-400 shrink-0">
            <Siren className="w-4 h-4" />
            <span className="text-xs font-bold">SOS</span>
          </Button>

          {/* Alerts bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/15 h-9 w-9">
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-blue-800 animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-xl" align="end">
              <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" /> Alerts ({activeAlerts.length})
                </span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => toast.success('Marked as read')}>
                  Mark read
                </Button>
              </div>
              <ScrollArea className="h-56">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="p-3 border-b hover:bg-slate-50 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : alert.severity === 'warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{language === 'en' ? alert.title : alert.titleHindi}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{language === 'en' ? alert.message : alert.messageHindi}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Language */}
          <Button variant="ghost" size="sm" onClick={nextLang}
            className="text-white hover:bg-white/15 gap-1.5 h-9 border border-white/20 text-xs px-3">
            <Globe className="w-3.5 h-3.5" /> {langLabel}
          </Button>

          {/* User dropdown */}
          {isAuthenticated && citizen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost"
                  className="text-white hover:bg-white/15 gap-2 h-9 border border-white/20 px-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium hidden md:inline max-w-[70px] truncate">
                    {citizen.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-yellow-300 hidden md:inline">🪙{citizen.points || 0}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b">
                  <p className="font-semibold text-sm text-slate-800">{citizen.name}</p>
                  <p className="text-xs text-slate-500">{citizen.consumerId}</p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">🪙 {citizen.points || 0} Points</p>
                </div>
                <DropdownMenuItem onClick={onDashboard} className="gap-2 cursor-pointer text-sm">
                  <LayoutDashboard className="w-4 h-4 text-blue-600" /> My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onNearbyKiosk} className="gap-2 cursor-pointer text-sm">
                  <MapPin className="w-4 h-4 text-green-600" /> Nearby Kiosks
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-red-600 cursor-pointer text-sm">
                  <LogOut className="w-4 h-4" /> {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* ── ROW 2: Accessibility bar (only when authenticated) ── */}
      {isAuthenticated && (
        <div className="flex items-center justify-between px-5 py-1 bg-[hsl(220,90%,20%)] border-t border-white/10">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-blue-400 mr-2 hidden sm:inline uppercase tracking-wider">Accessibility</span>
            <button onClick={toggleTTS}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${ttsEnabled ? 'bg-white/20 text-white' : 'text-blue-300 hover:bg-white/10 hover:text-white'}`}>
              {ttsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />} TTS
            </button>
            <button onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all ${highContrast ? 'bg-white/20 text-white' : 'text-blue-300 hover:bg-white/10 hover:text-white'}`}>
              <Eye className="w-3 h-3" /> Contrast
            </button>
            <button onClick={() => setLargeText(!largeText)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${largeText ? 'bg-white/20 text-white' : 'text-blue-300 hover:bg-white/10 hover:text-white'}`}>
              A+
            </button>
            <button onClick={onBlindMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] text-blue-300 hover:bg-white/10 hover:text-white transition-all">
              <Eye className="w-3 h-3" /> Blind
            </button>
            <button onClick={onSeniorMode}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] text-blue-300 hover:bg-white/10 hover:text-white transition-all">
              <UserCheck className="w-3 h-3" /> Senior
            </button>
          </div>
          <div className="text-[10px] text-blue-500 hidden lg:block">
            KIOSK-SEC5-001 • Govt of India
          </div>
        </div>
      )}
    </header>
  );
};

export default KioskHeader;
