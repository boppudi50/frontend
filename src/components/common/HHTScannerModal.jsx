import React, { useState, useEffect, useRef } from "react";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  Barcode,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Crosshair,
  Camera,
  Layers,
  Sparkles
} from "lucide-react";

function playAudioTone(type = "beep") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "beep") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "success") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "error") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    // Ignore audio restrictions
  }
}

export function HHTScannerModal({ isOpen, onClose, expectedSku = null, onScanSuccess = null }) {
  const { inventory = [], orders = [] } = useRealtimeData() || {};
  const { toast } = useToast();
  const [scannedInput, setScannedInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanningAnimation, setIsScanningAnimation] = useState(false);
  const [isInitializingScanner, setIsInitializingScanner] = useState(true);
  const [initProgress, setInitProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setScannedInput(expectedSku || "");
      setIsInitializingScanner(true);
      setInitProgress(15);

      const t1 = setTimeout(() => setInitProgress(65), 150);
      const t2 = setTimeout(() => setInitProgress(100), 300);
      const t3 = setTimeout(() => {
        setIsInitializingScanner(false);
        if (inputRef.current) inputRef.current.focus();
        if (soundEnabled) playAudioTone("beep");
      }, 420);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen, expectedSku]);

  if (!isOpen) return null;

  const handleTriggerScan = (overrideValue = null) => {
    const rawVal = overrideValue || scannedInput;
    if (!rawVal.trim()) return;

    const val = rawVal.trim().toUpperCase();
    setIsScanningAnimation(true);

    if (soundEnabled) playAudioTone("beep");

    setTimeout(async () => {
      setIsScanningAnimation(false);

      if (expectedSku) {
        // Verification against expected SKU
        if (val === expectedSku.toUpperCase()) {
          if (soundEnabled) playAudioTone("success");
          toast.success("SKU Verified", `Barcode ${val} matches picking invoice.`);
          setScanResult({
            status: "MATCH",
            title: "SKU Verified Successfully",
            message: `Scanned item ${val} perfectly matches picking invoice.`,
            sku: val,
            productName: inventory.find((i) => i.sku === val)?.productName || "Verified Product",
            bin: inventory.find((i) => i.sku === val)?.bin || "A-01"
          });
          if (onScanSuccess) onScanSuccess(val);
        } else {
          if (soundEnabled) playAudioTone("error");
          toast.error("Scan Mismatch Intercepted", `Scanned ${val}, expected ${expectedSku}!`);
          try {
            await api.scanVerifyItem({
              orderId: "Active Order",
              expectedSku: expectedSku,
              scannedSku: val
            });
          } catch (e) {}

          setScanResult({
            status: "MISMATCH",
            title: "CRITICAL MISMATCH INTERCEPTED",
            message: `Scanned ${val}, but system expected ${expectedSku}! Do NOT pack this item.`,
            sku: val,
            expectedSku: expectedSku
          });
        }
      } else {
        // General SKU / Bin search
        const matchedItem = inventory.find(
          (i) => i.sku.toUpperCase() === val || (i.bin && i.bin.toUpperCase() === val) || (i.productName || "").toUpperCase().includes(val)
        );

        if (matchedItem) {
          if (soundEnabled) playAudioTone("success");
          toast.success("Barcode Located", `Mapped to Bin ${matchedItem.bin} (${matchedItem.productName})`);
          setScanResult({
            status: "MATCH",
            title: `Item Found: ${matchedItem.sku}`,
            message: `${matchedItem.productName} • Location: Bin ${matchedItem.bin} (${matchedItem.zone})`,
            sku: matchedItem.sku,
            productName: matchedItem.productName,
            bin: matchedItem.bin,
            available: matchedItem.availableQuantity,
            batch: matchedItem.batchNumber
          });
        } else {
          if (soundEnabled) playAudioTone("error");
          toast.error("Barcode Not Found", `Scanned barcode ${val} is not mapped in this center.`);
          setScanResult({
            status: "MISMATCH",
            title: "Barcode Not Found in Facility",
            message: `Scanned barcode ${val} is not mapped to any active bin.`,
            sku: val
          });
        }
      }
    }, 500);
  };

  const PRESET_BARCODES = [
    { label: "Dove Shampoo (Demo)", code: "SKU-PER-0001", type: "Personal Care" },
    { label: "Oreo Sandwich 300g", code: "SKU-GRO-0001", type: "Snacks" },
    { label: "Bisleri Mineral Water 1L", code: "SKU-BEV-0001", type: "Beverages" },
    { label: "Tide Detergent 1kg", code: "SKU-CLE-0001", type: "Cleaning" },
    { label: "Bin A-01 (Zone A Rack 1)", code: "A-01", type: "Location" },
    { label: "Wrong Item (Test Mismatch)", code: "SKU-WRONG-999", type: "Invalid" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Rugged Handheld Terminal Chassis */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 ring-4 ring-slate-800">
        
        {/* Top HHT Bezel with Status LED & Speaker */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isInitializingScanner ? "bg-amber-400 animate-ping" : "bg-emerald-500 animate-pulse"} shadow-sm`} />
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400">
              ZEBRA TC57 • RF OPTICAL 2D IMAGER
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-slate-400 hover:text-white transition-colors"
              title={soundEnabled ? "Mute Audio Beeper" : "Enable Audio Beeper"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#92EEFF]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Terminal Screen Area */}
        <div className="p-5 space-y-4 bg-gradient-to-b from-slate-900 to-slate-950 overflow-y-auto max-h-[80vh]">
          
          {/* Laser Viewfinder Box */}
          <div className="relative bg-slate-950 border-2 border-slate-700/80 rounded-2xl p-4 overflow-hidden shadow-inner flex flex-col items-center justify-center min-h-[160px]">
            {/* Viewfinder corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#92EEFF]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#92EEFF]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#92EEFF]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#92EEFF]" />

            {/* SCANNER INITIALIZING LOADING STATE */}
            {isInitializingScanner ? (
              <div className="flex flex-col items-center justify-center gap-2.5 py-4 animate-in fade-in">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#92EEFF]/30 border-t-[#92EEFF] animate-spin" />
                  <Camera className="w-4 h-4 text-[#92EEFF]" />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xs font-mono font-bold text-slate-200">
                    Initializing Optical Imager & Laser Beam...
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Calibrating 2D Sensor • {initProgress}%
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-44 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#92EEFF] to-cyan-400 transition-all duration-150"
                    style={{ width: `${initProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Red Laser Sweep Line Animation */}
                {isScanningAnimation && (
                  <div className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_14px_#ff0000] animate-laser-sweep z-10" />
                )}

                {/* Central Barcode Target */}
                <div className="flex flex-col items-center justify-center gap-1.5 opacity-90 py-2">
                  <div className="relative">
                    <Barcode className="w-24 h-11 text-slate-300 stroke-[1.5]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Crosshair className="w-6 h-6 text-[#92EEFF]/40" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#92EEFF] tracking-wider">
                    {scannedInput || "READY TO SCAN"}
                  </span>
                </div>

                {expectedSku && (
                  <div className="absolute bottom-2 bg-slate-900/90 border border-slate-700 px-3 py-0.5 rounded-full text-[10px] font-mono text-[#92EEFF]">
                    Target: {expectedSku}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Barcode Input Field & Trigger Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTriggerScan();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={scannedInput}
                onChange={(e) => setScannedInput(e.target.value.toUpperCase())}
                placeholder="Scan or type SKU / Barcode..."
                disabled={isInitializingScanner}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#92EEFF] focus:border-transparent uppercase disabled:opacity-50"
              />
            </div>

            <button
              type="button"
              onClick={() => handleTriggerScan()}
              disabled={isInitializingScanner || isScanningAnimation || !scannedInput.trim()}
              className="btn-primary text-xs font-bold px-4 py-2 bg-gradient-to-r from-[#92EEFF] to-[#38D2F3] text-slate-950 shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isScanningAnimation ? "Scanning..." : "TRIGGER"}</span>
            </button>
          </form>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Test Barcodes</span>
              <span className="text-[9px] text-slate-500">1-Click Scan</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRESET_BARCODES.map((preset) => (
                <button
                  key={preset.code}
                  type="button"
                  onClick={() => {
                    setScannedInput(preset.code);
                    handleTriggerScan(preset.code);
                  }}
                  disabled={isInitializingScanner}
                  className={`text-left p-2 rounded-lg border text-[11px] font-medium transition-all ${
                    preset.type === "Invalid"
                      ? "bg-red-950/30 border-red-800/60 text-red-300 hover:bg-red-900/40"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white"
                  }`}
                >
                  <div className="font-mono font-bold truncate">{preset.code}</div>
                  <div className="text-[9px] text-slate-400 truncate">{preset.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Verification Result Card */}
          {scanResult && (
            <div
              className={`p-4 rounded-xl border animate-in slide-in-from-bottom-2 duration-150 space-y-2 ${
                scanResult.status === "MATCH"
                  ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-100"
                  : "bg-red-950/40 border-red-500/60 text-red-100"
              }`}
            >
              <div className="flex items-center gap-2">
                {scanResult.status === "MATCH" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div className="font-bold text-xs">{scanResult.title}</div>
              </div>

              <p className="text-[11px] leading-relaxed opacity-90">{scanResult.message}</p>

              {scanResult.status === "MATCH" && scanResult.bin && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800/60 text-[10px] font-mono">
                  <div>
                    <span className="text-emerald-400 block">Bin Location</span>
                    <span className="font-bold text-white">{scanResult.bin}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 block">Available</span>
                    <span className="font-bold text-white">{scanResult.available ?? 7} Units</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 block">Quality Status</span>
                    <span className="font-bold text-white">QC PASSED</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Connected: StockFlow Mesh (5.8 GHz)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-all text-xs"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
