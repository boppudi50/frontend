import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import {
  GitPullRequestDraft,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  Barcode,
  Navigation,
  ArrowRight,
  TrendingDown,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Search,
  RotateCcw,
  ShieldAlert,
  X,
  RefreshCw,
  Boxes,
  User,
  ChevronRight
} from "lucide-react";

export function PickingPage() {
  const { refresh, activeScope, setScannerOpen } = useRealtimeData() || {};
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [scannedItems, setScannedItems] = useState({});
  const [scanModalItem, setScanModalItem] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [mismatchAlert, setMismatchAlert] = useState(null);
  const [missingSweepResult, setMissingSweepResult] = useState(null);

  const fetchTasks = async (showToastNotice = false) => {
    try {
      const res = await api.getPickingTasks();
      setTasks(res);
      if (res.length > 0 && !activeTask) {
        setActiveTask(res[0]);
      }
      if (showToastNotice) {
        toast.info("Waves Synchronized", `Updated ${res.length} active wave picking tasks.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        (t.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedPickerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.items || []).some(it => (it.sku || "").toLowerCase().includes(searchQuery.toLowerCase()) || (it.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPriority = priorityFilter === "ALL" || t.priorityLevel === priorityFilter;
      const matchesScope = !activeScope || activeScope === "ALL" || t.warehouseId === activeScope || t.fulfillmentCenterId === activeScope;
      return matchesSearch && matchesPriority && matchesScope;
    });
  }, [tasks, searchQuery, priorityFilter, activeScope]);

  useEffect(() => {
    if (filteredTasks.length > 0 && !activeTask) {
      setActiveTask(filteredTasks[0]);
    } else if (filteredTasks.length > 0 && activeTask) {
      const updated = filteredTasks.find(t => t.id === activeTask.id);
      if (updated) setActiveTask(updated);
    }
  }, [filteredTasks]);

  const handleOpenScanner = (item) => {
    setScanModalItem(item);
    setBarcodeInput(item.sku);
    setMismatchAlert(null);
  };

  const handleVerifyBarcode = async (e) => {
    e.preventDefault();
    if (!scanModalItem || !activeTask) return;

    try {
      const res = await api.scanVerifyItem({
        orderId: activeTask.orderNumber,
        expectedSku: scanModalItem.sku,
        scannedSku: barcodeInput.trim()
      });

      if (!res.matched) {
        setMismatchAlert(res);
        toast.error("Barcode Mismatch Intercepted", `Scanned ${barcodeInput.trim()} does not match expected SKU ${scanModalItem.sku}!`);
      } else {
        setScannedItems((prev) => ({ ...prev, [scanModalItem.sku]: true }));
        setScanModalItem(null);
        setMismatchAlert(null);
        toast.success("SKU Barcode Confirmed", `Verified ${scanModalItem.name} for Bin ${scanModalItem.bin}.`);
        await refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Scan Error", "Unable to communicate with RF validation service.");
    }
  };

  const handleReportMissing = async (item) => {
    setLoading(true);
    try {
      toast.warning("Missing Item Sweep Initiated", `Autonomous search initiated for ${item.sku} in adjacent bins...`);
      const res = await api.missingItemSweep({
        sku: item.sku,
        expectedBin: item.bin,
        orderId: activeTask.orderNumber
      });
      setMissingSweepResult(res);
      if (res.alternativeLocationFound) {
        toast.success("Alternative Location Found", `Stock located at Bin ${res.alternativeLocationFound}.`);
      }
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePick = async (taskId) => {
    setLoading(true);
    try {
      await api.completePickingTask(taskId);
      toast.success(
        "Pick Wave Completed",
        `Order ${activeTask?.orderNumber} delivered to Packing Station 04 with TSP optimization.`
      );
      await refresh();
      await fetchTasks();
    } catch (e) {
      console.error(e);
      toast.error("Completion Failed", "Unable to complete picking task.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Picking Operations & TSP Route Optimization
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  TSP ENGINE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dynamic Traveling Salesperson green corridor pathing reduces cycle times by up to 38.8%
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchTasks()}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Waves</span>
          </button>

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="btn-primary text-xs font-bold py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Barcode className="w-4 h-4 text-slate-950" />
            <span>HHT RF Gun</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Column (10+ Scrollable Wave Tasks) + Right Column (Sticky TSP Terminal) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE WAVE TASK QUEUE (10+ Tasks)                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search & Filter Header Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Active Wave Pick Queue</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-100 text-cyan-900 font-mono text-[11px]">
                  {filteredTasks.length} Waves
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
                placeholder="Search Order #, SKU, Picker..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
              />
            </div>
          </div>

          {/* SCROLLABLE TASK LIST */}
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto pr-1.5 space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No wave picking tasks active for this fulfillment center.
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isSelected = activeTask?.id === t.id;
                const totalUnits = (t.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTask(t);
                      setMissingSweepResult(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#0E8FAE] bg-[#F0FDFF] shadow-sm ring-2 ring-[#92EEFF]/40"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {t.orderNumber}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {t.warehouseId || "HYD-01"}
                        </span>
                      </div>
                      <Badge variant={t.priorityLevel}>{t.priorityLevel}</Badge>
                    </div>

                    <div className="mt-2 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-slate-600 font-bold">
                          Aisles: {t.routeSequence?.join(" → ") || "A-01"}
                        </span>
                        <span className="font-semibold text-emerald-700 font-mono text-[11px]">
                          -{t.timeSavedMinutes}m saved
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="truncate max-w-[150px]">Picker: <b>{t.assignedPickerName}</b></span>
                        <span className="font-mono font-bold text-slate-700">{t.items?.length || 1} SKUs ({totalUnits} Units)</span>
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
        {/* RIGHT COLUMN: STICKY ROUTE OPTIMIZER & PICK TERMINAL                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 sticky top-20">
          {activeTask ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              
              {/* Route Efficiency Highlight Card */}
              <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0E8FAE]/40 via-[#0A2E50] to-[#041628] text-white rounded-xl p-4 shadow-xl border border-[#38D2F3]/40 space-y-2.5 relative overflow-hidden">
                {/* Luminous Glow Ambient Light */}
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-bl from-[#92EEFF]/30 via-[#38D2F3]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#92EEFF]">
                    <Sparkles className="w-4 h-4 text-[#92EEFF] drop-shadow-[0_0_8px_rgba(146,238,255,0.6)]" />
                    <span>Optimized Pick Route: {activeTask.orderNumber}</span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-xs">
                    +38.8% Efficiency
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-white/15 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/10">
                    <div className="text-[9.5px] text-slate-300 font-bold uppercase tracking-wider">Standard Route</div>
                    <div className="text-sm sm:text-base font-black text-slate-200 font-mono mt-0.5">
                      {activeTask.unoptimizedRouteTimeMinutes} min
                    </div>
                  </div>
                  <div className="bg-[#92EEFF]/15 backdrop-blur-md rounded-lg p-2 border border-[#92EEFF]/30">
                    <div className="text-[9.5px] text-[#92EEFF] font-bold uppercase tracking-wider">Optimized TSP Route</div>
                    <div className="text-sm sm:text-base font-black text-[#92EEFF] font-mono mt-0.5">
                      {activeTask.optimizedRouteTimeMinutes} min
                    </div>
                  </div>
                  <div className="bg-emerald-500/15 backdrop-blur-md rounded-lg p-2 border border-emerald-400/30">
                    <div className="text-[9.5px] text-emerald-300 font-bold uppercase tracking-wider">Time Saved</div>
                    <div className="text-sm sm:text-base font-black text-emerald-300 font-mono mt-0.5">
                      {activeTask.timeSavedMinutes} mins
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoint Steps Ribbon */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Green Corridor Waypoint Path
                </h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                    Depot Start (Dock 01)
                  </div>
                  {activeTask.routeSequence?.map((bin, idx) => (
                    <React.Fragment key={idx}>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="px-3 py-1.5 rounded-lg bg-[#E5FAFE] border border-[#92EEFF] text-xs font-bold font-mono text-[#0E8FAE] shrink-0 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Bin {bin}</span>
                      </div>
                    </React.Fragment>
                  ))}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shrink-0">
                    Packing Station 04
                  </div>
                </div>
              </div>

              {/* Missing Item Investigation Banner */}
              {missingSweepResult && (
                <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0E8FAE] uppercase">
                      <Sparkles className="w-4 h-4" />
                      <span>Alternative Location Discovered</span>
                    </div>
                    <Badge variant="success">Found at {missingSweepResult.alternativeLocationFound}</Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{missingSweepResult.decision}</p>
                  <p className="text-xs text-slate-600">{missingSweepResult.reason}</p>
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setMissingSweepResult(null)}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      Accept Alternative Bin & Resume Pick
                    </button>
                  </div>
                </div>
              )}

              {/* Item Checklist & Barcode Scan */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pick Verification & RF Scan Confirmation
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeTask.items?.map((it) => {
                    const isScanned = scannedItems[it.sku] || it.picked > 0;

                    return (
                      <div
                        key={it.sku}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isScanned
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-slate-50/60 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                              isScanned ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {it.bin}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{it.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {it.sku} • Required: <span className="font-bold text-slate-800">{it.quantity} units</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isScanned && (
                            <button
                              type="button"
                              onClick={() => handleReportMissing(it)}
                              className="btn-outline text-xs py-1 px-2.5 text-amber-700 border-amber-300 hover:bg-amber-50"
                            >
                              Report Missing
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenScanner(it)}
                            className={`text-xs py-1.5 px-3 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                              isScanned
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "btn-primary"
                            }`}
                          >
                            {isScanned ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified</span>
                              </>
                            ) : (
                              <>
                                <Barcode className="w-3.5 h-3.5" />
                                <span>Scan SKU Barcode</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleCompletePick(activeTask.id)}
                  disabled={loading}
                  className="btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Deliver to Packing Station</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20 text-slate-400 space-y-2">
              <Navigation className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Select a Wave Task</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a wave picking task from the left queue to view the optimized waypoint route and RF pick terminal.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {scanModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#92EEFF] text-slate-950 flex items-center justify-center font-bold">
                  <Barcode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Scan Product Barcode</h3>
              </div>
              <button
                onClick={() => setScanModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyBarcode} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">Target Item</div>
                <div className="font-bold text-slate-900 text-sm">{scanModalItem.name}</div>
                <div className="font-mono text-slate-600">Expected SKU: <span className="font-bold text-slate-900">{scanModalItem.sku}</span> (Bin {scanModalItem.bin})</div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold uppercase tracking-wider mb-1">
                  Scanned Barcode / SKU
                </label>
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan or enter SKU..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: Change to <span className="font-mono font-bold text-red-600">DOVE-SHAMPOO-200</span> to test Wrong Item mismatch detection.
                </p>
              </div>

              {mismatchAlert && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 animate-in shake">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4" />
                    {mismatchAlert.title}
                  </div>
                  <p className="text-slate-800 font-medium text-xs">{mismatchAlert.decision}</p>
                  <p className="text-red-700 font-bold text-[11px] mt-1">{mismatchAlert.recommendedAction}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScanModalItem(null)}
                  className="btn-outline text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-bold py-2 px-4"
                >
                  Confirm Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
