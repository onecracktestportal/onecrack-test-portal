import React from 'react';
import { X, FileText, CheckCircle, Download, ShieldCheck, Printer } from 'lucide-react';
import { Question } from '../types/exam';
import { OneCrackLogo } from './OneCrackLogo';
import { generateOneCrackPDFReport } from '../utils/pdfReportGenerator';

interface QuestionPaperModalProps {
  isOpen: boolean;
  questions: Question[];
  responses: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  onClose: () => void;
  onJumpToQuestion: (index: number) => void;
}

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({
  isOpen,
  questions,
  responses,
  onClose,
  onJumpToQuestion,
}) => {
  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    const mockTest: any = {
      id: 'test-paper-view',
      title: 'NEET Official Question Paper',
      chapter: 'NEET UG Core Curriculum',
      subject: 'NEET Assessment',
      durationMinutes: 27,
      questionCount: questions.length,
      markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
      questions
    };

    const doc = generateOneCrackPDFReport({
      test: mockTest,
      candidateName: 'Candidate Aspirant',
      candidateRoll: 'ONE-CRACK-NEET',
      candidateAppNo: 'NTA-NEET-2026'
    });

    doc.save(`OneCrack_QuestionPaper_${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in overflow-hidden relative">
        
        {/* Background Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex items-center justify-center -rotate-30 z-0">
          <div className="text-7xl font-black text-black uppercase tracking-widest text-center">
            One Crack Test Portal<br />NEET CBT SECURE
          </div>
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <OneCrackLogo size="sm" showSubtitle={false} />
            <div>
              <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>Complete NEET Question Paper & Option IDs</span>
                <span className="bg-cyan-900 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-700">
                  {questions.length} MCQs
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Official NTA CBT Format with 6-digit Option Codes, PYQs & Peer Metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
              title="Download Watermarked PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 divide-y divide-slate-100 text-xs sm:text-sm z-10">
          {questions.map((q, idx) => {
            const userChoice = responses[q.id];
            const correctOpt = q.options.find(o => o.key === q.correctAnswer);
            const peerAcc = q.peerStats?.correctPercent || (q.difficulty === 'Easy' ? 78 : q.difficulty === 'Medium' ? 58 : 38);

            return (
              <div key={q.id} className="pt-5 first:pt-0 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded text-xs">
                      Q{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-700 font-semibold bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                      {q.questionCode || `QID-${830100 + q.id}`}
                    </span>
                    <span className="text-slate-600 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {q.topic}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                      [{q.difficulty || 'Medium'}] {q.pyqYear ? `• ${q.pyqYear}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onJumpToQuestion(idx);
                      onClose();
                    }}
                    className="text-xs text-cyan-600 hover:text-cyan-800 font-bold underline shrink-0 cursor-pointer"
                  >
                    Go to Question →
                  </button>
                </div>

                <p className="font-medium text-slate-900 whitespace-pre-line leading-relaxed text-sm">
                  {q.question}
                </p>

                {/* Options Grid with Option Codes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        userChoice === opt.key
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold text-slate-900 shrink-0">({opt.key})</span>
                      <div className="flex-1">
                        <span>{opt.text}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Option Code: <strong className="text-slate-600">{opt.optionCode}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Peer accuracy graph bar and metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Expected Peer Accuracy:</span>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${peerAcc}%` }}></div>
                    </div>
                    <strong className="text-cyan-900 font-bold text-xs">{peerAcc}%</strong>
                  </div>

                  {userChoice && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Selected: Option ({userChoice})</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 rounded-b-2xl z-10">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Watermarked & Protected • One Crack National CBT Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Question Paper
          </button>
        </div>
      </div>
    </div>
  );
};
