import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { GLUCOSE_THRESHOLDS } from "../utils/thresholds";

export default function GlucoseChart({ readings = [] }) {
  // Format readings in chronological order
  const chartData = [...readings].reverse().map((r) => ({
    name: `${r.date.slice(5)}`,
    slot: r.timeSlot,
    value: r.value,
    fullDate: r.date,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#101310] text-white p-3.5 rounded-2xl shadow-xl border border-white/10 text-xs">
          <p className="text-[#777D78] font-bold uppercase tracking-wider text-[10px]">
            {data.fullDate} • {data.slot}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-black text-[#C5F53C]">{data.value}</span>
            <span className="text-xs font-semibold text-white/80">mg/dl</span>
          </div>
          <p className="text-[11px] text-white/60 mt-1">
            {data.value < GLUCOSE_THRESHOLDS.low
              ? `Below ${GLUCOSE_THRESHOLDS.low} mg/dl reference`
              : data.value > GLUCOSE_THRESHOLDS.elevated
              ? `Above ${GLUCOSE_THRESHOLDS.elevated} mg/dl reference`
              : `${GLUCOSE_THRESHOLDS.low}–${GLUCOSE_THRESHOLDS.elevated} mg/dl reference range`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E9ECE7] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#101310]" />
            <h3 className="text-base sm:text-lg font-extrabold text-[#171917]">
              Glucose Activity
            </h3>
          </div>
          <p className="text-xs text-[#777D78] font-medium mt-0.5">
            Chronological readings recorded in your profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F7F8F5] border border-[#E9ECE7] text-[#171917]"
            title="Informational reference: 70 to 140 mg/dl"
          >
            <span className="w-2 h-2 rounded-full bg-[#C5F53C] ring-2 ring-[#101310]" />
            Recorded Values (mg/dl)
          </span>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center text-[#777D78] border border-dashed border-[#E9ECE7] rounded-2xl p-6">
          <Activity className="w-8 h-8 text-[#777D78] mb-2" />
          <p className="text-xs font-bold text-[#171917]">No glucose activity logged yet</p>
          <p className="text-[11px] text-[#777D78] mt-0.5 max-w-xs font-medium">
            Your readings will plot here automatically as you log measurements.
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5F53C" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#C5F53C" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2ED" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#777D78", fontWeight: 600 }}
                axisLine={{ stroke: "#E9ECE7" }}
                tickLine={false}
              />

              <YAxis
                domain={[40, "auto"]}
                tick={{ fontSize: 11, fill: "#777D78", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#101310"
                strokeWidth={3}
                fill="url(#limeGradient)"
                activeDot={{
                  r: 6,
                  fill: "#C5F53C",
                  stroke: "#101310",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
