import React from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, Edit2, Trash2 } from "lucide-react";
import { getGlucoseIndicator } from "../utils/thresholds";

export default function RecentReadings({ readings = [], onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9ECE7] shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
            Recent Activity
          </h3>
          <p className="text-xs text-[#777D78] font-medium mt-0.5">
            Latest blood glucose measurements in your diary
          </p>
        </div>
        <Link
          to="/history"
          className="text-xs font-bold text-[#101310] hover:text-[#C5F53C] hover:bg-[#101310] px-3 py-1.5 rounded-xl border border-[#E9ECE7] transition"
        >
          View All History &rarr;
        </Link>
      </div>

      {readings.length === 0 ? (
        <div className="py-12 text-center text-[#777D78]">
          <p className="text-sm font-semibold">No readings recorded yet.</p>
          <Link
            to="/add-reading"
            className="inline-block mt-3 px-5 py-2.5 rounded-2xl bg-[#C5F53C] text-[#101310] text-xs font-black shadow-xs hover:bg-[#b8eb2f] transition"
          >
            + Add First Reading
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9ECE7] text-[11px] font-black uppercase tracking-wider text-[#777D78]">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Time Slot</th>
                <th className="pb-3 px-3">Glucose Level</th>
                <th className="pb-3 px-3">Reference Indicator</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECE7]/60 text-sm">
              {readings.map((reading) => {
                const indicator = getGlucoseIndicator(reading.value);
                return (
                  <tr
                    key={reading.id}
                    className="hover:bg-[#F7F8F5]/60 transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-semibold text-[#171917] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#777D78]" />
                      <span>{reading.date}</span>
                    </td>
                    <td className="py-3.5 px-3 text-[#171917] font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#777D78]" />
                        {reading.timeSlot}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-black text-base text-[#171917]">
                        {reading.value}
                      </span>{" "}
                      <span className="text-xs text-[#777D78] font-bold">mg/dl</span>
                    </td>
                    <td className="py-3.5 px-3">
                      {indicator && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${indicator.badgeClass}`}
                          title={indicator.description}
                        >
                          {indicator.label}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => onEdit && onEdit(reading)}
                        className="p-1.5 text-[#777D78] hover:text-[#101310] hover:bg-[#F7F8F5] rounded-lg transition"
                        title="Edit Reading"
                        aria-label={`Edit reading on ${reading.date} ${reading.timeSlot}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(reading)}
                        className="p-1.5 text-[#777D78] hover:text-[#F15B52] hover:bg-[#F15B52]/10 rounded-lg transition"
                        title="Delete Reading"
                        aria-label={`Delete reading on ${reading.date} ${reading.timeSlot}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
