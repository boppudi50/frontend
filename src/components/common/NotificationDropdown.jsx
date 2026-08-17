import React, { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, AlertOctagon, Info, CheckCircle2, X } from "lucide-react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import clsx from "clsx";

export function NotificationDropdown() {
  const { notifications = [] } = useRealtimeData() || {};
  const { role = "SUPER_ADMIN" } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const notifsList = Array.isArray(notifications) ? notifications : [];

  // Filter notifications by role awareness
  const roleFilteredNotifs = notifsList.filter((n) => {
    if (!n.role || n.role === "ALL" || role === "SUPER_ADMIN") return true;
    return n.role === role;
  });

  const unreadCount = roleFilteredNotifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "CRITICAL":
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Role-Aware Operational Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Operational Alerts</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#92EEFF] text-slate-950">
                {roleFilteredNotifs.length} for {role.replace(/_/g, " ")}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {roleFilteredNotifs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active notifications for your department. All systems clear.
              </div>
            ) : (
              roleFilteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className={clsx(
                    "p-3.5 hover:bg-slate-50 transition-colors flex gap-3",
                    !n.read && "bg-[#F0FDFF]/40"
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {n.timestamp
                          ? new Date(n.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "Live"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between pt-1">
                      {n.link ? (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-block text-[11px] font-semibold text-[#0E8FAE] hover:underline"
                        >
                          Inspect in module →
                        </Link>
                      ) : <span />}
                      {n.role && n.role !== "ALL" && (
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {n.role.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-50/80 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-400">
              Role-targeted real-time alerts synchronized with warehouse hub
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
