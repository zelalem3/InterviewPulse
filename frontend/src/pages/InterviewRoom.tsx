// src/pages/InterviewRoom.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { Sparkles, Send, CheckCircle2, Award, Terminal, ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadinSpinner';
import SkillBadge from '../components/SkillBadge';

interface Question {
  id: number;
  question_text: string;
}

interface ConversationItem {
  question: string;
  answer: string;
  score?: number;
  feedback?: string;
}

interface FinalResult {
  overall_score: number;
  feedback_summary: string;
}

export default function InterviewRoom() {
  const { id: interviewId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);

  useEffect(() => {
    startInterview();
  }, [interviewId]);

  const startInterview = async () => {
    try {
      setInitialLoading(true);
      const res = await api.post(`/interviews/${interviewId}/start`);
      if (res.data?.question) {
        setCurrentQuestion(res.data.question);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;

    setLoading(true);

    try {
      const res = await api.post(`/interviews/questions/${currentQuestion.id}/answer`, {
        answer_text: answer
      });

      const data = res.data;

      setConversation(prev => [
        ...prev,
        {
          question: currentQuestion.question_text,
          answer: answer,
          score: data.evaluation?.score,
          feedback: data.evaluation?.feedback
        }
      ]);

      setAnswer('');
      setQuestionCount(prev => prev + 1);

      if (data.interview_finished) {
        setResult(data.final_result);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.next_question);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner message="Initializing AI simulation environment..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-sans pb-16">
      
      {/* --- TOP NAVIGATION / HEADER BAR --- */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition cursor-pointer select-none shadow-inner"
        >
          <ArrowLeft size={15} />
          <span>Exit to Dashboard</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-cyan-400 shadow-inner">
          <Terminal size={13} />
          <span>Session Node #{interviewId}</span>
        </div>
      </div>

      {/* --- TITLE BANNER --- */}
      <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles size={20} className="text-cyan-400" />
            <span>AI Mock Interview Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400">
            Provide technical responses below. The evaluation core will grade your answers in real-time.
          </p>
        </div>
      </div>

      {/* --- TRANSCRIPT OF PAST TURNS --- */}
      <div className="space-y-4">
        {conversation.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 transition-all"
          >
            {/* Question & Answer Block */}
            <div className="space-y-2 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <span>QUESTION #{idx + 1}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">{item.question}</p>
              
              <div className="mt-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Response</span>
                <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">{item.answer}</p>
              </div>
            </div>

            {/* AI Evaluation Result Card */}
            <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 size={14} />
                  <span>Evaluation Metric</span>
                </span>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg">
                  Score: {item.score ?? "N/A"} / 10
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Feedback: </strong> {item.feedback || "No feedback generated."}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* --- FINAL RESULTS VIEW --- */}
      {result ? (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Award size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Interview Completed Successfully</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your evaluation matrix has been saved to your pipeline records.
            </p>
          </div>

          <div className="inline-block bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-inner space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Performance Score</span>
            <p className="text-3xl font-black text-amber-400 font-mono">
              {result.overall_score.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 10</span>
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-left space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comprehensive Feedback Summary</span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{result.feedback_summary}</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg cursor-pointer select-none"
            >
              Return to Operational Dashboard
            </button>
          </div>
        </div>
      ) : currentQuestion ? (
        /* --- ACTIVE PROMPT INTERFACE --- */
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full shadow-inner">
              Question #{questionCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              AI Core Active
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-relaxed">
            {currentQuestion.question_text}
          </h3>
          
          <div className="space-y-2">
            <textarea
              rows={6}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500/60 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition shadow-inner resize-y font-sans"
              placeholder="Formulate your technical response here..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={loading}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
              <span>Markdown and code blocks supported</span>
              <span>{answer.trim().length} chars</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={submitAnswer} 
              disabled={loading || !answer.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition shadow-lg cursor-pointer select-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Evaluating Response...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer & Continue</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* --- FALLBACK LOADING STATE --- */
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Synchronizing prompt sequence...</p>
        </div>
      )}

    </div>
  );
}