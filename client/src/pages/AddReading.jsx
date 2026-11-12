import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { Plus, Calendar, Clock, Activity, AlertCircle, ArrowLeft } from "lucide-react";

const TIME_SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner",
];

export default function AddReading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useNotification();

  const todayStr = new Date().toISOString().split("T")[0];
  const preselectedSlot = searchParams.get("slot");

  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState(
    preselectedSlot && TIME_SLOTS.includes(preselectedSlot)
      ? preselectedSlot
      : TIME_SLOTS[0]
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedSlot && TIME_SLOTS.includes(preselectedSlot)) {
      setTimeSlot(preselectedSlot);
    }
  }, [preselectedSlot]);

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
      navigate("/");
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Failed to add glucose reading.";
      setError(serverMessage);
      showError(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#777D78] hover:text-[#171917] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E9ECE7] shadow-xs p-7 sm:p-9">
        <div className="flex items-center gap-3.5 mb-7">
          <div className="w-12 h-12 bg-[#101310] text-[#C5F53C] rounded-2xl flex items-center justify-center shadow-md">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#171917] tracking-tight">
              Add Glucose Reading
            </h1>
            <p className="text-xs sm:text-sm text-[#777D78] font-medium">
              Log a new blood sugar measurement into your daily diary
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#F15B52]/10 border border-[#F15B52]/20 text-[#F15B52] rounded-2xl text-xs sm:text-sm font-bold flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-2">
              Measurement Date
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                max={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold text-sm focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition"
                required
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#777D78] font-medium">Future dates are disabled.</p>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-2">
              Time Slot
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={timeSlot}
                onChange={(e) => {
                  setTimeSlot(e.target.value);
                  setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold text-sm focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition cursor-pointer"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1.5 text-[11px] text-[#777D78] font-medium">
              Only one reading per time slot per day is permitted.
            </p>
          </div>

          {/* Glucose Value Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-2">
              Glucose Value (mg/dl)
            </label>
            <div className="relative">
              <Activity className="w-5 h-5 text-[#777D78] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                className="w-full pl-11 pr-4 py-3.5 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-black text-xl focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition placeholder:font-normal placeholder:text-sm placeholder:text-[#777D78]"
                required
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#777D78] font-medium">
              <span>Allowed range: 40 to 600 mg/dl</span>
              <span className="font-bold text-[#101310]">Whole numbers only</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-5 border-t border-[#E9ECE7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-3 text-sm font-bold text-[#777D78] hover:text-[#171917] hover:bg-[#F7F8F5] rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-[#C5F53C] hover:bg-[#b8eb2f] disabled:opacity-60 text-[#101310] font-black text-sm px-7 py-3 rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>{isSubmitting ? "Saving Reading..." : "Save Reading"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
