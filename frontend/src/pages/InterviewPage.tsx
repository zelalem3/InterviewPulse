import { useParams, useNavigate } from "react-router-dom";
import useCamera from "../hooks/useCamera";
import useInterview from "../hooks/useInterview";

import Camera from "../components/interview/camera";
import QuestionCard from "../components/interview/QuestionCard";
import Timer from "../components/interview/Timer";
import Transcript from "../components/interview/Transcript";
import Controls from "../components/interview/Controls";
import ProgressBar from "../components/interview/ProgressBar";

export default function InterviewPage() {
  const { id: interviewId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { videoRef, stream, loading: cameraLoading, error: cameraError } =
    useCamera();

  const {
    currentQuestion,
    questionCount,
    conversation,
    status,
    result,
    transcript,
    setTranscript,
    listening,
    recording,
    seconds,
    loading,
    initialLoading,
    error,
    speaking,
    startAnswer,
    stopAnswer,
    nextQuestion,
    speak,
  } = useInterview(stream, interviewId);

  // ---------- Loading / Error states ----------
  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Starting video interview...</p>
        </div>
      </div>
    );
  }

  if (error && !currentQuestion && status !== "finished") {
    return (
      <div className="mx-auto max-w-lg p-8 text-center space-y-4">
        <p className="text-rose-400 font-semibold">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ---------- Finished state ----------
  if (status === "finished" && result) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 p-8 text-center">
        <div className="w-full rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-8 space-y-6">
          <h1 className="text-2xl font-black text-white">
            Interview Completed 🎉
          </h1>
          <p className="text-slate-400 text-sm">
            Your answers have been saved and the interview is marked as completed.
          </p>

          <div className="inline-block rounded-2xl border border-slate-800 bg-slate-950 px-6 py-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Overall Score
            </p>
            <p className="text-3xl font-black text-amber-400 font-mono">
              {Number(result.overall_score).toFixed(1)}
              <span className="text-sm text-slate-500 font-normal"> / 10</span>
            </p>
          </div>

          <p className="text-sm text-slate-300 text-left leading-relaxed">
            {result.feedback_summary}
          </p>

          {/* Conversation summary */}
          <div className="space-y-3 text-left max-h-64 overflow-y-auto">
            {conversation.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <p className="text-xs font-bold text-cyan-400 mb-1">
                  Q{idx + 1}: {item.question}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {item.answer}
                </p>
                {item.score != null && (
                  <p className="text-xs text-amber-400 mt-1">
                    Score: {item.score}/10
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(`/interview/${interviewId}/result`)}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400"
            >
              View Full Results
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Active interview ----------
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Video Interview</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-slate-400 hover:text-white"
        >
          Exit
        </button>
      </div>

      <ProgressBar current={questionCount} total={8} />

      {currentQuestion && (
        <QuestionCard
          question={{
            id: currentQuestion.id,
            question: currentQuestion.question_text,
            category: "Technical",
            difficulty: "Medium",
            expectedTime: 120,
          }}
          current={questionCount}
          total={8}
          speaking={speaking}
          onReplay={() => speak(currentQuestion.question_text)}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Camera
          videoRef={videoRef}
          loading={cameraLoading}
          error={cameraError}
        />

        <div className="flex flex-col gap-4">
          <Timer seconds={seconds} />
          <Transcript transcript={transcript} onChange={setTranscript} />
        </div>
      </div>

      <Controls
        recording={recording}
        listening={listening}
        onStart={startAnswer}
        onStop={stopAnswer}
        onNext={nextQuestion}
      />

      {loading && (
        <p className="text-center text-sm text-cyan-400 animate-pulse">
          Evaluating your answer & generating next question...
        </p>
      )}

      <p className="text-center text-xs text-slate-500">Status: {status}</p>
    </div>
  );
}