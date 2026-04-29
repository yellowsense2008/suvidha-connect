// API client — connects to backend with graceful fallback to mock data

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3002/api');
const KIOSK_ID = import.meta.env.VITE_KIOSK_ID || 'KIOSK-SEC5-001';

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Kiosk-ID': KIOSK_ID,
});

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...defaultHeaders(), ...(options.headers || {}) },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  requestOTP: (mobile: string) =>
    request('/auth/otp/request', { method: 'POST', body: JSON.stringify({ mobile }) }),

  verifyOTP: (mobile: string, otp: string) =>
    request<{ success: boolean; citizen: any }>('/auth/otp/verify', {
      method: 'POST', body: JSON.stringify({ mobile, otp })
    }),

  loginConsumer: (consumerId: string, pin: string) =>
    request<{ success: boolean; citizen: any }>('/auth/consumer/login', {
      method: 'POST', body: JSON.stringify({ consumerId, pin })
    }),
};

// ─── Bills ────────────────────────────────────────────────────────────────────
export const billsApi = {
  getBills: (consumerId: string, type?: string) =>
    request<{ bills: any[] }>(`/bills/${consumerId}${type ? `?type=${type}` : ''}`),

  payBill: (billId: string, paymentMethod: string, citizenId: string) =>
    request<{ success: boolean; receipt: any }>(`/bills/${billId}/pay`, {
      method: 'POST', body: JSON.stringify({ paymentMethod, citizenId })
    }),
};

// ─── Complaints ───────────────────────────────────────────────────────────────
export const complaintsApi = {
  getComplaints: (citizenId: string) =>
    request<{ complaints: any[] }>(`/complaints/citizen/${citizenId}`),

  trackComplaint: (id: string) =>
    request<{ complaint: any }>(`/complaints/track/${id}`),

  submitComplaint: (data: {
    citizenId: string; category: string; description: string;
    location: string; attachments?: string[]; org?: string; geoCoords?: { lat: number; lng: number } | null;
  }) =>
    request<{ success: boolean; complaintId: string; sla: string; assignedOfficer: string; assignedDept: string; integrityHash: string }>(
      '/complaints', { method: 'POST', body: JSON.stringify(data) }
    ),
};

// ─── Service Requests ─────────────────────────────────────────────────────────
export const requestsApi = {
  submit: (data: any) =>
    request<{ success: boolean; referenceNumber: string; sla: string; estimatedDays: number }>(
      '/requests', { method: 'POST', body: JSON.stringify(data) }
    ),

  track: (id: string) =>
    request<{ request: any }>(`/requests/track/${id}`),
};

// ─── Credentials ──────────────────────────────────────────────────────────────
export const credentialsApi = {
  get: (citizenId: string) =>
    request<{ citizen: any }>(`/credentials/${citizenId}`),

  update: (citizenId: string, data: Partial<{ name: string; mobile: string; email: string; address: string }>) =>
    request<{ success: boolean; receiptId: string }>(`/credentials/${citizenId}`, {
      method: 'PATCH', body: JSON.stringify(data)
    }),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsApi = {
  getActive: () => request<{ alerts: any[] }>('/alerts'),
  create: (data: any) => request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getAuditLogs: (page = 1) => request<{ logs: any[]; total: number }>(`/admin/audit-logs?page=${page}`),
  getLedger: () => request<{ records: any[] }>('/ledger'),
};

// ─── Points ───────────────────────────────────────────────────────────────────
export const pointsApi = {
  award: (citizenId: string, points: number, reason: string) =>
    request('/points/award', { method: 'POST', body: JSON.stringify({ citizenId, points, reason }) }),
};

// ─── Health check ─────────────────────────────────────────────────────────────
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = import.meta.env.PROD ? '/api/health' : 'http://localhost:3002/health';
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};
