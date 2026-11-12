import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";

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

    onSave(
      {
        id: reading.id,
        date: formData.date,
        timeSlot: formData.timeSlot,
        value: num,
      },
      setError
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-[#E9ECE7] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-[#171917]">Edit Reading</h3>
            <p className="text-xs text-[#777D78] font-medium mt-0.5">
              Update measurements for this time slot
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-[#777D78] hover:text-[#171917] p-1.5 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#F15B52]/10 border border-[#F15B52]/20 text-[#F15B52] rounded-2xl text-xs font-bold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-1.5">
              Measurement Date
            </label>
            <input
              type="date"
              max={todayStr}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-1.5">
              Time Slot
            </label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-semibold focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition text-sm cursor-pointer"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#777D78] mb-1.5">
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
              className="w-full px-4 py-2.5 bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl text-[#171917] font-black text-lg focus:outline-none focus:border-[#C5F53C] focus:ring-2 focus:ring-[#C5F53C]/20 transition text-sm"
              required
            />
            <p className="mt-1 text-[11px] text-[#777D78] font-medium">
              Must be a whole number between 40 and 600 mg/dl.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E9ECE7]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-[#777D78] hover:text-[#171917] hover:bg-[#F7F8F5] rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-[#101310] bg-[#C5F53C] hover:bg-[#b8eb2f] disabled:opacity-60 rounded-2xl shadow-sm transition active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
