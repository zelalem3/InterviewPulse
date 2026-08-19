// src/components/LoadingSpinner.tsx
import React from "react";
import { Loader2 } from "lucide-react";
import InterviewPulseLogo from "./InterviewPulseLogo";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = true,
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen
    ? "min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4 font-sans overflow-hidden"
    : "w-full py-16 flex items-center justify-center p-4 font-sans";

  return (
    <div className={containerClasses}>
      {/* Custom inline keyframes for the smooth robot swing effect */}
      <style>{`
        @keyframes robotSwing {
          0%, 100% {
            transform: rotate(-6deg) translateY(0px);
          }
          50% {
            transform: rotate(6deg) translateY(-3px);
          }
        }
        .animate-robot-swing {
          animation: robotSwing 3s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>

      <div className="relative w-full max-w-[420px]">
        {/* Ambient glow */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-48
            w-48
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-blue-500/10
            blur-[80px]
          "
        />

        {/* Loading Card */}
        <div
          className="
            relative
            flex
            flex-col
            items-center
            overflow-hidden
            rounded-[28px]
            border
            border-slate-800/80
            bg-slate-900/70
            px-8
            py-10
            shadow-2xl
            shadow-black/40
            backdrop-blur-2xl
          "
        >
          {/* Top gradient line */}
          <div
            className="
              absolute
              left-1/2
              top-0
              h-px
              w-2/3
              -translate-x-1/2
              bg-gradient-to-r
              from-transparent
              via-blue-500
              to-transparent
            "
          />

          {/* Logo with interactive swinging wrapper */}
          <div className="pt-2 pb-2">
            <div
              className="
                relative
                flex
                h-[92px]
                w-[92px]
                items-center
                justify-center
                rounded-[28px]
                border
                border-blue-500/20
                bg-slate-950
                shadow-xl
                shadow-blue-500/10
                animate-robot-swing
                cursor-pointer
                transition-transform
                hover:scale-105
              "
              title="AI Core Initializing..."
            >
              {/* Animated glow */}
              <div
                className="
                  absolute
                  inset-0
                  rounded-[28px]
                  bg-gradient-to-br
                  from-cyan-500/10
                  via-blue-500/10
                  to-violet-500/10
                  animate-pulse
                "
              />

              <InterviewPulseLogo
                showText={false}
                compact={false}
                className="relative"
              />
            </div>
          </div>

          {/* Brand */}
          <div className="mt-6 text-center">
            <h3 className="text-xl font-black tracking-tight text-white">
              Interview
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                Pulse
              </span>
            </h3>

            <p className="mt-2 text-sm font-medium text-slate-400">
              {message}
            </p>
          </div>

          {/* Loading indicator */}
          <div className="mt-6 flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500 [animation-delay:300ms]" />
          </div>

          {/* Subtle spinner */}
          <Loader2
            size={16}
            className="
              absolute
              bottom-5
              right-5
              animate-spin
              text-slate-700
            "
          />
        </div>
      </div>
    </div>
  );
}