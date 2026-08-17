import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import {
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Search,
  Barcode,
  Package,
  ArrowRight,
  RefreshCw,
  X,
  Sparkles,
  DollarSign,
  Truck,
  Check,
  AlertTriangle,
  ChevronRight,
  Clock,
  Building2,
  Scale
} from "lucide-react";

export function ReturnsPage() {
  const { returnsList = [], refresh, loading, inventory = [], activeScope } = useRealtimeData() || {};
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [gradingNotes, setGradingNotes] = useState("");
  const [targetBin, setTargetBin] = useState("A-01");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  const returns = Array.isArray(returnsList) ? returnsList : [];

  const pendingCount = returns.filter((r) => r.gradingStatus === "PENDING_INSPECTION").length;
  const restockedCount = returns.filter((r) => r.gradingStatus === "GRADED_RESTOCKED").length;
  const damagedCount = returns.filter((r) => r.gradingStatus === "GRADED_DAMAGED").length;

  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      const matchesSearch =
        (r.returnNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.trackingNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.productName || "").toLowerCase().includes(search.toLowerCase());
      const matchesChannel = channelFilter === "ALL" || r.channel === channelFilter;
      const matchesStatus = statusFilter === "ALL" || r.gradingStatus === statusFilter;
      const matchesScope = !activeScope || activeScope === "ALL" || r.warehouseId === activeScope || r.fulfillmentCenterId === activeScope;
      return matchesSearch && matchesChannel && matchesStatus && matchesScope;
    });
  }, [returns, search, channelFilter, statusFilter, activeScope]);

  // Default selection
  React.useEffect(() => {
    if (filteredReturns.length > 0 && !selectedReturn) {
      setSelectedReturn(filteredReturns[0]);
    } else if (filteredReturns.length > 0 && selectedReturn) {
      const updated = filteredReturns.find(r => r.id === selectedReturn.id);
      if (updated) setSelectedReturn(updated);
    }
  }, [filteredReturns]);

  const handleGradeReturn = async (grade) => {
    if (!selectedReturn) return;
    setActionLoading(true);
    setActionSuccessMsg(null);
    try {
      await api.gradeAndRestockReturn({
        returnId: selectedReturn.id,
        grade,
        targetBin,
        notes: gradingNotes
      });
      await refresh();

      const isRestock = grade.includes("RESTOCK") || grade.includes("A") || grade.includes("B");
      const msg = isRestock
        ? `Successfully restocked ${selectedReturn.quantity} units to Bin ${targetBin}. Customer credit memo issued.`
        : `Item quarantined to Scrap Bay Q-02. Carrier damage compensation claim logged.`;

      setActionSuccessMsg(msg);
      
      if (isRestock) {
        toast.success("RTO Item Restocked", msg);
      } else {
        toast.error("RTO Item Quarantined", msg);
      }

      setSelectedReturn((prev) => ({
        ...prev,
        gradingStatus: isRestock ? "GRADED_RESTOCKED" : "GRADED_DAMAGED",
        refundStatus: isRestock ? "CREDITED" : "REPLACED_SENT"
      }));
    } catch (err) {
      console.error(err);
      toast.error("QA Grading Failed", "Unable to record return inspection.");
    } finally {
      setActionLoading(false);
    }
  };

  const getChannelTag = (channel) => {
    const formatted = (channel || "STOCKFLOW_D2C").replace(/_/g, " ");
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Reverse Logistics & Customer Returns (RTO Hub)
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {pendingCount} PENDING
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated multi-grade QA inspection, instant customer credit memos, and return-to-inventory restock
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await refresh();
              toast.info("RTO Queue Synchronized", "Refreshed reverse logistics inbound consignments.");
            }}
            disabled={loading}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync RTO Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Pending QA Grading
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {pendingCount} Consignments
          </div>
          <span className="text-[11px] text-amber-700 font-semibold block">
            Awaiting workbench inspection
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Restocked (Grade A / B)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {restockedCount} Items Saved
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            +100% Value Recovery to Inventory
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-red-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Scrap / Damaged (Grade C)
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {damagedCount} Quarantined
          </div>
          <span className="text-[11px] text-red-700 font-semibold block">
            Carrier Insurance Claim Staged
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround Cycle
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            4.2 Hours
          </div>
          <span className="text-[11px] text-[#0E8FAE] font-semibold block">
            Industry Benchmark: 24.0h
          </span>
        </div>
      </div>

      {/* Main Grid: Left Side Scrollable RTO Queue + Right Side Sticky QA Grading Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE RTO QUEUE (10+ Consignments)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-3">
          
          {/* Search & Filter Header Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>RTO Inbound Consignments</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-100 text-cyan-900 font-mono text-[11px]">
                  {filteredReturns.length} Items
                </span>
              </span>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_INSPECTION">Pending Inspection</option>
                <option value="GRADED_RESTOCKED">Restocked</option>
                <option value="GRADED_DAMAGED">Damaged</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Return #, Order #, SKU, Customer..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
              />
            </div>
          </div>

          {/* SCROLLABLE RETURN LIST CONTAINER */}
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto pr-1.5 space-y-2.5">
            {filteredReturns.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No customer returns match the selected filter.
              </div>
            ) : (
              filteredReturns.map((item) => {
                const isSelected = selectedReturn?.id === item.id;
                const isRestocked = item.gradingStatus === "GRADED_RESTOCKED";
                const isDamaged = item.gradingStatus === "GRADED_DAMAGED";

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedReturn(item);
                      setActionSuccessMsg(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#0E8FAE] bg-[#F0FDFF] shadow-sm ring-2 ring-[#92EEFF]/40"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                    }`}
                  >
                    {/* Top Row: Return # & Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {item.returnNumber}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Ref: {item.orderNumber}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {item.warehouseId || "HYD-01"}
                        </span>
                        {getChannelTag(item.channel)}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isRestocked
                            ? "bg-emerald-100 text-emerald-800"
                            : isDamaged
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900 animate-pulse"
                        }`}
                      >
                        {item.gradingStatus?.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Middle: Product Name & Reason */}
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      
                      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>SKU: <b className="text-slate-800">{item.sku}</b> • {item.quantity} Units</span>
                        <span>AWB: {item.trackingNumber}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mt-1">
                        <span className="font-semibold text-slate-700">Return Reason:</span> {item.returnReason}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                        <ChevronRight className="w-4 h-4 text-[#0E8FAE]" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY QA GRADING & RESTOCK WORKBENCH                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 sticky top-20">
          {selectedReturn ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              
              {/* Workbench Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0E8FAE]" />
                    <h2 className="text-base font-black text-slate-900 font-mono">
                      QA Grading: {selectedReturn.returnNumber}
                    </h2>
                    {getChannelTag(selectedReturn.channel)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Order Ref: <b className="font-mono text-slate-800">{selectedReturn.orderNumber}</b> • Customer: <b className="text-slate-800">{selectedReturn.customerName}</b>
                  </p>
                </div>

                <Badge variant={selectedReturn.gradingStatus === "GRADED_RESTOCKED" ? "success" : "warning"}>
                  {selectedReturn.gradingStatus}
                </Badge>
              </div>

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Item Specs & Inbound Route */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{selectedReturn.productName}</div>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
                    <span>SKU: <b className="text-slate-800">{selectedReturn.sku}</b></span>
                    <span>•</span>
                    <span>Quantity: <b className="text-slate-800">{selectedReturn.quantity} Units</b></span>
                    <span>•</span>
                    <span>Facility: <b className="text-slate-800">{selectedReturn.warehouseId || "HYD-01"}</b></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 border-t border-slate-200/80 pt-2 flex items-center justify-between font-mono">
                  <span>Reverse Carrier: <b>{selectedReturn.carrier}</b></span>
                  <span>Tracking: <b>{selectedReturn.trackingNumber}</b></span>
                </div>
              </div>

              {/* Target Restock Bin & Inspector Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target Inventory Restock Bin
                  </label>
                  <select
                    value={targetBin}
                    onChange={(e) => {
                      setTargetBin(e.target.value);
                      toast.info("Target Bin Assigned", `Assigned Bin ${e.target.value} for returned stock.`);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  >
                    <option value="A-01">Bin A-01 (Zone A • High Velocity Rack)</option>
                    <option value="A-02">Bin A-02 (Zone A • Pick Face)</option>
                    <option value="B-01">Bin B-01 (Zone B • Secondary Storage)</option>
                    <option value="C-01">Bin C-01 (Zone C • Bulk Overstock)</option>
                    <option value="D-01">Bin D-01 (Zone D • Reefer Storage)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    QA Inspector Notes / Physical Defect Diagnosis
                  </label>
                  <input
                    type="text"
                    value={gradingNotes}
                    onChange={(e) => setGradingNotes(e.target.value)}
                    placeholder="e.g. Seal intact, barcode verified scannable, approved for immediate restock..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>
              </div>

              {/* 3 Autonomous QA Grading Tier Options */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Select Autonomous QA Grade & Action
                </label>

                {/* Grade A */}
                <button
                  type="button"
                  onClick={() => handleGradeReturn("GRADE_A_PRISTINE")}
                  disabled={actionLoading}
                  className="w-full text-left p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all space-y-1 shadow-2xs disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Grade A: Pristine Condition (100% Restock)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono">
                      +100% Value
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Unopened factory seal. Restocks {selectedReturn.quantity} units to Bin {targetBin} and triggers customer credit memo.
                  </p>
                </button>

                {/* Grade B */}
                <button
                  type="button"
                  onClick={() => handleGradeReturn("GRADE_B_REPACKABLE")}
                  disabled={actionLoading}
                  className="w-full text-left p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 transition-all space-y-1 shadow-2xs disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Grade B: Outer Box Scuffed (Repackable)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">
                      Repack & Buffer
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Product bottle undamaged. Requires carton box re-taping before restocking.
                  </p>
                </button>

                {/* Grade C */}
                <button
                  type="button"
                  onClick={() => handleGradeReturn("GRADE_C_DAMAGED")}
                  disabled={actionLoading}
                  className="w-full text-left p-3 rounded-xl border border-red-300 bg-red-50/70 hover:bg-red-100/80 transition-all space-y-1 shadow-2xs disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900 flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-red-600" />
                      <span>Grade C: Damaged / Unusable (Scrap & Claim)</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-200 text-red-900 font-mono">
                      Quarantine
                    </span>
                  </div>
                  <p className="text-[11px] text-red-800">
                    Leaking / broken in transit. Moves stock to Scrap Area Q-02 and logs carrier insurance compensation claim.
                  </p>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20 text-slate-400 space-y-2">
              <RotateCcw className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Select an RTO Consignment</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click any return item from the left queue to open the autonomous QA grading and restock workbench.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
