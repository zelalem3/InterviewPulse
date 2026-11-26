import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  
  // Local state for settings form sections
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 shadow-inner">
              <SettingsIcon size={18} />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Account settings</h1>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            Manage the profile details and preferences for your InterviewPulse account.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/60 border border-emerald-900/80 rounded-2xl text-emerald-300 text-xs font-bold animate-fade-in shadow-xl">
            <CheckCircle2 size={16} />
            <span>Changes saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <User size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Profile details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 outline-none focus:border-slate-700 shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 outline-none focus:border-slate-700 shadow-inner"
              />
            </div>
          </div>
        </div>

        

        {/* Notifications & Security */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Bell size={18} className="text-slate-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h2>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-semibold text-slate-300">Interview email updates</span>
              <input 
                type="checkbox" 
                checked={notifications} 
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-slate-700 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Shield size={18} className="text-slate-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account access</h2>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Sign-in status</span>
              <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-xl">Signed in</span>
            </div>
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg cursor-pointer select-none"
          >
            <Save size={16} />
            <span>Save changes</span>
          </button>
        </div>

      </form>
    </div>
  );
}