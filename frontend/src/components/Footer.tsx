import { Link } from "react-router-dom";
import InterviewPulseLogo from "./InterviewPulseLogo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="max-w-sm">
          <Link
            to="/"
            aria-label="InterviewPulse home"
            className="inline-flex rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          >
            <InterviewPulseLogo compact />
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            A thoughtful place to practice your interview answers, build
            confidence, and decide what to work on next.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
            <li>
              <a className="transition hover:text-white" href="/#how-it-works">
                How it works
              </a>
            </li>
            <li>
              <a className="transition hover:text-white" href="/#practice-modes">
                Practice modes
              </a>
            </li>
            <li>
              <Link className="transition hover:text-white" to="/login">
                Sign in
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-white" to="/register">
                Create an account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-900 px-5 py-4 text-center text-xs text-slate-500 sm:px-8">
        © {new Date().getFullYear()} InterviewPulse
      </div>
    </footer>
  );
}
