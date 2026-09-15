// src/pages/NewInterview.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import {
  FileUp,
  Briefcase,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Video,
} from "lucide-react";

type InterviewMode = "text" | "video";

export default function NewInterview() {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>("");
  const [mode, setMode] = useState<InterviewMode>("text");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file || !jobRole.trim()) {
      setErrorMessage("Please provide both a target job role and a resume PDF.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Upload Resume
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const resumeData = uploadRes.data.data || uploadRes.data;
      const resumeId = resumeData.id;

      if (!resumeId) {
        throw new Error(
          "Resume upload succeeded, but resume ID was missing from server response."
        );
      }

      // 2. Create Interview session
      const interviewRes = await api.post("/interviews/", {
        resume_id: resumeId,
        job_role: jobRole,
      });

      const interviewData = interviewRes.data.data || interviewRes.data;
      const interviewId = interviewData.id;

      if (!interviewId) {
        throw new Error(
          "Interview initialization succeeded, but interview ID was missing."
        );
      }

      // 3. Navigate based on selected mode
      if (mode === "video") {
        navigate(`/videointerview/${interviewId}`);
      } else {
        navigate(`/interview/${interviewId}`);
      }
    } catch (error: any) {
      console.error(error);
      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to initialize interview session.";
      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-5">
        <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
          <Sparkles size={20} />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-black text-white tracking-tight">
            Start New Interview
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            Upload your resume, choose a role, and select Text or Video mode.
          </p>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-900/80 rounded-2xl flex gap-3 items-center text-rose-300 text-xs font-bold shadow-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* Job Role */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <Briefcase size={14} className="text-slate-400" />
            Target Job Role / Stack
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer, Backend Python, Frontend React..."
            className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-100 placeholder:text-slate-600 outline-none focus:border-slate-700 shadow-inner transition"
            required
            disabled={isLoading}
          />
        </div>

        {/* Resume Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <FileUp size={14} className="text-slate-400" />
            Upload Resume (PDF)
          </label>

          <div
            className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all bg-slate-950/40 ${
              file
                ? "border-emerald-500/50 bg-emerald-950/10"
                : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              required
              disabled={isLoading}
            />

            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                {file ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <FileUp size={22} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {file ? file.name : "Click to browse or drop resume PDF"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready for parsing`
                    : "PDF only (Max 10MB)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Mode Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Interview Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Text Mode */}
            <button
              type="button"
              onClick={() => setMode("text")}
              disabled={isLoading}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition ${
                mode === "text"
                  ? "border-cyan-500/60 bg-cyan-950/30 shadow-inner"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              }`}
            >
              <div
                className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border ${
                  mode === "text"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Text Interview</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Type your answers. Best for technical depth and writing practice.
                </p>
              </div>
            </button>

            {/* Video Mode */}
            <button
              type="button"
              onClick={() => setMode("video")}
              disabled={isLoading}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition ${
                mode === "video"
                  ? "border-violet-500/60 bg-violet-950/30 shadow-inner"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
              }`}
            >
              <div
                className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border ${
                  mode === "video"
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <Video size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Video Interview</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Speak your answers with camera. Closer to a real interview.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-5 py-3.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin text-slate-300" />
              Parsing resume & starting session...
            </>
          ) : (
            <>
              <Sparkles size={18} className="text-emerald-400" />
              Start {mode === "video" ? "Video" : "Text"} Interview
            </>
          )}
        </button>
      </form>
    </div>
  );
}