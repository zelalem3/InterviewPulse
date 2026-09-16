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
    interviewStarted,
    beginInterview,
    startAnswer,
    stopAnswer,
    nextQuestion,
  } = useInterview(stream, interviewId);

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400">Starting video interview...</p>
      </div>
    );
  }

  if (status === "finished" && result) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">Interview Completed</h1>
        <p className="text-3xl font-mono text-amber-400">
          {Number(result.overall_score).toFixed(1)} / 10
        </p>
        <p className="text-slate-300 text-sm">{result.feedback_summary}</p>
        <div className="space-y-2 text-left">
          {conversation.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-800 p-3">
              <p className="text-xs text-cyan-400">Q{i + 1}: {item.question}</p>
              <p className="text-xs text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-xl bg-cyan-500 px-5 py-2.5 font-bold text-slate-950"
        >
          Dashboard
        </button>
      </div>
    );
  }

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

      {(error || cameraError) && (
        <div className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-300">
          {error || cameraError}
        </div>
      )}

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
          onReplay={() => {}}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Camera videoRef={videoRef} loading={cameraLoading} error={cameraError} />
        <div className="flex flex-col gap-4">
          <Timer seconds={seconds} />
          <Transcript
            transcript={transcript}
            onChange={setTranscript}
            listening={listening}
          />
        </div>
      </div>

      {!interviewStarted ? (
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-400">
            Allow camera/mic, then begin. The interviewer will ask questions out loud.
          </p>
          <button
            type="button"
            onClick={beginInterview}
            disabled={!currentQuestion || !!cameraError}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            Begin Interview
          </button>
        </div>
      ) : (
        <Controls
          recording={recording}
          listening={listening}
          onStart={startAnswer}
          onStop={stopAnswer}
          onNext={nextQuestion}
          disabled={loading || !stream}
        />
      )}

      {loading && (
        <p className="text-center text-sm text-cyan-400 animate-pulse">
          Evaluating answer...
        </p>
      )}

      <p className="text-center text-xs text-slate-500">
        Status: {status} | Stream: {stream ? "ready" : "missing"}
      </p>
    </div>
  );
}