import React from "react";
import { ArrowRight, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InterviewPulseLogo from "./InterviewPulseLogo";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="group flex items-center"
        >
          <InterviewPulseLogo compact={false} />
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          
          {/* Sign In */}
          <button
            onClick={() => navigate("/login")}
            className="
              group
              flex items-center gap-2
              rounded-full
              border border-slate-800
              bg-slate-950/60
              px-5 py-2.5
              text-sm font-bold
              text-slate-300
              transition-all duration-200
              hover:border-slate-700
              hover:bg-slate-900
              hover:text-white
            "
          >
            <ArrowRight
              size={16}
              className="text-cyan-400 transition-transform group-hover:translate-x-0.5"
            />

            Sign In
          </button>

          {/* Get Started */}
          <button
            onClick={() => navigate("/register")}
            className="
              group
              flex items-center gap-2
              rounded-full
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-violet-600
              px-5 py-2.5
              text-sm font-bold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-xl
              hover:shadow-blue-500/30
            "
          >
            <UserPlus
              size={16}
              className="transition-transform group-hover:scale-110"
            />

            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;