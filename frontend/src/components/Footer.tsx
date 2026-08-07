import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-white shadow-inner">
                <Code2 size={20} />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                InterviewPulse
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Empowering technical excellence through intelligent interview simulations, real-time code collaboration, and comprehensive performance analytics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/" className="hover:text-white transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/interview/new" className="hover:text-white transition">New Interview</Link>
              </li>
              <li>
                <Link to="/interview/history" className="hover:text-white transition">History & Logs</Link>
              </li>
              <li>
                <Link to="/videointerivew" className="hover:text-white transition">Video Room</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#docs" className="hover:text-white transition">Documentation</a>
              </li>
              <li>
                <a href="#api" className="hover:text-white transition">API Endpoints</a>
              </li>
              <li>
                <a href="#status" className="hover:text-white transition flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Status
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Trust & Security
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <span>Sanctum Token Protected & Encrypted Pipeline</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} InterviewPulse. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <Github size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <Twitter size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}