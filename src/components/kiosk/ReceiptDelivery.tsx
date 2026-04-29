import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, CheckCircle, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptDeliveryProps {
  receiptId: string;
  amount?: number;
  type: 'payment' | 'complaint' | 'request' | 'credential';
  refId: string;
  onClose: () => void;
}

const ReceiptDelivery: React.FC<ReceiptDeliveryProps> = ({ receiptId, amount, type, refId, onClose }) => {
  const { language, citizen } = useAuth();
  const [mobile, setMobile] = useState(citizen?.mobile || '');
  const [email, setEmail] = useState(citizen?.email || '');
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  const t = {
    en: { title: 'Send Receipt', subtitle: 'Receive via WhatsApp, SMS or Email', whatsapp: 'Send via WhatsApp', sms: 'Send via SMS', emailBtn: 'Send via Email', mobile: 'Mobile Number', email: 'Email Address', sending: 'Sending...', sent: 'Sent!', skip: 'Skip' },
    hi: { title: 'रसीद भेजें', subtitle: 'WhatsApp, SMS या Email के माध्यम से प्राप्त करें', whatsapp: 'WhatsApp पर भेजें', sms: 'SMS पर भेजें', emailBtn: 'Email पर भेजें', mobile: 'मोबाइल नंबर', email: 'ईमेल पता', sending: 'भेजा जा रहा है...', sent: 'भेजा गया!', skip: 'छोड़ें' },
    as: { title: 'ৰচিদ পঠাওক', subtitle: 'WhatsApp, SMS বা Email যোগে পাওক', whatsapp: 'WhatsApp যোগে পঠাওক', sms: 'SMS যোগে পঠাওক', emailBtn: 'Email যোগে পঠাওক', mobile: 'মোবাইল নম্বৰ', email: 'ইমেইল ঠিকনা', sending: 'পঠোৱা হৈছে...', sent: 'পঠোৱা হৈছে!', skip: 'এৰক' },
  };
  const tx = t[language as keyof typeof t] || t.en;
  const typeLabel = { payment: 'Bill Payment', complaint: 'Complaint Registration', request: 'Service Request', credential: 'Profile Update' };

  const handleSend = async (channel: 'whatsapp' | 'sms' | 'email') => {
    if (channel !== 'email' && mobile.length !== 10) { toast.error('Enter valid 10-digit mobile'); return; }
    if (channel === 'email' && !email.includes('@')) { toast.error('Enter valid email'); return; }
    setSending(channel);
    await new Promise(r => setTimeout(r, 1800));
    setSending(null);
    setSent(prev => [...prev, channel]);
    const msgs = {
      whatsapp: `WhatsApp sent to +91 ${mobile} — "SUVIDHA: ${typeLabel[type]} | Ref: ${refId}${amount ? ` | ₹${amount}` : ''}"`,
      sms: `SMS sent to +91 ${mobile} — "SUVIDHA: ${typeLabel[type]} confirmed. Ref: ${refId}"`,
      email: `Email sent to ${email} — Subject: "SUVIDHA Receipt - ${typeLabel[type]}"`,
    };
    toast.success(msgs[channel]);
  };

  const channels = [
    { id: 'whatsapp' as const, icon: MessageCircle, label: tx.whatsapp, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'sms' as const, icon: Phone, label: tx.sms, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'email' as const, icon: Mail, label: tx.emailBtn, color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Send className="w-5 h-5 text-blue-600" />{tx.title}</h2>
              <p className="text-sm text-slate-500">{tx.subtitle}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>

          {/* Receipt Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 font-mono text-xs">
            <p className="font-bold text-center text-slate-800 mb-2">── SUVIDHA RECEIPT ──</p>
            <div className="space-y-1 text-slate-600">
              <p>Type: {typeLabel[type]}</p>
              <p>Ref: {refId}</p>
              {amount && <p>Amount: ₹{amount.toLocaleString('en-IN')}</p>}
              <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
              <p>Status: CONFIRMED ✓</p>
            </div>
            <p className="text-center text-slate-400 mt-2">── suvidha-connect.vercel.app ──</p>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{tx.mobile}</label>
              <Input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="h-10" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{tx.email}</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="citizen@example.com" type="email" className="h-10" />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {channels.map(ch => (
              <Button key={ch.id} className={`w-full h-11 ${sent.includes(ch.id) ? 'bg-green-600 hover:bg-green-600' : ch.color} text-white`}
                onClick={() => handleSend(ch.id)} disabled={sending !== null || sent.includes(ch.id)}>
                {sending === ch.id ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{tx.sending}</>
                  : sent.includes(ch.id) ? <><CheckCircle className="w-4 h-4 mr-2" />{tx.sent}</>
                  : <><ch.icon className="w-4 h-4 mr-2" />{ch.label}</>}
              </Button>
            ))}
          </div>
          <Button variant="ghost" className="w-full text-slate-500" onClick={onClose}>{tx.skip}</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptDelivery;
