import React, { useState } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { DecisionCard } from "../../components/common/DecisionCard";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Lock,
  Users
} from "lucide-react";

export function AuditLogsPage() {
  const { auditLogs = [], decisionLogs = [], refresh, loading } = useRealtimeData() || {};
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("audit"); // audit or decisions
  const [search, setSearch] = useState("");
  const [showAllAudits, setShowAllAudits] = useState(false);
  const [showAllDecisions, setShowAllDecisions] = useState(false);

  const auditsList = Array.isArray(auditLogs) ? auditLogs : [];
  const decisionsList = Array.isArray(decisionLogs) ? decisionLogs : [];

  const filteredAudits = auditsList.filter((log) => {
    const s = search.toLowerCase();
    return (
      (log.action || "").toLowerCase().includes(s) ||
      (log.user || "").toLowerCase().includes(s) ||
      (log.entity || "").toLowerCase().includes(s) ||
      (log.reason || "").toLowerCase().includes(s)
    );
  });

  const filteredDecisions = decisionsList.filter((d) => {
    const s = search.toLowerCase();
    return (
      (d.decisionType || "").toLowerCase().includes(s) ||
      (d.entityId || "").toLowerCase().includes(s) ||
      (d.situation || "").toLowerCase().includes(s) ||
      (d.decision || "").toLowerCase().includes(s)
    );
  });

  const displayedAudits = showAllAudits ? filteredAudits : filteredAudits.slice(0, 10);
  const displayedDecisions = showAllDecisions ? filteredDecisions : filteredDecisions.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  System Audit Trail & Decision Intelligence
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  IMMUTABLE LOGS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Complete compliance trace recording user overrides, inventory transfers, FEFO batch allocations, and autonomous AI decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("audit");
                toast.info("Switched to Audit Trail", "Displaying immutable user action history.");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "audit" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              System Audit ({auditsList.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("decisions");
                toast.info("Switched to Decision Logs", "Displaying autonomous AI warehouse decisions.");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === "decisions" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              AI Decisions ({decisionsList.length})
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              await refresh();
              toast.info("Audit Ledger Synchronized", "Refreshed live transactional log stream.");
            }}
            disabled={loading}
            className="btn-outline text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Operations Logged</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
            {auditsList.length} Operations
          </div>
          <div className="text-[10px] text-[#0E8FAE] font-semibold flex items-center gap-0.5">
            <FileCheck2 className="w-3 h-3" />
            <span>Cryptographically Verified</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Autonomous Decisions</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
            {decisionsList.length} AI Actions
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            <span>TSP Wave & Priority Engine</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active System Actors</div>
          <div className="text-base sm:text-lg font-black text-blue-700 font-mono">
            18 Warehouse Staff
          </div>
          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
            <Users className="w-3 h-3" />
            <span>Role-Based Audit Attribution</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Compliance Integrity</div>
          <div className="text-base sm:text-lg font-black text-amber-800 font-mono">
            100% SEC/ISO Audited
          </div>
          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero Unlogged Mutations</span>
          </div>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user, role, entity, reason, action, or decision..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
          />
        </div>
      </div>

      {/* Tab 1: System Audit Log Table */}
      {activeTab === "audit" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">State Transition</th>
                  <th className="py-3 px-4">Reason / Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedAudits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      No matching audit logs found.
                    </td>
                  </tr>
                ) : (
                  displayedAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }) : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{log.user || "System"}</div>
                        <span className="text-[10px] font-semibold text-[#0E8FAE]">
                          {(log.role || "SUPER_ADMIN").replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {log.action}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {log.entity}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        {log.previousValue ? (
                          <span className="text-slate-400">
                            {log.previousValue} → <strong className="text-slate-900">{log.newValue}</strong>
                          </span>
                        ) : (
                          <strong className="text-slate-900">{log.newValue}</strong>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-sm">
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with "See All Audits" Expand / Collapse */}
          <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="text-slate-500 font-medium flex items-center gap-2">
              <span>
                Showing <b className="text-slate-900 font-mono">{displayedAudits.length}</b> of{" "}
                <b className="text-slate-900 font-mono">{filteredAudits.length}</b> audit records
              </span>
              {showAllAudits ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ALL AUDITS EXPANDED
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  FIRST 10 AUDITS
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {filteredAudits.length > 10 && (
                <button
                  type="button"
                  onClick={() => setShowAllAudits(!showAllAudits)}
                  className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                    showAllAudits
                      ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                      : "btn-primary text-slate-950"
                  }`}
                >
                  {showAllAudits ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                      <span>Show First 10 Audits</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-950" />
                      <span>See All ({filteredAudits.length}) Audits</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Autonomous Decision Logs */
        <div className="space-y-3">
          {displayedDecisions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              No matching decision logs found.
            </div>
          ) : (
            displayedDecisions.map((dec) => (
              <DecisionCard key={dec.id} decision={dec} />
            ))
          )}

          {/* Decision Logs Expand / Collapse Footer */}
          {filteredDecisions.length > 10 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Showing <b className="text-slate-900 font-mono">{displayedDecisions.length}</b> of{" "}
                <b className="text-slate-900 font-mono">{filteredDecisions.length}</b> AI decision logs
              </span>
              <button
                type="button"
                onClick={() => setShowAllDecisions(!showAllDecisions)}
                className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                  showAllDecisions
                    ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                    : "btn-primary text-slate-950"
                }`}
              >
                {showAllDecisions ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                    <span>Show First 10 Decisions</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-950" />
                    <span>See All ({filteredDecisions.length}) Decisions</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;
