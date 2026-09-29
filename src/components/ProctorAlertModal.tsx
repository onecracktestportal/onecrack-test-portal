import React from 'react';
import { AlertOctagon, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProctorAlertModalProps {
  isOpen: boolean;
  violationCount: number;
  onDismiss: () => void;
}

export const ProctorAlertModal: React.FC<ProctorAlertModalProps> = ({
  isOpen,
  violationCount,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-600 text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-300">
          <AlertOctagon className="w-9 h-9 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-rose-700 tracking-tight mb-2">
          SECURITY & PROCTORING WARNING
        </h3>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 text-xs text-rose-900 text-left">
          <div className="flex items-center gap-2 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Unauthorized Window Switch / Tab Blur Detected!</span>
          </div>
          <p>
            You navigated away from the CBT exam environment. This incident has been logged with your Roll Number in the server database.
          </p>
        </div>

        <div className="bg-slate-100 rounded-lg py-2 px-3 mb-5 inline-block text-xs font-mono font-semibold text-slate-700 border border-slate-200">
          Total Recorded Infractions: <span className="text-rose-600 font-bold text-sm">{violationCount}</span>
        </div>

        <p className="text-xs text-slate-600 mb-6">
          Repeated violations will result in automated disqualification and forfeiture of your NEET chapter test attempt. Please remain on this screen.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>I UNDERSTAND & RETURN TO EXAM</span>
        </button>
      </div>
    </div>
  );
};
