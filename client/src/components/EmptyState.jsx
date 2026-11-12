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
    <div className="bg-white rounded-3xl border border-dashed border-[#E9ECE7] p-12 text-center my-6">
      <div className="w-14 h-14 bg-[#101310] text-[#C5F53C] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-extrabold text-[#171917] mb-1">{title}</h3>
      <p className="text-sm text-[#777D78] max-w-sm mx-auto mb-6 font-medium">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 bg-[#C5F53C] hover:bg-[#b8eb2f] text-[#101310] text-sm font-bold px-6 py-3 rounded-2xl shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
}
