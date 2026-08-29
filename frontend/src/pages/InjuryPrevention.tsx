
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Moon,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { FormEvent } from "react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import api from "../services/api";

interface Assessment {
  riskScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  trainingFrequency: number;
  trainingLoad: number;
  previousInjury: boolean;
  currentPain: number;
  sleepQuality: number;
  recoveryQuality: number;
  recommendations: string[];
  createdAt: string;
}

const InjuryPrevention = () => {
  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [trainingFrequency, setTrainingFrequency] =
    useState("4");

  const [trainingLoad, setTrainingLoad] =
    useState("5");

  const [previousInjury, setPreviousInjury] =
    useState(false);

  const [currentPain, setCurrentPain] =
    useState("0");

  const [sleepQuality, setSleepQuality] =
    useState("7");

  const [recoveryQuality, setRecoveryQuality] =
    useState("7");

  const [loading, setLoading] =
    useState(false);

  const [fetching, setFetching] =
    useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD LATEST ASSESSMENT
  // ==========================================

  const fetchLatestAssessment = async () => {
    try {
      setFetching(true);

      const response = await api.get(
        "/injury/latest"
      );

      if (response.data.assessment) {
        const data = response.data.assessment;

        setAssessment(data);

        setTrainingFrequency(
          String(data.trainingFrequency)
        );

        setTrainingLoad(
          String(data.trainingLoad)
        );

        setPreviousInjury(
          data.previousInjury
        );

        setCurrentPain(
          String(data.currentPain)
        );

        setSleepQuality(
          String(data.sleepQuality)
        );

        setRecoveryQuality(
          String(data.recoveryQuality)
        );
      }
    } catch (error: any) {
      console.error(
        "GET INJURY ASSESSMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load injury assessment."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLatestAssessment();
  }, []);

  // ==========================================
  // SUBMIT ASSESSMENT
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/injury/assessment",
        {
          trainingFrequency:
            Number(trainingFrequency),

          trainingLoad:
            Number(trainingLoad),

          previousInjury,

          currentPain:
            Number(currentPain),

          sleepQuality:
            Number(sleepQuality),

          recoveryQuality:
            Number(recoveryQuality),
        }
      );

      setAssessment(
        response.data.assessment
      );
    } catch (error: any) {
      console.error(
        "INJURY ASSESSMENT ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to complete assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RISK STYLES
  // ==========================================

  const getRiskStyles = () => {
    if (!assessment) {
      return {
        text: "text-slate-400",
        bg: "bg-slate-50",
        border: "border-slate-200",
        iconBg: "bg-slate-100",
      };
    }

    if (assessment.riskLevel === "High") {
      return {
        text: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-100",
      };
    }

    if (assessment.riskLevel === "Moderate") {
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
      };
    }

    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
    };
  };

  const riskStyles = getRiskStyles();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8faf9] text-slate-900">

      <div className="flex min-h-screen">

        <Sidebar />

        <div className="min-w-0 flex-1">

          <Topbar />

          <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* ==================================
                HEADER
            ================================== */}

            <section>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-sm font-semibold text-emerald-600">
                  Injury Prevention
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Injury Risk Assessment
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Analyze your training, recovery and
                physical indicators to understand your
                current injury risk.
              </p>
            </section>

            {/* ==================================
                ERROR
            ================================== */}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ==================================
                TOP CARDS
            ================================== */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {/* Risk */}

              <div
                className={`rounded-2xl border p-5 shadow-sm shadow-slate-900/[0.02] ${riskStyles.bg} ${riskStyles.border}`}
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Current Injury Risk
                    </p>

                    <p
                      className={`mt-2 text-4xl font-bold tracking-tight ${riskStyles.text}`}
                    >
                      {fetching
                        ? "--"
                        : `${assessment?.riskScore ?? 0}%`}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl p-3 ${riskStyles.iconBg} ${riskStyles.text}`}
                  >
                    <ShieldAlert size={24} />
                  </div>

                </div>

                <p
                  className={`mt-3 text-sm font-semibold ${riskStyles.text}`}
                >
                  {assessment?.riskLevel ||
                    "No assessment yet"}
                </p>
              </div>

              {/* Training Load */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Activity size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Training Load
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {assessment
                        ? `${assessment.trainingLoad}/10`
                        : "--"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Recovery */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Moon size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Recovery Quality
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {assessment
                        ? `${assessment.recoveryQuality}/10`
                        : "--"}
                    </p>
                  </div>

                </div>

              </div>

            </section>

            {/* ==================================
                MAIN GRID
            ================================== */}

            <section className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* ==================================
                  ASSESSMENT FORM
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6 lg:col-span-2">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <ShieldAlert size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Risk Assessment
                    </h2>

                    <p className="text-sm text-slate-500">
                      Update your current training
                      condition
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-6"
                >

                  {/* Training Frequency */}

                  <div>
                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Training Frequency
                      </label>

                      <span className="text-sm font-semibold text-emerald-600">
                        {trainingFrequency} days/week
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={trainingFrequency}
                      onChange={(event) =>
                        setTrainingFrequency(
                          event.target.value
                        )
                      }
                      className="mt-3 w-full accent-emerald-600"
                    />
                  </div>

                  {/* Training Load */}

                  <div>
                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Training Load
                      </label>

                      <span className="text-sm font-semibold text-emerald-600">
                        {trainingLoad}/10
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={trainingLoad}
                      onChange={(event) =>
                        setTrainingLoad(
                          event.target.value
                        )
                      }
                      className="mt-3 w-full accent-emerald-600"
                    />
                  </div>

                  {/* Previous Injury */}

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Previous Injury
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Have you had an injury recently?
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPreviousInjury(
                          !previousInjury
                        )
                      }
                      aria-label="Toggle previous injury"
                      className={`relative h-6 w-11 rounded-full transition ${
                        previousInjury
                          ? "bg-emerald-600"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          previousInjury
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </button>

                  </div>

                  {/* Current Pain */}

                  <div>
                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Current Pain
                      </label>

                      <span className="text-sm font-semibold text-emerald-600">
                        {currentPain}/10
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={currentPain}
                      onChange={(event) =>
                        setCurrentPain(
                          event.target.value
                        )
                      }
                      className="mt-3 w-full accent-emerald-600"
                    />
                  </div>

                  {/* Sleep */}

                  <div>
                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Sleep Quality
                      </label>

                      <span className="text-sm font-semibold text-emerald-600">
                        {sleepQuality}/10
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={sleepQuality}
                      onChange={(event) =>
                        setSleepQuality(
                          event.target.value
                        )
                      }
                      className="mt-3 w-full accent-emerald-600"
                    />
                  </div>

                  {/* Recovery */}

                  <div>
                    <div className="flex items-center justify-between">

                      <label className="text-sm font-semibold text-slate-700">
                        Recovery Quality
                      </label>

                      <span className="text-sm font-semibold text-emerald-600">
                        {recoveryQuality}/10
                      </span>

                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={recoveryQuality}
                      onChange={(event) =>
                        setRecoveryQuality(
                          event.target.value
                        )
                      }
                      className="mt-3 w-full accent-emerald-600"
                    />
                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles size={18} />

                    {loading
                      ? "Analyzing..."
                      : "Run Risk Assessment"}
                  </button>

                </form>
              </div>

              {/* ==================================
                  RECOMMENDATIONS
              ================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Sparkles size={21} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Recommendations
                    </h2>

                    <p className="text-sm text-slate-500">
                      Personalized guidance
                    </p>
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  {assessment?.recommendations?.length ? (

                    assessment.recommendations.map(
                      (recommendation, index) => (
                        <div
                          key={index}
                          className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <p className="text-sm leading-relaxed text-slate-600">
                            {recommendation}
                          </p>
                        </div>
                      )
                    )

                  ) : (

                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">

                      <AlertTriangle
                        size={24}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        Complete an assessment to
                        receive personalized
                        recommendations.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </section>

            {/* ==================================
                DISCLAIMER
            ================================== */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-xs leading-relaxed text-slate-500 shadow-sm shadow-slate-900/[0.02]">
              <span className="font-semibold text-slate-700">
                Important:
              </span>{" "}
              TrainSafe's injury assessment is intended
              for training and wellness guidance only.
              It is not a medical diagnosis. If you have
              significant or persistent pain, consult a
              qualified healthcare professional.
            </div>

          </main>

        </div>

      </div>

    </div>
  );
};

export default InjuryPrevention;
