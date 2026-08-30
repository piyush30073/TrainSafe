import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  ShieldAlert,
  Utensils,
  Dumbbell,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const Dashboard = () => {
  const navigate = useNavigate();

  // ==========================================
  // USER
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // ==========================================
  // START AI POSTURE SCAN
  // ==========================================

  const startPostureScan = () => {
    console.log("🚀 Start AI Posture Scan clicked");

    navigate("/workout-ai");
  };

  // ==========================================
  // TEMPORARY WORKOUT API TEST
  // ==========================================

  const testWorkout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("No login token found. Please login first.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/workouts",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            exercise: "Running",
            duration: 30,
            intensity: "moderate",
            calories: 250,
            completed: true,
          }),
        }
      );

      const data = await response.json();

      console.log("Workout response:", data);

      if (!response.ok) {
        alert(
          data.message ||
            "Workout creation failed"
        );

        return;
      }

      alert("Workout created successfully!");
    } catch (error) {
      console.error("Workout error:", error);

      alert(
        "Unable to connect to backend"
      );
    }
  };

  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  const stats = [
    {
      title: "Injury Risk",
      value: "23%",
      label: "Low risk",
      icon: ShieldAlert,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "Recovery",
      value: "78%",
      label: "On track",
      icon: HeartPulse,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      title: "Fitness Score",
      value: "82",
      label: "+6 this week",
      icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Energy",
      value: "91%",
      label: "Excellent",
      icon: Utensils,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <Sidebar />

        <div className="min-w-0 flex-1">

          {/* TOPBAR */}

          <Topbar />

          <main className="px-5 py-6 sm:px-6 lg:px-8">

            {/* ==================================
                WELCOME
            ================================== */}

            <section>
              <p className="text-sm font-semibold text-emerald-600">
                Athlete Overview
              </p>

              <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
                Good morning{" "}
                {user.name || "Athlete"} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Here's a quick overview of your
                training, recovery and injury
                prevention status.
              </p>
            </section>

            {/* ==================================
                STATS
            ================================== */}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">

                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>

                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-xs font-medium text-emerald-600">
                          {stat.label}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl p-3 ${stat.iconBg} ${stat.iconColor}`}
                      >
                        <Icon size={20} />
                      </div>

                    </div>
                  </div>
                );
              })}

            </section>

            {/* ==================================
                MAIN GRID
            ================================== */}

            <section className="mt-6 grid gap-5 xl:grid-cols-3">

              {/* PERFORMANCE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Performance Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your training performance this week
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                  >
                    View details
                    <ArrowUpRight size={16} />
                  </button>

                </div>

                {/* CHART */}

                <div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-100 pb-2">

                  {[
                    42,
                    55,
                    48,
                    67,
                    61,
                    76,
                    84,
                  ].map((height, index) => (

                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-3"
                    >

                      <div
                        className="w-full max-w-12 rounded-t-lg bg-emerald-500/70 transition hover:bg-emerald-500"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span className="text-xs font-medium text-slate-400">
                        {
                          [
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ][index]
                        }
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              {/* ==================================
                  INJURY PREVENTION
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
                    <ShieldAlert size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Injury Prevention
                    </h2>

                    <p className="text-sm text-slate-500">
                      Latest AI assessment
                    </p>
                  </div>

                </div>

                <div className="mt-7 text-center">

                  <div className="text-5xl font-bold tracking-tight text-slate-900">
                    23%
                  </div>

                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    Low injury risk
                  </p>

                </div>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[23%] rounded-full bg-emerald-500" />
                </div>

                {/* ==================================
                    START AI POSTURE SCAN
                ================================== */}

                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "🚀 POSTURE BUTTON CLICKED"
                    );

                    navigate("/workout-ai");
                  }}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >
                  Start AI Posture Scan

                  <ArrowUpRight size={17} />
                </button>

              </div>

            </section>

            {/* ==================================
                QUICK ACCESS
            ================================== */}

            <section className="mt-6">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Quick Access
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your training and recovery
                  </p>
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* RECOVERY */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
                      <HeartPulse size={22} />
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                    />

                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Today's Recovery
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    4 of 5 exercises completed
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-full w-[80%] rounded-full bg-rose-400" />
                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    80% completed
                  </p>

                </div>

                {/* NUTRITION */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <Utensils size={22} />
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                    />

                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Nutrition
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    2,850 kcal planned today
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    View meal plan →
                  </button>

                </div>

                {/* TRAINING */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
                      <Dumbbell size={22} />
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                    />

                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Training
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Next session: Upper Body
                  </p>

                  <button
                    type="button"
                    onClick={testWorkout}
                    className="mt-4 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Test Workout →
                  </button>

                </div>

              </div>

            </section>

            {/* ==================================
                AI INSIGHT
            ================================== */}

            <section className="mt-6">

              <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
                      <Activity size={23} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        AI Training Insight
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        Your training load looks healthy.
                      </h3>

                      <p className="mt-1 max-w-xl text-sm text-slate-400">
                        Keep your current recovery
                        routine and avoid increasing
                        training intensity too quickly.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={startPostureScan}
                    className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
                  >
                    Start AI Scan

                    <ArrowUpRight size={16} />
                  </button>

                </div>

              </div>

            </section>

          </main>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;