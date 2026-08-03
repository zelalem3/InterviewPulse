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

interface AnswerFeedback {
  model_answer?: string;
  score?: number;
  feedback?: string;
}

interface FollowUpData {
  id?: number;
  follow_up_question: string;
  expected_topics?: string;
  rationale?: string;
}

export default function InterviewRoom() {
  const { id: interviewId } = useParams<{ id: string }>();
  
  // Page Control: Page 1 = Main Questions, Page 2 = Follow-up Questions
  const [page, setPage] = useState<number>(1);

  // Initial questions and follow-up questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  
  // Shared state for answers and submission status
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submittingStates, setSubmittingStates] = useState<{ [key: number]: boolean }>({});
  const [feedbackData, setFeedbackData] = useState<{ [key: number]: AnswerFeedback }>({});

  const [loadingFollowUps, setLoadingFollowUps] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/questions/${interviewId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setQuestions(Array.isArray(data) ? data : []));
  }, [interviewId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
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

  // Submit and evaluate an individual question (Works for both main and follow-up questions)
  const submitSingleAnswer = async (questionId: number) => {
    const token = localStorage.getItem('token');
    const answerText = answers[questionId];
    if (!answerText) return;

    setSubmittingStates(prev => ({ ...prev, [questionId]: true }));

    try {
      await fetch(`http://localhost:8000/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer_text: answerText })
      });

      const evalRes = await fetch(`http://localhost:8000/api/questions/${questionId}/evaluate-single`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setFeedbackData(prev => ({ ...prev, [questionId]: evalData }));
      }
    } catch (err) {
      console.error(`Error submitting question ${questionId}:`, err);
    } finally {
      setSubmittingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Fetch 10 follow-up questions and switch to Page 2
  const handleGoToNextPage = async () => {
    const token = localStorage.getItem('token');
    setLoadingFollowUps(true);

    try {
      const res = await fetch(`http://localhost:8000/api/questions/${interviewId}/follow-up`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const followUpsList: FollowUpData[] = await res.json();
        if (Array.isArray(followUpsList) && followUpsList.length > 0) {
          // Format follow-ups into Question format with unique IDs
          const formattedFollowUps: Question[] = followUpsList.map((item, idx) => ({
            id: item.id || Date.now() + idx,
            question_text: item.follow_up_question
          }));

          setFollowUpQuestions(formattedFollowUps);
          setPage(2); // Switch to Page 2 view
        }
      }
    } catch (err) {
      console.error("Error loading follow-up questions:", err);
    } finally {
      setLoadingFollowUps(false);
    }
  };

  // Complete Interview on Page 2
  const finishInterview = async () => {
    const token = localStorage.getItem('token');
    const evalRes = await fetch(`http://localhost:8000/api/interviews/${interviewId}/evaluate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (evalRes.ok) {
      const evalData = await evalRes.json();
      setResult(evalData);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Interview Room</h1>

      {result ? (
        <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Final Evaluation Result</h2>
          <p>Overall Score: <b>{result.overall_score} / 10</b></p>
          <p>Feedback Summary: {result.feedback_summary}</p>
        </div>
      ) : (
        <div>
          {/* PAGE 1: INITIAL QUESTIONS */}
          {page === 1 && (
            <div>
              <h3>Part 1: Initial Interview Questions</h3>
              {questions.map((q, idx) => {
                const isSubmitting = submittingStates[q.id] || false;
                const feedback = feedbackData[q.id];

                return (
                  <div key={q.id} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <p><b>Question {idx + 1}:</b> {q.question_text}</p>
                    
                    <textarea
                      rows={4}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      disabled={isSubmitting || !!feedback}
                    />

                    {!feedback ? (
                      <button 
                        onClick={() => submitSingleAnswer(q.id)} 
                        disabled={isSubmitting || !answers[q.id]}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                      >
                        {isSubmitting ? "Evaluating..." : "Submit Answer"}
                      </button>
                    ) : (
                      <div style={{ background: '#e9f7ef', padding: '12px', borderRadius: '6px', marginTop: '10px', borderLeft: '4px solid #2ecc71' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#27ae60' }}>Feedback & Score</h4>
                        <p style={{ margin: '5px 0' }}><b>Score:</b> {feedback.score ?? "N/A"} / 10</p>
                        <p style={{ margin: '5px 0' }}><b>Feedback:</b> {feedback.feedback}</p>
                        {feedback.model_answer && (
                          <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>
                            <b>Model Insight:</b> {feedback.model_answer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* NEXT PAGE BUTTON */}
              {questions.length > 0 && (
                <div style={{ textAlign: 'right', marginTop: '30px' }}>
                  <button 
                    onClick={handleGoToNextPage}
                    disabled={loadingFollowUps}
                    style={{ padding: '12px 24px', fontSize: '1em', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {loadingFollowUps ? "Generating Follow-ups..." : "Next: Follow-up Questions →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAGE 2: FOLLOW-UP QUESTIONS */}
          {page === 2 && (
            <div>
              <h3>Part 2: Follow-Up Questions</h3>
              {followUpQuestions.map((q, idx) => {
                const isSubmitting = submittingStates[q.id] || false;
                const feedback = feedbackData[q.id];

                return (
                  <div key={q.id} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <p><b>Follow-Up Question {idx + 1}:</b> {q.question_text}</p>
                    
                    <textarea
                      rows={4}
                      style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      disabled={isSubmitting || !!feedback}
                    />

                    {!feedback ? (
                      <button 
                        onClick={() => submitSingleAnswer(q.id)} 
                        disabled={isSubmitting || !answers[q.id]}
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                      >
                        {isSubmitting ? "Evaluating..." : "Submit Answer"}
                      </button>
                    ) : (
                      <div style={{ background: '#e9f7ef', padding: '12px', borderRadius: '6px', marginTop: '10px', borderLeft: '4px solid #2ecc71' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#27ae60' }}>Feedback & Score</h4>
                        <p style={{ margin: '5px 0' }}><b>Score:</b> {feedback.score ?? "N/A"} / 10</p>
                        <p style={{ margin: '5px 0' }}><b>Feedback:</b> {feedback.feedback}</p>
                        {feedback.model_answer && (
                          <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#555' }}>
                            <b>Model Insight:</b> {feedback.model_answer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* COMPLETE INTERVIEW BUTTON ON PAGE 2 */}
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button 
                  onClick={finishInterview} 
                  style={{ padding: '12px 24px', fontSize: '1em', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Complete Interview & View Final Summary
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}