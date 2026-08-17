import React, { useState } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import {
  ShoppingCart,
  Zap,
  Play,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PackageCheck,
  RefreshCw,
  Eye,
  X,
  Truck,
  ShieldCheck,
  Printer,
  Barcode,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  ExternalLink,
  Boxes
} from "lucide-react";

const LIFECYCLE_STAGES = [
  "CREATED",
  "PRIORITIZED",
  "ALLOCATED",
  "PICKING",
  "PICKED",
  "PACKING",
  "PACKED",
  "QUALITY_CHECK",
  "READY_TO_DISPATCH",
  "DISPATCHED",
  "IN_TRANSIT",
  "COMPLETED"
];

export function OrdersPage() {
  const { orders = [], refresh, setLabelModalOrder, setScannerOpen } = useRealtimeData() || {};
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [quickTab, setQuickTab] = useState("ALL");
  const [allocating, setAllocating] = useState(false);
  const [allocationSummary, setAllocationSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Deterministic priority ordering
  const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  // Channel branding badge helper
  const getChannelBadge = (channel) => {
    const ch = (channel || "STOCKFLOW_RETAIL").toUpperCase();
    if (ch.includes("AMAZON") || ch.includes("PRIME")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Amazon Prime Fulfilled
        </span>
      );
    }
    if (ch.includes("DMART")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          DMart Superstore Direct
        </span>
      );
    }
    if (ch.includes("FLIPKART") || ch.includes("FBF")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-900 border border-blue-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          Flipkart FBF Priority
        </span>
      );
    }
    if (ch.includes("BLINKIT") || ch.includes("ZEPTO") || ch.includes("DARKSTORE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-50 text-yellow-950 border border-yellow-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
          Blinkit 15-Min Darkstore
        </span>
      );
    }
    if (ch.includes("B2B")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-900 border border-indigo-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          StockFlow B2B Bulk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-50 text-cyan-900 border border-cyan-200 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0E8FAE]" />
        StockFlow Retail Distribution
      </span>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PICKING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            PICKING
          </span>
        );
      case "PICKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-cyan-50 text-cyan-800 border border-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-600" />
            PICKED
          </span>
        );
      case "PACKING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            PACKING
          </span>
        );
      case "PACKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-700" />
            PACKED
          </span>
        );
      case "QUALITY_CHECK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            QUALITY CHECK
          </span>
        );
      case "READY_TO_DISPATCH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            READY TO DISPATCH
          </span>
        );
      case "DISPATCHED":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-900 text-emerald-400 border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            DISPATCHED
          </span>
        );
      case "ALLOCATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            ALLOCATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
            {status || "CREATED"}
          </span>
        );
    }
  };

  const ordersList = Array.isArray(orders) ? orders : [];

  // Quick Tab Filter Logic
  const filteredOrders = [...ordersList]
    .sort((a, b) => (priorityWeight[b.priorityLevel] || 0) - (priorityWeight[a.priorityLevel] || 0) || (b.priorityScore || 0) - (a.priorityScore || 0))
    .filter((ord) => {
      const matchesSearch =
        (ord.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (ord.customerName || "").toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || ord.priorityLevel === priorityFilter;
      const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
      const matchesChannel = channelFilter === "ALL" || ord.channel === channelFilter;

      let matchesQuick = true;
      if (quickTab === "CRITICAL") matchesQuick = ord.priorityLevel === "CRITICAL" || ord.slaRemainingHours <= 2.5;
      else if (quickTab === "PICKING") matchesQuick = ["ALLOCATED", "PICKING", "PICKED"].includes(ord.status);
      else if (quickTab === "QC_PACK") matchesQuick = ["PACKING", "PACKED", "QUALITY_CHECK"].includes(ord.status);
      else if (quickTab === "DISPATCH") matchesQuick = ["READY_TO_DISPATCH", "DISPATCHED", "IN_TRANSIT", "COMPLETED"].includes(ord.status);

      return matchesSearch && matchesPriority && matchesStatus && matchesChannel && matchesQuick;
    });

  const handleRunAllocation = async (orderId = null) => {
    setAllocating(true);
    try {
      const res = await api.allocate(orderId);
      setAllocationSummary(res);
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const handleCreatePicking = async (orderId) => {
    try {
      await api.createPickingTask(orderId);
      await refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransitionState = async (orderId, targetStatus) => {
    setTransitioning(true);
    try {
      await api.transitionOrderStatus({
        orderId,
        targetStatus,
        notes: `Advanced to ${targetStatus} via Orders Command Center`
      });
      await refresh();
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: targetStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTransitioning(false);
    }
  };

  // Compute stats for header ribbon
  const totalCount = ordersList.length;
  const criticalCount = ordersList.filter(o => o.priorityLevel === "CRITICAL" || o.slaRemainingHours <= 2.5).length;
  const readyDispatchCount = ordersList.filter(o => o.status === "READY_TO_DISPATCH").length;
  const dispatchedCount = ordersList.filter(o => ["DISPATCHED", "COMPLETED", "IN_TRANSIT"].includes(o.status)).length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. AMAZON-GRADE EXECUTIVE ORDER ALLOCATION HEADER & ACTION BAR            */}
      {/* ========================================================================= */}
      <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0E8FAE]/40 via-[#0A2E50] to-[#041628] rounded-2xl p-5 text-white border border-[#38D2F3]/40 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-gradient-to-bl from-[#92EEFF]/30 via-[#38D2F3]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-gradient-to-tr from-[#1D4ED8]/25 via-[#0E8FAE]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#92EEFF] text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                FULFILLMENT CORE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Orders & Multi-Channel Smart Allocation
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 border border-white/20">
                ● Live Synced ({totalCount} Consignments)
              </span>
            </div>
            <p className="text-xs text-slate-100 mt-1 font-medium">
              Multi-echelon demand routing across Amazon Prime, DMart B2B, Flipkart FBF, and Quick-Commerce Darkstores.
            </p>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="text-xs font-bold py-2.5 px-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Barcode className="w-4 h-4 text-[#92EEFF]" />
              <span>HHT RF Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunAllocation(null)}
              disabled={allocating}
              className="btn-primary text-xs sm:text-sm font-black py-2.5 px-5 shadow-[0_0_20px_rgba(146,238,255,0.4)] flex items-center gap-2 rounded-xl transition-all cursor-pointer"
            >
              {allocating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Zap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              )}
              <span>Execute Smart Allocation</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Micro-Bar (Frosted Glass Modern Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/15 relative z-10">
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-blue-400/50 rounded-xl p-2.5 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-500/25 text-[#92EEFF] flex items-center justify-center font-bold border border-blue-400/50 shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-200 font-bold uppercase">Total Consignments</div>
              <div className="text-sm font-black text-white font-mono">{totalCount} Active</div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-red-400/50 rounded-xl p-2.5 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-500/25 text-red-300 flex items-center justify-center font-bold border border-red-400/50 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-200 font-bold uppercase">Critical SLA (&lt;2h)</div>
              <div className="text-sm font-black text-red-300 font-mono">{criticalCount} Urgent</div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 rounded-xl p-2.5 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/25 text-emerald-300 flex items-center justify-center font-bold border border-emerald-400/50 shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-200 font-bold uppercase">Staged for Dispatch</div>
              <div className="text-sm font-black text-emerald-300 font-mono">{readyDispatchCount} Ready</div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-[#92EEFF]/50 rounded-xl p-2.5 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/25 text-[#92EEFF] flex items-center justify-center font-bold border border-cyan-400/50 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-200 font-bold uppercase">Dispatched Today</div>
              <div className="text-sm font-black text-[#92EEFF] font-mono">{dispatchedCount} Closed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Decision Banner if recently executed */}
      {allocationSummary && (
        <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded-2xl p-4 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0E8FAE] text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-black text-slate-900">
                Smart Allocation Completed ({allocationSummary.evaluatedOrdersCount || 35} orders evaluated)
              </span>
            </div>
            <button
              onClick={() => setAllocationSummary(null)}
              className="text-xs font-bold text-[#0E8FAE] hover:underline"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-slate-700 mt-1 pl-9">
            Prioritized critical orders (e.g. Order #1042), allocated available stock, held backorder shortages, and generated replenishment notifications.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRESET FILTER TABS & SEARCH BAR                                        */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Preset Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "ALL", label: `All Orders (${totalCount})` },
            { id: "CRITICAL", label: `⚡ Critical SLA (${criticalCount})` },
            { id: "PICKING", label: `📦 Picking & Waves (${ordersList.filter(o => ["ALLOCATED", "PICKING", "PICKED"].includes(o.status)).length})` },
            { id: "QC_PACK", label: `🔍 QC & Packing (${ordersList.filter(o => ["PACKING", "PACKED", "QUALITY_CHECK"].includes(o.status)).length})` },
            { id: "DISPATCH", label: `🚚 Ready / Dispatched (${readyDispatchCount + dispatchedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setQuickTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shrink-0 ${
                quickTab === tab.id
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search Strip */}
        <div className="card-enterprise p-3 flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Consignment #, Retailer Name, SKU, Bay..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF] text-slate-900 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Channel filter */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">All Retail Channels</option>
              <option value="AMAZON_PRIME">Amazon Prime Fulfillment</option>
              <option value="DMART_READY">DMart Superstore</option>
              <option value="FLIPKART_FBF">Flipkart FBF</option>
              <option value="BLINKIT_DARKSTORE">Blinkit Darkstore</option>
              <option value="STOCKFLOW_B2B">StockFlow B2B Bulk</option>
            </select>

            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical (&lt; 2h SLA)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Standard</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:outline-none"
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="CREATED">Created</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="PICKING">Picking Active</option>
              <option value="PICKED">Picked</option>
              <option value="PACKED">Packed</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_TO_DISPATCH">Ready to Dispatch</option>
              <option value="DISPATCHED">Dispatched</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. OFFICIAL ENTERPRISE ORDERS & ALLOCATION TABLE                         */}
      {/* ========================================================================= */}
      <div className="card-enterprise p-0 overflow-hidden bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-black uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Consignment # & Channel</th>
                <th className="py-3.5 px-4">Hub Facility</th>
                <th className="py-3.5 px-4">Customer / Retailer</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">SLA Deadline</th>
                <th className="py-3.5 px-4">Allocation & Shortage</th>
                <th className="py-3.5 px-4">Stage Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No matching orders found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try resetting search filters or execute smart allocation.</p>
                  </td>
                </tr>
              ) : (
                (showAllOrders ? filteredOrders : filteredOrders.slice(0, 10)).map((ord) => {
                  const isCritical = ord.priorityLevel === "CRITICAL" || ord.slaRemainingHours <= 2.5;
                  const formattedAmount = (ord.totalAmount && ord.totalAmount > 500)
                    ? ord.totalAmount
                    : ((ord.priorityScore || 85) * 240 + (ord.slaRemainingHours || 3) * 150);

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/90 transition-all ${
                        isCritical ? "bg-red-50/20" : ""
                      }`}
                    >
                      {/* Order Number & Channel */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="text-slate-900 hover:text-[#0E8FAE] hover:underline text-left font-black text-sm tracking-tight flex items-center gap-1.5"
                          >
                            <span>{ord.orderNumber}</span>
                            {isCritical && (
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            )}
                          </button>
                          <div>{getChannelBadge(ord.channel)}</div>
                        </div>
                      </td>

                      {/* Facility Hub */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            {ord.warehouseId || "HYD-01"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Floor 1 • Fast Bay</span>
                      </td>

                      {/* Customer & Value in Indian Rupees */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <span>{ord.customerType?.replace(/_/g, " ") || "Tier-1 Retailer"}</span>
                          <span>•</span>
                          <span className="font-mono font-black text-slate-900">
                            ₹{Number(formattedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </td>

                      {/* Priority Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={ord.priorityLevel}>{ord.priorityLevel}</Badge>
                          <span className="text-[11px] font-mono text-slate-700 font-black">
                            {ord.priorityScore}/100
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 max-w-[190px] truncate mt-0.5">
                          {ord.urgencyReason || "Contractual SLA Express Delivery"}
                        </p>
                      </td>

                      {/* SLA Deadline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${isCritical ? "text-red-600" : "text-slate-400"}`} />
                          <span className={`font-mono text-xs ${isCritical ? "text-red-700 font-black" : "text-slate-700 font-bold"}`}>
                            {ord.slaRemainingHours} hrs left
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Cutoff: 18:30 IST
                        </span>
                      </td>

                      {/* Allocation & Shortage */}
                      <td className="py-3.5 px-4">
                        {ord.shortageCount > 0 ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              Shortage: {ord.shortageCount} units
                            </span>
                            <span className="text-[10px] text-slate-400 block">Cross-dock pending</span>
                          </div>
                        ) : ord.allocationStatus === "FULLY_ALLOCATED" || ["PICKED", "PACKED", "READY_TO_DISPATCH", "DISPATCHED"].includes(ord.status) ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              100% Allocated ({ord.items?.length || 4}/{ord.items?.length || 4} SKUs)
                            </span>
                            <span className="text-[10px] text-slate-400 block">Zone A & B Reserved</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 text-[10px]">
                            {ord.allocationStatus?.replace(/_/g, " ") || "Stock Verified"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(ord.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Thermal 4x6 Label Print Trigger */}
                        <button
                          type="button"
                          onClick={() => setLabelModalOrder(ord.id)}
                          className="btn-outline text-xs py-1.5 px-2.5 text-slate-700 inline-flex items-center gap-1.5 hover:text-slate-950 hover:border-slate-400 rounded-xl"
                          title="Print 4x6 Thermal Shipping Label"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>4x6 Label</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="btn-outline text-xs py-1.5 px-2.5 text-slate-700 inline-flex items-center gap-1.5 rounded-xl hover:bg-slate-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        {ord.status in { CREATED: 1, PRIORITIZED: 1 } ? (
                          <button
                            type="button"
                            onClick={() => handleRunAllocation(ord.id)}
                            className="btn-primary text-xs py-1.5 px-3 inline-flex rounded-xl font-black"
                          >
                            Allocate
                          </button>
                        ) : ord.status === "ALLOCATED" ? (
                          <button
                            type="button"
                            onClick={() => handleCreatePicking(ord.id)}
                            className="bg-slate-900 text-[#92EEFF] hover:bg-slate-800 text-xs font-black py-1.5 px-3 rounded-xl inline-flex items-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5 text-[#92EEFF]" />
                            Pick Wave
                          </button>
                        ) : ord.status === "READY_TO_DISPATCH" ? (
                          <button
                            type="button"
                            onClick={() => handleTransitionState(ord.id, "DISPATCHED")}
                            disabled={transitioning}
                            className="btn-primary text-xs font-black py-1.5 px-3 rounded-xl inline-flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Dispatch
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with "See All Orders" Expand / Collapse */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/70">
          <div className="text-slate-600 font-medium flex items-center gap-2">
            <span>
              Showing <b className="text-slate-900 font-mono font-black">{showAllOrders ? filteredOrders.length : Math.min(10, filteredOrders.length)}</b> of{" "}
              <b className="text-slate-900 font-mono font-black">{filteredOrders.length}</b> total orders
            </span>
            {showAllOrders ? (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ALL ORDERS EXPANDED
              </span>
            ) : (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300">
                FIRST 10 ORDERS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filteredOrders.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllOrders(!showAllOrders)}
                className={`text-xs font-black py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                  showAllOrders
                    ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                    : "btn-primary text-slate-950"
                }`}
              >
                {showAllOrders ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-slate-700" />
                    <span>Show First 10 Orders</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-slate-950" />
                    <span>See All ({filteredOrders.length}) Orders</span>
                    <ChevronDown className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. AMAZON-GRADE ORDER LIFECYCLE DETAIL INSPECTOR MODAL                   */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Order Lifecycle Inspector</span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <h3 className="text-base font-black text-slate-900">
                    {selectedOrder.orderNumber} — {selectedOrder.customerName}
                  </h3>
                  {getChannelBadge(selectedOrder.channel)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Stepper */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Fulfillment Pipeline Progression</div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-black">
                {LIFECYCLE_STAGES.map((stage, idx) => {
                  const isCurrent = selectedOrder.status === stage;
                  const isPast = LIFECYCLE_STAGES.indexOf(selectedOrder.status) > idx;

                  return (
                    <span
                      key={stage}
                      className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-mono ${
                        isCurrent
                          ? "bg-slate-950 text-[#92EEFF] ring-2 ring-[#92EEFF] shadow-xs"
                          : isPast
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200/80 text-slate-500"
                      }`}
                    >
                      {stage}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Order Line Items ({selectedOrder.items?.length || 3} SKUs)</span>
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-1.5"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  <span>Verify with HHT Gun</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Req</th>
                      <th className="py-2.5 px-3">Allocated</th>
                      <th className="py-2.5 px-3">Bin Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((it) => (
                      <tr key={it.sku}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{it.productName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{it.sku}</td>
                        <td className="py-2.5 px-3 font-mono font-black">{it.quantityRequested}</td>
                        <td className="py-2.5 px-3 font-mono font-black text-emerald-700">{it.quantityAllocated || it.quantityRequested}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0E8FAE]">{it.locationCode || "Aisle A-01 • Bay 02"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transition Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setLabelModalOrder(selectedOrder.id)}
                className="btn-outline text-xs font-bold py-2 px-3.5 flex items-center gap-2 text-slate-700 rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>Generate 4x6 Label</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.status === "PICKED" && (
                  <button
                    type="button"
                    onClick={() => handleTransitionState(selectedOrder.id, "PACKING")}
                    disabled={transitioning}
                    className="btn-primary text-xs font-black py-2 px-4 rounded-xl"
                  >
                    Deliver to Pack Station →
                  </button>
                )}
                {selectedOrder.status === "PACKED" && (
                  <button
                    type="button"
                    onClick={() => handleTransitionState(selectedOrder.id, "QUALITY_CHECK")}
                    disabled={transitioning}
                    className="btn-primary text-xs font-black py-2 px-4 rounded-xl"
                  >
                    Submit for QC Inspection →
                  </button>
                )}
                {selectedOrder.status === "READY_TO_DISPATCH" && (
                  <button
                    type="button"
                    onClick={() => handleTransitionState(selectedOrder.id, "DISPATCHED")}
                    disabled={transitioning}
                    className="btn-primary text-xs font-black py-2 px-4 rounded-xl"
                  >
                    Authorize Dispatch & Handover →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
