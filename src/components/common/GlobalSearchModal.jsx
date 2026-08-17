import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  X,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Layers,
  Building2,
  ArrowRight,
  Sparkles,
  Command,
  Clock,
  CheckCircle2,
  Flame,
  IndianRupee,
  Shield,
  Activity,
  MapPin,
  ExternalLink,
  ChevronRight,
  Compass
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRealtimeData, STOCKFLOW_HUBS } from "../../context/RealtimeDataContext";

const NAVIGATION_PAGES = [
  { name: "Command Center", path: "/", icon: Activity, desc: "Executive snapshot, real-time metrics & financial ROI" },
  { name: "Orders & Allocation", path: "/orders", icon: ShoppingCart, desc: "Live order stream, SLA urgency scoring & wave batching" },
  { name: "Inventory & Stock", path: "/inventory", icon: Package, desc: "Multi-hub SKU balances, low-stock reorder & cycle counts" },
  { name: "Picking Tasks", path: "/picking", icon: Layers, desc: "TSP S-shape aisle route optimization & RF gun wave picks" },
  { name: "Packing & QC", path: "/packing", icon: CheckCircle2, desc: "6-Point QC scale verification, packing & tamper sealing" },
  { name: "Carrier Dispatch", path: "/dispatch", icon: Truck, desc: "Courier manifests (Delhivery, BlueDart), dock staging & AWBs" },
  { name: "Dock & Yard (YMS)", path: "/dock-yard", icon: Building2, desc: "Inbound/outbound bay doors, trailer parking & turn times" },
  { name: "Returns & RTO", path: "/returns", icon: AlertTriangle, desc: "Reverse logistics, restock grading & damage write-offs" },
  { name: "Exception Center", path: "/exceptions", icon: Flame, desc: "Real-time bottleneck resolution & damage quarantines" },
  { name: "Operational Analytics", path: "/analytics", icon: Activity, desc: "Fulfillment velocity, heatmaps & operator productivity" },
  { name: "Warehouse 2D Map", path: "/map", icon: MapPin, desc: "Multi-floor 2D digital twin, rack zones & reefer chambers" },
  { name: "Profit Intelligence", path: "/finance", icon: IndianRupee, desc: "Order profitability, unit economics & courier spend leakage" },
  { name: "Audit & Decisions", path: "/audit", icon: Shield, desc: "Immutable cryptographic audit trail & autonomous AI logs" },
  { name: "User Management", path: "/users", icon: Shield, desc: "Staff administration, RBAC permissions & RF gun assignments" },
  { name: "System Settings", path: "/settings", icon: Compass, desc: "SLA threshold windows, AI heuristics & Firestore parameters" }
];

