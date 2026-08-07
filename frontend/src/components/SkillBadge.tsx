import React from 'react';

interface SkillBadgeProps {
  skill: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'slate' | 'emerald' | 'blue' | 'violet';
}

export default function SkillBadge({
  skill,
  level,
  size = 'md',
  variant = 'slate'
}: SkillBadgeProps) {
  // Size variants
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  }[size];

  // Theme variants aligning with the dark slate dashboard
  const variantClasses = {
    slate: 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700',
    emerald: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300 hover:border-emerald-800',
    blue: 'bg-blue-950/40 border-blue-900/60 text-blue-300 hover:border-blue-800',
    violet: 'bg-violet-950/40 border-violet-900/60 text-violet-300 hover:border-violet-800',
  }[variant];

  // Level indicator dot colors
  const dotColorClasses = {
    Beginner: 'bg-amber-500',
    Intermediate: 'bg-blue-500',
    Advanced: 'bg-emerald-500',
    Expert: 'bg-violet-500',
  };

  return (
    <div className={`inline-flex items-center gap-2 border rounded-2xl font-semibold backdrop-blur-md shadow-inner transition-all select-none ${sizeClasses} ${variantClasses}`}>
      {level && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorClasses[level]}`} title={`Level: ${level}`} />
      )}
      <span>{skill}</span>
      {level && (
        <span className="text-[10px] opacity-60 font-mono tracking-tight uppercase border-l border-slate-700/50 pl-1.5">
          {level}
        </span>
      )}
    </div>
  );
}