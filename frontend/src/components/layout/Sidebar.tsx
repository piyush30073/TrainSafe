
import {
  Activity,
  BarChart3,
  HeartPulse,
  LayoutDashboard,
  Salad,
  UserRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const navigation = [
  {
    name: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Injury Prevention",
    path: "/injury-prevention",
    icon: Activity,
  },
  {
    name: "Recovery",
    path: "/recovery",
    icon: HeartPulse,
  },
  {
    name: "Nutrition",
    path: "/nutrition",
    icon: Salad,
  },
  {
    name: "Performance",
    path: "/performance",
    icon: BarChart3,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: UserRound,
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openSidebar = () => {
      setIsOpen(true);
    };

    window.addEventListener("open-mobile-sidebar", openSidebar);

    return () => {
      window.removeEventListener("open-mobile-sidebar", openSidebar);
    };
  }, []);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex min-h-screen w-72 flex-col
          border-r border-slate-200
          bg-white text-slate-900
          shadow-xl shadow-slate-900/5
          transition-transform duration-300
          lg:static lg:w-64 lg:shrink-0
          lg:translate-x-0
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6">
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
              <Activity
                size={21}
                className="text-white"
              />
            </div>

            {/* Brand */}
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Train<span className="text-emerald-600">Safe</span>
              </h1>

              <p className="text-[11px] font-medium text-slate-400">
                Athlete Health AI
              </p>
            </div>
          </div>

          {/* Close button - mobile only */}
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-3 rounded-xl
                  px-3 py-3 text-sm font-semibold
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }
                    />

                    <span>{item.name}</span>

                    {/* Active indicator */}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-semibold text-emerald-700">
                System Online
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              AI health monitoring is ready.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
