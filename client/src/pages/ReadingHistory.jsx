import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import ConfirmModal from "../components/ConfirmModal";
import EditReadingModal from "../components/EditReadingModal";
import EmptyState from "../components/EmptyState";
import {
  Clock,
  Filter,
  X,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  RefreshCw,
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

  const getStatusBadge = (val) => {
    if (val < 70) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F15B52]/10 text-[#F15B52] border border-[#F15B52]/20">
          Low (&lt;70)
        </span>
      );
    }
    if (val > 140) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF963D]/10 text-[#FF963D] border border-[#FF963D]/20">
          Elevated (&gt;140)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C5F53C]/30 text-[#101310] border border-[#C5F53C]/40">
        Normal (70–140)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#171917] tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-[#101310]" />
            <span>Reading History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#777D78] font-medium mt-0.5">
            Comprehensive log of all blood glucose measurements with date filtering
          </p>
        </div>

        <Link
          to="/add-reading"
          className="inline-flex items-center gap-2 bg-[#C5F53C] hover:bg-[#b8eb2f] text-[#101310] font-bold text-sm px-5 py-2.5 rounded-2xl shadow-sm transition self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Reading</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-[#E9ECE7] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-[#171917] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#101310]" />
            <span>Filter Date:</span>
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3.5 py-2 bg-[#F7F8F5] border border-[#E9ECE7] rounded-xl text-[#171917] font-semibold text-xs sm:text-sm focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition cursor-pointer"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#777D78] hover:text-[#171917] bg-[#F7F8F5] hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="text-xs text-[#777D78] font-medium self-end sm:self-center">
          Showing <strong className="text-[#171917] font-black">{readings.length}</strong> entry(ies)
          {filterDate ? ` on ${filterDate}` : " (all time)"}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-[#E9ECE7] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-[#777D78] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#101310] animate-spin" />
            <span className="text-sm font-bold">Loading measurement history...</span>
          </div>
        ) : readings.length === 0 ? (
          <EmptyState
            title={filterDate ? `No measurements on ${filterDate}` : "No readings recorded yet"}
            description={
              filterDate
                ? "No entries match this date. Choose another date or add a new reading."
                : "Your personal log is empty. Click below to add your first reading."
            }
            actionText="Add Reading"
            actionLink="/add-reading"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E9ECE7] bg-[#F7F8F5]/60 text-[11px] font-black uppercase tracking-wider text-[#777D78]">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Time Slot</th>
                  <th className="py-4 px-6">Glucose Level</th>
                  <th className="py-4 px-6">Status Indicator</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECE7]/60 text-sm">
                {readings.map((reading) => (
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
                    <td className="py-4 px-6">{getStatusBadge(reading.value)}</td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => setEditModalState({ isOpen: true, reading })}
                        className="p-1.5 text-[#777D78] hover:text-[#171917] hover:bg-[#F7F8F5] rounded-xl transition"
                        title="Edit Reading"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModalState({ isOpen: true, reading })}
                        className="p-1.5 text-[#777D78] hover:text-[#F15B52] hover:bg-[#F15B52]/10 rounded-xl transition"
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
