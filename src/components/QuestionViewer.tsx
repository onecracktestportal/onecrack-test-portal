import React from 'react';
import { Question, QuestionStatus } from '../types/exam';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Bookmark, 
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface QuestionViewerProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  currentStatus: QuestionStatus;
  language: 'EN' | 'HI';
  onSelectOption: (optionKey: 'A' | 'B' | 'C' | 'D') => void;
  onClearResponse: () => void;
  onSaveAndNext: () => void;
  onSaveAndMarkForReview: () => void;
  onMarkForReviewAndNext: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLanguageChange: (lang: 'EN' | 'HI') => void;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  language,
  onSelectOption,
  onClearResponse,
  onSaveAndNext,
  onSaveAndMarkForReview,
  onMarkForReviewAndNext,
  onPrevious,
  onNext,
  onLanguageChange,
}) => {
  return (
    <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Question Info Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded">
            Q. {questionNumber} / {totalQuestions}
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
            {question.topic}
          </span>
          <span className="text-xs text-slate-600 bg-slate-100 font-mono px-2 py-0.5 rounded border border-slate-200">
            {question.difficulty}
          </span>
          {question.pyqYear && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
              PYQ: {question.pyqYear}
            </span>
          )}
          {question.peerStats && (
            <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-300 px-2 py-0.5 rounded hidden sm:inline-flex items-center gap-1">
              <span>Expected Accuracy:</span>
              <strong className="text-cyan-900">{question.peerStats.correctPercent}%</strong>
            </span>
          )}
        </div>

        {/* Marking Scheme & Language Selector */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            <span className="text-emerald-600 font-bold">+4.00</span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-600 font-bold">-1.00</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">View in:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as 'EN' | 'HI')}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-0.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="EN">English</option>
              <option value="HI">Hindi (हिंदी)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-xs">
          {/* Question Text */}
          <div className="mb-6">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg shrink-0">
                Q{questionNumber}.
              </span>
              <p className="font-medium text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {question.question}
              </p>
            </div>
          </div>

          {/* 4 MCQ Options */}
          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = selectedOption === opt.key;

              return (
                <div
                  key={opt.key}
                  onClick={() => onSelectOption(opt.key)}
                  className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-lg border-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Custom Radio Button */}
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </div>
                  </div>

                  {/* Option Label (A, B, C, D) & Text */}
                  <div className="flex-1 text-sm sm:text-base font-normal text-slate-800">
                    <span className="font-bold text-slate-700 mr-2">({opt.key})</span>
                    <span className="whitespace-pre-line leading-relaxed">{opt.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice Info */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Click on the option to select. Click "Clear Response" to deselect your answer.</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer (NTA NEET CBT Action Buttons) */}
      <div className="bg-white border-t border-slate-200 px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Group: Save & Mark for Review / Mark for Review & Next */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSaveAndMarkForReview}
              className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-semibold text-xs rounded transition flex items-center gap-1.5 shadow-xs"
              title="Save response and mark for later review (counted in evaluation if answered)"
            >
              <CheckCircle className="w-3.5 h-3.5 text-purple-700" />
              <span>Save & Mark For Review</span>
            </button>

            <button
              onClick={onMarkForReviewAndNext}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs rounded transition flex items-center gap-1.5"
              title="Mark for review without answering and move to next question"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-600" />
              <span>Mark For Review & Next</span>
            </button>

            <button
              onClick={onClearResponse}
              disabled={!selectedOption}
              className={`px-3.5 py-2 border font-semibold text-xs rounded transition flex items-center gap-1.5 ${
                selectedOption
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
              title="Clear selected option"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Response</span>
            </button>
          </div>

          {/* Right Group: Prev, Next, Save & Next */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onPrevious}
              disabled={questionNumber <= 1}
              className={`px-3.5 py-2 border font-semibold text-xs rounded transition flex items-center gap-1 ${
                questionNumber > 1
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={onNext}
              disabled={questionNumber >= totalQuestions}
              className={`px-3.5 py-2 border font-semibold text-xs rounded transition flex items-center gap-1 ${
                questionNumber < totalQuestions
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onSaveAndNext}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE & NEXT</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
