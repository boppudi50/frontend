import React, { useState, useEffect } from "react";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Package,
  Truck,
  ShieldAlert,
  Clock,
  X,
  FastForward,
  IndianRupee,
  Layers,
  Scale,
  Barcode,
  Check
} from "lucide-react";
import { api } from "../../services/api";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import confetti from "canvas-confetti";

const DEMO_STEPS = [
  {
    step: 1,
    title: "Demand Contention Detection",
    phase: "DETECTION",
    icon: AlertTriangle,
    description: "Order #1042 (Metro Hypermarket, 10 units req) vs Order #1048 (Sunrise Grocery, 5 units req) contend for 7 physical units of Dove Shampoo (SKU-SHMP-001) in Bin A-01.",
    expectedOutcome: "Contention identified; triggers deterministic priority scoring.",
    roiImpact: "Prevents split-shipment penalty on Tier-1 customer order."
  },
  {
    step: 2,
    title: "Deterministic Priority Scoring",
    phase: "DECISION",
    icon: Sparkles,
    description: "Priority engine evaluates SLA deadlines, contractual tiers, and values. Order #1042 assigned CRITICAL (95/100, 2h SLA); Order #1048 assigned LOW (28/100, 48h SLA).",
    expectedOutcome: "Orders ranked deterministically for allocation stream.",
    roiImpact: "+₹74,620 Margin Protection for contractual on-time fulfillment."
  },
  {
    step: 3,
    title: "Smart Inventory Allocation",
    phase: "ACTION",
    icon: Package,
    description: "System allocates all 7 available units to Order #1042 (partial fulfillment). Order #1048 held in waiting queue. 3-unit shortage flagged.",
    expectedOutcome: "Available stock decremented to 0; Reserved stock = 7.",
    roiImpact: "Zero stock locking errors across 5 fulfillment centers."
  },
  {
    step: 4,
    title: "Replenishment Intelligence Triggered",
    phase: "RESULT",
    icon: Zap,
    description: "3-unit shortage automatically triggers Purchase Order recommendation #PO-2026-89 for 200 units to Unilever Logistics.",
    expectedOutcome: "Low-stock replenishment recommendation generated.",
    roiImpact: "Restores buffer safety stock ahead of next day pick waves."
  },
  {
    step: 5,
    title: "Picking Route Optimization (TSP)",
    phase: "ACTION",
    icon: Layers,
    description: "Aisle sequence optimized across warehouse spine: reduces travel time from 18 minutes to 11 minutes (saves 7 min, +38.8% gain).",
    expectedOutcome: "Pick wave issued along green corridor.",
    roiImpact: "+38.8% Pick Velocity gain (Saves 7 mins of floor walking time)."
  },
  {
    step: 6,
    title: "Simulated Quality Exception",
    phase: "EXCEPTION",
    icon: ShieldAlert,
    description: "1 leaking cap seal bottle reported at Packing Station 01. Damaged item exception automatically created in Exception Center.",
    expectedOutcome: "Order #1042 enters EXCEPTION state.",
    roiImpact: "Prevents customer delivery of defective goods (100% Quality Pass)."
  },
  {
    step: 7,
    title: "1-Click Automated Resolution",
    phase: "RESOLUTION",
    icon: Scale,
    description: "System recommends buffer unit swap from Bin A-01 reserve. Operator approves resolution; QC passes 6-point audit.",
    expectedOutcome: "Exception marked RESOLVED; Order set to READY_TO_DISPATCH.",
    roiImpact: "Instant resolution without supervisor escalation bottleneck."
  },
  {
    step: 8,
    title: "Carrier Dispatch & Audit Complete",
    phase: "FULFILLMENT",
    icon: Truck,
    description: "Order handed to FedEx Priority Freight (Tracking #TRK-FEDEX-9982410). Real-time inventory and full immutable audit trail recorded.",
    expectedOutcome: "Fulfillment completed with 100% data traceability.",
    roiImpact: "Immutable audit trail logged in Cloud Firestore."
  },
];

