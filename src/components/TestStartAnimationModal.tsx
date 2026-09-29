import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { OneCrackLogo } from './OneCrackLogo';

interface TestStartAnimationModalProps {
  isOpen: boolean;
  testTitle: string;
  durationMinutes: number;
  questionCount: number;
  onAnimationComplete: () => void;
}

export const TestStartAnimationModal: React.FC<TestStartAnimationModalProps> = ({
  isOpen,
  testTitle,
  durationMinutes,
  questionCount,
  onAnimationComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCountdown(3);
      return;
    }

    // Play subtle high-tech futuristic beep tone
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio optional
    }

    const t1 = setTimeout(() => setStep(2), 600);
    const t2 = setTimeout(() => setStep(3), 1300);
    const t3 = setTimeout(() => setCountdown(2), 1600);
    const t4 = setTimeout(() => setCountdown(1), 2100);
    const t5 = setTimeout(() => {
      onAnimationComplete();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, onAnimationComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl select-none animate-in fade-in duration-300">
      {/* Background Cyber Ambient Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full border border-cyan-500/20 animate-ping opacity-25"></div>
        <div className="w-[380px] h-[380px] rounded-full border border-teal-500/30 animate-pulse"></div>
        <div className="w-[600px] h-[600px] bg-radial from-cyan-900/30 via-transparent to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-lg w-full mx-4 text-center space-y-6">
        {/* Animated Brand Emblem */}
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-500">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-pulse">
            <OneCrackLogo size="lg" showSubtitle={false} />
          </div>
        </div>

        {/* Engine Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>CBT ASSESSMENT ENGINE INITIALIZING</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {testTitle}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {questionCount} Questions • {durationMinutes} Minutes • Anti-Cheat Proctor Active
          </p>
        </div>

        {/* High-Tech Diagnostic Checklist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left font-mono text-xs space-y-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full-Screen & Tab Proctoring</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> ARMED
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Question Paper Decryption</span>
            </div>
            <span className={`font-bold flex items-center gap-1 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500 animate-pulse'}`}>
              {step >= 2 ? <><CheckCircle2 className="w-3 h-3" /> VERIFIED</> : 'DECRYPTING...'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Session Timer Synchronization</span>
            </div>
            <span className={`font-bold flex items-center gap-1 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {step >= 3 ? <><CheckCircle2 className="w-3 h-3" /> LOCKED</> : 'SYNCING...'}
            </span>
          </div>
        </div>

        {/* Dynamic Countdown */}
        <div className="pt-2">
          <div className="inline-block relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-bounce">
              {countdown}
            </div>
          </div>
          <p className="text-xs text-cyan-300 font-bold tracking-widest uppercase mt-3 animate-pulse">
            COMMENCING TEST ENVIRONMENT...
          </p>
        </div>
      </div>
    </div>
  );
};
