import React from "react";

export default function StatCard({ title, value, unit, icon: Icon, color = "sky", subtitle }) {
  const colorStyles = {
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
  }[color] || {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value !== null && value !== undefined ? value : "—"}
        </span>
        {unit && value !== null && value !== undefined && (
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

