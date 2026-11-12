import React from "react";
import { Inbox, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  title = "No readings found",
  description = "No glucose readings recorded for this period yet.",
  actionText = "Add Reading",
  actionLink = "/add-reading",
  icon: Icon = Inbox,
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center my-6">
      <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
}
