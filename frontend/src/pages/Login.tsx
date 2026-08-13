import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { api as axios } from "../api/axios";
import { useAuthStore } from "../store/authStore";

import Navbar from "../components/Navbar";
import InterviewPulseLogo from "../components/InterviewPulseLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginAction = useAuthStore((state) => state.login);
  const logoutAction = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  useEffect(() => {
    logoutAction();
  }, [logoutAction]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      console.log("login successful", response.data);

      const { user, access_token } = response.data;

      loginAction(user, access_token);

      navigate("/", { replace: true });
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .join("\n");

          setErrorMessage(messages);
        } else {
          setErrorMessage("Please check your input.");
        }
      } else {
        setErrorMessage(
          "Invalid credentials or server connection issue."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
     

      {/* Background */}
      <main className="relative flex min-h-[calc(100vh-74px)] items-center justify-center overflow-hidden px-4 py-12">
        
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="pointer-events-none absolute left-[20%] top-[25%] h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px]" />

        <div className="pointer-events-none absolute bottom-[15%] right-[20%] h-40 w-40 rounded-full bg-violet-600/5 blur-[80px]" />

        {/* Login Card */}
        <div
          className="
            relative
            w-full max-w-[500px]
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
          {/* Top glow */}
          <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center">
            
            {/* Logo icon only */}
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
              Welcome Back
            </h1>

            <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-400">
              Sign in to continue your interview practice journey.
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
            onSubmit={handleFormSubmit}
            className="mt-8 space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="
                    text-xs font-bold
                    text-blue-400
                    transition-colors
                    hover:text-cyan-300
                  "
                >
                  Forgot?
                </button>
              </div>

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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In

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
              Or
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?
              <button
                onClick={() => navigate("/register")}
                className="
                  ml-1.5
                  font-bold
                  text-blue-400
                  transition-colors
                  hover:text-cyan-300
                "
              >
                Request Access
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;