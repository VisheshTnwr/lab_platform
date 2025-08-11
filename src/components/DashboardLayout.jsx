// src/components/DashboardLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { LogOut, FileText, Home, Menu } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/dashboard/eln", label: "Experiments", icon: FileText },
];

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen relative">
      {/* COLLAPSED SIDEBAR */}
      <div className="relative flex-shrink-0 w-16 bg-white border-r flex flex-col items-center py-4 z-50">
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(true)}
          className="mb-6 p-2 hover:bg-gray-100 rounded"
        >
          <Menu size={20} className="text-slate-700" />
        </button>

        {/* Icons with tooltips */}
        <nav className="flex-1 flex flex-col gap-4 items-center">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="relative group text-slate-700 hover:text-slate-900"
            >
              <Icon size={20} />
              {/* Tooltip */}
              <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto mb-4 relative group">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700"
          >
            <LogOut size={20} />
          </button>
          {/* Tooltip */}
          <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
            Logout
          </span>
        </div>
      </div>

      {/* EXPANDED OVERLAY SIDEBAR */}
      {isExpanded && (
        <>
          <aside className="absolute left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-md border-r shadow-lg p-4 flex flex-col z-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-black font-bold">Lab Platform</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 text-slate-800 hover:text-slate-900"
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500 hover:text-red-600"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto relative z-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
