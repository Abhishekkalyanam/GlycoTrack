import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import {
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export default function DailyReport() {
  const { showError } = useNotification();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reports/daily?date=${selectedDate}`);
      setReport(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load daily report.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, showError]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const chartData = (report?.readings || []).map((r) => ({
    slot: r.timeSlot,
    value: r.value,
  }));

  const getBarColor = (val) => {
    if (val < 70) return "#f59e0b"; // amber
    if (val > 140) return "#f43f5e"; // rose
    return "#0ea5e9"; // sky
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-sky-600" />
            <span>Daily Glucose Report</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Detailed breakdown and statistics for a single calendar day
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Calendar className="w-4 h-4 text-sky-600" />
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-2.5 bg-white text-slate-600 hover:text-sky-600 border border-slate-200 rounded-2xl shadow-xs transition"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3 shadow-sm">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
          <span className="text-sm font-semibold">Generating daily report...</span>
        </div>
      ) : report?.totalReadings === 0 ? (
        <EmptyState
          title={`No readings recorded for ${selectedDate}`}
          description="There are no glucose measurements logged on this date. You can add one anytime."
          actionText="Add Reading for this Date"
          actionLink="/add-reading"
        />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Readings"
              value={`${report.totalReadings} / 4`}
              subtitle={`Recorded on ${report.date}`}
              icon={CheckCircle2}
              color="sky"
            />

            <StatCard
              title="Average Glucose"
              value={report.average}
              unit="mg/dl"
              subtitle="Daily rounded average (1 dec)"
              icon={TrendingUp}
              color="indigo"
            />

            <StatCard
              title="Highest Reading"
              value={report.highest}
              unit="mg/dl"
              subtitle="Peak glucose of the day"
              icon={ArrowUpRight}
              color="rose"
            />

            <StatCard
              title="Lowest Reading"
              value={report.lowest}
              unit="mg/dl"
              subtitle="Trough glucose of the day"
              icon={ArrowDownRight}
              color="emerald"
            />
          </div>

          {/* Slot Breakdown Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Time Slot Comparison ({report.date})
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Elevated (&gt;140)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low (&lt;70)
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="slot"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      interval={0}
                      angle={-10}
                      textAnchor="end"
                    />
                    <YAxis domain={[40, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        fontSize: "12px",
                      }}
                      formatter={(val) => [`${val} mg/dl`, "Glucose Level"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Readings List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Recorded Readings</h3>
              <p className="text-xs text-slate-500">
                All measurements recorded for {report.date}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Time Slot</th>
                    <th className="py-3.5 px-6">Glucose Reading</th>
                    <th className="py-3.5 px-6">Target Evaluation</th>
                    <th className="py-3.5 px-6">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {report.readings.map((reading) => (
                    <tr key={reading.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 text-slate-800 font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>{reading.timeSlot}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-base text-slate-900">
                          {reading.value}
                        </span>{" "}
                        <span className="text-xs text-slate-500 font-medium">mg/dl</span>
                      </td>
                      <td className="py-4 px-6">
                        {reading.value < 70 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Low (&lt; 70)
                          </span>
                        )}
                        {reading.value >= 70 && reading.value <= 140 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Normal (70-140)
                          </span>
                        )}
                        {reading.value > 140 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Elevated (&gt; 140)
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(reading.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

