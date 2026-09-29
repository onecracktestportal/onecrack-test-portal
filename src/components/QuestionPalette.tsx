import React, { useState } from 'react';
import { Question, QuestionStatus } from '../types/exam';
import { CheckCircle2, Bookmark, Check, Layers, Send } from 'lucide-react';

interface QuestionPaletteProps {
  questions: Question[];
  currentQuestionIndex: number;
  questionStatuses: Record<number, QuestionStatus>;
  responses: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  onSelectQuestion: (index: number) => void;
  onSubmitExam: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentQuestionIndex,
  questionStatuses,
  responses,
  onSelectQuestion,
  onSubmitExam
}) => {
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('All');

  // Compute status counts
  const counts = {
    answered: 0,
    not_answered: 0,
    not_visited: 0,
    marked_review: 0,
    answered_marked: 0
  };

  questions.forEach((q) => {
    const status = questionStatuses[q.id] || 'not_visited';
    if (status === 'answered') counts.answered++;
    else if (status === 'not_answered') counts.not_answered++;
    else if (status === 'marked_review') counts.marked_review++;
    else if (status === 'answered_marked') counts.answered_marked++;
    else counts.not_visited++;
  });

  const topics = ['All', 'Tools of rDNA Technology', 'Processes of rDNA Technology', 'Biotech in Agriculture', 'Biotech in Medicine & Ethics'];

  const filteredQuestions = selectedTopicFilter === 'All' 
    ? questions 
    : questions.filter(q => q.topic === selectedTopicFilter);

  // Helper to render question button background and symbol
  const getButtonStyles = (qId: number, isCurrent: boolean) => {
    const status = questionStatuses[qId] || 'not_visited';

    let base = "relative flex items-center justify-center font-bold text-xs rounded transition-all duration-150 select-none ";
    
    if (isCurrent) {
      base += "ring-2 ring-blue-500 ring-offset-2 scale-105 z-10 shadow-md ";
    }

    switch (status) {
      case 'answered':
        // Green box
        return base + "bg-emerald-600 hover:bg-emerald-700 text-white";
      case 'not_answered':
        // Red / Orange box
        return base + "bg-rose-600 hover:bg-rose-700 text-white";
      case 'marked_review':
        // Purple circle
        return base + "bg-purple-700 hover:bg-purple-800 text-white rounded-full";
      case 'answered_marked':
        // Purple circle with small green indicator dot
        return base + "bg-purple-800 hover:bg-purple-900 text-white rounded-full";
      case 'not_visited':
      default:
        // Grey box
        return base + "bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300";
    }
  };

  return (
    <aside className="w-full lg:w-80 flex flex-col bg-white border-l border-slate-200 h-full overflow-hidden shadow-sm">
      {/* Palette Header with Legend */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 mb-2.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Question Palette (50 Questions)</span>
        </h2>

        {/* NTA JEE/NEET Status Indicator Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {counts.answered}
            </span>
            <span className="text-slate-700 font-medium">Answered</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {counts.not_answered}
            </span>
            <span className="text-slate-700 font-medium">Not Answered</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 border border-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
              {counts.not_visited}
            </span>
            <span className="text-slate-700 font-medium">Not Visited</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {counts.marked_review}
            </span>
            <span className="text-slate-700 font-medium leading-tight">Marked for Review</span>
          </div>

          <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-200">
            <span className="relative w-6 h-6 rounded-full bg-purple-800 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {counts.answered_marked}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full flex items-center justify-center">
                <Check className="w-1.5 h-1.5 text-slate-900 stroke-[3]" />
              </span>
            </span>
            <span className="text-slate-700 font-medium text-[10.5px] leading-tight">
              Ans. & Marked for Review <span className="text-emerald-700 font-bold">(Evaluated)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter by Topic */}
      <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
        <label className="text-[11px] font-semibold text-slate-600 shrink-0">Topic:</label>
        <select
          value={selectedTopicFilter}
          onChange={(e) => setSelectedTopicFilter(e.target.value)}
          className="w-full text-xs py-1 px-2 bg-white border border-slate-300 rounded font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t} {t !== 'All' ? `(${questions.filter(q => q.topic === t).length})` : `(50)`}
            </option>
          ))}
        </select>
      </div>

      {/* 50-Question Button Matrix */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentQuestionIndex;
            const isMatchTopic = selectedTopicFilter === 'All' || q.topic === selectedTopicFilter;
            const status = questionStatuses[q.id] || 'not_visited';

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(idx)}
                className={`h-9 w-full ${getButtonStyles(q.id, isCurrent)} ${!isMatchTopic ? 'opacity-30' : ''}`}
                title={`Q${q.id}: ${q.topic} [${status.replace('_', ' ')}]`}
              >
                <span>{q.id}</span>
                {status === 'answered_marked' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Final Submit Button */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onSubmitExam}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded shadow flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>SUBMIT EXAMINATION</span>
        </button>
        <p className="text-[10px] text-center text-slate-500 mt-1">
          Auto-submits when countdown reaches 00:00
        </p>
      </div>
    </aside>
  );
};
