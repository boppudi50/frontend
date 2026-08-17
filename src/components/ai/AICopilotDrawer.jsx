import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Zap,
  Package,
  AlertTriangle,
  Flame,
  ThermometerSnowflake,
  IndianRupee,
  ShieldCheck,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ArrowRight,
  Building2,
  Minimize2,
  Maximize2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useRealtimeData } from "../../context/RealtimeDataContext";
import { useToast } from "../../context/ToastContext";
import { DecisionCard } from "../common/DecisionCard";

const CATEGORIZED_PROMPTS = [
  {
    icon: Flame,
    category: "SLA Priority",
    text: "Which urgent SLA orders need immediate wave dispatch?",
    tag: "Priority SLA"
  },
  {
    icon: Package,
    category: "Allocation Logic",
    text: "Why did the system allocate 7 units to Order #1042?",
    tag: "Order #1042"
  },
  {
    icon: AlertTriangle,
    category: "Stockout Risks",
    text: "Which products are below safety buffer and need reorder?",
    tag: "Low Stock"
  },
  {
    icon: Zap,
    category: "TSP Routing",
    text: "What is causing the Zone B picking bottleneck and how does TSP routing fix it?",
    tag: "TSP Route"
  },
  {
    icon: ThermometerSnowflake,
    category: "Cold Chain",
    text: "Are any cold storage reefer chambers exceeding temperature thresholds?",
    tag: "Cold Chain"
  },
  {
    icon: IndianRupee,
    category: "Unit Economics",
    text: "Show today's gross revenue, courier cost breakdown, and net profit margin.",
    tag: "Profit & ROI"
  },
  {
    icon: ShieldCheck,
    category: "Exceptions",
    text: "Show unresolved damaged item exceptions and pending return restock items.",
    tag: "QC & RTO"
  }
];

function formatInline(str) {
  if (!str) return "";
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  const tokens = str.split(regex);

  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith("`") && tok.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#0E8FAE] border border-slate-200"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith("*") && tok.endsWith("*")) {
      return (
        <em key={i} className="italic text-slate-600">
          {tok.slice(1, -1)}
        </em>
      );
    }
    return tok;
  });
}

function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-xs sm:text-[13px] font-black text-slate-900 flex items-center gap-1.5 pt-1 text-[#0E8FAE]"
            >
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-xs sm:text-sm font-black text-slate-900 pt-1">
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }

        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^[•\-\*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E8FAE] mt-1.5 shrink-0" />
              <div className="flex-1 leading-snug">{formatInline(content)}</div>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s+/)[1];
          const content = trimmed.replace(/^\d+\.\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5">
              <span className="font-mono font-bold text-[#0E8FAE] shrink-0 text-[11px]">{num}.</span>
              <div className="flex-1 leading-snug">{formatInline(content)}</div>
            </div>
          );
        }

        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

