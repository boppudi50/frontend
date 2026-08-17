import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  ShieldCheck,
  Zap,
  Sliders,
  Bell,
  Sparkles,
  Loader2,
  Clock,
  Building2,
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ThermometerSnowflake,
  ScanBarcode,
  Scale,
  Lock,
  Download,
  RotateCcw,
  IndianRupee,
  Truck,
  Activity,
  Layers,
  Radio,
  Workflow
} from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export function SystemSettings() {
  const { toast } = useToast();

  // Tab Selection
  const [activeTab, setActiveTab] = useState("engines");

  // Form State: SLA Windows
  const [criticalSlaHours, setCriticalSlaHours] = useState(2.0);
  const [highSlaHours, setHighSlaHours] = useState(6.0);
  const [standardSlaHours, setStandardSlaHours] = useState(12.0);
  const [autoManifestCourierDispatch, setAutoManifestCourierDispatch] = useState(true);

  // Form State: Autonomous Engines
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [tspOptimization, setTspOptimization] = useState(true);
  const [dynamicSlotting, setDynamicSlotting] = useState(true);
  const [fefoExpiryControl, setFefoExpiryControl] = useState(true);
  const [autoReplenishmentThreshold, setAutoReplenishmentThreshold] = useState(20);
  const [maxWaveBatchSize, setMaxWaveBatchSize] = useState(25);
  const [coldChainTempThreshold, setColdChainTempThreshold] = useState(1.5);

  // Form State: Facility & Logistics
  const [defaultWarehouseId, setDefaultWarehouseId] = useState("HYD-01");
  const [crossDockMaxHours, setCrossDockMaxHours] = useState(4.0);

  // Form State: Security & Quality
  const [hhtStrictVerification, setHhtStrictVerification] = useState(true);
  const [qcWeightTolerancePercent, setQcWeightTolerancePercent] = useState(1.5);
  const [autoQuarantineDamaged, setAutoQuarantineDamaged] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60);

  // Form State: Notifications & System
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Operational State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSettings();
      if (res) {
        if (res.criticalSlaWindowHours !== undefined) setCriticalSlaHours(res.criticalSlaWindowHours);
        if (res.highSlaWindowHours !== undefined) setHighSlaHours(res.highSlaWindowHours);
        if (res.standardSlaWindowHours !== undefined) setStandardSlaHours(res.standardSlaWindowHours);
        if (res.smartWaveAllocationEnabled !== undefined) setAutoAllocation(res.smartWaveAllocationEnabled);
        if (res.tspRouteOptimizationEnabled !== undefined) setTspOptimization(res.tspRouteOptimizationEnabled);
        if (res.dynamicSlottingEnabled !== undefined) setDynamicSlotting(res.dynamicSlottingEnabled);
        if (res.fefoExpiryControlEnabled !== undefined) setFefoExpiryControl(res.fefoExpiryControlEnabled);
        if (res.autoReplenishmentThreshold !== undefined) setAutoReplenishmentThreshold(res.autoReplenishmentThreshold);
        if (res.maxWaveBatchSize !== undefined) setMaxWaveBatchSize(res.maxWaveBatchSize);
        if (res.coldChainTempThreshold !== undefined) setColdChainTempThreshold(res.coldChainTempThreshold);
        if (res.defaultWarehouseId !== undefined) setDefaultWarehouseId(res.defaultWarehouseId);
        if (res.crossDockMaxHours !== undefined) setCrossDockMaxHours(res.crossDockMaxHours);
        if (res.hhtBarcodeStrictVerification !== undefined) setHhtStrictVerification(res.hhtBarcodeStrictVerification);
        if (res.qcWeightTolerancePercent !== undefined) setQcWeightTolerancePercent(res.qcWeightTolerancePercent);
        if (res.autoQuarantineDamaged !== undefined) setAutoQuarantineDamaged(res.autoQuarantineDamaged);
        if (res.sessionTimeoutMinutes !== undefined) setSessionTimeoutMinutes(res.sessionTimeoutMinutes);
        if (res.alertNotificationsEnabled !== undefined) setAlertNotifications(res.alertNotificationsEnabled);
        if (res.soundAlertsEnabled !== undefined) setSoundAlerts(res.soundAlertsEnabled);
        if (res.autoManifestCourierDispatch !== undefined) setAutoManifestCourierDispatch(res.autoManifestCourierDispatch);
        if (res.updatedAt) setLastSavedTime(new Date(res.updatedAt).toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        criticalSlaWindowHours: parseFloat(criticalSlaHours),
        highSlaWindowHours: parseFloat(highSlaHours),
        standardSlaWindowHours: parseFloat(standardSlaHours),
        smartWaveAllocationEnabled: autoAllocation,
        tspRouteOptimizationEnabled: tspOptimization,
        dynamicSlottingEnabled: dynamicSlotting,
        fefoExpiryControlEnabled: fefoExpiryControl,
        autoReplenishmentThreshold: parseInt(autoReplenishmentThreshold, 10),
        maxWaveBatchSize: parseInt(maxWaveBatchSize, 10),
        coldChainTempThreshold: parseFloat(coldChainTempThreshold),
        defaultWarehouseId,
        crossDockMaxHours: parseFloat(crossDockMaxHours),
        hhtBarcodeStrictVerification: hhtStrictVerification,
        qcWeightTolerancePercent: parseFloat(qcWeightTolerancePercent),
        autoQuarantineDamaged,
        sessionTimeoutMinutes: parseInt(sessionTimeoutMinutes, 10),
        alertNotificationsEnabled: alertNotifications,
        soundAlertsEnabled: soundAlerts,
        autoManifestCourierDispatch,
        currencyCode: "INR",
        currencySymbol: "₹"
      };

      await api.updateSettings(payload);
      setSaved(true);
      setLastSavedTime(new Date().toLocaleTimeString());
      toast.success("Settings Saved", "System thresholds and autonomous rules updated in Cloud Firestore.");
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.message || "Failed to update system settings.");
      toast.error("Save Failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setCriticalSlaHours(2.0);
    setHighSlaHours(6.0);
    setStandardSlaHours(12.0);
    setAutoAllocation(true);
    setTspOptimization(true);
    setDynamicSlotting(true);
    setFefoExpiryControl(true);
    setAutoReplenishmentThreshold(20);
    setMaxWaveBatchSize(25);
    setColdChainTempThreshold(1.5);
    setDefaultWarehouseId("HYD-01");
    setCrossDockMaxHours(4.0);
    setHhtStrictVerification(true);
    setQcWeightTolerancePercent(1.5);
    setAutoQuarantineDamaged(true);
    setSessionTimeoutMinutes(60);
    setAlertNotifications(true);
    setSoundAlerts(true);
    setAutoManifestCourierDispatch(true);
    toast.info("Defaults Restored", "Loaded factory enterprise defaults. Click 'Save Configuration' to commit.");
  };

  const handleExportConfig = () => {
    const configData = {
      version: "2.4.0",
      company: "StockFlow Global Logistics India",
      exportedAt: new Date().toISOString(),
      parameters: {
        criticalSlaHours,
        highSlaHours,
        standardSlaHours,
        autoAllocation,
        tspOptimization,
        dynamicSlotting,
        fefoExpiryControl,
        autoReplenishmentThreshold,
        maxWaveBatchSize,
        coldChainTempThreshold,
        defaultWarehouseId,
        crossDockMaxHours,
        hhtStrictVerification,
        qcWeightTolerancePercent,
        autoQuarantineDamaged,
        sessionTimeoutMinutes,
        currencyCode: "INR",
        currencySymbol: "₹"
      }
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockflow-wms-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration Exported", "Downloaded JSON backup of operational parameters.");
  };

  const tabs = [
    { id: "engines", label: "Autonomous AI & Heuristics", icon: Cpu },
    { id: "sla", label: "SLA Urgency & Waves", icon: Clock },
    { id: "hubs", label: "Multi-Hub Network", icon: Building2 },
    { id: "qc_security", label: "Quality, HHT & Security", icon: ShieldCheck },
    { id: "telemetry", label: "Alerts & Telemetry", icon: Bell },
    { id: "maintenance", label: "Cloud Maintenance", icon: RefreshCw },
  ];

  return (
    <div className="space-y-6 w-full pb-20">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  System Configuration & Operational Parameters
                </h1>
                <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Firestore Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative multi-hub governance, AI wave heuristic thresholds, and SLA scoring rules across 5 StockFlow fulfillment centers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="btn-outline text-xs font-bold py-2 px-3.5 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5"
            title="Reset parameters to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleExportConfig}
            className="btn-outline text-xs font-bold py-2 px-3.5 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5"
            title="Export JSON Configuration Backup"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Decision Engines</span>
            <Cpu className="w-4 h-4 text-[#0E8FAE]" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {autoAllocation && tspOptimization && dynamicSlotting ? "4 Active Engines" : "Partial AI Active"}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" /> TSP S-Shape + Smart Wave + FEFO
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Critical SLA Window</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {criticalSlaHours}h Priority Cut-Off
          </div>
          <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
            <Flame className="w-3 h-3" /> +40 Urgency Score Boost
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Network Currency</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            ₹ INR (Indian Rupee)
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <span>Locked for Indian Fulfillment Hubs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Cloud Persistence</span>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            Cloud Firestore Sync
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <span>{lastSavedTime ? `Last synced at ${lastSavedTime}` : "Synchronized & Ready"}</span>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div>System Configuration Successfully Committed!</div>
            <div className="text-[11px] font-normal text-emerald-700">
              Parameters are immediately propagated to all 5 fulfillment centers, RF gun terminals, and automated picking engines.
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs font-bold text-red-800 flex items-center gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-2xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#0E8FAE] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Form Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-[#0E8FAE] animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* TAB 1: Autonomous AI & Heuristics */}
          {activeTab === "engines" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Cpu className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Autonomous Picking & Allocation Engines</h2>
                    <p className="text-xs text-slate-500">
                      Configure deterministic algorithms that govern automated wave creation, aisle routing, and replenishment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Smart Wave Allocation */}
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAllocation}
                      onChange={(e) => setAutoAllocation(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Smart Wave Allocation Engine</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-50 text-[#0E8FAE] border border-cyan-200">
                          AI Core
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Automatically aggregates and allocates inventory to incoming customer orders based on SLA deadline urgency, carrier departure, and warehouse zone density.
                      </p>
                    </div>
                  </label>

                  {/* TSP Route Optimization */}
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tspOptimization}
                      onChange={(e) => setTspOptimization(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Traveling Salesperson (TSP) Pick Router</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          S-Shape Heuristic
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Computes the shortest physical aisle path for RF gun pickers, minimizing floor walking distances by up to 34% per wave.
                      </p>
                    </div>
                  </label>

                  {/* Dynamic Slotting */}
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dynamicSlotting}
                      onChange={(e) => setDynamicSlotting(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Dynamic Velocity Slotting Engine</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Fast-Mover Slotting
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Dynamically positions high-velocity fast-moving SKUs into ergonomic waist-level bins (Zone A & B front bays) for rapid retrieval.
                      </p>
                    </div>
                  </label>

                  {/* FEFO Expiry Interceptor */}
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fefoExpiryControl}
                      onChange={(e) => setFefoExpiryControl(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>FEFO Expiry Quarantine Interceptor</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Strict Compliance
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Enforces First-Expiry First-Out picking for food, pharmaceuticals, and perishable goods, automatically quarantining batches nearing shelf-life limit.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Threshold Values */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Sliders className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Numerical Heuristic Thresholds</h2>
                    <p className="text-xs text-slate-500">Quantitative trigger limits for automated warehouse events.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block text-slate-700 font-bold">
                      Auto-Replenishment Threshold
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={autoReplenishmentThreshold}
                        onChange={(e) => setAutoReplenishmentThreshold(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Triggers internal warehouse replenishment task from Bulk Overstock to Pick Face.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block text-slate-700 font-bold">
                      Max Wave Batch Size
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={maxWaveBatchSize}
                        onChange={(e) => setMaxWaveBatchSize(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">Orders</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Maximum number of customer orders bundled into a single physical picking tote run.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block text-slate-700 font-bold">
                      Cold Chain Temp Spike Alert
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="10.0"
                        value={coldChainTempThreshold}
                        onChange={(e) => setColdChainTempThreshold(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">± °C</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Permitted temperature deviation before IoT sensors flag an active Reefer chamber alert.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLA Urgency & Waves */}
          {activeTab === "sla" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Clock className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">SLA Urgency Scoring Windows</h2>
                    <p className="text-xs text-slate-500">
                      Configure dynamic time horizons that dictate order priority scoring and emergency wave dispatch.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2">
                    <div className="flex items-center justify-between font-bold text-rose-800">
                      <span>Critical Priority Window</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">+40 Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={criticalSlaHours}
                        onChange={(e) => setCriticalSlaHours(e.target.value)}
                        className="w-full p-2.5 bg-white border border-rose-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-rose-300"
                      />
                      <span className="text-slate-600 font-bold shrink-0">Hours</span>
                    </div>
                    <p className="text-[11px] text-rose-700/80">
                      Orders with less than this remaining time receive highest picking priority and express packing bypass.
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between font-bold text-amber-800">
                      <span>High Priority Window</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">+30 Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1.0"
                        max="48"
                        value={highSlaHours}
                        onChange={(e) => setHighSlaHours(e.target.value)}
                        className="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-300"
                      />
                      <span className="text-slate-600 font-bold shrink-0">Hours</span>
                    </div>
                    <p className="text-[11px] text-amber-700/80">
                      Orders falling into this window receive second-tier wave batching.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-2">
                    <div className="flex items-center justify-between font-bold text-blue-800">
                      <span>Standard SLA Window</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">+15 Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="2.0"
                        max="72"
                        value={standardSlaHours}
                        onChange={(e) => setStandardSlaHours(e.target.value)}
                        className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-300"
                      />
                      <span className="text-slate-600 font-bold shrink-0">Hours</span>
                    </div>
                    <p className="text-[11px] text-blue-700/80">
                      Standard batch orders grouped for scheduled consolidation.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Auto-Manifest Express Courier Dispatch</div>
                      <div className="text-[11px] text-slate-500">
                        Automatically generates carrier AWB shipping labels (Delhivery, BlueDart, Shadowfax) once 6-Point QC verifies order weight.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoManifestCourierDispatch}
                      onChange={(e) => setAutoManifestCourierDispatch(e.target.checked)}
                      className="w-4 h-4 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Hub Network */}
          {activeTab === "hubs" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Multi-Hub Network Governance</h2>
                    <p className="text-xs text-slate-500">
                      Fulfillment centers, primary control tower hub, and inter-branch linehaul configurations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <label className="block text-slate-700 font-bold">
                      Primary Network Controller Hub
                    </label>
                    <select
                      value={defaultWarehouseId}
                      onChange={(e) => setDefaultWarehouseId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-[#92EEFF]"
                    >
                      <option value="HYD-01">HYD-01: Hyderabad Central Super-Hub</option>
                      <option value="MUM-01">MUM-01: Mumbai West Fulfillment Center</option>
                      <option value="VJA-01">VJA-01: Vijayawada Express Node</option>
                      <option value="MAH-01">MAH-01: Maharashtra Linehaul Gateway</option>
                      <option value="CHE-01">CHE-01: Chennai Port Marine Hub</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Default facility for network-wide telemetry synchronization and cross-hub allocations.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <label className="block text-slate-700 font-bold">
                      Cross-Docking Max Dwell Window
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="1.0"
                        max="48.0"
                        value={crossDockMaxHours}
                        onChange={(e) => setCrossDockMaxHours(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">Hours</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Maximum inbound staging duration at bay doors before cross-docked pallets are routed directly to outbound carriers.
                    </p>
                  </div>
                </div>

                {/* 5 Hubs Status Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden mt-2">
                  <div className="p-3 bg-slate-50 text-xs font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
                    <span>Active StockFlow Fulfillment Network (5 Hubs)</span>
                    <span className="text-emerald-700 font-mono">100% Operational</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {[
                      { code: "HYD-01", name: "Hyderabad Central Super-Hub", loc: "Shamshabad, Telangana", role: "Primary Network Controller" },
                      { code: "MUM-01", name: "Mumbai West Fulfillment Center", loc: "Bhiwandi, Maharashtra", role: "High-Velocity FMCG & Electronics" },
                      { code: "VJA-01", name: "Vijayawada Express Node", loc: "Gannavaram, Andhra Pradesh", role: "Agricultural & Tier-2 Distribution" },
                      { code: "MAH-01", name: "Maharashtra Linehaul Gateway", loc: "Pune Logistics Corridor", role: "Heavy Cargo & Industrial Freight" },
                      { code: "CHE-01", name: "Chennai Port Marine Hub", loc: "Ennore Port SEZ, Tamil Nadu", role: "Inbound Maritime Container Freight" },
                    ].map((hub) => (
                      <div key={hub.code} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {hub.code}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">{hub.name}</div>
                            <div className="text-[11px] text-slate-400">{hub.loc}</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#0E8FAE] bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                          {hub.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Quality, HHT & Security */}
          {activeTab === "qc_security" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">RF Gun HHT & 6-Point QC Verification</h2>
                    <p className="text-xs text-slate-500">
                      Barcode scanning strictness, weight scale tolerance, and inventory quarantine triggers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hhtStrictVerification}
                      onChange={(e) => setHhtStrictVerification(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ScanBarcode className="w-3.5 h-3.5 text-[#0E8FAE]" />
                        <span>Strict 2D Barcode & GS1-128 Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Forces RF gun operators to scan the exact bin barcode before unlocking item picking, eliminating wrong-item pick errors.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoQuarantineDamaged}
                      onChange={(e) => setAutoQuarantineDamaged(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-500" />
                        <span>Instant Damage Quarantine Freeze</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Instantly locks defective/damaged inventory from active allocation waves upon QC flag until supervisor review.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block text-slate-700 font-bold flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#0E8FAE]" />
                      <span>6-Point QC Weight Scale Tolerance</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10.0"
                        value={qcWeightTolerancePercent}
                        onChange={(e) => setQcWeightTolerancePercent(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">± %</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Permitted package weight discrepancy at QC station before automated exception alert is raised.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <label className="block text-slate-700 font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0E8FAE]" />
                      <span>Operator Session Inactivity Timeout</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={sessionTimeoutMinutes}
                        onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-[#92EEFF]"
                      />
                      <span className="text-slate-500 font-bold shrink-0">Minutes</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Automatically locks RF guns and management workstations during inactivity for compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Alerts & Telemetry */}
          {activeTab === "telemetry" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Bell className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Alert Dispatch & Telemetry Channels</h2>
                    <p className="text-xs text-slate-500">
                      Configure instant notification broadcasting for operational exceptions, SLA breaches, and cold chain alerts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertNotifications}
                      onChange={(e) => setAlertNotifications(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Real-Time In-App Alert Notifications</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Broadcasts immediate top-bar toast alerts to all active floor supervisors upon critical order SLA or inventory breach.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundAlerts}
                      onChange={(e) => setSoundAlerts(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#0E8FAE] rounded border-slate-300 focus:ring-[#92EEFF]"
                    />
                    <div>
                      <div className="font-bold text-slate-900">Auditory Chime on RF Gun Barcode Mismatch</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Plays audio confirmation tones on handheld scanners during successful picks or error buzzers during barcode mismatches.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Cloud Maintenance */}
          {activeTab === "maintenance" && (
            <div className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <RefreshCw className="w-5 h-5 text-[#0E8FAE]" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Cloud Firestore Persistence & Storage</h2>
                    <p className="text-xs text-slate-500">
                      Maintain zero-data-loss database caches and verify synchronization integrity.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Cloud Firestore Database Health</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All system configurations, users, product catalogs, and real-time inventory levels are synchronized with cloud collections.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={loadSettings}
                        className="btn-outline text-xs font-bold py-1.5 px-3 text-slate-700 bg-white"
                      >
                        Verify Firestore Connection
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#0E8FAE]" />
                      <span>Full Operational Parameter Snapshot</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Download a complete timestamped backup of the current warehouse operations configuration.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleExportConfig}
                        className="btn-primary text-xs font-bold py-1.5 px-3 text-slate-950"
                      >
                        Download Backup JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-xl flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0E8FAE]" />
              <span>
                Changes persist automatically across all 5 StockFlow fulfillment centers & RF gun terminals.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadSettings}
                className="btn-outline text-xs font-bold py-2.5 px-4 text-slate-700 bg-white"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs font-bold py-2.5 px-6 text-slate-950 flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "Saving to Cloud Firestore..." : "Save System Configuration"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
