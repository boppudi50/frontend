import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeData, STOCKFLOW_HUBS } from "../../context/RealtimeDataContext";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  Boxes,
  Play,
  Pause,
  ChevronDown,
  Building2,
  Activity,
  Bot,
  LogOut,
  User,
  Shield,
  Search,
  Zap,
  Barcode,
  Snowflake,
  Check,
  Layers,
  Globe,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { GlobalSearchModal } from "./GlobalSearchModal";

export function Navbar({ onOpenDemo, onOpenCopilot }) {
  const { currentUser, role, signOut } = useAuth();
  const { toast } = useToast();
  const {
    lastSyncTime,
    syncStatus = "CONNECTED",
    refresh,
    simulationRunning,
    toggleSimulation,
    activeScope,
    setActiveScope,
    activeHub,
    setScannerOpen,
    setClimateModalOpen
  } = useRealtimeData();


  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hubMenuOpen, setHubMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [syncSecondsAgo, setSyncSecondsAgo] = useState(0);
  const dropdownRef = useRef(null);
  const hubDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track sync elapsed seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastSyncTime) {
        const diff = Math.floor((new Date() - new Date(lastSyncTime)) / 1000);
        setSyncSecondsAgo(Math.max(0, diff));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  // Click outside to close profile dropdown & hub dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (hubDropdownRef.current && !hubDropdownRef.current.contains(event.target)) {
        setHubMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-5 py-2 flex items-center justify-between shadow-soft">
      {/* Left: StockFlow brand & Global Warehouse Switcher & Global Search */}
      <div className="flex items-center gap-3 xl:gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#70E5FB] to-[#92EEFF] flex items-center justify-center text-slate-950 font-bold shadow-sm ring-2 ring-[#92EEFF]/40 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-sans">
                Stock<span className="text-[#0E8FAE]">Flow</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-[#92EEFF] px-1.5 py-0.5 rounded">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              Enterprise Warehouse Operations & Fulfillment Intelligence
            </p>
          </div>
        </div>

        {/* Global Operational Search Bar Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="hidden lg:flex items-center justify-between w-52 xl:w-64 pl-3 pr-2 py-1.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-400 transition-all font-medium group cursor-pointer shadow-2xs"
          title="Open Global Operational Search (Ctrl+K / Cmd+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E8FAE] transition-colors shrink-0" />
            <span className="truncate text-slate-600 font-medium">Search SKU, Order, Bay...</span>
          </div>
          <kbd className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-500 group-hover:border-slate-300 shrink-0">
            ⌘K
          </kbd>
        </button>

        {/* Global Warehouse Switcher Dropdown */}
        <div className="relative" ref={hubDropdownRef}>
          <button
            type="button"
            onClick={() => setHubMenuOpen(!hubMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left bg-slate-50/90 shadow-2xs cursor-pointer min-w-[200px] xl:min-w-[230px]"
          >
            <div className="w-7 h-7 rounded-lg bg-[#E5FAFE] border border-[#92EEFF] text-[#0E8FAE] flex items-center justify-center shrink-0">
              {activeScope === "ALL" ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 truncate">
                  {activeScope === "ALL" ? "ALL STOCKFLOW CENTERS" : activeHub?.shortName || activeHub?.name || activeScope}
                </span>
                {activeScope === "ALL" ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#0E8FAE] text-white shrink-0">
                    5 HUBS
                  </span>
                ) : activeHub?.isMainHub ? (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-900 text-[#92EEFF] shrink-0">
                    HQ • 6 FL
                  </span>
                ) : null}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {activeScope === "ALL" ? "Consolidated Network Control Tower" : activeHub?.city}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {hubMenuOpen && (
            <div className="absolute left-0 mt-2 w-96 sm:w-[420px] bg-white border border-slate-200/95 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Dropdown Header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#92EEFF]" />
                    <span>Select StockFlow Fulfillment Scope</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Synchronizes live orders, inventory, dock bays & profit intelligence
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#92EEFF]/20 text-[#92EEFF] border border-[#92EEFF]/40">
                  5 Active
                </span>
              </div>

              {/* Hubs List Container */}
              <div className="p-2 space-y-1.5 max-h-[380px] overflow-y-auto">
                {/* 1. All Centers Mode Option */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveScope("ALL");
                    setHubMenuOpen(false);
                    toast.info("Fulfillment Scope Updated", "Consolidated 5-Hub Control Tower Active.");
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-start justify-between ${
                    activeScope === "ALL"
                      ? "bg-[#E5FAFE] border border-[#92EEFF] font-bold shadow-2xs"
                      : "hover:bg-slate-50 border border-transparent text-slate-700"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">ALL STOCKFLOW CENTERS</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0E8FAE] text-white">
                        Consolidated
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      Multi-Hub Network Overview (All 5 Fulfillment Centers Combined)
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200">HYD-01</span>
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200">MUM-01</span>
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200">VJA-01</span>
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200">MAH-01</span>
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200">CHE-01</span>
                    </div>
                  </div>
                  {activeScope === "ALL" && (
                    <div className="w-5 h-5 rounded-full bg-[#0E8FAE] text-white flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* Individual 5 Fulfillment Centers */}
                {STOCKFLOW_HUBS.map((hub) => {
                  const isSelected = activeScope === hub.id;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => {
                        setActiveScope(hub.id);
                        setHubMenuOpen(false);
                        toast.info("Fulfillment Scope Switched", `Active Hub: ${hub.name} (${hub.city}).`);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? "bg-slate-100 border border-slate-300 font-bold shadow-2xs"
                          : "hover:bg-slate-50 border border-transparent text-slate-700"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900">{hub.name}</span>
                          {hub.isMainHub && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-900 text-[#92EEFF]">
                              PRIMARY HQ • 6 FL
                            </span>
                          )}
                          {hub.coldChain && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-100 text-[#0E8FAE] border border-cyan-200">
                              Cold Chain
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">{hub.city}</div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 flex-wrap">
                          <span>{hub.capacity}</span>
                          <span>•</span>
                          <span>{hub.dailyVol}</span>
                          <span>•</span>
                          <span>{hub.activeBays} Active Bays</span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="font-medium">5 of 5 Hubs Live Synchronized</span>
                <span className="font-mono text-[#0E8FAE] font-bold">Cloud Firestore</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: HHT Gun + Cold Chain + Simulation + Demo + Copilot + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Handheld Terminal (HHT) Scanner Button */}
        <button
          type="button"
          onClick={() => {
            setScannerOpen(true);
            toast.info("RF Scanner Booted", "Connected to Zebra TC57 optical imager.");
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-2 border border-slate-800 shadow-xs cursor-pointer"
          title="Open Handheld RF Barcode Scanner Terminal"
        >
          <Barcode className="w-4 h-4 text-[#92EEFF]" />
          <span className="hidden md:inline">RF Gun Scanner</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-[#92EEFF]/20 text-[#92EEFF] rounded-full border border-[#92EEFF]/40 font-mono hidden xl:inline">
            HHT
          </span>
        </button>

        {/* Cold Chain IoT Monitor Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            setClimateModalOpen(true);
            toast.info("Cold-Chain Telemetry", "Opened IoT environmental sensor array.");
          }}
          className="hidden sm:flex items-center gap-2 bg-cyan-50 hover:bg-cyan-100/90 text-cyan-950 border border-cyan-200 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          title="Cold-Chain Temperature Telemetry"
        >
          <Snowflake className="w-4 h-4 text-[#0E8FAE]" />
          <span className="font-mono text-xs font-black">3.6°C</span>
          <span className="text-[10px] text-[#0E8FAE] font-bold hidden lg:inline">Optimal</span>
        </button>

        {/* Real-time Warehouse Simulation Toggle Button */}
        <button
          type="button"
          onClick={() => {
            toggleSimulation();
            if (!simulationRunning) {
              toast.success("Simulation Started", "Continuous order flow and pick task generator active.");
            } else {
              toast.info("Simulation Paused", "Warehouse event generator paused.");
            }
          }}
          className={`text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-xs border cursor-pointer ${
            simulationRunning
              ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-700 ring-2 ring-purple-300"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
          }`}
          title="Toggle continuous real-time warehouse operational event simulation"
        >
          {simulationRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline">Simulating</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xl:inline">Simulate</span>
            </>
          )}
        </button>

        {/* 1-Click Interactive Hackathon Demo Button */}
        <button
          type="button"
          onClick={() => {
            onOpenDemo();
            toast.info("Order #1042 Interactive Flow", "Loaded Metro Hypermarket contention demo scenario.");
          }}
          className="bg-gradient-to-r from-[#92EEFF] via-[#70E5FB] to-[#38D2F3] hover:from-[#70E5FB] hover:to-[#0E8FAE] text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 border border-[#70E5FB] active:scale-[0.98] cursor-pointer"
        >
          <Zap className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span className="hidden sm:inline">Order #1042</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* StockFlow AI Operations Intelligence Trigger */}
        <button
          type="button"
          onClick={onOpenCopilot}
          className="bg-gradient-to-r from-[#E5FAFE] via-white to-[#F0FDFF] hover:from-[#92EEFF]/30 hover:to-[#E5FAFE] text-slate-900 text-xs font-black p-2 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border border-[#92EEFF] hover:border-[#0E8FAE] shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer group"
          title="Open StockFlow AI Operations Intelligence"
        >
          <div className="w-5 h-5 rounded-lg bg-[#92EEFF] text-slate-950 flex items-center justify-center font-bold shadow-2xs group-hover:scale-110 transition-transform">
            <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
          </div>
          <span className="hidden lg:inline font-black tracking-tight text-slate-900 group-hover:text-[#0E8FAE] transition-colors">
            StockFlow AI
          </span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#0E8FAE] text-white hidden xl:inline">
            PRO
          </span>
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Authenticated User Profile & Logout Flyout */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left bg-white shadow-2xs group"
          >
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-[#92EEFF]/40 shrink-0">
              <User className="w-4 h-4 text-slate-900" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {currentUser?.fullName?.split(" ")[0] || currentUser?.name || "Super Admin"}
              </span>
              <span className="text-[10px] font-bold text-[#0E8FAE] leading-none">
                {(currentUser?.role || role || "SUPER_ADMIN").replace(/_/g, " ")}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2.5 w-84 sm:w-88 bg-white border border-slate-200/90 rounded-3xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="p-4 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40">
                <div className="flex items-start gap-3">
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-[#92EEFF]/60 shrink-0">
                    <User className="w-5 h-5 text-slate-950" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {currentUser?.fullName || currentUser?.name || "Super Admin (Network Director)"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {currentUser?.email || "admin@gmail.com"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5FAFE] text-[#0E8FAE] border border-[#92EEFF]">
                        <Shield className="w-2.5 h-2.5" />
                        {(currentUser?.role || role || "SUPER_ADMIN").replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Firebase Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Metadata Grid */}
              <div className="p-3.5 space-y-2 text-xs bg-slate-50/40">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building2 className="w-3.5 h-3.5 text-[#0E8FAE]" />
                    <span className="font-medium">Assigned Hub:</span>
                  </div>
                  <span className="font-bold text-slate-900 text-right">
                    {activeScope === "ALL" ? "All 5 Centers (HYD-01 Lead)" : activeHub?.name || activeScope}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium">Department:</span>
                  </div>
                  <span className="font-bold text-slate-900 text-right">
                    {currentUser?.department || "Executive Network Operations"}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">RF Gun Terminal:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                    {currentUser?.rfGunId || "HHT-9901"}
                  </span>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="p-2 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/users");
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#0E8FAE]" />
                    <span>User Administration & Roles</span>
                  </div>
                  <span className="text-[10px] text-slate-400">/users</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#0E8FAE]" />
                    <span>System Settings & Thresholds</span>
                  </div>
                  <span className="text-[10px] text-slate-400">/settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/audit");
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-colors font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#0E8FAE]" />
                    <span>Audit Trail & Governance</span>
                  </div>
                  <span className="text-[10px] text-slate-400">/audit</span>
                </button>
              </div>

              {/* Logout Footer */}
              <div className="p-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of StockFlow</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Operational Search & Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
}
