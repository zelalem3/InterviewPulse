// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Register() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Sending a standard JSON object matching your backend Pydantic schema
      const res = await api.post('/auth/signup', {
        email: email,      // Change to 'username: email' if your backend schema field is named 'username'
        password: password
      });
      
     
      navigate('/login');
    } catch (err: any) {
      console.error(err.response?.data);
      alert('Login failed: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Register</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>Password: </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>Register</button>
      </form>
    </div>
  );
}