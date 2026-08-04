import React, { useEffect, useState } from "react";
import { api } from "../api/axios";

export function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getHistory() {
            try {
                const response = await api.get("/interviews");
                setInterviews(Array.isArray(response.data) ? response.data : []);
            } catch (e) {
                console.log(e);
                setError("Failed to load interview history.");
            } finally {
                setLoading(false);
            }
        }

        getHistory();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Interview History</h1>
            {interviews.length === 0 ? (
                <p>No interviews found.</p>
            ) : (
                interviews.map((interview) => (
                    <div key={interview.id}>
                        <p>Job Role: {interview.job_role}</p>
                        <p>Status: {interview.status}</p>
                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}