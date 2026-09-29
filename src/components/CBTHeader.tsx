import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types/exam';
import { 
  Wifi, 
  HelpCircle, 
  FileText, 
  Clock, 
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Flame
} from 'lucide-react';
import { OneCrackLogo } from './OneCrackLogo';

interface CBTHeaderProps {
  student: StudentProfile;
  timeRemainingSeconds: number;
  totalSeconds?: number;
  onOpenInstructions: () => void;
  onOpenQuestionPaper: () => void;
  tabSwitches: number;
  examTitle?: string;
  totalQuestions?: number;
  onExitToDashboard?: () => void;
}

export const CBTHeader: React.FC<CBTHeaderProps> = ({
  student,
  timeRemainingSeconds,
  totalSeconds = 1620, // Default 27 minutes (1620s)
  onOpenInstructions,
  onOpenQuestionPaper,
  tabSwitches,
  examTitle = 'BIOTECHNOLOGY: PRINCIPLES & APPLICATIONS',
  totalQuestions = 50,
  onExitToDashboard
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 300; // Final 5 minutes
  const isCriticalTime = timeRemainingSeconds <= 60; // Final 1 minute

  // Calculate elapsed progress (100% at start -> 0% at end)
  const safeTotal = totalSeconds > 0 ? totalSeconds : 1620;
  const progressPercent = Math.max(0, Math.min(100, (timeRemainingSeconds / safeTotal) * 100));

  return (
    <header className={`bg-slate-900 text-white relative select-none transition-all duration-500 ${
      isCriticalTime
        ? 'border-b-4 border-red-500 ring-2 ring-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
        : isLowTime
        ? 'border-b-2 border-red-500 ring-1 ring-red-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
        : 'border-b border-cyan-600/40 shadow-xl'
    }`}>
      {/* Critical Urgency Ribbon for Final 5 Minutes */}
      {isLowTime && (
        <div className={`px-4 py-1 text-center font-bold tracking-wider uppercase text-[11px] transition-all duration-300 flex items-center justify-center gap-2 ${
          isCriticalTime 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-rose-950/90 text-rose-200 border-b border-rose-500/50'
        }`}>
          <Flame className="w-3.5 h-3.5 text-rose-300 animate-bounce" />
          <span>ATTENTION CANDIDATE: FINAL {Math.ceil(timeRemainingSeconds / 60)} MINUTES REMAINING — REVIEW UNANSWERED QUESTIONS</span>
          <Flame className="w-3.5 h-3.5 text-rose-300 animate-bounce" />
        </div>
      )}
      {/* Top Banner: OneCrack Test Portal Live Status Bar */}
      <div className="bg-slate-950 px-4 py-1.5 flex flex-wrap justify-between items-center text-xs text-slate-300 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <OneCrackLogo size="sm" showSubtitle={false} />
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CBT SECURE ENGINE</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>Database: <strong className="text-cyan-300 font-mono">Cloud SQL & Firebase</strong></span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <span>Support:</span>
            <span className="font-mono text-cyan-400 text-[11px]">onecracktestportal@gmail.com</span>
          </div>
          {tabSwitches > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/50 text-[11px] animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>{tabSwitches} Window Switch Warning{tabSwitches > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Live Clock & Date */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {currentDateTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-cyan-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentDateTime.toLocaleTimeString('en-IN', { hour12: true })}</span>
          </div>
        </div>
      </div>

      {/* Main Bar: Candidate Info & Countdown */}
      <div className="px-4 py-2.5 flex flex-wrap justify-between items-center gap-3 relative">
        {/* Left: Test Subject & System ID */}
        <div className="flex items-center gap-3">
          {onExitToDashboard && (
            <button
              onClick={onExitToDashboard}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs transition cursor-pointer"
              title="Return to Test Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-sm px-2.5 py-1 rounded shadow">
            NEET-UG
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
              <span className="uppercase">{examTitle}</span>
              <span className="bg-slate-800 text-cyan-400 text-xs px-2 py-0.5 rounded border border-slate-700">
                {totalQuestions} MCQs
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              System ID: <span className="text-amber-400 font-semibold">{student.systemId || 'LAB-02 / NODE-47'}</span> • Center: <span className="text-slate-300">{student.examCenter || 'OneCrack Assessment Center'}</span>
            </p>
          </div>
        </div>

        {/* Center: Real-Time Exam Countdown Timer with Visual Urgency */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-3 shadow-inner transition-all duration-300 ${
            isCriticalTime
              ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse ring-2 ring-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
              : isLowTime 
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 animate-pulse ring-2 ring-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]' 
                : 'bg-slate-950 border-slate-700 text-cyan-300'
          }`}>
            <Clock className={`w-5 h-5 ${
              isCriticalTime ? 'text-red-400 animate-bounce' : isLowTime ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Time Remaining
                </span>
                {isLowTime && (
                  <span className={`inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                    isCriticalTime 
                      ? 'bg-red-500 text-white animate-bounce' 
                      : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                  }`}>
                    <Flame className="w-2.5 h-2.5" />
                    {isCriticalTime ? 'FINAL 60s' : 'FINAL 5 MINS'}
                  </span>
                )}
              </div>
              <div className="text-xl font-black font-mono tracking-wider">
                {formatTimer(timeRemainingSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Profile & Quick Tools */}
        <div className="flex items-center gap-3">
          {/* Quick links: Instructions, Question Paper */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenInstructions}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 transition cursor-pointer"
              title="View Guidelines & Instructions"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Instructions</span>
            </button>

            <button
              onClick={onOpenQuestionPaper}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 transition cursor-pointer"
              title="View Complete Question Paper"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Question Paper</span>
            </button>
          </div>

          {/* Student Profile Card with OC Roll Number */}
          <div className="flex items-center gap-2.5 bg-slate-950/80 pl-2 pr-3 py-1.5 rounded-lg border border-slate-800">
            <div className="relative">
              <img
                src={student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"}
                alt="Candidate"
                className="w-9 h-9 rounded-md object-cover border border-slate-700 bg-slate-800"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Verified"></span>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[130px]" title={student.name}>
                {student.name || 'Candidate Name'}
              </div>
              <div className="text-[11px] text-cyan-400 font-mono font-bold">
                {student.rollNumber || student.uid}
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                {student.category || 'UR'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Time Progress Bar along the bottom of the header */}
      <div className="w-full h-1.5 bg-slate-950/90 overflow-hidden relative">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${
            isCriticalTime
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.9)]'
              : isLowTime
                ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-amber-400 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
