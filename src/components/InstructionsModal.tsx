import React from 'react';
import { X, BookOpen, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmStart?: () => void;
  testTitle?: string;
  durationMinutes?: number;
  questionCount?: number;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  onConfirmStart,
  testTitle = 'Biotechnology: Principles & Applications (Chapter Test)',
  durationMinutes = 27,
  questionCount = 50
}) => {
  const [agreed, setAgreed] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                One Crack CBT Examination Guidelines & Undertaking
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                {testTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3.5 text-cyan-950 font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div><strong>Paper:</strong> {testTitle}</div>
              <div><strong>Questions:</strong> {questionCount} MCQs</div>
              <div><strong>Duration:</strong> {durationMinutes} Minutes</div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">1. Marking Scheme & Scoring Rules</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-emerald-700">+4.00 Marks</strong> for each correct response.</li>
              <li><strong className="text-rose-700">-1.00 Mark</strong> for each incorrect response (Negative marking).</li>
              <li><strong>0.00 Marks</strong> for unattempted or unanswered questions.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">2. Navigation & Palette Status Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-2 p-1.5 rounded bg-slate-100">
                <span className="w-5 h-5 rounded bg-slate-200 border border-slate-300 font-bold text-slate-700 flex items-center justify-center text-[10px]">1</span>
                <span>Not visited yet</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-rose-50 text-rose-900">
                <span className="w-5 h-5 rounded bg-rose-600 font-bold text-white flex items-center justify-center text-[10px]">2</span>
                <span>Not answered</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-emerald-50 text-emerald-900">
                <span className="w-5 h-5 rounded bg-emerald-600 font-bold text-white flex items-center justify-center text-[10px]">3</span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded bg-purple-50 text-purple-900">
                <span className="w-5 h-5 rounded-full bg-purple-700 font-bold text-white flex items-center justify-center text-[10px]">4</span>
                <span>Marked for review (Unanswered)</span>
              </div>
              <div className="col-span-full flex items-center gap-2 p-1.5 rounded bg-purple-100 text-purple-950">
                <span className="relative w-5 h-5 rounded-full bg-purple-800 font-bold text-white flex items-center justify-center text-[10px]">
                  5
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white"></span>
                </span>
                <span>Answered & Marked for Review (Evaluated in final score)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">3. Integrity & Anti-Cheat Restrictions</h4>
            <p className="text-xs text-slate-600">
              Switching tabs, minimizing your browser, or exiting fullscreen will be recorded as a proctor violation and displayed on your final report. Auto-submission occurs automatically when time runs out.
            </p>
          </div>

          {onConfirmStart && (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-cyan-700/60 mt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
                <span className="leading-snug text-slate-200">
                  I have read and understood all the instructions above and agree to adhere to all test portal regulations. I confirm that I am ready to start my examination.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>

          {onConfirmStart ? (
            <button
              onClick={() => {
                if (agreed) {
                  onClose();
                  onConfirmStart();
                }
              }}
              disabled={!agreed}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              I Agree & Launch Test
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Guidelines
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
