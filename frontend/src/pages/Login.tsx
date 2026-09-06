import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../services/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
            }) => void;
          }) => void;

          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = "google-gsi-script";

const Login = () => {
  const navigate = useNavigate();

  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitializedRef = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // GOOGLE LOGIN RESPONSE
  // ==========================================

  const handleGoogleResponse = async (response: {
    credential: string;
  }) => {
    try {
      setError("");
      setGoogleLoading(true);

      console.log("🔐 Google credential received");

      const result = await api.post("/auth/google", {
        credential: response.credential,
      });

      const { token, user } = result.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      console.log("✅ TrainSafe Google login successful");

      if (!user.profileComplete) {
        navigate("/register?complete-profile=true");
        return;
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error(
        "❌ GOOGLE LOGIN ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ==========================================
  // INITIALIZE GOOGLE SIGN-IN
  // ==========================================

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "❌ VITE_GOOGLE_CLIENT_ID is missing"
      );
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google) {
        console.warn(
          "⚠️ Google Identity Services is not ready yet"
        );
        return;
      }

      if (!googleButtonRef.current) {
        console.warn(
          "⚠️ Google button container is not ready"
        );
        return;
      }

      // Prevent duplicate initialization.
      if (googleInitializedRef.current) {
        return;
      }

      googleInitializedRef.current = true;

      console.log(
        "🔵 Initializing Google Sign-In..."
      );

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 380,
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );

      console.log(
        "✅ Google Sign-In button rendered"
      );
    };

    const existingScript =
      document.getElementById(
        GOOGLE_SCRIPT_ID
      );

    // Google script already exists.
    if (existingScript) {
      if (window.google) {
        renderGoogleButton();
      } else {
        existingScript.addEventListener(
          "load",
          renderGoogleButton,
          { once: true }
        );
      }

      return;
    }

    // Create Google script.
    const script =
      document.createElement("script");

    script.id = GOOGLE_SCRIPT_ID;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log(
        "✅ Google Identity Services loaded"
      );

      renderGoogleButton();
    };

    script.onerror = () => {
      console.error(
        "❌ Failed to load Google Identity Services"
      );

      setError(
        "Unable to load Google Sign-In. Please check your internet connection."
      );
    };

    document.head.appendChild(script);

    return () => {
      // We intentionally do not remove the Google script.
      // It can be reused when navigating back to Login.
    };
  }, []);

  // ==========================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8faf9] px-4 py-8 text-slate-900">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Back */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">

          {/* Logo */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <Activity size={28} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to TrainSafe
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ======================================
              GOOGLE SIGN-IN
          ====================================== */}

          <div className="mb-6 flex min-h-[44px] w-full justify-center">

            {googleLoading ? (
              <div className="flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
                Signing in with Google...
              </div>
            ) : (
              <div
                ref={googleButtonRef}
                className="flex min-h-[44px] w-full items-center justify-center"
              />
            )}

          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>

          {/* Email Login */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          {/* Security */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">

            <ShieldCheck size={15} />

            <span>
              Your data is securely protected
            </span>

          </div>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Create account
            </Link>

          </p>

        </div>
      </div>
    </main>
  );
};

export default Login;