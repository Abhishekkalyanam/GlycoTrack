import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

import GlucoseOverviewCard from "../components/GlucoseOverviewCard";
import StatCard from "../components/StatCard";
import GlucoseChart from "../components/GlucoseChart";
import RecentReadings from "../components/RecentReadings";
import DailyReadingsPanel from "../components/DailyReadingsPanel";
import ConfirmModal from "../components/ConfirmModal";
import EditReadingModal from "../components/EditReadingModal";

import {
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const { showSuccess, showError } = useNotification();

  const [dailyStats, setDailyStats] = useState(null);
  const [allReadings, setAllReadings] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [todayReadings, setTodayReadings] = useState([]);
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
      setTodayReadings(dailyRes.data.readings || []);

      // 2. Fetch all user readings
      const readingsRes = await api.get("/readings");
      const list = readingsRes.data.readings || [];
      setAllReadings(list);
      setRecentReadings(list.slice(0, 5));
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

  return (
    <div className="space-y-6">
      {/* 3-Column / 2-Area Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CENTER COLUMN: Overview, Stats, Chart, Recent Activity (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Prominent Black Glucose Overview Card */}
          <GlucoseOverviewCard
            dailyStats={dailyStats}
            readings={todayReadings}
          />

          {/* Section: 4 Daily Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Today's Readings"
              value={dailyStats?.totalReadings !== undefined ? `${dailyStats.totalReadings} / 4` : "0 / 4"}
              subtitle="Max 4 readings daily"
              icon={CheckCircle2}
              accentColor="lime"
            />

            <StatCard
              title="Average Glucose"
              value={dailyStats?.average !== null && dailyStats?.average !== undefined ? dailyStats.average : "—"}
              unit="mg/dl"
              subtitle={dailyStats?.totalReadings ? `${dailyStats.totalReadings} slots counted` : "No entries today"}
              icon={TrendingUp}
              accentColor="blue"
            />

            <StatCard
              title="Highest Reading"
              value={dailyStats?.highest !== null && dailyStats?.highest !== undefined ? dailyStats.highest : "—"}
              unit="mg/dl"
              subtitle="Daily peak value"
              icon={ArrowUpRight}
              accentColor="orange"
            />

            <StatCard
              title="Lowest Reading"
              value={dailyStats?.lowest !== null && dailyStats?.lowest !== undefined ? dailyStats.lowest : "—"}
              unit="mg/dl"
              subtitle="Daily trough value"
              icon={ArrowDownRight}
              accentColor="red"
            />
          </div>

          {/* Section: Glucose Activity Line Chart */}
          <GlucoseChart readings={allReadings.slice(0, 14)} />

          {/* Section: Recent Activity List */}
          <RecentReadings
            readings={recentReadings}
            onEdit={(reading) => setEditModalState({ isOpen: true, reading })}
            onDelete={(reading) => setDeleteModalState({ isOpen: true, reading })}
          />
        </div>

        {/* RIGHT COLUMN: "My Daily Readings" Panel (Span 4) */}
        <div className="lg:col-span-4 sticky top-6">
          <DailyReadingsPanel
            todayReadings={todayReadings}
            selectedDate={todayStr}
            onEditReading={(reading) => setEditModalState({ isOpen: true, reading })}
          />
        </div>
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
