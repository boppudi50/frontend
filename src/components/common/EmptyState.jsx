import React from "react";
import { Inbox } from "lucide-react";
import clsx from "clsx";

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "There is currently no data to display for the active filters or scope.",
  actionLabel,
  onAction,
  className
}) {
  return (
    <div
      className={clsx(
        "bg-white border border-[#E2E8F0] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-subtle",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mt-1 mb-4 leading-relaxed font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-secondary text-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
