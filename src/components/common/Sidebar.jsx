import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MapPin,
  PackageCheck,
  Truck,
  AlertOctagon,
  BarChart3,
  IndianRupee,
  DollarSign,
  Users,
  Settings,
  History,
  GitPullRequestDraft,
  Flame,
  RotateCcw,
  Warehouse,
  Container,
  ChevronRight,
  ShieldCheck,
  Activity,
  Boxes,
  Sparkles
} from "lucide-react";
import clsx from "clsx";

export function Sidebar() {
  const { role, canAccess } = useAuth();
  const { exceptions = [], metrics = null, dockDoors = [], returnsList = [] } = useRealtimeData() || {};

  const exceptionsList = Array.isArray(exceptions) ? exceptions : [];
  const openExceptionsCount = exceptionsList.filter((e) => e.status === "OPEN").length;
  const atRiskOrdersCount = metrics?.atRiskOrders || 8;
  const pendingReturnsCount = (returnsList || []).filter((r) => r.gradingStatus === "PENDING_INSPECTION").length;

  const NAV_SECTIONS = [
    {
      title: "Core Operations",
      items: [
        {
          label: "Command Center",
          path: "/",
          icon: LayoutDashboard,
          module: "ALL",
          badge: null,
        },
        {
          label: "Orders & Allocation",
          path: "/orders",
          icon: ShoppingCart,
          module: "orders",
          badge: atRiskOrdersCount > 0 ? `${atRiskOrdersCount} SLA` : null,
          badgeColor: "bg-red-50 text-red-700 border-red-200 animate-pulse",
        },
        {
          label: "Inventory & Stock",
          path: "/inventory",
          icon: Package,
          module: "inventory",
          badge: null,
        },
        {
          label: "Picking Tasks",
          path: "/picking",
          icon: GitPullRequestDraft,
          module: "picking",
          badge: "TSP Opt",
          badgeColor: "bg-[#E5FAFE] text-[#0E8FAE] border-[#92EEFF]",
        },
        {
          label: "Packing & QC",
          path: "/packing-qc",
          icon: PackageCheck,
          module: "packing",
          badge: null,
        },
        {
          label: "Carrier Dispatch",
          path: "/dispatch",
          icon: Truck,
          module: "dispatch",
          badge: null,
        },
      ],
    },
    {
      title: "Logistics & Yard",
      items: [
        {
          label: "Dock & Yard (YMS)",
          path: "/dock-yard",
          icon: Container,
          module: "dispatch",
          badge: `${dockDoors.length || 8} Bays`,
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
        {
          label: "Returns & RTO",
          path: "/returns",
          icon: RotateCcw,
          module: "inventory",
          badge: pendingReturnsCount > 0 ? `${pendingReturnsCount} RTO` : "Active",
          badgeColor: pendingReturnsCount > 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200",
        },
        {
          label: "Exception Center",
          path: "/exceptions",
          icon: AlertOctagon,
          module: "exceptions",
          badge: openExceptionsCount > 0 ? `${openExceptionsCount} Open` : "1 Open",
          badgeColor: "bg-red-500 text-white shadow-xs animate-pulse",
        },
      ],
    },
    {
      title: "Intelligence & Maps",
      items: [
        {
          label: "Operational Analytics",
          path: "/analytics",
          icon: BarChart3,
          module: "analytics",
          badge: null,
        },
        {
          label: "Warehouse 2D Map",
          path: "/warehouse-map",
          icon: MapPin,
          module: "ALL",
          badge: null,
        },
        {
          label: "Profit Intelligence",
          path: "/finance",
          icon: IndianRupee,
          module: "finance",
          badge: "Live ROI",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        },
      ],
    },
    {
      title: "Governance & Admin",
      items: [
        {
          label: "Audit & Decisions",
          path: "/audit-logs",
          icon: History,
          module: "ALL",
          badge: null,
        },
        {
          label: "User Management",
          path: "/users",
          icon: Users,
          module: "SUPER_ADMIN_ONLY",
          badge: null,
        },
        {
          label: "System Settings",
          path: "/settings",
          icon: Settings,
          module: "SUPER_ADMIN_ONLY",
          badge: null,
        },
      ],
    },
  ];

  return (
    <aside className="w-60 xl:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-full overflow-y-auto select-none shadow-soft">
      <div className="py-2 px-2 space-y-2 flex-1">
        {NAV_SECTIONS.map((sec, secIdx) => {
          const visibleItems = sec.items.filter((item) => {
            if (item.module === "SUPER_ADMIN_ONLY") {
              return role === "SUPER_ADMIN";
            }
            return canAccess(item.module);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.title} className="space-y-0.5">
              {/* Clean Section Divider Line */}
              {secIdx > 0 && (
                <div className="pt-2 pb-1.5 px-1">
                  <div className="border-t border-slate-200" />
                </div>
              )}

              {/* Category Micro Header */}
              <div className="px-2 pt-0.5 pb-1 flex items-center justify-between">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                  {sec.title}
                </span>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        clsx(
                          "group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer border",
                          isActive
                            ? "bg-[#E5FAFE] border-[#92EEFF] text-[#0E8FAE] font-black shadow-2xs"
                            : "border-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-200"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Compact Icon Box */}
                            <div
                              className={clsx(
                                "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-150",
                                isActive
                                  ? "bg-[#92EEFF] text-slate-950 shadow-2xs font-black"
                                  : "bg-slate-100 border border-slate-200/80 text-slate-500 group-hover:text-[#0E8FAE] group-hover:border-[#92EEFF] group-hover:bg-[#E5FAFE]"
                              )}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            {/* Label */}
                            <span
                              className={clsx(
                                "truncate tracking-tight transition-colors text-[11.5px]",
                                isActive ? "text-[#0E8FAE] font-black" : "text-slate-800 group-hover:text-slate-950 font-bold"
                              )}
                            >
                              {item.label}
                            </span>
                          </div>

                          {/* Right Badge / Active Dot */}
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {item.badge && (
                              <span
                                className={clsx(
                                  "text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded-full border tracking-wide transition-transform group-hover:scale-105",
                                  item.badgeColor || (isActive ? "bg-[#92EEFF]/30 text-[#0E8FAE] border-[#92EEFF]" : "bg-slate-100 text-slate-600 border-slate-200")
                                )}
                              >
                                {item.badge}
                              </span>
                            )}

                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0E8FAE] shadow-[0_0_6px_#0E8FAE]" />
                            )}
                          </div>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* COMPACT ENTERPRISE OPERATOR PROFILE FOOTER CARD                            */}
      {/* ========================================================================= */}
      <div className="p-2 m-2 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs text-left shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 font-black text-[10px] flex items-center justify-center shadow-2xs">
              SA
            </div>
            <div>
              <div className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                Operator Role
              </div>
              <div className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                <span>{role.replace(/_/g, " ")}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ONLINE
          </span>
        </div>

        <div className="pt-1.5 mt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-500">
          <span className="flex items-center gap-1 font-mono text-slate-600">
            <span className="text-emerald-500">●</span> HYD-01 Central
          </span>
          <span className="text-slate-400 font-medium">Unrestricted</span>
        </div>
      </div>
    </aside>
  );
}