export function LiveScenarioModal({ isOpen, onClose }) {
  const { refresh } = useRealtimeData();
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState({});
  const [executing, setExecuting] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNextStep = async () => {
    setExecuting(true);
    try {
      const stepNum = currentStepIndex + 1;
      const res = await api.executeDemoStep(stepNum);
      setStepData((prev) => ({ ...prev, [stepNum]: res }));
      await refresh();

      if (currentStepIndex < DEMO_STEPS.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else {
        setCompleted(true);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Simulation Complete", "Order #1042 successfully processed end-to-end.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Execution Failed", "Could not complete simulation step.");
    } finally {
      setExecuting(false);
    }
  };

  const handleAutoRun = async () => {
    setAutoRunning(true);
    try {
      for (let i = currentStepIndex; i < DEMO_STEPS.length; i++) {
        const stepNum = i + 1;
        const res = await api.executeDemoStep(stepNum);
        setStepData((prev) => ({ ...prev, [stepNum]: res }));
        setCurrentStepIndex(i);
        await new Promise((r) => setTimeout(r, 600));
      }
      await refresh();
      setCompleted(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
      toast.success("Auto-Run Complete", "All 8 autonomous fulfillment stages executed.");
    } catch (err) {
      console.error(err);
      toast.error("Auto-Run Error", "Simulation encountered an issue.");
    } finally {
      setAutoRunning(false);
    }
  };

  const handleReset = async () => {
    setExecuting(true);
    try {
      await api.resetDemo();
      await refresh();
      setCurrentStepIndex(0);
      setStepData({});
      setCompleted(false);
      toast.info("State Reset", "Order #1042 scenario reset to initial seed state.");
    } catch (err) {
      console.error(err);
      toast.error("Reset Failed", "Could not reset scenario state.");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* 1. Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 flex items-center justify-center font-black shadow-md">
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Autonomous Order Execution: Order #1042
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#92EEFF]/20 text-[#92EEFF] border border-[#92EEFF]/40 uppercase">
                  Interactive Simulator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end autonomous fulfillment: Contention → Smart Wave → TSP Pick Path → 6-Point QC → Automated Manifest
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Step Flow Navigator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0E8FAE] animate-pulse" />
              STAGE {currentStepIndex + 1} OF 8: <b className="text-slate-900">{currentStep.phase} PHASE</b>
            </span>
            <span className="text-[#0E8FAE] font-mono font-bold">
              {Math.round(((currentStepIndex + (completed ? 1 : 0)) / DEMO_STEPS.length) * 100)}% Complete
            </span>
          </div>

          {/* Step Nodes */}
          <div className="grid grid-cols-8 gap-1.5 mb-2">
            {DEMO_STEPS.map((s, idx) => {
              const isPast = idx < currentStepIndex || completed;
              const isCurrent = idx === currentStepIndex && !completed;
              return (
                <div
                  key={s.step}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isPast
                      ? "bg-emerald-500"
                      : isCurrent
                      ? "bg-[#0E8FAE] animate-pulse"
                      : "bg-slate-200"
                  }`}
                  title={`Step ${s.step}: ${s.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* 3. Step Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/30">
          {!completed ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0E8FAE] flex items-center justify-center font-bold shrink-0">
                    <currentStep.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#0E8FAE] uppercase tracking-wider">
                      {currentStep.phase} PHASE
                    </div>
                    <h4 className="text-base font-black text-slate-900">
                      {currentStep.title}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                  Step {currentStep.step}/8
                </span>
              </div>

              {/* Scenario Details */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-2xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Scenario Details
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {currentStep.description}
                </p>
              </div>

              {/* Expected System Action */}
              <div className="bg-[#E5FAFE] border border-[#92EEFF] rounded-2xl p-4 space-y-1 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0E8FAE] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#0E8FAE]" />
                  <span>Autonomous Engine Decision & Expected Result</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 pl-6">
                  {currentStep.expectedOutcome}
                </p>
              </div>

              {/* Financial ROI / Operational Impact Callout */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <IndianRupee className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-900 font-bold">
                  <span>Operational Value: </span>
                  <span className="font-normal">{currentStep.roiImpact}</span>
                </div>
              </div>

              {stepData[currentStep.step] && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-mono font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Result: {stepData[currentStep.step].details || "Stage successfully committed to database."}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Order #1042 Autonomous Fulfillment Completed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1">
                  Order #1042 traversed the complete lifecycle from contention detection to smart allocation, TSP pick path optimization, simulated exception recovery, and FedEx priority manifest dispatch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-left">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Allocation</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">7/10 Units Allocated</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Pick Time Saved</div>
                  <div className="text-sm font-black text-emerald-700 mt-0.5">7 Mins (+38.8%)</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Final Status</div>
                  <div className="text-sm font-black text-[#0E8FAE] mt-0.5">DISPATCHED</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={executing || autoRunning}
            className="btn-outline text-xs font-bold py-2 px-3.5 text-slate-700 bg-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Initial Seed State</span>
          </button>

          <div className="flex items-center gap-2">
            {!completed && (
              <button
                type="button"
                onClick={handleAutoRun}
                disabled={executing || autoRunning}
                className="btn-outline text-xs font-bold py-2 px-3.5 text-[#0E8FAE] border-[#92EEFF] bg-[#E5FAFE] hover:bg-[#d6f7fd]"
                title="Automatically execute all remaining steps"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{autoRunning ? "Auto-Executing..." : "Auto-Run All 8 Steps"}</span>
              </button>
            )}

            {!completed ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={executing || autoRunning}
                className="btn-primary text-xs sm:text-sm font-bold py-2.5 px-5 text-slate-950 flex items-center gap-2"
              >
                {executing ? (
                  "Processing Stage..."
                ) : (
                  <>
                    <span>Execute Step {currentStep.step}: {currentStep.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs sm:text-sm font-bold py-2 px-6 text-slate-950"
              >
                Close & View Live Platform
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
