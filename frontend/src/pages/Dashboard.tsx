import {
  Activity,
  ArrowUpRight,
  HeartPulse,
  ShieldAlert,
  Utensils,
  Dumbbell,
  ChevronRight,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

// ==========================================
// TYPES
// ==========================================

interface Workout {
  _id: string;
  exercise: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  calories: number;
  completed: boolean;
  date: string;
}

interface AIRiskResult {
  risk: number;
  riskLevel: string;
  feedback: string;
  recommendation: string;
  timestamp: string;
}

// ==========================================
// DASHBOARD
// ==========================================

const Dashboard = () => {
  const navigate = useNavigate();

  // ==========================================
  // USER
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // ==========================================
  // WORKOUT STATE
  // ==========================================

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // AI RISK STATE
  // ==========================================

  const [aiRisk, setAiRisk] =
    useState<AIRiskResult | null>(null);

  // ==========================================
  // START AI POSTURE SCAN
  // ==========================================

  const startPostureScan = () => {
    console.log(
      "🚀 Start AI Posture Scan clicked"
    );

    navigate("/workout-ai");
  };

  // ==========================================
  // FETCH WORKOUTS
  // ==========================================

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/workouts");

        console.log(
          "📊 Dashboard workout response:",
          response.data
        );

        if (response.data?.success) {
          setWorkouts(
            response.data.workouts || []
          );
        } else {
          setWorkouts([]);
        }
      } catch (err) {
        console.error(
          "❌ Failed to fetch workouts:",
          err
        );

        setError(
          "Unable to load workout data."
        );

        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  // ==========================================
  // LOAD LATEST AI RISK
  // ==========================================

  useEffect(() => {
    try {
      const savedRisk =
        localStorage.getItem(
          "trainsafe_latest_ai_risk"
        );

      if (!savedRisk) {
        setAiRisk(null);
        return;
      }

      const parsed: AIRiskResult =
        JSON.parse(savedRisk);

      if (
        typeof parsed.risk === "number"
      ) {
        setAiRisk(parsed);
      }
    } catch (err) {
      console.error(
        "❌ Failed to load AI risk:",
        err
      );

      setAiRisk(null);
    }
  }, []);

  // ==========================================
  // CURRENT WEEK
  // ==========================================

  const weekStart = useMemo(() => {
    const now = new Date();

    const day = now.getDay();

    const start = new Date(now);

    // Monday = first day of week
    const difference =
      day === 0 ? -6 : 1 - day;

    start.setDate(
      now.getDate() + difference
    );

    start.setHours(
      0,
      0,
      0,
      0
    );

    return start;
  }, []);

  // ==========================================
  // THIS WEEK'S WORKOUTS
  // ==========================================

  const weekWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) => {
        const workoutDate =
          new Date(workout.date);

        return workoutDate >= weekStart;
      }
    );
  }, [workouts, weekStart]);

  // ==========================================
  // TOTAL CALORIES
  // ==========================================

  const totalCalories = useMemo(() => {
    return weekWorkouts.reduce(
      (total, workout) =>
        total +
        (Number(workout.calories) || 0),
      0
    );
  }, [weekWorkouts]);

  // ==========================================
  // TOTAL TRAINING DURATION
  // ==========================================

  const totalDuration = useMemo(() => {
    return weekWorkouts.reduce(
      (total, workout) =>
        total +
        (Number(workout.duration) || 0),
      0
    );
  }, [weekWorkouts]);

  // ==========================================
  // COMPLETED WORKOUTS
  // ==========================================

  const completedWorkouts =
    useMemo(() => {
      return weekWorkouts.filter(
        (workout) =>
          workout.completed
      ).length;
    }, [weekWorkouts]);

  // ==========================================
  // WEEKLY PERFORMANCE
  // ==========================================

  const weeklyActivity =
    useMemo(() => {
      const days = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ];

      const activity = days.map(
        (day) => ({
          day,
          duration: 0,
        })
      );

      weekWorkouts.forEach(
        (workout) => {
          const date =
            new Date(workout.date);

          let dayIndex =
            date.getDay() - 1;

          // Sunday
          if (dayIndex < 0) {
            dayIndex = 6;
          }

          activity[
            dayIndex
          ].duration +=
            Number(
              workout.duration
            ) || 0;
        }
      );

      const maxDuration =
        Math.max(
          ...activity.map(
            (item) =>
              item.duration
          ),
          1
        );

      return activity.map(
        (item) => ({
          ...item,

          height:
            item.duration === 0
              ? 4
              : Math.max(
                  8,
                  Math.round(
                    (item.duration /
                      maxDuration) *
                      100
                  )
                ),
        })
      );
    }, [weekWorkouts]);

  // ==========================================
  // LATEST WORKOUT
  // ==========================================

  const latestWorkout =
    workouts.length > 0
      ? workouts[0]
      : null;

  // ==========================================
  // FITNESS SCORE
  // ==========================================

  const fitnessScore =
    useMemo(() => {
      if (
        weekWorkouts.length === 0
      ) {
        return 0;
      }

      /*
        Simple prototype score based on
        actual workout activity.

        Maximum:
        - 50 points duration
        - 30 points workout frequency
        - 20 points completion
      */

      const durationScore =
        Math.min(
          50,
          Math.round(
            totalDuration / 3
          )
        );

      const workoutScore =
        Math.min(
          30,
          weekWorkouts.length * 5
        );

      const completionScore =
        Math.min(
          20,
          completedWorkouts * 4
        );

      return Math.min(
        100,
        durationScore +
          workoutScore +
          completionScore
      );
    }, [
      weekWorkouts,
      totalDuration,
      completedWorkouts,
    ]);

  // ==========================================
  // AI RISK DISPLAY HELPERS
  // ==========================================

  const getRiskText = () => {
    if (!aiRisk) {
      return "No AI assessment yet";
    }

    switch (
      aiRisk.riskLevel
    ) {
      case "LOW":
        return "Low injury risk";

      case "MODERATE":
        return "Moderate injury risk";

      case "HIGH":
        return "High injury risk";

      case "CRITICAL":
        return "Critical injury risk";

      default:
        return `${aiRisk.riskLevel} injury risk`;
    }
  };

  const getRiskBarColor = () => {
    if (!aiRisk) {
      return "bg-slate-300";
    }

    switch (
      aiRisk.riskLevel
    ) {
      case "CRITICAL":
        return "bg-red-500";

      case "HIGH":
        return "bg-orange-500";

      case "MODERATE":
        return "bg-yellow-500";

      case "LOW":
        return "bg-emerald-500";

      default:
        return "bg-emerald-500";
    }
  };

  // ==========================================
  // STATS
  // ==========================================

  const stats = [
    {
      title: "Injury Risk",

      value:
        aiRisk !== null
          ? `${aiRisk.risk}%`
          : "--",

      label:
        aiRisk !== null
          ? `${aiRisk.riskLevel} risk`
          : "Run AI assessment",

      icon: ShieldAlert,

      iconBg: "bg-amber-50",

      iconColor:
        "text-amber-500",
    },

    {
      title: "Recovery",

      // Recovery module will be connected later.
      value: "78%",

      label: "Recovery tracking",

      icon: HeartPulse,

      iconBg: "bg-rose-50",

      iconColor:
        "text-rose-500",
    },

    {
      title: "Fitness Score",

      value: `${fitnessScore}`,

      label:
        weekWorkouts.length > 0
          ? `${weekWorkouts.length} workout${
              weekWorkouts.length !==
              1
                ? "s"
                : ""
            } this week`
          : "No workouts this week",

      icon: Activity,

      iconBg: "bg-emerald-50",

      iconColor:
        "text-emerald-600",
    },

    {
      title: "Calories",

      value:
        totalCalories.toLocaleString(),

      label: "This week",

      icon: Utensils,

      iconBg: "bg-blue-50",

      iconColor:
        "text-blue-500",
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

                {user.name ||
                  "Athlete"}{" "}
                👋

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

              {stats.map(
                (stat) => {

                  const Icon =
                    stat.icon;

                  return (
                    <div
                      key={
                        stat.title
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between">

                        <div>

                          <p className="text-sm font-medium text-slate-500">
                            {
                              stat.title
                            }
                          </p>

                          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">

                            {loading &&
                            stat.title !==
                              "Injury Risk" &&
                            stat.title !==
                              "Recovery"
                              ? "..."
                              : stat.value}

                          </p>

                          <p className="mt-1 text-xs font-medium text-emerald-600">
                            {
                              stat.label
                            }
                          </p>

                        </div>

                        <div
                          className={`rounded-xl p-3 ${stat.iconBg} ${stat.iconColor}`}
                        >
                          <Icon
                            size={20}
                          />
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </section>

            {/* ==================================
                ERROR
            ================================== */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ==================================
                MAIN GRID
            ================================== */}

            <section className="mt-6 grid gap-5 xl:grid-cols-3">

              {/* ==================================
                  PERFORMANCE
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Performance Overview
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your training activity this week
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-lg font-bold text-slate-900">
                      {loading
                        ? "..."
                        : `${totalDuration} min`}
                    </p>

                    <p className="text-xs text-slate-400">
                      total training
                    </p>

                  </div>

                </div>

                {/* CHART */}

                <div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-100 pb-2">

                  {weeklyActivity.map(
                    (item) => (

                      <div
                        key={
                          item.day
                        }
                        className="flex flex-1 flex-col items-center gap-3"
                      >

                        <div
                          className="w-full max-w-12 rounded-t-lg bg-emerald-500/70 transition hover:bg-emerald-500"
                          style={{
                            height: `${item.height}%`,
                          }}
                          title={`${item.duration} minutes`}
                        />

                        <span className="text-xs font-medium text-slate-400">
                          {
                            item.day
                          }
                        </span>

                      </div>

                    )
                  )}

                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">

                  <span>
                    {
                      weekWorkouts.length
                    }{" "}
                    workout
                    {weekWorkouts.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    this week
                  </span>

                  <span>
                    {
                      completedWorkouts
                    }{" "}
                    completed
                  </span>

                </div>

              </div>

              {/* ==================================
                  INJURY PREVENTION
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-500">
                    <ShieldAlert
                      size={21}
                    />
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

                    {aiRisk !== null
                      ? `${aiRisk.risk}%`
                      : "--"}

                  </div>

                  <p
                    className={`mt-2 text-sm font-medium ${
                      !aiRisk
                        ? "text-slate-400"
                        : aiRisk.riskLevel ===
                          "CRITICAL"
                          ? "text-red-600"
                          : aiRisk.riskLevel ===
                            "HIGH"
                            ? "text-orange-600"
                            : aiRisk.riskLevel ===
                              "MODERATE"
                              ? "text-yellow-600"
                              : "text-emerald-600"
                    }`}
                  >
                    {getRiskText()}
                  </p>

                </div>

                <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor()}`}
                    style={{
                      width: `${aiRisk?.risk ?? 0}%`,
                    }}
                  />

                </div>

                {aiRisk && (
                  <p className="mt-2 text-center text-xs text-slate-400">
                    Updated{" "}
                    {new Date(
                      aiRisk.timestamp
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </p>
                )}

                <button
                  type="button"
                  onClick={
                    startPostureScan
                  }
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >

                  {aiRisk
                    ? "Run New AI Scan"
                    : "Start AI Posture Scan"}

                  <ArrowUpRight
                    size={17}
                  />

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

                {/* ==================================
                    RECOVERY
                ================================== */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-rose-50 p-3 text-rose-500">
                      <HeartPulse
                        size={22}
                      />
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
                    Recovery tracking coming soon
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">

                    <div className="h-full w-[0%] rounded-full bg-rose-400" />

                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-400">
                    No recovery data
                  </p>

                </div>

                {/* ==================================
                    NUTRITION
                ================================== */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                      <Utensils
                        size={22}
                      />
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

                    {totalCalories >
                    0
                      ? `${totalCalories.toLocaleString()} kcal burned this week`
                      : "No calorie data yet"}

                  </p>

                  <button
                    type="button"
                    className="mt-4 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    View meal plan →
                  </button>

                </div>

                {/* ==================================
                    TRAINING
                ================================== */}

                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

                  <div className="flex items-center justify-between">

                    <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
                      <Dumbbell
                        size={22}
                      />
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

                    {latestWorkout
                      ? `Latest: ${latestWorkout.exercise}`
                      : "No workouts recorded"}

                  </p>

                  <p className="mt-2 text-xs text-slate-400">

                    {latestWorkout
                      ? `${latestWorkout.duration} min • ${latestWorkout.intensity}`
                      : "Start your first workout"}

                  </p>

                  <button
                    type="button"
                    onClick={
                      startPostureScan
                    }
                    className="mt-4 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
                  >
                    Start Training →
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
                      <Activity
                        size={23}
                      />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        AI Training Overview
                      </p>

                      <h3 className="mt-1 text-lg font-bold">

                        {aiRisk
                          ? aiRisk.riskLevel ===
                            "LOW"
                            ? "Your latest AI assessment looks good."
                            : aiRisk.riskLevel ===
                              "MODERATE"
                              ? "Your latest AI assessment needs attention."
                              : "Your latest AI assessment indicates elevated movement risk."
                          : weekWorkouts.length >
                            0
                            ? "Your training activity is being tracked."
                            : "Start your first workout."}

                      </h3>

                      <p className="mt-1 max-w-xl text-sm text-slate-400">

                        {aiRisk
                          ? aiRisk.feedback ||
                            aiRisk.recommendation ||
                            `Latest movement-risk assessment: ${aiRisk.risk}% ${aiRisk.riskLevel}.`
                          : weekWorkouts.length >
                            0
                            ? `You've completed ${completedWorkouts} workout${
                                completedWorkouts !==
                                1
                                  ? "s"
                                  : ""
                              } this week, with ${totalDuration} minutes of recorded training.`
                            : "Complete a workout to start building your personalized training dashboard."}

                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      startPostureScan
                    }
                    className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
                  >

                    Start AI Scan

                    <ArrowUpRight
                      size={16}
                    />

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