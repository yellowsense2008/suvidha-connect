import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Printer, Download, X } from 'lucide-react';

export interface ThermalReceiptData {
  type: 'payment' | 'complaint' | 'request' | 'update';
  title: string;
  refId: string;
  rows: { label: string; value: string; bold?: boolean }[];
  footer?: string;
  timestamp?: string;
}

interface ThermalReceiptProps {
  data: ThermalReceiptData;
  onClose?: () => void;
  language?: 'en' | 'hi' | 'as';
}

const PRINT_LABEL = { en: 'Print Receipt', hi: 'रसीद प्रिंट करें', as: 'ৰচিদ প্ৰিন্ট কৰক' };
const CLOSE_LABEL = { en: 'Close', hi: 'बंद करें', as: 'বন্ধ কৰক' };
const GOVT_LINE = { en: 'Government of India', hi: 'भारत सरकार', as: 'ভাৰত চৰকাৰ' };
const THANK_YOU = { en: 'Thank you for using SUVIDHA Kiosk', hi: 'SUVIDHA कियोस्क का उपयोग करने के लिए धन्यवाद', as: 'SUVIDHA কিঅস্ক ব্যৱহাৰ কৰাৰ বাবে ধন্যবাদ' };
const COMPUTER_GENERATED = { en: 'This is a computer generated receipt', hi: 'यह एक कंप्यूटर जनित रसीद है', as: 'এইটো এটা কম্পিউটাৰ জেনেৰেটেড ৰচিদ' };

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ data, onClose, language = 'en' }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const lang = language in PRINT_LABEL ? language : 'en';
  const ts = data.timestamp || new Date().toLocaleString('en-IN');

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=700');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>SUVIDHA Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Space Mono', 'Courier New', monospace; background: white; }
            .receipt { width: 302px; margin: 0 auto; padding: 12px; font-size: 11px; }
            .center { text-align: center; }
            .bold { font-weight: 700; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .row .val { font-weight: 700; text-align: right; max-width: 55%; word-break: break-all; }
            .tear { border-top: 2px dashed #000; margin: 10px 0; position: relative; }
            .tear::before { content: '✂'; position: absolute; top: -10px; left: -4px; font-size: 14px; }
            .qr { display: flex; justify-content: center; margin: 8px 0; }
            .small { font-size: 9px; color: #555; }
            .tricolor { height: 4px; background: linear-gradient(90deg,#FF9933 0%,#fff 50%,#138808 100%); margin-bottom: 8px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body onload="window.print();window.close()">
          ${content.innerHTML}
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Receipt Preview</span>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />{PRINT_LABEL[lang]}
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-500" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Thermal receipt body */}
        <div className="overflow-y-auto max-h-[75vh] bg-white p-3 flex justify-center">
          <div
            ref={receiptRef}
            className="w-[302px] font-mono text-[11px] text-black bg-white"
            style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}
          >
            {/* Tricolor bar */}
            <div className="h-1 w-full mb-2" style={{ background: 'linear-gradient(90deg,#FF9933 0%,#fff 50%,#138808 100%)' }} />

            {/* Header */}
            <div className="text-center mb-2">
              <div className="font-bold text-base tracking-widest">SUVIDHA</div>
              <div className="text-[9px] text-gray-600 leading-tight">Smart Civic Services Kiosk</div>
              <div className="text-[9px] text-gray-500">{GOVT_LINE[lang]}</div>
              <div className="text-[9px] text-gray-400">Kiosk ID: KIOSK-SEC5-001</div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Receipt type */}
            <div className="text-center font-bold text-sm tracking-wider mb-1 uppercase">{data.title}</div>
            <div className="text-center text-[9px] text-gray-500 mb-2">{ts}</div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Ref ID */}
            <div className="text-center mb-2">
              <div className="text-[9px] text-gray-500">Reference / Ticket ID</div>
              <div className="font-bold text-sm tracking-widest">{data.refId}</div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Data rows */}
            <div className="space-y-1 mb-2">
              {data.rows.map((row, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span className="text-gray-600 shrink-0">{row.label}</span>
                  <span className={`text-right break-all ${row.bold ? 'font-bold' : ''}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* QR Code */}
            <div className="flex flex-col items-center gap-1 my-3">
              <QRCodeSVG
                value={JSON.stringify({ refId: data.refId, type: data.type, ts })}
                size={90}
                level="M"
                includeMargin={false}
              />
              <div className="text-[8px] text-gray-400 text-center">Scan to verify</div>
            </div>

            <div className="border-t border-dashed border-black my-2" />

            {/* Footer */}
            <div className="text-center space-y-1">
              <div className="text-[9px] text-gray-600">{THANK_YOU[lang]}</div>
              <div className="text-[8px] text-gray-400">{COMPUTER_GENERATED[lang]}</div>
              {data.footer && <div className="text-[9px] font-bold mt-1">{data.footer}</div>}
              <div className="text-[8px] text-gray-400 mt-1">DPDP Compliant • ISO 27001</div>
            </div>

            {/* Tear line */}
            <div className="relative border-t-2 border-dashed border-black mt-4 mb-1">
              <span className="absolute -top-3 -left-1 text-base">✂</span>
            </div>
            <div className="text-center text-[8px] text-gray-400">— Tear Here —</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
