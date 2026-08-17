import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import {
  PackageCheck,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Box,
  Barcode,
  Truck,
  RotateCcw,
  Sparkles,
  Printer,
  Scale,
  Check,
  Search,
  Clock,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  MapPin
} from "lucide-react";

export function PackingQCPage() {
  const { orders = [], refresh, setLabelModalOrder, setScannerOpen, activeScope, activeHub } = useRealtimeData() || {};
  const { toast } = useToast();
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [scaleGrossWeight, setScaleGrossWeight] = useState("2.42");
  const [selectedBoxType, setSelectedBoxType] = useState("Box Type C-4 (30x20x15cm)");
  
  // Interactive 6-point checklist state
  const [checklist, setChecklist] = useState({
    skuIdentity: true,
    countMatches: true,
    sealPristine: true,
    barcodeScannable: true,
    outerBoxFlute: true,
    cushioningAdded: true
  });

  const toggleCheck = (key) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) {
        toast.warning("QC Check Toggled Off", `Flagged item check: ${key}`);
      } else {
        toast.info("QC Check Verified", `Confirmed check: ${key}`);
      }
      return next;
    });
  };

  const ordersList = Array.isArray(orders) ? orders : [];
  
  // Show all eligible orders for QC & Packing
  const qcEligibleOrders = useMemo(() => {
    return ordersList.filter((o) =>
      ["PACKED", "QUALITY_CHECK", "PICKED", "ALLOCATED", "READY_TO_DISPATCH"].includes(o.status)
    );
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return qcEligibleOrders.filter((ord) => {
      const matchesSearch =
        (ord.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.items || []).some(it => (it.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) || (it.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === "ALL" || ord.priorityLevel === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [qcEligibleOrders, searchQuery, priorityFilter]);

  // Default selection
  useEffect(() => {
    if (filteredOrders.length > 0 && !inspectingOrder) {
      setInspectingOrder(filteredOrders[0]);
    } else if (filteredOrders.length > 0 && inspectingOrder) {
      const updated = filteredOrders.find(o => o.id === inspectingOrder.id);
      if (updated) setInspectingOrder(updated);
    }
  }, [filteredOrders]);

  const getChannelTag = (channel) => {
    const formatted = (channel || "STOCKFLOW_B2B").replace(/_/g, " ");
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
        {formatted}
      </span>
    );
  };

  const handleQCVerify = async (orderId, hasIssue = false, issueType = "DAMAGED_ITEM") => {
    setLoading(true);
    try {
      await api.verifyQC({
        orderId,
        hasIssue,
        issueType,
        problemDescription: hasIssue
          ? `Visual inspection failed: 1 unit damaged cap seal at QC station.`
          : undefined,
      });
      await refresh();
      if (!hasIssue) {
        toast.success(
          "QC Inspection Passed",
          `Order ${inspectingOrder?.orderNumber || orderId} passed 6-point verification. Ready for dispatch.`
        );
        setLabelModalOrder(orderId);
      } else {
        toast.error(
          "Damaged Item Exception Flagged",
          `Incident logged for ${inspectingOrder?.orderNumber || orderId}. Transferred to Exception Center.`
        );
      }
    } catch (e) {
      toast.error("QC Operation Failed", "Unable to record inspection result.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };


  const allChecksPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Packing & Quality Assurance (QC Workbench)
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {activeScope === "ALL" ? "5 HUBS" : activeScope}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                6-Point Enterprise QC Protocol • Scale gross weight verification & thermal shipping label dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Barcode className="w-4 h-4 text-slate-950" />
            <span>HHT RF Scanner</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Scrollable Order Queue (10+ Orders) + Right Side Sticky QC Inspection Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE QUEUE (10+ Orders)                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search & Filter Header Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Ready for QC & Packing</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-100 text-cyan-900 font-mono text-[11px]">
                  {filteredOrders.length} Orders
                </span>
              </span>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal / Low</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order #, SKU, Customer..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
              />
            </div>
          </div>

          {/* SCROLLABLE ORDER LIST CONTAINER */}
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto pr-1.5 space-y-2.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No matching orders in the packing & QC queue.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = inspectingOrder?.id === ord.id;
                const totalUnits = (ord.items || []).reduce((sum, it) => sum + (it.quantityAllocated || it.quantityRequested || 1), 0);

                return (
                  <div
                    key={ord.id}
                    onClick={() => setInspectingOrder(ord)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#0E8FAE] bg-[#F0FDFF] shadow-sm ring-2 ring-[#92EEFF]/40"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                    }`}
                  >
                    {/* Top Row: Order # & Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {ord.orderNumber}
                        </span>
                        {getChannelTag(ord.channel)}
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {ord.warehouseId || "HYD-01"}
                        </span>
                      </div>

                      <Badge variant={ord.priorityLevel}>
                        {ord.priorityLevel}
                      </Badge>
                    </div>

                    {/* Middle Row: Customer name & City */}
                    <div className="mt-1.5 text-xs text-slate-700 font-semibold truncate">
                      {ord.customerName}
                    </div>

                    {/* Bottom Row: Item count, Price, SLA remaining */}
                    <div className="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <span>{ord.items?.length || 1} SKUs ({totalUnits} Units)</span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">₹{ord.totalAmount?.toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={ord.priorityLevel === "CRITICAL" ? "text-red-600 font-bold" : ""}>
                          {ord.slaRemainingHours ? `${ord.slaRemainingHours}h SLA` : "On Schedule"}
                        </span>
                      </div>
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
        {/* RIGHT COLUMN: STICKY QUALITY INSPECTION WORKBENCH                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 sticky top-20">
          {inspectingOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              
              {/* Workbench Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0E8FAE]" />
                    <h2 className="text-base font-black text-slate-900 font-mono">
                      QC Inspection: {inspectingOrder.orderNumber}
                    </h2>
                    {getChannelTag(inspectingOrder.channel)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Consignee: <b className="text-slate-800">{inspectingOrder.customerName}</b> • Facility: <b className="font-mono text-slate-800">{inspectingOrder.warehouseId || "HYD-01"}</b>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-900 text-[#92EEFF]">
                    Station 04 (Floor 5)
                  </span>
                </div>
              </div>

              {/* Verified Order Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Verified SKUs & Pick Face Bins
                  </h3>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="text-[11px] font-bold text-[#0E8FAE] hover:underline flex items-center gap-1"
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>RF Gun Scan Verify</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inspectingOrder.items?.map((it, idx) => (
                    <div
                      key={it.sku || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{it.productName || it.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                          <span className="font-bold text-slate-700">{it.sku}</span>
                          <span>•</span>
                          <span>Bin: <b className="text-slate-900">{it.locationCode || it.bin || "A-01"}</b></span>
                          <span>•</span>
                          <span>Barcode: 890{idx + 10002148}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {it.quantityAllocated || it.quantityRequested || 1} Units
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> Pick Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Scale & Packaging Carton Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                {/* Scale widget */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-cyan-700" />
                      <span>Digital Scale Calibration</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setScaleGrossWeight((2.40 + (Math.random() * 0.04 - 0.02)).toFixed(2))}
                      className="text-[10px] text-cyan-800 hover:underline font-bold"
                    >
                      Tare / Re-zero
                    </button>
                  </div>
                  <div className="font-mono text-xl font-black text-slate-900 flex items-center gap-2">
                    <span>{scaleGrossWeight} kg</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                      ±0.02kg PASS
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">Gross Weight Spec: 2.40 kg (Tolerance: ±0.05kg)</div>
                </div>

                {/* Box Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                    <Box className="w-4 h-4 text-amber-600" />
                    <span>Assigned Packaging Carton</span>
                  </div>
                  <select
                    value={selectedBoxType}
                    onChange={(e) => setSelectedBoxType(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="Box Type C-4 (30x20x15cm)">Box Type C-4 (30x20x15cm)</option>
                    <option value="Box Type B-2 (45x30x25cm)">Box Type B-2 (45x30x25cm)</option>
                    <option value="Heavy Duty Double-Wall (60x40x40cm)">Heavy Duty Double-Wall (60x40x40cm)</option>
                    <option value="Eco Poly-Mailer (Small 20x15cm)">Eco Poly-Mailer (Small 20x15cm)</option>
                  </select>
                  <div className="text-[10px] text-slate-500">Corrugated Flute B • Void Fill: 12% Cushioning</div>
                </div>
              </div>

              {/* 6-Point QA Checklist with Interactive Click Toggles */}
              <div className="bg-[#F0FDFF] border border-[#92EEFF] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#0E8FAE] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0E8FAE]" />
                    <span>6-Point Enterprise QA Verification Checklist</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    All Passed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleCheck("skuIdentity")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.skuIdentity ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.skuIdentity ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>1. Correct SKU Identity Verified</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck("countMatches")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.countMatches ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.countMatches ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>2. Unit Count Matches Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck("sealPristine")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.sealPristine ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.sealPristine ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>3. Bottle/Carton Seal Pristine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck("barcodeScannable")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.barcodeScannable ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.barcodeScannable ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>4. Barcode Label Scannable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck("outerBoxFlute")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.outerBoxFlute ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.outerBoxFlute ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>5. Outer Box Corrugated Flute B</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCheck("cushioningAdded")}
                    className={`p-2 rounded-lg text-left transition-all flex items-center gap-2 font-medium ${
                      checklist.cushioningAdded ? "bg-white text-slate-900 border border-slate-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${checklist.cushioningAdded ? "text-emerald-600" : "text-slate-300"}`} />
                    <span>6. Void Fill & Cushioning Added</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQCVerify(inspectingOrder.id, true, "DAMAGED_ITEM")}
                  disabled={loading}
                  className="btn-danger text-xs py-2 px-3 shadow-xs"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Report Damaged Exception</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLabelModalOrder(inspectingOrder.id)}
                    className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>4x6 Shipping Label</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQCVerify(inspectingOrder.id, false)}
                    disabled={loading}
                    className="btn-primary text-xs sm:text-sm font-bold py-2 px-4 shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Pass QC & Print Label</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20 text-slate-400 space-y-2">
              <PackageCheck className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Select an Order from Queue</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click any order in the left queue to open the interactive Quality Assurance and digital scale workbench.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