export function AICopilotDrawer({ isOpen, onClose }) {
  const { activeScope = "ALL", activeHub = null } = useRealtimeData() || {};
  const { toast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: "m-0",
      sender: "ai",
      text: `### 🤖 StockFlow AI Operations Copilot\n\nHello! I am your real-time **StockFlow Warehouse Operations Copilot**, grounded directly in live telemetry across all **5 StockFlow Fulfillment Centers** (\`HYD-01\`, \`MUM-01\`, \`VJA-01\`, \`MAH-01\`, \`CHE-01\`).\n\n• **SLA Risk Monitoring**: Tracking critical 2-hour order cutoff deadlines.\n• **TSP Pick Path Routing**: Aisle travel minimization & wave batching.\n• **Stockout Protection**: Automated FEFO inventory replenishment.\n\n*How can I assist your floor operations right now?*`,
      decisionCard: {
        situation: "Live multi-hub telemetry synchronized across 5 fulfillment centers.",
        decision: "Operating under Smart Wave & Traveling Salesperson (TSP) heuristic.",
        reason: "Zero-latency Cloud Firestore persistence and verified RBAC governance.",
        action: "Select a high-impact query below or type your question.",
        result: "Instant grounded intelligence with actionable navigation links."
      },
      actionLink: { label: "View Active Orders", path: "/orders" },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSend = async (queryToSend = null) => {
    const text = queryToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await api.askCopilot(text, activeScope);

      let actionLink = null;
      const lower = text.toLowerCase();
      if (lower.includes("order") || lower.includes("sla") || lower.includes("1042") || lower.includes("process first")) {
        actionLink = { label: "Open Orders Queue", path: "/orders" };
      } else if (lower.includes("stockout") || lower.includes("replenish") || lower.includes("reorder") || lower.includes("inventory")) {
        actionLink = { label: "Open Inventory Stock", path: "/inventory" };
      } else if (lower.includes("bottleneck") || lower.includes("tsp") || lower.includes("pick") || lower.includes("zone b")) {
        actionLink = { label: "Open Wave Picking", path: "/picking" };
      } else if (lower.includes("temperature") || lower.includes("cold") || lower.includes("reefer") || lower.includes("freeze")) {
        actionLink = { label: "Open Warehouse Map", path: "/map" };
      } else if (lower.includes("revenue") || lower.includes("profit") || lower.includes("margin") || lower.includes("spend")) {
        actionLink = { label: "Open Profit Intelligence", path: "/finance" };
      } else if (lower.includes("exception") || lower.includes("damage") || lower.includes("rto") || lower.includes("return")) {
        actionLink = { label: "Open Exception Center", path: "/exceptions" };
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.answer,
        decisionCard: res.decisionCard,
        actionLink,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "⚠️ **Telemetry Analysis Notice**: Unable to query the real-time decision engine. Please verify the backend is active.",
          decisionCard: null,
          actionLink: null,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info("Copied to Clipboard", "AI decision summary copied.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setFeedbackGiven((prev) => ({ ...prev, [id]: type }));
    toast.success(
      "Feedback Recorded",
      type === "up" ? "Marked as accurate decision." : "Feedback submitted for model calibration."
    );
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: "ai",
        text: `### 🔄 Session Reset\n\nActive Scope: **${
          activeScope === "ALL" ? "Consolidated 5-Hub Network" : activeHub?.name || activeScope
        }**.\n\nAll real-time decision matrices and SKU stock levels are loaded. How can I assist you?`,
        decisionCard: null,
        actionLink: null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]);
    toast.info("New Session Started", "Chat history cleared.");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 bg-white border-l border-slate-200/90 shadow-2xl flex flex-col transition-all duration-200 animate-in slide-in-from-right ${
        isExpanded ? "w-full sm:w-[540px]" : "w-full sm:w-[380px]"
      }`}
    >
      {/* 1. Header Banner - Radiant Navy + Sky Blue Gradient */}
      <div className="px-4 py-3.5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0E8FAE]/40 via-[#0A2E50] to-[#041628] text-white flex items-center justify-between border-b border-[#38D2F3]/40 shrink-0 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-gradient-to-bl from-[#92EEFF]/25 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2.5 min-w-0 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#92EEFF] to-[#0E8FAE] text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(146,238,255,0.4)] border border-[#92EEFF] shrink-0">
            <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                StockFlow AI Intelligence
              </h2>
              <span className="text-[9px] font-black font-mono px-1.5 py-0.2 rounded-full bg-[#92EEFF] text-slate-950 border border-[#92EEFF] shrink-0 shadow-xs">
                PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-200 flex items-center gap-1 truncate font-medium">
              <Building2 className="w-2.5 h-2.5 text-[#92EEFF]" />
              <span className="truncate">
                {activeScope === "ALL" ? "All 5 StockFlow Hubs Telemetry" : `${activeHub?.name || activeScope} Active Node`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isExpanded ? "Standard width" : "Expand width"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Horizontal Quick Decision Chips */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {CATEGORIZED_PROMPTS.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q.text)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#92EEFF] hover:bg-[#E5FAFE] hover:text-[#0E8FAE] transition-all shadow-2xs whitespace-nowrap shrink-0"
              >
                <Icon className="w-3 h-3 text-[#0E8FAE]" />
                <span>{q.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Messages Feed */}
      <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAi ? "items-start" : "items-end"} animate-in fade-in duration-150`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                {isAi && (
                  <span className="font-bold text-[#0E8FAE] flex items-center gap-0.5">
                    <Bot className="w-2.5 h-2.5" />
                    AI Decision
                  </span>
                )}
                <span>{m.timestamp}</span>
              </div>

              <div
                className={`max-w-[95%] rounded-2xl p-3 sm:p-3.5 leading-relaxed ${
                  isAi
                    ? "bg-white text-slate-900 rounded-tl-xs border border-slate-200/90 shadow-2xs"
                    : "bg-slate-900 text-white rounded-tr-xs shadow-xs"
                }`}
              >
                {/* Formatted Markdown Content */}
                {isAi ? (
                  <FormattedMessage text={m.text} />
                ) : (
                  <div className="text-xs sm:text-[13px] font-medium whitespace-pre-line">{m.text}</div>
                )}

                {/* Structured Decision Card */}
                {m.decisionCard && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <DecisionCard decision={m.decisionCard} />
                  </div>
                )}

                {/* Contextual Action Link Button */}
                {m.actionLink && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(m.actionLink.path);
                        onClose();
                      }}
                      className="btn-primary text-[11px] font-bold py-1 px-3 text-slate-950 flex items-center gap-1 shadow-2xs"
                    >
                      <span>{m.actionLink.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">{m.actionLink.path}</span>
                  </div>
                )}

                {/* AI Footer: Copy & Feedback */}
                {isAi && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-slate-400">Grounded WMS</span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy"
                      >
                        {copiedId === m.id ? (
                          <span className="text-[10px] font-bold text-emerald-600">Copied!</span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, "up")}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                          feedbackGiven[m.id] === "up" ? "text-emerald-600 font-bold" : "text-slate-400"
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, "down")}
                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                          feedbackGiven[m.id] === "down" ? "text-rose-600 font-bold" : "text-slate-400"
                        }`}
                        title="Needs Calibration"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 p-3 text-xs font-bold text-slate-700 bg-white rounded-xl border border-slate-200 shadow-2xs w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0E8FAE]" />
            <span>Analyzing warehouse telemetry...</span>
          </div>
        )}
      </div>

      {/* 4. Input Footer - Sleek & Compact */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="space-y-1.5"
        >
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Copilot about orders, inventory, SLAs..."
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92EEFF] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="absolute right-1.5 p-1.5 bg-[#0E8FAE] hover:bg-[#0c7f9b] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Send (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#0E8FAE]" />
              <span>Grounded in Cloud Firestore</span>
            </div>
            <span className="font-mono text-[9px]">Press Enter ↵</span>
          </div>
        </form>
      </div>
    </div>
  );
}
