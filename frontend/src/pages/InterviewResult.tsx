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
                // Changed from api.get to api.post to match the FastAPI route decorator
                const response = await api.post(`/interviews/${id}/evaluate`);
                setResult(response.data);
            } catch (e) {
                console.error("Evaluation error:", e);
                setError("Failed to generate or load interview results.");
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchResult();
        }
    }, [id]);

    if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Generating comprehensive AI evaluation... Please wait.</div>;
    if (error) return <div style={{ padding: '20px', color: '#ff6b6b' }}>{error}</div>;
    if (!result) return <div style={{ padding: '20px', color: '#fff' }}>No result found.</div>;

    // Safely parse the rich feedback JSON payload stored in feedback_summary
    let parsedFeedback = { summary: result.feedback_summary, categories: {}, detailed_breakdown: [] };
    try {
        if (result.feedback_summary) {
            parsedFeedback = JSON.parse(result.feedback_summary);
        }
    } catch (err) {
        // Fallback if it's plain text string
        parsedFeedback.summary = result.feedback_summary;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', color: '#e0e0e0', background: '#1e1e1e', borderRadius: '8px' }}>
            <h1 style={{ borderBottom: '2px solid #444', paddingBottom: '10px' }}>Interview Evaluation Report</h1>
            
            <div style={{ margin: '20px 0', padding: '15px', background: '#252526', borderRadius: '6px' }}>
                <h2>Overall Score: <span style={{ color: '#4CAF50' }}>{result.overall_score} / 10</span></h2>
            </div>

            {parsedFeedback.categories && Object.keys(parsedFeedback.categories).length > 0 && (
                <div style={{ margin: '20px 0' }}>
                    <h3>Category Ratings</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
                        {Object.entries(parsedFeedback.categories).map(([category, score]) => (
                            <div key={category} style={{ background: '#2d2d30', padding: '12px', borderRadius: '5px', borderLeft: '4px solid #007acc' }}>
                                <span style={{ textTransform: 'capitalize', display: 'block', fontSize: '0.9rem', color: '#aaa' }}>
                                    {category.replace('_', ' ')}
                                </span>
                                <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{score} / 10</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ margin: '20px 0', padding: '15px', background: '#252526', borderRadius: '6px' }}>
                <h3>Feedback Summary</h3>
                <p style={{ lineHeight: '1.6', color: '#d4d4d4' }}>{parsedFeedback.summary}</p>
            </div>

            {parsedFeedback.detailed_breakdown && parsedFeedback.detailed_breakdown.length > 0 && (
                <div style={{ margin: '20px 0' }}>
                    <h3>Detailed Breakdown</h3>
                    {parsedFeedback.detailed_breakdown.map((item, idx) => (
                        <div key={idx} style={{ background: '#2d2d30', padding: '12px', marginBottom: '8px', borderRadius: '5px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#858585', textTransform: 'uppercase' }}>
                                {item.question_type || 'Review'} #{item.index || idx + 1}
                            </span>
                            <p style={{ margin: '5px 0 0 0', color: '#ccc' }}>{item.critique}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}