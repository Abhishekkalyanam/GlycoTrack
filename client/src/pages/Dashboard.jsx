import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import StatCard from "../components/StatCard";
import ConfirmModal from "../components/ConfirmModal";
import EditReadingModal from "../components/EditReadingModal";
import EmptyState from "../components/EmptyState";
import {
  Activity,
  PlusCircle,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
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

export default function Dashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [dailyStats, setDailyStats] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, reading: null });
  const [editModalState, setEditModalState] = useState({ isOpen: false, reading: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Today's daily report
      const dailyRes = await api.get(`/reports/daily?date=${todayStr}`);
      setDailyStats(dailyRes.data);

      // 2. Fetch all user readings
      const readingsRes = await api.get("/readings");
      setAllReadings(readingsRes.data.readings || []);
      setRecentReadings((readingsRes.data.readings || []).slice(0, 5));
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [todayStr, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Reading Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteModalState.reading) return;
    setIsProcessing(true);
    try {
      await api.delete(`/readings/${deleteModalState.reading.id}`);
      showSuccess("Reading deleted successfully.");
      setDeleteModalState({ isOpen: false, reading: null });
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete reading.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reading Edit
  const handleEditSave = async (updatedData, setModalError) => {
    setIsProcessing(true);
    try {
      await api.put(`/readings/${updatedData.id}`, updatedData);
      showSuccess("Reading updated successfully.");
      setEditModalState({ isOpen: false, reading: null });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update reading.";
      setModalError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for Glucose Status Badge
  const getGlucoseBadge = (val) => {
    if (val < 70) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Low (&lt; 70)
        </span>
      );
    }
    if (val > 140) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Elevated (&gt; 140)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Normal (70-140)
      </span>
    );
  };

  // Prepare chart data (reverse recent for chronological order)
  const chartData = [...recentReadings].reverse().map((r) => ({
    name: `${r.date.slice(5)} ${r.timeSlot.split(" ")[0]}`,
    value: r.value,
    slot: r.timeSlot,
    date: r.date,
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sky-200 text-xs uppercase tracking-widest font-semibold block mb-1">
            Personal Health Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || "Patient"}
          </h2>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Track your daily glucose levels, identify patterns, and maintain healthy glycemic control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs transition"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/add-reading"
            className="inline-flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 font-bold px-5 py-3 rounded-xl shadow-sm transition text-sm whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5 text-sky-600" />
            <span>Add Reading</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Today's Readings"
          value={dailyStats?.totalReadings !== undefined ? `${dailyStats.totalReadings} / 4` : "0 / 4"}
          subtitle="Max 4 readings allowed per day"
          icon={CheckCircle2}
          color="sky"
        />

        <StatCard
          title="Today's Average"
          value={dailyStats?.average !== null && dailyStats?.average !== undefined ? dailyStats.average : "—"}
          unit="mg/dl"
          subtitle={dailyStats?.totalReadings ? `Based on ${dailyStats.totalReadings} reading(s)` : "No entries today"}
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="Highest Reading Today"
          value={dailyStats?.highest !== null && dailyStats?.highest !== undefined ? dailyStats.highest : "—"}
          unit="mg/dl"
          subtitle="Daily maximum level"
          icon={ArrowUpRight}
          color="rose"
        />

        <StatCard
          title="Lowest Reading Today"
          value={dailyStats?.lowest !== null && dailyStats?.lowest !== undefined ? dailyStats.lowest : "—"}
          unit="mg/dl"
          subtitle="Daily minimum level"
          icon={ArrowDownRight}
          color="emerald"
        />
      </div>

      {/* Quick Visual Trend (Recharts) */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Glucose Trend</h3>
              <p className="text-xs text-slate-500">Visual trend of your recent readings</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg border border-sky-100">
              mg/dl vs Entry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[40, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val} mg/dl`, "Glucose"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Readings Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Readings</h3>
            <p className="text-xs text-slate-500">Latest blood glucose entries logged in your profile</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
          >
            View All History &rarr;
          </Link>
        </div>

        {recentReadings.length === 0 ? (
          <EmptyState
            title="No readings recorded yet"
            description="Start logging your blood glucose values to build your historical tracking profile."
            actionText="Add First Reading"
            actionLink="/add-reading"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Time Slot</th>
                  <th className="py-3.5 px-6">Glucose Value</th>
                  <th className="py-3.5 px-6">Status Indicator</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-2">
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
                    <td className="py-4 px-6">{getGlucoseBadge(reading.value)}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditModalState({ isOpen: true, reading })}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                        title="Edit Reading"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModalState({ isOpen: true, reading })}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        readingDetails={deleteModalState.reading}
        isDeleting={isProcessing}
        onClose={() => setDeleteModalState({ isOpen: false, reading: null })}
        onConfirm={handleDeleteConfirm}
      />

      {/* Edit Reading Modal */}
      <EditReadingModal
        isOpen={editModalState.isOpen}
        reading={editModalState.reading}
        isSaving={isProcessing}
        onClose={() => setEditModalState({ isOpen: false, reading: null })}
        onSave={handleEditSave}
      />
    </div>
  );
}
