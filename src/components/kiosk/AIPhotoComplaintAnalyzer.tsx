import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, CheckCircle, AlertTriangle, Zap, Droplets, Trash2, Lightbulb, Construction, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface AIPhotoAnalyzerProps {
  onComplaintDetected: (category: string, description: string) => void;
  onClose: () => void;
}

// Simulated AI detection results based on "image analysis"
const AI_DETECTIONS = [
  { category: 'streetlight', label: 'Streetlight Failure', confidence: 94, icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', description: 'AI detected a non-functioning streetlight. Pole appears damaged with visible wiring exposed.' },
  { category: 'road_damage', label: 'Road Damage / Pothole', confidence: 91, icon: Construction, color: 'text-orange-600 bg-orange-50 border-orange-200', description: 'AI detected road surface damage. Pothole approximately 2ft wide detected near drainage area.' },
  { category: 'garbage', label: 'Garbage Overflow', confidence: 88, icon: Trash2, color: 'text-red-600 bg-red-50 border-red-200', description: 'AI detected overflowing garbage bin. Waste scattered in 3m radius. Immediate pickup required.' },
  { category: 'water_supply', label: 'Water Pipeline Leak', confidence: 96, icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200', description: 'AI detected water leakage from underground pipeline. Wet patch visible on road surface.' },
  { category: 'power_outage', label: 'Electrical Hazard', confidence: 89, icon: Zap, color: 'text-purple-600 bg-purple-50 border-purple-200', description: 'AI detected fallen power line. Safety hazard — area should be cordoned off immediately.' },
  { category: 'gas_leakage', label: 'Gas Pipeline Issue', confidence: 85, icon: Flame, color: 'text-red-700 bg-red-50 border-red-300', description: 'AI detected possible gas pipeline damage. Discoloration on ground surface detected.' },
];

const AIPhotoComplaintAnalyzer: React.FC<AIPhotoAnalyzerProps> = ({ onComplaintDetected, onClose }) => {
  const { language } = useAuth();
  const [phase, setPhase] = useState<'capture' | 'analyzing' | 'result'>('capture');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<typeof AI_DETECTIONS[0] | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: 'AI Photo Complaint Analyzer',
      subtitle: 'Take a photo — AI will detect the issue automatically',
      capture: 'Take Photo / Upload Image',
      analyzing: 'AI Analyzing Image...',
      detected: 'Issue Detected!',
      confidence: 'Confidence',
      autoFill: 'Auto-fill Complaint Form',
      retake: 'Retake Photo',
      steps: ['Detecting objects...', 'Classifying issue type...', 'Assessing severity...', 'Generating description...'],
    },
    hi: {
      title: 'AI फोटो शिकायत विश्लेषक',
      subtitle: 'फोटो लें — AI स्वचालित रूप से समस्या का पता लगाएगा',
      capture: 'फोटो लें / छवि अपलोड करें',
      analyzing: 'AI छवि का विश्लेषण कर रहा है...',
      detected: 'समस्या का पता चला!',
      confidence: 'विश्वास',
      autoFill: 'शिकायत फॉर्म स्वतः भरें',
      retake: 'फिर से फोटो लें',
      steps: ['वस्तुओं का पता लगाना...', 'समस्या प्रकार वर्गीकृत करना...', 'गंभीरता का आकलन...', 'विवरण तैयार करना...'],
    },
    as: {
      title: 'AI ফটো অভিযোগ বিশ্লেষক',
      subtitle: 'ফটো তুলক — AI স্বয়ংক্ৰিয়ভাৱে সমস্যা চিনাক্ত কৰিব',
      capture: 'ফটো তুলক / ছবি আপলোড কৰক',
      analyzing: 'AI ছবি বিশ্লেষণ কৰিছে...',
      detected: 'সমস্যা চিনাক্ত হৈছে!',
      confidence: 'আস্থা',
      autoFill: 'অভিযোগ ফৰ্ম স্বয়ংক্ৰিয়ভাৱে পূৰণ কৰক',
      retake: 'পুনৰ ফটো তুলক',
      steps: ['বস্তু চিনাক্ত কৰা হৈছে...', 'সমস্যাৰ প্ৰকাৰ শ্ৰেণীবদ্ধ কৰা হৈছে...', 'গুৰুত্ব মূল্যায়ন...', 'বিৱৰণ তৈয়াৰ কৰা হৈছে...'],
    }
  };
  const tx = t[language as keyof typeof t] || t.en;

  const simulateAnalysis = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setPhase('analyzing');
    setProgress(0);

    // Simulate AI processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const detected = AI_DETECTIONS[Math.floor(Math.random() * AI_DETECTIONS.length)];
          setResult(detected);
          setPhase('result');
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => simulateAnalysis(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    // Simulate camera capture with a placeholder
    simulateAnalysis('captured');
    toast.info(language === 'en' ? 'Photo captured! Analyzing...' : 'फोटो ली गई! विश्लेषण हो रहा है...');
  };

  const stepIndex = Math.floor((progress / 100) * tx.steps.length);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-600" /> {tx.title}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{tx.subtitle}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">✕</Button>
          </div>

          {/* Capture Phase */}
          {phase === 'capture' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer" onClick={() => fileRef.current?.click()}>
                <Camera className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">{tx.capture}</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, HEIC supported</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCameraCapture}>
                  <Camera className="w-4 h-4 mr-2" /> Camera
                </Button>
                <Button variant="outline" className="h-12" onClick={() => fileRef.current?.click()}>
                  📁 Gallery
                </Button>
              </div>
            </div>
          )}

          {/* Analyzing Phase */}
          {phase === 'analyzing' && (
            <div className="text-center py-6">
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{progress}%</span>
                </div>
              </div>
              <p className="font-semibold text-slate-800 mb-2">{tx.analyzing}</p>
              <p className="text-sm text-blue-600 animate-pulse">{tx.steps[Math.min(stepIndex, tx.steps.length - 1)]}</p>
              <div className="mt-4 bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 rounded-full h-2 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Result Phase */}
          {phase === 'result' && result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className={`p-4 rounded-xl border-2 ${result.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <result.icon className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">{tx.detected}</p>
                    <p className="font-semibold">{result.label}</p>
                  </div>
                  <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
                    {result.confidence}% {tx.confidence}
                  </Badge>
                </div>
                <p className="text-sm mt-2 leading-relaxed">{result.description}</p>
              </div>

              {/* AI Analysis Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Analysis Details</p>
                <div className="space-y-2">
                  {[
                    { label: 'Issue Type', value: result.label },
                    { label: 'Severity', value: result.confidence > 90 ? 'High' : 'Medium' },
                    { label: 'Recommended SLA', value: result.confidence > 90 ? '24 hours' : '3 days' },
                    { label: 'Auto-assigned to', value: 'Field Operations Team' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="font-medium text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => { setPhase('capture'); setResult(null); setCapturedImage(null); }}>
                  {tx.retake}
                </Button>
                <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                  onComplaintDetected(result.category, result.description);
                  toast.success('Complaint form auto-filled with AI analysis!');
                  onClose();
                }}>
                  <CheckCircle className="w-4 h-4 mr-2" /> {tx.autoFill}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPhotoComplaintAnalyzer;
