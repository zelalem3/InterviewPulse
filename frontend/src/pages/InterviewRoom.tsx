import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Question {
  id: number;
  question_text: string;
}

interface EvaluationResult {
  overall_score: number;
  feedback_summary: string;
}

export default function InterviewRoom() {
  const { id: interviewId } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fixed: Changed method to GET and pointed to the correct endpoint path
    fetch(`http://localhost:8000/api/questions/${interviewId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuestions(Array.isArray(data) ? data : []));
  }, [interviewId]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // First, try generating/fetching questions for this interview session
    fetch(`http://localhost:8000/api/questions/${interviewId}/generate-questions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuestions(data);
        }
      })
      .catch(err => console.error("Error loading questions:", err));
  }, [interviewId]);

  const handleAnswerChange = (questionId: number, text: string) => {
    setAnswers({ ...answers, [questionId]: text });
  };

  const submitAnswersAndEvaluate = async () => {
    const token = localStorage.getItem('token');
    for (const q of questions) {
      if (answers[q.id]) {
        await fetch(`http://localhost:8000/api/questions/${q.id}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ answer_text: answers[q.id] })
        });
      }
    }

    const evalRes = await fetch(`http://localhost:8000/api/interviews/${interviewId}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const evalData = await evalRes.json();
    setResult(evalData);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Interview Room</h1>
      {result ? (
        <div>
          <h2>Evaluation Result</h2>
          <p>Overall Score: <b>{result.overall_score}</b></p>
          <p>Feedback: {result.feedback_summary}</p>
        </div>
      ) : (
        <div>
          {questions.map((q, idx) => (
            <div key={q.id} style={{ marginBottom: '20px' }}>
              <p><b>Question {idx + 1}:</b> {q.question_text}</p>
              <textarea
                rows={4}
                style={{ width: '100%' }}
                placeholder="Type your answer here..."
                value={answers[q.id] || ''}
                onChange={e => handleAnswerChange(q.id, e.target.value)}
              />
            </div>
          ))}
          {questions.length > 0 && (
            <button onClick={submitAnswersAndEvaluate}>Submit & Evaluate</button>
          )}
        </div>
      )}
    </div>
  );
}