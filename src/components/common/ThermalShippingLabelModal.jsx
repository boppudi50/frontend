import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Badge } from "./Badge";
import {
  Printer,
  X,
  Barcode,
  Truck,
  Building2,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Cpu
} from "lucide-react";

export function ThermalShippingLabelModal({ orderId, isOpen, onClose }) {
  const { toast } = useToast();
  const [labelData, setLabelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renderProgress, setRenderProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      setRenderProgress(20);

      const p1 = setTimeout(() => setRenderProgress(60), 120);
      const p2 = setTimeout(() => setRenderProgress(100), 280);

      api.getShippingLabelData(orderId)
        .then((res) => {
          setLabelData(res);
        })
        .catch((err) => {
          console.error("Error fetching label data:", err);
        })
        .finally(() => {
          setTimeout(() => setLoading(false), 360);
        });

      return () => {
        clearTimeout(p1);
        clearTimeout(p2);
      };
    }
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    toast.info(
      "Thermal Print Job Dispatched",
      `4x6 Master AWB label sent to Zebra ZD421 (203 DPI) for Consignment ${labelData?.orderNumber || orderId}.`
    );
    window.print();
  };

  const handleCopyTracking = () => {
    if (labelData?.trackingNumber) {
      navigator.clipboard.writeText(labelData.trackingNumber);
      setCopied(true);
      toast.success("AWB Copied", `Tracking number ${labelData.trackingNumber} copied to clipboard.`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate simulated Code 128 vertical bar pattern
  const renderBarcodeBars = (codeString) => {
    const bars = [];
    const hash = (codeString || "TRK99201").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 52; i++) {
      const isThick = ((hash * (i + 7)) % 7) > 3;
      const isGap = ((hash * (i + 3)) % 11) === 0;
      bars.push(
        <div
          key={i}
          className={`${
            isGap ? "w-0.5 bg-transparent" : isThick ? "w-1.5 bg-black" : "w-0.5 bg-black"
          } h-14 inline-block mx-[1px]`}
        />
      );
    }
    return bars;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#92EEFF] text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm">4" × 6" Thermal Shipping Label (AWB)</h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-[#92EEFF]">
                  203 DPI ZPL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Consignment: <b className="text-white">{labelData?.orderNumber || orderId}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading}
              className="btn-primary text-xs font-bold py-1.5 px-3.5 shadow-sm flex items-center gap-1.5 bg-[#92EEFF] text-slate-950 hover:bg-[#38D2F3] disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Printable 4x6 Label Container */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center items-center min-h-[360px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 animate-in fade-in">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-3 border-cyan-200 border-t-[#0E8FAE] animate-spin" />
                <Cpu className="w-5 h-5 text-[#0E8FAE]" />
              </div>
              <div className="text-center space-y-1">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Rasterizing 203 DPI Vector Thermal Label...
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Calibrating Zebra Printhead • {renderProgress}%
                </div>
              </div>
              <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0E8FAE] transition-all duration-150"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          ) : labelData ? (
            <div
              id="thermal-label-print-area"
              className="w-full max-w-[380px] bg-white border-2 border-black text-black font-sans shadow-md p-4 space-y-3 animate-in zoom-in-95 duration-150"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Top Header: Carrier & Channel */}
              <div className="border-b-2 border-black pb-2 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xl font-black tracking-tighter">
                    StockFlow Logistics
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {labelData.channel ? labelData.channel.replace(/_/g, " ") : "ENTERPRISE FULFILLMENT NETWORK"}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-lg font-black bg-black text-white px-2 py-0.5 rounded">
                    {labelData.priorityLevel === "CRITICAL" ? "P1 - SLA" : "STD - FWD"}
                  </span>
                  <div className="text-[9px] font-bold mt-0.5">{labelData.routingCode}</div>
                </div>
              </div>

              {/* Primary Tracking Barcode */}
              <div className="text-center py-1 border-b-2 border-black space-y-1">
                <div className="flex justify-center items-center overflow-hidden py-1">
                  {renderBarcodeBars(labelData.trackingNumber)}
                </div>
                <div className="font-mono text-xs font-black tracking-widest flex items-center justify-center gap-2">
                  <span>{labelData.trackingNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyTracking}
                    className="text-slate-500 hover:text-black transition-colors"
                    title="Copy AWB Tracking Number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Ship From & Ship To Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] border-b-2 border-black pb-2 leading-tight">
                <div>
                  <div className="font-bold uppercase text-slate-600">SHIP FROM (ORIGIN):</div>
                  <div className="font-bold text-black">{labelData.shipFrom?.facilityName}</div>
                  <div>{labelData.shipFrom?.address}</div>
                  <div>{labelData.shipFrom?.city}, {labelData.shipFrom?.state}</div>
                </div>

                <div>
                  <div className="font-bold uppercase text-slate-600">SHIP TO (CONSIGNEE):</div>
                  <div className="font-bold text-black">{labelData.shipTo?.customerName}</div>
                  <div>{labelData.shipTo?.address}</div>
                  <div className="font-bold mt-1">HUB CODE: {labelData.shipFrom?.hubId}</div>
                </div>
              </div>

              {/* Package Specs & Scale Weight */}
              <div className="grid grid-cols-3 gap-1 text-[10px] border-b-2 border-black pb-2 text-center font-mono">
                <div className="border-r border-black pr-1">
                  <div className="text-slate-600 font-sans text-[9px] font-bold">GROSS WT</div>
                  <div className="font-bold text-xs">{labelData.grossWeightKg} KG</div>
                </div>
                <div className="border-r border-black px-1">
                  <div className="text-slate-600 font-sans text-[9px] font-bold">BOX TYPE</div>
                  <div className="font-bold text-xs">{labelData.assignedBoxType}</div>
                </div>
                <div className="pl-1">
                  <div className="text-slate-600 font-sans text-[9px] font-bold">PIECES</div>
                  <div className="font-bold text-xs">{labelData.items?.length || 1} SKUs</div>
                </div>
              </div>

              {/* SSCC-18 Secondary 2D Barcode */}
              <div className="pt-1 flex items-center justify-between text-[9px] font-mono">
                <div>
                  <div className="font-bold">SSCC-18 PALLET IDENTIFIER:</div>
                  <div className="text-slate-700">{labelData.sscc18}</div>
                  <div className="text-[8px] text-slate-500 font-sans mt-0.5">
                    Carrier: {labelData.carrier}
                  </div>
                </div>

                <div className="border border-black p-1 text-center font-bold bg-slate-50">
                  <div className="text-[8px]">QA INSPECT</div>
                  <div className="text-[10px] text-black">PASS-04</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Unable to load label metadata.</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Standard GS1 Logistics Label Standard (EAN-128 / SSCC-18)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-outline text-xs py-1.5 px-3"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
