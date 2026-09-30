import React from 'react';

interface OneCrackLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Official One Crack Test Portal brand mark.
 * Asset: /onecrack-logo.jpg (cyan arrow + black wordmark). Theme colors unchanged.
 */
export const OneCrackLogo: React.FC<OneCrackLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  iconOnly = false,
}) => {
  const sizeStyles = {
    sm: { img: 'h-8', icon: 'h-8 w-8', pad: 'px-1.5 py-0.5' },
    md: { img: 'h-10', icon: 'h-10 w-10', pad: 'px-2 py-1' },
    lg: { img: 'h-14', icon: 'h-14 w-14', pad: 'px-2.5 py-1.5' },
    xl: { img: 'h-20 sm:h-24', icon: 'h-20 w-20', pad: 'px-3 py-2' },
  }[size];

  if (iconOnly) {
    return (
      <span className={`inline-flex items-center justify-center rounded-xl bg-white ${sizeStyles.pad} shadow-sm ${className}`}>
        <img
          src="/onecrack-logo.jpg"
          alt="One Crack"
          className={`${sizeStyles.icon} object-contain select-none`}
          draggable={false}
        />
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <span className={`inline-flex items-center rounded-xl bg-white ${sizeStyles.pad} shadow-sm border border-slate-200/80`}>
        <img
          src="/onecrack-logo.jpg"
          alt="One Crack Test Portal"
          className={`${sizeStyles.img} w-auto max-w-[min(100%,300px)] object-contain object-left`}
          draggable={false}
        />
      </span>
      {showSubtitle && size !== 'sm' && (
        <span className="mt-1 text-[9px] sm:text-[10px] font-medium tracking-wide text-slate-400 uppercase">
          Professional Computer Based Test System
        </span>
      )}
    </div>
  );
};
