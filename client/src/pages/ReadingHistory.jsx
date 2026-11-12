import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmModal from "../components/ConfirmModal";
import EditReadingModal from "../components/EditReadingModal";
import EmptyState from "../components/EmptyState";
import {
  History,
  Filter,
  X,
  PlusCircle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";

export default function ReadingHistory() {
  const { showSuccess, showError } = useNotification();

  const [readings, setReadings] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, reading: null });
  const [editModalState, setEditModalState] = useState({ isOpen: false, reading: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReadings = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = filterDate ? `/readings?date=${filterDate}` : "/readings";
      const res = await api.get(url);
      setReadings(res.data.readings || []);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to load readings.");
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, showError]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteModalState.reading) return;
    setIsProcessing(true);
    try {
      await api.delete(`/readings/${deleteModalState.reading.id}`);
      showSuccess("Reading deleted successfully.");
      setDeleteModalState({ isOpen: false, reading: null });
      fetchReadings();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete reading.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Edit Save
  const handleEditSave = async (updatedData, setModalError) => {
    setIsProcessing(true);
    try {
      await api.put(`/readings/${updatedData.id}`, updatedData);
      showSuccess("Reading updated successfully.");
      setEditModalState({ isOpen: false, reading: null });
      fetchReadings();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update reading.";
      setModalError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Glucose Badge
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

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-sky-600" />
            <span>Reading History</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View, filter, edit, and manage all your historical blood glucose entries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/add-reading"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Reading</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Filter by Date:</span>
          </div>
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition w-full sm:w-44"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
          Showing <strong>{readings.length}</strong> reading(s)
          {filterDate ? ` for ${filterDate}` : " (all time)"}
        </div>
      </div>

      {/* Readings Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <span className="text-sm font-semibold">Loading glucose readings...</span>
          </div>
        ) : readings.length === 0 ? (
          <EmptyState
            title={filterDate ? `No readings found for ${filterDate}` : "No readings recorded yet"}
            description={
              filterDate
                ? "There are no glucose measurements logged on this specific date. Try choosing another date or adding a new reading."
                : "You have not added any glucose measurements yet. Click below to add your first reading."
            }
            actionText="Add Reading"
            actionLink="/add-reading"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Time Slot</th>
                  <th className="py-3.5 px-6">Glucose Level</th>
                  <th className="py-3.5 px-6">Status Indicator</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {readings.map((reading) => (
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
