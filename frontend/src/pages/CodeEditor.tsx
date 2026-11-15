import Editor from "@monaco-editor/react";
import { AlertCircle, ArrowLeft, ArrowRight, Code2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/axios";

interface CodingQuestion {
  id: number;
  question_text: string;
  answer_text: string | null;
}

export function CodeEditor() {
  const { interview_id: interviewId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("// Write your solution here\n");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<
          CodingQuestion[] | { data: CodingQuestion[] }
        >(`/code/${interviewId}`);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No coding challenge was returned for this interview.");
        }

        if (cancelled) return;
        const firstUnanswered = data.findIndex(
          (question) => !question.answer_text?.trim(),
        );
        if (firstUnanswered === -1) {
          navigate(`/interview/${interviewId}/result`, { replace: true });
          return;
        }

        setQuestions(data);
        setCurrentIndex(firstUnanswered);
        setCode(data[firstUnanswered].answer_text || "// Write your solution here\n");
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load the coding challenge.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (interviewId) loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [interviewId, navigate, retryCount]);

  async function submitCode() {
    const question = questions[currentIndex];
    if (!question || !code.trim()) {
      setError("Write a solution before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/code/${question.id}/submit`, { answer_text: code });
      const updatedQuestions = questions.map((item, index) =>
        index === currentIndex ? { ...item, answer_text: code } : item,
      );
      setQuestions(updatedQuestions);

      const nextUnanswered = updatedQuestions.findIndex(
        (item, index) => index > currentIndex && !item.answer_text?.trim(),
      );
      if (nextUnanswered !== -1) {
        setCurrentIndex(nextUnanswered);
        setCode(
          updatedQuestions[nextUnanswered].answer_text ||
            "// Write your solution here\n",
        );
      } else {
        navigate(`/interview/${interviewId}/result`);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your code. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const loadError = interviewId ? error : "Interview ID is missing.";

  if (loading && interviewId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-400" role="status">
        <Loader2 className="animate-spin" size={18} />
        Preparing your coding challenge...
      </div>
    );
  }

  if (loadError && questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-rose-300">
          <AlertCircle size={18} />
          <p>{loadError}</p>
        </div>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950"
        >
          Retry
        </button>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Code2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Coding Challenge</h1>
            <p className="text-xs text-slate-400">
              Final section · Challenge {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Exit
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-300" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {question && (
        <>
          <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Challenge {currentIndex + 1}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {question.question_text}
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
              <span className="text-xs font-semibold text-slate-300">JavaScript</span>
              <span className="text-xs text-slate-500">Your solution</span>
            </div>
            <Editor
              height="48vh"
              language="javascript"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={submitCode}
              disabled={submitting || !code.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit and view evaluation
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
