import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import {
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MonthToDateReport() {
  const { showError } = useNotification();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reports/month-to-date?date=${selectedDate}`);
      setReport(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load Month-to-date report.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, showError]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const chartData = (report?.readings || []).map((r) => ({
    date: r.date.slice(5), // MM-DD
    slot: r.timeSlot,
    value: r.value,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-sky-600" />
            <span>Month-to-date Report</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Progress and glucose statistics from the 1st of the month through the selected date
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
          <span className="text-sm font-semibold">Generating Month-to-date report...</span>
        </div>
      ) : report?.totalReadings === 0 ? (
        <EmptyState
          title={`No readings found between ${report?.startDate} and ${report?.endDate}`}
          description="There are no glucose measurements logged within this month-to-date period."
          actionText="Add Reading"
          actionLink="/add-reading"
        />
      ) : (
        <>
          {/* Period Banner */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm text-sky-900">
            <span>
              <strong>Reporting Period:</strong> {report.startDate} &rarr; {report.endDate}
            </span>
            <span className="font-semibold text-sky-700">
              Total {report.totalReadings} measurement(s)
            </span>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Readings"
              value={report.totalReadings}
              subtitle="Entries in period"
              icon={CheckCircle2}
              color="sky"
            />

            <StatCard
              title="Average Glucose"
              value={report.average}
              unit="mg/dl"
              subtitle="Rounded average (1 dec)"
              icon={TrendingUp}
              color="indigo"
            />

            <StatCard
              title="Highest Reading"
              value={report.highest}
              unit="mg/dl"
              subtitle="Month-to-date peak"
              icon={ArrowUpRight}
              color="rose"
            />

            <StatCard
              title="Lowest Reading"
              value={report.lowest}
              unit="mg/dl"
              subtitle="Month-to-date trough"
              icon={ArrowDownRight}
              color="emerald"
            />
          </div>

          {/* Month Trend Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Month-to-Date Glucose Curve
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
                  Trendline (mg/dl)
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis domain={[40, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        fontSize: "12px",
                      }}
                      formatter={(val, name, item) => [
                        `${val} mg/dl (${item.payload.slot})`,
                        "Glucose",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0284c7", strokeWidth: 1.5, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Log Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Readings in Period</h3>
              <p className="text-xs text-slate-500">
                Log of all entries from {report.startDate} to {report.endDate}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Time Slot</th>
                    <th className="py-3.5 px-6">Glucose Value</th>
                    <th className="py-3.5 px-6">Status Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {report.readings.map((reading) => (
                    <tr key={reading.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{reading.date}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          {reading.timeSlot}
                        </span>
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

