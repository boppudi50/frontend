import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Boxes,
  Zap,
  Building2,
  Truck,
  Activity,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Flame,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

export function AnalyticsPage() {
  const { metrics, bottlenecks, inventory = [], orders = [], activeScope, stockflowHubs = [], refresh, loading } = useRealtimeData() || {};
  const { toast } = useToast();

  const [timeRange, setTimeRange] = useState("TODAY");
  const [rebalanceSuccess, setRebalanceSuccess] = useState(false);

  // Hourly throughput telemetry
  const hourlyThroughputData = [
    { time: "06:00", received: 140, picked: 120, dispatched: 95 },
    { time: "08:00", received: 320, picked: 290, dispatched: 260 },
    { time: "10:00", received: 580, picked: 540, dispatched: 510 },
    { time: "12:00", received: 720, picked: 690, dispatched: 670 },
    { time: "14:00", received: 640, picked: 620, dispatched: 610 },
    { time: "16:00", received: 810, picked: 780, dispatched: 750 },
    { time: "18:00", received: 750, picked: 730, dispatched: 710 },
    { time: "20:00", received: 480, picked: 460, dispatched: 450 }
  ];

  // Zone cycle times
  const zoneCycleData = [
    { zone: "Zone A (Personal Care)", avgMin: 10.8, benchmark: 11.2, status: "PASS" },
    { zone: "Zone B (Detergents)", avgMin: rebalanceSuccess ? 11.0 : 16.4, benchmark: 11.2, status: rebalanceSuccess ? "PASS" : "BOTTLENECK" },
    { zone: "Zone C (Foods & Snacks)", avgMin: 11.5, benchmark: 11.2, status: "PASS" },
    { zone: "Zone D (Cold Storage)", avgMin: 10.2, benchmark: 11.2, status: "PASS" }
  ];

  // Category SKU Mix
  const categoryDistribution = [
    { name: "Personal Care", count: 35, color: "#0E8FAE" },
    { name: "Detergents & Cleaning", count: 28, color: "#38D2F3" },
    { name: "Foods & Snacks", count: 42, color: "#92EEFF" },
    { name: "Cold-Chain Beverages", count: 18, color: "#0F172A" }
  ];

  // Fulfillment Stage Funnel
  const stageFunnel = [
    { stage: "Inbound Receiving", timeMin: 12.4, targetMin: 15.0, efficiency: "+17.3%" },
    { stage: "Putaway & Slotting", timeMin: 18.2, targetMin: 20.0, efficiency: "+9.0%" },
    { stage: "Wave Pick (TSP)", timeMin: 11.0, targetMin: 11.2, efficiency: "+1.8%" },
    { stage: "QC 6-Pt Inspection", timeMin: 4.5, targetMin: 5.0, efficiency: "+10.0%" },
    { stage: "Carrier Linehaul", timeMin: 8.1, targetMin: 10.0, efficiency: "+19.0%" }
  ];

  // 5-Hub Network Performance
  const hubPerformance = [
    { id: "HYD-01", name: "Hyderabad Central Fulfillment Hub", floors: "6 Floors", throughput: "38,420 / day", sla: "99.2%", status: "OPTIMAL" },
    { id: "MUM-01", name: "Mumbai Western Logistics Terminal", floors: "4 Floors", throughput: "28,150 / day", sla: "98.8%", status: "OPTIMAL" },
    { id: "VJA-01", name: "Vijayawada East Distribution Hub", floors: "2 Floors", throughput: "14,800 / day", sla: "98.4%", status: "OPTIMAL" },
    { id: "MAH-01", name: "Maharashtra Industrial Depot", floors: "3 Floors", throughput: "19,300 / day", sla: "97.9%", status: "HEAVY LOAD" },
    { id: "CHE-01", name: "Chennai Southern Gateway Terminal", floors: "3 Floors", throughput: "22,600 / day", sla: "98.7%", status: "OPTIMAL" }
  ];

  const handleExecuteRebalance = () => {
    setRebalanceSuccess(true);
    toast.success(
      "Autonomous Rebalancing Executed",
      "Reassigned 2 pickers from Zone D to Zone B. Zone B picking cycle time normalized to 11.0 min."
    );
  };

  const totalStockUnits = inventory.reduce((sum, it) => sum + (it.totalQuantity || 0), 0) || 716515;
  const availablePickUnits = inventory.reduce((sum, it) => sum + (it.availableQuantity || 0), 0) || 618282;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Operational Analytics & Bottleneck Telemetry
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  REAL-TIME METRICS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Action-oriented fulfillment analytics measuring throughput velocity, stage cycle times, and autonomous zone rebalancing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {["TODAY", "7_DAYS", "30_DAYS"].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeRange === range
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {range === "TODAY" ? "Today" : range === "7_DAYS" ? "Past 7 Days" : "Month to Date"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={async () => {
              await refresh();
              toast.info("Telemetry Synchronized", "Refreshed live warehouse analytics and throughput counters.");
            }}
            disabled={loading}
            className="btn-outline text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Top 4 Executive KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            On-Time Fulfillment Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">98.6%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+2.1%</span>
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            99.8% Tier-1 SLA Compliance
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Order Cycle Time
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">34.2 min</span>
            <span className="text-xs font-bold text-emerald-600">-8.4 min</span>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold block">
            Order Receipt to Carrier Handoff
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            QC First-Pass Yield
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">98.2%</span>
            <span className="text-xs font-bold text-emerald-600">PASS</span>
          </div>
          <span className="text-[11px] text-[#0E8FAE] font-semibold block">
            6-Point Inspection Verification
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Floor Storage Utilization
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">78.4%</span>
            <span className="text-xs font-bold text-purple-600">Optimal</span>
          </div>
          <span className="text-[11px] text-purple-700 font-semibold block">
            150,000 sq ft Active Racks
          </span>
        </div>
      </div>

      {/* Row 2: Throughput Velocity Chart (Left 8) + Stage Funnel (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Hourly Throughput Velocity */}
        <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hourly Throughput & Dispatch Velocity</h2>
              <p className="text-xs text-slate-500">Order receipts vs wave picked vs linehaul dispatched (units/hr)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1]" />
                <span className="text-slate-600">Received</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38D2F3]" />
                <span className="text-slate-600">Picked</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E8FAE]" />
                <span className="text-slate-900 font-bold">Dispatched</span>
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyThroughputData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDispatched" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0E8FAE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0E8FAE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPicked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38D2F3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38D2F3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px", border: "none" }}
                />
                <Area type="monotone" dataKey="received" stroke="#CBD5E1" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="picked" stroke="#38D2F3" fill="url(#colorPicked)" strokeWidth={2} />
                <Area type="monotone" dataKey="dispatched" stroke="#0E8FAE" fill="url(#colorDispatched)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Fulfillment Stage Cycle Times Funnel */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Stage Cycle Breakdown</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                PASSING SLA
              </span>
            </div>
            <p className="text-xs text-slate-500">Average minutes per operational stage</p>
          </div>

          <div className="space-y-2.5 my-auto">
            {stageFunnel.map((stage) => (
              <div key={stage.stage} className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{stage.stage}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <b className="text-slate-900">{stage.timeMin}m</b>
                    <span className="text-slate-400">/ {stage.targetMin}m</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#0E8FAE] rounded-full"
                    style={{ width: `${(stage.timeMin / stage.targetMin) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-[#E5FAFE] border border-[#92EEFF] rounded-xl text-[11px] text-[#0E8FAE] font-semibold flex items-center justify-between">
            <span>Total End-to-End SLA:</span>
            <span className="font-mono font-bold text-slate-900">54.2 min (Benchmark 70m)</span>
          </div>
        </div>
      </div>

      {/* Row 3: Zone Bottleneck & Autonomous Rebalance (Left 7) + SKU Mix (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Zone Picking vs Benchmark with 1-Click Rebalancer */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Zone Picking Cycle Time vs Benchmark</h2>
              <p className="text-xs text-slate-500">Target benchmark: 11.2 minutes per wave pick</p>
            </div>
            {rebalanceSuccess ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ZONE B REBALANCED</span>
              </span>
            ) : (
              <Badge variant="warning">Zone B Bottleneck Alert</Badge>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneCycleData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="zone" stroke="#64748B" fontSize={10} angle={-5} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px", border: "none" }}
                />
                <Bar dataKey="avgMin" name="Actual Avg Time (min)" fill="#0E8FAE" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="benchmark" name="Target Benchmark (min)" fill="#CBD5E1" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Autonomous AI Workload Rebalance Box */}
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
            rebalanceSuccess
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}>
            <div className="flex items-center justify-between">
              <div className="font-bold flex items-center gap-1.5">
                {rebalanceSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {rebalanceSuccess
                    ? "Autonomous Rebalance Active: 2 Pickers Shifted to Zone B"
                    : "Detected Bottleneck: Zone B Picking Time is 16.4 min (+46.4% above SLA)"}
                </span>
              </div>

              {!rebalanceSuccess && (
                <button
                  type="button"
                  onClick={handleExecuteRebalance}
                  className="btn-primary text-[11px] font-bold py-1 px-3 shadow-xs flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-slate-950" />
                  <span>Execute Auto-Rebalance</span>
                </button>
              )}
            </div>

            <p className="text-[11px] opacity-90">
              {rebalanceSuccess
                ? "Zone B wave backlog cleared. Picking cycle normalized to 11.0 min."
                : "Autonomous AI Engine Rebalance Recommendation: Temporarily reassign 2 pickers from Zone D (Low Load) to Zone B."}
            </p>
          </div>
        </div>

        {/* Right 5 Cols: Catalogue SKU Mix & Storage */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Catalogue SKU Mix & Active Storage</h2>
            <p className="text-xs text-slate-500">Live products by warehouse department</p>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "12px", border: "none" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 font-semibold text-[10px] uppercase">Total Stock Units</div>
              <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                {totalStockUnits.toLocaleString()} Units
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="text-slate-500 font-semibold text-[10px] uppercase">Available Pick Buffer</div>
              <div className="text-base font-black text-emerald-700 font-mono mt-0.5">
                {availablePickUnits.toLocaleString()} Units
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: 5-Hub Multi-Warehouse Performance Matrix */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">5-Hub Consolidated Fulfillment Network Matrix</h2>
            <p className="text-xs text-slate-500">Multi-warehouse throughput comparison and SLA health</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border">
            5 HUBS ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {hubPerformance.map((hub) => (
            <div
              key={hub.id}
              className={`p-3 rounded-xl border space-y-2 text-xs transition-all ${
                activeScope === hub.id
                  ? "border-[#0E8FAE] bg-[#F0FDFF] ring-2 ring-[#92EEFF]/30"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-900">{hub.id}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono">
                  {hub.status}
                </span>
              </div>

              <div>
                <div className="font-bold text-slate-900 text-xs truncate">{hub.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{hub.floors}</div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-600">{hub.throughput}</span>
                <span className="font-bold text-emerald-700">{hub.sla} SLA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
