import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';
import LoadingSpinner from '../components/LoadinSpinner';

interface Question {
  id: number;
  question_text: string;
}

interface Evaluation {
  score?: number;
  feedback?: string;
  model_answer?: string;
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

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [result, setResult] = useState<FinalResult | null>(null);

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
    return <LoadingSpinner message="Preparing your interview session..." />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#000000' }}>
      <h1 style={{ color: '#000000' }}>Interactive Interview Room</h1>

      {/* Transcript of previous turns */}
      {conversation.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', color: '#000000' }}>
          <p style={{ color: '#000000' }}><b style={{ color: '#000000' }}>Q:</b> {item.question}</p>
          <p style={{ color: '#000000' }}><b style={{ color: '#000000' }}>Your Answer:</b> {item.answer}</p>
          <div style={{ marginTop: '8px', padding: '10px', background: '#e9f7ef', borderRadius: '6px', borderLeft: '4px solid #2ecc71', color: '#000000' }}>
            <p style={{ margin: '2px 0', color: '#000000' }}><b style={{ color: '#000000' }}>Score:</b> {item.score ?? "N/A"} / 10</p>
            <p style={{ margin: '2px 0', color: '#000000' }}><b style={{ color: '#000000' }}>Feedback:</b> {item.feedback}</p>
          </div>
        </div>
      ))}

      {/* Final Results View */}
      {result ? (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginTop: '20px', color: '#000000' }}>
          <h2 style={{ color: '#000000' }}>Interview Completed</h2>
          <p style={{ color: '#000000' }}>Overall Score: <b style={{ color: '#000000' }}>{result.overall_score.toFixed(1)} / 10</b></p>
          <p style={{ color: '#000000' }}>Feedback Summary: {result.feedback_summary}</p>
        </div>
      ) : currentQuestion ? (
        /* Active Prompt Interface */
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #3498db', borderRadius: '8px', background: '#fff', color: '#000000' }}>
          <h3 style={{ color: '#000000' }}>Current Question</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#000000' }}>{currentQuestion.question_text}</p>
          
          <textarea
            rows={5}
            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', color: '#000000', background: '#fff' }}
            placeholder="Type your response here..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={loading}
          />

          <div style={{ textAlign: 'right' }}>
            <button 
              onClick={submitAnswer} 
              disabled={loading || !answer.trim()}
              style={{ padding: '10px 20px', fontSize: '1em', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {loading ? "Evaluating & Thinking..." : "Submit Answer & Continue →"}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ color: '#000000' }}>Loading interview...</p>
      )}
    </div>
  );
}