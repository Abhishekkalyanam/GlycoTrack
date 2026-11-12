import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import { getGlucoseIndicator } from "../utils/thresholds";
import {
  CalendarDays,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PreviousMonthReport() {
  const { showError } = useNotification();
  const todayStr = new Date().toISOString().split("T")[0];

  const [refDate, setRefDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/reports/monthly?date=${refDate}`);
      setReport(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load previous month report.");
    } finally {
      setIsLoading(false);
    }
  }, [refDate, showError]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const monthLabel = report?.month ? `${MONTH_NAMES[report.month - 1]} ${report.year}` : "Previous Month";

  // Group readings by date for summary bar chart
  const dateMap = {};
  (report?.readings || []).forEach((r) => {
    if (!dateMap[r.date]) {
      dateMap[r.date] = { date: r.date.slice(8), sum: 0, count: 0 };
    }
    dateMap[r.date].sum += r.value;
    dateMap[r.date].count += 1;
  });

  const chartData = Object.values(dateMap).map((d) => ({
    day: `Day ${d.date}`,
    avg: Number((d.sum / d.count).toFixed(1)),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101310] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="text-[#777D78] font-bold uppercase tracking-wider text-[10px]">
            {data.day}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-black text-[#C5F53C]">{data.avg}</span>
            <span className="text-xs text-white/80">mg/dl (mean)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171917] tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-[#101310]" />
            <span>Previous Month Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium mt-0.5">
            Comprehensive retrospective for the complete previous calendar month
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#E9ECE7] shadow-xs">
            <span className="text-xs text-[#777D78] font-bold">Relative to:</span>
            <input
              type="date"
              max={todayStr}
              value={refDate}
              onChange={(e) => setRefDate(e.target.value)}
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
          <span className="text-sm font-bold">Compiling monthly retrospective...</span>
        </div>
      ) : report?.totalReadings === 0 ? (
        <EmptyState
          title={`No readings recorded for ${monthLabel}`}
          description={`There are no historical readings logged during ${monthLabel} (${report?.startDate} to ${report?.endDate}).`}
          actionText="Add a Reading"
          actionLink="/add-reading"
        />
      ) : (
        <>
          {/* Calendar Month Header Banner */}
          <div className="bg-[#101310] text-white rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-white/10">
            <div>
              <span className="text-xs font-bold text-[#C5F53C] uppercase tracking-wider block">
                Completed Calendar Month
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">{monthLabel}</h2>
              <p className="text-xs text-[#777D78] mt-1 font-medium">
                Full calendar range: {report.startDate} to {report.endDate}
              </p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-[#C5F53C] self-start sm:self-auto">
              Total {report.totalReadings} measurement(s) recorded
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Readings"
              value={report.totalReadings}
              subtitle={`Logged in ${monthLabel}`}
              icon={CheckCircle2}
              accentColor="lime"
            />

            <StatCard
              title="Monthly Average"
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
              subtitle="Monthly peak glucose"
              icon={ArrowUpRight}
              accentColor="orange"
            />

            <StatCard
              title="Lowest Reading"
              value={report.lowest}
              unit="mg/dl"
              subtitle="Monthly trough glucose"
              icon={ArrowDownRight}
              accentColor="red"
            />
          </div>

          {/* Daily Average Histogram */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9ECE7] shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                    Daily Mean Distribution ({monthLabel})
                  </h3>
                  <p className="text-xs text-[#777D78] font-medium mt-0.5">
                    Average glucose levels per calendar day
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#F7F8F5] border border-[#E9ECE7] text-[#171917] rounded-xl">
                  Mean Glucose
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" vertical={false} />
                    <XAxis
                      dataKey="day"
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
                    <Bar dataKey="avg" fill="#101310" radius={[8, 8, 0, 0]} barSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Historical Readings Table */}
          <div className="bg-white rounded-3xl border border-[#E9ECE7] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#E9ECE7]">
              <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
                Historical Readings
              </h3>
              <p className="text-xs text-[#777D78] font-medium mt-0.5">
                Complete log of measurements in {monthLabel}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E9ECE7] bg-[#F7F8F5]/60 text-[11px] font-black uppercase tracking-wider text-[#777D78]">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Time Slot</th>
                    <th className="py-4 px-6">Glucose Value</th>
                    <th className="py-4 px-6">Reference Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9ECE7]/60 text-sm">
                  {report.readings.map((reading) => {
                    const indicator = getGlucoseIndicator(reading.value);
                    return (
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
                          {indicator && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${indicator.badgeClass}`}
                              title={indicator.description}
                            >
                              {indicator.label}
                            </span>
                          )}
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
