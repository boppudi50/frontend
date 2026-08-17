import React, { useState, useEffect } from "react";
import { Boxes, Zap, ShieldCheck, Activity, Cpu } from "lucide-react";

export function AppSplashLoader({ onComplete = null, duration = 1400 }) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Initializing HYD-01 Central Network Node...");
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusText("Syncing FEFO Cold-Chain Telemetry (3.6°C)...");
    }, duration * 0.25);

    const t2 = setTimeout(() => {
      setProgress(75);
      setStatusText("Routing Dynamic TSP Path Allocation...");
    }, duration * 0.55);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("StockFlow Enterprise Control Tower Synced ● Online");
    }, duration * 0.85);

    const t4 = setTimeout(() => {
      setFadingOut(true);
    }, duration);

    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A2E50] via-[#041628] to-[#020B14] text-white select-none transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Ambient Glow Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-[#92EEFF]/20 via-[#0E8FAE]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#1D4ED8]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center space-y-6">
        {/* Animated Brand Hexagon Logo */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0E8FAE] to-[#92EEFF] text-slate-950 flex items-center justify-center font-black shadow-[0_0_50px_rgba(146,238,255,0.6)] border border-[#92EEFF] animate-pulse">
            <Boxes className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-[#92EEFF]/30 blur-xl animate-ping pointer-events-none" />
        </div>

        {/* Brand Title & Official Badge */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
              Stock<span className="text-[#92EEFF] drop-shadow-[0_0_15px_rgba(146,238,255,0.7)]">Flow</span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#92EEFF] text-slate-950 px-2.5 py-0.5 rounded-md shadow-[0_0_12px_rgba(146,238,255,0.5)]">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            Autonomous Multi-Hub Fulfillment & Warehouse Operating System
          </p>
        </div>

        {/* Progress Bar & Status Ticker */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/15 backdrop-blur-md shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0E8FAE] via-[#92EEFF] to-[#0E8FAE] transition-all duration-300 rounded-full shadow-[0_0_14px_#92EEFF]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 px-0.5">
            <span className="flex items-center gap-1.5 truncate text-[#92EEFF]">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              {statusText}
            </span>
            <span className="font-bold text-white shrink-0 ml-2">{progress}%</span>
          </div>
        </div>

        {/* Network Location Micro Badge */}
        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>HYD-01 Central Network Node</span>
          <span>•</span>
          <span className="text-slate-300">Live Synced</span>
        </div>
      </div>
    </div>
  );
}
