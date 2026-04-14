import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { citizens, type Citizen } from '@/lib/mockData';
import { authApi } from '@/lib/api';

export type Language = 'en' | 'hi' | 'as';
export type Organization = 'electricity' | 'gas' | 'municipal' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  citizen: Citizen | null;
  language: Language;
  organization: Organization;
  loginWithOTP: (mobile: string, otp: string) => Promise<boolean>;
  loginWithConsumerId: (consumerId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  setOrganization: (org: Organization) => void;
  sessionTimeout: number;
  resetSessionTimer: () => void;
  updateCitizen: (data: Partial<Citizen>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_TIMEOUT = 180000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [organization, setOrganization] = useState<Organization>(null);
  const [sessionTimeout, setSessionTimeout] = useState(SESSION_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCitizen(null);
    setOrganization(null);
    setSessionTimeout(SESSION_TIMEOUT);
  }, []);

  const resetSessionTimer = useCallback(() => {
    setLastActivity(Date.now());
    setSessionTimeout(SESSION_TIMEOUT);
  }, []);

  const updateCitizen = useCallback((data: Partial<Citizen>) => {
    setCitizen(prev => prev ? { ...prev, ...data } : null);
  }, []);

  // Session timeout countdown
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const remaining = SESSION_TIMEOUT - (Date.now() - lastActivity);
      if (remaining <= 0) logout();
      else setSessionTimeout(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, logout]);

  // Activity tracking
  useEffect(() => {
    if (!isAuthenticated) return;
    const handle = () => resetSessionTimer();
    window.addEventListener('click', handle);
    window.addEventListener('touchstart', handle);
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('click', handle);
      window.removeEventListener('touchstart', handle);
      window.removeEventListener('keydown', handle);
    };
  }, [isAuthenticated, resetSessionTimer]);

  const loginWithOTP = async (mobile: string, otp: string): Promise<boolean> => {
    // Try real backend
    try {
      const res = await authApi.verifyOTP(mobile, otp);
      if (res.success && res.citizen) {
        setCitizen(res.citizen as Citizen);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
        return true;
      }
    } catch {
      // Backend offline — fall through to mock
    }

    // Mock fallback
    await new Promise(r => setTimeout(r, 800));
    if (otp.length !== 6) return false;
    const found = citizens.find(c => c.mobile === mobile);
    if (found || (mobile.length === 10 && otp === '123456')) {
      setCitizen(found || citizens[0]);
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      return true;
    }
    return false;
  };

  const loginWithConsumerId = async (consumerId: string, pin: string): Promise<boolean> => {
    // Try real backend
    try {
      const res = await authApi.loginConsumer(consumerId, pin);
      if (res.success && res.citizen) {
        setCitizen(res.citizen as Citizen);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
        return true;
      }
    } catch {
      // Backend offline — fall through to mock
    }

    // Mock fallback
    await new Promise(r => setTimeout(r, 800));
    const found = citizens.find(c => c.consumerId === consumerId && c.pin === pin);
    if (found || (consumerId === 'ELEC2024001' && pin === '1234')) {
      setCitizen(found || citizens[0]);
      setIsAuthenticated(true);
      setLastActivity(Date.now());
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, citizen, language, organization,
      loginWithOTP, loginWithConsumerId, logout,
      setLanguage, setOrganization, sessionTimeout, resetSessionTimer, updateCitizen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
