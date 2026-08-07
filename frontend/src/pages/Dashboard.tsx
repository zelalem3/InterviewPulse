// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { PlusCircle, Sparkles, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react';
import LoadingSpinner from '../components/LoadinSpinner'; 
import SkillBadge from '../components/SkillBadge';          
interface Interview {
  id: number;
  job_role: string;
  status: string;
  created_at?: string;
}

export default function Dashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Note: Our Axios interceptor now handles the token automatically via Zustand store.
    api.get('/interviews/')
      .then(res => {
        // Handle varying Laravel API response structures (e.g. flat array vs nested data object)
        const responseData = res.data.data || res.data;
        setInterviews(Array.isArray(responseData) ? responseData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch interviews:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner message="Syncing interview pipeline records..." />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* --- HERO / WELCOME BANNER --- */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-slate-300 shadow-inner">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Operational Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Operator'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 max-w-xl">
            Your simulation pipeline is live. Review past technical session metrics or initialize a new AI-evaluated interview node.
          </p>
        </div>

        <button 
          onClick={() => navigate('/interview/new')}
          className="z-10 flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg cursor-pointer select-none shrink-0"
        >
          <PlusCircle size={18} className="text-emerald-400" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* --- METRICS & OVERVIEW SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
            <Layers size={18} className="text-slate-500" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{interviews.length}</p>
          <p className="text-[10px] font-semibold text-slate-500">Evaluated candidate logs</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">System State</span>
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">Optimal</p>
          <p className="text-[10px] font-semibold text-slate-500">Sanctum token authenticated</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI Model Core</span>
            <Clock size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">GPT-4o</p>
          <p className="text-[10px] font-semibold text-slate-500">Low-latency simulation active</p>
        </div>
      </div>

      {/* --- PAST INTERVIEWS LIST --- */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Past Interview History</h2>
            <p className="text-xs font-semibold text-slate-400">Select any record to view deep diagnostic evaluations and logs.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            {interviews.length} Records Found
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <p className="text-sm font-bold text-slate-300">No interview sessions recorded yet.</p>
            <p className="text-xs text-slate-500">Initialize your first session using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {interviews.map(item => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-inner group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 font-bold">#{item.id}</span>
                    <h3 className="text-sm font-bold text-white tracking-tight">{item.job_role}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkillBadge 
                      skill={item.status} 
                      size="sm" 
                      variant={item.status.toLowerCase() === 'completed' ? 'emerald' : 'slate'} 
                    />
                    {item.created_at && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        • {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/interview/${item.id}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer select-none group-hover:border-slate-600"
                >
                  <span>View Details</span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}