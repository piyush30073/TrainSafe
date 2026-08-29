
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const openMobileSidebar = () => {
    window.dispatchEvent(
      new Event("open-mobile-sidebar")
    );
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Overview";

      case "/injury-prevention":
        return "Injury Prevention";

      case "/recovery":
        return "Recovery";

      case "/nutrition":
        return "Nutrition";

      case "/performance":
        return "Performance";

      case "/profile":
        return "Profile";

      default:
        return "Overview";
    }
  };

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-4 text-slate-900 shadow-sm shadow-slate-900/[0.02] sm:px-6">

      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile menu */}
        <button
          type="button"
          onClick={openMobileSidebar}
          aria-label="Open navigation"
          className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <p className="hidden text-xs font-medium text-slate-400 sm:block">
            Athlete Workspace
          </p>

          <h2 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Bell size={20} strokeWidth={2} />

          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:gap-3 sm:pl-4">

          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            {user.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          {/* User details */}
          <div className="hidden text-left sm:block">
            <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
              {user.name || "Athlete"}
            </p>

            <p className="max-w-32 truncate text-xs text-slate-400">
              {user.fitnessGoal || "General Fitness"}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 sm:block"
          />
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={19} />
        </button>

      </div>
    </header>
  );
};

export default Topbar;
