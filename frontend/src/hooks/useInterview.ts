import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/axios";
import useSpeech from "./useSpeech";
import useTranscript from "./useTranscript";
import useRecorder from "./useRecorder";
import useTimer from "./useTimer";
import type { InterviewStatus } from "../types/interview";

interface BackendQuestion {
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

export default function useInterview(
  stream: MediaStream | null,
  interviewId: string | undefined
) {
  const { speak, stopSpeech, speaking } = useSpeech();
  const {
    transcript,
    setTranscript,
    listening,
    startListening,
    stopListening,
  } = useTranscript();
  const { recording, startRecording, stopRecording } = useRecorder(stream);
  const timer = useTimer(120);

  const [currentQuestion, setCurrentQuestion] =
    useState<BackendQuestion | null>(null);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [result, setResult] = useState<FinalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Load first question from backend
  useEffect(() => {
    if (!interviewId) {
      setError("No interview ID provided");
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setInitialLoading(true);
        setError(null);
        const res = await api.post(`/interviews/${interviewId}/start`);
        if (cancelled) return;
        if (res.data?.question) {
          setCurrentQuestion(res.data.question);
          setStatus("idle");
          setQuestionCount(1);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to start interview"
          );
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      stopSpeech();
      stopListening();
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Auto-speak new questions after interview has started
  useEffect(() => {
    if (
      !interviewStarted ||
      status !== "reading" ||
      !currentQuestion?.question_text
    ) {
      return;
    }
    const t = setTimeout(() => {
      speak(currentQuestion.question_text);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, interviewStarted, status]);

  const beginInterview = useCallback(() => {
    if (!currentQuestion) return;
    setInterviewStarted(true);
    setStatus("reading");
  }, [currentQuestion]);

  // Start answering — STT optional (user can type if mic blocked)
  const startAnswer = useCallback(() => {
    if (!currentQuestion) {
      console.warn("No current question");
      return;
    }

    if (!interviewStarted) {
      setInterviewStarted(true);
    }

    stopSpeech();
    setError(null);
    setStatus("recording");
    setTranscript("");

    if (stream) {
      startRecording();
    }

    try {
      startListening();
    } catch (err) {
      console.warn("Live transcript unavailable:", err);
    }

    timer.reset(120);
    timer.start();
  }, [
    currentQuestion,
    interviewStarted,
    stream,
    stopSpeech,
    startRecording,
    startListening,
    timer,
    setTranscript,
  ]);

  // Submit transcript to backend and get next question / finish
  const stopAnswer = useCallback(async () => {
    stopRecording();
    stopListening();
    timer.stop();
    stopSpeech();

    if (!currentQuestion) {
      setStatus("paused");
      return;
    }

    const answerText =
      transcriptRef.current.trim() || "(No verbal answer provided)";

    setLoading(true);
    setStatus("paused");

    try {
      const res = await api.post(
        `/interviews/questions/${currentQuestion.id}/answer`,
        { answer_text: answerText }
      );
      const data = res.data;

      setConversation((prev) => [
        ...prev,
        {
          question: currentQuestion.question_text,
          answer: answerText,
          score: data.evaluation?.score,
          feedback: data.evaluation?.feedback,
        },
      ]);

      setTranscript("");
      setQuestionCount((p) => p + 1);

      if (data.interview_finished) {
        setResult(
          data.final_result || {
            overall_score: 0,
            feedback_summary: "Interview completed.",
          }
        );
        setCurrentQuestion(null);
        setStatus("finished");
      } else if (data.next_question) {
        setCurrentQuestion(data.next_question);
        setStatus("reading");
      }
    } catch (err: any) {
      console.error("Submit answer failed:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to submit answer"
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentQuestion,
    stopRecording,
    stopListening,
    stopSpeech,
    timer,
    setTranscript,
  ]);

  const nextQuestion = useCallback(async () => {
    await stopAnswer();
  }, [stopAnswer]);

  return {
    currentQuestion,
    questionCount,
    conversation,
    status,
    result,
    transcript,
    setTranscript,
    listening,
    recording,
    seconds: timer.seconds,
    loading,
    initialLoading,
    error,
    speaking,
    interviewStarted,
    beginInterview,
    startAnswer,
    stopAnswer,
    nextQuestion,
    speak,
    stopSpeech,
  };
}