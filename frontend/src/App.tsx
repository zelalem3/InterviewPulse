// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewInterview from './pages/NewInterview';
import InterviewRoom from './pages/InterviewRoom';
import Register from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/interview/new" element={<NewInterview />} />
        <Route path="/interview/:id" element={<InterviewRoom />} />
      </Routes>
    </BrowserRouter>
  );
}