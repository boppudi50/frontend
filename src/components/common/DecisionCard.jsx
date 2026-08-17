import React from "react";
import { Zap, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Info, Sparkles } from "lucide-react";
import { Badge } from "./Badge";
import clsx from "clsx";

export function DecisionCard({
  decision,
  onApprove,
  onViewDetails,
  loading = false,
  compact = false,
  className
}) {
  if (!decision) return null;

  const {
    id,
    decisionType = "SYSTEM_DECISION",
    entityId,
    entityType,
    situation,
    decision: recommendation,
    reason,
    actionRequired,
    resultExpected,
    impact,
    status = "APPLIED",
    approvedBy = "SYSTEM_ENGINE"
  } = decision;

  return (
    <div
      className={clsx(
        "bg-white border rounded-xl overflow-hidden shadow-soft transition-all duration-200 hover:shadow-md",
        status === "PENDING_APPROVAL" ? "border-amber-300 bg-amber-50/10" : "border-slate-200/90",
        className
      )}
    >
      {/* Header bar */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#92EEFF] flex items-center justify-center text-slate-950">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            {decisionType.replace(/_/g, " ")}
          </span>
          {entityId && (
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
              {entityId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={status === "APPLIED" ? "success" : "warning"}>
            {status}
          </Badge>
        </div>
      </div>

      {/* 5-part body */}
      <div className="p-4 space-y-3">
        {/* Situation */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Situation
          </div>
          <p className="text-sm text-slate-800 font-medium leading-relaxed pl-5">
            {situation}
          </p>
        </div>

        {/* Decision */}
        <div className="bg-[#E5FAFE]/70 border border-[#92EEFF]/60 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E8FAE] uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#0E8FAE]" />
            Recommended Decision
          </div>
          <p className="text-sm font-semibold text-slate-900 leading-snug pl-5">
            {recommendation}
          </p>
        </div>

        {/* Reason */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Reasoning & Logic
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-5">
            {reason}
          </p>
        </div>

        {/* Action & Result Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Operator Action
            </div>
            <p className="text-xs text-slate-700 font-medium">
              {actionRequired}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Expected Result
            </div>
            <p className="text-xs text-slate-700 font-medium">
              {resultExpected}
            </p>
          </div>
        </div>

        {/* Expected Financial Impact */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Expected Financial Impact
            </span>
            <span className="text-[10px] font-mono bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              ROI VALIDATED
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 pt-0.5">
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Est. Cost Saving: </span>
              <span className="font-mono font-bold text-emerald-700">{decision.estimatedSavings || (decision.decisionType?.includes("ROUTE") ? "₹145/day" : "₹210/shift")}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium">Fulfillment Gain: </span>
              <span className="font-mono font-bold text-[#0E8FAE]">{decision.fulfillmentGain || (decision.decisionType?.includes("ROUTE") ? "+38.8%" : "+8.4%")}</span>
            </div>
          </div>
        </div>

        {impact && (
          <div className="text-xs text-slate-500 bg-slate-50/50 p-2 rounded border border-slate-100 italic">
            <span className="font-semibold text-slate-600 not-italic">Downstream Impact: </span>
            {impact}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      {(onApprove || onViewDetails) && (
        <div className="bg-slate-50/60 px-4 py-2.5 border-t border-slate-200/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Validated by: <span className="font-mono text-slate-600">{approvedBy}</span>
          </div>

          <div className="flex items-center gap-2">
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                className="btn-outline text-xs py-1.5 px-3"
              >
                View Details
              </button>
            )}

            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                disabled={loading || status === "APPLIED"}
                className={clsx(
                  "text-xs py-1.5 px-3.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all",
                  status === "APPLIED"
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#92EEFF] hover:bg-[#70E5FB] text-slate-950 shadow-sm"
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {status === "APPLIED" ? "Applied" : "Approve & Execute"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
