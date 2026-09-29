import React from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

interface OneCrackLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const OneCrackLogo: React.FC<OneCrackLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const sizeStyles = {
    sm: {
      text: 'text-lg',
      sub: 'text-[9px]',
      icon: 'w-4 h-4',
      badge: 'text-[9px] px-1.5 py-0.5'
    },
    md: {
      text: 'text-2xl',
      sub: 'text-[11px]',
      icon: 'w-5 h-5',
      badge: 'text-[10px] px-2 py-0.5'
    },
    lg: {
      text: 'text-3xl',
      sub: 'text-xs',
      icon: 'w-6 h-6',
      badge: 'text-xs px-2.5 py-1'
    },
    xl: {
      text: 'text-4xl sm:text-5xl',
      sub: 'text-sm',
      icon: 'w-8 h-8',
      badge: 'text-xs px-3 py-1'
    }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Cool Hexagonal / Angled Emblem */}
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-60"></div>
            {/* Crack lightning bolt symbol */}
            <div className="relative text-cyan-400">
              <Zap className={`${sizeStyles.icon} fill-cyan-400 stroke-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]`} />
            </div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-cyan-400/30 blur-md rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight ${sizeStyles.text} text-white flex items-center gap-1.5`}>
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">One</span>
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent font-extrabold tracking-wide drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">Crack</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold tracking-wider uppercase text-cyan-300 bg-cyan-950/80 border border-cyan-500/60 rounded-md px-1.5 py-0.5 text-[10px] shadow-sm">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            CBT SECURE
          </span>
        </div>
        
        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-bold tracking-wider text-slate-400 uppercase ${sizeStyles.sub}`}>
              Test Portal
            </span>
            <span className="text-cyan-400 text-[10px]">•</span>
            <span className="text-[10px] font-medium text-cyan-300/90">
              Professional Computer Based Test System
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
