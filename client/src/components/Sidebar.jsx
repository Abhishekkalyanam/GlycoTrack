import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Activity,
  LayoutGrid,
  Plus,
  Clock,
  FileText,
  BarChart2,
  Calendar,
  LogOut,
  User,
} from "lucide-react";

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutGrid },
    { label: "Add Reading", path: "/add-reading", icon: Plus },
    { label: "Reading History", path: "/history", icon: Clock },
    { label: "Daily Report", path: "/reports/daily", icon: FileText },
    { label: "Month-to-Date", path: "/reports/month-to-date", icon: BarChart2 },
    { label: "Previous Month", path: "/reports/previous-month", icon: Calendar },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Vertical Black Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-20 lg:w-22 bg-[#101310] flex flex-col items-center justify-between py-6 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Logo */}
        <div className="flex flex-col items-center gap-6">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#C5F53C] shadow-lg transition-all transform hover:scale-105"
            title="Sweety – Blood Glucose Tracker"
          >
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </Link>

          {/* Navigation Items */}
          <nav className="flex flex-col items-center gap-3 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    active
                      ? "bg-[#C5F53C] text-[#101310] shadow-md shadow-[#C5F53C]/20 scale-105"
                      : "text-[#777D78] hover:text-white hover:bg-white/5"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />

                  {/* Tooltip on Desktop hover */}
                  <span className="hidden lg:block absolute left-full ml-3 px-3 py-1.5 bg-[#171917] text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border border-white/10">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: User & Logout */}
        <div className="flex flex-col items-center gap-3">
          {/* User Avatar */}
          <div
            className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#C5F53C] font-bold text-sm shadow-sm"
            title={user?.name || "Patient"}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="group relative w-11 h-11 rounded-2xl flex items-center justify-center text-[#777D78] hover:text-[#F15B52] hover:bg-[#F15B52]/10 transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block absolute left-full ml-3 px-3 py-1.5 bg-[#171917] text-[#F15B52] text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border border-white/10">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
