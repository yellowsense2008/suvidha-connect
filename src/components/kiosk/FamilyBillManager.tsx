import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Plus, Trash2, CreditCard, CheckCircle, Loader2, Zap, Flame, Droplets } from 'lucide-react';
import { toast } from 'sonner';

interface FamilyMember { id: string; name: string; consumerId: string; relation: string; bills: { type: string; amount: number; selected: boolean }[]; }

const MOCK_FAMILY: FamilyMember[] = [
  { id: 'F1', name: 'Rajesh Kumar (You)', consumerId: 'ELEC2024001', relation: 'Self', bills: [{ type: 'electricity', amount: 2450, selected: false }, { type: 'water', amount: 320, selected: false }] },
  { id: 'F2', name: 'Sunita Kumar', consumerId: 'ELEC2024005', relation: 'Spouse', bills: [{ type: 'electricity', amount: 1890, selected: false }] },
  { id: 'F3', name: 'Ramesh Kumar', consumerId: 'GAS2024003', relation: 'Father', bills: [{ type: 'gas', amount: 750, selected: false }, { type: 'electricity', amount: 1200, selected: false }] },
];

interface FamilyBillManagerProps { onBack: () => void; }

const FamilyBillManager: React.FC<FamilyBillManagerProps> = ({ onBack }) => {
  const { language, citizen, updateCitizen } = useAuth();
  const [family, setFamily] = useState<FamilyMember[]>(MOCK_FAMILY);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const t = {
    en: {
      title: 'Family Bill Manager',
      subtitle: 'Pay bills for all family members in one go',
      addMember: 'Add Family Member',
      name: 'Name', consumerId: 'Consumer ID', relation: 'Relation',
      add: 'Add', selectAll: 'Select All', clearAll: 'Clear All',
      paySelected: 'Pay Selected Bills',
      paying: 'Processing...', paid: 'All Bills Paid!',
      total: 'Total', bills: 'bills selected',
      noSelection: 'Select at least one bill to pay',
      pointsEarned: 'points earned for family payment!',
    },
    hi: {
      title: 'पारिवारिक बिल प्रबंधक',
      subtitle: 'एक बार में सभी परिवार के सदस्यों के बिल भरें',
      addMember: 'परिवार का सदस्य जोड़ें',
      name: 'नाम', consumerId: 'उपभोक्ता आईडी', relation: 'संबंध',
      add: 'जोड़ें', selectAll: 'सभी चुनें', clearAll: 'सभी हटाएं',
      paySelected: 'चुने हुए बिल भरें',
      paying: 'प्रोसेस हो रहा है...', paid: 'सभी बिल भरे!',
      total: 'कुल', bills: 'बिल चुने गए',
      noSelection: 'भुगतान के लिए कम से कम एक बिल चुनें',
      pointsEarned: 'पारिवारिक भुगतान के लिए अंक मिले!',
    }
  };
  const tx = t[language as 'en' | 'hi'] || t.en;

  const typeIcon = { electricity: Zap, water: Droplets, gas: Flame };
  const typeColor = { electricity: 'text-yellow-600', water: 'text-blue-600', gas: 'text-orange-600' };

  const toggleBill = (memberId: string, billIdx: number) => {
    setFamily(prev => prev.map(m => m.id === memberId
      ? { ...m, bills: m.bills.map((b, i) => i === billIdx ? { ...b, selected: !b.selected } : b) }
      : m));
  };

  const selectAll = () => setFamily(prev => prev.map(m => ({ ...m, bills: m.bills.map(b => ({ ...b, selected: true })) })));
  const clearAll = () => setFamily(prev => prev.map(m => ({ ...m, bills: m.bills.map(b => ({ ...b, selected: false })) })));

  const selectedBills = family.flatMap(m => m.bills.filter(b => b.selected).map(b => ({ ...b, member: m.name })));
  const totalAmount = selectedBills.reduce((s, b) => s + b.amount, 0);

  const handlePay = async () => {
    if (selectedBills.length === 0) { toast.error(tx.noSelection); return; }
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    setPaying(false);
    setPaid(true);
    const pts = selectedBills.length * 20;
    if (updateCitizen && citizen) updateCitizen({ points: (citizen.points || 0) + pts });
    toast.success(`+${pts} ${tx.pointsEarned}`);
  };

  const handleAddMember = () => {
    if (!newName || !newId) { toast.error('Please fill name and Consumer ID'); return; }
    setFamily(prev => [...prev, {
      id: `F${Date.now()}`, name: newName, consumerId: newId, relation: newRelation || 'Family',
      bills: [{ type: 'electricity', amount: Math.floor(Math.random() * 2000 + 500), selected: false }]
    }]);
    setNewName(''); setNewId(''); setNewRelation('');
    setAdding(false);
    toast.success('Family member added!');
  };

  if (paid) return (
    <div className="p-8 overflow-y-auto pb-10 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
      <Card className="border-green-200 shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6 border border-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{tx.paid}</h2>
          <p className="text-5xl font-bold text-green-600 mb-4">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-slate-500 mb-2">{selectedBills.length} {tx.bills}</p>
          <div className="space-y-2 my-6 text-left">
            {selectedBills.map((b, i) => (
              <div key={i} className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-slate-700">{b.member} — {b.type}</span>
                <span className="font-bold text-green-700">₹{b.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={onBack}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{tx.title}</h2>
          <p className="text-slate-500 text-sm">{tx.subtitle}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Button size="sm" variant="outline" onClick={selectAll}>{tx.selectAll}</Button>
        <Button size="sm" variant="outline" onClick={clearAll}>{tx.clearAll}</Button>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)} className="gap-1">
          <Plus className="w-4 h-4" />{tx.addMember}
        </Button>
      </div>

      {/* Add Member Form */}
      {adding && (
        <Card className="border-blue-200 bg-blue-50/50 mb-6 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Input placeholder={tx.name} value={newName} onChange={e => setNewName(e.target.value)} className="h-10" />
              <Input placeholder={tx.consumerId} value={newId} onChange={e => setNewId(e.target.value)} className="h-10" />
              <Input placeholder={tx.relation} value={newRelation} onChange={e => setNewRelation(e.target.value)} className="h-10" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700 text-white">{tx.add}</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members */}
      <div className="space-y-4 mb-6">
        {family.map(member => (
          <Card key={member.id} className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.relation} • {member.consumerId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ₹{member.bills.filter(b => b.selected).reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400">{member.bills.filter(b => b.selected).length} selected</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex gap-3 flex-wrap">
                {member.bills.map((bill, idx) => {
                  const Icon = typeIcon[bill.type as keyof typeof typeIcon] || Zap;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleBill(member.id, idx)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                        bill.selected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${typeColor[bill.type as keyof typeof typeColor]}`} />
                      <span className="text-sm font-medium capitalize">{bill.type}</span>
                      <span className={`text-sm font-bold ${bill.selected ? 'text-blue-700' : 'text-slate-700'}`}>
                        ₹{bill.amount.toLocaleString('en-IN')}
                      </span>
                      {bill.selected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pay Button */}
      <div className="sticky bottom-4">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm opacity-80">{selectedBills.length} {tx.bills}</p>
              <p className="text-3xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <Button
              className="h-14 px-8 bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg shadow-lg"
              onClick={handlePay}
              disabled={paying || selectedBills.length === 0}
            >
              {paying ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />{tx.paying}</> : <><CreditCard className="w-5 h-5 mr-2" />{tx.paySelected}</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilyBillManager;
