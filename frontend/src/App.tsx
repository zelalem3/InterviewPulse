// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewInterview from './pages/NewInterview';
import InterviewRoom from './pages/InterviewRoom';
import Register from './pages/RegisterPage';
import { CodeEditor } from './pages/CodeEditor';
import { InterviewHistory } from './pages/InterviewHistory';
import { PageNotFound } from './pages/PageNotFound';
import { InterviewResult } from './pages/InterviewResult';
import Navbar from './components/Navbar';
import InterviewPage from './pages/InterviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './pages/settings';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interview/new" element={<ProtectedRoute><NewInterview /></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
          <Route path="/:interview_id/editor" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />
          <Route path="/interview/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
          <Route path="/interview/:id/result" element={<ProtectedRoute><InterviewResult /></ProtectedRoute>} />
          <Route path="/videointerivew" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* --- 404 --- */}
          <Route path="*" element={<PageNotFound />} /> 
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}