export function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { orders = [], inventory = [], exceptions = [] } = useRealtimeData() || {};
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search Results Computation
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        pages: NAVIGATION_PAGES.slice(0, 6),
        orders: orders.slice(0, 3),
        inventory: inventory.slice(0, 3),
        exceptions: exceptions.slice(0, 2),
        totalCount: 14
      };
    }

    const matchedPages = NAVIGATION_PAGES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
    );

    const matchedOrders = orders.filter((o) => {
      const num = (o.orderNumber || "").toLowerCase();
      const cust = (o.customerName || "").toLowerCase();
      const status = (o.status || "").toLowerCase();
      const prio = (o.priorityLevel || "").toLowerCase();
      return num.includes(q) || cust.includes(q) || status.includes(q) || prio.includes(q);
    }).slice(0, 5);

    const matchedInventory = inventory.filter((item) => {
      const sku = (item.sku || "").toLowerCase();
      const name = (item.productName || item.name || "").toLowerCase();
      const bin = (item.bin || item.location || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      return sku.includes(q) || name.includes(q) || bin.includes(q) || cat.includes(q);
    }).slice(0, 5);

    const matchedExceptions = exceptions.filter((ex) => {
      const id = (ex.id || "").toLowerCase();
      const type = (ex.type || "").toLowerCase();
      const desc = (ex.description || "").toLowerCase();
      return id.includes(q) || type.includes(q) || desc.includes(q);
    }).slice(0, 3);

    const totalCount = matchedPages.length + matchedOrders.length + matchedInventory.length + matchedExceptions.length;

    return {
      pages: matchedPages,
      orders: matchedOrders,
      inventory: matchedInventory,
      exceptions: matchedExceptions,
      totalCount
    };
  }, [query, orders, inventory, exceptions]);

  // Flattened list for keyboard navigation
  const flatItems = useMemo(() => {
    const items = [];
    results.pages.forEach((p) => items.push({ type: "page", data: p }));
    results.orders.forEach((o) => items.push({ type: "order", data: o }));
    results.inventory.forEach((i) => items.push({ type: "inventory", data: i }));
    results.exceptions.forEach((e) => items.push({ type: "exception", data: e }));
    return items;
  }, [results]);

  // Handle Keyboard Navigation
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelectItem(flatItems[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (item) => {
    onClose();
    if (item.type === "page") {
      navigate(item.data.path);
    } else if (item.type === "order") {
      navigate(`/orders?order=${encodeURIComponent(item.data.orderNumber || item.data.id)}`);
    } else if (item.type === "inventory") {
      navigate(`/inventory?sku=${encodeURIComponent(item.data.sku)}`);
    } else if (item.type === "exception") {
      navigate(`/exceptions?id=${encodeURIComponent(item.data.id)}`);
    }
  };

  if (!isOpen) return null;

  let currentIndexTracker = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b border-slate-200/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0E8FAE] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search SKUs, Orders, Dock Bays, Bins, Modules..."
            className="w-full text-sm sm:text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500">
            ESC to close
          </kbd>
        </div>

        {/* Search Results List */}
        <div ref={listRef} className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100 flex-1">
          {results.totalCount === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No matching operational records found</div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try searching by SKU (e.g. `SKU-SHMP-001`), Order Number (`#1042`), or Bay (`Bay #01`).
              </p>
            </div>
          ) : (
            <>
              {/* Category 1: Navigation Modules */}
              {results.pages.length > 0 && (
                <div className="pt-2 first:pt-0 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                    Warehouse Modules & Dashboards
                  </div>
                  {results.pages.map((p) => {
                    const itemIdx = currentIndexTracker++;
                    const isSelected = selectedIndex === itemIdx;
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.path}
                        onClick={() => handleSelectItem({ type: "page", data: p })}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                          isSelected ? "bg-[#E5FAFE] text-slate-900 border border-[#92EEFF]" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-[#0E8FAE] text-white" : "bg-slate-100 text-slate-600"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{p.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#0E8FAE]" : "text-slate-300"}`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category 2: Orders */}
              {results.orders.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                    Live Customer Orders
                  </div>
                  {results.orders.map((o) => {
                    const itemIdx = currentIndexTracker++;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={o.id || o.orderNumber}
                        onClick={() => handleSelectItem({ type: "order", data: o })}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                          isSelected ? "bg-[#E5FAFE] text-slate-900 border border-[#92EEFF]" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#0E8FAE] flex items-center justify-center font-bold text-xs shrink-0 border border-cyan-200">
                            <ShoppingCart className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 font-mono">
                                {o.orderNumber || o.id}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                                {o.customerName || "Customer Order"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Priority: <b className="text-slate-800">{o.priorityLevel || "STANDARD"}</b></span>
                              <span>•</span>
                              <span>Status: <b className="text-[#0E8FAE]">{o.status || "PENDING"}</b></span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ₹{Number(o.totalAmount || 2500).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category 3: Inventory & SKUs */}
              {results.inventory.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                    Inventory Catalog & SKU Bins
                  </div>
                  {results.inventory.map((item) => {
                    const itemIdx = currentIndexTracker++;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={item.id || item.sku}
                        onClick={() => handleSelectItem({ type: "inventory", data: item })}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                          isSelected ? "bg-[#E5FAFE] text-slate-900 border border-[#92EEFF]" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 font-mono">
                                {item.sku}
                              </span>
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {item.productName || item.name}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>Bin: <b className="font-mono text-slate-800">{item.bin || item.location || "A-01"}</b></span>
                              <span>•</span>
                              <span>Available: <b className="text-emerald-700">{item.availableQuantity ?? item.quantity ?? 100} units</b></span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ₹{Number(item.price || item.unitPrice || 450).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category 4: Exceptions */}
              {results.exceptions.length > 0 && (
                <div className="pt-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                    Active Operational Exceptions
                  </div>
                  {results.exceptions.map((ex) => {
                    const itemIdx = currentIndexTracker++;
                    const isSelected = selectedIndex === itemIdx;
                    return (
                      <div
                        key={ex.id}
                        onClick={() => handleSelectItem({ type: "exception", data: ex })}
                        className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-colors ${
                          isSelected ? "bg-[#E5FAFE] text-slate-900 border border-[#92EEFF]" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-rose-700 font-mono">
                                {ex.id}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                {ex.type || "Quality Exception"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {ex.description || "Exception requiring supervisor review."}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {ex.status || "OPEN"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">↓</kbd>
              <span className="text-[11px]">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">↵</kbd>
              <span className="text-[11px]">Open Record</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">StockFlow Omnisearch</span>
        </div>
      </div>
    </div>
  );
}
