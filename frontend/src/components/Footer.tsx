import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ShieldCheck } from 'lucide-react';

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
            {/* GitHub */}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}