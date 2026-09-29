import React from 'react';
import { Question, QuestionStatus } from '../types/exam';
import { AlertCircle, CheckCircle2, Bookmark, XCircle, Send } from 'lucide-react';

interface ExamSummaryModalProps {
  isOpen: boolean;
  questions: Question[];
  questionStatuses: Record<number, QuestionStatus>;
  responses: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  timeRemainingSeconds: number;
  onCancel: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
}

export const ExamSummaryModal: React.FC<ExamSummaryModalProps> = ({
  isOpen,
  questions,
  questionStatuses,
  timeRemainingSeconds,
  onCancel,
  onConfirmSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const counts = {
    answered: 0,
    not_answered: 0,
    not_visited: 0,
    marked_review: 0,
    answered_marked: 0,
  };

  questions.forEach((q) => {
    const status = questionStatuses[q.id] || 'not_visited';
    if (status === 'answered') counts.answered++;
    else if (status === 'not_answered') counts.not_answered++;
    else if (status === 'marked_review') counts.marked_review++;
    else if (status === 'answered_marked') counts.answered_marked++;
    else counts.not_visited++;
  });

  const totalAnsweredForEvaluation = counts.answered + counts.answered_marked;
  const minutesLeft = Math.floor(timeRemainingSeconds / 60);
  const secondsLeft = timeRemainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Exam Submission Confirmation
            </h3>
            <p className="text-xs text-slate-500">
              Biotechnology: Principles & Applications (50 Questions)
            </p>
          </div>
        </div>

        {/* Time Alert */}
        {timeRemainingSeconds > 0 && (
          <div className="my-3.5 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You still have <strong>{minutesLeft}m {secondsLeft}s</strong> remaining. You can review your responses before final submission.
            </span>
          </div>
        )}

        {/* Statistical Summary Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 my-4 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Status Category</th>
                <th className="py-2.5 px-3 text-right">No. of Questions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span>
                  <span>Answered</span>
                </td>
                <td className="py-2 px-3 text-right font-bold text-emerald-700">{counts.answered}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block"></span>
                  <span>Not Answered</span>
                </td>
                <td className="py-2 px-3 text-right font-bold text-rose-700">{counts.not_answered}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-purple-700 inline-block"></span>
                  <span>Marked for Review</span>
                </td>
                <td className="py-2 px-3 text-right font-bold text-purple-700">{counts.marked_review}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-purple-800 border border-emerald-400 inline-block"></span>
                  <span>Answered & Marked for Review</span>
                </td>
                <td className="py-2 px-3 text-right font-bold text-purple-900">{counts.answered_marked}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2 px-3 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 inline-block"></span>
                  <span>Not Visited</span>
                </td>
                <td className="py-2 px-3 text-right font-bold text-slate-500">{counts.not_visited}</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                <td className="py-2.5 px-3 text-slate-900">Total Considered for Evaluation:</td>
                <td className="py-2.5 px-3 text-right text-emerald-700 text-sm">
                  {totalAnsweredForEvaluation} / 50
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 mb-5 leading-normal">
          Note: Questions marked as <strong>Answered & Marked for Review</strong> will be evaluated according to official NTA NEET guidelines. Once submitted, answers cannot be edited.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
          >
            Resume Test
          </button>

          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Calculating Score...</span>
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Yes, Submit Examination</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
