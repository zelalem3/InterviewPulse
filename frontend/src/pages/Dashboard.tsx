// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { PlusCircle, Sparkles, ArrowRight, Layers, Award, Terminal, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadinSpinner'; 
import SkillBadge from '../components/SkillBadge';          
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Interview {
  id: number;
  job_role: string;
  status: string;
  created_at?: string;
  score?: number;
}

interface ScoreTrend {
  id: number;
  job_role: string;
  score: number;
  date: string;
}

interface DashboardStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  score_trends: ScoreTrend[];
}

export default function Dashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

useEffect(() => {
  let cancelled = false;
  Promise.all([
    api.get('/interviews/', { params: { limit: 50 } }),
    api.get('/interviews/stats/summary'),
  ])
    .then(([interviewsRes, statsRes]) => {
      if (cancelled) return;
      const interviewData = interviewsRes.data.data || interviewsRes.data;
      setInterviews(Array.isArray(interviewData) ? interviewData : []);
      setStats(statsRes.data);
    })
    .catch((err) => {
      console.error("Failed to fetch dashboard data:", err);
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, []);

  if (loading) {
    return <LoadingSpinner message="Loading your interviews..." />;
  }

  const displayTotalSessions = stats ? stats.total_sessions : interviews.length;
  const completedSessions = stats
    ? stats.completed_sessions
    : interviews.filter((interview) => interview.status.toLowerCase() === 'completed').length;
  const displayAvgScore = stats && stats.average_score > 0 ? stats.average_score : '--';
  const chartData = stats?.score_trends || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-slate-300 shadow-inner">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Your practice space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 max-w-xl">
            Interview confidence comes with practice. Pick up where you left off or start a session for the role you have in mind.
          </p>
        </div>

        <button 
          onClick={() => navigate('/interview/new')}
          className="z-10 flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg cursor-pointer select-none shrink-0"
        >
          <PlusCircle size={18} className="text-emerald-400" />
          <span>Start a new interview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Practice sessions</span>
            <Layers size={18} className="text-slate-500" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{displayTotalSessions}</p>
          <p className="text-[10px] font-semibold text-slate-500">Interviews started</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average score</span>
            <Award size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">{displayAvgScore}</p>
          <p className="text-[10px] font-semibold text-slate-500">Across completed interviews</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <Award size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{completedSessions}</p>
          <p className="text-[10px] font-semibold text-slate-500">Ready to review</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Score over time</h2>
            <p className="text-xs font-semibold text-slate-400">A simple view of your results from completed interviews.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            <TrendingUp size={14} />
            <span>Your progress</span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-medium">
            Your scores will appear here after you complete an interview.
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" domain={[0, 10]} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Recent interviews</h2>
            <p className="text-xs font-semibold text-slate-400">Continue an interview or revisit feedback from a completed session.</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
            {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'}
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-16 space-y-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
              <Terminal size={22} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">Your first practice session starts here</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your resume and the role you’re preparing for. We’ll take it from there, one question at a time.
              </p>
            </div>
            <button
              onClick={() => navigate('/interview/new')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl text-xs transition cursor-pointer select-none"
            >
              <PlusCircle size={15} />
              <span>Set up an interview</span>
            </button>
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

                {item.status && item.status.toLowerCase().includes('completed') ? (
  <div>
    <button 
      onClick={() => navigate(`/interview/${item.id}/result`)}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer select-none group-hover:border-slate-600"
    >
      <span>View feedback</span>
      <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
    </button>
  </div>
) : (
  <div>
    <button 
      onClick={() => navigate(item.status.toLowerCase() === 'coding' ? `/${item.id}/editor` : `/interview/${item.id}`)}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer select-none group-hover:border-slate-600"
    >
      <span>{item.status.toLowerCase() === 'coding' ? 'Continue coding' : 'Continue interview'}</span>
      <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
    </button>
  </div>
)}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}