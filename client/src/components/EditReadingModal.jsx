import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

const TIME_SLOTS = [
  "Morning (fasting)",
  "After breakfast",
  "After lunch",
  "After dinner",
];

export default function EditReadingModal({
  isOpen,
  onClose,
  onSave,
  reading,
  isSaving = false,
}) {
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: TIME_SLOTS[0],
    value: "",
  });
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (reading) {
      setFormData({
        date: reading.date || todayStr,
        timeSlot: reading.timeSlot || TIME_SLOTS[0],
        value: reading.value !== undefined ? String(reading.value) : "",
      });
      setError("");
    }
  }, [reading, todayStr]);

  if (!isOpen || !reading) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation matching rules
    if (!formData.value || String(formData.value).trim() === "") {
      setError("Please enter a glucose value.");
      return;
    }

    const num = Number(formData.value);
    if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    if (!formData.date) {
      setError("Date is required.");
      return;
    }

    if (formData.date > todayStr) {
      setError("Date cannot be in the future.");
      return;
    }

    onSave({
      id: reading.id,
      date: formData.date,
      timeSlot: formData.timeSlot,
      value: num,
    }, setError);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">Edit Reading</h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reading Date
            </label>
            <input
              type="date"
              max={todayStr}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Time Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-sm"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Glucose Value (mg/dl)
            </label>
            <input
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="e.g. 110"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition text-sm font-semibold"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Must be a whole number between 40 and 600 mg/dl.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-xl shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
