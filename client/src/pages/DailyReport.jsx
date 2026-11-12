import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import { getGlucoseIndicator, GLUCOSE_THRESHOLDS } from "../utils/thresholds";
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
    if (val < GLUCOSE_THRESHOLDS.low) return "#F15B52"; // red
    if (val > GLUCOSE_THRESHOLDS.elevated) return "#FF963D"; // orange
    return "#C5F53C"; // neon lime
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101310] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="text-[#777D78] font-bold uppercase tracking-wider text-[10px]">
            {data.slot}
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
            <FileText className="w-6 h-6 text-[#101310]" />
            <span>Daily Glucose Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium mt-0.5">
            Comprehensive breakdown of glycemic levels for a single calendar day
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
          <span className="text-sm font-bold">Compiling daily metrics...</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Readings"
              value={`${report.totalReadings} / 4`}
              subtitle={`Recorded on ${report.date}`}
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
              subtitle="Daily peak value"
              icon={ArrowUpRight}
              accentColor="orange"
            />

            <StatCard
              title="Lowest Reading"
              value={report.lowest}
              unit="mg/dl"
              subtitle="Daily trough value"
              icon={ArrowDownRight}
              accentColor="red"
            />
          </div>

          {/* Slot Breakdown Bar Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9ECE7] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#101310]" />
                  <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                    Time Slot Comparison ({report.date})
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#777D78] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5F53C] border border-[#101310]" /> Standard ({GLUCOSE_THRESHOLDS.low}–{GLUCOSE_THRESHOLDS.elevated})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF963D]" /> Elevated (&gt;{GLUCOSE_THRESHOLDS.elevated})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F15B52]" /> Low (&lt;{GLUCOSE_THRESHOLDS.low})
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" vertical={false} />
                    <XAxis
                      dataKey="slot"
                      tick={{ fontSize: 11, fill: "#777D78", fontWeight: 600 }}
                      interval={0}
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
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={44}>
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
          <div className="bg-white rounded-3xl border border-[#E9ECE7] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#E9ECE7]">
              <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                Recorded Readings
              </h3>
              <p className="text-xs text-[#777D78] font-medium mt-0.5">
                Measurements logged on {report.date}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9ECE7] bg-[#F7F8F5]/60 text-[11px] font-black uppercase tracking-wider text-[#777D78]">
                    <th className="py-4 px-6">Time Slot</th>
                    <th className="py-4 px-6">Glucose Reading</th>
                    <th className="py-4 px-6">Reference Indicator</th>
                    <th className="py-4 px-6">Logged At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECE7]/60 text-sm">
                  {report.readings.map((reading) => {
                    const indicator = getGlucoseIndicator(reading.value);
                    return (
                      <tr key={reading.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                        <td className="py-4 px-6 text-[#171917] font-bold flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#777D78]" />
                          <span>{reading.timeSlot}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-black text-base text-[#171917]">
                            {reading.value}
                          </span>{" "}
                          <span className="text-xs text-[#777D78] font-bold">mg/dl</span>
                        </td>
                        <td className="py-4 px-6">
                          {indicator && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${indicator.badgeClass}`}
                              title={indicator.description}
                            >
                              {indicator.label}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#777D78] font-medium">
                          {new Date(reading.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
