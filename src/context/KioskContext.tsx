import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  bills as initialBills,
  complaints as initialComplaints,
  serviceRequests as initialRequests,
  integrityRecords as initialRecords,
  generateHash,
  generateReferenceNumber,
  generateTransactionId,
  type Bill,
  type Complaint,
  type ServiceRequest,
  type IntegrityRecord
} from '@/lib/mockData';
import { billsApi, complaintsApi, requestsApi, checkBackendHealth } from '@/lib/api';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  timestamp: string;
  receipt?: any;
}

interface KioskContextType {
  bills: Bill[];
  complaints: Complaint[];
  serviceRequests: ServiceRequest[];
  integrityRecords: IntegrityRecord[];
  backendOnline: boolean;
  payBill: (billId: string, method: string, citizenId?: string) => Promise<PaymentResult>;
  submitComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'integrityHash'> & { org?: string; geoCoords?: { lat: number; lng: number } | null }) => Promise<string>;
  submitServiceRequest: (request: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'referenceNumber' | 'status'>) => Promise<string>;
  getComplaintStatus: (complaintId: string) => Complaint | undefined;
  getRequestStatus: (requestId: string) => ServiceRequest | undefined;
  verifyIntegrity: (recordId: string) => boolean;
  ttsEnabled: boolean;
  toggleTTS: () => void;
  speak: (text: string) => void;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(initialRequests);
  const [integrityRecords, setIntegrityRecords] = useState<IntegrityRecord[]>(initialRecords);
  const [backendOnline, setBackendOnline] = useState(false);

  // TTS State
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(online => {
      setBackendOnline(online);
      if (online) console.log('[SUVIDHA] Backend connected ✅');
      else console.log('[SUVIDHA] Backend offline — using mock data 📦');
    });
  }, []);

  // Load voices for TTS
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = i18n.language;
    let targetVoice = voices.find(v => v.lang === (currentLang === 'hi' ? 'hi-IN' : currentLang === 'as' ? 'as-IN' : 'en-IN'));
    if (!targetVoice) targetVoice = voices.find(v => v.lang.startsWith(currentLang));
    if (targetVoice) { utterance.voice = targetVoice; utterance.lang = targetVoice.lang; }
    else utterance.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, i18n.language, voices]);

  const toggleTTS = useCallback(() => {
    setTtsEnabled(prev => { if (prev) window.speechSynthesis.cancel(); return !prev; });
  }, []);

  // ─── Bill Payment ────────────────────────────────────────────────────────────
  const payBill = async (billId: string, method: string, citizenId = 'CIT001'): Promise<PaymentResult> => {
    // Try real backend first
    if (backendOnline) {
      try {
        const res = await billsApi.payBill(billId, method, citizenId);
        if (res.success) {
          setBills(prev => prev.map(b =>
            b.id === billId ? { ...b, status: 'paid' as const } : b
          ));
          return {
            success: true,
            transactionId: res.receipt.transactionId,
            amount: res.receipt.amount,
            timestamp: res.receipt.timestamp,
            receipt: res.receipt
          };
        }
      } catch (e) {
        console.warn('[API] payBill failed, using mock:', e);
      }
    }

    // Mock fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    const bill = bills.find(b => b.id === billId);
    if (!bill) return { success: false, transactionId: '', amount: 0, timestamp: '' };

    const transactionId = generateTransactionId();
    const timestamp = new Date().toISOString();
    setBills(prev => prev.map(b =>
      b.id === billId
        ? { ...b, status: 'paid' as const, previousPayments: [{ date: timestamp.split('T')[0], amount: b.amount, transactionId }, ...b.previousPayments] }
        : b
    ));
    const lastHash = integrityRecords.at(-1)?.hash || '0'.repeat(64);
    const newRecord: IntegrityRecord = {
      id: `IR${Date.now()}`, recordType: 'payment', recordId: transactionId,
      hash: generateHash(`${transactionId}${bill.amount}${timestamp}${lastHash}`),
      timestamp, previousHash: lastHash, verified: true
    };
    setIntegrityRecords(prev => [...prev, newRecord]);
    return { success: true, transactionId, amount: bill.amount, timestamp };
  };

  // ─── Submit Complaint ────────────────────────────────────────────────────────
  const submitComplaint = async (
    complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'integrityHash'> & { org?: string; geoCoords?: { lat: number; lng: number } | null }
  ): Promise<string> => {
    if (backendOnline) {
      try {
        const res = await complaintsApi.submitComplaint({
          citizenId: complaintData.citizenId,
          category: complaintData.category,
          description: complaintData.description,
          location: complaintData.location,
          attachments: complaintData.attachments,
          org: complaintData.org,
          geoCoords: complaintData.geoCoords
        });
        if (res.success) {
          // Sync to local state so tracking works immediately
          const newComplaint: Complaint = {
            ...complaintData,
            id: res.complaintId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            integrityHash: res.integrityHash
          };
          setComplaints(prev => [...prev, newComplaint]);
          return res.complaintId;
        }
      } catch (e) {
        console.warn('[API] submitComplaint failed, using mock:', e);
      }
    }

    // Mock fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    const timestamp = new Date().toISOString();
    const complaintId = `COMP${Date.now().toString().slice(-6)}`;
    const lastHash = integrityRecords.at(-1)?.hash || '0'.repeat(64);
    const integrityHash = generateHash(`${complaintId}${complaintData.category}${timestamp}${lastHash}`);
    const newComplaint: Complaint = { ...complaintData, id: complaintId, createdAt: timestamp, updatedAt: timestamp, integrityHash };
    setComplaints(prev => [...prev, newComplaint]);
    setIntegrityRecords(prev => [...prev, {
      id: `IR${Date.now()}`, recordType: 'complaint', recordId: complaintId,
      hash: integrityHash, timestamp, previousHash: lastHash, verified: true
    }]);
    return complaintId;
  };

  // ─── Submit Service Request ──────────────────────────────────────────────────
  const submitServiceRequest = async (
    requestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'referenceNumber' | 'status'>
  ): Promise<string> => {
    if (backendOnline) {
      try {
        const res = await requestsApi.submit(requestData);
        if (res.success) {
          const newRequest: ServiceRequest = {
            ...requestData, id: `REQ${Date.now()}`,
            referenceNumber: res.referenceNumber, status: 'submitted',
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          };
          setServiceRequests(prev => [...prev, newRequest]);
          return res.referenceNumber;
        }
      } catch (e) {
        console.warn('[API] submitServiceRequest failed, using mock:', e);
      }
    }

    // Mock fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    const timestamp = new Date().toISOString();
    const referenceNumber = generateReferenceNumber(requestData.type);
    const newRequest: ServiceRequest = {
      ...requestData, id: `REQ${Date.now().toString().slice(-6)}`,
      referenceNumber, status: 'submitted', createdAt: timestamp, updatedAt: timestamp
    };
    setServiceRequests(prev => [...prev, newRequest]);
    const lastHash = integrityRecords.at(-1)?.hash || '0'.repeat(64);
    setIntegrityRecords(prev => [...prev, {
      id: `IR${Date.now()}`, recordType: 'request', recordId: referenceNumber,
      hash: generateHash(`${referenceNumber}${requestData.type}${timestamp}${lastHash}`),
      timestamp, previousHash: lastHash, verified: true
    }]);
    return referenceNumber;
  };

  const getComplaintStatus = (id: string) => complaints.find(c => c.id === id);
  const getRequestStatus = (id: string) => serviceRequests.find(r => r.referenceNumber === id || r.id === id);
  const verifyIntegrity = (recordId: string) => integrityRecords.find(r => r.recordId === recordId)?.verified ?? false;

  return (
    <KioskContext.Provider value={{
      bills, complaints, serviceRequests, integrityRecords, backendOnline,
      payBill, submitComplaint, submitServiceRequest,
      getComplaintStatus, getRequestStatus, verifyIntegrity,
      ttsEnabled, toggleTTS, speak
    }}>
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (!context) throw new Error('useKiosk must be used within a KioskProvider');
  return context;
};
