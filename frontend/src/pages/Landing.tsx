import {
  ArrowRight,
  Brain,
  ShieldCheck,
  Activity,
  HeartPulse,
  Utensils,
  BarChart3,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Form Analysis",
    description:
      "Analyze your movement and exercise technique to identify potential form issues before they become injuries.",
  },
  {
    icon: ShieldCheck,
    title: "Injury Prevention",
    description:
      "Get intelligent risk insights based on your movement, training patterns, and performance history.",
  },
  {
    icon: HeartPulse,
    title: "Smart Recovery",
    description:
      "Follow personalized recovery guidance designed around your training and progress.",
  },
  {
    icon: Utensils,
    title: "AI Nutrition",
    description:
      "Track your nutrition and receive personalized recommendations aligned with your fitness goals.",
  },
];

const steps = [
  {
    number: "01",
    title: "Analyze",
    description: "TrainSafe analyzes your movement, training and performance data.",
  },
  {
    number: "02",
    title: "Detect",
    description: "AI identifies movement patterns and potential risk factors.",
  },
  {
    number: "03",
    title: "Prevent",
    description: "Get actionable feedback before small problems become injuries.",
  },
  {
    number: "04",
    title: "Recover",
    description: "Track recovery and get smarter recommendations as you progress.",
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f8faf9] text-slate-900">
      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/70 bg-[#f8faf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
              <Activity className="h-5 w-5 text-white" />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Train<span className="text-emerald-600">Safe</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#ai" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              AI
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white md:block"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 lg:pt-40">
        <div className="absolute left-1/2 top-10 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 lg:grid-cols-2 lg:px-8 lg:pb-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              AI-powered sports & fitness
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Train smarter.
              <br />
              <span className="text-emerald-600">Move safer.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
              TrainSafe combines AI-powered movement analysis, injury prevention,
              recovery tracking and nutrition insights to help you train with confidence.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Start Training
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <Play className="h-4 w-4" />
                See how it works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Personalized insights
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Performance tracking
              </div>
            </div>
          </div>

          {/* AI visual */}
          <div id="ai" className="relative">
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Live AI Analysis</p>
                    <h3 className="mt-1 text-xl font-bold">Movement Analysis</h3>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Active
                  </div>
                </div>

                <div className="relative mt-6 flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
                  <div className="absolute h-48 w-48 rounded-full border border-emerald-400/20" />
                  <div className="absolute h-36 w-36 rounded-full border border-emerald-400/20" />
                  <div className="absolute h-24 w-24 rounded-full border border-emerald-400/20" />

                  <div className="relative flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-2 border-emerald-400" />

                    <div className="h-24 w-1 rounded-full bg-emerald-400" />

                    <div className="flex gap-16">
                      <div className="h-20 w-1 rotate-[25deg] rounded-full bg-emerald-400" />
                      <div className="h-20 w-1 -rotate-[25deg] rounded-full bg-emerald-400" />
                    </div>

                    <div className="flex gap-10">
                      <div className="h-24 w-1 rotate-[12deg] rounded-full bg-emerald-400" />
                      <div className="h-24 w-1 -rotate-[12deg] rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Form score</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">92%</p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-slate-400">Risk level</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">Low</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              One platform
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Everything you need to train better.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              TrainSafe brings prevention, recovery, nutrition and performance
              into one intelligent fitness ecosystem.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-3xl border border-slate-200 bg-[#f8faf9] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
              How it works
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              From movement to insight.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Your training data becomes actionable information through the
              TrainSafe AI pipeline.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <span className="text-sm font-black text-emerald-600">
                    {step.number}
                  </span>

                  <h3 className="mt-6 text-2xl font-bold">{step.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 text-slate-300 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance section */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-8 py-14 text-white sm:px-12 lg:px-16">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                  Built around you
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  Your performance.
                  <br />
                  Your data.
                  <br />
                  Your progress.
                </h2>

                <p className="mt-6 max-w-xl leading-7 text-slate-400">
                  Track your workouts, monitor performance trends and understand
                  how your training is changing over time.
                </p>

                <Link
                  to="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Build your profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white/5 p-6">
                  <BarChart3 className="h-7 w-7 text-emerald-400" />
                  <p className="mt-8 text-3xl font-black">24/7</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Progress visibility
                  </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white/5 p-6">
                  <Brain className="h-7 w-7 text-emerald-400" />
                  <p className="mt-8 text-3xl font-black">AI</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Intelligent insights
                  </p>
                </div>

                <div className="rounded-3xl bg-white/5 p-6">
                  <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  <p className="mt-8 text-3xl font-black">Safe</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Training mindset
                  </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white/5 p-6">
                  <Activity className="h-7 w-7 text-emerald-400" />
                  <p className="mt-8 text-3xl font-black">Live</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Movement feedback
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-black tracking-tight sm:text-6xl">
            Don't just train harder.
            <br />
            <span className="text-emerald-600">TrainSafe.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Start building a smarter training routine with AI-powered insights.
          </p>

          <Link
            to="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-slate-800"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Activity className="h-4 w-4 text-slate-950" />
            </div>
            <span className="font-bold">
              Train<span className="text-emerald-400">Safe</span>
            </span>
          </div>

          <p className="text-sm text-slate-500">
            AI-powered training, prevention and recovery.
          </p>
        </div>
      </footer>
    </main>
  );
}