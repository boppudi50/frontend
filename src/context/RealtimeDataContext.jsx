import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { api } from "../services/api";

const RealtimeDataContext = createContext();

export const STOCKFLOW_HUBS = [
  {
    id: "HYD-01",
    code: "HYD-01",
    name: "HYD-01 — Hyderabad Central Hub",
    shortName: "HYD-01",
    city: "Hyderabad, Telangana",
    state: "Telangana",
    isMainHub: true,
    floorsCount: 6,
    capacity: "650,000 sq.ft",
    activeBays: 8,
    dailyVol: "68,000 Orders/day",
    coldChain: true,
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
  },
  {
    id: "MUM-01",
    code: "MUM-01",
    name: "MUM-01 — Mumbai Fulfillment Hub",
    shortName: "MUM-01",
    city: "Mumbai, Maharashtra",
    state: "Maharashtra",
    isMainHub: false,
    floorsCount: 2,
    capacity: "380,000 sq.ft",
    activeBays: 6,
    dailyVol: "42,000 Orders/day",
    coldChain: true,
    badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
  },
  {
    id: "VJA-01",
    code: "VJA-01",
    name: "VJA-01 — Vijayawada Fulfillment Hub",
    shortName: "VJA-01",
    city: "Vijayawada, Andhra Pradesh",
    state: "Andhra Pradesh",
    isMainHub: false,
    floorsCount: 2,
    capacity: "220,000 sq.ft",
    activeBays: 4,
    dailyVol: "24,000 Orders/day",
    coldChain: true,
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    id: "MAH-01",
    code: "MAH-01",
    name: "MAH-01 — Maharashtra Regional Hub",
    shortName: "MAH-01",
    city: "Pune / Aurangabad, Maharashtra",
    state: "Maharashtra",
    isMainHub: false,
    floorsCount: 2,
    capacity: "340,000 sq.ft",
    activeBays: 6,
    dailyVol: "36,000 Orders/day",
    coldChain: false,
    badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
  {
    id: "CHE-01",
    code: "CHE-01",
    name: "CHE-01 — Chennai Fulfillment Hub",
    shortName: "CHE-01",
    city: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    isMainHub: false,
    floorsCount: 2,
    capacity: "310,000 sq.ft",
    activeBays: 5,
    dailyVol: "32,000 Orders/day",
    coldChain: true,
    badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
  }
];


// Alias for backwards compatibility
export const WAREHOUSE_HUBS = STOCKFLOW_HUBS;

export function RealtimeDataProvider({ children }) {
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [decisionLogs, setDecisionLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activityStream, setActivityStream] = useState([]);
  const [attentionNeeded, setAttentionNeeded] = useState([]);
  const [financials, setFinancials] = useState(null);
  const [dockDoors, setDockDoors] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [climateSensors, setClimateSensors] = useState([]);
  
  // Active Warehouse Scope State ("ALL" | "HYD-01" | "MUM-01" | "VJA-01" | "MAH-01" | "CHE-01")
  const [activeScope, setActiveScope] = useState(() => localStorage.getItem("stockflow_scope") || "ALL");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [labelModalOrder, setLabelModalOrder] = useState(null);
  const [climateModalOpen, setClimateModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("CONNECTED");
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const simIntervalRef = useRef(null);

  const activeHub = STOCKFLOW_HUBS.find(h => h.id === activeScope) || null;
  const activeHubId = activeScope;

  const handleSelectScope = (scope) => {
    setActiveScope(scope);
    localStorage.setItem("stockflow_scope", scope);
  };

  const handleSelectHub = (hubId) => {
    handleSelectScope(hubId);
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus("RECONNECTING");
      fetchAllData();
    };
    const handleOffline = () => {
      setSyncStatus("DISCONNECTED");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus("DISCONNECTED");
      return;
    }

    try {
      const [
        metricsRes,
        ordersRes,
        inventoryRes,
        movementsRes,
        exceptionsRes,
        bottlenecksRes,
        notifsRes,
        decisionsRes,
        auditsRes,
        activityRes,
        attentionRes,
        dockRes,
        returnsRes,
        climateRes,
      ] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getOrders().catch(() => []),
        api.getInventory().catch(() => []),
        api.getMovements(50).catch(() => []),
        api.getExceptions().catch(() => []),
        api.getBottlenecks().catch(() => null),
        api.getNotifications().catch(() => []),
        api.getDecisionLogs(30).catch(() => []),
        api.getAuditLogs(30).catch(() => []),
        api.getActivityStream(30).catch(() => []),
        api.getAttentionNeeded().catch(() => []),
        api.getDockDoors().catch(() => []),
        api.getReturns().catch(() => []),
        api.getClimateTelemetry().catch(() => []),
      ]);

      if (metricsRes) setMetrics(metricsRes);
      if (ordersRes) setOrders(ordersRes);
      if (inventoryRes) setInventory(inventoryRes);
      if (movementsRes) setStockMovements(movementsRes);
      if (exceptionsRes) setExceptions(exceptionsRes);
      if (bottlenecksRes) setBottlenecks(bottlenecksRes);
      if (notifsRes) setNotifications(notifsRes);
      if (decisionsRes) setDecisionLogs(decisionsRes);
      if (auditsRes) setAuditLogs(auditsRes);
      if (activityRes) setActivityStream(activityRes);
      if (attentionRes) setAttentionNeeded(attentionRes);
      if (dockRes) setDockDoors(dockRes);
      if (returnsRes) setReturnsList(returnsRes);
      if (climateRes) setClimateSensors(climateRes);

      const finRes = await api.getFinancialIntelligence().catch(() => null);
      if (finRes) setFinancials(finRes);

      setLastSyncTime(new Date());
      setSyncStatus("CONNECTED");
      setConsecutiveErrors(0);
    } catch (err) {
      console.error("Realtime sync warning:", err.message);
      setConsecutiveErrors((prev) => {
        const next = prev + 1;
        if (next > 2) {
          setSyncStatus("DISCONNECTED");
        } else {
          setSyncStatus("RECONNECTING");
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 3 seconds for instant multi-device synchronization
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Simulation runner ticker
  const stepSimulation = useCallback(async () => {
    try {
      await api.stepSimulation();
      await fetchAllData();
    } catch (e) {
      console.error("Simulation step error:", e);
    }
  }, [fetchAllData]);

  useEffect(() => {
    if (simulationRunning) {
      simIntervalRef.current = setInterval(stepSimulation, 3500);
    } else if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulationRunning, stepSimulation]);

  const toggleSimulation = () => {
    setSimulationRunning((prev) => !prev);
  };

  const triggerRefresh = () => {
    return fetchAllData();
  };

  // =========================================================================
  // DYNAMIC SCOPE FILTERING & MULTI-BRANCH AGGREGATION SELECTORS
  // =========================================================================
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (activeScope === "ALL") return orders;
    return orders.filter(
      (o) => o.warehouseId === activeScope || o.fulfillmentCenterId === activeScope
    );
  }, [orders, activeScope]);

  const filteredInventory = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    if (activeScope === "ALL") return inventory;
    return inventory.filter(
      (i) => i.warehouseId === activeScope || i.fulfillmentCenterId === activeScope
    );
  }, [inventory, activeScope]);

  const filteredDockDoors = useMemo(() => {
    if (!dockDoors || dockDoors.length === 0) return [];
    if (activeScope === "ALL") return dockDoors;
    return dockDoors.filter(
      (d) => d.warehouseId === activeScope || d.fulfillmentCenterId === activeScope
    );
  }, [dockDoors, activeScope]);

  const filteredReturns = useMemo(() => {
    if (!returnsList || returnsList.length === 0) return [];
    if (activeScope === "ALL") return returnsList;
    return returnsList.filter(
      (r) => r.warehouseId === activeScope || r.fulfillmentCenterId === activeScope
    );
  }, [returnsList, activeScope]);

  const filteredClimateSensors = useMemo(() => {
    if (!climateSensors || climateSensors.length === 0) return [];
    if (activeScope === "ALL") return climateSensors;
    return climateSensors.filter(
      (c) => c.warehouseId === activeScope || c.fulfillmentCenterId === activeScope
    );
  }, [climateSensors, activeScope]);

  const filteredExceptions = useMemo(() => {
    if (!exceptions || exceptions.length === 0) return [];
    if (activeScope === "ALL") return exceptions;
    return exceptions.filter(
      (e) => e.warehouseId === activeScope || e.fulfillmentCenterId === activeScope
    );
  }, [exceptions, activeScope]);

  const filteredActivityStream = useMemo(() => {
    if (!activityStream || activityStream.length === 0) return [];
    if (activeScope === "ALL") return activityStream;
    return activityStream.filter(
      (a) => !a.warehouseId || a.warehouseId === activeScope || a.fulfillmentCenterId === activeScope
    );
  }, [activityStream, activeScope]);

  const filteredDecisionLogs = useMemo(() => {
    if (!decisionLogs || decisionLogs.length === 0) return [];
    if (activeScope === "ALL") return decisionLogs;
    return decisionLogs.filter(
      (d) => !d.warehouseId || d.warehouseId === activeScope || d.fulfillmentCenterId === activeScope
    );
  }, [decisionLogs, activeScope]);

  const filteredAuditLogs = useMemo(() => {
    if (!auditLogs || auditLogs.length === 0) return [];
    if (activeScope === "ALL") return auditLogs;
    return auditLogs.filter(
      (a) => !a.warehouseId || a.warehouseId === activeScope || a.fulfillmentCenterId === activeScope
    );
  }, [auditLogs, activeScope]);

  // Dynamic Metrics Aggregator
  const filteredMetrics = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const dispatchedCount = filteredOrders.filter((o) =>
      ["DISPATCHED", "COMPLETED"].includes(o.status)
    ).length;
    const criticalCount = filteredOrders.filter(
      (o) => o.priorityLevel === "CRITICAL" && !["DISPATCHED", "COMPLETED"].includes(o.status)
    ).length;
    const pendingCount = filteredOrders.filter((o) =>
      ["CREATED", "ALLOCATED", "PICKING", "PACKING"].includes(o.status)
    ).length;

    const totalInvValue = filteredInventory.reduce((acc, it) => {
      const qty = it.currentQuantity || it.totalQuantity || 0;
      const price = it.costPrice || it.unitPrice || 5.0;
      return acc + qty * price;
    }, 0);

    const todayRev = filteredOrders
      .filter((o) => ["DISPATCHED", "COMPLETED", "READY_TO_DISPATCH"].includes(o.status))
      .reduce((acc, o) => acc + (parseFloat(o.totalAmount) || 0), 0);

    const lowStockCount = filteredInventory.filter(
      (i) => (i.availableQuantity || 0) <= (i.reorderPoint || i.reorderLevel || 40)
    ).length;

    const openExcCount = filteredExceptions.filter((e) =>
      ["OPEN", "IN_PROGRESS"].includes(e.status)
    ).length;

    const utilPct =
      activeScope === "HYD-01"
        ? 84.6
        : activeScope === "MUM-01"
        ? 79.2
        : activeScope === "VJA-01"
        ? 71.8
        : activeScope === "MAH-01"
        ? 76.5
        : activeScope === "CHE-01"
        ? 74.3
        : 78.4;

    return {
      totalWarehouses: activeScope === "ALL" ? 5 : 1,
      totalProducts: 1175,
      totalInventoryValue: Math.round(totalInvValue),
      totalOrders: totalOrdersCount,
      pendingOrders: pendingCount,
      atRiskOrders: criticalCount,
      lowStockProductsCount: lowStockCount,
      openExceptionsCount: openExcCount,
      ordersDispatched: dispatchedCount,
      fulfillmentRate: Math.round((dispatchedCount / Math.max(1, totalOrdersCount)) * 1000) / 10,
      avgFulfillmentMinutes: activeScope === "HYD-01" ? 28.4 : 34.2,
      qcPassRate: 98.2,
      warehouseUtilizationPct: utilPct,
      todayRevenue: Math.round(todayRev * 100) / 100
    };
  }, [filteredOrders, filteredInventory, filteredExceptions, activeScope]);

  // Branch Performance Comparison Matrix
  const branchPerformance = useMemo(() => {
    return STOCKFLOW_HUBS.map((hub) => {
      const hubOrders = orders.filter((o) => o.warehouseId === hub.id || o.fulfillmentCenterId === hub.id);
      const hubInv = inventory.filter((i) => i.warehouseId === hub.id || i.fulfillmentCenterId === hub.id);
      const hubExc = exceptions.filter((e) => e.warehouseId === hub.id || e.fulfillmentCenterId === hub.id);
      const hubBays = dockDoors.filter((d) => d.warehouseId === hub.id || d.fulfillmentCenterId === hub.id);

      const revenue = hubOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
      const invCost = hubOrders.reduce((sum, o) => sum + ((parseFloat(o.totalAmount) || 0) * 0.58), 0);
      const opCost = hubOrders.length * 48.50 + hubExc.length * 35.0;
      const profit = Math.max(0, revenue - invCost - opCost);
      const loss = hubExc.length * 45.0 + 120.0;
      const margin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 28.4;

      return {
        id: hub.id,
        code: hub.code,
        name: hub.name,
        shortName: hub.shortName,
        city: hub.city,
        isMainHub: hub.isMainHub,
        floorsCount: hub.floorsCount,
        capacity: hub.capacity,
        ordersCount: hubOrders.length,
        dispatchedCount: hubOrders.filter((o) => ["DISPATCHED", "COMPLETED"].includes(o.status)).length,
        revenue: Math.round(revenue * 100) / 100,
        operatingCost: Math.round(opCost * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        loss: Math.round(loss * 100) / 100,
        margin: margin,
        utilizationPct: hub.id === "HYD-01" ? 84.6 : hub.id === "MUM-01" ? 79.2 : hub.id === "VJA-01" ? 71.8 : hub.id === "MAH-01" ? 76.5 : 74.3,
        exceptionsCount: hubExc.length,
        activeBaysCount: hubBays.length || hub.activeBays
      };
    });
  }, [orders, inventory, exceptions, dockDoors]);

  const value = {
    // Primary State
    metrics: filteredMetrics,
    rawMetrics: metrics,
    orders: filteredOrders,
    rawOrders: orders,
    inventory: filteredInventory,
    rawInventory: inventory,
    stockMovements,
    exceptions: filteredExceptions,
    rawExceptions: exceptions,
    bottlenecks,
    notifications,
    decisionLogs: filteredDecisionLogs,
    auditLogs: filteredAuditLogs,
    activityStream: filteredActivityStream,
    attentionNeeded,
    financials,
    dockDoors: filteredDockDoors,
    rawDockDoors: dockDoors,
    returnsList: filteredReturns,
    rawReturnsList: returnsList,
    climateSensors: filteredClimateSensors,
    
    // Multi-Warehouse Hub State
    activeScope,
    setActiveScope: handleSelectScope,
    activeHub,
    activeHubId,
    setActiveHubId: handleSelectHub,
    stockflowHubs: STOCKFLOW_HUBS,
    warehouses: STOCKFLOW_HUBS,
    branchPerformance,

    // Modal Triggers
    scannerOpen,
    setScannerOpen,
    labelModalOrder,
    setLabelModalOrder,
    climateModalOpen,
    setClimateModalOpen,

    // System
    loading,
    syncStatus,
    lastSyncTime,
    consecutiveErrors,
    simulationRunning,
    toggleSimulation,
    refresh: triggerRefresh
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
}

export function useRealtimeData() {
  const context = useContext(RealtimeDataContext);
  if (!context) {
    throw new Error("useRealtimeData must be used within a RealtimeDataProvider");
  }
  return context;
}
