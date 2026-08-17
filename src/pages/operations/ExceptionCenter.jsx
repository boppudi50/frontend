import React, { useState } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import {
  AlertOctagon,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Plus,
  ArrowRight,
  Flame,
  Eye,
  X,
  Search
} from "lucide-react";

export function ExceptionCenter() {
  const { exceptions = [], refresh } = useRealtimeData() || {};
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [resolvingId, setResolvingId] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [search, setSearch] = useState("");

  const exceptionsList = Array.isArray(exceptions) ? exceptions : [];
  const filteredExceptions = exceptionsList.filter((e) => {
    const matchesSeverity = severityFilter === "ALL" || e.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    const matchesSearch =
      !search ||
      (e.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.title && e.title.toLowerCase().includes(search.toLowerCase())) ||
      (e.sku && e.sku.toLowerCase().includes(search.toLowerCase()));
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleResolve = async (exceptionId, resolutionType = "STANDARD_APPROVAL", notes = "Approved and verified via Exception Center") => {
    setResolvingId(exceptionId);
    try {
      if (selectedException?.type === "INVENTORY_MISMATCH") {
        await api.resolveMismatch({
          exceptionId,
          physicalQuantity: selectedException.physicalQuantity || 92,
          reason: "Cycle count variance reconciled after physical audit."
        });
      } else {
        await api.resolveException({
          exceptionId,
          resolutionType,
          notes,
        });
      }
      await refresh();
      setSelectedException(null);
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleEscalate = async (exceptionId) => {
    setResolvingId(exceptionId);
    try {
      await api.resolveException({
        exceptionId,
        resolutionType: "ESCALATE_TO_EXECUTIVE",
        notes: "Escalated to Executive Operations Shift Supervisor."
      });
      await refresh();
      setSelectedException(null);
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Warehouse Exception Center</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              {exceptions.filter((e) => e.status === "OPEN").length} Active Exceptions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Philosophy: <span className="font-semibold text-slate-700">EXCEPTION → DECISION → RESOLUTION</span>. Automated diagnostics and 1-click resolution workflows.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg transition-all ${severityFilter === sev
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {sev === "ALL" ? "All Severities" : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-enterprise p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Exception ID, SKU, Problem..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Unresolved)</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Exceptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExceptions.length === 0 ? (
          <div className="col-span-2 card-enterprise text-center py-12 text-slate-400 text-xs">
            No exceptions matching the current filter. All operations operating within nominal bounds.
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const isResolved = exc.status === "RESOLVED";

            return (
              <div
                key={exc.id}
                className={`card-enterprise space-y-3.5 border-l-4 transition-all ${isResolved
                    ? "border-l-emerald-500 bg-emerald-50/10"
                    : exc.severity === "CRITICAL"
                      ? "border-l-red-500 bg-red-50/15"
                      : "border-l-amber-500 bg-amber-50/10"
                  }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">{exc.id}</span>
                    <Badge variant={exc.severity}>{exc.severity}</Badge>
                    <Badge variant="primary">
                      {exc.type || exc.exceptionType || "OPERATIONAL_ANOMALY"}
                    </Badge>
                  </div>
                  <Badge variant={isResolved ? "success" : "warning"}>{exc.status}</Badge>
                </div>

                {/* Title & Problem Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {exc.title || exc.productName || exc.id}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                    {exc.problem || exc.situation || "Anomaly detected in active fulfillment stream."}
                  </p>
                </div>

                {/* Recommended Decision Box */}
                <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0E8FAE] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    Recommended Resolution
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    {exc.decision || exc.recommendedDecision || exc.recommendedAction}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedException(exc)}
                    className="btn-outline text-xs py-1 px-2.5 inline-flex items-center gap-1 text-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isResolved ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleEscalate(exc.id)}
                          disabled={resolvingId === exc.id}
                          className="btn-outline text-xs py-1 px-2 text-red-600 border-red-200 hover:bg-red-50 font-bold"
                          title="Escalate to Supervisor"
                        >
                          Escalate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(exc.id, "AUTONOMOUS_ONE_CLICK")}
                          disabled={resolvingId === exc.id}
                          className="btn-primary text-xs font-bold py-1.5 px-3 shadow-sm inline-flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{resolvingId === exc.id ? "Resolving..." : "Approve Resolution"}</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Resolved & Audited
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Details Modal */}
      {selectedException && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Exception Diagnostics: {selectedException.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Situation & Problem</div>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedException.problem || selectedException.situation}
                </p>
                {selectedException.difference && (
                  <div className="text-[11px] font-mono text-red-600 font-bold">
                    Discrepancy: {selectedException.difference} units (System: {selectedException.systemQuantity} vs Physical: {selectedException.physicalQuantity})
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#E5FAFE] border border-[#92EEFF] rounded-xl space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-[#0E8FAE]">Recommended Decision & Reason</div>
                <p className="text-slate-900 font-bold">
                  {selectedException.decision || selectedException.recommendedDecision}
                </p>
                <p className="text-slate-600 leading-snug">
                  {selectedException.reason}
                </p>
              </div>

              {selectedException.possibleCauses && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Possible Causes Identified</div>
                  <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                    {selectedException.possibleCauses.map((cause, idx) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedException(null)}
                className="btn-outline text-xs py-2 px-3"
              >
                Close
              </button>
              {selectedException.status !== "RESOLVED" && (
                <button
                  type="button"
                  onClick={() => handleResolve(selectedException.id, "AUTONOMOUS_ONE_CLICK")}
                  disabled={resolvingId === selectedException.id}
                  className="btn-primary text-xs font-bold py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{resolvingId === selectedException.id ? "Resolving..." : "Approve & Execute Resolution"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
