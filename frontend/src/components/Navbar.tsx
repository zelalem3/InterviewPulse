import React from 'react';
import {
  ArrowRight,
  UserPlus,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterviewPulseLogo from './InterviewPulseLogo';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center"
        >
          <InterviewPulseLogo compact={false} />
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-3">

          {isLoggedIn ? (
            <>
              {/* User Avatar & Name */}
              <div className="hidden items-center gap-2 sm:flex mr-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-sm font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {user?.name}
                </span>
              </div>

              {/* Dashboard (Root Route: "/") */}
              <button
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
              >
                <LayoutDashboard size={16} className="text-cyan-400" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              {/* New Interview ("/interview/new") */}
              <button
                onClick={() => navigate('/interview/new')}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
              >
                <PlusCircle size={16} className="text-emerald-400" />
                <span className="hidden md:inline">New Interview</span>
              </button>

              {/* History ("/interview/history") */}
              <button
                onClick={() => navigate('/interview/history')}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
              >
                <History size={16} className="text-violet-400" />
                <span className="hidden md:inline">History</span>
              </button>

              {/* Settings ("/settings") */}
              <button
                onClick={() => navigate('/settings')}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 p-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                title="Settings"
              >
                <SettingsIcon size={16} className="text-slate-400" />
              </button>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-sm font-bold text-slate-400 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                title="Sign Out"
              >
                <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In */}
              <button
                onClick={() => navigate('/login')}
                className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-5 py-2.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:text-white"
              >
                <ArrowRight size={16} className="text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                Sign In
              </button>

              {/* Get Started */}
              <button
                onClick={() => navigate('/register')}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
              >
                <UserPlus size={16} className="transition-transform group-hover:scale-110" />
                Get Started
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
};

export default Navbar;