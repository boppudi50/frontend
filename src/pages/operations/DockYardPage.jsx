import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import {
  Truck,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Zap,
  Package,
  Layers,
  MapPin,
  Barcode,
  Search,
  SlidersHorizontal,
  FileText,
  Lock,
  Snowflake,
  ExternalLink,
  Printer,
  ChevronRight,
  Shield,
  Eye
} from "lucide-react";

export function DockYardPage() {
  const { dockDoors = [], refresh, loading, activeScope } = useRealtimeData() || {};
  const { toast } = useToast();
  
  const [selectedBayForDetail, setSelectedBayForDetail] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningBay, setAssigningBay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Assign modal state
  const [carrierInput, setCarrierInput] = useState("StockFlow Inbound Linehaul (32ft Container)");
  const [driverInput, setDriverInput] = useState("Karan Sharma");
  const [plateInput, setPlateInput] = useState("TS-09-SF-1088");
  const [cargoInput, setCargoInput] = useState("Master Cartons & Palletized Consignments");
  const [zoneInput, setZoneInput] = useState("Zone A");
  const [actionLoading, setActionLoading] = useState(false);

  // Compute metrics
  const inboundCount = dockDoors.filter((d) => d.type === "INBOUND").length;
  const outboundCount = dockDoors.filter((d) => d.type === "OUTBOUND").length;
  const crossDockCount = dockDoors.filter((d) => d.type === "CROSS_DOCK").length;
  const activeUnloadingCount = dockDoors.filter((d) => ["UNLOADING", "LOADING", "CROSS_DOCKING"].includes(d.status)).length;

  const filteredBays = useMemo(() => {
    return dockDoors.filter((bay) => {
      const matchesSearch =
        (bay.bayNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bay.carrier || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bay.vehicleNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bay.driverName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bay.gatePassId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bay.warehouseId || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "ALL" || bay.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || bay.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [dockDoors, searchQuery, typeFilter, statusFilter]);

  const handleOpenAssign = (bay) => {
    setAssigningBay(bay);
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assigningBay) return;
    setActionLoading(true);
    try {
      await api.assignDockDoor({
        bayId: assigningBay.id,
        carrier: carrierInput,
        driverName: driverInput,
        vehicleNumber: plateInput,
        cargoDescription: cargoInput,
        assignedZone: zoneInput
      });
      await refresh();
      toast.success(
        "Trailer Gate Entry Confirmed",
        `${carrierInput} (${plateInput}) docked at ${assigningBay.bayNumber}.`
      );
      setAssignModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Assignment Failed", "Unable to complete dock door check-in.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteUnload = async (bay) => {
    setActionLoading(true);
    try {
      await api.completeDockUnload({ bayId: bay.id });
      await refresh();
      toast.success(
        "Dock Bay Released",
        `${bay.bayNumber} (${bay.carrier}) completed ${bay.type === "INBOUND" ? "unloading" : "loading"}. Gate pass issued.`
      );
      if (selectedBayForDetail?.id === bay.id) {
        setSelectedBayForDetail(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Action Failed", "Unable to release dock bay.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Dock Doors & Fleet Yard Management (YMS)
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {activeScope === "ALL" ? "29 BAYS NETWORK" : `${dockDoors.length} ACTIVE BAYS`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time Inbound / Outbound trailer tracking, gate pass verification, and rapid cross-docking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              await refresh();
              toast.info("Yard Telemetry Synchronized", "Refreshed live dock door sensor positions & loading statuses.");
            }}
            disabled={loading}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Bays</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Inbound Receiving Bays
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {inboundCount} Active Bays
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            StockFlow Inbound Fleet Trailers
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-blue-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Outbound Linehaul Bays
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {outboundCount} Dispatch Bays
          </div>
          <span className="text-[11px] text-blue-700 font-semibold block">
            Linehaul 32ft & Express Wings
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-purple-500 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Cross-Dock Staging
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {crossDockCount} Transfer Bays
          </div>
          <span className="text-[11px] text-purple-700 font-semibold block">
            Rapid Metro Shuttle (Zero-Dwell)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 border-l-4 border-l-[#0E8FAE] shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround Time
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            34.2 min
          </div>
          <span className="text-[11px] text-[#0E8FAE] font-semibold block">
            -8.4 min vs standard 45m SLA
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: `All Bays (${dockDoors.length})` },
            { id: "INBOUND", label: `Inbound (${inboundCount})` },
            { id: "OUTBOUND", label: `Outbound (${outboundCount})` },
            { id: "CROSS_DOCK", label: `Cross-Dock (${crossDockCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTypeFilter(tab.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                typeFilter === tab.id
                  ? "bg-slate-900 text-[#92EEFF] shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Bay, Trailer, Plate, Driver..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNLOADING">Unloading</option>
            <option value="LOADING">Loading</option>
            <option value="CROSS_DOCKING">Cross Docking</option>
          </select>
        </div>
      </div>

      {/* Dock Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBays.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-400">
            No dock doors match the active filter criteria.
          </div>
        ) : (
          filteredBays.map((bay) => {
            const isUnloading = bay.status === "UNLOADING";
            const isLoading = bay.status === "LOADING";
            const isCrossDock = bay.status === "CROSS_DOCKING";
            const isFinished = bay.progressPct === 100;

            const borderTopColor =
              bay.type === "INBOUND"
                ? "border-t-emerald-500"
                : bay.type === "OUTBOUND"
                ? "border-t-blue-500"
                : "border-t-purple-500";

            return (
              <div
                key={bay.id}
                className={`bg-white rounded-2xl border border-slate-200 border-t-4 ${borderTopColor} p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 group`}
              >
                {/* Top: Bay Number & Type & Status */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-black text-slate-900">
                        {bay.bayNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {bay.warehouseId || "HYD-01"}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          bay.type === "INBOUND"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : bay.type === "OUTBOUND"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-purple-50 text-purple-800 border border-purple-200"
                        }`}
                      >
                        {bay.type}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isFinished
                          ? "bg-emerald-100 text-emerald-800"
                          : isUnloading
                          ? "bg-amber-100 text-amber-900 animate-pulse"
                          : isLoading
                          ? "bg-blue-100 text-blue-900 animate-pulse"
                          : "bg-purple-100 text-purple-900 animate-pulse"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{bay.status.replace(/_/g, " ")}</span>
                    </span>
                  </div>

                  {/* Carrier, Plate & Driver */}
                  <div className="mt-2.5 space-y-1">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {bay.carrier}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                      <span className="font-semibold text-slate-700">{bay.vehicleNumber}</span>
                      <span>{bay.driverName}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 truncate pt-0.5">
                      {bay.cargoDescription}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Pallet Staging */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span>Pallets: <b className="text-slate-900">{bay.palletsCompleted}</b> / {bay.palletsTotal}</span>
                    <span className="font-bold text-slate-900">{bay.progressPct}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        bay.type === "INBOUND"
                          ? "bg-emerald-500"
                          : bay.type === "OUTBOUND"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                      style={{ width: `${bay.progressPct}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-0.5">
                    <span>Zone: <b className="text-slate-700">{bay.assignedZone}</b></span>
                    <span>{bay.etaOrDeparture}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBayForDetail(bay)}
                    className="w-1/2 btn-outline text-[11px] font-semibold py-1.5 flex items-center justify-center gap-1 text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteUnload(bay)}
                    disabled={actionLoading}
                    className="w-1/2 btn-primary text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-slate-950" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* LIVE DOCK BAY INSPECTION DRAWER / MODAL                                   */}
      {/* ========================================================================= */}
      {selectedBayForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-slate-900 font-mono">
                      {selectedBayForDetail.bayNumber} • {selectedBayForDetail.type} Bay
                    </h3>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-900 text-[#92EEFF]">
                      {selectedBayForDetail.warehouseId || "HYD-01"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gate Pass ID: <b className="font-mono text-slate-800">{selectedBayForDetail.gatePassId}</b>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBayForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trailer & Fleet Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Assigned Carrier Fleet</div>
                <div className="font-bold text-slate-900">{selectedBayForDetail.carrier}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Plate: <b className="text-slate-800">{selectedBayForDetail.vehicleNumber}</b>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Driver & Contact</div>
                <div className="font-bold text-slate-900">{selectedBayForDetail.driverName}</div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Security Gate Check Verified</span>
                </div>
              </div>
            </div>

            {/* Cargo Breakdown & Pallet Progress */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Cargo Consignment & Pallet Staging
              </h4>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">{selectedBayForDetail.cargoDescription}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedBayForDetail.palletsCompleted} / {selectedBayForDetail.palletsTotal} Pallets
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#0E8FAE] rounded-full"
                    style={{ width: `${selectedBayForDetail.progressPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Destination: <b>{selectedBayForDetail.assignedZone}</b></span>
                  <span>Progress: <b className="text-slate-900">{selectedBayForDetail.progressPct}%</b></span>
                </div>
              </div>
            </div>

            {/* Security Seal & Telemetry Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Tamper Seal Status</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  SF-SEAL-882109
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">RFID Tag Active</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Snowflake className="w-3 h-3 text-blue-500" />
                  <span>Reefer Cargo Telemetry</span>
                </div>
                <div className="font-mono font-bold text-slate-900">
                  3.4°C (Reefer Active)
                </div>
                <div className="text-[10px] text-slate-500">Zone D Cold Storage Linked</div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.info(
                    "Gate Pass Dispatched",
                    `Gate pass ${selectedBayForDetail.gatePassId} sent to thermal printer for Driver ${selectedBayForDetail.driverName}.`
                  );
                }}
                className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Gate Pass</span>
              </button>

              <button
                type="button"
                onClick={() => handleCompleteUnload(selectedBayForDetail)}
                disabled={actionLoading}
                className="btn-primary text-xs font-bold py-2 px-4 shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Complete & Release Bay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECK-IN / ASSIGN TRAILER MODAL                                           */}
      {/* ========================================================================= */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0E8FAE]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Assign Trailer to {assigningBay?.bayNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Carrier Fleet</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="StockFlow Inbound Linehaul (32ft Container)">StockFlow Inbound Linehaul (32ft Container)</option>
                  <option value="StockFlow Cold-Chain Reefer Express">StockFlow Cold-Chain Reefer Express</option>
                  <option value="StockFlow Air Cargo Feeder Wing">StockFlow Air Cargo Feeder Wing</option>
                  <option value="StockFlow Urban Shuttle Fleet">StockFlow Urban Shuttle Fleet</option>
                  <option value="Delhivery Surface Cargo">Delhivery Surface Cargo</option>
                  <option value="Blue Dart Aviation Express">Blue Dart Aviation Express</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverInput}
                    onChange={(e) => setDriverInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle License Plate</label>
                  <input
                    type="text"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cargo Description</label>
                <input
                  type="text"
                  value={cargoInput}
                  onChange={(e) => setCargoInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Warehouse Zone</label>
                <select
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="Zone A">Zone A - Personal Care & Cosmetics</option>
                  <option value="Zone B">Zone B - Detergents & Cleaning Supplies</option>
                  <option value="Zone C">Zone C - Packaged Foods & Dry Grocery</option>
                  <option value="Zone D">Zone D - Cold Chain & Beverages</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs font-bold py-2 px-4 shadow-sm"
                >
                  Confirm Gate Entry & Dock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
