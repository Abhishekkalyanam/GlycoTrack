import React from "react";
import { Link } from "react-router-dom";
import {
  Sunrise,
  Coffee,
  Sun,
  Moon,
  Plus,
  Clock,
  Edit2,
  Calendar,
} from "lucide-react";
import { getGlucoseIndicator } from "../utils/thresholds";

const SLOTS_CONFIG = [
  {
    key: "Morning (fasting)",
    label: "Morning (fasting)",
    shortLabel: "Fasting",
    icon: Sunrise,
    timing: "Fasting measurement",
  },
  {
    key: "After breakfast",
    label: "After breakfast",
    shortLabel: "Breakfast",
    icon: Coffee,
    timing: "Post-breakfast slot",
  },
  {
    key: "After lunch",
    label: "After lunch",
    shortLabel: "Lunch",
    icon: Sun,
    timing: "Post-lunch slot",
  },
  {
    key: "After dinner",
    label: "After dinner",
    shortLabel: "Dinner",
    icon: Moon,
    timing: "Post-dinner slot",
  },
];

export default function DailyReadingsPanel({
  todayReadings = [],
  onEditReading,
  selectedDate,
}) {
  const readingsMap = {};
  (todayReadings || []).forEach((r) => {
    readingsMap[r.timeSlot] = r;
  });

  const loggedCount = Object.keys(readingsMap).length;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E9ECE7] shadow-xs flex flex-col gap-5 h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECE7]">
        <div>
          <h2 className="text-base font-extrabold text-[#171917] tracking-tight">
            My Daily Readings
          </h2>
          <p className="text-xs text-[#777D78] font-medium flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#101310]" />
            <span>{selectedDate || "Today"}</span>
          </p>
        </div>

        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#101310] text-[#C5F53C]">
          {loggedCount} / 4 Recorded
        </span>
      </div>

      {/* 4 Daily Slot Cards */}
      <div className="flex flex-col gap-3.5">
        {SLOTS_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          const reading = readingsMap[cfg.key];
          const indicator = reading ? getGlucoseIndicator(reading.value) : null;

          return (
            <div
              key={cfg.key}
              className={`rounded-2xl p-4 border transition-all duration-150 ${
                reading
                  ? "bg-[#F7F8F5]/80 border-[#E9ECE7] hover:border-[#101310]/20"
                  : "bg-white border-dashed border-[#E9ECE7] hover:border-[#C5F53C]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Icon & Title */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      reading
                        ? "bg-[#101310] text-[#C5F53C]"
                        : "bg-[#F7F8F5] text-[#777D78]"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#171917] leading-tight">
                      {cfg.label}
                    </h3>
                    <p className="text-[11px] text-[#777D78] mt-0.5 font-medium">
                      {cfg.timing}
                    </p>
                  </div>
                </div>

                {/* Edit Button if recorded */}
                {reading && onEditReading && (
                  <button
                    onClick={() => onEditReading(reading)}
                    className="p-1.5 text-[#777D78] hover:text-[#171917] hover:bg-white rounded-lg transition"
                    title="Edit reading"
                    aria-label={`Edit ${cfg.label} reading`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bottom State */}
              <div className="mt-3.5 pt-3 border-t border-[#E9ECE7]/60 flex items-center justify-between">
                {reading ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black tracking-tight text-[#171917]">
                        {reading.value}
                      </span>
                      <span className="text-xs font-bold text-[#777D78]">mg/dl</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#777D78] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {new Date(reading.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {indicator && (
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${indicator.badgeClass}`}
                          title={indicator.description}
                        >
                          {indicator.label}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    to={`/add-reading?slot=${encodeURIComponent(cfg.key)}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-[#C5F53C] hover:text-[#101310] border border-[#E9ECE7] text-xs font-bold text-[#171917] transition shadow-xs group"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform stroke-[2.5]" />
                    <span>Log {cfg.shortLabel}</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
