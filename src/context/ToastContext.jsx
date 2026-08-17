import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Printer,
  Truck,
  PackageCheck,
  Barcode
} from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = "info", title, message, duration = 3500, icon = null }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { id, type, title, message, duration, icon };
    
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title, message, options = {}) =>
      addToast({ type: "success", title, message, ...options }),
    error: (title, message, options = {}) =>
      addToast({ type: "error", title, message, ...options }),
    warning: (title, message, options = {}) =>
      addToast({ type: "warning", title, message, ...options }),
    info: (title, message, options = {}) =>
      addToast({ type: "info", title, message, ...options }),
    custom: (options) => addToast(options),
  };

  return (
    <ToastContext.Provider value={{ toast, showToast: toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy
    return {
      toast: {
        success: (t, m) => console.log(t, m),
        error: (t, m) => console.error(t, m),
        warning: (t, m) => console.warn(t, m),
        info: (t, m) => console.info(t, m),
      },
      showToast: {
        success: (t, m) => console.log(t, m),
        error: (t, m) => console.error(t, m),
        warning: (t, m) => console.warn(t, m),
        info: (t, m) => console.info(t, m),
      }
    };
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const { type, title, message, icon } = toast;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-white",
          border: "border-emerald-300",
          iconBg: "bg-emerald-100 text-emerald-700",
          defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          barColor: "bg-emerald-500",
          ring: "ring-emerald-500/20"
        };
      case "error":
        return {
          bg: "bg-white",
          border: "border-red-300",
          iconBg: "bg-red-100 text-red-700",
          defaultIcon: <AlertOctagon className="w-5 h-5 text-red-600" />,
          barColor: "bg-red-500",
          ring: "ring-red-500/20"
        };
      case "warning":
        return {
          bg: "bg-white",
          border: "border-amber-300",
          iconBg: "bg-amber-100 text-amber-700",
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          barColor: "bg-amber-500",
          ring: "ring-amber-500/20"
        };
      default:
        return {
          bg: "bg-white",
          border: "border-[#92EEFF]",
          iconBg: "bg-[#E5FAFE] text-[#0E8FAE]",
          defaultIcon: <Info className="w-5 h-5 text-[#0E8FAE]" />,
          barColor: "bg-[#0E8FAE]",
          ring: "ring-[#0E8FAE]/20"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`pointer-events-auto rounded-xl border ${styles.border} ${styles.bg} shadow-lg shadow-slate-900/10 p-3.5 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-top-3 fade-in ring-2 ${styles.ring} relative overflow-hidden`}
    >
      {/* Icon */}
      <div className={`p-1.5 rounded-lg shrink-0 ${styles.iconBg}`}>
        {icon || styles.defaultIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
        {title && (
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-100 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle bottom animation bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${styles.barColor} animate-pulse`}
      />
    </div>
  );
}
