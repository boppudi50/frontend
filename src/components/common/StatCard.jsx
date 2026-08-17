import React from "react";
import clsx from "clsx";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accent = false,
  alert = false,
  className
}) {
  return (
    <div
      className={clsx(
        "bg-white border rounded-xl p-5 shadow-soft transition-all duration-150 relative overflow-hidden",
        accent ? "border-[#92EEFF] bg-gradient-to-br from-white to-[#F0FDFF]" : "border-slate-200",
        alert && "border-red-200 bg-red-50/20",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div
            className={clsx(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              accent ? "bg-[#92EEFF]/30 text-slate-900" : alert ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <span
            className={clsx(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              trendPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}

      {accent && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#92EEFF]/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
      )}
    </div>
  );
}
