import React from 'react';
import { X, FileText, CheckCircle } from 'lucide-react';
import { Question } from '../types/exam';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Complete Question Paper View (50 Questions)
              </h3>
              <p className="text-xs text-slate-500">
                Biotechnology: Principles & Applications • NEET High-Yield Test
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question List */}
        <div className="p-5 overflow-y-auto space-y-6 divide-y divide-slate-100 text-xs sm:text-sm">
          {questions.map((q, idx) => {
            const userChoice = responses[q.id];

            return (
              <div key={q.id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      Q{idx + 1}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">
                      [{q.topic}]
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onJumpToQuestion(idx);
                      onClose();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline shrink-0"
                  >
                    Go to Question
                  </button>
                </div>

                <p className="font-medium text-slate-800 mb-3 whitespace-pre-line leading-relaxed">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2 rounded border text-xs ${
                        userChoice === opt.key
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold mr-1.5">({opt.key})</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                {userChoice && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Your current selection: Option ({userChoice})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
          >
            Close Question Paper
          </button>
        </div>
      </div>
    </div>
  );
};
