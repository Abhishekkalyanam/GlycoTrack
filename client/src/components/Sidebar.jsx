import React, { useState } from "react";
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
  X,
  Shield,
} from "lucide-react";

export default function Sidebar({ isMobileOpen, onCloseMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    if (onCloseMobile) onCloseMobile();
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar (Desktop Narrow bar + Mobile full drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#101310] flex flex-col justify-between py-6 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen
            ? "translate-x-0 w-72 px-6"
            : "-translate-x-full lg:translate-x-0 lg:w-22 lg:px-0 lg:items-center"
        }`}
      >
        {/* Top: Logo & Mobile Close */}
        <div className="flex flex-col gap-6 w-full lg:items-center">
          <div className="flex items-center justify-between w-full lg:justify-center">
            <Link
              to="/"
              onClick={onCloseMobile}
              className="flex items-center gap-3"
              title="GlycoTrack – Blood Glucose Tracker"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#C5F53C] shadow-lg transition-transform hover:scale-105 shrink-0">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="lg:hidden">
                <span className="text-base font-black text-white tracking-tight block">
                  GlycoTrack
                </span>
                <span className="text-[10px] font-bold text-[#C5F53C] uppercase tracking-wider block">
                  Blood Glucose Tracker
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 mt-4 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`group relative rounded-2xl flex items-center gap-3.5 transition-all duration-200 ${
                    isMobileOpen ? "px-4 py-3" : "w-12 h-12 justify-center lg:mx-auto"
                  } ${
                    active
                      ? "bg-[#C5F53C] text-[#101310] font-bold shadow-md shadow-[#C5F53C]/20"
                      : "text-[#777D78] hover:text-white hover:bg-white/5"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 stroke-[2.2] shrink-0" />

                  {/* Label on Mobile */}
                  <span className={`text-sm font-bold ${isMobileOpen ? "block" : "hidden"}`}>
                    {item.label}
                  </span>

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
        <div className="flex flex-col gap-3 w-full lg:items-center">
          {/* User Profile Trigger */}
          <button
            onClick={() => setShowProfileModal(true)}
            className={`rounded-2xl transition flex items-center gap-3 ${
              isMobileOpen
                ? "p-3 bg-white/5 border border-white/10 text-left w-full hover:bg-white/10"
                : "w-11 h-11 justify-center bg-white/10 border border-white/15 text-[#C5F53C] hover:scale-105"
            }`}
            title="View User Profile"
            aria-label="View user profile"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C5F53C] font-black text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            {isMobileOpen && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Patient"}</p>
                <p className="text-[11px] text-[#777D78] truncate">{user?.email}</p>
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`group relative rounded-2xl flex items-center gap-3 text-[#777D78] hover:text-[#F15B52] hover:bg-[#F15B52]/10 transition ${
              isMobileOpen ? "px-4 py-3 w-full" : "w-11 h-11 justify-center"
            }`}
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`text-sm font-bold ${isMobileOpen ? "block" : "hidden"}`}>
              Sign Out
            </span>
            <span className="hidden lg:block absolute left-full ml-3 px-3 py-1.5 bg-[#171917] text-[#F15B52] text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border border-white/10">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#E9ECE7] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#101310] text-[#C5F53C] flex items-center justify-center text-lg font-black shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-[#777D78] hover:text-[#171917] p-1.5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-[#171917] tracking-tight">
              {user?.name || "Patient Profile"}
            </h3>
            <p className="text-xs text-[#777D78] font-medium mt-0.5">{user?.email}</p>

            <div className="mt-5 space-y-2.5 pt-4 border-t border-[#E9ECE7] text-xs">
              <div className="p-3 bg-[#F7F8F5] rounded-2xl border border-[#E9ECE7] flex justify-between">
                <span className="text-[#777D78] font-semibold">User ID:</span>
                <span className="font-bold text-[#171917]">#{user?.id}</span>
              </div>
              <div className="p-3 bg-[#F7F8F5] rounded-2xl border border-[#E9ECE7] flex justify-between">
                <span className="text-[#777D78] font-semibold">Security:</span>
                <span className="font-bold text-[#171917] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#3789F5]" /> JWT Verified
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-[#777D78] hover:text-[#171917] rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#F15B52] hover:bg-[#df4a41] rounded-2xl shadow-sm transition active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
