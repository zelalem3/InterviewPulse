import React from "react";

interface InterviewPulseLogoProps {
  showText?: boolean;
  compact?: boolean;
  className?: string;
}

const InterviewPulseLogo: React.FC<InterviewPulseLogoProps> = ({
  showText = true,
  compact = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Robot Icon */}
      <svg
        width={compact ? 42 : 52}
        height={compact ? 42 : 52}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Antenna */}
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="8"
          stroke="#38BDF8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle cx="50" cy="6" r="5" fill="#8B5CF6" />

        {/* Robot outer head */}
        <rect
          x="13"
          y="25"
          width="74"
          height="58"
          rx="20"
          fill="url(#robotGradient)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Side pieces */}
        <rect
          x="7"
          y="43"
          width="10"
          height="22"
          rx="5"
          fill="#94A3B8"
        />

        <rect
          x="83"
          y="43"
          width="10"
          height="22"
          rx="5"
          fill="#94A3B8"
        />

        {/* Face */}
        <rect
          x="25"
          y="42"
          width="50"
          height="32"
          rx="14"
          fill="#020617"
        />

        {/* Pulse / ECG */}
        <path
          d="M15 39 H32 L38 39 L42 31 L46 47 L51 23 L56 47 L61 35 L66 39 H86"
          stroke="url(#pulseGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Eyes */}
        <circle cx="39" cy="57" r="5" fill="#22D3EE" />
        <circle cx="61" cy="57" r="5" fill="#22D3EE" />

        {/* Smile */}
        <path
          d="M43 65 Q50 71 57 65"
          stroke="#CBD5E1"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        <defs>
          <linearGradient
            id="robotGradient"
            x1="13"
            y1="25"
            x2="87"
            y2="83"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F8FAFC" />
            <stop offset="0.55" stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient
            id="pulseGradient"
            x1="15"
            y1="35"
            x2="86"
            y2="35"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06B6D4" />
            <stop offset="0.55" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      {showText && (
        <div className={`ml-3 ${compact ? "leading-none" : ""}`}>
          <div className="text-xl font-black tracking-tight text-white">
            Interview
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Pulse
            </span>
          </div>

          {!compact && (
            <div className="mt-0.5 text-[9px] font-bold tracking-[0.22em] text-slate-500">
              AI INTERVIEW PLATFORM
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPulseLogo;