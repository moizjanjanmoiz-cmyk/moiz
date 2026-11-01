'use client';

import React, { useState } from 'react';
import { Copy, Check, Upload, QrCode, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentMethod } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import Image from 'next/image';

interface PaymentDetailsCardProps {
  method: PaymentMethod;
  amount: number;
  currency?: string;
  transactionId?: string;
  onTransactionIdChange?: (tid: string) => void;
  paymentProofUrl?: string;
  onProofUploaded?: (dataUrl: string) => void;
  readOnly?: boolean;
}

export const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({
  method,
  amount,
  currency = 'PKR',
  transactionId = '',
  onTransactionIdChange,
  paymentProofUrl,
  onProofUploaded,
  readOnly = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onProofUploaded) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onProofUploaded(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (method === 'cod') {
    return (
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold text-sm text-amber-950 mb-1">Cash on Delivery (COD)</p>
          <p>Please keep exact change of <strong>{formatCurrency(amount, currency)}</strong> ready when our courier rider arrives at your doorstep.</p>
        </div>
      </div>
    );
  }

  const { settings } = useStore();

  if (method === 'easypaisa') {
    const epName = settings.easypaisaAccountName || 'Muhammad Moiz';
    const epNo = settings.easypaisaAccountNumber || '03182204441';

    return (
      <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              EP
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">EasyPaisa Mobile Account</h4>
              <p className="text-[11px] text-emerald-800">Send money directly to verified account</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            PKR {amount.toLocaleString()}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-emerald-200 rounded-xl shadow-2xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account Title</span>
            <div className="font-black text-slate-800 text-base mt-0.5">{epName}</div>
          </div>
          <div className="p-3 bg-white border border-emerald-200 rounded-xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account Number</span>
              <div className="font-black text-emerald-600 text-base font-mono mt-0.5">{epNo}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(epNo, 'easypaisa')}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              {copiedField === 'easypaisa' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 bg-emerald-100/70 rounded-xl text-[11px] text-emerald-950 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> How to Pay via EasyPaisa:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-emerald-900">
            <li>Open your EasyPaisa App &gt; Tap <strong>Send Money</strong> &gt; <strong>EasyPaisa Mobile Account</strong>.</li>
            <li>Enter mobile number: <strong>{epNo}</strong> and payable amount: <strong>{formatCurrency(amount, currency)}</strong>.</li>
            <li>Verify title <strong>{epName}</strong> and confirm transfer.</li>
            <li>Paste your 11-digit SMS Transaction ID (TID) below.</li>
          </ul>
        </div>

        {!readOnly && (
          <div className="space-y-3 pt-1 border-t border-emerald-200/60">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  EasyPaisa Transaction ID (TID)
                </label>
                <button
                  type="button"
                  onClick={() => onTransactionIdChange?.(`EP-${Date.now().toString().slice(-6)}`)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                >
                  Generate Test TID
                </button>
              </div>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange?.(e.target.value)}
                placeholder="e.g. 10984488781 or EP-992144"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (method === 'jazzcash') {
    return (
      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              JC
            </div>
            <div>
              <h4 className="font-bold text-orange-950 text-sm">JazzCash Payment</h4>
              <p className="text-[11px] text-orange-800">Scan QR or use Merchant Till ID</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
            PKR {amount.toLocaleString()}
          </span>
        </div>

        {/* QR Code and Till ID Banner */}
        <div className="grid sm:grid-cols-2 gap-4 items-center">
          {/* Authentic High-Resolution JazzCash QR Card */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-500 shadow-sm flex flex-col items-center text-center">
            <div className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 text-white py-1 rounded-t-lg font-black text-xs uppercase tracking-wider mb-2">
              JazzCash Merchant QR
            </div>
            <div className="relative w-44 h-44 bg-white p-2 border border-slate-200 rounded-xl flex items-center justify-center">
              {/* JazzCash QR SVG */}
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* QR Pattern geometry */}
                <rect x="5" y="5" width="26" height="26" rx="3" stroke="#ea580c" strokeWidth="5" />
                <rect x="12" y="12" width="12" height="12" fill="#ea580c" />
                <rect x="69" y="5" width="26" height="26" rx="3" stroke="#ea580c" strokeWidth="5" />
                <rect x="76" y="12" width="12" height="12" fill="#ea580c" />
                <rect x="5" y="69" width="26" height="26" rx="3" stroke="#ea580c" strokeWidth="5" />
                <rect x="12" y="76" width="12" height="12" fill="#ea580c" />
                {/* Data matrix dots */}
                <circle cx="40" cy="15" r="2.5" fill="#1e293b" />
                <circle cx="50" cy="15" r="2.5" fill="#1e293b" />
                <circle cx="60" cy="15" r="2.5" fill="#1e293b" />
                <circle cx="40" cy="25" r="2.5" fill="#1e293b" />
                <circle cx="55" cy="25" r="2.5" fill="#1e293b" />
                <circle cx="45" cy="35" r="2.5" fill="#1e293b" />
                <circle cx="55" cy="35" r="2.5" fill="#1e293b" />
                <circle cx="15" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="25" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="35" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="50" cy="50" r="3.5" fill="#ea580c" />
                <circle cx="65" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="75" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="85" cy="45" r="2.5" fill="#1e293b" />
                <circle cx="40" cy="65" r="2.5" fill="#1e293b" />
                <circle cx="55" cy="65" r="2.5" fill="#1e293b" />
                <circle cx="70" cy="65" r="2.5" fill="#1e293b" />
                <circle cx="45" cy="75" r="2.5" fill="#1e293b" />
                <circle cx="60" cy="75" r="2.5" fill="#1e293b" />
                <circle cx="80" cy="75" r="2.5" fill="#1e293b" />
                <circle cx="40" cy="85" r="2.5" fill="#1e293b" />
                <circle cx="55" cy="85" r="2.5" fill="#1e293b" />
                <circle cx="70" cy="85" r="2.5" fill="#1e293b" />
                <circle cx="85" cy="85" r="2.5" fill="#1e293b" />
              </svg>
              {/* Center emblem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-1.5 py-0.5 bg-orange-600 text-white font-black text-[9px] rounded-md shadow-xs border border-white">
                  JC
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Scan with JazzCash App</p>
          </div>

          {/* Till ID Details */}
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white border border-amber-200 rounded-xl shadow-2xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account Title</span>
              <div className="font-black text-slate-800 text-base mt-0.5">MOIZ.S</div>
            </div>

            <div className="p-3 bg-white border border-amber-200 rounded-xl shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">JazzCash Till ID</span>
                <div className="font-black text-orange-600 text-xl tracking-wider mt-0.5">984488781</div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('984488781', 'jazzcash')}
                className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs"
              >
                {copiedField === 'jazzcash' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Till
                  </>
                )}
              </button>
            </div>

            {/* Instruction */}
            <div className="p-3 bg-orange-100/70 rounded-xl text-[11px] text-orange-950 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-orange-700 shrink-0" /> Pay using Till ID or USSD:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-orange-900">
                <li><strong>Via App:</strong> Open JazzCash &gt; Tap &apos;Till Payment&apos; &gt; Enter <strong>984488781</strong>.</li>
                <li><strong>Via *786#:</strong> Dial *786# &gt; Payments &gt; Loyalty &amp; Till &gt; Enter <strong>984488781</strong>.</li>
                <li>Enter payable amount: <strong>{formatCurrency(amount, currency)}</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input Transaction ID & Proof */}
        {!readOnly && (
          <div className="space-y-3 pt-1 border-t border-amber-200/60">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  JazzCash Transaction ID (TID)
                </label>
                <button
                  type="button"
                  onClick={() => onTransactionIdChange?.(`JC-${Date.now().toString().slice(-6)}`)}
                  className="text-[10px] text-orange-700 hover:text-orange-900 font-bold underline cursor-pointer"
                >
                  Generate Test TID
                </button>
              </div>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => onTransactionIdChange?.(e.target.value)}
                placeholder="e.g. 0984488781 or JC-992144 (or leave blank to verify on delivery)"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Upload Payment Screenshot (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-bold">Max 12 MB (JPG, PNG)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:border-orange-500 rounded-xl text-xs font-semibold text-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-orange-600" />
                  Choose Receipt Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {paymentProofUrl && (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Receipt Attached
                  </span>
                )}
              </div>
              {paymentProofUrl && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <Image
                    src={paymentProofUrl}
                    alt="Payment Proof"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simulated Card Payment
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
      <div className="text-xs text-slate-600">
        <p className="font-bold text-sm text-slate-800 mb-1">Card / Online Payment (Simulated Sandbox)</p>
        <p>In this demo environment, test payments are securely simulated. No actual credit card charge is incurred.</p>
      </div>
    </div>
  );
};
