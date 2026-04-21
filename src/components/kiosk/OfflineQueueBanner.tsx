import React from 'react';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { useAuth } from '@/context/AuthContext';
import { WifiOff, Wifi, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LABELS = {
  en: {
    offline: 'You are offline',
    offlineSub: 'Submissions are being saved locally and will sync when reconnected.',
    queued: 'queued',
    syncing: 'Syncing',
    syncNow: 'Sync Now',
    online: 'Back online',
    onlineSub: 'All services available.',
  },
  hi: {
    offline: 'आप ऑफलाइन हैं',
    offlineSub: 'सबमिशन स्थानीय रूप से सहेजे जा रहे हैं और पुनः कनेक्ट होने पर सिंक होंगे।',
    queued: 'कतार में',
    syncing: 'सिंक हो रहा है',
    syncNow: 'अभी सिंक करें',
    online: 'वापस ऑनलाइन',
    onlineSub: 'सभी सेवाएं उपलब्ध हैं।',
  },
  as: {
    offline: 'আপুনি অফলাইন আছে',
    offlineSub: 'দাখিলসমূহ স্থানীয়ভাৱে সংৰক্ষণ হৈছে আৰু পুনৰ সংযোগ হ\'লে সিংক হ\'ব।',
    queued: 'কিউত আছে',
    syncing: 'সিংক হৈছে',
    syncNow: 'এতিয়াই সিংক কৰক',
    online: 'পুনৰ অনলাইন',
    onlineSub: 'সকলো সেৱা উপলব্ধ।',
  },
};

const OfflineQueueBanner: React.FC = () => {
  const { isOnline, queueCount, syncNow, isSyncing } = useOfflineQueue();
  const { language } = useAuth();
  const lang = (language as keyof typeof LABELS) in LABELS ? (language as keyof typeof LABELS) : 'en';
  const t = LABELS[lang];

  // Only show when offline OR when there are queued items
  if (isOnline && queueCount === 0) return null;

  return (
    <div className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-all duration-300 ${
      !isOnline
        ? 'bg-red-600 text-white'
        : 'bg-amber-500 text-white'
    }`}>
      <div className="shrink-0">
        {!isOnline
          ? <WifiOff className="w-4 h-4" />
          : isSyncing
          ? <RefreshCw className="w-4 h-4 animate-spin" />
          : <Wifi className="w-4 h-4" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-bold mr-2">
          {!isOnline ? t.offline : isSyncing ? t.syncing + '...' : t.online}
        </span>
        <span className="opacity-90 text-xs">
          {!isOnline ? t.offlineSub : t.onlineSub}
        </span>
      </div>

      {queueCount > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <Inbox className="w-3.5 h-3.5" />
            <span className="font-bold text-xs">{queueCount} {t.queued}</span>
          </div>
          {isOnline && !isSyncing && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs bg-white text-amber-700 hover:bg-white/90 font-bold border-0"
              onClick={syncNow}
            >
              <RefreshCw className="w-3 h-3 mr-1" />{t.syncNow}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineQueueBanner;
