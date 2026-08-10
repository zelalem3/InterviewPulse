import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';

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
  const [result, setResult] = useState<FinalResult | null>(null);

  useEffect(() => {
    startInterview();
  }, [interviewId]);

  const startInterview = async () => {
    try {
      // Using axios client (token automatically attached by interceptor)
      const res = await api.post(`/interviews/${interviewId}/start`);
      if (res.data?.question) {
        setCurrentQuestion(res.data.question);
      }
    } catch (err) {
      console.error("Failed to start interview:", err);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;

    setLoading(true);

    try {
      // Using axios client
      const res = await api.post(`/interviews/questions/${currentQuestion.id}/answer`, {
        answer_text: answer
      });

      const data = res.data;

      // Append to running conversational history transcript
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Interactive Interview Room</h1>

      {/* Transcript of previous turns */}
      {conversation.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
          <p><b>Q:</b> {item.question}</p>
          <p><b>Your Answer:</b> {item.answer}</p>
          <div style={{ marginTop: '8px', padding: '10px', background: '#e9f7ef', borderRadius: '6px', borderLeft: '4px solid #2ecc71' }}>
            <p style={{ margin: '2px 0' }}><b>Score:</b> {item.score ?? "N/A"} / 10</p>
            <p style={{ margin: '2px 0' }}><b>Feedback:</b> {item.feedback}</p>
          </div>
        </div>
      ))}

      {/* Final Results View */}
      {result ? (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Interview Completed</h2>
          <p>Overall Score: <b>{result.overall_score.toFixed(1)} / 10</b></p>
          <p>Feedback Summary: {result.feedback_summary}</p>
        </div>
      ) : currentQuestion ? (
        /* Active Prompt Interface */
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #3498db', borderRadius: '8px', background: '#fff' }}>
          <h3>Current Question</h3>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{currentQuestion.question_text}</p>
          
          <textarea
            rows={5}
            style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
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
        <p>Loading interview...</p>
      )}
    </div>
  );
}