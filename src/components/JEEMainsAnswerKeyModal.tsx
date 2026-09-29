import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Award, 
  Mail, 
  FileText,
  Clock,
  User,
  Filter
} from 'lucide-react';
import { Question, ExamSubmission, StudentProfile } from '../types/exam';
import { OneCrackLogo } from './OneCrackLogo';

interface JEEMainsAnswerKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ExamSubmission | null;
  questions: Question[];
  student?: StudentProfile | null;
  examTitle?: string;
}

export const JEEMainsAnswerKeyModal: React.FC<JEEMainsAnswerKeyModalProps> = ({
  isOpen,
  onClose,
  submission,
  questions,
  student,
  examTitle = 'Biotechnology: Principles & Applications (Chapter Test)'
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [viewTab, setViewTab] = useState<'detailed' | 'table'>('detailed');

  if (!isOpen) return null;

  const candidateName = submission?.studentName || student?.name || 'Dr. Aryan Sharma (NEET Aspirant)';
  const candidateRoll = submission?.rollNumber || student?.rollNumber || 'OC-849201';
  const candidateAppNo = submission?.applicationNumber || student?.applicationNumber || 'NEET2026-NTA-10492';
  const candidateEmail = submission?.studentEmail || student?.email || 'onecracktestportal@gmail.com';
  const score = submission ? submission.score : 0;
  const maxScore = submission ? submission.maxScore : questions.length * 4;
  const correctCount = submission ? submission.correctCount : 0;
  const incorrectCount = submission ? submission.incorrectCount : 0;
  const unattemptedCount = submission ? submission.unattemptedCount : questions.length;
  const accuracy = submission ? submission.accuracy : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const exportData = {
      portal: "OneCrack Test Portal",
      contact: "onecracktestportal@gmail.com",
      copyright: "© 2026 OneCrack Test Portal. All rights reserved.",
      examTitle,
      candidate: {
        name: candidateName,
        rollNumber: candidateRoll,
        applicationNumber: candidateAppNo,
        email: candidateEmail
      },
      summary: {
        score,
        maxScore,
        correctCount,
        incorrectCount,
        unattemptedCount,
        accuracy
      },
      questionsAndResponses: questions.map((q, idx) => {
        const studentResp = submission?.responses?.[q.id] || null;
        const chosenOpt = q.options.find(o => o.key === studentResp);
        const correctOpt = q.options.find(o => o.key === q.correctAnswer);
        const isCorrect = studentResp === q.correctAnswer;
        const isAttempted = studentResp !== null;
        return {
          questionNumber: idx + 1,
          questionCode: q.questionCode || `QID-${830100 + q.id}`,
          questionText: q.question,
          options: q.options.map(o => ({ key: o.key, optionCode: o.optionCode, text: o.text })),
          correctOptionKey: q.correctAnswer,
          correctOptionCode: correctOpt?.optionCode,
          candidateChosenKey: studentResp,
          candidateChosenOptionCode: chosenOpt ? chosenOpt.optionCode : 'NOT_ATTEMPTED',
          status: !isAttempted ? 'UNATTEMPTED' : isCorrect ? 'CORRECT' : 'INCORRECT',
          marksAwarded: !isAttempted ? 0 : isCorrect ? 4 : -1,
          ncertReference: q.ncertRef,
          explanation: q.explanation
        };
      })
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OneCrack_AnswerKey_${candidateRoll}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredQuestions = questions.filter(q => {
    const resp = submission?.responses?.[q.id] || null;
    if (filterType === 'correct') return resp === q.correctAnswer;
    if (filterType === 'incorrect') return resp !== null && resp !== q.correctAnswer;
    if (filterType === 'unattempted') return resp === null;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Dialog Window */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Background Watermark for Screen View */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none rotate-[-30deg] z-0 overflow-hidden">
          <div className="text-8xl md:text-9xl font-black text-slate-900 dark:text-white tracking-widest whitespace-nowrap">
            OneCrack Test Portal
          </div>
        </div>

        {/* Modal Top Navigation Bar (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-4 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <OneCrackLogo size="sm" showSubtitle={false} />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>One Crack Detailed Answer Key & Response Sheet</span>
              </h2>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                Official Detailed Evaluation Matrix & NCERT Verified Solutions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
              title="Print / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-300 dark:border-slate-700"
              title="Download structured JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & View Switcher Bar (Hidden in Print) */}
        <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs z-10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Questions:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilterType('incorrect')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'incorrect'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
            <button
              onClick={() => setFilterType('unattempted')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'unattempted'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              Unattempted ({unattemptedCount})
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewTab('detailed')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewTab === 'detailed'
                  ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Detailed Question Paper
            </button>
            <button
              onClick={() => setViewTab('table')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewTab === 'table'
                  ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Answer Key Matrix Table
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Content Area */}
        <div id="jee-printable-sheet" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 print:p-0 print:space-y-4 relative">
          
          {/* Printable Watermark CSS */}
          <div className="print-watermark hidden print:block fixed inset-0 pointer-events-none opacity-[0.06] select-none text-center transform -rotate-45 z-0 flex items-center justify-center">
            <div className="text-8xl font-black text-black">
              OneCrack Test Portal
            </div>
          </div>

          {/* Official JEE/NTA Header Block */}
          <div className="border-2 border-slate-300 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 shadow-sm print:border-black print:rounded-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <OneCrackLogo size="md" />
              </div>
              <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400">
                <p className="font-bold text-slate-700 dark:text-slate-200">NATIONAL TESTING & CBT ASSESSMENT PORTAL</p>
                <p>Support: <span className="text-cyan-600 font-mono font-medium">onecracktestportal@gmail.com</span></p>
                <p>Portal Ref: <span className="font-mono">OCTP-NTA-2026-CBT</span></p>
              </div>
            </div>

            <div className="text-center mb-4">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                CANDIDATE RESPONSE SHEET & OFFICIAL FINAL ANSWER KEY
              </h1>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                {examTitle}
              </p>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-600 inline" />
                  {candidateName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <span className="font-black text-cyan-700 dark:text-cyan-300 font-mono tracking-wide">
                  {candidateRoll}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Application No</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {candidateAppNo}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Work / Support Email</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 truncate block">
                  {candidateEmail}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Score</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {score} / {maxScore}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Correct / Wrong</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-emerald-600 font-bold">{correctCount}</span> / <span className="text-rose-600 font-bold">{incorrectCount}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Accuracy</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {accuracy.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Marking Scheme</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  +4.00 / -1.00 / 0.00
                </span>
              </div>
            </div>
          </div>

          {/* VIEW TAB 1: DETAILED QUESTION PAPER WITH OPTION CODES */}
          {viewTab === 'detailed' && (
            <div className="space-y-6">
              {filteredQuestions.map((q, qIndex) => {
                const studentResponse = submission?.responses?.[q.id] || null;
                const isAttempted = studentResponse !== null;
                const isCorrect = studentResponse === q.correctAnswer;
                
                const qCode = q.questionCode || `QID-${830100 + q.id}`;
                const chosenOption = q.options.find(o => o.key === studentResponse);
                const correctOption = q.options.find(o => o.key === q.correctAnswer);

                return (
                  <div 
                    key={q.id}
                    className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm print:break-inside-avoid print:border-black print:rounded-none"
                  >
                    {/* Question Header & JEE Metadata Box */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded">
                          Q.{qIndex + 1}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {qCode}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium text-[11px]">
                          {q.topic}
                        </span>
                      </div>

                      {/* Official JEE Status Badge */}
                      <div className="flex items-center gap-2">
                        {!isAttempted ? (
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium text-[11px]">
                            <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
                            Unattempted (0.00)
                          </span>
                        ) : isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Correct (+4.00)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Incorrect (-1.00)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Body with Side Metadata Table */}
                    <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Question Stem & Options (8 Cols) */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                          {q.question}
                        </div>

                        {/* Options List with Option Codes */}
                        <div className="space-y-2.5 pt-2">
                          {q.options.map((opt) => {
                            const isThisCorrect = opt.key === q.correctAnswer;
                            const isThisChosen = opt.key === studentResponse;

                            let optStyle = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";
                            if (isThisCorrect) {
                              optStyle = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500";
                            } else if (isThisChosen && !isThisCorrect) {
                              optStyle = "border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500";
                            }

                            return (
                              <div
                                key={opt.key}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm transition-all ${optStyle}`}
                              >
                                <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isThisCorrect 
                                    ? 'bg-emerald-600 text-white' 
                                    : isThisChosen 
                                      ? 'bg-rose-600 text-white' 
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {opt.key}
                                </span>

                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                                      [Option ID: {opt.optionCode || 'N/A'}]
                                    </span>
                                    {isThisCorrect && (
                                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 uppercase">
                                        ✓ Official Key
                                      </span>
                                    )}
                                    {isThisChosen && !isThisCorrect && (
                                      <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1 uppercase">
                                        ✗ Candidate's Choice
                                      </span>
                                    )}
                                  </div>
                                  <div className="whitespace-pre-line">
                                    {opt.text}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: JEE Mains Assessment Box (4 Cols) */}
                      <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between text-xs space-y-3">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200 pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-cyan-600" />
                            Question Assessment Details
                          </div>
                          
                          <table className="w-full text-[11px]">
                            <tbody>
                              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Question ID:</td>
                                <td className="py-1 font-mono font-bold text-right text-slate-800 dark:text-slate-200">{qCode}</td>
                              </tr>
                              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Question Type:</td>
                                <td className="py-1 font-mono font-bold text-right text-slate-800 dark:text-slate-200">MCQ Single</td>
                              </tr>
                              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Status:</td>
                                <td className="py-1 font-semibold text-right">
                                  {!isAttempted ? 'Not Answered' : isCorrect ? 'Answered (Correct)' : 'Answered (Incorrect)'}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Chosen Option ID:</td>
                                <td className="py-1 font-mono font-bold text-right text-cyan-600 dark:text-cyan-400">
                                  {chosenOption ? chosenOption.optionCode : '--'}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Correct Option ID:</td>
                                <td className="py-1 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400">
                                  {correctOption?.optionCode || 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-slate-500 dark:text-slate-400 font-medium">Marks Awarded:</td>
                                <td className={`py-1 font-mono font-black text-right ${
                                  !isAttempted ? 'text-slate-400' : isCorrect ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                  {!isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00'}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* NCERT Citation & Explanation */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-cyan-700 dark:text-cyan-400">
                            📖 {q.ncertRef}
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 leading-snug">
                            {q.explanation}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW TAB 2: ANSWER KEY MATRIX TABLE */}
          {viewTab === 'table' && (
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Official NTA/JEE Mains Consolidated Answer Key Matrix
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Total Questions: {questions.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700">
                      <th className="py-2.5 px-3 font-bold text-center">Q.No</th>
                      <th className="py-2.5 px-3 font-bold font-mono">Question ID</th>
                      <th className="py-2.5 px-3 font-bold">Topic / Domain</th>
                      <th className="py-2.5 px-3 font-bold font-mono text-emerald-700 dark:text-emerald-400">Correct Option ID</th>
                      <th className="py-2.5 px-3 font-bold font-mono text-cyan-700 dark:text-cyan-400">Candidate Option ID</th>
                      <th className="py-2.5 px-3 font-bold text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold font-mono text-right">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {questions.map((q, idx) => {
                      const studentResponse = submission?.responses?.[q.id] || null;
                      const isAttempted = studentResponse !== null;
                      const isCorrect = studentResponse === q.correctAnswer;
                      const chosenOpt = q.options.find(o => o.key === studentResponse);
                      const correctOpt = q.options.find(o => o.key === q.correctAnswer);

                      return (
                        <tr 
                          key={q.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-2 px-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {q.questionCode || `QID-${830100 + q.id}`}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                            {q.topic}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {correctOpt?.optionCode || 'N/A'} ({q.correctAnswer})
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            {chosenOpt ? `${chosenOpt.optionCode} (${studentResponse})` : '--'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {!isAttempted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Unattempted
                              </span>
                            ) : isCorrect ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Correct
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Incorrect
                              </span>
                            )}
                          </td>
                          <td className={`py-2 px-3 font-mono font-bold text-right ${
                            !isAttempted ? 'text-slate-400' : isCorrect ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {!isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                      <td colSpan={6} className="py-3 px-3 text-right">
                        Net Raw Score Awarded:
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 text-right text-sm">
                        {score} / {maxScore}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Official Footer Notice & Copyrights */}
          <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              OneCrack Test Portal — Computer Based Examination System
            </p>
            <p>
              Official Work Email: <a href="mailto:onecracktestportal@gmail.com" className="text-cyan-600 hover:underline font-mono">onecracktestportal@gmail.com</a> | Assessment Engine Version: 2026.4
            </p>
            <p className="text-[11px] text-slate-400">
              © 2026 OneCrack Test Portal. All rights reserved. Reproduction or unauthorized distribution of this confidential examination material without explicit written consent is strictly prohibited under Copyright Law.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
