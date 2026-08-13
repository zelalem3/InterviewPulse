// src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { api } from "../api/axios";
import Navbar from "../components/Navbar";
import InterviewPulseLogo from "../components/InterviewPulseLogo";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await api.post("/auth/signup", {
        name,
        email,
        password,
        password_confirmation: password,
      });

      navigate("/login", { replace: true });
    } catch (err: any) {
      console.error(err.response?.data);

      if (err.response?.status === 422) {
        const errors = err.response.data?.errors;

        const messages = errors
          ? Object.values(errors).flat().join("\n")
          : "Please check your information.";

        setErrorMessage(messages);
      } else {
        const detail =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Registration failed. Please try again.";

        setErrorMessage(detail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
     
      {/* Main */}
      <main className="relative flex min-h-[calc(100vh-74px)] items-center justify-center overflow-hidden px-4 py-10">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="pointer-events-none absolute left-[20%] top-[25%] h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px]" />

        <div className="pointer-events-none absolute bottom-[15%] right-[20%] h-40 w-40 rounded-full bg-violet-600/5 blur-[80px]" />

        {/* Register Card */}
        <div
          className="
            relative
            w-full
            max-w-[500px]
            overflow-hidden
            rounded-[28px]
            border border-slate-800/80
            bg-slate-900/70
            p-7
            shadow-2xl
            shadow-black/40
            backdrop-blur-2xl
            sm:p-9
          "
        >
          {/* Top gradient line */}
          <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div
              className="
                relative
                mb-5
                flex h-[82px] w-[82px]
                items-center justify-center
                rounded-[26px]
                border border-blue-500/20
                bg-slate-950
                shadow-xl
                shadow-blue-500/10
              "
            >
              <div className="absolute inset-0 rounded-[26px] bg-blue-500/5 blur-xl" />

              <InterviewPulseLogo
                showText={false}
                compact={false}
                className="relative"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              Create Your Account
            </h1>

            <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-400">
              Create your InterviewPulse account and start practicing
              with AI-powered interviews.
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              className="
                mt-6
                flex items-start gap-3
                rounded-2xl
                border border-rose-500/20
                bg-rose-500/10
                p-4
                text-sm
                text-rose-300
              "
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div className="whitespace-pre-line font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleRegister}
            className="mt-8 space-y-5"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Full Name
              </label>

              <div
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-slate-800
                  bg-slate-950/70
                  px-4
                  transition-all duration-200
                  focus-within:border-blue-500/60
                  focus-within:ring-4
                  focus-within:ring-blue-500/10
                "
              >
                <User
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="
                    h-14
                    w-full
                    bg-transparent
                    text-sm
                    font-semibold
                    text-white
                    outline-none
                    placeholder:text-slate-600
                  "
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Email Address
              </label>

              <div
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-slate-800
                  bg-slate-950/70
                  px-4
                  transition-all duration-200
                  focus-within:border-blue-500/60
                  focus-within:ring-4
                  focus-within:ring-blue-500/10
                "
              >
                <Mail
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="
                    h-14
                    w-full
                    bg-transparent
                    text-sm
                    font-semibold
                    text-white
                    outline-none
                    placeholder:text-slate-600
                  "
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                Password
              </label>

              <div
                className="
                  flex items-center gap-3
                  rounded-2xl
                  border border-slate-800
                  bg-slate-950/70
                  px-4
                  transition-all duration-200
                  focus-within:border-blue-500/60
                  focus-within:ring-4
                  focus-within:ring-blue-500/10
                "
              >
                <Lock
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
                    h-14
                    w-full
                    bg-transparent
                    text-sm
                    font-semibold
                    text-white
                    outline-none
                    placeholder:text-slate-600
                  "
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                group
                flex h-14 w-full
                items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-r
                from-cyan-500
                via-blue-500
                to-violet-600
                text-sm font-black
                text-white
                shadow-lg
                shadow-blue-500/20
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-xl
                hover:shadow-blue-500/30
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
              "
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Creating Account...
                </>
              ) : (
                <>
                  Create Account

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Already registered?
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an InterviewPulse account?
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="
                  ml-1.5
                  font-bold
                  text-blue-400
                  transition-colors
                  hover:text-cyan-300
                "
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}