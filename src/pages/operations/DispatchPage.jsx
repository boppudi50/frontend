import React, { useState, useMemo } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import {
  Truck,
  CheckCircle2,
  Package,
  Clock,
  Barcode,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Printer,
  MapPin,
  Building2,
  Search,
  RefreshCw,
  FileText,
  Lock,
  ChevronRight,
  Shield
} from "lucide-react";

export function DispatchPage() {
  const { orders = [], refresh, setLabelModalOrder, setScannerOpen, activeScope } = useRealtimeData() || {};
  const { toast } = useToast();
  const [selectedCarrier, setSelectedCarrier] = useState("StockFlow Priority Linehaul (32ft Multi-Axle)");
  const [targetDockBay, setTargetDockBay] = useState("Bay 05 (Outbound South Gate)");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [carrierSealNumber, setCarrierSealNumber] = useState("SF-SEAL-892109");

  const ordersList = Array.isArray(orders) ? orders : [];
  
  // Staged for dispatch orders
  const readyOrders = useMemo(() => {
    return ordersList.filter((o) => ["READY_TO_DISPATCH", "PACKED", "QC_PASSED"].includes(o.status));
  }, [ordersList]);

  const filteredOrders = useMemo(() => {
    return readyOrders.filter((ord) => {
      const matchesSearch =
        (ord.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ord.trackingNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesScope = !activeScope || activeScope === "ALL" || ord.warehouseId === activeScope || ord.fulfillmentCenterId === activeScope;
      return matchesSearch && matchesScope;
    });
  }, [readyOrders, searchQuery, activeScope]);

  // Default selection
  React.useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(filteredOrders[0]);
    } else if (filteredOrders.length > 0 && selectedOrder) {
      const updated = filteredOrders.find(o => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
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

  const handleDispatch = async (orderId) => {
    setDispatching(true);
    try {
      await api.dispatchOrder({
        orderId,
        carrier: `${selectedCarrier} [${targetDockBay}] [Seal #${carrierSealNumber}]`,
      });
      await refresh();
      toast.success(
        "Linehaul Handover Dispatched",
        `Consignment ${selectedOrder?.orderNumber || orderId} sealed (Tamper Seal #${carrierSealNumber}) and handed to ${selectedCarrier}.`
      );
      setCarrierSealNumber(`SF-SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (e) {
      console.error(e);
      toast.error("Dispatch Failed", "Unable to complete outbound carrier handover.");
    } finally {
      setDispatching(false);
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
                  Carrier Dispatch & Linehaul Outbound Handover
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-[#92EEFF]">
                  {filteredOrders.length} STAGED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated SSCC-18 pallet barcode tracking, e-way bill generation & carrier fleet seal handoff
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
            <RefreshCw className={`w-3.5 h-3.5 ${dispatching ? "animate-spin" : ""}`} />
            <span>Sync Fleet</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Scrollable Queue (10+ Staged Orders) + Right Sticky Outbound Manifest Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE DISPATCH QUEUE (10+ Orders)                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search Header Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>Staged Consignments</span>
                <span className="px-2 py-0.2 rounded-full bg-cyan-100 text-cyan-900 font-mono text-[11px]">
                  {filteredOrders.length} Orders
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Bay Staging: Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order #, AWB, Consignee..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92EEFF]"
              />
            </div>
          </div>

          {/* SCROLLABLE LIST CONTAINER */}
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto pr-1.5 space-y-2.5">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                No orders currently staged at the dispatch bays.
              </div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const totalUnits = (ord.items || []).reduce((sum, it) => sum + (it.quantityAllocated || it.quantityRequested || 1), 0);

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-[#0E8FAE] bg-[#F0FDFF] shadow-sm ring-2 ring-[#92EEFF]/40"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {ord.orderNumber}
                        </span>
                        {getChannelTag(ord.channel)}
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {ord.warehouseId || "HYD-01"}
                        </span>
                      </div>

                      <Badge variant="success">QC Passed</Badge>
                    </div>

                    <div className="mt-1.5 text-xs text-slate-800 font-semibold truncate">
                      {ord.customerName}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{ord.items?.length || 1} SKUs ({totalUnits} Units) • ${ord.totalAmount?.toFixed(2)}</span>
                      <span className="text-slate-700 font-semibold">{ord.trackingNumber}</span>
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
        {/* RIGHT COLUMN: STICKY OUTBOUND WORKBENCH & FLEET MANIFEST                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#0E8FAE]" />
                    <h2 className="text-base font-black text-slate-900 font-mono">
                      Outbound Handover: {selectedOrder.orderNumber}
                    </h2>
                    {getChannelTag(selectedOrder.channel)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Consignee: <b className="text-slate-800">{selectedOrder.customerName}</b> • Facility: <b className="font-mono text-slate-800">{selectedOrder.warehouseId || "HYD-01"}</b>
                  </p>
                </div>

                <Badge variant={selectedOrder.priorityLevel}>
                  {selectedOrder.priorityLevel}
                </Badge>
              </div>

              {/* Carrier Selection & Dock Assignment Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-600 font-bold uppercase tracking-wider">
                    Assigned Linehaul Carrier Fleet
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="StockFlow Priority Linehaul (32ft Multi-Axle)">StockFlow Priority Linehaul (32ft Multi-Axle)</option>
                    <option value="StockFlow Cold-Chain Reefer Express">StockFlow Cold-Chain Reefer Express</option>
                    <option value="StockFlow Air Cargo Priority Wing">StockFlow Air Cargo Priority Wing</option>
                    <option value="StockFlow Urban Electric Shuttle">StockFlow Urban Electric Shuttle</option>
                    <option value="Blue Dart Aviation Express">Blue Dart Aviation Express</option>
                    <option value="Delhivery Surface Cargo">Delhivery Surface Cargo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-600 font-bold uppercase tracking-wider">
                    Target Outbound Dock Door
                  </label>
                  <select
                    value={targetDockBay}
                    onChange={(e) => setTargetDockBay(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Bay 05 (Outbound South Gate)">Bay 05 (Outbound South Gate)</option>
                    <option value="Bay 06 (Outbound Linehaul Ramp)">Bay 06 (Outbound Linehaul Ramp)</option>
                    <option value="Bay 07 (Express Air Priority Gate)">Bay 07 (Express Air Priority Gate)</option>
                    <option value="Bay 08 (Cross-Dock Linehaul)">Bay 08 (Cross-Dock Linehaul)</option>
                  </select>
                </div>
              </div>

              {/* Linehaul Security Seal & Manifest Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Security Tamper Seal</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {carrierSealNumber}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Barcoded RFID Active</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-slate-400" />
                    <span>Linehaul AWB Tracking</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {selectedOrder.trackingNumber || "SF-TRK-1042982"}
                  </div>
                  <div className="text-[10px] text-slate-500">SSCC-18 Pallet Label</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    <span>Inspection Sign-off</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    Elena Rodriguez
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">QA Lead Certified</div>
                </div>
              </div>

              {/* Items Manifest in Consignment */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Outbound Pallet Manifest (Verified Line Items)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.items?.map((it, idx) => (
                    <div
                      key={it.sku || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{it.productName || it.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {it.sku} • Bin: {it.locationCode || it.bin || "A-01"}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {it.quantityAllocated || it.quantityRequested || 1} Units
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setLabelModalOrder(selectedOrder.id)}
                  className="btn-outline text-xs font-bold py-2 px-3 flex items-center gap-1.5 text-slate-700"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print 4x6 Master Thermal Label</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDispatch(selectedOrder.id)}
                  disabled={dispatching}
                  className="btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Confirm Dispatch & Handover Carrier</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20 text-slate-400 space-y-2">
              <Truck className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-bold text-slate-700">Select a Staged Consignment</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an order from the staged queue to generate the outbound linehaul manifest and execute carrier dispatch.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
