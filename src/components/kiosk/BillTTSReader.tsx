import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

interface BillTTSReaderProps {
  billType: string;
  amount: number;
  dueDate: string;
  units: number;
  consumerName: string;
  consumerId: string;
}

const BillTTSReader: React.FC<BillTTSReaderProps> = ({ billType, amount, dueDate, units, consumerName, consumerId }) => {
  const { language } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getSegments = () => {
    if (language === 'hi') {
      return [
        { text: `नमस्ते ${consumerName}।`, highlight: `नमस्ते ${consumerName}।` },
        { text: `आपका ${billType === 'electricity' ? 'बिजली' : billType === 'gas' ? 'गैस' : 'पानी'} बिल तैयार है।`, highlight: `${billType} बिल` },
        { text: `देय राशि: ${amount.toLocaleString('hi-IN')} रुपये।`, highlight: `₹${amount.toLocaleString('en-IN')}` },
        { text: `नियत तारीख: ${new Date(dueDate).toLocaleDateString('hi-IN')}.`, highlight: new Date(dueDate).toLocaleDateString('en-IN') },
        { text: `उपभोग: ${units} यूनिट।`, highlight: `${units} units` },
        { text: `कृपया समय पर भुगतान करें।`, highlight: 'Pay Now' },
      ];
    } else if (language === 'as') {
      return [
        { text: `নমস্কাৰ ${consumerName}।`, highlight: `নমস্কাৰ ${consumerName}।` },
        { text: `আপোনাৰ ${billType} বিল প্ৰস্তুত।`, highlight: `${billType} বিল` },
        { text: `পৰিশোধযোগ্য পৰিমাণ: ${amount} টকা।`, highlight: `₹${amount.toLocaleString('en-IN')}` },
        { text: `নিৰ্ধাৰিত তাৰিখ: ${new Date(dueDate).toLocaleDateString()}.`, highlight: new Date(dueDate).toLocaleDateString('en-IN') },
        { text: `ব্যৱহাৰ: ${units} ইউনিট।`, highlight: `${units} units` },
        { text: `অনুগ্ৰহ কৰি সময়মতে পৰিশোধ কৰক।`, highlight: 'Pay Now' },
      ];
    }
    return [
      { text: `Hello ${consumerName}.`, highlight: `Hello ${consumerName}.` },
      { text: `Your ${billType} bill is ready.`, highlight: `${billType} bill` },
      { text: `Amount due: Rupees ${amount.toLocaleString('en-IN')}.`, highlight: `₹${amount.toLocaleString('en-IN')}` },
      { text: `Due date: ${new Date(dueDate).toLocaleDateString('en-IN')}.`, highlight: new Date(dueDate).toLocaleDateString('en-IN') },
      { text: `Units consumed: ${units}.`, highlight: `${units} units` },
      { text: `Please pay on time to avoid late fees.`, highlight: 'Pay Now' },
    ];
  };

  const segments = getSegments();

  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setCurrentSegment(0);
    setIsPlaying(true);

    const speakSegment = (index: number) => {
      if (index >= segments.length) {
        setIsPlaying(false);
        setCurrentSegment(-1);
        return;
      }
      setCurrentSegment(index);
      const utt = new SpeechSynthesisUtterance(segments[index].text);
      utt.lang = language === 'hi' ? 'hi-IN' : language === 'as' ? 'as-IN' : 'en-IN';
      utt.rate = 0.9;
      utt.onend = () => speakSegment(index + 1);
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    speakSegment(0);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentSegment(-1);
  };

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const billRows = [
    { label: language === 'hi' ? 'उपभोक्ता' : language === 'as' ? 'গ্ৰাহক' : 'Consumer', value: consumerName, seg: 0 },
    { label: language === 'hi' ? 'सेवा' : language === 'as' ? 'সেৱা' : 'Service', value: billType.charAt(0).toUpperCase() + billType.slice(1), seg: 1 },
    { label: language === 'hi' ? 'देय राशि' : language === 'as' ? 'পৰিশোধযোগ্য' : 'Amount Due', value: `₹${amount.toLocaleString('en-IN')}`, seg: 2, bold: true },
    { label: language === 'hi' ? 'नियत तारीख' : language === 'as' ? 'নিৰ্ধাৰিত তাৰিখ' : 'Due Date', value: new Date(dueDate).toLocaleDateString('en-IN'), seg: 3 },
    { label: language === 'hi' ? 'यूनिट' : language === 'as' ? 'ইউনিট' : 'Units', value: `${units} units`, seg: 4 },
  ];

  return (
    <Card className="border-blue-200 bg-blue-50/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            {language === 'hi' ? 'बिल पाठक (ऑडियो)' : language === 'as' ? 'বিল পাঠক (অডিঅ)' : 'Bill Reader (Audio)'}
          </p>
          <div className="flex gap-2">
            {!isPlaying ? (
              <Button size="sm" onClick={speak} className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1">
                <Play className="w-3 h-3" /> {language === 'hi' ? 'सुनें' : language === 'as' ? 'শুনক' : 'Listen'}
              </Button>
            ) : (
              <Button size="sm" onClick={pause} variant="outline" className="h-8 gap-1">
                <Pause className="w-3 h-3" /> Pause
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={stop} className="h-8">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Karaoke-style bill display */}
        <div className="space-y-2">
          {billRows.map((row, i) => (
            <div key={i} className={`flex justify-between p-2.5 rounded-lg transition-all duration-300 ${currentSegment === row.seg ? 'bg-blue-600 text-white scale-[1.02] shadow-md' : 'bg-white border border-slate-100'}`}>
              <span className={`text-sm ${currentSegment === row.seg ? 'text-blue-100' : 'text-slate-500'}`}>{row.label}</span>
              <span className={`text-sm font-semibold ${row.bold ? 'text-lg' : ''} ${currentSegment === row.seg ? 'text-white' : 'text-slate-900'}`}>{row.value}</span>
            </div>
          ))}
        </div>

        {isPlaying && currentSegment >= 0 && (
          <div className="mt-3 p-2 bg-blue-100 rounded-lg border border-blue-200 animate-pulse">
            <p className="text-xs text-blue-700 text-center font-medium">🔊 {segments[currentSegment]?.text}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillTTSReader;
