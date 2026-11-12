import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Reading",
  message = "Are you sure you want to delete this glucose reading? This action cannot be undone.",
  readingDetails = null,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-[#E9ECE7] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-2xl bg-[#F15B52]/10 text-[#F15B52] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-[#777D78] hover:text-[#171917] p-1 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-black text-[#171917] mb-2">{title}</h3>
        <p className="text-sm text-[#777D78] mb-5 leading-relaxed font-medium">{message}</p>

        {readingDetails && (
          <div className="bg-[#F7F8F5] border border-[#E9ECE7] rounded-2xl p-4 mb-6 text-sm text-[#171917] space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span className="text-[#777D78]">Date:</span>
              <span className="font-bold">{readingDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777D78]">Time Slot:</span>
              <span className="font-bold">{readingDetails.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777D78]">Glucose Level:</span>
              <span className="font-black text-[#101310]">{readingDetails.value} mg/dl</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold text-[#777D78] hover:text-[#171917] hover:bg-[#F7F8F5] rounded-2xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#F15B52] hover:bg-[#df4a41] disabled:opacity-60 rounded-2xl shadow-sm transition active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Reading"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
