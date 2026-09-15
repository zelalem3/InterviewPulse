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
  const timer = useTimer(120); // default 2 min

  const [currentQuestion, setCurrentQuestion] =
    useState<BackendQuestion | null>(null);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [result, setResult] = useState<FinalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(1);

  // Keep latest transcript in a ref so stopAnswer always has the current value
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // ---------- Start interview (load first question from backend) ----------
  useEffect(() => {
    if (!interviewId) {
      setError("No interview ID provided");
      setInitialLoading(false);
      return;
    }

    const start = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const res = await api.post(`/interviews/${interviewId}/start`);
        if (res.data?.question) {
          setCurrentQuestion(res.data.question);
          setStatus("reading");
          // Speak the first question
          setTimeout(() => {
            speak(res.data.question.question_text);
          }, 400);
        }
      } catch (err: any) {
        console.error("Failed to start interview:", err);
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to start interview"
        );
      } finally {
        setInitialLoading(false);
      }
    };

    start();
  }, [interviewId]);

  // ---------- Start answering (record + STT) ----------
  const startAnswer = useCallback(() => {
    if (!currentQuestion) return;

    setStatus("recording");
    setTranscript("");
    startRecording();
    startListening();
    timer.reset(120);
    timer.start();
  }, [currentQuestion, startRecording, startListening, timer, setTranscript]);

    // ---------- Stop answering & submit transcript to backend ----------
  const stopAnswer = useCallback(async () => {
    stopRecording();
    stopListening();
    timer.stop();

    const answerText = transcriptRef.current.trim();

    // Allow continuing even with empty transcript (user can skip)
    if (!currentQuestion) {
      setStatus("paused");
      return;
    }

    setLoading(true);
    setStatus("paused");

    try {
      const res = await api.post(
        `/interviews/questions/${currentQuestion.id}/answer`,
        { answer_text: answerText || "(No verbal answer provided)" }
      );

      const data = res.data;

      setConversation((prev) => [
        ...prev,
        {
          question: currentQuestion.question_text,
          answer: answerText || "(No verbal answer provided)",
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
        setTimeout(() => {
          speak(data.next_question.question_text);
        }, 400);
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
    timer,
    setTranscript,
    speak,
  ]);

  // ---------- Next = always submit current answer and move on ----------
  const nextQuestion = useCallback(async () => {
    // Always run the submit flow (whether still recording or already stopped)
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
    startAnswer,
    stopAnswer,
    nextQuestion,
    speak,
  };
}