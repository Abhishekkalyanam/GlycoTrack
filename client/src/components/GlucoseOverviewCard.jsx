import React from "react";
import { Activity, Check, CircleDashed } from "lucide-react";

const SLOTS = [
  { key: "Morning (fasting)", label: "Morning" },
  { key: "After breakfast", label: "Breakfast" },
  { key: "After lunch", label: "Lunch" },
  { key: "After dinner", label: "Dinner" },
];

export default function GlucoseOverviewCard({ dailyStats, readings = [] }) {
  const count = dailyStats?.totalReadings || 0;
  const percentage = Math.min(Math.round((count / 4) * 100), 100);
  const average = dailyStats?.average !== null && dailyStats?.average !== undefined ? dailyStats.average : "—";

  // Check which slots have been recorded
  const recordedSlots = new Set((readings || []).map((r) => r.timeSlot));

  // Circular progress calculations (Radius = 42, Circumference = 2 * pi * 42 = ~263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#101310] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
      {/* Subtle lime glow background blob */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C5F53C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left: Stats & Value */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-[#C5F53C]">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#777D78]">
              Daily Glycemic Overview
            </span>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
              {average}
            </span>
            <span className="text-lg font-bold text-[#C5F53C]">mg/dl</span>
          </div>

          <p className="text-xs sm:text-sm text-[#777D78] font-medium">
            <strong className="text-white font-bold">{count} of 4</strong> reading slots logged today
          </p>

          {/* 4 Reading Slots Indicator Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {SLOTS.map((slot) => {
              const isRecorded = recordedSlots.has(slot.key);
              return (
                <div
                  key={slot.key}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isRecorded
                      ? "bg-[#C5F53C]/15 border-[#C5F53C]/30 text-[#C5F53C]"
                      : "bg-white/5 border-white/10 text-[#777D78]"
                  }`}
                >
                  {isRecorded ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <CircleDashed className="w-3.5 h-3.5" />
                  )}
                  <span>{slot.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Circular Progress Dial */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl min-w-44">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-white/10"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress Bar (Neon Lime) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#C5F53C] transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{percentage}%</span>
              <span className="text-[10px] font-semibold text-[#777D78] uppercase">
                {count}/4 Logged
              </span>
            </div>
          </div>

          <div className="text-center md:text-center text-xs">
            <span className="text-[#C5F53C] font-bold block">
              {count === 4 ? "Goal Complete 🎉" : `${4 - count} slot(s) remaining`}
            </span>
            <span className="text-[11px] text-[#777D78]">Daily target: 4 slots</span>
          </div>
        </div>
      </div>
    </div>
  );
}
