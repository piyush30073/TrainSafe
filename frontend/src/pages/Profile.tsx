import { useState, type ReactNode } from "react";
import {
  Activity,
  CalendarDays,
  Mail,
  Pencil,
  Ruler,
  Save,
  Scale,
  Target,
  UserRound,
  X,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

interface User {
  id?: string;
  name?: string;
  email?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
}

interface ProfileForm {
  name: string;
  email: string;
  age: string;
  height: string;
  weight: string;
  fitnessGoal: string;
}

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}

const Profile = () => {
  const storedUser = localStorage.getItem("user");

  let initialUser: User = {};

  try {
    if (storedUser) {
      initialUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read user from localStorage:",
      error
    );
  }

  const [user, setUser] =
    useState<User>(initialUser);

  const [editing, setEditing] =
    useState<boolean>(false);

  const [formData, setFormData] =
    useState<ProfileForm>({
      name: initialUser.name || "",
      email: initialUser.email || "",
      age:
        initialUser.age?.toString() || "",
      height:
        initialUser.height?.toString() || "",
      weight:
        initialUser.weight?.toString() || "",
      fitnessGoal:
        initialUser.fitnessGoal ||
        "general-fitness",
    });

  // ==========================================
  // FORMAT GOAL
  // ==========================================

  const formatGoal = (
    goal?: string
  ): string => {
    if (!goal) {
      return "Not set";
    }

    return goal
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ==========================================
  // BMI
  // ==========================================

  const calculateBMI = (): string => {
    if (!user.height || !user.weight) {
      return "--";
    }

    const heightInMeters =
      user.height / 100;

    const bmi =
      user.weight /
      (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  const bmi = calculateBMI();

  // ==========================================
  // BMI CATEGORY
  // ==========================================

  const getBMILabel = (): string => {
    if (bmi === "--") {
      return "Not available";
    }

    const value = Number(bmi);

    if (value < 18.5) {
      return "Underweight";
    }

    if (value < 25) {
      return "Healthy range";
    }

    if (value < 30) {
      return "Overweight";
    }

    return "Obesity range";
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = () => {
    const updatedUser: User = {
      ...user,

      name: formData.name.trim(),

      email: formData.email.trim(),

      age: formData.age
        ? Number(formData.age)
        : undefined,

      height: formData.height
        ? Number(formData.height)
        : undefined,

      weight: formData.weight
        ? Number(formData.weight)
        : undefined,

      fitnessGoal:
        formData.fitnessGoal,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      age:
        user.age?.toString() || "",
      height:
        user.height?.toString() || "",
      weight:
        user.weight?.toString() || "",
      fitnessGoal:
        user.fitnessGoal ||
        "general-fitness",
    });

    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar />

        <div className="min-w-0 flex-1">

          {/* TOPBAR */}
          <Topbar />

          <main className="px-6 py-8 lg:px-8">

            {/* HEADER */}
            <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-sm font-semibold text-emerald-600">
                  Athlete Profile
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  Your Profile
                </h1>

                <p className="mt-2 text-slate-500">
                  Manage your athlete information
                  and training profile.
                </p>
              </div>

              {!editing ? (
                <button
                  type="button"
                  onClick={() =>
                    setEditing(true)
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <Pencil size={17} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Save size={17} />
                    Save Changes
                  </button>

                </div>
              )}
            </section>

            {/* PROFILE HEADER */}
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <UserRound size={36} />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {user.name ||
                      "Athlete"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email ||
                      "No email available"}
                  </p>

                  <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {formatGoal(
                      user.fitnessGoal
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* PERSONAL INFORMATION */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-lg font-bold">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your basic athlete
                  information.
                </p>
              </div>

              {editing ? (
                <div className="grid gap-5 md:grid-cols-2">

                  {/* NAME */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* AGE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Age
                    </label>

                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* GOAL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fitness Goal
                    </label>

                    <select
                      name="fitnessGoal"
                      value={
                        formData.fitnessGoal
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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

                  {/* HEIGHT */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Height (cm)
                    </label>

                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* WEIGHT */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Weight (kg)
                    </label>

                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">

                  <InfoCard
                    icon={
                      <UserRound size={20} />
                    }
                    label="Full Name"
                    value={
                      user.name ||
                      "Not set"
                    }
                  />

                  <InfoCard
                    icon={
                      <Mail size={20} />
                    }
                    label="Email"
                    value={
                      user.email ||
                      "Not set"
                    }
                  />

                  <InfoCard
                    icon={
                      <CalendarDays
                        size={20}
                      />
                    }
                    label="Age"
                    value={
                      user.age
                        ? `${user.age} years`
                        : "Not set"
                    }
                  />

                  <InfoCard
                    icon={
                      <Target size={20} />
                    }
                    label="Fitness Goal"
                    value={formatGoal(
                      user.fitnessGoal
                    )}
                  />

                </div>
              )}
            </section>

            {/* BODY METRICS */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-lg font-bold">
                  Body Metrics
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Metrics used to personalize
                  your TrainSafe
                  recommendations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">

                <MetricCard
                  icon={
                    <Ruler size={21} />
                  }
                  label="Height"
                  value={
                    user.height
                      ? `${user.height} cm`
                      : "--"
                  }
                />

                <MetricCard
                  icon={
                    <Scale size={21} />
                  }
                  label="Weight"
                  value={
                    user.weight
                      ? `${user.weight} kg`
                      : "--"
                  }
                />

                <MetricCard
                  icon={
                    <Activity size={21} />
                  }
                  label="BMI"
                  value={bmi}
                  subtitle={getBMILabel()}
                />

              </div>
            </section>

            {/* FITNESS GOAL */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Target size={22} />
                </div>

                <div>
                  <h2 className="font-bold">
                    Primary Fitness Goal
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your current training
                    objective
                  </p>
                </div>

              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-[#f8faf9] p-5">

                <p className="text-2xl font-black">
                  {formatGoal(
                    user.fitnessGoal
                  )}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  TrainSafe will use this
                  goal to personalize
                  future training,
                  recovery and nutrition
                  features.
                </p>

              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INFO CARD
// ==========================================

const InfoCard = ({
  icon,
  label,
  value,
}: InfoCardProps) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-[#f8faf9] p-4 transition hover:border-emerald-200">

      <div className="rounded-lg bg-white p-2.5 text-emerald-600 shadow-sm">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {value}
        </p>
      </div>

    </div>
  );
};

// ==========================================
// METRIC CARD
// ==========================================

const MetricCard = ({
  icon,
  label,
  value,
  subtitle,
}: MetricCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#f8faf9] p-5 transition hover:border-emerald-200">

      <div className="flex items-center gap-3 text-emerald-600">

        {icon}

        <span className="text-sm font-medium text-slate-500">
          {label}
        </span>

      </div>

      <p className="mt-4 text-2xl font-black text-slate-900">
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs font-medium text-emerald-600">
          {subtitle}
        </p>
      )}

    </div>
  );
};

export default Profile;