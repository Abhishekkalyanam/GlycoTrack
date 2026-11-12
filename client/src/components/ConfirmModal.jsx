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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>

        {readingDetails && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-6 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold">{readingDetails.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Slot:</span>
              <span className="font-semibold">{readingDetails.timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Glucose Value:</span>
              <span className="font-semibold text-sky-700">{readingDetails.value} mg/dl</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Reading"}
          </button>
        </div>
      </div>
    </div>
  );
}

