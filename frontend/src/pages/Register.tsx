import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../services/api";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  age: string;
  height: string;
  weight: string;
  fitnessGoal: string;
}

interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  fitnessGoal?: string;
  authProvider?: string;
  profilePicture?: string;
  profileComplete?: boolean;
}

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isGoogleProfile =
    searchParams.get("complete-profile") === "true";

  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    fitnessGoal: "general-fitness",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD GOOGLE USER DATA
  // ==========================================

  useEffect(() => {
    if (!isGoogleProfile) {
      return;
    }

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user: StoredUser = JSON.parse(storedUser);

      setFormData((previous) => ({
        ...previous,
        name: user.name || "",
        email: user.email || "",
        age:
          user.age !== null &&
          user.age !== undefined
            ? String(user.age)
            : "",
        height:
          user.height !== null &&
          user.height !== undefined
            ? String(user.height)
            : "",
        weight:
          user.weight !== null &&
          user.weight !== undefined
            ? String(user.weight)
            : "",
        fitnessGoal:
          user.fitnessGoal || "general-fitness",
      }));
    } catch (error) {
      console.error(
        "Failed to load stored Google user:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [isGoogleProfile, navigate]);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ========================================
      // GOOGLE PROFILE COMPLETION
      // ========================================

      if (isGoogleProfile) {
        const response = await api.put(
          "/auth/google/profile",
          {
            age: Number(formData.age),
            height: Number(formData.height),
            weight: Number(formData.weight),
            fitnessGoal: formData.fitnessGoal,
          }
        );

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        navigate("/dashboard");
        return;
      }

      // ========================================
      // NORMAL REGISTRATION
      // ========================================

      const response = await api.post(
        "/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          fitnessGoal: formData.fitnessGoal,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/dashboard");
    } catch (error: any) {
      console.error(
        "REGISTER / PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          (
            isGoogleProfile
              ? "Unable to complete your profile. Please try again."
              : "Registration failed. Please try again."
          )
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden bg-[#f8faf9] text-slate-900">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-200/20 blur-3xl" />

      {/* Back button */}
      <div className="absolute left-5 top-5 z-30 sm:left-7 sm:top-6">
        <Link
          to={isGoogleProfile ? "/login" : "/"}
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          {isGoogleProfile
            ? "Back to login"
            : "Back to home"}
        </Link>
      </div>

      {/* Center */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-3">
        <div className="w-full max-w-[430px]">

          {/* Logo */}
          <div className="mb-3 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Activity className="h-4 w-4 text-white" />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Train
                <span className="text-emerald-600">
                  Safe
                </span>
              </span>
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Train smarter. Move safer.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 shadow-xl shadow-slate-900/5">

            {/* Heading */}
            <h1 className="text-lg font-bold tracking-tight">
              {isGoogleProfile
                ? "Complete your athlete profile"
                : "Create your athlete profile"}
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500">
              {isGoogleProfile
                ? "Add your fitness details to personalize TrainSafe."
                : "Personalize your TrainSafe experience."}
            </p>

            {/* Google account information */}
            {isGoogleProfile && (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Google account
                </p>

                <p className="mt-0.5 text-xs font-medium text-slate-800">
                  {formData.name}
                </p>

                <p className="text-[10px] text-slate-500">
                  {formData.email}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-3 space-y-2"
            >

              {/* ======================================
                  NORMAL REGISTRATION ONLY
              ====================================== */}

              {!isGoogleProfile && (
                <>
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Piyush Singh"
                      required
                      autoComplete="name"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      minLength={6}
                      required
                      autoComplete="new-password"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>
                </>
              )}

              {/* ======================================
                  AGE
              ====================================== */}

              <div>
                <label
                  htmlFor="age"
                  className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                >
                  Age
                </label>

                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="18"
                  min={1}
                  max={120}
                  required
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* ======================================
                  HEIGHT + WEIGHT
              ====================================== */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label
                    htmlFor="height"
                    className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                  >
                    Height (cm)
                  </label>

                  <input
                    id="height"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="180"
                    min={50}
                    max={250}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="weight"
                    className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                  >
                    Weight (kg)
                  </label>

                  <input
                    id="weight"
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="75"
                    min={20}
                    max={300}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>

              </div>

              {/* ======================================
                  FITNESS GOAL
              ====================================== */}

              <div>
                <label
                  htmlFor="fitnessGoal"
                  className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                >
                  Primary Fitness Goal
                </label>

                <select
                  id="fitnessGoal"
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleChange}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                >
                  <option value="general-fitness">
                    General Fitness
                  </option>

                  <option value="muscle-gain">
                    Muscle Gain
                  </option>

                  <option value="fat-loss">
                    Fat Loss
                  </option>

                  <option value="performance">
                    Performance
                  </option>

                  <option value="recovery">
                    Recovery
                  </option>
                </select>
              </div>

              {/* ======================================
                  SUBMIT
              ====================================== */}

              <button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? isGoogleProfile
                    ? "Saving Profile..."
                    : "Creating Account..."
                  : isGoogleProfile
                    ? "Complete Athlete Profile"
                    : "Create Athlete Account"}
              </button>
            </form>

            {/* Security */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />

              {isGoogleProfile
                ? "Your profile is securely stored"
                : "Your information is securely stored"}
            </div>

            {/* Bottom navigation */}
            <div className="mt-2 border-t border-slate-100 pt-2 text-center">

              {isGoogleProfile ? (
                <p className="text-[11px] text-slate-500">
                  Want to use another account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Sign In
                  </Link>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Sign In
                  </Link>
                </p>
              )}

            </div>
          </div>

          <p className="mt-1.5 text-center text-[9px] text-slate-400">
            AI-powered training, prevention and recovery.
          </p>

        </div>
      </div>
    </main>
  );
};

export default Register;