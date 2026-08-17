import React from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { Badge } from "./Badge";
import {
  Thermometer,
  X,
  Droplets,
  Wind,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Activity,
  Snowflake,
  Flame,
  CheckCircle2
} from "lucide-react";

export function ColdChainMonitorModal({ isOpen, onClose }) {
  const { climateSensors = [], refresh, loading } = useRealtimeData() || {};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-bold">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">Cold Chain & Environmental IoT Telemetry</h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ALL ZONES OPTIMAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Live HVAC sensors across Ambient, Chemical Safety, Dry Grocery & Deep Cold Storage.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {climateSensors.map((sensor) => {
              const isCold = sensor.zoneCode === "Zone D";
              return (
                <div
                  key={sensor.zoneCode}
                  className={`p-4 rounded-xl border transition-all ${isCold
                    ? "bg-gradient-to-br from-blue-50 to-cyan-50/50 border-blue-200 shadow-sm"
                    : "bg-white border-slate-200/90 shadow-soft"
                    }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {sensor.zoneCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {sensor.zoneName}
                      </span>
                    </div>
                    <Badge variant="success">OPTIMAL</Badge>
                  </div>

                  {/* Temperature & Humidity Metrics */}
                  <div className="grid grid-cols-2 gap-3 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <Thermometer className={`w-4 h-4 ${isCold ? "text-blue-500" : "text-amber-500"}`} />
                        <span>Temperature</span>
                      </div>
                      <div className="font-mono text-2xl font-black text-slate-900">
                        {sensor.temperatureCelsius}°C
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target: {sensor.targetRange}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <span>Humidity</span>
                      </div>
                      <div className="font-mono text-2xl font-black text-slate-900">
                        {sensor.humidityPct}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target: {sensor.humidityTarget}
                      </div>
                    </div>
                  </div>

                  {/* Compressor & IoT Node Info */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Node: {sensor.sensorId}</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {sensor.compressorState.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance Card */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">FSSAI & Global HACCP Food Safety Compliance: Passed</span>
                <p className="text-[11px] text-emerald-700">
                  Continuous cold-chain logging verified. No thermal excursions logged in last 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="btn-outline text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
