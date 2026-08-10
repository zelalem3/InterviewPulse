// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import { UserPlus, Mail, Lock, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Adjusted endpoint and payload to align with standard Laravel / auth route structures
      await api.post('/auth/signup', {
        name: name,
        email: email,
        password: password,
        password_confirmation: password
      });
      
      // Successfully registered, route to login page
      navigate('/login', { replace: true });
    } catch (err: any) {
      console.error(err.response?.data);
      if (err.response && err.response.status === 422) {
        const errors = err.response.data.errors;
        const messages = errors ? Object.values(errors).flat().join('\n') : 'Validation failed.';
        setErrorMessage(messages);
      } else {
        const detail = err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please try again.';
        setErrorMessage(detail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        
        {/* --- BRANDING / HEADER --- */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-slate-950 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
            <UserPlus size={22} className="ml-0.5" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create Operator Node
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Register to join the InterviewPulse evaluation grid.
          </p>
        </div>

        {/* --- DYNAMIC ERROR TOAST --- */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-900/80 rounded-2xl flex gap-2.5 items-start text-rose-300 text-xs font-bold leading-relaxed shadow-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{errorMessage}</div>
          </div>
        )}

        {/* --- REGISTRATION FORM --- */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Name Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Operator Full Name
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <Sparkles size={16} className="text-slate-400 shrink-0" />
              <input
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Zelalem Getnet"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Email Address
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Password
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submission Trigger */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-300" /> Provisioning Node...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
          Already have an operational key?{" "}
          <Link to="/login" className="text-slate-200 font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}