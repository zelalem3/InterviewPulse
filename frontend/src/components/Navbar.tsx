import React, { useState } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Bell, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar({ activeTab = 'dashboard', onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'Interviews', icon: Briefcase },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950 text-slate-100 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Identifier */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate?.('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Interview<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest font-semibold text-indigo-400/80">
                AI Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Cluster (Notifications & Profile) */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              aria-label="View notifications"
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1" />

            <div className="flex items-center gap-3 pl-1">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shadow-inner ring-2 ring-indigo-500/30 cursor-pointer">
                <User className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-5 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate?.(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Zelalem Getnet</p>
                <p className="text-xs text-slate-400">zgetnet24@gmail.com</p>
              </div>
            </div>
            <button aria-label="View notifications" className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}