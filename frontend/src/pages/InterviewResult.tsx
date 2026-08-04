import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";

export function InterviewResult() {
    const { id } = useParams(); 
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchResult() {
            try {
                const response = await api.get(`/interviews/result/${id}`);
                setResult(response.data);
            } catch (e) {
                console.log(e);
                setError("Failed to load interview results.");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchResult();
        }
    }, [id]);

    if (loading) return <p>Loading result...</p>;
    if (error) return <p>{error}</p>;
    if (!result) return <p>No result found.</p>;

    return (
        <div>
            <h1>Interview Result</h1>
            <p><strong>Overall Score:</strong> {result.overall_score}</p>
            <p><strong>Feedback Summary:</strong> {result.feedback_summary}</p>
        </div>
    );
}