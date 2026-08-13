import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Video, 
  Settings as SettingsIcon, 
  Bell, 
  User, 
  Menu, 
  X,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Grab authentication state from store
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = !!token;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/interview/new', label: 'New Interview', icon: PlusCircle },
    { path: '/interview/history', label: 'History', icon: History },
    { path: '/videointerivew', label: 'Video Room', icon: Video },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950 text-slate-100 border-b border-slate-800/80 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Identifier */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate(isAuthenticated ? '/' : '/login')}
          >
            <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-inner group-hover:border-slate-700 transition">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">
                Interview<span className="text-emerald-400">Pulse</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest font-bold text-slate-500">
                AI Pipeline Node
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Only shown if authenticated) */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer select-none ${
                      active
                        ? 'bg-slate-900 text-white border border-slate-800 shadow-inner'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Action Cluster (Conditional based on auth state) */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button 
                  aria-label="View notifications"
                  className="relative p-2.5 rounded-2xl text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80 transition shadow-inner cursor-pointer"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                </button>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                <div className="flex items-center gap-3 pl-1">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-inner">
                    <div className="h-7 w-7 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200 font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white truncate max-w-[100px]">{user?.name || 'Operator'}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">Authenticated</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login', { replace: true });
                    }}
                    title="Sign Out"
                    className="p-2.5 rounded-2xl text-rose-400 hover:bg-rose-950/40 bg-slate-900/60 border border-slate-800/80 transition shadow-inner cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer shadow-inner"
                >
                  <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition cursor-pointer shadow-md"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          {isAuthenticated ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border border-slate-800 shadow-inner'
                        : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {item.label}
                  </button>
                );
              })}
              
              <div className="pt-4 mt-3 border-t border-slate-900 flex items-center justify-between px-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 font-bold shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Operator'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || 'operator@interviewpulse.io'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login', { replace: true });
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <LogIn className="h-4 w-4 text-emerald-400" />
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-emerald-400 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}