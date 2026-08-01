// src/pages/NewInterview.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewInterview() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);

    const uploadRes = await fetch('http://localhost:8000/api/resume', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!uploadRes.ok) {
      alert('Resume upload failed');
      return;
    }

    const resumeData = await uploadRes.json();

    const interviewRes = await fetch('http://localhost:8000/api/interviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ resume_id: resumeData.id, job_role: jobRole })
    });

    if (interviewRes.ok) {
      const interviewData = await interviewRes.json();
      navigate(`/interview/${interviewData.id}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Setup Interview</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Target Job Role: </label>
          <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Upload Resume (PDF): </label>
          <input type="file" accept=".pdf" onChange={e => e.target.files && setFile(e.target.files[0])} required />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Start Interview</button>
      </form>
    </div>
  );
}