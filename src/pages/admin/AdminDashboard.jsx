import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import { DecisionCard } from "../../components/common/DecisionCard";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  AlertOctagon,
  Truck,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Boxes,
  Activity,
  Flame,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  Gauge,
  Compass,
  ChevronRight,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  Info,
  DollarSign,
  IndianRupee,
  PackageX,
  Scale,
  X,
  FileText,
  HelpCircle,
  Building2,
  Star,
  Award,
  UserCheck,
  Shield
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

export function AdminDashboard() {
  const {
    metrics = null,
    orders = [],
    inventory = [],
    exceptions = [],
    bottlenecks = null,
    decisionLogs = [],
    activityStream = [],
    attentionNeeded = [],
    financials = null,
    dockDoors = [],
    returnsList = [],
    activeHub = null,
    activeScope = "ALL",
    setActiveScope = () => {},
    branchPerformance = [],
    refresh
  } = useRealtimeData() || {};

  const [activeChartTab, setActiveChartTab] = useState("throughput");
  const [selectedTimeRange, setSelectedTimeRange] = useState("Today");
  const [executingAction, setExecutingAction] = useState(null);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState("ALL");
  const [pnlViewMode, setPnlViewMode] = useState("chart");
  const [showPnLModal, setShowPnLModal] = useState(false);
  const navigate = useNavigate();

  const ordersList = Array.isArray(orders) ? orders : [];
  const exceptionsList = Array.isArray(exceptions) ? exceptions : [];
  const inventoryList = Array.isArray(inventory) ? inventory : [];

  // Order lifecycle distribution counts
  const pipelineCounts = useMemo(() => {
    const counts = {
      CREATED: 0,
      PRIORITIZED: 0,
      ALLOCATED: 0,
      PICKING: 0,
      PACKING: 0,
      QUALITY_CHECK: 0,
      DISPATCHED: 0,
    };
    ordersList.forEach((o) => {
      const st = o.status || "CREATED";
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else if (st === "QC_PASSED" || st === "IN_TRANSIT" || st === "COMPLETED") {
        counts.DISPATCHED += 1;
      } else if (st === "READY_FOR_PICKING" || st === "WAVE_PLANNED") {
        counts.ALLOCATED += 1;
      }
    });
    return counts;
  }, [ordersList]);

  const criticalOrders = ordersList.filter(
    (o) => o.priorityLevel === "CRITICAL" && !["DISPATCHED", "COMPLETED"].includes(o.status)
  );
  const openExceptions = exceptionsList.filter((e) => e.status === "OPEN");

  // Dynamic Financial Calculations with Indian Rupee formatting (Amazon Supply Chain Model)
  const finMetrics = useMemo(() => {
    const rawRev = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const rev = rawRev > 10000 ? rawRev : (financials?.kpis?.totalRevenue || 184250);
    const inventoryCost = Math.round(rev * 0.62) || 114235;
    const freightCost = Math.round(rev * 0.10) || 18425;
    const laborCost = Math.round(rev * 0.06) || 11055;
    const loss = financials?.kpis?.totalLoss || 3315;
    const profit = Math.round(rev - inventoryCost - freightCost - laborCost) || 37220;
    const margin = rev > 0 ? Number(((profit / rev) * 100).toFixed(1)) : 20.2;
    const netImpact = Math.round(profit - loss) || 33905;
    const dispatchedCount = metrics?.ordersDispatched || 19;
    const avgOrderVal = dispatchedCount > 0 ? (rev / dispatchedCount).toFixed(2) : "9697.35";
    const profitPerOrder = dispatchedCount > 0 ? (profit / dispatchedCount).toFixed(2) : "1958.95";

    const pnlChartData = [
      { name: "Revenue", amount: rev, label: `+₹${rev.toLocaleString()}`, fill: "#0E8FAE" },
      { name: "Inventory COGS", amount: inventoryCost, label: `-₹${inventoryCost.toLocaleString()}`, fill: "#EF4444" },
      { name: "Courier Freight", amount: freightCost, label: `-₹${freightCost.toLocaleString()}`, fill: "#F59E0B" },
      { name: "Floor Labor", amount: laborCost, label: `-₹${laborCost.toLocaleString()}`, fill: "#6366F1" },
      { name: "Losses", amount: loss, label: `-₹${loss.toLocaleString()}`, fill: "#DC2626" },
      { name: "Net Profit", amount: profit, label: `+₹${profit.toLocaleString()}`, fill: "#10B981" }
    ];

    const lossChartData = [
      { name: "Returns & Restock", value: 1250, color: "#EF4444", incidents: 4, label: "₹1,250" },
      { name: "Damaged Scrap", value: 980, color: "#F97316", incidents: 3, label: "₹980" },
      { name: "Picking Latency", value: 620, color: "#F59E0B", incidents: 8, label: "₹620" },
      { name: "Cycle Variance", value: 320, color: "#64748B", incidents: 2, label: "₹320" },
      { name: "Other Exceptions", value: 145, color: "#94A3B8", incidents: 2, label: "₹145" }
    ];

    return {
      revenueToday: rev,
      estimatedProfit: profit,
      profitMargin: margin,
      operationalLoss: loss,
      netBusinessImpact: netImpact,
      dispatchedCount,
      avgOrderVal,
      profitPerOrder,
      inventoryCost,
      operationalCost: freightCost + laborCost,
      exceptionCost: loss,
      pnlChartData,
      lossChartData
    };
  }, [financials, ordersList, metrics]);

  // Hourly Multi-Floor Fulfillment Velocity Wave (Line & Area Graph)
  const hourlyThroughputWave = [
    { time: "06:00", ordersInflow: 18, picksDone: 14, dispatched: 12, velocity: 14.2 },
    { time: "08:00", ordersInflow: 42, picksDone: 38, dispatched: 35, velocity: 16.8 },
    { time: "10:00", ordersInflow: 68, picksDone: 64, dispatched: 59, velocity: 19.4 },
    { time: "12:00", ordersInflow: 85, picksDone: 80, dispatched: 76, velocity: 21.2 },
    { time: "14:00", ordersInflow: 72, picksDone: 69, dispatched: 66, velocity: 18.6 },
    { time: "16:00", ordersInflow: 94, picksDone: 89, dispatched: 84, velocity: 22.8 },
    { time: "18:00 (Live)", ordersInflow: 108, picksDone: 104, dispatched: 98, velocity: 18.4 },
  ];

  const throughputData = [
    { hour: "06:00", orders: 18, target: 15, pickLatency: 14.2 },
    { hour: "08:00", orders: 42, target: 35, pickLatency: 13.5 },
    { hour: "10:00", orders: 68, target: 60, pickLatency: 12.1 },
    { hour: "12:00", orders: 85, target: 75, pickLatency: 11.2 },
    { hour: "14:00", orders: 72, target: 65, pickLatency: 10.8 },
    { hour: "16:00", orders: 94, target: 85, pickLatency: 9.9 },
    { hour: "18:00 (Live)", orders: metrics?.ordersDispatched || 108, target: 95, pickLatency: metrics?.avgFulfillmentMinutes || 10.5 },
  ];

  // Storage Utilization & Cold Chain Gauges
  const storageUtilizationGauges = [
    { name: "Ambient High-Bay Racks", percent: 82, current: "4,100", total: "5,000 pallets", color: "#0E8FAE" },
    { name: "Mezzanine Fast-Pick Bins", percent: 74, current: "14,800", total: "20,000 bins", color: "#38D2F3" },
    { name: "Cold Storage Reefer (3.6°C)", percent: 64, current: "1,280", total: "2,000 crates", color: "#06B6D4" },
    { name: "Dock Inbound / Outbound Staging", percent: 88, current: "22", total: "25 active bays", color: "#F59E0B" },
  ];

  // Verified Floor Operators & Performance Reviews Leaderboard
  const operatorLeaderboard = [
    {
      name: "Super Admin",
      email: "admin@gmail.com",
      role: "Super Admin & Control Lead",
      avatar: "SA",
      shift: "Shift 1 (06:00 - 14:00)",
      wavesSupervised: 142,
      pickAccuracy: "99.8%",
      qcPassRate: "99.9%",
      rating: 4.98,
      reviewsCount: 38,
      status: "ONLINE",
      station: "HQ Control Tower",
      badge: "Master Lead",
      recentFeedback: "Flawless wave prioritization during Tier-1 Metro Hypermarket rush."
    },
    {
      name: "Ooha",
      email: "ooha@gmail.com",
      role: "Operations Manager",
      avatar: "OO",
      shift: "Shift 1 (06:00 - 14:00)",
      wavesSupervised: 118,
      pickAccuracy: "99.4%",
      qcPassRate: "99.6%",
      rating: 4.95,
      reviewsCount: 29,
      status: "ONLINE",
      station: "Floor A & B Ops",
      badge: "Operations Lead",
      recentFeedback: "Resolved Zone B pick congestion within 4.2 minutes."
    },
    {
      name: "David Miller",
      email: "david.m@stockflow.internal",
      role: "Senior Wave Picker",
      avatar: "DM",
      shift: "Shift 2 (14:00 - 22:00)",
      wavesSupervised: 86,
      pickAccuracy: "99.1%",
      qcPassRate: "98.8%",
      rating: 4.90,
      reviewsCount: 22,
      status: "ACTIVE_PICKING",
      station: "Zone B (Aisle B-03)",
      badge: "TSP Router #03",
      recentFeedback: "Optimal S-shape travel compliance; zero damaged handling."
    },
    {
      name: "Anjali Rao",
      email: "anjali.r@stockflow.internal",
      role: "Quality & Scale Inspector",
      avatar: "AR",
      shift: "Shift 1 (06:00 - 14:00)",
      wavesSupervised: 94,
      pickAccuracy: "99.9%",
      qcPassRate: "100%",
      rating: 4.96,
      reviewsCount: 31,
      status: "ONLINE",
      station: "Pack Station #01",
      badge: "6-Point QC",
      recentFeedback: "Detected leaking cap seal anomaly before staging."
    }
  ];

  // Chart Dataset 2: Zone Workloads & Cycle Times
  const zoneAnalyticsData = [
    { zone: "Zone A", name: "Personal Care", activeTasks: 16, avgMin: 10.8, capacity: 25, status: "OPTIMAL", financialImpact: "+₹2,63,220", latencyImpact: "0 min delay" },
    { zone: "Zone B", name: "Detergents", activeTasks: 32, avgMin: 16.4, capacity: 30, status: "BOTTLENECK", financialImpact: "-₹11,890/day", latencyImpact: "+46% latency" },
    { zone: "Zone C", name: "Foods & Snacks", activeTasks: 21, avgMin: 11.5, capacity: 25, status: "OPTIMAL", financialImpact: "+₹2,00,900", latencyImpact: "0 min delay" },
    { zone: "Zone D", name: "Beverages", activeTasks: 12, avgMin: 12.0, capacity: 20, status: "OPTIMAL", financialImpact: "-₹22,960 (damage)", latencyImpact: "0 min delay" },
  ];

  // Chart Dataset 3: Stock Health Distribution
  const stockHealthData = [
    { category: "Optimal Stock", count: 38, fill: "#10B981" },
    { category: "Moderate / Buffer", count: 9, fill: "#0E8FAE" },
    { category: "Low Stock Alert", count: 4, fill: "#F59E0B" },
    { category: "Critical Stockout", count: 2, fill: "#EF4444" },
  ];

  // Chart Dataset 4: Category Value Breakdown
  const categoryValueData = [
    { name: "Personal Care", value: 8940, color: "#92EEFF" },
    { name: "Detergents & Cleaners", value: 7620, color: "#38D2F3" },
    { name: "Foods & Snacks", value: 6810, color: "#0E8FAE" },
    { name: "Beverages & Bulk", value: 3801, color: "#1E293B" },
  ];

  // Fast moving SKUs leaderboard
  const topVelocitySkus = [
    { sku: "SKU-SHMP-001", name: "Dove Deep Moisture Shampoo", category: "Personal Care", velocity: 42, available: 7, required: 25, status: "CRITICAL" },
    { sku: "SKU-DET-002", name: "Ariel Complete Liquid Detergent", category: "Detergents", velocity: 35, available: 120, required: 80, status: "OPTIMAL" },
    { sku: "SKU-FOOD-005", name: "Lay's Classic Family Pack", category: "Foods", velocity: 28, available: 85, required: 40, status: "OPTIMAL" },
    { sku: "SKU-ORAL-003", name: "Colgate Total Active Toothpaste", category: "Personal Care", velocity: 24, available: 45, required: 30, status: "MODERATE" },
    { sku: "SKU-BEV-001", name: "Tropicana 100% Pure Orange Juice", category: "Beverages", velocity: 20, available: 15, required: 25, status: "LOW_STOCK" },
  ];

  // Quick attention handler
  const handleAttentionAction = async (item) => {
    setExecutingAction(item.id);
    try {
      if (item.actionType === "REPLENISH") {
        navigate(`/inventory?q=${encodeURIComponent(item.targetId || "SKU-")}`);
      } else if (item.actionType === "EXPEDITE_SLA") {
        navigate(`/orders?priority=CRITICAL`);
      } else if (item.actionType === "ADJUST_COUNT") {
        navigate("/exceptions");
      } else if (item.actionType === "REBALANCE_WORKLOAD") {
        await api.rebalanceWorkload({ overloadedWorkerId: "wrk-01", targetWorkerId: "wrk-03", tasksCount: 8 });
        await refresh();
      } else {
        navigate("/orders");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingAction(null);
    }
  };

  // Structured default signals if attentionNeeded is empty
  const defaultSignals = [
    {
      id: "sig-01",
      severity: "CRITICAL",
      title: "SKU-SHMP-001 — Stockout Risk",
      problem: "Stockout predicted in 0.1 days",
      impact: "7 units available • 25 units required",
      actionLabel: "Replenish PO",
      actionType: "REPLENISH",
      targetId: "SKU-SHMP-001"
    },
    {
      id: "sig-02",
      severity: "CRITICAL",
      title: "SKU-DETO-001 — Stockout Risk",
      problem: "Stockout predicted in 0.2 days",
      impact: "5 units available • 18 units required",
      actionLabel: "Replenish PO",
      actionType: "REPLENISH",
      targetId: "SKU-DETO-001"
    },
    {
      id: "sig-03",
      severity: "HIGH",
      title: "SKU-SOAP-002 — Discrepancy",
      problem: "System: 100 vs Physical: 92 in Bin B-03",
      impact: "8 units unaccounted • Cycle count required",
      actionLabel: "Investigate & Adjust",
      actionType: "ADJUST_COUNT",
      targetId: "SKU-SOAP-002"
    },
    {
      id: "sig-04",
      severity: "MEDIUM",
      title: "Worker Overload — Marcus Vance",
      problem: "18 active tasks (exceeds threshold)",
      impact: "Recommend transferring 8 waves to David Miller",
      actionLabel: "Rebalance Shift",
      actionType: "REBALANCE_WORKLOAD",
      targetId: "wrk-01"
    }
  ];

  const displaySignals = attentionNeeded.length > 0
    ? attentionNeeded.map((item) => ({
      id: item.id,
      severity: item.severity || "HIGH",
      title: item.title,
      problem: item.title.includes("—") ? item.title.split("—")[1]?.trim() : item.title,
      impact: item.subtitle,
      actionLabel: item.actionLabel || "Resolve",
      actionType: item.actionType || "VIEW",
      targetId: item.targetId
    }))
    : defaultSignals;

  // Real-time activity sample formatting
  const formattedActivity = useMemo(() => {
    if (activityStream && activityStream.length > 0) {
      return activityStream.slice(0, 6).map((item, idx) => {
        let eventType = "SYSTEM";
        let source = "Autonomous Engine";
        let entity = item.entity || "Floor Unit";
        const msg = item.message || item.text || item.title || "";

        if (msg.toLowerCase().includes("allocated") || msg.toLowerCase().includes("inventory") || msg.toLowerCase().includes("stock")) {
          eventType = "INVENTORY";
          source = "Smart Allocation";
        } else if (msg.toLowerCase().includes("pick") || msg.toLowerCase().includes("wave")) {
          eventType = "PICKING";
          source = "TSP Router";
        } else if (msg.toLowerCase().includes("priority") || msg.toLowerCase().includes("score") || msg.toLowerCase().includes("decision")) {
          eventType = "DECISION ENGINE";
          source = "Deterministic Engine";
        } else if (msg.toLowerCase().includes("qc") || msg.toLowerCase().includes("pack")) {
          eventType = "PACKING & QC";
          source = "QC Station #02";
        } else if (msg.toLowerCase().includes("dispatch") || msg.toLowerCase().includes("carrier") || msg.toLowerCase().includes("fedex")) {
          eventType = "DISPATCH";
          source = "Dock Bay #04";
        } else if (msg.toLowerCase().includes("bottleneck") || msg.toLowerCase().includes("latency") || msg.toLowerCase().includes("overload")) {
          eventType = "OPERATIONS";
          source = "Telemetry Monitor";
        } else if (msg.toLowerCase().includes("loss") || msg.toLowerCase().includes("profit") || msg.toLowerCase().includes("margin") || msg.toLowerCase().includes("revenue")) {
          eventType = "FINANCE";
          source = "Profit Intelligence";
        }

        return {
          id: item.id || `act-${idx}`,
          timestamp: item.timestamp ? (String(item.timestamp).includes(":") ? item.timestamp : new Date(item.timestamp).toLocaleTimeString()) : "12:48:07",
          eventType,
          description: msg,
          entity: entity,
          source: source,
          severity: item.severity || "INFO"
        };
      });
    }

    return [
      {
        id: "act-1",
        timestamp: "12:48:07",
        eventType: "INVENTORY",
        description: "Smart Allocation allocated 7 units to critical Order #1042",
        entity: "Order #1042",
        source: "Smart Allocation",
        severity: "SUCCESS"
      },
      {
        id: "act-2",
        timestamp: "12:47:59",
        eventType: "PICKING",
        description: "Picker Marcus Vance started Wave Pick #W-1042 (TSP Route: 11 min)",
        entity: "Wave #W-1042",
        source: "Picker Marcus Vance",
        severity: "INFO"
      },
      {
        id: "act-3",
        timestamp: "12:47:40",
        eventType: "DECISION ENGINE",
        description: "Deterministic Priority Engine scored Order #1042 at 95/100 (CRITICAL SLA)",
        entity: "Order #1042",
        source: "Priority Engine",
        severity: "CRITICAL"
      },
      {
        id: "act-4",
        timestamp: "12:45:12",
        eventType: "DISPATCH",
        description: "Order #1042 handed over to FedEx Priority Freight",
        entity: "Tracking #TRK-FEDEX-92",
        source: "Dock Bay #04",
        severity: "SUCCESS"
      },
      {
        id: "act-5",
        timestamp: "12:42:30",
        eventType: "EXCEPTION",
        description: "Zone B picking latency detected (+48% above benchmark). -₹145 cost drag",
        entity: "Zone B",
        source: "Telemetry Monitor",
        severity: "WARNING"
      },
      {
        id: "act-6",
        timestamp: "12:40:15",
        eventType: "FINANCE",
        description: "Estimated operational profit updated: ₹5,870 (Net Margin 31.9%)",
        entity: "Profit Engine",
        source: "Profit Intelligence",
        severity: "SUCCESS"
      }
    ];
  }, [activityStream]);

  // Business Impact Insights Data
  const businessInsights = [
    {
      id: "ins-01",
      badge: "HIGH-VALUE ORDER",
      title: "Order #1042 Margin Protection",
      situation: "Tier-1 Metro Hypermarket order (₹2,05,000 value) in Green Corridor.",
      financialImpact: "+₹74,620 Estimated Net Contribution (36.4% Margin)",
      recommendedAction: "Prioritize Dock Bay #04 loading to guarantee contractual on-time fulfillment bonus.",
      severity: "SUCCESS"
    },
    {
      id: "ins-02",
      badge: "COST RISK",
      title: "Zone B Picking Bottleneck",
      situation: "Congestion creating 16.4 min/wave delay across 8 active picking batches.",
      financialImpact: "-₹11,890/day in excess picker idle and overtime cost",
      recommendedAction: "Execute autonomous rebalance to shift 8 picking waves to Worker #03 (David Miller).",
      severity: "WARNING"
    },
    {
      id: "ins-03",
      badge: "LOSS RISK",
      title: "Damaged Inventory Write-off",
      situation: "5 units of Nescafe Coffee damaged during pallet transit in Aisle D-01.",
      financialImpact: "-₹22,960 in unrecoverable inventory write-off",
      recommendedAction: "Quarantine damaged lots and initiate supplier return credit note #CR-902.",
      severity: "CRITICAL"
    },
    {
      id: "ins-04",
      badge: "MARGIN OPPORTUNITY",
      title: "Tier-1 Retailer Optimization",
      situation: "Orders from Metro Hypermarket generate 36.4% margins vs 28.2% baseline wholesale.",
      financialImpact: "+₹1,50,880/week incremental margin capture potential",
      recommendedAction: "Maintain buffer allocation threshold for high-velocity SKUs (Dove, Ariel).",
      severity: "INFO"
    }
  ];

  // Loss categories data
  const lossItems = [
    { category: "Damaged Inventory", loss: 22960, incidents: 5, location: "Zone D (Aisle D-01)", icon: PackageX, color: "text-red-600" },
    { category: "Picking Delay", loss: 11890, incidents: 8, location: "Zone B Bottleneck", icon: AlertTriangle, color: "text-amber-600", isTopDriver: true },
    { category: "Inventory Mismatch", loss: 9840, incidents: 3, location: "Bin B-03", icon: Scale, color: "text-slate-700" },
    { category: "Returns", loss: 26240, incidents: 4, location: "Dock Bay 01", icon: RotateCcw, color: "text-red-500" },
    { category: "Other Exceptions", loss: 5330, incidents: 2, location: "QC Station #02", icon: AlertOctagon, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-4 w-full pb-10">
      {/* ========================================================================= */}
      {/* 1. TOP COMMAND CENTER HERO                                                */}
      {/* ========================================================================= */}
      <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0E8FAE]/40 via-[#0A2E50] to-[#041628] rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-[#38D2F3]/40 relative overflow-hidden">
        {/* Luminous Sky Blue & Sapphire Glow Highlights */}
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-gradient-to-bl from-[#92EEFF]/30 via-[#38D2F3]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-gradient-to-tr from-[#1D4ED8]/25 via-[#0E8FAE]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Stock<span className="text-[#92EEFF] drop-shadow-[0_0_12px_rgba(146,238,255,0.5)]">Flow</span></span>
                <span className="text-[#92EEFF]/50 font-normal">/</span>
                <span className="text-white font-black">Command Center</span>
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#92EEFF]/20 text-[#92EEFF] border border-[#92EEFF]/50 shadow-[0_0_12px_rgba(146,238,255,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#92EEFF] animate-ping" />
                <span>LIVE SYNCED</span>
              </div>
              <span className="text-[11px] text-white font-mono font-bold bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20">
                HYD-01 Central Network
              </span>
            </div>
            <p className="text-xs text-slate-100 mt-1 font-medium">
              Enterprise Warehouse Operations & Multi-Hub Fulfillment Intelligence
            </p>
          </div>

          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/15 shrink-0 shadow-xs">
            {["Today", "Shift 1", "Shift 2", "24h Live"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTimeRange(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedTimeRange === tab
                  ? "bg-[#92EEFF] text-slate-950 shadow-[0_0_15px_rgba(146,238,255,0.4)] font-black"
                  : "text-slate-200 hover:text-white"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Headline Metrics Ribbon (Frosted Glass Modern Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/15 relative z-10">
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-[#92EEFF]/50 rounded-xl p-3 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#92EEFF]/25 text-[#92EEFF] flex items-center justify-center shrink-0 border border-[#92EEFF]/50 shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Orders Today</div>
              <div className="text-lg font-black text-white font-mono leading-tight">
                {metrics?.ordersDispatched || ordersList.length || 19}
              </div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 rounded-xl p-3 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/25 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/50 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">Fulfillment Velocity</div>
              <div className="text-lg font-black text-emerald-300 font-mono leading-tight">
                18.4 <span className="text-[10px] font-sans font-medium text-emerald-200">u/min</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-[#92EEFF]/50 rounded-xl p-3 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/25 text-[#92EEFF] flex items-center justify-center shrink-0 border border-cyan-400/50 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">QC First-Pass Yield</div>
              <div className="text-lg font-black text-[#92EEFF] font-mono leading-tight">
                {metrics?.qcPassRate || 97.8}%
              </div>
            </div>
          </div>

          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-amber-400/50 rounded-xl p-3 flex items-center gap-3 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/25 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/50 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-200 font-bold uppercase tracking-wider">At-Risk SLA Orders</div>
              <div className="text-lg font-black text-amber-300 font-mono leading-tight">
                {metrics?.atRiskOrders || criticalOrders.length || 9} <span className="text-[10px] font-sans font-medium text-amber-200">Urgent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE OPERATIONS SNAPSHOT                                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              EXECUTIVE SNAPSHOT
            </span>
            <span className="text-xs font-bold text-slate-700 hidden lg:inline">Operations Summary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 w-full sm:w-auto text-xs divide-x-0 sm:divide-x divide-slate-100">
            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Orders Processed</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {metrics?.totalOrders || ordersList.length || 19}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Orders Dispatched</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {metrics?.ordersDispatched || 19}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Open Exceptions</span>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {openExceptions.length || 9}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Critical SLA</span>
              <span className="font-mono font-bold text-red-600 text-sm">
                {criticalOrders.length || metrics?.atRiskOrders || 9}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Warehouse Util</span>
              <span className="font-mono font-bold text-[#0E8FAE] text-sm">
                {metrics?.warehouseUtilization || "78.4%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BUSINESS IMPACT & MARGIN INTELLIGENCE BAR                              */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#031B33] via-[#0A365C] to-[#0A4166] rounded-xl p-3.5 text-white border border-[#0E8FAE]/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#92EEFF]/20 text-[#92EEFF] flex items-center justify-center font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider text-white uppercase">Business Impact</span>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE ROI
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Warehouse financial conversion & margin intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-5 w-full sm:w-auto text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Revenue Today</span>
            <span className="font-mono font-black text-white text-sm">
              ₹{Number(finMetrics.revenueToday || 184250).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Profit</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              ₹{Number(finMetrics.estimatedProfit || 37220).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Profit Margin</span>
            <span className="font-mono font-black text-[#92EEFF] text-sm">
              {finMetrics.profitMargin || 20.2}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Operational Loss</span>
            <span className="font-mono font-black text-red-400 text-sm">
              -₹{Number(finMetrics.operationalLoss || 3315).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Net Business Impact</span>
            <span className="font-mono font-black text-emerald-300 text-sm">
              +₹{Number(finMetrics.netBusinessImpact || 33905).toLocaleString()}
            </span>
          </div>
        </div>

        <Link
          to="/finance"
          className="text-[11px] font-bold text-[#92EEFF] hover:underline flex items-center gap-1 shrink-0 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all"
        >
          <span>View Profit Intelligence</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 4 & 5. PROFIT & LOSS GRAPH + LOSS INTELLIGENCE DONUT                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Profit & Loss Snapshot Panel with Waterfall Graph (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] border border-[#92EEFF] text-[#0E8FAE] flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                  Profit & Loss Financial Flow
                </h3>
                <p className="text-[11px] text-slate-500">Gross revenue conversion to net operating profit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setPnlViewMode("chart")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${pnlViewMode === "chart" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  Bar Graph
                </button>
                <button
                  type="button"
                  onClick={() => setPnlViewMode("ledger")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${pnlViewMode === "ledger" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  P&L Ledger
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPnLModal(true)}
                className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-0.5"
              >
                <span>Full P&L</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {pnlViewMode === "chart" ? (
            <div className="space-y-3">
              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={finMetrics.pnlChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", fontSize: "12px", border: "1px solid #334155", padding: "8px 12px" }}
                      formatter={(val, name, item) => [`₹${Number(val).toLocaleString()}`, item.payload.name]}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={38}>
                      {finMetrics.pnlChartData.map((entry, index) => (
                        <Cell key={`pnl-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs bg-[#E5FAFE] border border-[#92EEFF] rounded-xl p-2.5 font-mono">
                <span className="font-sans text-slate-900 font-bold">Estimated Net Profit ({finMetrics.profitMargin}% Margin):</span>
                <span className="text-emerald-700 font-black text-sm">+₹{finMetrics.estimatedProfit.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-semibold font-sans">Gross Revenue (GMV)</span>
                <span className="font-bold text-slate-900">+₹{finMetrics.revenueToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-sans">− Product / Landed Inventory Cost</span>
                <span className="text-red-600">-₹{finMetrics.inventoryCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-sans">− Operational Cost (Freight & Labor)</span>
                <span className="text-amber-600">-₹{finMetrics.operationalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-sans">− Exception / Damage Loss</span>
                <span className="text-red-600">-₹{finMetrics.exceptionCost.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-xs font-black bg-[#E5FAFE] p-2 rounded-lg border border-[#92EEFF]">
                <span className="font-sans text-slate-900">Estimated Net Profit ({finMetrics.profitMargin}% Margin)</span>
                <span className="text-emerald-700">+₹{finMetrics.estimatedProfit.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Loss Intelligence with Donut Pie Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold">
                <PackageX className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                  Loss Intelligence & Active Leakage
                </h3>
                <p className="text-[11px] text-slate-500">Damages, cycle mismatches, and picking latency losses</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              Total: -₹{Number(finMetrics.operationalLoss).toLocaleString()}
            </span>
          </div>

          {/* Top Loss Driver Callout */}
          <div className="bg-red-50/80 border border-red-200 rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <div className="text-[10px] text-red-700 font-black uppercase tracking-wider">Top Loss Driver</div>
                <div className="font-black text-slate-900 text-xs">
                  Returns & Restock Grading • <span className="text-red-700 font-mono font-bold">-₹1,250 (4 incidents)</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="btn-primary text-xs font-bold py-1 px-3"
            >
              Investigate →
            </button>
          </div>

          {/* Side-by-Side Loss Donut Chart & Category Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
            <div className="sm:col-span-5 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finMetrics.lossChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {finMetrics.lossChartData.map((entry, index) => (
                      <Cell key={`loss-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", fontSize: "12px", border: "1px solid #334155", padding: "8px 12px" }}
                    formatter={(val, name, item) => [`₹${val} (${item.payload.incidents} incidents)`, item.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="sm:col-span-7 space-y-1.5 text-xs">
              {finMetrics.lossChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{item.incidents} inc</span>
                    <span className="font-mono font-bold text-red-600 text-xs">-₹{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5B. 24-HOUR FULFILLMENT VELOCITY WAVE (AREA & LINE GRAPH) + STORAGE GAUGES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 24-Hour Velocity & Order Wave Spline Graph (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-[#0E8FAE] flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                    Fulfillment Velocity Wave & Throughput
                  </h3>
                  <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    98.4% SLA
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Hourly demand inflow vs wave picks completed vs carrier dispatches</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-cyan-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E8FAE]" />
                Inflow Orders
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Dispatched
              </span>
            </div>
          </div>

          <div className="h-52 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyThroughputWave} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E8FAE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0E8FAE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="dispatchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} fontStyle="bold" tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", fontSize: "12px", border: "1px solid #334155", padding: "8px 12px" }}
                />
                <Area type="monotone" dataKey="ordersInflow" name="Inflow Orders" stroke="#0E8FAE" strokeWidth={2.5} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="dispatched" name="Dispatched" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#dispatchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Peak Velocity</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">22.8 u/min</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Takt Time</div>
              <div className="text-sm font-black text-[#0E8FAE] mt-0.5">42s / Unit</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Wave SLA On-Time</div>
              <div className="text-sm font-black text-emerald-600 mt-0.5">98.4%</div>
            </div>
          </div>
        </div>

        {/* Right: Storage Capacity & Cold Chain Multi-Zone Gauges (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                  Multi-Zone Storage Capacity
                </h3>
                <p className="text-[11px] text-slate-500">Utilization across pallet racks & cold reefers</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">
              78.4% Net Util
            </span>
          </div>

          <div className="space-y-3 flex-1 justify-center flex flex-col">
            {storageUtilizationGauges.map((gauge) => (
              <div key={gauge.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{gauge.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">{gauge.current} / {gauge.total}</span>
                    <span className="font-mono font-black text-slate-900">{gauge.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${gauge.percent}%`, backgroundColor: gauge.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded-xl p-2.5 text-xs text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0E8FAE]" />
              <span className="font-bold">Cold Chain Telemetry:</span>
            </div>
            <span className="font-mono font-bold text-[#0E8FAE]">3.6°C Optimal (Chambers 1-4)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5C. VERIFIED FLOOR STAFF PROFILES & OPERATOR PERFORMANCE REVIEWS          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">
                  Floor Operator Profiles & Performance Scorecards
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-900 text-white font-mono">
                  Live Shift 1 & 2
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Verified shift operators, audit accuracy ratings, and real-time reviews</p>
            </div>
          </div>

          <Link
            to="/users"
            className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-1"
          >
            <span>Manage All Team Profiles</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {operatorLeaderboard.map((op) => (
            <div
              key={op.email}
              className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Operator Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {op.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{op.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px] font-mono">
                        {op.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {op.badge}
                  </span>
                </div>

                {/* Scorecard KPIs */}
                <div className="grid grid-cols-3 gap-1 bg-white p-2 rounded-xl border border-slate-200/80 text-center">
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">Waves</div>
                    <div className="text-xs font-black text-slate-900 font-mono mt-0.5">{op.wavesSupervised}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">Accuracy</div>
                    <div className="text-xs font-black text-emerald-600 font-mono mt-0.5">{op.pickAccuracy}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">QC Pass</div>
                    <div className="text-xs font-black text-cyan-600 font-mono mt-0.5">{op.qcPassRate}</div>
                  </div>
                </div>

                {/* Review Rating */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-slate-900 text-xs">{op.rating}</span>
                    <span className="text-[10px] text-slate-400">({op.reviewsCount} reviews)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{op.station}</span>
                </div>

                {/* Recent Operational Feedback */}
                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                  "{op.recentFeedback}"
                </p>
              </div>

              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span>{op.shift.split("(")[0]}</span>
                <span className="font-bold text-[#0E8FAE]">{op.role.split("&")[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BUSINESS IMPACT INSIGHTS                                               */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0E8FAE]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Business Impact Insights & Action Recommendations
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-bold">
            Autonomous Decision & Margin Impact
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {businessInsights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {ins.badge}
                  </span>
                  <Badge variant={ins.severity === "CRITICAL" ? "critical" : ins.severity === "WARNING" ? "warning" : "success"}>
                    {ins.severity}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{ins.title}</h4>
                <p className="text-[11px] text-slate-600 leading-tight">{ins.situation}</p>
                <div className="bg-[#E5FAFE] border border-[#92EEFF]/60 rounded p-1.5 text-[11px] font-bold text-slate-900 font-mono">
                  {ins.financialImpact}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Action: </span>
                {ins.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. ACTION REQUIRED • OPERATIONAL TELEMETRY SIGNALS                        */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Action Required • Priority Alert Signals
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-bold">
            {displaySignals.length} Active Operational Triggers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displaySignals.map((item) => {
            const isCritical = item.severity === "CRITICAL";
            const isHigh = item.severity === "HIGH";

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-3.5 border transition-all hover:shadow-md flex flex-col justify-between ${isCritical
                  ? "border-red-200 bg-red-50/15 border-l-4 border-l-red-500"
                  : isHigh
                    ? "border-amber-200 bg-amber-50/15 border-l-4 border-l-amber-500"
                    : "border-slate-200 bg-slate-50/20 border-l-4 border-l-[#0E8FAE]"
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0 ${isCritical
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : isHigh
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-700">
                      {item.problem}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono bg-white/80 p-1.5 rounded border border-slate-200/60 leading-tight">
                      {item.impact}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-1 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">Telemetry Signal</span>
                  <button
                    type="button"
                    onClick={() => handleAttentionAction(item)}
                    disabled={executingAction === item.id}
                    className={`text-[11px] font-bold py-1 px-2.5 rounded-lg inline-flex items-center gap-1 transition-all ${isCritical
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-xs"
                      : "bg-[#92EEFF] hover:bg-[#70E5FB] text-slate-950 shadow-xs"
                      }`}
                  >
                    <span>{executingAction === item.id ? "Processing..." : item.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. ORDER FULFILLMENT LIFECYCLE HORIZONTAL PIPELINE                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#92EEFF]/30 text-[#0E8FAE] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Order Fulfillment Lifecycle Pipeline
              </h3>
              <p className="text-[11px] text-slate-400">Live order progression and accumulation across warehouse stages</p>
            </div>
          </div>

          <Link to="/orders" className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-1">
            <span>View All {ordersList.length} Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Pipeline Sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { stage: "CREATED", label: "1. CREATED", count: pipelineCounts.CREATED, color: "border-slate-300 bg-slate-50/80 text-slate-800" },
            { stage: "PRIORITIZED", label: "2. PRIORITIZED", count: pipelineCounts.PRIORITIZED, color: "border-purple-200 bg-purple-50/70 text-purple-900" },
            { stage: "ALLOCATED", label: "3. ALLOCATED", count: pipelineCounts.ALLOCATED, color: "border-blue-200 bg-blue-50/70 text-blue-900" },
            { stage: "PICKING", label: "4. PICKING", count: pipelineCounts.PICKING, color: "border-amber-200 bg-amber-50/70 text-amber-900", isBottleneck: true },
            { stage: "PACKING", label: "5. PACKING", count: pipelineCounts.PACKING, color: "border-orange-200 bg-orange-50/70 text-orange-900" },
            { stage: "QUALITY_CHECK", label: "6. QC PASS", count: pipelineCounts.QUALITY_CHECK, color: "border-cyan-200 bg-cyan-50/70 text-cyan-900" },
            { stage: "DISPATCHED", label: "7. DISPATCHED", count: pipelineCounts.DISPATCHED, color: "border-emerald-200 bg-emerald-50/70 text-emerald-900" },
          ].map((item, idx) => {
            const isSelected = selectedPipelineStage === item.stage;
            const pct = ordersList.length > 0 ? Math.round((item.count / ordersList.length) * 100) : 0;

            return (
              <div
                key={item.stage}
                onClick={() => {
                  const newStage = isSelected ? "ALL" : item.stage;
                  setSelectedPipelineStage(newStage);
                  if (newStage !== "ALL") {
                    navigate(`/orders?stage=${newStage}`);
                  }
                }}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer relative ${item.color} ${isSelected ? "ring-2 ring-[#0E8FAE] shadow-xs" : "hover:border-slate-400"
                  }`}
              >
                {item.isBottleneck && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-ping" />
                )}

                <div className="flex items-center justify-between text-[9px] font-black tracking-wider opacity-80">
                  <span>{item.label}</span>
                  {idx < 6 && <span className="text-slate-400 font-sans hidden lg:inline">→</span>}
                </div>

                <div className="text-lg font-black mt-1 font-mono tracking-tight">{item.count}</div>

                <div className="flex items-center justify-between text-[10px] opacity-75 mt-0.5">
                  <span>{pct}% share</span>
                  {item.isBottleneck && (
                    <span className="text-[9px] font-bold text-amber-700 uppercase">Queue</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous Segmented Pipeline Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div style={{ width: `${(pipelineCounts.CREATED / Math.max(1, ordersList.length)) * 100}%` }} className="bg-slate-400 transition-all" title={`Created: ${pipelineCounts.CREATED}`} />
          <div style={{ width: `${(pipelineCounts.PRIORITIZED / Math.max(1, ordersList.length)) * 100}%` }} className="bg-purple-500 transition-all" title={`Prioritized: ${pipelineCounts.PRIORITIZED}`} />
          <div style={{ width: `${(pipelineCounts.ALLOCATED / Math.max(1, ordersList.length)) * 100}%` }} className="bg-blue-500 transition-all" title={`Allocated: ${pipelineCounts.ALLOCATED}`} />
          <div style={{ width: `${(pipelineCounts.PICKING / Math.max(1, ordersList.length)) * 100}%` }} className="bg-amber-500 transition-all" title={`Picking: ${pipelineCounts.PICKING}`} />
          <div style={{ width: `${(pipelineCounts.PACKING / Math.max(1, ordersList.length)) * 100}%` }} className="bg-orange-500 transition-all" title={`Packing: ${pipelineCounts.PACKING}`} />
          <div style={{ width: `${(pipelineCounts.QUALITY_CHECK / Math.max(1, ordersList.length)) * 100}%` }} className="bg-cyan-500 transition-all" title={`QC Pass: ${pipelineCounts.QUALITY_CHECK}`} />
          <div style={{ width: `${(pipelineCounts.DISPATCHED / Math.max(1, ordersList.length)) * 100}%` }} className="bg-emerald-500 transition-all" title={`Dispatched: ${pipelineCounts.DISPATCHED}`} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9 & 10. 2-COLUMN TELEMETRY & AUTONOMOUS DECISION TRAIL                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (7 cols): Interactive Multi-Tab Telemetry Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#0E8FAE]" />
                Warehouse Operational Telemetry & Analytics
              </h3>
              <p className="text-[11px] text-slate-400">Throughput velocity, zone bottleneck index, and stock health</p>
            </div>

            {/* Chart Mode Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-bold shrink-0">
              {[
                { id: "throughput", label: "Velocity" },
                { id: "zones", label: "Zone Heatmap" },
                { id: "stock", label: "Stock Health" },
                { id: "categories", label: "Category Share" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveChartTab(t.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${activeChartTab === t.id ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Display Canvas */}
          <div className="h-64 w-full pt-1">
            {activeChartTab === "throughput" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#92EEFF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#92EEFF" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "11px", border: "none" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Area type="monotone" name="Actual Dispatched Orders" dataKey="orders" stroke="#0E8FAE" strokeWidth={2.5} fillOpacity={1} fill="url(#velocityGrad)" />
                  <Line type="monotone" name="Target Throughput" dataKey="target" stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "zones" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "11px", border: "none" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Bar name="Active Tasks" dataKey="activeTasks" fill="#0E8FAE" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar name="Capacity Limit" dataKey="capacity" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "stock" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockHealthData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                  <YAxis dataKey="category" type="category" stroke="#94A3B8" fontSize={10} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "11px", border: "none" }}
                  />
                  <Bar dataKey="count" name="SKU Count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {stockHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "categories" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 h-full items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryValueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryValueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "11px", border: "none" }}
                      formatter={(val) => `$${val.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-1.5 text-xs pr-2">
                  {categoryValueData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-slate-800 text-[11px]">{c.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-[11px]">${c.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Autonomous Decision Trail */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-[#92EEFF]/30 text-slate-950 flex items-center justify-center font-bold">
                <Zap className="w-3.5 h-3.5 text-[#0E8FAE]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Autonomous Decision Trail
                </h3>
                <p className="text-[11px] text-slate-400">Deterministic solver, SLA & profit impact</p>
              </div>
            </div>
            <Link to="/audit-logs" className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-0.5">
              <span>Full Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {decisionLogs && decisionLogs.length > 0 ? (
              decisionLogs.slice(0, 2).map((dec) => (
                <DecisionCard key={dec.id} decision={dec} onRefresh={refresh} />
              ))
            ) : (
              <div className="space-y-2.5">
                {/* Fallback structured decision card 1 */}
                <div className="border border-slate-200/90 rounded-lg p-3 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#E5FAFE] text-[#0E8FAE] px-2 py-0.5 rounded border border-[#92EEFF]">
                      PRIORITY ASSIGNMENT • ORD-1042
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      APPLIED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-medium leading-snug">
                    <span className="font-bold text-slate-900">Situation: </span>
                    New order received for Metro Hypermarket with 2-hour SLA deadline.
                  </div>
                  <div className="bg-[#E5FAFE]/70 border border-[#92EEFF]/60 rounded p-2 text-[11px] font-bold text-slate-900">
                    <span className="text-[#0E8FAE]">Recommended Decision: </span>
                    Assigned CRITICAL priority score (95/100).
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded p-2 text-[11px] font-semibold text-emerald-800 flex justify-between">
                    <span>Business Impact: Protect ₹2,500 SLA penalty</span>
                    <span className="font-mono font-bold text-emerald-700">+₹910 Profit</span>
                  </div>
                </div>

                {/* Fallback structured decision card 2 */}
                <div className="border border-slate-200/90 rounded-lg p-3 bg-slate-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#E5FAFE] text-[#0E8FAE] px-2 py-0.5 rounded border border-[#92EEFF]">
                      PICKING ROUTE OPTIMIZATION • PICK-001
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      APPLIED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-medium leading-snug">
                    <span className="font-bold text-slate-900">Situation: </span>
                    Picking list spanned across 3 distinct warehouse zones (B, C, D).
                  </div>
                  <div className="bg-[#E5FAFE]/70 border border-[#92EEFF]/60 rounded p-2 text-[11px] font-bold text-slate-900">
                    <span className="text-[#0E8FAE]">Recommended Decision: </span>
                    Optimized sequence [B-01 → C-01 → D-01] saved 7 min transit time.
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded p-2 text-[11px] font-semibold text-emerald-800 flex justify-between">
                    <span>Estimated Labor Saving</span>
                    <span className="font-mono font-bold text-emerald-700">₹145/day</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. WAREHOUSE HEALTH & ZONE CAPACITY                                      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-[#92EEFF]/30 text-[#0E8FAE] flex items-center justify-center">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Warehouse Health & Zone Capacity
              </h3>
              <p className="text-[11px] text-slate-400">Live pick cycle times, capacity utilization & financial drag</p>
            </div>
          </div>

          <Link to="/warehouse-map" className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-1">
            <span>2D Facility Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {zoneAnalyticsData.map((z) => {
            const isBottleneck = z.status === "BOTTLENECK";
            const utilPct = Math.round((z.activeTasks / z.capacity) * 100);

            return (
              <div
                key={z.zone}
                onClick={() => navigate("/warehouse-map")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isBottleneck
                  ? "bg-red-50/30 border-red-300 ring-1 ring-red-400 shadow-xs"
                  : "bg-slate-50/50 border-slate-200/90 hover:border-slate-300"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{z.zone}</span>
                    <h4 className="text-xs font-bold text-slate-900">{z.name}</h4>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide ${isBottleneck
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                  >
                    {isBottleneck ? "BOTTLENECK" : "OPTIMAL"}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Pick Cycle:</span>
                  <span className={`font-mono font-bold text-xs ${isBottleneck ? "text-red-700" : "text-slate-900"}`}>
                    {z.avgMin} min / wave
                  </span>
                </div>

                <div className="mt-1 flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Active Tasks:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {z.activeTasks} / {z.capacity} tasks
                  </span>
                </div>

                {isBottleneck && (
                  <div className="mt-2 text-[10px] bg-red-50 p-1.5 rounded border border-red-200 text-red-800 font-medium space-y-0.5">
                    <div><span className="font-bold">Impact: </span>+46% picking latency ({z.financialImpact})</div>
                    <div><span className="font-bold">Recommendation: </span>Rebalance 2 pickers</div>
                  </div>
                )}

                {/* Horizontal Utilization Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Utilization</span>
                    <span className={isBottleneck ? "text-red-600 font-bold" : "text-slate-700"}>
                      {utilPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isBottleneck ? "bg-red-500" : utilPct > 75 ? "bg-amber-500" : "bg-[#0E8FAE]"
                        }`}
                      style={{ width: `${Math.min(100, utilPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12 & 13. TOP FAST-MOVING SKUs + REAL-TIME WAREHOUSE ACTIVITY STREAM       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Fast-Moving SKUs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-[#92EEFF]/30 text-[#0E8FAE] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Top Fast-Moving SKUs & Velocity Run-Rate
                </h3>
                <p className="text-[11px] text-slate-400">Daily velocity demand vs on-hand physical stock</p>
              </div>
            </div>
            <Link to="/inventory" className="text-xs font-bold text-[#0E8FAE] hover:underline flex items-center gap-1">
              <span>Inventory Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-1.5 text-xs">
            {topVelocitySkus.map((sku, idx) => (
              <div
                key={sku.sku}
                onClick={() => navigate(`/inventory?q=${sku.sku}`)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-slate-400 w-5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs">{sku.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {sku.sku} • {sku.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-mono font-bold text-slate-900 text-xs">{sku.velocity} u/day</div>
                    <div className="text-[10px] text-slate-400">Velocity</div>
                  </div>

                  <div className="min-w-[80px]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${sku.status === "CRITICAL"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : sku.status === "LOW_STOCK"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                    >
                      {sku.available} avail
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Live Warehouse Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md bg-[#92EEFF]/30 text-[#0E8FAE] flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Real-Time Warehouse Activity
                </h3>
                <p className="text-[11px] text-slate-400">Continuous telemetry feed from floor operations</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">LIVE</span>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {formattedActivity.map((evt) => (
              <div key={evt.id} className="p-2 rounded-lg bg-slate-50/50 border border-slate-100/90 space-y-1 hover:bg-slate-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {evt.eventType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                    {evt.entity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 font-medium leading-snug">
                  {evt.description}
                </p>
                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  <span>Source: <span className="text-slate-600 font-semibold">{evt.source}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-BRANCH PERFORMANCE COMPARISON MATRIX (SHOWN IN ALL HUBS MODE)            */}
      {/* ========================================================================= */}
      {activeScope === "ALL" && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  StockFlow 5-Hub Network Performance Matrix
                </h3>
                <p className="text-[11px] text-slate-500">Live operational & financial benchmarking across all distribution facilities</p>
              </div>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              5 Facilities Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  <th className="py-2 px-3">Fulfillment Center</th>
                  <th className="py-2 px-2 text-center">Floors</th>
                  <th className="py-2 px-2 text-right">Orders</th>
                  <th className="py-2 px-2 text-right">Dispatched</th>
                  <th className="py-2 px-2 text-right">Revenue (₹)</th>
                  <th className="py-2 px-2 text-right">Profit (₹)</th>
                  <th className="py-2 px-2 text-right">Margin</th>
                  <th className="py-2 px-2 text-right">Utilization</th>
                  <th className="py-2 px-2 text-center">Bays</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {branchPerformance.map((hub) => (
                  <tr key={hub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {hub.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <span>{hub.name.split("—")[1] || hub.name}</span>
                            {hub.isMainHub && (
                              <span className="text-[9px] font-black uppercase bg-slate-900 text-[#92EEFF] px-1.5 py-0.2 rounded">
                                MAIN HUB
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{hub.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                      {hub.floorsCount} FL
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {hub.ordersCount}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-emerald-700">
                      {hub.dispatchedCount}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      ₹{hub.revenue?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-emerald-800">
                      ₹{hub.profit?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-cyan-800">
                      {hub.margin}%
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-700">
                      {hub.utilizationPct}%
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-blue-700">
                      {hub.activeBaysCount}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveScope(hub.id)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 transition-all"
                      >
                        Inspect Hub
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENTERPRISE MULTI-CHANNEL & YARD MANAGEMENT OVERVIEW                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 4 cols: Multi-Channel Retail Fulfillment Split */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                StockFlow Channel Volume Split
              </h3>
            </div>
            <Link to="/orders" className="text-[11px] font-bold text-[#0E8FAE] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  <span>StockFlow B2B Enterprise Bulk</span>
                </span>
                <span className="font-mono font-bold text-slate-900">38% (840 units)</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-600 h-full rounded-full" style={{ width: "38%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>StockFlow Direct-to-Consumer</span>
                </span>
                <span className="font-mono font-bold text-slate-900">27% (590 units)</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "27%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>StockFlow Retail Distribution</span>
                </span>
                <span className="font-mono font-bold text-slate-900">22% (485 units)</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "22%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>StockFlow Express Linehaul</span>
                </span>
                <span className="font-mono font-bold text-slate-900">13% (290 units)</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "13%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Middle 5 cols: Live Dock Bays & Fleet YMS */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Dock Doors & Fleet Yard ({dockDoors.length} Active Bays)
              </h3>
            </div>
            <Link to="/dock-yard" className="text-[11px] font-bold text-[#0E8FAE] hover:underline flex items-center gap-0.5">
              <span>Yard Monitor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {dockDoors.slice(0, 4).map((bay) => (
              <div key={bay.id} className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{bay.bayNumber}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    bay.type === "INBOUND" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {bay.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate">{bay.carrier}</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${bay.progressPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                    style={{ width: `${bay.progressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3 cols: Reverse Logistics (RTO Hub) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Reverse Logistics (RTO)
              </h3>
            </div>
            <Link to="/returns" className="text-[11px] font-bold text-[#0E8FAE] hover:underline">
              Inspect
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex justify-between items-center">
              <div>
                <span className="font-bold block">Grade A Recovery</span>
                <span className="text-[10px] text-emerald-700">Restocked & refunded</span>
              </div>
              <span className="font-mono font-black text-emerald-800 text-sm">82%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex justify-between items-center">
              <div>
                <span className="font-bold block">Grade B Repack</span>
                <span className="text-[10px] text-amber-700">Buffer re-boxing</span>
              </div>
              <span className="font-mono font-black text-amber-800 text-sm">11%</span>
            </div>

            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900 flex justify-between items-center">
              <div>
                <span className="font-bold block">Grade C Scrap</span>
                <span className="text-[10px] text-red-700">Carrier damage claim</span>
              </div>
              <span className="font-mono font-black text-red-800 text-sm">7%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 14. TODAY'S BUSINESS PERFORMANCE (QUICK SUMMARY RIBBON)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              TODAY'S BUSINESS PERFORMANCE
            </span>
            <span className="text-xs font-bold text-slate-800 hidden md:inline">End-of-Day Financial Summary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-5 w-full sm:w-auto text-xs divide-x-0 sm:divide-x divide-slate-100">
            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Revenue</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₹{Number(finMetrics.revenueToday).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Profit</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                ₹{Number(finMetrics.estimatedProfit).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Operational Loss</span>
              <span className="font-mono font-bold text-red-600 text-sm">
                -₹{Number(finMetrics.operationalLoss).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Orders Dispatched</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {finMetrics.dispatchedCount}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Order Value</span>
              <span className="font-mono font-bold text-[#0E8FAE] text-sm">
                ₹{Number(finMetrics.avgOrderVal).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="sm:pl-3 flex flex-col">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Profit / Order</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                ₹{Number(finMetrics.profitPerOrder).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* P&L BREAKDOWN MODAL                                                       */}
      {/* ========================================================================= */}
      {showPnLModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8FAE] bg-[#E5FAFE] px-2 py-0.5 rounded border border-[#92EEFF]">
                  AUDITED FINANCIAL BREAKDOWN
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Warehouse Profit & Loss Statement (Today)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPnLModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Formula</div>
                <div className="text-slate-900 font-bold leading-relaxed text-[11px]">
                  Estimated Profit = Gross Revenue - (Inventory Landed Cost + Operational Fulfillment Cost + Exception Losses)
                </div>
              </div>

              <div className="space-y-2 divide-y divide-slate-100 font-mono">
                <div className="flex justify-between pt-1">
                  <span className="font-sans text-slate-700 font-semibold">1. Total Gross Revenue (GMV)</span>
                  <span className="font-bold text-slate-900">+₹{finMetrics.revenueToday.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-sans text-slate-600">2. Product Landed Inventory Cost (Weighted FIFO)</span>
                  <span className="text-red-600">-₹{finMetrics.inventoryCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-sans text-slate-600">3. Operational Cost (Picking labor + packing + freight)</span>
                  <span className="text-amber-600">-₹{finMetrics.operationalCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-sans text-slate-600">4. Exception & Damage Loss (Returns, spoilage, latency)</span>
                  <span className="text-red-600">-₹{finMetrics.exceptionCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black bg-[#E5FAFE] p-2 rounded-lg border border-[#92EEFF]">
                  <span className="font-sans text-slate-900">Estimated Net Profit ({finMetrics.profitMargin}% Margin)</span>
                  <span className="text-emerald-700">+₹{finMetrics.estimatedProfit.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic pt-1">
                Linked directly to Firestore order collections, inventory ledgers, and real-time execution telemetry.
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                to="/finance"
                onClick={() => setShowPnLModal(false)}
                className="text-xs font-bold text-[#0E8FAE] hover:underline"
              >
                Go to Profit Intelligence Module →
              </Link>
              <button
                type="button"
                onClick={() => setShowPnLModal(false)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
