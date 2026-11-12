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
  BarChart2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
    date: r.date.slice(5),
    slot: r.timeSlot,
    value: r.value,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101310] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="text-[#777D78] font-bold uppercase tracking-wider text-[10px]">
            {data.date} • {data.slot}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-[#C5F53C]">{data.value}</span>
            <span className="text-xs text-white/80">mg/dl</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171917] tracking-tight flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-[#101310]" />
            <span>Month-to-Date Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium mt-0.5">
            Glycemic progress and statistics from the 1st of the month through the selected date
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#E9ECE7] shadow-xs">
            <Calendar className="w-4 h-4 text-[#101310]" />
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs sm:text-sm font-bold text-[#171917] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-2.5 bg-white text-[#777D78] hover:text-[#171917] border border-[#E9ECE7] rounded-2xl shadow-xs transition"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#E9ECE7] p-16 text-center text-[#777D78] flex flex-col items-center justify-center gap-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#101310] animate-spin" />
          <span className="text-sm font-bold">Compiling Month-to-date report...</span>
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
          <div className="bg-white border border-[#E9ECE7] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
            <div className="flex items-center gap-2.5 text-[#171917]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5F53C] ring-2 ring-[#101310]" />
              <span>
                <strong>Reporting Period:</strong> {report.startDate} &rarr; {report.endDate}
              </span>
            </div>
            <span className="font-extrabold text-[#101310] bg-[#F7F8F5] px-3.5 py-1.5 rounded-xl border border-[#E9ECE7]">
              {report.totalReadings} measurement(s) recorded
            </span>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Readings"
              value={report.totalReadings}
              subtitle="Entries in period"
              icon={CheckCircle2}
              accentColor="lime"
            />

            <StatCard
              title="Average Glucose"
              value={report.average}
              unit="mg/dl"
              subtitle="Rounded average (1 dec)"
              icon={TrendingUp}
              accentColor="blue"
            />

            <StatCard
              title="Highest Reading"
              value={report.highest}
              unit="mg/dl"
              subtitle="Month-to-date peak"
              icon={ArrowUpRight}
              accentColor="orange"
            />

            <StatCard
              title="Lowest Reading"
              value={report.lowest}
              unit="mg/dl"
              subtitle="Month-to-date trough"
              icon={ArrowDownRight}
              accentColor="red"
            />
          </div>

          {/* Month Trend Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9ECE7] shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                    Month-to-Date Glycemic Trajectory
                  </h3>
                  <p className="text-xs text-[#777D78] font-medium mt-0.5">
                    Continuous glucose curve over the current month
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#101310] text-[#C5F53C] rounded-xl">
                  mg/dl Curve
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="limeGradientMtd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C5F53C" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#C5F53C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#777D78", fontWeight: 600 }}
                      axisLine={{ stroke: "#E9ECE7" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[40, "auto"]}
                      tick={{ fontSize: 11, fill: "#777D78", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#101310"
                      strokeWidth={3}
                      fill="url(#limeGradientMtd)"
                      activeDot={{
                        r: 6,
                        fill: "#C5F53C",
                        stroke: "#101310",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Log Table */}
          <div className="bg-white rounded-3xl border border-[#E9ECE7] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#E9ECE7]">
              <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                Readings in Period
              </h3>
              <p className="text-xs text-[#777D78] font-medium mt-0.5">
                Log of all measurements from {report.startDate} to {report.endDate}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9ECE7] bg-[#F7F8F5]/60 text-[11px] font-black uppercase tracking-wider text-[#777D78]">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Time Slot</th>
                    <th className="py-4 px-6">Glucose Value</th>
                    <th className="py-4 px-6">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECE7]/60 text-sm">
                  {report.readings.map((reading) => (
                    <tr key={reading.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-[#171917] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#777D78]" />
                        <span>{reading.date}</span>
                      </td>
                      <td className="py-4 px-6 text-[#171917] font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#777D78]" />
                          {reading.timeSlot}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-black text-base text-[#171917]">
                          {reading.value}
                        </span>{" "}
                        <span className="text-xs text-[#777D78] font-bold">mg/dl</span>
                      </td>
                      <td className="py-4 px-6">
                        {reading.value < 70 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F15B52]/10 text-[#F15B52] border border-[#F15B52]/20">
                            Low (&lt; 70)
                          </span>
                        )}
                        {reading.value >= 70 && reading.value <= 140 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C5F53C]/30 text-[#101310] border border-[#C5F53C]/40">
                            Normal (70–140)
                          </span>
                        )}
                        {reading.value > 140 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF963D]/10 text-[#FF963D] border border-[#FF963D]/20">
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
