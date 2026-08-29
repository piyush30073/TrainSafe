
import { useEffect, useState } from "react";
import {
  Apple,
  Beef,
  Carrot,
  Coffee,
  Plus,
  Trash2,
  Utensils,
  Flame,
  Target,
} from "lucide-react";
import type { FormEvent } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

interface Meal {
  _id: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
}

interface NutritionData {
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  mealCount: number;
}

const Nutrition = () => {
  const [nutrition, setNutrition] =
    useState<NutritionData | null>(null);

  const [meal, setMeal] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD TODAY'S NUTRITION
  // ==========================================

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/nutrition");

      setNutrition(response.data.nutrition);
    } catch (error: any) {
      console.error("GET NUTRITION ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load nutrition data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  // ==========================================
  // ADD MEAL
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!meal.trim()) {
      setError("Please enter a meal name.");
      return;
    }

    if (!calories || !protein || !carbs || !fats) {
      setError("Please fill in all nutrition values.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/nutrition", {
        meal: meal.trim(),
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
      });

      setMeal("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");

      await fetchNutrition();
    } catch (error: any) {
      console.error("CREATE MEAL ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to add meal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // DELETE MEAL
  // ==========================================

  const deleteMeal = async (id: string) => {
    try {
      setError("");

      await api.delete(`/nutrition/${id}`);

      await fetchNutrition();
    } catch (error: any) {
      console.error("DELETE MEAL ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete meal."
      );
    }
  };

  const totals = nutrition?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="min-w-0 flex-1">

          <Topbar />

          <main className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* Soft landing-page style background glow */}

            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />

            <div className="mx-auto max-w-7xl">

              {/* ==================================
                  HEADER
              ================================== */}

              <section>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <Utensils className="h-4 w-4" />
                  Nutrition Tracking
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Nutrition Center
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Track your daily meals, monitor your macros and
                  understand how nutrition supports your training.
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
                  NUTRITION STATS
              ================================== */}

              <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Calories */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Calories
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {loading
                          ? "--"
                          : Math.round(totals.calories)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        kcal today
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>

                  </div>

                </div>

                {/* Protein */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Protein
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {loading
                          ? "--"
                          : `${Math.round(
                              totals.protein
                            )}g`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        consumed today
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <Beef className="h-5 w-5 text-emerald-600" />
                    </div>

                  </div>

                </div>

                {/* Carbs */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Carbs
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {loading
                          ? "--"
                          : `${Math.round(
                              totals.carbs
                            )}g`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        consumed today
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50">
                      <Carrot className="h-5 w-5 text-amber-500" />
                    </div>

                  </div>

                </div>

                {/* Fats */}

                <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Fats
                      </p>

                      <p className="mt-3 text-3xl font-black tracking-tight">
                        {loading
                          ? "--"
                          : `${Math.round(
                              totals.fats
                            )}g`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        consumed today
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50">
                      <Coffee className="h-5 w-5 text-purple-500" />
                    </div>

                  </div>

                </div>

              </section>

              {/* ==================================
                  MAIN CONTENT
              ================================== */}

              <section className="mt-6 grid gap-6 lg:grid-cols-3">

                {/* ==================================
                    MEAL LIST
                ================================== */}

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-600">
                        Daily intake
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight">
                        Today's Meals
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {nutrition?.mealCount || 0} meals recorded today
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <Utensils className="h-5 w-5 text-emerald-600" />
                    </div>

                  </div>

                  <div className="mt-7 space-y-3">

                    {loading ? (

                      <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] py-14 text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Loading nutrition data...
                        </p>

                      </div>

                    ) : !nutrition ||
                      nutrition.meals.length === 0 ? (

                      <div className="rounded-2xl border border-dashed border-slate-300 bg-[#f8faf9] p-10 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">

                          <Apple
                            size={26}
                            className="text-emerald-500"
                          />

                        </div>

                        <p className="mt-5 font-bold text-slate-700">
                          No meals recorded today
                        </p>

                        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                          Add your first meal to start tracking
                          your nutrition intake.
                        </p>

                      </div>

                    ) : (

                      nutrition.meals.map((item) => (

                        <div
                          key={item._id}
                          className="group rounded-2xl border border-slate-200 bg-[#f8faf9] p-4 transition duration-300 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-4">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                                <Utensils
                                  size={19}
                                  className="text-emerald-600"
                                />

                              </div>

                              <div className="min-w-0">

                                <h3 className="truncate font-bold text-slate-900">
                                  {item.meal}
                                </h3>

                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                                  {item.calories} kcal
                                </div>

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                deleteMeal(item._id)
                              }
                              aria-label={`Delete ${item.meal}`}
                              className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-2">

                            <div className="rounded-xl bg-white p-3 shadow-sm">

                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Protein
                              </p>

                              <p className="mt-1 text-sm font-bold text-emerald-600">
                                {item.protein}g
                              </p>

                            </div>

                            <div className="rounded-xl bg-white p-3 shadow-sm">

                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Carbs
                              </p>

                              <p className="mt-1 text-sm font-bold text-amber-500">
                                {item.carbs}g
                              </p>

                            </div>

                            <div className="rounded-xl bg-white p-3 shadow-sm">

                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                Fats
                              </p>

                              <p className="mt-1 text-sm font-bold text-purple-500">
                                {item.fats}g
                              </p>

                            </div>

                          </div>

                        </div>

                      ))

                    )}

                  </div>

                </div>

                {/* ==================================
                    ADD MEAL
                ================================== */}

                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">

                      <Plus size={21} />

                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.15em] text-emerald-600">
                        Nutrition
                      </p>

                      <h2 className="mt-1 text-xl font-black">
                        Add Meal
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Record what you ate.
                      </p>
                    </div>

                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-4"
                  >

                    {/* Meal */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Meal
                      </label>

                      <input
                        type="text"
                        value={meal}
                        onChange={(event) =>
                          setMeal(event.target.value)
                        }
                        placeholder="Chicken & Rice"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Calories */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Calories
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={calories}
                        onChange={(event) =>
                          setCalories(event.target.value)
                        }
                        placeholder="500"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </div>

                    {/* Macros */}

                    <div className="grid grid-cols-3 gap-2">

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">
                          Protein
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={protein}
                          onChange={(event) =>
                            setProtein(event.target.value)
                          }
                          placeholder="30"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">
                          Carbs
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={carbs}
                          onChange={(event) =>
                            setCarbs(event.target.value)
                          }
                          placeholder="50"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">
                          Fats
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={fats}
                          onChange={(event) =>
                            setFats(event.target.value)
                          }
                          placeholder="15"
                          required
                          className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                    </div>

                    {/* Submit */}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus
                        size={18}
                        className="transition group-hover:rotate-90"
                      />

                      {submitting
                        ? "Adding..."
                        : "Add Meal"}
                    </button>

                  </form>

                  {/* Small helper */}

                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">

                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                    <p className="text-xs leading-5 text-emerald-700">
                      Keep your meals updated to get a clearer
                      picture of your daily nutrition.
                    </p>

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

export default Nutrition;
