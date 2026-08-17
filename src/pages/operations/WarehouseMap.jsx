import React, { useState, useMemo } from "react";
import { useRealtimeData, STOCKFLOW_HUBS } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { Badge } from "../../components/common/Badge";
import {
  MapPin,
  Package,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Snowflake,
  Thermometer,
  Truck,
  Barcode,
  Wind,
  Building2,
  Users,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  Lock,
  Printer,
  Scale,
  Compass
} from "lucide-react";

export function WarehouseMap() {
  const {
    inventory = [],
    climateSensors = [],
    dockDoors = [],
    activeScope,
    activeHub,
    setActiveScope,
    setClimateModalOpen,
    setScannerOpen,
    refresh,
    loading
  } = useRealtimeData() || {};

  const { toast } = useToast();

  const currentHub = activeHub || STOCKFLOW_HUBS[0];
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedBin, setSelectedBin] = useState("BAY-01");
  const [selectedZoneCode, setSelectedZoneCode] = useState("Zone 1A");
  const [binSearch, setBinSearch] = useState("");

  const inventoryList = Array.isArray(inventory) ? inventory : [];

  // Hyderabad 6-Floor Configuration
  const HYD_FLOORS_DATA = [
    {
      floorNumber: 1,
      title: "Floor 1: Receiving & Yard Management (YMS)",
      badge: "Inbound / Outbound",
      purpose: "Trailer check-in, unloading, gate passes, and cross-docking bays",
      totalUnitsEstimate: "38,400 Units Staged",
      floorType: "DOCK_YARD",
      zones: [
        {
          code: "Zone 1A",
          name: "Inbound Receiving Bays 01-04",
          dept: "Trailer Unload & Ingest",
          temp: "Ambient 24.2°C",
          bins: ["BAY-01", "BAY-02", "BAY-03", "BAY-04"],
          type: "DOCK_BAYS",
          color: "border-sky-300 bg-sky-50/40"
        },
        {
          code: "Zone 1B",
          name: "Rapid Cross-Dock Shuttles",
          dept: "Zero-Dwell Metro Transfer",
          temp: "Ambient 23.8°C",
          bins: ["BAY-08", "STG-X1", "STG-X2", "STG-X3"],
          type: "CROSS_DOCK",
          color: "border-purple-300 bg-purple-50/40"
        },
        {
          code: "Zone 1C",
          name: "Pallet Ingest QA Staging",
          dept: "Barcode & Gatepass Ingest",
          temp: "Ambient 22.5°C",
          bins: ["ING-01", "ING-02", "ING-03", "ING-04"],
          type: "QA_STAGING",
          color: "border-indigo-300 bg-indigo-50/40"
        }
      ]
    },
    {
      floorNumber: 2,
      title: "Floor 2: Inbound Storage & Bulk Put-Away",
      badge: "High-Bay Bulk",
      purpose: "Primary bulk carton receiving, high-bay racking, pallet put-away",
      totalUnitsEstimate: "142,000 Units in Bulk",
      floorType: "BULK_STORAGE",
      zones: [
        {
          code: "Zone 2A",
          name: "Bulk FMCG & Packaged Groceries",
          dept: "Dry Groceries & Staples (High-Bay 4-Level)",
          temp: "Ambient 21.0°C",
          bins: ["2A-01", "2A-02", "2A-03", "2A-04", "2A-05", "2A-06"],
          type: "BULK_RACK",
          color: "border-amber-300 bg-amber-50/40"
        },
        {
          code: "Zone 2B",
          name: "Chemical & Detergent Reserve",
          dept: "Cleaners & Industrial Surface Care",
          temp: "Ventilated 20.5°C",
          bins: ["2B-01", "2B-02", "2B-03", "2B-04", "2B-05", "2B-06"],
          type: "BULK_RACK",
          color: "border-orange-300 bg-orange-50/40"
        },
        {
          code: "Zone 2C",
          name: "Automotive & Hardware Staging",
          dept: "Heavy Spares & Lubricants",
          temp: "Ambient 22.0°C",
          bins: ["2C-01", "2C-02", "2C-03", "2C-04"],
          type: "BULK_RACK",
          color: "border-slate-300 bg-slate-50/60"
        }
      ]
    },
    {
      floorNumber: 3,
      title: "Floor 3: Main Inventory High-Density Storage",
      badge: "Active Pick Face",
      purpose: "Pick-face replenishment, high-density shelving, cold storage chambers",
      totalUnitsEstimate: "215,800 Units Active",
      floorType: "PICK_FACE",
      zones: [
        {
          code: "Zone A",
          name: "Personal Care, Skincare & Cosmetics",
          dept: "Minimalist, Cetaphil, Dettol, Nivea",
          temp: "Air Conditioned 21.4°C",
          bins: ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06"],
          type: "HIGH_DENSITY",
          color: "border-sky-300 bg-sky-50/40"
        },
        {
          code: "Zone B",
          name: "Detergents, Cleaners & Home Care",
          dept: "Surf Excel, Ariel, Harpic, Lizol",
          temp: "Ventilated 21.0°C",
          bins: ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06"],
          type: "HIGH_DENSITY",
          color: "border-amber-300 bg-amber-50/40"
        },
        {
          code: "Zone C",
          name: "Packaged Foods, Snacks & Confectionery",
          dept: "Tata Tea, Maggi, Oreo, Cadbury",
          temp: "Climate Controlled 20.0°C",
          bins: ["C-01", "C-02", "C-03", "C-04", "C-05", "C-06"],
          type: "HIGH_DENSITY",
          color: "border-emerald-300 bg-emerald-50/40"
        },
        {
          code: "Zone D",
          name: "Beverages & Deep Cold Storage (Reefer)",
          dept: "Amul Butter, Dairy, Red Bull, Tropicana",
          temp: "Cold-Chain 3.6°C",
          bins: ["D-01", "D-02", "D-03", "D-04", "D-05", "D-06"],
          type: "COLD_CHAIN",
          color: "border-cyan-300 bg-cyan-50/40"
        }
      ]
    },
    {
      floorNumber: 4,
      title: "Floor 4: Wave Picking & TSP Route Optimization",
      badge: "TSP Route Engine",
      purpose: "TSP Green Corridor pathing, multi-order tote batching, RF pick verification",
      totalUnitsEstimate: "48,200 Units in Totes",
      floorType: "WAVE_PICKING",
      zones: [
        {
          code: "Zone 4A",
          name: "High-Velocity Express Picking Corridor",
          dept: "E-Commerce D2C Fast Totes (TSP Path)",
          temp: "Ambient 21.5°C",
          bins: ["WAVE-01", "WAVE-02", "WAVE-03", "WAVE-04"],
          type: "TSP_CORRIDOR",
          color: "border-teal-300 bg-teal-50/40"
        },
        {
          code: "Zone 4B",
          name: "Batch Wave Consolidation Area",
          dept: "B2B Palletized Wave Assembly",
          temp: "Ambient 21.8°C",
          bins: ["TOTE-01", "TOTE-02", "TOTE-03", "TOTE-04"],
          type: "WAVE_STAGING",
          color: "border-blue-300 bg-blue-50/40"
        }
      ]
    },
    {
      floorNumber: 5,
      title: "Floor 5: Packing Stations & 6-Point QC Checkpoints",
      badge: "QC & Digital Scale",
      purpose: "Barcode scan verify, digital scale gross weight checks, auto-bagging",
      totalUnitsEstimate: "18,400 Units Packing",
      floorType: "PACKING_QC",
      zones: [
        {
          code: "Zone 5A",
          name: "Automated Packing Lines 1-12",
          dept: "Zebra Print & Box Sealing Lines",
          temp: "Comfort AC 21.0°C",
          bins: ["PACK-01", "PACK-02", "PACK-03", "PACK-04", "PACK-05", "PACK-06"],
          type: "PACKING_LINE",
          color: "border-indigo-300 bg-indigo-50/40"
        },
        {
          code: "Zone 5B",
          name: "6-Point QC Digital Inspection Stations",
          dept: "Vision & Tare Digital Weight Checks",
          temp: "Comfort AC 21.0°C",
          bins: ["QC-01", "QC-02", "QC-03", "QC-04"],
          type: "QC_STATION",
          color: "border-emerald-300 bg-emerald-50/40"
        }
      ]
    },
    {
      floorNumber: 6,
      title: "Floor 6: Outbound Linehaul Dispatch & Control Tower",
      badge: "Carrier Linehaul",
      purpose: "Carrier sortation, 4x6 thermal label verification, pallet linehaul sealing",
      totalUnitsEstimate: "62,900 Units Staged",
      floorType: "DISPATCH",
      zones: [
        {
          code: "Zone 6A",
          name: "Tier-1 Priority Air Dispatch Staging",
          dept: "Blue Dart Air Cargo & Express Feeder",
          temp: "Ambient 22.0°C",
          bins: ["DISP-01", "DISP-02", "DISP-03", "DISP-04"],
          type: "DISPATCH",
          color: "border-amber-300 bg-amber-50/40"
        },
        {
          code: "Zone 6B",
          name: "National Linehaul Bay 05-07 Staging",
          dept: "StockFlow 32ft Surface Linehaul",
          temp: "Ambient 22.5°C",
          bins: ["DISP-05", "DISP-06", "DISP-07", "DISP-08"],
          type: "DISPATCH",
          color: "border-cyan-300 bg-cyan-50/40"
        }
      ]
    }
  ];

  // Regional 2/3-Floor Template
  const REGIONAL_FLOORS_DATA = [
    {
      floorNumber: 1,
      title: "Floor 1: Dock Doors, Intake & Cold Storage",
      badge: "Intake & Logistics",
      purpose: "Dock bays, receiving, cold chain storage, dispatch staging",
      totalUnitsEstimate: "42,000 Units Staged",
      floorType: "DOCK_YARD",
      zones: [
        {
          code: "Zone 1A",
          name: "Inbound / Outbound Dock Bays",
          dept: "Dock Handover & Receiving",
          temp: "Ambient 23.5°C",
          bins: ["BAY-01", "BAY-02", "BAY-03", "BAY-04"],
          type: "DOCK_BAYS",
          color: "border-sky-300 bg-sky-50/40"
        },
        {
          code: "Zone 1B",
          name: "Cold Storage & Cross-Dock",
          dept: "Reefer Perishables 3.6°C",
          temp: "Cold-Chain 3.6°C",
          bins: ["COLD-01", "COLD-02", "COLD-03", "COLD-04"],
          type: "COLD_CHAIN",
          color: "border-cyan-300 bg-cyan-50/40"
        }
      ]
    },
    {
      floorNumber: 2,
      title: "Floor 2: High-Density Picking, Packing & QC",
      badge: "Pick & Pack Operations",
      purpose: "Shelving racks, wave picking, automated packing benches",
      totalUnitsEstimate: "68,400 Units Active",
      floorType: "PICK_FACE",
      zones: [
        {
          code: "Zone A",
          name: "Personal Care & Household Goods",
          dept: "Cosmetics, Soaps, Shampoos",
          temp: "AC 21.0°C",
          bins: ["A-01", "A-02", "A-03", "A-04", "A-05", "A-06"],
          type: "SHELVING",
          color: "border-sky-300 bg-sky-50/40"
        },
        {
          code: "Zone B",
          name: "Groceries & Packaged Foods",
          dept: "Snacks, Spices, Confectionery",
          temp: "Climate Controlled 20.5°C",
          bins: ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06"],
          type: "SHELVING",
          color: "border-amber-300 bg-amber-50/40"
        },
        {
          code: "Zone C",
          name: "Electronics & General Merchandise",
          dept: "Headphones, Cables, Small Appliances",
          temp: "AC 21.4°C",
          bins: ["C-01", "C-02", "C-03", "C-04", "C-05", "C-06"],
          type: "SHELVING",
          color: "border-emerald-300 bg-emerald-50/40"
        }
      ]
    }
  ];

  const currentFloors = currentHub.isMainHub ? HYD_FLOORS_DATA : REGIONAL_FLOORS_DATA;
  const currentFloorData = currentFloors.find((f) => f.floorNumber === activeFloor) || currentFloors[0];

  // Helper to find matching dock door on Floor 1
  const matchingDockDoor = useMemo(() => {
    if (!selectedBin) return null;
    const cleanBin = selectedBin.replace(/-/g, " ").toUpperCase();
    return dockDoors.find(
      (d) =>
        d.bayNumber.toUpperCase() === cleanBin ||
        d.bayNumber.replace(/\s+/g, "-").toUpperCase() === selectedBin ||
        d.id === selectedBin ||
        (selectedBin === "BAY-08" && d.bayNumber === "Bay 08")
    );
  }, [dockDoors, selectedBin]);

  // Items for pick-face inventory on Floor 3
  const binItems = useMemo(() => {
    return inventoryList.filter((i) => {
      const matchesBin = i.bin === selectedBin;
      const matchesSearch =
        !binSearch ||
        (i.name || "").toLowerCase().includes(binSearch.toLowerCase()) ||
        (i.sku || "").toLowerCase().includes(binSearch.toLowerCase());
      return matchesBin && matchesSearch;
    });
  }, [inventoryList, selectedBin, binSearch]);

  const handleSelectBranch = (hubId) => {
    setActiveScope(hubId);
    setActiveFloor(1);
    setSelectedBin("BAY-01");
    setSelectedZoneCode("Zone 1A");
    const hub = STOCKFLOW_HUBS.find((h) => h.id === hubId);
    toast.info("Switched Fulfillment Facility", `Loaded 2D Digital Twin layout for ${hub?.name || hubId}.`);
  };

  // Helper function to render bin button labels with real operational telemetry
  const getBinButtonSubtitle = (binCode) => {
    if (activeFloor === 1) {
      const door = dockDoors.find((d) => d.bayNumber.replace(/\s+/g, "-").toUpperCase() === binCode || d.bayNumber === binCode.replace(/-/g, " "));
      if (door) {
        return `${door.progressPct}% Unload`;
      }
      if (binCode.startsWith("ING")) return "Pallet Ingest";
      if (binCode.startsWith("STG")) return "Cross-Dock";
      return "Dock Active";
    }
    if (activeFloor === 2) return "16 Pallets";
    if (activeFloor === 3) {
      const count = inventoryList.filter((i) => i.bin === binCode).length;
      return count > 0 ? `${count} SKUs` : "Available";
    }
    if (activeFloor === 4) return "TSP Route Wave";
    if (activeFloor === 5) return "QC Bench Pass";
    if (activeFloor === 6) return "Linehaul Staged";
    return "Active";
  };

  const getFloorBadge = (flNum) => {
    switch (flNum) {
      case 1:
        return "DOCK DOORS & YMS";
      case 2:
        return "HIGH-BAY BULK RACKS";
      case 3:
        return "ACTIVE PICK FACE";
      case 4:
        return "TSP WAVE PICKING";
      case 5:
        return "PACKING & QC BENCH";
      case 6:
        return "LINEHAUL DISPATCH";
      default:
        return "ACTIVE FLOOR";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5FAFE] text-[#0E8FAE] flex items-center justify-center font-bold border border-[#92EEFF]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  StockFlow Digital Twin & 2D Floor Plan
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {currentHub.code}
                </span>
                {currentHub.isMainHub && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono">
                    6-FLOOR MAIN HUB
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Live spatial telemetry for {currentHub.name} ({currentHub.city}) • {currentHub.capacity}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setClimateModalOpen(true)}
            className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-blue-800 bg-blue-50/80 border-blue-200"
          >
            <Snowflake className="w-4 h-4 text-blue-600" />
            <span>Cold-Chain Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="btn-primary text-xs font-bold py-2 px-3 flex items-center gap-1.5 shadow-2xs"
          >
            <Barcode className="w-4 h-4 text-slate-950" />
            <span>Verify Bin / RF Scan</span>
          </button>
        </div>
      </div>

      {/* 5-Branch Facility Quick Selector Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Select StockFlow Fulfillment Center (5 Network Facilities)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {STOCKFLOW_HUBS.map((hub) => {
            const isSelected = activeScope === hub.id || (!activeScope && hub.id === "HYD-01");
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleSelectBranch(hub.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "border-[#0E8FAE] bg-[#F0FDFF] ring-2 ring-[#92EEFF]/40 shadow-xs"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{hub.id}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      hub.isMainHub ? "bg-cyan-100 text-cyan-900" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {hub.isMainHub ? "6 FLOORS" : "REGIONAL"}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-800 truncate mt-1">
                  {hub.city}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {hub.capacity}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Floor Navigation Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Floors:</span>
          </span>

          {currentFloors.map((fl) => {
            const isFlActive = activeFloor === fl.floorNumber;
            return (
              <button
                key={fl.floorNumber}
                type="button"
                onClick={() => {
                  setActiveFloor(fl.floorNumber);
                  if (fl.zones.length > 0 && fl.zones[0].bins.length > 0) {
                    setSelectedBin(fl.zones[0].bins[0]);
                    setSelectedZoneCode(fl.zones[0].code);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  isFlActive
                    ? "bg-slate-900 text-[#92EEFF] shadow-xs ring-2 ring-[#92EEFF]/30"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <span className="w-4 h-4 rounded bg-white/20 flex items-center justify-center font-mono text-[10px]">
                  {fl.floorNumber}
                </span>
                <span>{fl.title.split(":")[1] || fl.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isFlActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {fl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Layout: Left (Floor Plan) + Right (Selected Bin Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left 8 Cols: 2D Interactive Digital Twin Floor Plan */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900">{currentFloorData.title}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700 border">
                  {currentFloorData.totalUnitsEstimate}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentFloorData.purpose}</p>
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-700">Live Active</span>
              </span>
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                {currentFloorData.zones.length} Zones
              </span>
            </div>
          </div>

          {/* Floor Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFloorData.zones.map((zone) => {
              const isZoneActive = selectedZoneCode === zone.code;

              return (
                <div
                  key={zone.code}
                  className={`rounded-2xl border p-4 space-y-3 transition-all cursor-pointer ${zone.color} ${
                    isZoneActive ? "ring-2 ring-[#0E8FAE] shadow-sm" : "hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedZoneCode(zone.code)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                          {zone.code}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/90 text-slate-700 border border-slate-200">
                          {zone.type}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-0.5">{zone.name}</h3>
                      <p className="text-[11px] text-slate-600 font-medium">{zone.dept}</p>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                      {zone.temp}
                    </span>
                  </div>

                  {/* Bins / Doors in this zone */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60">
                    {zone.bins.map((binCode) => {
                      const isSelected = selectedBin === binCode;
                      const subtitle = getBinButtonSubtitle(binCode);

                      return (
                        <button
                          key={binCode}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBin(binCode);
                            setSelectedZoneCode(zone.code);
                          }}
                          className={`p-2 rounded-xl text-center transition-all ${
                            isSelected
                              ? "bg-slate-900 text-[#92EEFF] shadow-xs font-bold scale-[1.02] ring-2 ring-[#92EEFF]/40"
                              : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs font-semibold"
                          }`}
                        >
                          <div className="font-mono text-xs font-bold">{binCode}</div>
                          <div className={`text-[10px] font-mono truncate ${isSelected ? "text-[#92EEFF]/80" : "text-slate-500"}`}>
                            {subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnotes / Environmental sensors ribbon */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                <span>Ambient: <b className="text-slate-800 font-mono">21.4°C</b></span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Wind className="w-3.5 h-3.5 text-slate-400" />
                <span>HVAC: <b className="text-emerald-700 font-semibold">Active Eco (VAV Modulated)</b></span>
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              StockFlow Autonomous TSP Routing Active
            </span>
          </div>
        </div>

        {/* Right 4 Cols: Selected Bin Details Inspector (Sticky) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 sticky top-20">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                {activeFloor === 1 ? <Truck className="w-4 h-4 text-cyan-900" /> : <MapPin className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 font-mono">
                  {activeFloor === 1 ? `Dock Door / Staging: ${selectedBin}` : `Bin Location: ${selectedBin}`}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Floor {activeFloor} • {currentHub.code}</p>
              </div>
            </div>

            <Badge variant="success">{getFloorBadge(activeFloor)}</Badge>
          </div>

          <div className="space-y-3 text-xs">
            {/* Facility & Zone Meta */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-slate-800">{currentHub.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Floor Level:</span>
                <span className="font-mono font-bold text-slate-800">Floor {activeFloor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Functional Zone:</span>
                <span className="font-semibold text-slate-800">{selectedZoneCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operational Category:</span>
                <span className="font-mono font-bold text-slate-900">
                  {activeFloor === 1
                    ? "Inbound Fleet Trailer & YMS Ingest"
                    : activeFloor === 2
                    ? "Bulk Pallet Reserve Storage"
                    : activeFloor === 3
                    ? `${binItems.length} Products Staged`
                    : activeFloor === 4
                    ? "TSP Wave Batch Tote"
                    : activeFloor === 5
                    ? "Packing Line & Tare Scale"
                    : "Linehaul Outbound Consolidation"}
                </span>
              </div>
            </div>

            {/* CONTEXTUAL OPERATIONAL DATA BASED ON FLOOR */}

            {/* ========================================================================= */}
            {/* FLOOR 1: LIVE DOCKED TRAILER / INGEST STAGING PROFILE                     */}
            {/* ========================================================================= */}
            {activeFloor === 1 && (
              <div className="space-y-3">
                {matchingDockDoor ? (
                  <div className="p-3.5 bg-[#F0FDFF] border border-[#92EEFF] rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-900 uppercase">Docked Trailer Profile</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-200 text-cyan-900 font-mono">
                        {matchingDockDoor.status}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs">
                      {matchingDockDoor.carrier}
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                      <div className="flex justify-between">
                        <span>Plate: <b>{matchingDockDoor.vehicleNumber}</b></span>
                        <span>Driver: <b>{matchingDockDoor.driverName}</b></span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gate Pass: <b>{matchingDockDoor.gatePassId || "GP-SF-202601"}</b></span>
                        <span className="text-emerald-700 font-bold">Gate Check PASS</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-cyan-200/80 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-700">
                        <span>Pallet Unload Progress:</span>
                        <span className="font-bold text-slate-900">{matchingDockDoor.palletsCompleted} / {matchingDockDoor.palletsTotal} ({matchingDockDoor.progressPct}%)</span>
                      </div>
                      <div className="w-full bg-cyan-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#0E8FAE] h-full rounded-full" style={{ width: `${matchingDockDoor.progressPct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1">
                      <span>Destination: <b>{matchingDockDoor.assignedZone || "Zone 2A"}</b></span>
                      <span>Seal: <b className="text-slate-800">SF-SEAL-882109</b></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-900 text-xs">
                      {selectedBin.startsWith("ING") ? "Pallet Ingest QA Staging" : "Cross-Dock Metro Shuttle Staging"}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {selectedBin.startsWith("ING")
                        ? "120 Master Cartons staged for 2D barcode ingestion and high-bay bulk put-away routing."
                        : "45 Rapid Transit Totes ready for zero-dwell cross-docking handover to Metro Shuttle Fleet."}
                    </p>
                    <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-200 pt-1">
                      <span>Operator: <b>Rajesh V. (Shift 1)</b></span>
                      <span className="text-emerald-700 font-bold">Ready for Ingest</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOOR 2: BULK HIGH-BAY STORAGE RACK                                       */}
            {/* ========================================================================= */}
            {activeFloor === 2 && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">High-Bay Bulk Rack: {selectedBin}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono">
                    16 PALLETS
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Bulk master cartons stored across 4 vertical levels. Reserved for automated pick-face replenishment to Floor 3.
                </p>
                <div className="text-[10px] font-mono text-amber-900 border-t border-amber-200/80 pt-1 flex justify-between">
                  <span>Lot Ref: <b>LOT-2026-FMCG-88</b></span>
                  <span>Units: <b>6,400 Bulk Units</b></span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOOR 3: ACTIVE PICK FACE INVENTORY LIST                                  */}
            {/* ========================================================================= */}
            {activeFloor === 3 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Products Staged in {selectedBin}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">{binItems.length} Items</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={binSearch}
                    onChange={(e) => setBinSearch(e.target.value)}
                    placeholder="Filter SKUs in this bin..."
                    className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
                  />
                </div>

                {binItems.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 space-y-1">
                    <Package className="w-6 h-6 mx-auto text-slate-300" />
                    <div className="font-bold text-slate-600">No Inventory in Bin {selectedBin}</div>
                    <p className="text-[11px] text-slate-400">Bin is available and ready for inbound put-away allocation.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {binItems.map((item) => (
                      <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">{item.sku}</span>
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                            {item.availableQuantity || 0} Avail
                          </span>
                        </div>

                        <div className="font-semibold text-slate-800 text-xs">{item.name}</div>
                        
                        <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-1">
                          <span>Category: <b className="text-slate-700">{item.category}</b></span>
                          <span className="text-cyan-700 font-bold font-mono">HIGH VELOCITY</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOOR 4: WAVE PICKING TSP CORRIDOR                                        */}
            {/* ========================================================================= */}
            {activeFloor === 4 && (
              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">TSP Pick Corridor: {selectedBin}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-200 text-teal-900 font-mono">
                    WAVE #WV-401
                  </span>
                </div>
                <p className="text-[11px] text-teal-800">
                  Travelling Salesperson green corridor sequence: Depot → Bin A-01 → Bin A-04 → Bin B-02 → Packing Line 05.
                </p>
                <div className="text-[10px] font-mono text-teal-900 border-t border-teal-200/80 pt-1 flex justify-between">
                  <span>Assigned: <b>Arjun Nair</b></span>
                  <span className="text-emerald-700 font-bold">+38.8% Time Saved</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOOR 5: PACKING & QC BENCH                                               */}
            {/* ========================================================================= */}
            {activeFloor === 5 && (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">Packing Bench: {selectedBin}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900 font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  Equipped with Mettler Toledo tare digital scale, Zebra 203 DPI thermal printhead, and 6-point vision inspector.
                </p>
                <div className="text-[10px] font-mono text-indigo-900 border-t border-indigo-200/80 pt-1 flex justify-between">
                  <span>Digital Scale: <b>2.42 kg (PASS)</b></span>
                  <span className="text-emerald-700 font-bold">6/6 QC Checks Pass</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOOR 6: OUTBOUND LINEHAUL DISPATCH                                       */}
            {/* ========================================================================= */}
            {activeFloor === 6 && (
              <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-900">Linehaul Staging Bay: {selectedBin}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-200 text-cyan-900 font-mono">
                    DEPARTING 16:30
                  </span>
                </div>
                <p className="text-[11px] text-cyan-800">
                  Palletized consignments sealed and ready for direct carrier linehaul handover to national transit corridors.
                </p>
                <div className="text-[10px] font-mono text-cyan-900 border-t border-cyan-200/80 pt-1 flex justify-between">
                  <span>Carrier: <b>StockFlow Linehaul 32ft</b></span>
                  <span className="text-emerald-700 font-bold">RFID Seal Verified</span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setScannerOpen(true);
                  toast.info("HHT Optical Gun Armed", `Scan barcode to verify ${selectedBin}.`);
                }}
                className="w-full btn-primary text-xs font-bold py-2 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Barcode className="w-4 h-4 text-slate-950" />
                <span>Verify Location Barcode / RFID</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
