import React from "react";

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  accentColor = "lime",
  subtitle,
}) {
  const accentStyles = {
    lime: {
      bg: "bg-[#C5F53C]/20",
      text: "text-[#101310]",
      border: "border-[#C5F53C]/30",
      pill: "bg-[#C5F53C]/15 text-[#101310]",
    },
    blue: {
      bg: "bg-[#3789F5]/10",
      text: "text-[#3789F5]",
      border: "border-[#3789F5]/20",
      pill: "bg-[#3789F5]/10 text-[#3789F5]",
    },
    orange: {
      bg: "bg-[#FF963D]/10",
      text: "text-[#FF963D]",
      border: "border-[#FF963D]/20",
      pill: "bg-[#FF963D]/10 text-[#FF963D]",
    },
    red: {
      bg: "bg-[#F15B52]/10",
      text: "text-[#F15B52]",
      border: "border-[#F15B52]/20",
      pill: "bg-[#F15B52]/10 text-[#F15B52]",
    },
  }[accentColor] || {
    bg: "bg-[#C5F53C]/20",
    text: "text-[#101310]",
    border: "border-[#C5F53C]/30",
    pill: "bg-[#C5F53C]/15 text-[#101310]",
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E9ECE7] shadow-xs hover:border-[#C5F53C]/50 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#777D78]">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${accentStyles.bg} ${accentStyles.text}`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#171917]">
          {value !== null && value !== undefined ? value : "—"}
        </span>
        {unit && value !== null && value !== undefined && (
          <span className="text-xs font-bold text-[#777D78] uppercase">{unit}</span>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-3 border-t border-[#E9ECE7]/60 flex items-center justify-between">
          <p className="text-xs text-[#777D78] font-medium">{subtitle}</p>
        </div>
      )}
    </div>
  );
}
