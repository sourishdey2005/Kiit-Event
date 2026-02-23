import React from 'react';
import { QrCode } from 'lucide-react';

export function QRPlaceholder({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-2xl shadow-inner">
      <div className="relative p-4 bg-slate-50 rounded-xl">
        <QrCode className="w-48 h-48 text-primary" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <p className="text-xs font-bold break-all max-w-[150px]">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
        {value.slice(0, 8)}...{value.slice(-8)}
      </p>
    </div>
  );
}