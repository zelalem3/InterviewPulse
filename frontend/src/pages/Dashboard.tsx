// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

interface Interview {
  id: number;
  job_role: string;
  status: string;
}

export default function Dashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/interviews/')
      .then(res => {
        setInterviews(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>InterviewPulse Dashboard</h1>
      <button onClick={() => navigate('/interview/new')}>Start New Interview</button>
      <h2>Your Past Interviews</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {interviews.map(item => (
            <li key={item.id} style={{ marginBottom: '10px' }}>
              Role: <b>{item.job_role}</b> | Status: <b>{item.status}</b>{' '}
              <button onClick={() => navigate(`/interview/${item.id}`)}>View</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}