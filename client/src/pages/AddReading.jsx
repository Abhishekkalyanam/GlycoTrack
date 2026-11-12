import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { PlusCircle, Calendar, Clock, Activity, AlertCircle, ArrowLeft } from "lucide-react";

const TIME_SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner",
];

export default function AddReading() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Glucose value is required
    if (value === undefined || value === null || String(value).trim() === "") {
      setError("Please enter a glucose value.");
      return;
    }

    // 2. Value must be a whole number between 40 and 600
    const num = Number(value);
    if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    // Date check
    if (!date) {
      setError("Date is required.");
      return;
    }

    // 5. Future dates are not allowed
    if (date > todayStr) {
      setError("Date cannot be in the future.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/readings", {
        date,
        timeSlot,
        value: num,
      });

      showSuccess(`Added ${timeSlot} reading (${num} mg/dl) successfully!`);
      navigate("/history");
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Failed to add glucose reading.";
      setError(serverMessage);
      showError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Add Glucose Reading
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Record a new blood sugar measurement into your personal diary
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Measurement Date
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="date"
                max={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                required
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Future dates are disabled.</p>
          </div>

          {/* Time Slot Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Time Slot
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={timeSlot}
                onChange={(e) => {
                  setTimeSlot(e.target.value);
                  setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition appearance-none cursor-pointer"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Only one reading per time slot per day is allowed.
            </p>
          </div>

          {/* Glucose Value Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Glucose Value (mg/dl)
            </label>
            <div className="relative">
              <Activity className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="number"
                min="40"
                max="600"
                step="1"
                placeholder="e.g. 105"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-base font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition placeholder:font-normal placeholder:text-slate-400"
                required
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Valid range: 40 to 600 mg/dl</span>
              <span className="font-semibold text-sky-700">Whole numbers only</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/history")}
              className="px-5 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-md shadow-sky-500/20 transition cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{isSubmitting ? "Saving Reading..." : "Save Reading"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Guideline Box */}
      <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-sky-900 text-sm">Logging Guidelines</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          <li><strong>Morning (fasting):</strong> Measure immediately after waking, before breakfast.</li>
          <li><strong>After meals:</strong> Typically 1 to 2 hours after breakfast, lunch, or dinner.</li>
          <li>Each day supports up to 4 readings (one per each designated slot).</li>
        </ul>
      </div>
    </div>
  );
}

