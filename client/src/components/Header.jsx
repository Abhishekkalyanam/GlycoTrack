import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Bell, Plus, Menu } from "lucide-react";

export default function Header({ onOpenMobile }) {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Patient";

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
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs or reports..."
            className="w-52 lg:w-64 pl-10 pr-4 py-2.5 bg-white border border-[#E9ECE7] rounded-2xl text-xs sm:text-sm text-[#171917] placeholder-[#777D78] focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition shadow-xs"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="w-11 h-11 rounded-2xl bg-white border border-[#E9ECE7] flex items-center justify-center text-[#171917] hover:bg-slate-50 transition shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#3789F5] absolute top-3 right-3 ring-2 ring-white" />
          </button>
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
