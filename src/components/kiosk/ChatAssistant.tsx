import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, ChevronDown, Sparkles, Mic, Loader2, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  actions?: { label: string; action: () => void }[];
  isEmergency?: boolean;
}

interface ChatAssistantProps {
  onNavigate: (module: string) => void;
}

// Expanded intent matching database
const INTENTS = [
  {
    keywords: ['bill', 'pay', 'electricity', 'water', 'gas', 'due', 'amount'],
    response: {
      en: "You can pay your electricity, water, and gas bills here. I can take you directly to the payment section.",
      hi: "आप यहाँ बिजली, पानी और गैस के बिल भर सकते हैं। मैं आपको सीधे भुगतान अनुभाग में ले जा सकता हूँ।"
    },
    action: { label: { en: 'Pay Bills', hi: 'बिल भरें' }, module: 'bills' }
  },
  {
    keywords: ['complaint', 'issue', 'problem', 'report', 'broken', 'garbage', 'pothole', 'street light', 'shikayat'],
    response: {
      en: "I can help you file a grievance regarding civic issues like potholes, streetlights, or sanitation. Would you like to report an issue?",
      hi: "मैं आपको गड्ढों, स्ट्रीटलाइट्स या सफाई जैसे नागरिक मुद्दों के बारे में शिकायत दर्ज करने में मदद कर सकता हूँ। क्या आप कोई समस्या रिपोर्ट करना चाहेंगे?"
    },
    action: { label: { en: 'File Complaint', hi: 'शिकायत दर्ज करें' }, module: 'complaint' }
  },
  {
    keywords: ['track', 'status', 'application', 'check', 'progress'],
    response: {
      en: "You can track the status of your existing applications or complaints using your reference ID.",
      hi: "आप अपनी संदर्भ आईडी का उपयोग करके अपने मौजूदा आवेदनों या शिकायतों की स्थिति को ट्रैक कर सकते हैं।"
    },
    action: { label: { en: 'Track Status', hi: 'स्थिति ट्रैक करें' }, module: 'track' }
  },
  {
    keywords: ['document', 'certificate', 'birth', 'death', 'caste', 'income', 'download'],
    response: {
      en: "You can apply for or download Birth, Death, or Caste certificates digitally from the Documents section.",
      hi: "आप दस्तावेज़ अनुभाग से डिजिटल रूप से जन्म, मृत्यु या जाति प्रमाण पत्र के लिए आवेदन या डाउनलोड कर सकते हैं।"
    },
    action: { label: { en: 'Documents', hi: 'दस्तावेज़' }, module: 'documents' }
  },
  {
    keywords: ['hello', 'hi', 'namaste', 'greetings', 'hey', 'start'],
    response: {
      en: "Namaste! I am SUVIDHA Sahayak. How can I assist you with your civic needs today?",
      hi: "नमस्ते! मैं सुविधा सहायक हूँ। आज मैं आपकी नागरिक आवश्यकताओं में कैसे सहायता कर सकता हूँ?"
    }
  },
  {
    keywords: ['who', 'what is this', 'about'],
    response: {
      en: "I am an AI-powered assistant designed to help citizens like you navigate government services easily.",
      hi: "मैं एक एआई-संचालित सहायक हूँ जिसे आप जैसे नागरिकों को सरकारी सेवाओं को आसानी से नेविगेट करने में मदद करने के लिए डिज़ाइन किया गया है।"
    }
  },
  {
    keywords: ['emergency', 'fire', 'ambulance', 'police', 'help', 'danger', 'accident'],
    response: {
      en: "EMERGENCY ALERT: If this is a life-threatening emergency, please call 112 immediately. I can show you emergency contacts.",
      hi: "आपातकालीन चेतावनी: यदि यह जीवन के लिए खतरा है, तो कृपया तुरंत 112 पर कॉल करें। मैं आपको आपातकालीन संपर्क दिखा सकता हूँ।"
    },
    isEmergency: true,
    action: { label: { en: 'View Alerts', hi: 'अलर्ट देखें' }, module: 'alerts' }
  },
  {
    keywords: ['time', 'hour', 'open', 'close', 'office'],
    response: {
      en: "Government offices are generally open from 9:30 AM to 6:00 PM, Monday to Saturday (except second and fourth Saturdays).",
      hi: "सरकारी कार्यालय आमतौर पर सोमवार से शनिवार (दूसरे और चौथे शनिवार को छोड़कर) सुबह 9:30 बजे से शाम 6:00 बजे तक खुले रहते हैं।"
    }
  },
  {
    keywords: ['aadhaar', 'uidai', 'id', 'card'],
    response: {
      en: "For Aadhaar related services, please visit the nearest Aadhaar Seva Kendra. We can only assist with linking Aadhaar to municipal services.",
      hi: "आधार संबंधित सेवाओं के लिए, कृपया निकटतम आधार सेवा केंद्र पर जाएं। हम केवल नगरपालिका सेवाओं के साथ आधार को लिंक करने में सहायता कर सकते हैं।"
    }
  }
];

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const { citizen } = useAuth();
  
  // Speak text using Web Speech API
  const speak = (text: string) => {
    if (isMuted) return;
    
    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    
    if (i18n.language === 'hi') {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(v => v.lang.includes('hi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-IN'; // Indian English preferred
      const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('Indian'));
      if (indianVoice) utterance.voice = indianVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greetingText = i18n.language === 'en' 
        ? `Namaste ${citizen?.name || 'Citizen'}! I am your SUVIDHA Assistant. How can I help you today?`
        : `नमस्ते ${citizen?.name || 'नागरिक'}! मैं आपका सुविधा सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?`;

      setMessages([
        {
          id: 'welcome',
          text: greetingText,
          sender: 'bot',
          timestamp: new Date(),
          actions: [
            { label: i18n.language === 'en' ? 'Pay Bills' : 'बिल भरें', action: () => onNavigate('bills') },
            { label: i18n.language === 'en' ? 'File Complaint' : 'शिकायत दर्ज करें', action: () => onNavigate('complaint') },
            { label: i18n.language === 'en' ? 'Status' : 'स्थिति', action: () => onNavigate('track') }
          ]
        }
      ]);
      
      // Don't auto-speak welcome message to avoid noise pollution, or maybe delay it?
      // speak(greetingText); 
    }
  }, [citizen, i18n.language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot thinking with variable delay
    setTimeout(() => {
      const response = generateResponse(userMsg.text);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      speak(response.text);
    }, 1000 + Math.random() * 500);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(i18n.language === 'en' ? 'Listening...' : 'सुन रहा हूँ...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        // Auto-send after a brief pause
        setTimeout(() => {
          const userMsg: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMsg]);
          setInput('');
          setIsTyping(true);
          
          setTimeout(() => {
            const response = generateResponse(transcript);
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
            speak(response.text);
          }, 1500);
        }, 500);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error occurred');
        setIsListening(false);
        toast.error('Voice input failed. Please try typing.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast.error('Voice input not supported in this browser.');
    }
  };

  const generateResponse = (text: string): Message => {
    const lowerText = text.toLowerCase();
    const lang = i18n.language === 'en' ? 'en' : 'hi';
    
    // Find matching intent
    const intent = INTENTS.find(i => i.keywords.some(k => lowerText.includes(k)));

    if (intent) {
      return {
        id: (Date.now() + 1).toString(),
        text: intent.response[lang],
        sender: 'bot',
        timestamp: new Date(),
        isEmergency: intent.isEmergency,
        actions: intent.action ? [{
          label: intent.action.label[lang],
          action: () => onNavigate(intent.action!.module)
        }] : undefined
      };
    }

    // Fallback response
    return {
      id: (Date.now() + 1).toString(),
      text: lang === 'en'
        ? "I'm not sure I understand. You can try asking about bills, complaints, certificates, or tracking status."
        : "मुझे क्षमा करें, मैं समझ नहीं पाया। आप बिल, शिकायत, प्रमाण पत्र या स्थिति ट्रैकिंग के बारे में पूछने का प्रयास कर सकते हैं।",
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        { label: lang === 'en' ? 'Show Menu' : 'मेनू दिखाएं', action: () => onNavigate('home') }
      ]
    };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-[350px] h-[500px] shadow-2xl border-0 ring-1 ring-black/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 bg-white/95 backdrop-blur-md">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary to-blue-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">SUVIDHA Sahayak</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20" 
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute TTS" : "Mute TTS"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-slate-50/50">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.isEmergency 
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.isEmergency && (
                      <div className="flex items-center gap-2 mb-2 text-red-600 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>EMERGENCY</span>
                      </div>
                    )}
                    <p>{msg.text}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.actions.map((action, idx) => (
                          <Button 
                            key={idx} 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            onClick={() => {
                              action.action();
                            }}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    <span className={`text-[10px] block mt-1 opacity-70 ${msg.sender === 'user' ? 'text-primary-foreground' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 bg-white border-t shrink-0 flex gap-2">
            <Input 
              placeholder={i18n.language === 'en' ? "Type your query..." : "अपना प्रश्न टाइप करें..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button 
              size="icon" 
              variant={isListening ? "destructive" : "secondary"}
              onClick={startListening}
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl bg-gradient-to-r from-primary to-blue-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center p-0 border-4 border-white/20"
        >
          <div className="relative">
            <MessageSquare className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        </Button>
      )}
    </div>
  );
};

export default ChatAssistant;
