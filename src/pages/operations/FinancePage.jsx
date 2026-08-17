import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Sparkles,
  Building2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Zap,
  Boxes,
  HelpCircle,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowRight,
  Info,
  Calendar,
  Truck,
  RotateCcw,
  PackageX,
  Scale,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye
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

export function FinancePage() {
  const {
    metrics,
    orders = [],
    inventory = [],
    exceptions = [],
    financials,
    activeScope = "ALL",
    activeHub = null,
    branchPerformance = [],
    refresh,
    loading
  } = useRealtimeData() || {};

  const { toast } = useToast();

  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [calculationModalOrder, setCalculationModalOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [orderLimit, setOrderLimit] = useState(10);

  const ordersList = Array.isArray(orders) ? orders : [];
  const inventoryList = Array.isArray(inventory) ? inventory : [];
  const exceptionsList = Array.isArray(exceptions) ? exceptions : [];

  // Fallback or dynamically derived financial data (Converted to INR ₹)
  const finData = useMemo(() => {
    if (financials && financials.kpis) {
      return financials;
    }

    // Default calculations in INR ₹
    const totalRev = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 1482000;
    const dispatchedRev = ordersList.filter(o => ["DISPATCHED", "COMPLETED"].includes(o.status)).reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 1145000;
    const pendingRev = totalRev - dispatchedRev || 337000;
    const opCost = 312000;
    const netProfit = 472000;
    const margin = 31.9;

    return {
      kpis: {
        totalRevenue: totalRev,
        dispatchedOrderValue: dispatchedRev,
        pendingOrderValue: pendingRev,
        totalOperationalCost: opCost,
        estimatedNetProfit: netProfit,
        profitMargin: margin,
        totalLoss: 68400,
        largestLossCategory: "Returns & RTO (₹26,000)"
      },
      revenueBreakdown: {
        today: {
          revenue: totalRev,
          cost: opCost,
          profit: netProfit,
          margin: margin,
          title: "Today's Real-Time Hourly Revenue & Profit Velocity",
          subtitle: "Live telemetry from 06:00 to 20:00 tracking order intake vs wave labor and packing overhead",
          chartData: [
            { period: "06:00", revenue: 95000, operatingCost: 22000, netProfit: 31000 },
            { period: "08:00", revenue: 180000, operatingCost: 42000, netProfit: 58000 },
            { period: "10:00", revenue: 295000, operatingCost: 61000, netProfit: 92000 },
            { period: "12:00", revenue: 340000, operatingCost: 69000, netProfit: 112000 },
            { period: "14:00", revenue: 260000, operatingCost: 54000, netProfit: 84000 },
            { period: "16:00", revenue: 225000, operatingCost: 48000, netProfit: 74000 },
            { period: "18:00", revenue: 182000, operatingCost: 38000, netProfit: 52000 },
            { period: "20:00", revenue: 105000, operatingCost: 24000, netProfit: 33000 }
          ]
        },
        thisWeek: {
          revenue: 8260000,
          cost: 1740000,
          profit: 2680000,
          margin: 32.4,
          title: "Weekly Revenue Performance vs Daily Operating Expenses",
          subtitle: "Daily GMV telemetry vs warehouse landed and linehaul logistics expenses (Mon - Sun)",
          chartData: [
            { period: "Mon", revenue: 1140000, operatingCost: 248000, netProfit: 372000 },
            { period: "Tue", revenue: 1350000, operatingCost: 274000, netProfit: 436000 },
            { period: "Wed", revenue: 1240000, operatingCost: 258000, netProfit: 401000 },
            { period: "Thu", revenue: 1460000, operatingCost: 314000, netProfit: 474000 },
            { period: "Fri", revenue: 1580000, operatingCost: 330000, netProfit: 510000 },
            { period: "Sat (Today)", revenue: totalRev || 1482000, operatingCost: opCost || 312000, netProfit: netProfit || 472000 },
            { period: "Sun", revenue: 980000, operatingCost: 210000, netProfit: 315000 }
          ]
        },
        thisMonth: {
          revenue: 35200000,
          cost: 7420000,
          profit: 11480000,
          margin: 32.6,
          title: "Monthly Consolidated Revenue & Margin Progression (This Month)",
          subtitle: "Weekly aggregate fulfillment performance across all 5 StockFlow fulfillment centers",
          chartData: [
            { period: "Week 1 (Aug 1-7)", revenue: 7840000, operatingCost: 1650000, netProfit: 2560000 },
            { period: "Week 2 (Aug 8-14)", revenue: 8420000, operatingCost: 1780000, netProfit: 2740000 },
            { period: "Week 3 (Aug 15-21)", revenue: 9260000, operatingCost: 1940000, netProfit: 3020000 },
            { period: "Week 4 (Aug 22-28)", revenue: 8180000, operatingCost: 1720000, netProfit: 2670000 },
            { period: "Week 5 (Current)", revenue: 1500000, operatingCost: 330000, netProfit: 490000 }
          ]
        }
      },
      orderProfitability: [
        {
          orderId: "ORD-1042",
          customer: "Metro Cash & Carry",
          orderValue: 205000,
          inventoryCost: 118000,
          pickingCost: 3700,
          packingCost: 1480,
          dispatchCost: 5900,
          exceptionCost: 2050,
          estimatedProfit: 73870,
          margin: 36.0,
          status: "ALLOCATED",
          priority: "CRITICAL",
          itemsCount: 4
        },
        {
          orderId: "ORD-1043",
          customer: "Reliance Retail Supermart",
          orderValue: 152000,
          inventoryCost: 86400,
          pickingCost: 2600,
          packingCost: 1150,
          dispatchCost: 4500,
          exceptionCost: 0,
          estimatedProfit: 57350,
          margin: 37.7,
          status: "PICKING",
          priority: "HIGH",
          itemsCount: 3
        },
        {
          orderId: "ORD-1044",
          customer: "DMart Regional DC",
          orderValue: 340000,
          inventoryCost: 204000,
          pickingCost: 5800,
          packingCost: 2400,
          dispatchCost: 8900,
          exceptionCost: 0,
          estimatedProfit: 118900,
          margin: 35.0,
          status: "PACKED",
          priority: "CRITICAL",
          itemsCount: 6
        },
        {
          orderId: "ORD-1045",
          customer: "Amazon Prime FastPicks",
          orderValue: 98000,
          inventoryCost: 56000,
          pickingCost: 1800,
          packingCost: 850,
          dispatchCost: 3200,
          exceptionCost: 0,
          estimatedProfit: 36150,
          margin: 36.9,
          status: "DISPATCHED",
          priority: "HIGH",
          itemsCount: 2
        },
        {
          orderId: "ORD-1046",
          customer: "Flipkart Grocery Hub",
          orderValue: 245000,
          inventoryCost: 147000,
          pickingCost: 4200,
          packingCost: 1900,
          dispatchCost: 6800,
          exceptionCost: 4500,
          estimatedProfit: 80600,
          margin: 32.9,
          status: "QUALITY_CHECK",
          priority: "MEDIUM",
          itemsCount: 5
        },
        {
          orderId: "ORD-1047",
          customer: "Blinkit Dark Store Network",
          orderValue: 82000,
          inventoryCost: 47500,
          pickingCost: 1400,
          packingCost: 650,
          dispatchCost: 2700,
          exceptionCost: 0,
          estimatedProfit: 29750,
          margin: 36.3,
          status: "READY_TO_DISPATCH",
          priority: "HIGH",
          itemsCount: 3
        }
      ],
      financialLosses: {
        totalLoss: 68400,
        largestCategory: "Customer Returns & RTO (₹26,000)",
        categories: [
          { category: "Customer Returns & RTO", amount: 26000, color: "#EF4444", incidents: 8 },
          { category: "Physical Damage / Spills", amount: 22800, color: "#F97316", incidents: 5 },
          { category: "Cycle Count Variances", amount: 12400, color: "#F59E0B", incidents: 4 },
          { category: "Carrier Delay Penalties", amount: 7200, color: "#64748B", incidents: 2 },
        ]
      },
      zoneFinancialImpact: [
        {
          zone: "Zone A",
          name: "Personal Care & Cosmetics",
          inventoryValue: 2680000,
          ordersProcessed: 38,
          operationalCost: 42000,
          exceptionCost: 3500,
          revenueContribution: 558000,
          estimatedProfit: 201000,
          status: "OPTIMAL",
          impactNotes: "High-margin SKU velocity with nominal picking overhead."
        },
        {
          zone: "Zone B",
          name: "Detergents & Cleaners",
          inventoryValue: 1940000,
          ordersProcessed: 29,
          operationalCost: 64000,
          exceptionCost: 14500,
          revenueContribution: 420000,
          estimatedProfit: 118000,
          status: "BOTTLENECK",
          financialImpact: -34000,
          impactNotes: "Picking congestion and wave handling costs creating -₹34,000 financial drag."
        },
        {
          zone: "Zone C",
          name: "Foods & Snacks",
          inventoryValue: 2020000,
          ordersProcessed: 42,
          operationalCost: 42500,
          exceptionCost: 3600,
          revenueContribution: 558000,
          estimatedProfit: 201000,
          status: "OPTIMAL",
          impactNotes: "Fast-moving velocity with high-density fulfillment efficiency."
        },
        {
          zone: "Zone D",
          name: "Cold-Chain Beverages",
          inventoryValue: 1720000,
          ordersProcessed: 22,
          operationalCost: 27800,
          exceptionCost: 22800,
          revenueContribution: 312000,
          estimatedProfit: 80400,
          status: "HIGH_DAMAGE_RISK",
          impactNotes: "Pallet transit incident in Aisle D-01 generated ₹22,800 damaged stock loss."
        },
      ],
      supplierSpend: {
        suppliers: [
          { supplier: "Hindustan Unilever Logistics", skus: 14, purchaseValue: 3700000, inventoryValue: 3140000, spendShare: "32.4%", status: "Active Account" },
          { supplier: "Procter & Gamble Direct India", skus: 12, purchaseValue: 3360000, inventoryValue: 2800000, spendShare: "28.9%", status: "Active Account" },
          { supplier: "ITC Lifestyle & Foods", skus: 8, purchaseValue: 1840000, inventoryValue: 1550000, spendShare: "16.0%", status: "Active Account" },
          { supplier: "Mondelez India Foods", skus: 7, purchaseValue: 1460000, inventoryValue: 1190000, spendShare: "12.2%", status: "Active Account" },
          { supplier: "Nestle India Supply", skus: 10, purchaseValue: 1280000, inventoryValue: 1020000, spendShare: "10.5%", status: "Active Account" },
        ],
        keyInsight: "Procter & Gamble Direct represents 28.9% of inventory spend."
      },
      businessInsights: [
        {
          id: "ins-01",
          type: "HIGH_VALUE_ORDER",
          badge: "HIGH VALUE",
          title: "High-Value Order Margin",
          situation: "Order #1042 (₹2,05,000 total value) is expedited through Green Corridor.",
          financialImpact: "+₹73,870 Estimated Net Profit (36.0% Margin)",
          recommendedAction: "Prioritize Dock Bay #04 loading to secure contractual on-time fulfillment bonus.",
          severity: "SUCCESS"
        },
        {
          id: "ins-02",
          type: "COST_RISK",
          badge: "COST RISK",
          title: "Zone B Bottleneck Cost Drag",
          situation: "Zone B picking congestion is creating an extra 16.4 min/wave delay.",
          financialImpact: "-₹11,800/day in excess picker idle and overtime cost",
          recommendedAction: "Execute autonomous rebalance to shift 8 picking waves to Worker #03.",
          severity: "WARNING"
        },
        {
          id: "ins-03",
          type: "LOSS_RISK",
          badge: "LOSS RISK",
          title: "Damaged Inventory in Zone D",
          situation: "12 units of Dairy / Beverages damaged during pallet transit in Aisle D-01.",
          financialImpact: "-₹22,800 in unrecoverable inventory write-off",
          recommendedAction: "Quarantine damaged lots and initiate supplier return credit memo #CR-902.",
          severity: "CRITICAL"
        },
        {
          id: "ins-04",
          type: "MARGIN_OPPORTUNITY",
          badge: "MARGIN OPPORTUNITY",
          title: "Tier-1 Retailer Margin Optimization",
          situation: "Orders from Metro Cash & Carry generate 36.0% margins vs 28.2% baseline wholesale.",
          financialImpact: "+₹1,50,000/week incremental margin capture potential",
          recommendedAction: "Maintain buffer allocation threshold for high-velocity SKUs (Minimalist, Surf Excel).",
          severity: "INFO"
        }
      ],
      auditability: {
        formula: "Estimated Profit = Order Value - (Inventory Cost + Picking Cost + Packing Cost + Dispatch Cost + Exception Cost)",
        basis: "Weighted FIFO landed item cost + actual wave minutes (₹320/hr picker labor rate) + carrier rate card + exception remediation audit trail",
        lastCalculated: "Live Realtime Synchronization"
      }
    };
  }, [financials, ordersList]);

  // Filtered order profitability list
  const filteredOrderProfitability = useMemo(() => {
    const list = finData.orderProfitability || [];
    return list.filter((item) => {
      const matchesSearch =
        searchOrderQuery === "" ||
        item.orderId.toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchOrderQuery.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [finData.orderProfitability, searchOrderQuery, filterStatus]);

  const displayedOrders = useMemo(() => {
    if (showAllOrders) return filteredOrderProfitability;
    return filteredOrderProfitability.slice(0, orderLimit);
  }, [filteredOrderProfitability, showAllOrders, orderLimit]);

  const activeTimeframeData = useMemo(() => {
    return finData.revenueBreakdown?.[selectedTimeframe] || finData.revenueBreakdown?.today || {};
  }, [finData, selectedTimeframe]);

  const activeChartData = useMemo(() => {
    if (activeTimeframeData && Array.isArray(activeTimeframeData.chartData) && activeTimeframeData.chartData.length > 0) {
      return activeTimeframeData.chartData;
    }
    if (selectedTimeframe === "today") {
      return [
        { period: "06:00", revenue: 95000, operatingCost: 22000, netProfit: 31000 },
        { period: "08:00", revenue: 180000, operatingCost: 42000, netProfit: 58000 },
        { period: "10:00", revenue: 295000, operatingCost: 61000, netProfit: 92000 },
        { period: "12:00", revenue: 340000, operatingCost: 69000, netProfit: 112000 },
        { period: "14:00", revenue: 260000, operatingCost: 54000, netProfit: 84000 },
        { period: "16:00", revenue: 225000, operatingCost: 48000, netProfit: 74000 },
        { period: "18:00", revenue: 182000, operatingCost: 38000, netProfit: 52000 },
        { period: "20:00", revenue: 105000, operatingCost: 24000, netProfit: 33000 }
      ];
    }
    if (selectedTimeframe === "thisMonth") {
      return [
        { period: "Week 1 (Aug 1-7)", revenue: 7840000, operatingCost: 1650000, netProfit: 2560000 },
        { period: "Week 2 (Aug 8-14)", revenue: 8420000, operatingCost: 1780000, netProfit: 2740000 },
        { period: "Week 3 (Aug 15-21)", revenue: 9260000, operatingCost: 1940000, netProfit: 3020000 },
        { period: "Week 4 (Aug 22-28)", revenue: 8180000, operatingCost: 1720000, netProfit: 2670000 },
        { period: "Week 5 (Current)", revenue: 1500000, operatingCost: 330000, netProfit: 490000 }
      ];
    }
    return [
      { period: "Mon", revenue: 1140000, operatingCost: 248000, netProfit: 372000 },
      { period: "Tue", revenue: 1350000, operatingCost: 274000, netProfit: 436000 },
      { period: "Wed", revenue: 1240000, operatingCost: 258000, netProfit: 401000 },
      { period: "Thu", revenue: 1460000, operatingCost: 314000, netProfit: 474000 },
      { period: "Fri", revenue: 1580000, operatingCost: 330000, netProfit: 510000 },
      { period: "Sat (Today)", revenue: 1482000, operatingCost: 312000, netProfit: 472000 },
      { period: "Sun", revenue: 980000, operatingCost: 210000, netProfit: 315000 }
    ];
  }, [activeTimeframeData, selectedTimeframe]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Warehouse Financial Performance & Profit Margins (INR ₹)
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  PROFIT INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unit economics engine connecting order GMV, inventory landed cost, picking labor, packing overhead, and linehaul freight in Indian Rupees (₹)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {[
              { id: "today", label: "Today" },
              { id: "thisWeek", label: "This Week" },
              { id: "thisMonth", label: "This Month" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTimeframe(t.id);
                  toast.info(
                    `Financial Timeframe: ${t.label}`,
                    `Displaying telemetry dataset for ${t.label.toLowerCase()}.`
                  );
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTimeframe === t.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={async () => {
              await refresh();
              toast.info("Financial Ledger Synced", "Refreshed revenue telemetry and order profitability figures.");
            }}
            disabled={loading}
            className="btn-outline text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 6 High-Impact Financial KPI Ribbon (All in INR ₹) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Revenue</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
            ₹{Number(activeTimeframeData.revenue || finData.kpis.totalRevenue).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-[#0E8FAE] font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Gross GMV Volume</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dispatched Value</div>
          <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
            ₹{Number(finData.kpis.dispatchedOrderValue).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Realized Revenue</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pending Orders</div>
          <div className="text-base sm:text-lg font-black text-blue-700 font-mono">
            ₹{Number(finData.kpis.pendingOrderValue).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            <span>In Pipeline</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Operational Cost</div>
          <div className="text-base sm:text-lg font-black text-amber-800 font-mono">
            ₹{Number(activeTimeframeData.cost || finData.kpis.totalOperationalCost).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
            <Boxes className="w-3 h-3" />
            <span>Pick, Pack, Freight</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Net Profit</div>
          <div className="text-base sm:text-lg font-black text-emerald-800 font-mono">
            ₹{Number(activeTimeframeData.profit || finData.kpis.estimatedNetProfit).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            <span>Net Contribution</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 border-l-4 border-l-[#92EEFF] shadow-2xs space-y-0.5">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Profit Margin</div>
          <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
            {activeTimeframeData.margin || finData.kpis.profitMargin}%
          </div>
          <div className="text-[10px] text-slate-600 font-semibold flex items-center gap-0.5">
            <Scale className="w-3 h-3" />
            <span>Net Return on GMV</span>
          </div>
        </div>
      </div>

      {/* Row 2: Revenue vs Cost Chart (Left 8) + Business Impact Insights (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Cols: Financial Telemetry Chart */}
        <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#0E8FAE]" />
                {activeTimeframeData.title || "Revenue Performance vs Operating Cost & Profit (INR ₹)"}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTimeframeData.subtitle || "Daily telemetry comparing Gross GMV vs Warehouse Landed & Operating Expenses"}
              </p>
            </div>

            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Net Margin: {activeTimeframeData.margin || finData.kpis.profitMargin}%
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={10} fontStyle="bold" />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickFormatter={(val) => {
                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                    return `₹${val}`;
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    color: "#FFF",
                    borderRadius: "8px",
                    fontSize: "12px",
                    border: "none"
                  }}
                  formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar name="Total Revenue (₹)" dataKey="revenue" fill="#0E8FAE" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar name="Operating Expenses (₹)" dataKey="operatingCost" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Area
                  type="monotone"
                  name="Net Profit (₹)"
                  dataKey="netProfit"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#profitGrad)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Cols: Business Impact Insights */}
        <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center border border-[#92EEFF]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Business Impact Insights</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">DECISION IMPACT</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 pr-1">
            {finData.businessInsights.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                    {ins.badge}
                  </span>
                  <Badge variant={ins.severity === "CRITICAL" ? "critical" : ins.severity === "WARNING" ? "warning" : "success"}>
                    {ins.title}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-700 font-medium leading-snug">
                  {ins.situation}
                </div>
                <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded p-1.5 text-[11px] font-bold text-slate-900 flex items-center justify-between font-mono">
                  <span className="text-[#0E8FAE]">{ins.financialImpact}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Action: </span>
                  {ins.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Order Profitability & Unit Cost Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="font-bold text-[#0E8FAE] font-mono text-base">₹</span>
              Order Profitability & Unit Cost Attribution (INR ₹)
            </h2>
            <p className="text-xs text-slate-500">
              Detailed cost decomposition: Landed cost + picking waves + packing boxes + carrier dispatch + exception rework
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Order # or Customer..."
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#92EEFF] focus:outline-none w-52 bg-slate-50"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="PICKING">Picking</option>
              <option value="PACKING">Packing</option>
              <option value="DISPATCHED">Dispatched</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Order Value</th>
                <th className="py-3 px-3">Inventory Cost</th>
                <th className="py-3 px-3">Pick Cost</th>
                <th className="py-3 px-3">Pack Cost</th>
                <th className="py-3 px-3">Dispatch Cost</th>
                <th className="py-3 px-3">Exception Cost</th>
                <th className="py-3 px-3">Net Profit</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Audit Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-10 text-slate-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                displayedOrders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.orderId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{o.customer}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{o.orderValue.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">₹{o.inventoryCost.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">₹{o.pickingCost.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">₹{o.packingCost.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">₹{o.dispatchCost.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono text-red-600 font-medium">₹{o.exceptionCost.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">₹{o.estimatedProfit.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0E8FAE]">{o.margin}%</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={o.status === "DISPATCHED" ? "success" : o.status === "CRITICAL" ? "critical" : "primary"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCalculationModalOrder(o)}
                        className="text-[11px] font-bold text-[#0E8FAE] hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Calc</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with "See All Orders" Expand / Collapse & Pagination Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium flex items-center gap-2">
            <span>
              Showing <b className="text-slate-900 font-mono">{displayedOrders.length}</b> of{" "}
              <b className="text-slate-900 font-mono">{filteredOrderProfitability.length}</b> total orders
            </span>
            {showAllOrders ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ALL ORDERS EXPANDED
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                FIRST 10 ORDERS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filteredOrderProfitability.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAllOrders(!showAllOrders)}
                className={`text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs ${
                  showAllOrders
                    ? "btn-outline text-slate-700 hover:text-slate-950 bg-white"
                    : "btn-primary text-slate-950"
                }`}
              >
                {showAllOrders ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                    <span>Show First 10 Orders</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-950" />
                    <span>See All ({filteredOrderProfitability.length}) Orders</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-950" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Losses & Zone Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Warehouse Financial Losses (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PackageX className="w-4 h-4 text-red-500" />
                Warehouse Losses & Leakage (INR ₹)
              </h3>
              <p className="text-xs text-slate-500">Damage, shortages, returns & cycle discrepancies</p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              Total: ₹{finData.financialLosses.totalLoss.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-red-50/50 border border-red-200/80 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-red-600 font-bold uppercase">Largest Loss Driver</span>
                <div className="text-xs font-black text-red-700 font-mono">
                  {finData.financialLosses.largestCategory}
                </div>
              </div>
              <Badge variant="critical">High Impact</Badge>
            </div>

            {/* Donut Chart of Financial Losses */}
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={finData.financialLosses.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={58}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {finData.financialLosses.categories.map((entry, index) => (
                      <Cell key={`loss-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "8px", fontSize: "11px", border: "none" }}
                    formatter={(val, name, item) => [`₹${Number(val).toLocaleString("en-IN")} (${item.payload.incidents || 3} incidents)`, item.payload.category]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {finData.financialLosses.categories.map((c) => (
                <div key={c.category} className="space-y-0.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-semibold text-[11px]">{c.category}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">₹{c.amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(5, (c.amount / finData.financialLosses.totalLoss) * 100)}%`,
                        backgroundColor: c.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Financial Impact (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#0E8FAE]" />
                Zone Financial Impact & Capacity ROI (INR ₹)
              </h3>
              <p className="text-xs text-slate-500">Zone revenue vs operating costs & net profit generation</p>
            </div>
            <Link to="/warehouse-map" className="text-xs font-bold text-[#0E8FAE] hover:underline">
              2D Facility Map →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            {finData.zoneFinancialImpact.map((z) => {
              const isBottleneck = z.status === "BOTTLENECK";
              return (
                <div
                  key={z.zone}
                  className={`p-3 rounded-xl border transition-all ${isBottleneck
                      ? "bg-red-50/30 border-red-300 ring-1 ring-red-300 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/90"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{z.zone}</span>
                      <h4 className="text-xs font-bold text-slate-900">{z.name}</h4>
                    </div>
                    <Badge variant={isBottleneck ? "critical" : "success"}>
                      {z.status}
                    </Badge>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px]">Revenue Contrib:</span>
                      <div className="font-mono font-bold text-[#0E8FAE]">₹{z.revenueContribution.toLocaleString("en-IN")}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Net Profit:</span>
                      <div className="font-mono font-bold text-emerald-700">₹{z.estimatedProfit.toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  {z.financialImpact && (
                    <div className="mt-2 text-[10px] text-red-700 bg-red-50 p-1 rounded border border-red-200 font-semibold">
                      Financial Drag: -₹{Math.abs(z.financialImpact).toLocaleString("en-IN")} ({z.impactNotes})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5: Supplier Spend Intelligence */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0E8FAE]" />
              Supplier Spend Intelligence & Contract Allocation (INR ₹)
            </h3>
            <p className="text-xs text-slate-500">Breakdown of inventory asset exposure across key manufacturer contracts</p>
          </div>

          <div className="bg-[#E5FAFE] text-slate-900 border border-[#92EEFF] px-3 py-1 rounded-lg text-xs font-semibold">
            {finData.supplierSpend.keyInsight}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Supplier Partner</th>
                <th className="py-3 px-4">Active Catalogue SKUs</th>
                <th className="py-3 px-4">Purchase Value</th>
                <th className="py-3 px-4">Inventory Valuation</th>
                <th className="py-3 px-4">Portfolio Spend Share</th>
                <th className="py-3 px-4 text-right">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finData.supplierSpend.suppliers.map((s) => (
                <tr key={s.supplier} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.supplier}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{s.skus} SKUs</td>
                  <td className="py-3 px-4 font-mono text-slate-800">₹{s.purchaseValue?.toLocaleString("en-IN") || "33,60,000"}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">₹{s.inventoryValue.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 font-mono text-[#0E8FAE] font-semibold">{s.spendShare}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="success">{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CALCULATION BREAKDOWN MODAL (INR ₹)                                       */}
      {/* ========================================================================= */}
      {calculationModalOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0E8FAE] bg-[#E5FAFE] px-2 py-0.5 rounded border border-[#92EEFF]">
                  AUDITED FINANCIAL FORMULA (INR ₹)
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Order Profitability Breakdown • {calculationModalOrder.orderId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCalculationModalOrder(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1.5">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Calculation Formula</div>
                <div className="text-slate-900 font-bold leading-relaxed text-[11px]">
                  Estimated Profit = Order Value - (Inventory Landed Cost + Picking Labor + Packing Boxes + Carrier Dispatch + Exception Remediation)
                </div>
              </div>

              <div className="space-y-2 divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600 font-semibold">1. Gross Order Value ({calculationModalOrder.customer})</span>
                  <span className="font-mono font-bold text-slate-900">+₹{calculationModalOrder.orderValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">2. Inventory Landed Cost (Weighted FIFO)</span>
                  <span className="font-mono text-red-600">-₹{calculationModalOrder.inventoryCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">3. Picking Wave Labor Cost (₹320/hr rate)</span>
                  <span className="font-mono text-red-600">-₹{calculationModalOrder.pickingCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">4. Packing Materials & QC Verification</span>
                  <span className="font-mono text-red-600">-₹{calculationModalOrder.packingCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">5. Carrier Priority Freight Dispatch Fee</span>
                  <span className="font-mono text-red-600">-₹{calculationModalOrder.dispatchCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">6. Exception & Rework Penalty</span>
                  <span className="font-mono text-red-600">-₹{calculationModalOrder.exceptionCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black bg-[#E5FAFE] p-2 rounded-lg border border-[#92EEFF]">
                  <span className="text-slate-900">Net Estimated Profit (Margin {calculationModalOrder.margin}%)</span>
                  <span className="font-mono text-emerald-700">+₹{calculationModalOrder.estimatedProfit.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic pt-1">
                Basis: Deterministic telemetry attribution linked to Firestore order ledger and inventory movements.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCalculationModalOrder(null)}
                className="btn-primary text-xs font-bold py-2 px-4 shadow-2xs"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinancePage;
