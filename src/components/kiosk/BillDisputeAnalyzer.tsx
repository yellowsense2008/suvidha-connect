import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2, Zap, BarChart3, FileText, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'sonner';

interface BillDisputeAnalyzerProps { onBack: () => void; }

const BillDisputeAnalyzer: React.FC<BillDisputeAnalyzerProps> = ({ onBack }) => {
  const { language, citizen } = useAuth();
  const { submitComplaint } = useKiosk();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [disputed, setDisputed] = useState(false);
  const [complaintId, setComplaintId] = useState('');

  // Mock consumption data — in production, fetched from backend
  const consumptionData = [
    { month: 'Aug', units: 210, amount: 1680, avg: 230 },
    { month: 'Sep', units: 225, amount: 1800, avg: 230 },
    { month: 'Oct', units: 198, amount: 1584, avg: 230 },
    { month: 'Nov', units: 215, amount: 1720, avg: 230 },
    { month: 'Dec', units: 240, amount: 1920, avg: 230 },
    { month: 'Jan', units: 245, amount: 1960, avg: 230 },
    { month: 'Feb (Current)', units: 412, amount: 3296, avg: 230 }, // Anomaly!
  ];

  const currentBill = consumptionData[consumptionData.length - 1];
  const avgUnits = Math.round(consumptionData.slice(0, -1).reduce((s, d) => s + d.units, 0) / 6);
  const anomalyPercent = Math.round(((currentBill.units - avgUnits) / avgUnits) * 100);
  const isAnomaly = anomalyPercent > 40;
  const expectedAmount = Math.round(avgUnits * 8);
  const overcharge = currentBill.amount - expectedAmount;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    setAnalyzing(false);
    setAnalyzed(true);
  };

  const handleDispute = async () => {
    setDisputing(true);
    const id = await submitComplaint({
      citizenId: citizen?.id || 'CIT001',
      category: 'incorrect_bill' as any,
      description: `AI Analysis detected anomaly: Current bill shows ${currentBill.units} units vs 6-month average of ${avgUnits} units (${anomalyPercent}% spike). Estimated overcharge: ₹${overcharge}. Requesting meter inspection and bill correction.`,
      location: citizen?.address || 'Consumer Address',
      status: 'pending',
      attachments: ['bill_analysis_report.pdf'],
      org: 'electricity',
    } as any);
    setDisputing(false);
    setComplaintId(id);
    setDisputed(true);
    toast.success('Dispute filed with AI analysis report!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-600" />
            Smart Bill Dispute Analyzer
          </h2>
          <p className="text-slate-500 text-sm">AI-powered consumption analysis & dispute filing</p>
        </div>
      </div>

      {/* Current Bill Alert */}
      <Card className={`border-2 mb-6 ${isAnomaly ? 'border-red-300 bg-red-50/50' : 'border-green-300 bg-green-50/50'}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isAnomaly ? 'bg-red-100' : 'bg-green-100'}`}>
              {isAnomaly ? <AlertTriangle className="w-7 h-7 text-red-600" /> : <CheckCircle className="w-7 h-7 text-green-600" />}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${isAnomaly ? 'text-red-800' : 'text-green-800'}`}>
                {isAnomaly ? '⚠️ Billing Anomaly Detected' : '✅ Bill Looks Normal'}
              </h3>
              <p className={`text-sm ${isAnomaly ? 'text-red-700' : 'text-green-700'}`}>
                {isAnomaly
                  ? `Current bill shows ${currentBill.units} units — ${anomalyPercent}% higher than your 6-month average of ${avgUnits} units. Possible meter fault or billing error.`
                  : 'Your current bill is within normal range based on historical consumption.'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-slate-900">₹{currentBill.amount.toLocaleString('en-IN')}</p>
              <p className="text-sm text-slate-500">Current Bill</p>
              {isAnomaly && <p className="text-sm font-bold text-red-600 mt-1">Expected: ₹{expectedAmount.toLocaleString('en-IN')}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumption Chart */}
      <Card className="border-slate-200 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            6-Month Consumption History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={consumptionData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => [name === 'units' ? `${val} units` : `₹${val}`, name === 'units' ? 'Consumption' : 'Amount']} />
              <ReferenceLine y={avgUnits} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: `Avg: ${avgUnits}`, fill: '#3b82f6', fontSize: 11 }} />
              <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#64748b' }}
                // Highlight anomaly bar in red
                cells={consumptionData.map((d, i) => (
                  <cell key={i} fill={i === consumptionData.length - 1 && isAnomaly ? '#ef4444' : '#3b82f6'} />
                )) as any}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {!analyzed ? (
        <Button
          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg mb-4"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <><Loader2 className="w-5 h-5 animate-spin mr-2" />Analyzing your consumption pattern...</>
          ) : (
            <><BarChart3 className="w-5 h-5 mr-2" />Run AI Analysis</>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Analysis Results */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                <Zap className="w-5 h-5" /> AI Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: '6-Month Average', value: `${avgUnits} units/month`, icon: TrendingDown, color: 'text-green-600' },
                { label: 'Current Month', value: `${currentBill.units} units`, icon: TrendingUp, color: isAnomaly ? 'text-red-600' : 'text-green-600' },
                { label: 'Deviation', value: `+${anomalyPercent}% above average`, icon: AlertTriangle, color: isAnomaly ? 'text-red-600' : 'text-green-600' },
                { label: 'Expected Bill', value: `₹${expectedAmount.toLocaleString('en-IN')}`, icon: FileText, color: 'text-blue-600' },
                { label: 'Potential Overcharge', value: isAnomaly ? `₹${overcharge.toLocaleString('en-IN')}` : 'None', icon: Scale, color: isAnomaly ? 'text-red-600' : 'text-green-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <span className="flex items-center gap-2 text-slate-600 text-sm">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.label}
                  </span>
                  <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Verdict */}
          {isAnomaly && !disputed && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-5">
                <h3 className="font-bold text-red-800 mb-2">Recommendation: File a Dispute</h3>
                <p className="text-sm text-red-700 mb-4">
                  Our AI analysis strongly suggests a billing error or meter malfunction. We recommend filing a formal dispute with the attached analysis report.
                </p>
                <Button
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDispute}
                  disabled={disputing}
                >
                  {disputing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Filing Dispute...</> : <><FileText className="w-5 h-5 mr-2" />File Dispute with AI Report</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {disputed && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-5 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 mb-1">Dispute Filed Successfully!</h3>
                <p className="text-sm text-green-700 mb-2">Complaint ID: <span className="font-mono font-bold">{complaintId}</span></p>
                <p className="text-xs text-green-600">AI analysis report attached. Expected resolution: 7 working days.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default BillDisputeAnalyzer;
