import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import LoadingSpinner from "../components/LoadinSpinner";
interface DetailedBreakdownItem {
    question_type?: string;
    index?: number;
    critique?: string;
}

interface ParsedFeedback {
    summary?: string;
    categories?: Record<string, number | string>;
    detailed_breakdown?: DetailedBreakdownItem[];
}

interface InterviewResultData {
    feedback_summary?: string;
    overall_score?: number | string;
    [key: string]: unknown;
}

export function InterviewResult() {
    const { id } = useParams(); 
    const [result, setResult] = useState<InterviewResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchResult() {
            try {
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

    if (loading) return <LoadingSpinner />;
    if (error) return <div style={{ padding: '20px', color: '#ff6b6b' }}>{error}</div>;
    if (!result) return <div style={{ padding: '20px', color: '#fff' }}>No result found.</div>;

    let parsedFeedback: ParsedFeedback = { summary: result.feedback_summary, categories: {}, detailed_breakdown: [] };
    try {
        if (result.feedback_summary) {
            parsedFeedback = JSON.parse(result.feedback_summary);
        }
    } catch {
        parsedFeedback.summary = result.feedback_summary;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', color: '#e0e0e0', background: '#1e1e1e', borderRadius: '8px' }}>
            <h1 style={{ borderBottom: '2px solid #444', paddingBottom: '10px' }}>Interview Evaluation Report</h1>
            
            <div style={{ margin: '20px 0', padding: '15px', background: '#252526', borderRadius: '6px' }}>
                <h2>Overall Score: <span style={{ color: '#4CAF50' }}>{result.overall_score ?? 'N/A'} / 10</span></h2>
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
                                <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{String(score)} / 10</strong>
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