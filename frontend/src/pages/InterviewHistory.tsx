// src/pages/InterviewHistory.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { History, ArrowRight, AlertCircle, FileText, Clock } from "lucide-react";
import LoadingSpinner from "../components/LoadinSpinner";
import SkillBadge from "../components/SkillBadge";

interface Interview {
  id: number;
  job_role: string;
  status: string;
  created_at?: string;
  score?: number;
}

export function InterviewHistory() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const pageSize = 20;

  useEffect(() => {
    let cancelled = false;
    async function getHistory() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/interviews", {
          params: { limit: pageSize, offset: page * pageSize },
        });
        const responseData = response.data.data || response.data;
        if (!cancelled) {
          setInterviews(Array.isArray(responseData) ? responseData : []);
          setTotalCount(Number(response.headers["x-total-count"] ?? responseData.length));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Failed to load interview history. Please verify your connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getHistory();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (loading) {
    return <LoadingSpinner message="Fetching simulation history records..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
        <div className="p-4 bg-rose-950/60 border border-rose-900/80 rounded-3xl flex gap-3 items-center text-rose-300 text-xs font-bold shadow-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* --- HEADER BANNER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 shadow-inner">
              <History size={18} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Interview History & Logs</h1>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            Comprehensive audit logs of all past simulation sessions, job specifications, and analytics.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-2xl shadow-inner self-start sm:self-auto">
          {totalCount} Total Records
        </span>
      </div>

      {/* --- INTERVIEWS CONTENT LIST --- */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
        {interviews.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <FileText size={22} />
            </div>
            <p className="text-sm font-bold text-slate-300">No interview history detected.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't completed any simulated evaluations yet. Initialize a session to populate audit records.
            </p>
            <button
              onClick={() => navigate('/interview/new')}
              className="mt-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-xl text-xs transition shadow-md cursor-pointer select-none"
            >
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {interviews.map((interview) => (
              <div 
                key={interview.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-inner group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-500">#{interview.id}</span>
                    <h3 className="text-sm font-bold text-white tracking-tight">{interview.job_role}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    <SkillBadge 
                      skill={interview.status} 
                      size="sm" 
                      variant={interview.status.toLowerCase() === 'completed' ? 'emerald' : 'slate'} 
                    />
                    
                    {interview.created_at && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <Clock size={12} />
                        {new Date(interview.created_at).toLocaleString()}
                      </span>
                    )}

                    {interview.score !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-0.5 rounded-xl">
                        Score: {interview.score}%
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() =>
                    navigate(
                      interview.status.toLowerCase() === "coding"
                        ? `/${interview.id}/editor`
                        : interview.status.toLowerCase() === "completed"
                          ? `/interview/${interview.id}/result`
                          : `/interview/${interview.id}`,
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer select-none group-hover:border-slate-600 shrink-0"
                >
                  <span>
                    {interview.status.toLowerCase() === "coding"
                      ? "Continue Coding Section"
                      : interview.status.toLowerCase() === "completed"
                        ? "View Diagnostic Report"
                        : "Resume Interview"}
                  </span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalCount > pageSize && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0 || loading}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={(page + 1) * pageSize >= totalCount || loading}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}

export default InterviewHistory;