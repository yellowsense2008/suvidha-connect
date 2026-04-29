import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommanderProps {
  onNavigate: (module: string) => void;
}

const VoiceCommander: React.FC<VoiceCommanderProps> = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const { t, i18n } = useTranslation();
  const language = i18n.language; // Add this line to access language easily
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      // Set language based on current i18n language
      recognitionInstance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice Command received');
        processCommand(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error(t('voice_error') || 'Voice command failed. Try again.');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [i18n.language]);

  const processCommand = (command: string) => {
    // Navigation Commands
    if (command.includes('electricity') || command.includes('power') || command.includes('bijli')) {
      onNavigate('bills');
      toast.success('Opening Electricity Bills');
    } else if (command.includes('water') || command.includes('pani')) {
      onNavigate('bills'); // Usually bills covers water too
      toast.success('Opening Water Bills');
    } else if (command.includes('waste') || command.includes('garbage') || command.includes('kachra')) {
      onNavigate('waste');
      toast.success('Opening Waste Management');
    } else if (command.includes('complaint') || command.includes('shikayat')) {
      onNavigate('complaint');
    } else if (command.includes('home') || command.includes('back') || command.includes('wapas')) {
      onNavigate('home');
    } 
    // Language Commands
    else if (command.includes('hindi') || command.includes('hindustani')) {
      i18n.changeLanguage('hi');
      toast.success('Language switched to Hindi');
    } else if (command.includes('english') || command.includes('angrezi')) {
      i18n.changeLanguage('en');
      toast.success('Language switched to English');
    } else {
      toast('Command not recognized', { description: `You said: "${command}"` });
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
        toast.info('Listening...', { description: 'Say "Electricity", "Waste", "Hindi", etc.' });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!recognition) return null;

  return (
    <div className="fixed bottom-6 right-24 z-50 flex flex-col items-end gap-2">
      {/* Listening Feedback Card */}
      {isListening && (
        <div className="bg-black/80 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-xs border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="font-bold text-sm">
               {language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            {language === 'hi' ? 'कहने की कोशिश करें:' : 'Try saying:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {(language === 'hi' 
              ? ['बिजली', 'पानी', 'कचरा', 'अंग्रेजी', 'वापस'] 
              : ['Electricity', 'Water', 'Waste', 'Hindi', 'Home']
            ).map(cmd => (
              <span key={cmd} className="bg-white/10 text-white text-[10px] px-2 py-1 rounded-md border border-white/20">
                {cmd}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="relative group">
        {/* Pulsing Ring Effect */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping duration-1000" />
            <div className="absolute -inset-2 rounded-full bg-red-500 opacity-10 animate-pulse duration-2000" />
          </>
        )}
        
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className={`rounded-full w-16 h-16 shadow-lg transition-all duration-300 ${isListening ? 'scale-110 ring-4 ring-red-500/30' : 'hover:scale-105 hover:shadow-xl'}`}
          onClick={toggleListening}
        >
          {isListening ? <Mic className="w-8 h-8 animate-bounce" /> : <MicOff className="w-8 h-8" />}
        </Button>
        
        {/* Tooltip for non-listening state */}
        {!isListening && (
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {language === 'hi' ? 'आवाज़ से आदेश दें' : 'Voice Commands'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommander;
