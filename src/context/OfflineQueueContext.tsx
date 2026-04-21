import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface QueuedItem {
  id: string;
  type: 'complaint' | 'request' | 'credential_update';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
  status: 'pending' | 'syncing' | 'failed';
}

interface OfflineQueueContextType {
  isOnline: boolean;
  queue: QueuedItem[];
  queueCount: number;
  enqueue: (type: QueuedItem['type'], payload: Record<string, unknown>) => string;
  removeFromQueue: (id: string) => void;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}

const OfflineQueueContext = createContext<OfflineQueueContextType | undefined>(undefined);

const STORAGE_KEY = 'suvidha_offline_queue';

export const OfflineQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const syncedRef = useRef(false);

  // Persist queue to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(queue)); } catch {}
  }, [queue]);

  // Online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing queued submissions...', { duration: 3000 });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Submissions will be queued and synced when reconnected.', { duration: 5000 });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !syncedRef.current) {
      syncedRef.current = true;
      syncNow();
    }
    if (!isOnline) syncedRef.current = false;
  }, [isOnline, queue.length]);

  const enqueue = useCallback((type: QueuedItem['type'], payload: Record<string, unknown>): string => {
    const id = `Q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: QueuedItem = {
      id, type, payload,
      createdAt: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    };
    setQueue(prev => [...prev, item]);
    toast.info(`Saved offline. Will sync when connected. (Queue: ${queue.length + 1})`, { duration: 4000 });
    return id;
  }, [queue.length]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    const pending = queue.filter(i => i.status === 'pending' || i.status === 'failed');
    if (pending.length === 0) return;

    setIsSyncing(true);
    let synced = 0;

    for (const item of pending) {
      // Mark as syncing
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'syncing' } : i));

      try {
        // Simulate API call (replace with real API when backend is ready)
        await new Promise(r => setTimeout(r, 600));
        // On success — remove from queue
        setQueue(prev => prev.filter(i => i.id !== item.id));
        synced++;
      } catch {
        setQueue(prev => prev.map(i =>
          i.id === item.id
            ? { ...i, status: 'failed', retries: i.retries + 1 }
            : i
        ));
      }
    }

    setIsSyncing(false);
    if (synced > 0) {
      toast.success(`✅ ${synced} item${synced > 1 ? 's' : ''} synced successfully!`);
    }
  }, [isSyncing, queue]);

  return (
    <OfflineQueueContext.Provider value={{
      isOnline, queue, queueCount: queue.length,
      enqueue, removeFromQueue, syncNow, isSyncing,
    }}>
      {children}
    </OfflineQueueContext.Provider>
  );
};

export const useOfflineQueue = () => {
  const ctx = useContext(OfflineQueueContext);
  if (!ctx) throw new Error('useOfflineQueue must be used within OfflineQueueProvider');
  return ctx;
};
