import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Bell, Plus, Menu, X, CheckCircle2, ShieldCheck, Clock } from "lucide-react";

export default function Header({ onOpenMobile }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name ? user.name.split(" ")[0] : "Patient";

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/history");
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Left: Greeting & Avatar */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2.5 rounded-2xl bg-white border border-[#E9ECE7] text-[#171917] hover:bg-slate-50 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E9ECE7] flex items-center justify-center text-[#171917] font-extrabold text-base shadow-xs">
          {firstName.charAt(0)}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#171917] leading-tight">
            Hello, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium">
            Monitor your blood glucose & glycemic balance
          </p>
        </div>
      </div>

      {/* Right: Search, Notification & Add Reading CTA */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {/* Functional Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search logs or slots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-52 lg:w-64 pl-10 pr-4 py-2.5 bg-white border border-[#E9ECE7] rounded-2xl text-xs sm:text-sm text-[#171917] placeholder-[#777D78] focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition shadow-xs"
          />
        </form>

        {/* Functional Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition shadow-xs ${
              showNotifications
                ? "bg-[#101310] text-[#C5F53C] border-[#101310]"
                : "bg-white border-[#E9ECE7] text-[#171917] hover:bg-slate-50"
            }`}
            title="Tracking Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#3789F5] absolute top-3 right-3 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-[#E9ECE7] shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E9ECE7]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#101310]" />
                  <span className="text-sm font-black text-[#171917]">Tracker Notifications</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 text-[#777D78] hover:text-[#171917] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 py-3 text-xs">
                <div className="p-3 bg-[#F7F8F5] rounded-2xl border border-[#E9ECE7] flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#101310] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#171917]">Daily Reading Reminders</p>
                    <p className="text-[#777D78] mt-0.5">
                      Remember to log readings across your 4 standardized slots today.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F8F5] rounded-2xl border border-[#E9ECE7] flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#3789F5] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#171917]">Account Synchronized</p>
                    <p className="text-[#777D78] mt-0.5">
                      Signed in as <strong>{user?.email}</strong>. Data stored securely in PostgreSQL.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F8F5] rounded-2xl border border-[#E9ECE7] flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#C5F53C] bg-[#101310] rounded-full shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#171917]">Informational Thresholds Active</p>
                    <p className="text-[#777D78] mt-0.5">
                      70 and 140 mg/dl informational reference indicators enabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E9ECE7] text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] font-bold text-[#777D78] hover:text-[#171917] transition"
                >
                  Dismiss all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button: Neon Lime */}
        <Link
          to="/add-reading"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C5F53C] hover:bg-[#b8eb2f] text-[#101310] font-bold text-sm shadow-sm hover:shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Reading</span>
        </Link>
      </div>
    </header>
  );
}
