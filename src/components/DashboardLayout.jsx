import { Outlet } from "react-router-dom";
import { LogOut, FileText, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-white flex flex-col p-4">
        <h2 className="text-xl text-black font-bold mb-6">Lab Platform</h2>

        <nav className="flex flex-col gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-gray-300">
            <Home size={18} /> Dashboard
          </Link>
          <Link to="/dashboard/eln" className="flex items-center gap-2 hover:text-gray-300">
            <FileText size={18} /> ELN
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
