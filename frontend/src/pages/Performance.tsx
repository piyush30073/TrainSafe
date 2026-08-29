
import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Flame,
  Timer,
  Dumbbell,
} from "lucide-react";
import type { FormEvent } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

interface Workout {
  _id: string;
  exercise: string;
  duration: number;
  intensity: "low" | "moderate" | "high";
  calories: number;
  completed: boolean;
  date: string;
}

const Performance = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const [exercise, setExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<
    "low" | "moderate" | "high"
  >("moderate");
  const [calories, setCalories] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET WORKOUTS
  // ==========================================

  const fetchWorkouts = async () => {
    try {
      setFetching(true);
      setError("");

      const response = await api.get("/workouts");

      console.log("GET WORKOUTS RESPONSE:", response.data);

      setWorkouts(response.data.workouts || []);
    } catch (error: any) {
      console.error("GET WORKOUTS ERROR:", error);

      console.log("GET STATUS:", error.response?.status);
      console.log("GET RESPONSE:", error.response?.data);

      setError(
        error.response?.data?.message ||
          "Unable to load workouts."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // ==========================================
  // LOG WORKOUT
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!exercise.trim()) {
      setError("Please enter an exercise.");
      return;
    }

    if (!duration || Number(duration) <= 0) {
      setError("Please enter a valid duration.");
      return;
    }

    if (Number(calories) < 0) {
      setError("Calories cannot be negative.");
      return;
    }

    try {
      setLoading(true);

      const workoutData = {
        exercise: exercise.trim(),
        duration: Number(duration),
        intensity,
        calories: calories ? Number(calories) : 0,
        completed: true,
      };

      console.log("SENDING WORKOUT:", workoutData);

      const response = await api.post(
        "/workouts",
        workoutData
      );

      console.log(
        "CREATE WORKOUT RESPONSE:",
        response.data
      );

      if (!response.data?.workout) {
        throw new Error(
          "Backend did not return the created workout."
        );
      }

      setWorkouts((previous) => [
        response.data.workout,
        ...previous,
      ]);

      setExercise("");
      setDuration("");
      setIntensity("moderate");
      setCalories("");
    } catch (error: any) {
      console.error(
        "CREATE WORKOUT ERROR:",
        error
      );

      console.log("STATUS:", error.response?.status);
      console.log(
        "RESPONSE:",
        error.response?.data
      );
      console.log("MESSAGE:", error.message);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to log workout."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PERFORMANCE CALCULATIONS
  // ==========================================

  const totalWorkouts = workouts.length;

  const totalMinutes = workouts.reduce(
    (total, workout) =>
      total + Number(workout.duration || 0),
    0
  );

  const totalCalories = workouts.reduce(
    (total, workout) =>
      total + Number(workout.calories || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="min-w-0 flex-1">

          <Topbar />

          <main className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* Landing page style background glow */}

            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />

            <div className="mx-auto max-w-7xl">

              {/* ==================================
                  HEADER
              ================================== */}

              <section>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">

                  <Activity className="h-4 w-4" />

                  Performance Tracking

                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Training Performance
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Track your workouts, training volume and
                  fitness progress in one place.
                </p>

              </section>

              {/* ==================================
                  ERROR
              ================================== */}

              {error && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">

                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />

                  {error}

                </div>
              )}

              {/* ==================================
                  STATS
              ================================== */}

              <section className="mt-8 grid gap-4 sm:grid-cols-3">

                {/* WORKOUTS */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Workouts
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {totalWorkouts}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Total logged
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <Dumbbell className="h-5 w-5 text-emerald-600" />
                    </div>

                  </div>

                </div>

                {/* TRAINING TIME */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Training Time
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {totalMinutes}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Minutes
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                      <Timer className="h-5 w-5 text-blue-500" />
                    </div>

                  </div>

                </div>

                {/* CALORIES */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm font-medium text-slate-500">
                        Calories
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {totalCalories}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Total burned
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>

                  </div>

                </div>

              </section>

              {/* ==================================
                  MAIN CONTENT
              ================================== */}

              <section className="mt-6 grid gap-6 xl:grid-cols-3">

                {/* ==================================
                    LOG WORKOUT
                ================================== */}

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Activity size={21} />
                    </div>

                    <div>

                      <p className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-600">
                        Training
                      </p>

                      <h2 className="mt-1 text-xl font-black">
                        Log Workout
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Record today's training.
                      </p>

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  {/* FORM */}

                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-4"
                  >

                    {/* EXERCISE */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Exercise
                      </label>

                      <input
                        type="text"
                        value={exercise}
                        onChange={(event) =>
                          setExercise(
                            event.target.value
                          )
                        }
                        placeholder="Running"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                    </div>

                    {/* DURATION */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Duration (minutes)
                      </label>

                      <input
                        type="number"
                        value={duration}
                        onChange={(event) =>
                          setDuration(
                            event.target.value
                          )
                        }
                        placeholder="30"
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                    </div>

                    {/* INTENSITY */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Intensity
                      </label>

                      <select
                        value={intensity}
                        onChange={(event) =>
                          setIntensity(
                            event.target.value as
                              | "low"
                              | "moderate"
                              | "high"
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      >

                        <option value="low">
                          Low
                        </option>

                        <option value="moderate">
                          Moderate
                        </option>

                        <option value="high">
                          High
                        </option>

                      </select>

                    </div>

                    {/* CALORIES */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Calories
                      </label>

                      <input
                        type="number"
                        value={calories}
                        onChange={(event) =>
                          setCalories(
                            event.target.value
                          )
                        }
                        placeholder="250"
                        min="0"
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />

                    </div>

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Dumbbell className="h-4 w-4 transition group-hover:scale-110" />

                      {loading
                        ? "Logging Workout..."
                        : "Log Workout"}

                    </button>

                  </form>

                  {/* HELPER */}

                  <div className="mt-6 rounded-2xl bg-emerald-50 p-4">

                    <div className="flex items-start gap-3">

                      <Activity className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-xs leading-5 text-emerald-700">
                        Keep your workouts logged to build a
                        clearer picture of your training progress.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ==================================
                    WORKOUT HISTORY
                ================================== */}

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 xl:col-span-2">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-600">
                        Training history
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight">
                        Workout History
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Your recent training sessions
                      </p>

                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <Dumbbell className="h-5 w-5 text-emerald-600" />
                    </div>

                  </div>

                  <div className="mt-7">

                    {/* LOADING */}

                    {fetching && (
                      <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] py-14 text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Loading workouts...
                        </p>

                      </div>
                    )}

                    {/* EMPTY */}

                    {!fetching &&
                      workouts.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-10 text-center">

                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">

                            <Dumbbell
                              size={27}
                              className="text-emerald-500"
                            />

                          </div>

                          <p className="mt-5 font-bold text-slate-700">
                            No workouts yet
                          </p>

                          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                            Log your first workout to start
                            tracking your performance.
                          </p>

                        </div>
                      )}

                    {/* WORKOUTS */}

                    {!fetching &&
                      workouts.length > 0 && (
                        <div className="space-y-3">

                          {workouts.map((workout) => (

                            <div
                              key={workout._id}
                              className="rounded-2xl border border-slate-200 bg-[#f8faf9] p-4 transition duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                            >

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                {/* WORKOUT INFO */}

                                <div className="flex min-w-0 items-center gap-4">

                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                                    <Activity
                                      size={19}
                                      className="text-emerald-600"
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <h3 className="truncate font-bold text-slate-900">
                                      {workout.exercise}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {new Date(
                                        workout.date
                                      ).toLocaleDateString()}
                                    </p>

                                  </div>

                                </div>

                                {/* WORKOUT DETAILS */}

                                <div className="flex flex-wrap items-center gap-3 sm:gap-5">

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Duration
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {workout.duration} min
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Intensity
                                    </p>

                                    <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                                      {workout.intensity}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                      Calories
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-700">
                                      {workout.calories}
                                    </p>
                                  </div>

                                  {workout.completed && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                                      <CheckCircle2
                                        size={18}
                                        className="text-emerald-600"
                                      />
                                    </div>
                                  )}

                                </div>

                              </div>

                            </div>

                          ))}

                        </div>
                      )}

                  </div>

                </div>

              </section>

            </div>

          </main>

        </div>
      </div>
    </div>
  );
};

export default Performance;
