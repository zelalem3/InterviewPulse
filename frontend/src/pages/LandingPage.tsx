import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  FileText,
  MessageSquareText,
  Mic2,
  Sparkles,
  Video,
} from "lucide-react";
import Footer from "../components/Footer";

const steps = [
  {
    number: "01",
    title: "Bring the role you want",
    description:
      "Add a job title and your resume. Your practice starts with the experience and skills you want to talk about.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Practice out loud or in writing",
    description:
      "Choose a text conversation or a video session, then work through questions and follow-ups at your own pace.",
    icon: MessageSquareText,
  },
  {
    number: "03",
    title: "Know what to work on next",
    description:
      "Review your answers, an overall score, and practical feedback after the interview.",
    icon: Sparkles,
  },
];

export default function LandingPage() {
  return (
    <>
      <div className="overflow-hidden">
        <section className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_18%,rgba(34,211,238,0.12),transparent_36%),radial-gradient(ellipse_at_20%_62%,rgba(99,102,241,0.12),transparent_40%)]"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3.5 py-2 text-xs font-semibold text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                A calmer way to prepare for interviews
              </div>
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                Feel more ready for the interview that matters.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Practice for the role you want with thoughtful, resume-aware
                questions. Answer by typing or speaking, then get feedback you
                can actually use.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                >
                  Start practicing
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-300" />
                  Practice at your own pace
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-300" />
                  Text and video formats
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div
                aria-hidden="true"
                className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-cyan-400/10 via-blue-500/5 to-violet-500/10 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      <Code2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Practice session
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Software Engineer
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                    In progress
                  </span>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-200">
                      <Sparkles size={15} />
                    </div>
                    <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-slate-700/70 bg-slate-800/80 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">
                        Interview question
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-100">
                        Tell me about a project where you had to make a
                        difficult technical trade-off. How did you decide what
                        to prioritize?
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto max-w-[84%] rounded-2xl rounded-tr-md border border-blue-400/20 bg-blue-500/10 p-4">
                    <p className="text-sm leading-6 text-slate-200">
                      I’d start by explaining the constraints, then walk through
                      the options we considered and why we chose the one that
                      best fit the timeline...
                    </p>
                    <p className="mt-2 text-right text-[11px] text-slate-400">
                      Your answer
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <MessageSquareText
                          size={15}
                          className="text-cyan-300"
                        />
                        Type an answer
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mic2 size={14} />
                        or speak in video mode
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                      <span className="text-xs text-slate-500">
                        Take a moment to think it through.
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-5 py-3 text-[11px] text-slate-400 sm:px-6">
                  <span>One question at a time</span>
                  <span className="flex items-center gap-1.5">
                    <Video size={13} className="text-violet-300" />
                    Choose your format
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 border-y border-slate-800/80 bg-slate-900/35"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                A little practice goes a long way
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                From first question to a clearer next step.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
                No scripts to memorize. Just a focused place to think out loud,
                try again, and get more comfortable with your story.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map(({ number, title, description, icon: Icon }) => (
                <article
                  key={number}
                  className="rounded-2xl border border-slate-800 bg-slate-950/65 p-6 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-slate-500">
                      {number}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-200">
                      <Icon size={19} />
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="practice-modes" className="scroll-mt-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Made for real practice
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                Find a practice rhythm that works for you.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400 sm:text-base">
                Some answers are easier to shape in writing. Others need to be
                said out loud. Switch between formats as you build confidence.
              </p>
              <Link
                to="/register"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
              >
                Create your account
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                  <MessageSquareText size={21} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">
                  Text interview
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Take your time with each question and practice making your
                  answers clear and specific.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-900/65 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200">
                  <Video size={21} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">
                  Video interview
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Practice speaking through your ideas with camera and
                  microphone support in your browser.
                </p>
              </article>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-5 sm:col-span-2 sm:flex sm:items-center sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200">
                  <Check size={19} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:mt-0">
                  Your practice is personal: start with your resume and target
                  role, then review feedback in your interview history.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.09] via-slate-900 to-indigo-400/[0.08] px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                  Your next interview starts here
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Make room to practice before it counts.
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Set up your role, choose how you want to practice, and take
                  it one question at a time.
                </p>
              </div>
              <Link
                to="/register"
                className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
