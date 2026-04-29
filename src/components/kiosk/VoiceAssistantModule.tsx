import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useKiosk } from '@/context/KioskContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Mic, MicOff, Volume2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onBack: () => void;
  onNavigate: (module: string) => void;
}

const COMMANDS = {
  en: [
    { phrase: 'pay bill', module: 'bills', response: 'Taking you to bill payment.' },
    { phrase: 'electricity bill', module: 'bills', response: 'Opening electricity bills.' },
    { phrase: 'file complaint', module: 'complaint', response: 'Opening complaint registration.' },
    { phrase: 'track status', module: 'track', response: 'Opening status tracker.' },
    { phrase: 'new connection', module: 'newService', response: 'Opening new connection request.' },
    { phrase: 'update profile', module: 'credentials', response: 'Opening profile update.' },
    { phrase: 'download receipt', module: 'documents', response: 'Opening documents section.' },
    { phrase: 'book appointment', module: 'appointment', response: 'Opening appointment booking.' },
    { phrase: 'emergency', module: null, response: 'Emergency services: Fire 101, Ambulance 102, Police 100.' },
    { phrase: 'go home', module: 'home', response: 'Going back to home screen.' },
  ],
  hi: [
    { phrase: 'बिल भरें', module: 'bills', response: 'बिल भुगतान पर जा रहे हैं।' },
    { phrase: 'बिजली बिल', module: 'bills', response: 'बिजली बिल खुल रहा है।' },
    { phrase: 'शिकायत दर्ज', module: 'complaint', response: 'शिकायत पंजीकरण खुल रहा है।' },
    { phrase: 'स्थिति जांचें', module: 'track', response: 'स्थिति ट्रैकर खुल रहा है।' },
    { phrase: 'नया कनेक्शन', module: 'newService', response: 'नया कनेक्शन अनुरोध खुल रहा है।' },
    { phrase: 'आपातकाल', module: null, response: 'आपातकालीन सेवाएं: अग्निशमन 101, एम्बुलेंस 102, पुलिस 100।' },
    { phrase: 'होम', module: 'home', response: 'होम स्क्रीन पर जा रहे हैं।' },
  ]
};

const VoiceAssistantModule: React.FC<VoiceAssistantProps> = ({ onBack, onNavigate }) => {
  const { language, citizen } = useAuth();
  const { speak, ttsEnabled } = useKiosk();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<{ user: string; bot: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const lang = language as 'en' | 'hi';

  const greet = () => {
    const msg = lang === 'en'
      ? `Hello ${citizen?.name || 'Citizen'}! I'm SUVIDHA Voice Assistant. Say a command or tap the mic.`
      : `नमस्ते ${citizen?.name || 'नागरिक'}! मैं सुविधा वॉयस असिस्टेंट हूँ। कोई आदेश बोलें।`;
    setResponse(msg);
    if (ttsEnabled) speak(msg);
  };

  useEffect(() => { greet(); }, []);

  const processCommand = (text: string) => {
    setProcessing(true);
    const lower = text.toLowerCase();
    const commands = COMMANDS[lang] || COMMANDS.en;
    const match = commands.find(c => lower.includes(c.phrase));

    setTimeout(() => {
      if (match) {
        setResponse(match.response);
        if (ttsEnabled) speak(match.response);
        setHistory(prev => [...prev, { user: text, bot: match.response }]);
        if (match.module) {
          setTimeout(() => onNavigate(match.module!), 1500);
        }
      } else {
        const fallback = lang === 'en'
          ? `I heard: "${text}". Try saying: "Pay bill", "File complaint", "Track status", or "New connection".`
          : `मैंने सुना: "${text}"। कहने की कोशिश करें: "बिल भरें", "शिकायत दर्ज", "स्थिति जांचें"।`;
        setResponse(fallback);
        if (ttsEnabled) speak(fallback);
        setHistory(prev => [...prev, { user: text, bot: fallback }]);
      }
      setProcessing(false);
    }, 800);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setListening(true);
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        processCommand(t);
        setTranscript('');
      }
    };
    rec.onerror = () => { setListening(false); toast.error('Voice error. Try again.'); };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const commands = COMMANDS[lang] || COMMANDS.en;

  return (
    <div className="p-6 overflow-y-auto pb-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-12 w-12 rounded-full hover:bg-blue-50 text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Voice Assistant
          </h2>
          <p className="text-slate-500 text-sm">Speak to navigate — {lang === 'hi' ? 'हिंदी' : 'English'} supported</p>
        </div>
      </div>

      {/* Main Mic Area */}
      <Card className={`border-2 mb-6 transition-all ${listening ? 'border-red-400 bg-red-50/30' : 'border-blue-200 bg-blue-50/30'}`}>
        <CardContent className="p-8 text-center">
          {/* Animated Mic */}
          <div className="relative inline-flex mb-6">
            {listening && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping scale-150" />
                <div className="absolute inset-0 rounded-full bg-red-400 opacity-10 animate-pulse scale-200" />
              </>
            )}
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                listening ? 'bg-red-500 scale-110' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
              }`}
            >
              {listening ? <MicOff className="w-14 h-14 text-white" /> : <Mic className="w-14 h-14 text-white" />}
            </button>
          </div>

          {/* Status */}
          <p className={`text-lg font-semibold mb-2 ${listening ? 'text-red-600' : 'text-slate-700'}`}>
            {listening ? (lang === 'hi' ? '🎙️ सुन रहा हूँ...' : '🎙️ Listening...') : (lang === 'hi' ? 'माइक दबाएं' : 'Tap to speak')}
          </p>

          {/* Live transcript */}
          {transcript && (
            <div className="bg-white border border-blue-200 rounded-xl px-4 py-2 mb-3 animate-in fade-in">
              <p className="text-blue-700 font-medium italic">"{transcript}"</p>
            </div>
          )}

          {/* Response */}
          {processing ? (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{lang === 'hi' ? 'समझ रहा हूँ...' : 'Processing...'}</span>
            </div>
          ) : response && (
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-left animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{response}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Commands */}
      <Card className="border-slate-200 mb-6">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            {lang === 'hi' ? 'उपलब्ध आदेश:' : 'Available Commands:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {commands.map((c, i) => (
              <button
                key={i}
                onClick={() => processCommand(c.phrase)}
                className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
              >
                "{c.phrase}"
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">Conversation History</p>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-end">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-2xl rounded-tr-none max-w-[80%]">"{h.user}"</span>
                  </div>
                  <div className="flex justify-start">
                    <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-2xl rounded-tl-none max-w-[80%]">{h.bot}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceAssistantModule;
