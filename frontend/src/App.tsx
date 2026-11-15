// src/App.tsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const NewInterview = lazy(() => import('./pages/NewInterview'));
const InterviewRoom = lazy(() => import('./pages/InterviewRoom'));
const Register = lazy(() => import('./pages/RegisterPage'));
const CodeEditor = lazy(() =>
  import('./pages/CodeEditor').then((module) => ({ default: module.CodeEditor })),
);
const InterviewHistory = lazy(() =>
  import('./pages/InterviewHistory').then((module) => ({ default: module.InterviewHistory })),
);
const PageNotFound = lazy(() =>
  import('./pages/PageNotFound').then((module) => ({ default: module.PageNotFound })),
);
const InterviewResult = lazy(() =>
  import('./pages/InterviewResult').then((module) => ({ default: module.InterviewResult })),
);
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const Settings = lazy(() => import('./pages/settings'));

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400" role="status">
              Loading page...
            </div>
          }
        >
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
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/videointerview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
          <Route
  path="/videointerview/:id"
  element={
    <ProtectedRoute>
      <InterviewPage />
    </ProtectedRoute>
  }
/>
          {/* --- 404 --- */}
          <Route path="*" element={<PageNotFound />} /> 
        </Routes>
        </Suspense>
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