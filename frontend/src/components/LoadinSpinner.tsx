import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  fullScreen = true 
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen 
    ? "min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-slate-800 selection:text-white"
    : "w-full py-12 flex flex-col items-center justify-center p-4 font-sans";

  return (
    <div className={containerClasses}>
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col items-center space-y-4">
        
        {/* Spinner Icon */}
        <div className="w-12 h-12 bg-slate-950 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>

        {/* Message */}
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-white tracking-tight">
            InterviewPulse
          </h3>
          <p className="text-xs font-semibold text-slate-400">
            {message}
          </p>
        </div>

      </div>
    </div>
  );
}