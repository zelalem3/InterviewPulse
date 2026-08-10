import Editor from '@monaco-editor/react';
import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';
import type { editor } from 'monaco-editor';

interface Question {
    id: string | number;
    question_text: string;
}

export function CodeEditor() {
    const { interview_id } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    
    // Store editor references by question ID securely mapped
    const editorsRef = useRef<Record<string | number, editor.IStandaloneCodeEditor>>({});

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const response = await api.get<Question[]>(`/code/${interview_id}`);
                setQuestions(response.data);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        }
        
        if (interview_id) {
            fetchQuestions();
        }
    }, [interview_id]);

    async function handleSubmit(questionId: string | number) {
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