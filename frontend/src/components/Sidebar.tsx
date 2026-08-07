import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Video, 
  Code, 
  LogOut, 
  ShieldAlert 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'New Interview', path: '/interview/new', icon: PlusCircle },
    { name: 'Interview History', path: '/interview/history', icon: History },
    { name: 'Video Room', path: '/videointerivew', icon: Video },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 
        flex flex-col font-sans transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-white shadow-inner">
              <Code size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">
                InterviewPulse
              </h1>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Node
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Platform Navigation
          </p>
          
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all
                  ${active 
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-inner' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}
                `}
              >
                <IconComponent size={18} className={active ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Profile & Logout Footprint */}
        <div className="p-4 border-t border-slate-950 bg-slate-950/40">
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-black text-slate-200 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || 'Operator'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  {user?.email || 'operator@interviewpulse.io'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 text-xs font-bold rounded-xl transition cursor-pointer select-none"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}