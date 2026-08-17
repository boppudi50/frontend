import React from "react";
import clsx from "clsx";

export function Badge({ children, variant = "default", size = "sm", className }) {
  const baseStyles = "inline-flex items-center font-semibold rounded-md border tracking-wide uppercase";

  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-[#E5FAFE] text-slate-900 border-[#92EEFF]",
    critical: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  };

  // Status mapping
  const statusStr = String(children || "").toUpperCase();
  let mappedVariant = variant;

  if (["CRITICAL", "OUT_OF_STOCK", "DAMAGED", "FAILED", "EXCEPTION"].includes(statusStr)) {
    mappedVariant = "critical";
  } else if (["HIGH", "LOW_STOCK", "PENDING", "WARNING", "BOTTLENECK_ALERT", "PARTIALLY_ALLOCATED"].includes(statusStr)) {
    mappedVariant = "warning";
  } else if (["SUCCESS", "DISPATCHED", "COMPLETED", "PASSED", "HEALTHY", "FULLY_ALLOCATED", "RESOLVED"].includes(statusStr)) {
    mappedVariant = "success";
  } else if (["MEDIUM", "PRIORITIZED", "ALLOCATED", "PICKING", "PACKING", "QUALITY_CHECK", "READY_TO_DISPATCH"].includes(statusStr)) {
    mappedVariant = "info";
  }

  return (
    <span className={clsx(baseStyles, sizeStyles[size], variantStyles[mappedVariant], className)}>
      {children}
    </span>
  );
}
