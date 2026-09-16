// frontend/src/hooks/useInterview.ts
import { useState, useCallback, useEffect, useRef } from "react";
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

  // Audio is blocked by browsers until one user click
  const [interviewStarted, setInterviewStarted] = useState(false);
  const audioUnlockedRef = useRef(false);

  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Load first question from backend (but don't speak yet)
  useEffect(() => {
    if (!interviewId) {
      setError("No interview ID provided");
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const res = await api.post(`/interviews/${interviewId}/start`);
        if (cancelled) return;

        if (res.data?.question) {
          setCurrentQuestion(res.data.question);
          setStatus("idle"); // waiting for user to begin
          setQuestionCount(1);
        }
      } catch (err: any) {
        console.error("Failed to start interview:", err);
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
    };

    load();

    return () => {
      cancelled = true;
      stopSpeech();
      stopListening();
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // ---------- Begin interview (ONE click) → unlock audio + speak first question ----------
  const beginInterview = useCallback(async () => {
    if (!currentQuestion) return;

    audioUnlockedRef.current = true;
    setInterviewStarted(true);
    setStatus("reading");

    // Interviewer asks the first question
    await speak(currentQuestion.question_text);
  }, [currentQuestion, speak]);

  // ---------- Candidate starts answering (do NOT re-read the question) ----------
const startAnswer = useCallback(async () => {
  if (!currentQuestion) return;

  if (!interviewStarted) {
    setInterviewStarted(true);
  }

  stopSpeech();
  setStatus("recording");
  setTranscript("");
  setError(null);

  // Ensure mic permission is granted first
  try {
    if (!stream) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  } catch {
    setError("Microphone permission is required for live transcript.");
    setStatus("paused");
    return;
  }

  startRecording();
  startListening(); // only after mic is allowed
  timer.reset(120);
  timer.start();
}, [/* deps */]);
  // ---------- Stop answering + submit → backend evaluates → auto-speak next question ----------
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
      setQuestionCount((prev) => prev + 1);

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

        // Real interview feel: interviewer asks the next question automatically
        setTimeout(() => {
          speak(data.next_question.question_text);
        }, 600);
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
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
    speak,
  ]);

  // Next button = submit current answer
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
    beginInterview, // ← show this button first
    startAnswer,    // ← only after question was asked
    stopAnswer,
    nextQuestion,
    speak,
    stopSpeech,
  };
}