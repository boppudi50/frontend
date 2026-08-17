import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Boxes,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Activity,
  GitPullRequestDraft,
  IndianRupee,
  Building2,
  CheckCircle2,
  Cpu
} from "lucide-react";

export function LoginPage() {
  const { signIn, loading: authLoading, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const rawMsg = err.message || "";
      if (rawMsg.includes("disabled") || rawMsg.includes("Disabled")) {
        setErrorMessage("Your StockFlow account is currently disabled. Please contact your administrator.");
      } else if (rawMsg.includes("network") || rawMsg.includes("fetch")) {
        setErrorMessage("Network error. Please check your internet connection and retry.");
      } else {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickRole = (roleEmail, rolePass = "12345678") => {
    setEmail(roleEmail);
    setPassword(rolePass);
    if (errorMessage) setErrorMessage("");
  };

  const isBusy = submitting || authLoading;
  const activeError = errorMessage || authError;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans selection:bg-[#92EEFF] selection:text-slate-950">
      {/* ========================================================================= */}
      {/* 1. LEFT HERO STAGE (Official Enterprise Platform Showcase)                */}
      {/* ========================================================================= */}
      <div className="lg:w-7/12 xl:w-8/12 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#0A2E50] via-[#041628] to-[#020B14] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#0E8FAE]/30 text-white min-h-[420px] lg:min-h-screen">
        {/* Luminous Ambient Flares */}
        <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-gradient-to-br from-[#92EEFF]/20 via-[#0E8FAE]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-[#1D4ED8]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0E8FAE] to-[#92EEFF] text-slate-950 flex items-center justify-center font-black shadow-[0_0_30px_rgba(146,238,255,0.5)] border border-[#92EEFF]">
              <Boxes className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  Stock<span className="text-[#92EEFF] drop-shadow-[0_0_12px_rgba(146,238,255,0.6)]">Flow</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#92EEFF] text-slate-950 px-2 py-0.5 rounded shadow-xs">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium tracking-wide">
                Autonomous Multi-Hub Fulfillment & Warehouse Operating System
              </p>
            </div>
          </div>
        </div>

        {/* Center Platform Pitch & High-Value Capabilities */}
        <div className="relative z-10 my-8 lg:my-0 space-y-8 max-w-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#92EEFF]/15 text-[#92EEFF] border border-[#92EEFF]/30">
              <span className="w-2 h-2 rounded-full bg-[#92EEFF] animate-ping" />
              <span>NEXT-GEN LOGISTICS OPERATING SYSTEM</span>
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">
              Intelligent Warehouse Control Tower & <span className="text-[#92EEFF]">Multi-Channel Allocation</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Powering FMCG supply chains across 5 Indian fulfillment centers with sub-second FEFO lot allocation, TSP pick wave optimization, and real-time loss intelligence.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-[#92EEFF]/40 rounded-xl p-3.5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#92EEFF]/20 text-[#92EEFF] flex items-center justify-center mb-2 border border-[#92EEFF]/30">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">Smart Auto-Allocation</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Multi-echelon demand routing across Amazon, DMart, Flipkart & Zepto.</div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 rounded-xl p-3.5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2 border border-emerald-400/30">
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">FEFO & Cold-Chain Telemetry</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Sub-4°C sensor monitoring & automated lot expiration rotation.</div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-cyan-400/40 rounded-xl p-3.5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-[#92EEFF] flex items-center justify-center mb-2 border border-cyan-400/30">
                <GitPullRequestDraft className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">Dynamic TSP Pick Optimizer</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Traveling Salesperson routing algorithms saving 38% picker travel time.</div>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-amber-400/40 rounded-xl p-3.5 transition-all">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2 border border-amber-400/30">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="text-xs font-black text-white">Loss & Margin Intelligence</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Instant P&L conversion, RTO tracking, and active margin leak prevention.</div>
            </div>
          </div>
        </div>

        {/* Bottom Network Status Ribbon */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">5 STOCKFLOW FULFILLMENT HUBS ACTIVE:</span>
            <span className="text-slate-300">HYD-01 • MUM-01 • VJA-01 • MAH-01 • CHE-01</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOC 2 Type II • 256-bit AES</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT AUTH CONSOLE (Enterprise Sign-In Form)                           */}
      {/* ========================================================================= */}
      <div className="lg:w-5/12 xl:w-4/12 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 shadow-2xl">
        <div className="my-auto space-y-6 max-w-md w-full mx-auto">
          {/* Header */}
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E5FAFE] text-[#0E8FAE] border border-[#92EEFF]">
              <Cpu className="w-3 h-3" />
              <span>CONTROL TOWER ACCESS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Sign In to StockFlow
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter your authorized operational credentials to access your facility dashboard.
            </p>
          </div>

          {/* Quick Fill Demo Roles Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Demo Quick-Access Roles</span>
              <span className="text-[9px] font-mono text-[#0E8FAE] font-bold">1-CLICK FILL</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => fillQuickRole("admin@gmail.com")}
                className="px-2 py-1.5 bg-white hover:bg-[#E5FAFE] text-slate-800 hover:text-[#0E8FAE] border border-slate-200 hover:border-[#92EEFF] rounded-lg font-bold transition-all shadow-2xs text-center"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickRole("ooha@gmail.com")}
                className="px-2 py-1.5 bg-white hover:bg-[#E5FAFE] text-slate-800 hover:text-[#0E8FAE] border border-slate-200 hover:border-[#92EEFF] rounded-lg font-bold transition-all shadow-2xs text-center"
              >
                ⚡ Operations
              </button>
              <button
                type="button"
                onClick={() => fillQuickRole("testinventory@example.com")}
                className="px-2 py-1.5 bg-white hover:bg-[#E5FAFE] text-slate-800 hover:text-[#0E8FAE] border border-slate-200 hover:border-[#92EEFF] rounded-lg font-bold transition-all shadow-2xs text-center"
              >
                📦 Inventory
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in duration-150 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="leading-relaxed font-medium">
                {activeError}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1.5 text-[11px]">
                WORK EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (activeError) setErrorMessage("");
                  }}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#92EEFF] focus:border-[#0E8FAE] focus:bg-white font-medium text-xs transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  PASSWORD
                </label>
                <span className="text-[10px] text-[#0E8FAE] font-bold hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (activeError) setErrorMessage("");
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#92EEFF] focus:border-[#0E8FAE] focus:bg-white font-medium text-xs transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isBusy || !email || !password}
                className="w-full bg-[#92EEFF] hover:bg-[#70E5FB] active:scale-[0.99] text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(146,238,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm cursor-pointer"
              >
                {isBusy ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Authorizing Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & System Info Footer */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-[10.5px] text-slate-400">
            <div className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protected by Firebase Authentication & RBAC</span>
            </div>
            <div className="font-mono text-[9.5px]">
              StockFlow v2.8.4 Enterprise Node • All Rights Reserved
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-[10px] text-slate-400">
          Need enterprise Single Sign-On (SAML/Okta)? Contact <span className="text-[#0E8FAE] font-bold cursor-pointer hover:underline">sysadmin@stockflow.io</span>
        </div>
      </div>
    </div>
  );
}
