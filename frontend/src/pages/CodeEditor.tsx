import Editor from '@monaco-editor/react';
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';

export function CodeEditor() {
    const { interview_id } = useParams();
    const [questions, setQuestions] = useState([]);
    
    // Store editor references by question ID
    const editorsRef = useRef({});

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await api.get(`/code/${interview_id}`);
                setQuestions(response.data);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        }
        
        if (interview_id) {
            fetchQuestions();
        }
    }, [interview_id]);

    async function handleSubmit(questionId) {
        const editorInstance = editorsRef.current[questionId];
        if (!editorInstance) return;

        const answerText = editorInstance.getValue();

        try {
            await api.post(`/code/${questionId}/submit`, {
                answer_text: answerText
            });
            alert("Submitted successfully!");
        } catch (error) {
            console.error("Failed to submit code:", error);
            alert("Submission failed.");
        }
    }

    return (
        <div>
            {questions.length === 0 ? (
                <p>No Question!!! or still generating...</p>
            ) : (
                questions.map((q, index) => (
                    <div key={q.id || index} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #444' }}>
                        <h3>Question {index + 1}</h3>
                        <p>{q.question_text}</p>
                        <Editor 
                            height="40vh" 
                            defaultLanguage="javascript" 
                            defaultValue="// Write your code here" 
                            onMount={(editor) => { editorsRef.current[q.id] = editor; }}
                            theme="vs-dark"
                        />
                        <button 
                            style={{ marginTop: '10px', padding: '8px 16px' }} 
                            onClick={() => handleSubmit(q.id)}
                        >
                            Submit Code
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}