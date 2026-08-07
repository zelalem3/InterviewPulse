// src/pages/PageNotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export function PageNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-xl text-center space-y-6">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-slate-950 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
          <AlertTriangle size={32} />
        </div>

        {/* Error Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-full uppercase tracking-widest">
            Error 404 • Node Not Found
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-xs mx-auto">
            The requested simulation resource or endpoint path does not exist or has been decommissioned.
          </p>
        </div>

        {/* Action Navigation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs transition shadow-inner cursor-pointer select-none"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl text-xs transition shadow-lg cursor-pointer select-none"
          >
            <Home size={16} className="text-emerald-400" />
            <span>Dashboard</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default PageNotFound;