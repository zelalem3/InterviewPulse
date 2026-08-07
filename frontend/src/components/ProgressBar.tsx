import React from 'react';

interface ProgressBarProps {
  progress: number; // Value between 0 and 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'indigo' | 'violet';
}

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  color = 'emerald'
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Height variants
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  // Color variants matching the dark slate theme
  const colorClasses = {
    emerald: 'bg-emerald-500 shadow-emerald-500/20',
    blue: 'bg-blue-500 shadow-blue-500/20',
    indigo: 'bg-indigo-500 shadow-indigo-500/20',
    violet: 'bg-violet-500 shadow-violet-500/20',
  }[color];

  return (
    <div className="w-full space-y-2 font-sans">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          {label && <span className="text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="text-slate-400 font-mono tracking-tight">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-slate-950/60 border border-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner ${heightClasses}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${colorClasses}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}