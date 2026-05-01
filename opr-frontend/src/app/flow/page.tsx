"use client";
import { DragProvider } from "@/provider/dragprovider";
import { WorkflowProvider } from "@/provider/statecontext";
import { PropertiesPanel } from "../testing/_components/properties";
import Sidebar from "./sidebar";
import CanvasDropZone from "../testing/_components/drop-zone";
import { SidebarProvider } from "@/provider/sidebarContext";
import { UserProvider } from "@/provider/userprovider";
import { FlowStateProvider } from "../../provider/flowstatecontext";
import { useDragContext } from "@/provider/dragprovider";
import { FloatingAddButton } from "../testing/_components/_components/addButton";
import NodePalettePanel from "../testing/_components/_components/nonCollapsiblePannel";
import { useFlowState } from "../../provider/flowstatecontext";
import { PerformancePanelButton } from "@/components/PerformancePanel";
import { Database, ChevronDown, ChevronUp, X, Download, Sparkles, Hash, Eye, EyeOff, ChevronRight, CheckCircle2, XCircle, Zap } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateWorkflowFromPrompt,
  generateWorkflowFromKeywords,
  type WorkflowProvider as AIProvider,
} from "@/lib/api";
import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/mockdata";
import { OnboardingTutorial, TutorialReplayButton } from "./_tutorial/OnboardingTutorial";

/* ── Bottom-right overlay: Intelligence + Results buttons ── */
function BottomRightOverlay() {
  const { lastExecution, workflowResult } =
    useFlowState();
  const [showInline, setShowInline] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  if (!lastExecution && !workflowResult) return null;

  return (
    <div className="absolute bottom-6 right-[340px] z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Results quick panel */}
      {workflowResult && showInline && (
        <ResultsQuickPanel
          result={workflowResult}
          onClose={() => setShowInline(false)}
        />
      )}

      <div className="flex items-center gap-2">
        {workflowResult && (
          <button
            onClick={() => setShowInline((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.03]"
            style={{
              background:
                "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(6,182,212,0.3)",
              color: "#67e8f9",
              boxShadow: "0 0 14px rgba(6,182,212,0.12)",
            }}
          >
            {showInline ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
            {showInline ? "Hide Results" : "View Results"}
          </button>
        )}

        {lastExecution && (
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <PerformancePanelButton
              executionId={lastExecution.executionId}
              workflowId={lastExecution.workflowId}
              apiBase={apiBase}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline results panel ── */
function ResultsQuickPanel({
  result,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  onClose: () => void;
}) {
  let vars: Record<string, unknown> = {};
  if (result && typeof result === "object") {
    vars =
      result.variables ||
      result.data ||
      result.returns ||
      (result.executionId ? {} : result);
  }
  const entries = Object.entries(vars);

  return (
    <div
      className="w-72 max-h-80 flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "rgba(7,9,14,0.92)",
        border: "1px solid rgba(6,182,212,0.22)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(6,182,212,0.08)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/80">
            Execution Results
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {entries.length === 0 ? (
          <p className="text-[11px] text-white/30 text-center py-4">
            No return variables captured
          </p>
        ) : (
          entries.map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div
                className="flex items-center justify-between px-2.5 py-1.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-[10px] font-mono text-cyan-300/80">
                  {key}
                </span>
                <span className="text-[8px] px-1.5 py-px rounded bg-white/8 text-white/40">
                  {typeof value}
                </span>
              </div>
              <pre className="text-[10px] text-white/55 font-mono px-2.5 py-1.5 whitespace-pre-wrap break-all max-h-16 overflow-y-auto">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </pre>
            </div>
          ))
        )}
      </div>

      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[9px] text-white/25">
          ID: {result?.executionId?.slice(0, 10)}…
        </span>
        <button
          onClick={() => downloadResultsPdf(result)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.03] active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(6,182,212,0.3)",
            color: "#67e8f9",
          }}
          title="Download results as PDF"
        >
          <Download className="w-3 h-3" />
          PDF
        </button>
      </div>
    </div>
  );
}

const FASTAPI_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_FASTAPI_URL) ||
  "http://localhost:8000";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function downloadResultsPdf(result: any) {
  try {
    const res = await fetch(`${FASTAPI_URL}/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-results-${result?.executionId?.slice(0, 8) ?? Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF download failed", err);
  }
}


/* ── Workflow Builder Chat ─────────────────────────────────── */
type BuilderMode = "ai" | "manual";

function WorkflowBuilderChat() {
  const { setNodes, setEdges } = useDragContext();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BuilderMode>("ai");

  // AI mode state
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // Manual mode state
  const [keywordInput, setKeywordInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const applyWorkflow = useCallback(
    (data: { nodes: unknown[]; edges: unknown[] }) => {
      if (setNodes) setNodes(data.nodes as Node<WorkflowNodeData>[]);
      if (setEdges) setEdges(data.edges as Edge[]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      setOpen(false);
    },
    [setNodes, setEdges],
  );

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateWorkflowFromPrompt(prompt.trim(), apiKey.trim(), provider);
      applyWorkflow(data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } }; message?: string })
        ?.response?.data?.detail ?? (e as { message?: string })?.message ?? "Generation failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = async () => {
    const keywords = keywordInput
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);
    if (!keywords.length) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateWorkflowFromKeywords(keywords);
      applyWorkflow(data);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } }; message?: string })
        ?.response?.data?.detail ?? (e as { message?: string })?.message ?? "Generation failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const PROVIDER_LABELS: Record<AIProvider, string> = {
    openai: "OpenAI (GPT-3.5)",
    gemini: "Google Gemini",
    claude: "Anthropic Claude",
  };

  const PROVIDER_KEY_HINT: Record<AIProvider, string> = {
    openai: "sk-…",
    gemini: "AIzaSy…",
    claude: "sk-ant-…",
  };

  const panelStyle: React.CSSProperties = {
    background: "rgba(7,9,14,0.95)",
    border: "1px solid rgba(6,182,212,0.25)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(6,182,212,0.07)",
    borderRadius: "1rem",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.5rem",
    color: "#e2e8f0",
    fontSize: "12px",
    outline: "none",
    width: "100%",
    padding: "8px 10px",
  };

  const btnPrimary: React.CSSProperties = {
    background: "linear-gradient(135deg,rgba(6,182,212,0.25) 0%,rgba(6,182,212,0.12) 100%)",
    border: "1px solid rgba(6,182,212,0.4)",
    color: "#67e8f9",
    borderRadius: "0.5rem",
    fontSize: "12px",
    fontWeight: 600,
    padding: "7px 14px",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  return (
    <div className="absolute bottom-6 left-[344px] z-30 pointer-events-auto">
      {/* Toggle button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setError(null); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all hover:scale-[1.04] active:scale-95"
          style={{
            background: "linear-gradient(135deg,rgba(6,182,212,0.18) 0%,rgba(6,182,212,0.08) 100%)",
            border: "1px solid rgba(6,182,212,0.35)",
            color: "#67e8f9",
            boxShadow: "0 0 18px rgba(6,182,212,0.14)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Build with AI
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className="w-80 flex flex-col gap-3 p-4" style={panelStyle}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[12px] font-bold text-white/90">Workflow Builder</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["ai", "manual"] as BuilderMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold transition-colors"
                style={{
                  background: mode === m ? "rgba(6,182,212,0.15)" : "transparent",
                  color: mode === m ? "#67e8f9" : "rgba(255,255,255,0.35)",
                  borderRight: m === "ai" ? "1px solid rgba(255,255,255,0.08)" : undefined,
                }}
              >
                {m === "ai" ? <><Sparkles className="w-3 h-3" />AI Prompt</> : <><Hash className="w-3 h-3" />Keywords</>}
              </button>
            ))}
          </div>

          {/* AI mode */}
          {mode === "ai" && (
            <div className="flex flex-col gap-2.5">
              {/* Provider dropdown */}
              <div>
                <label className="block text-[10px] text-white/40 mb-1">AI Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as AIProvider)}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                    <option key={p} value={p} style={{ background: "#0a0f1a" }}>
                      {PROVIDER_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              {/* API key */}
              <div>
                <label className="block text-[10px] text-white/40 mb-1">
                  API Key <span className="text-white/20">(not stored)</span>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={PROVIDER_KEY_HINT[provider]}
                    style={{ ...inputStyle, paddingRight: "32px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Workflow description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAIGenerate();
                  }}
                  placeholder="e.g. translate text to French, summarize it, then email to alice@example.com"
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <p className="text-[9px] text-white/20 mt-1">⌘↵ to generate</p>
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={loading || !prompt.trim() || !apiKey.trim()}
                style={btnPrimary}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-cyan-400/50 border-t-cyan-400 rounded-full animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <><Sparkles className="w-3 h-3" />Generate Workflow</>
                )}
              </button>
            </div>
          )}

          {/* Manual keyword mode */}
          {mode === "manual" && (
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">
                  Node keywords <span className="text-white/20">(one per line or comma-separated)</span>
                </label>
                <textarea
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleManualGenerate();
                  }}
                  placeholder={"translate to french\nsummarize\nsend email\nport scanner"}
                  rows={5}
                  style={{ ...inputStyle, resize: "none" }}
                />
                <p className="text-[9px] text-white/20 mt-1">No AI used — pure keyword matching via Qdrant. ⌘↵ to build.</p>
              </div>

              <button
                onClick={handleManualGenerate}
                disabled={loading || !keywordInput.trim()}
                style={btnPrimary}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-cyan-400/50 border-t-cyan-400 rounded-full animate-spin" />
                    Building…
                  </span>
                ) : (
                  <><Hash className="w-3 h-3" />Build Workflow</>
                )}
              </button>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <p className="text-[10px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Success flash (shown after panel closes) */}
      {success && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold"
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "#6ee7b7",
          }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
          Workflow loaded!
        </div>
      )}
    </div>
  );
}


/* ── WorkflowLiveTracker ────────────────────────────────────────────────────
   Polls /api/v1/saga/execution/{id}/status while the workflow is running and
   pushes activeNodeId + per-node execution states into FlowStateContext so
   every WorkflowNode on the canvas can render its own live state badge.    */
function WorkflowLiveTracker() {
  const { isRunning, lastExecution, setActiveNodeId, setNodeExecutionStates } = useFlowState();
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  useEffect(() => {
    if (!isRunning || !lastExecution) return;

    let alive = true;

    const poll = async () => {
      if (!alive) return;
      try {
        const res = await fetch(
          `${apiBase}/api/v1/saga/execution/${lastExecution.executionId}/status`,
        );
        if (!res.ok || !alive) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = await res.json();

        setActiveNodeId(body.currentStep ?? null);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const states: Record<string, import("@/provider/flowstatecontext").NodeExecState> = {};
        for (const step of body.steps ?? []) {
          states[step.nodeId] =
            step.stepState === "COMMITTED"    ? "completed"
          : step.stepState === "EXECUTING"    ? "running"
          : step.stepState === "FAILED"       ? "failed"
          : step.stepState === "COMPENSATING" ? "failed"
          : "pending";
        }
        setNodeExecutionStates(states);
      } catch {
        // saga not yet created or network error — silently ignore
      }
    };

    // First poll after a short delay (saga row may not exist yet)
    const delay = setTimeout(poll, 800);
    const interval = setInterval(poll, 600);

    return () => {
      alive = false;
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, [isRunning, lastExecution?.executionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/* ── ExecutionHUD ────────────────────────────────────────────────────────────
   Cinematic floating overlay showing the workflow pipeline, the currently
   active node (pulsing cyan), completed nodes (green ✓), and a progress bar.
   Slides in from the top when a run starts and fades out 3 s after it ends.  */
function ExecutionHUD() {
  const {
    isRunning,
    activeNodeId,
    nodeExecutionStates,
    workflowResult,
  } = useFlowState();
  const { nodes: rawNodes } = useDragContext();
  const nodes = rawNodes ?? [];

  const [visible, setVisible]     = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number>(0);

  /* show while running, keep visible 3 s after completion */
  useEffect(() => {
    if (isRunning) {
      startRef.current = Date.now();
      setElapsedMs(0);
      setDismissed(false);
      setVisible(true);
    } else if (visible) {
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  /* tick the elapsed timer */
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setElapsedMs(Date.now() - startRef.current), 100);
    return () => clearInterval(t);
  }, [isRunning]);

  const completedCount = Object.values(nodeExecutionStates).filter(s => s === "completed").length;
  const failedCount    = Object.values(nodeExecutionStates).filter(s => s === "failed").length;
  const totalTracked   = Object.keys(nodeExecutionStates).length;
  const totalNodes     = nodes.length || totalTracked;

  const isDone   = !isRunning && visible && failedCount === 0;
  const isFailed = failedCount > 0;

  // Show at most 7 pipeline pills; truncate the rest
  const pipelineNodes = nodes.slice(0, 7);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key="exec-hud"
          initial={{ opacity: 0, y: -28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -28, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          style={{ minWidth: 380, maxWidth: 640 }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(4,6,14,0.93)",
              border: `1px solid ${
                isFailed ? "rgba(239,68,68,0.45)"
                : isDone  ? "rgba(34,197,94,0.45)"
                :           "rgba(6,182,212,0.35)"}`,
              backdropFilter: "blur(22px)",
              boxShadow: `0 24px 64px rgba(0,0,0,0.75), 0 0 48px ${
                isFailed ? "rgba(239,68,68,0.12)"
                : isDone  ? "rgba(34,197,94,0.12)"
                :           "rgba(6,182,212,0.14)"}`,
            }}
          >
            {/* ── Header row ── */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Live indicator */}
              <div className="relative flex-shrink-0 w-3 h-3">
                {isRunning && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(6,182,212,0.5)" }}
                    animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                )}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: isFailed ? "#ef4444" : isDone ? "#22c55e" : "#06b6d4",
                  }}
                />
              </div>

              <span className="text-[13px] font-bold text-white/85">
                {isFailed ? "Execution Failed" : isDone ? "Workflow Complete" : "Executing Workflow"}
              </span>

              {/* Current node label */}
              {isRunning && activeNodeId && (
                <motion.span
                  key={activeNodeId}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-white/40 font-mono truncate max-w-[140px]"
                >
                  → {nodes.find(n => n.id === activeNodeId)?.data?.label ?? activeNodeId}
                </motion.span>
              )}

              {/* Elapsed timer */}
              <span className="text-[11px] font-mono text-white/30 ml-auto flex-shrink-0">
                {(elapsedMs / 1000).toFixed(1)}s
              </span>

              {/* Result badge */}
              {!isRunning && workflowResult && (
                isDone
                  ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  : <XCircle size={14} className="text-red-400 flex-shrink-0" />
              )}

              {/* ── Manual dismiss ── */}
              <button
                onClick={() => setDismissed(true)}
                className="ml-1 flex-shrink-0 p-1 rounded-lg text-white/25 hover:text-white/70 hover:bg-white/8 transition-colors"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            {/* ── Pipeline row ── */}
            {totalNodes > 0 && (
              <div className="px-5 py-3.5 flex items-center gap-1.5 overflow-hidden">
                {pipelineNodes.map((node, i) => {
                  const state     = nodeExecutionStates[node.id];
                  const isActive  = activeNodeId === node.id || state === "running";
                  const done      = state === "completed";
                  const failed    = state === "failed";

                  return (
                    <div key={node.id} className="flex items-center gap-1.5 flex-shrink-0">
                      <motion.div
                        animate={isActive ? {
                          boxShadow: [
                            "0 0 0 0px rgba(6,182,212,0)",
                            "0 0 0 5px rgba(6,182,212,0.35)",
                            "0 0 0 0px rgba(6,182,212,0)",
                          ],
                        } : {}}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="rounded-lg px-2.5 py-1 text-[9px] font-semibold truncate"
                        style={{
                          maxWidth: 88,
                          background: isActive ? "rgba(6,182,212,0.18)"
                            : done             ? "rgba(34,197,94,0.14)"
                            : failed           ? "rgba(239,68,68,0.14)"
                            :                    "rgba(255,255,255,0.04)",
                          border: `1px solid ${
                            isActive ? "rgba(6,182,212,0.6)"
                            : done   ? "rgba(34,197,94,0.4)"
                            : failed ? "rgba(239,68,68,0.4)"
                            :          "rgba(255,255,255,0.09)"}`,
                          color: isActive ? "#67e8f9"
                            : done        ? "#4ade80"
                            : failed      ? "#f87171"
                            :               "rgba(255,255,255,0.3)",
                        }}
                      >
                        {done ? "✓ " : failed ? "✗ " : isActive ? "⚡ " : ""}
                        {node.data?.label ?? node.id}
                      </motion.div>

                      {i < pipelineNodes.length - 1 && (
                        <motion.span
                          className="text-[10px] flex-shrink-0"
                          style={{ color: done ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.1)" }}
                        >
                          →
                        </motion.span>
                      )}
                    </div>
                  );
                })}

                {nodes.length > 7 && (
                  <span className="text-[9px] text-white/20 flex-shrink-0 ml-1">
                    +{nodes.length - 7} more
                  </span>
                )}
              </div>
            )}

            {/* ── Progress bar ── */}
            {totalNodes > 0 && (
              <div
                className="px-5 pb-3.5"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex justify-between text-[9px] text-white/25 mt-2.5 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Zap size={9} className="text-cyan-400/60" />
                    {completedCount} of {totalNodes} nodes completed
                  </span>
                  <span className="font-mono">
                    {totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${totalNodes > 0 ? (completedCount / totalNodes) * 100 : 0}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    style={{
                      background: isFailed
                        ? "linear-gradient(90deg,#ef4444,#f87171)"
                        : isDone
                        ? "linear-gradient(90deg,#22c55e,#4ade80)"
                        : "linear-gradient(90deg,#06b6d4,#8b5cf6,#06b6d4)",
                      backgroundSize: isRunning ? "200% 100%" : "100% 100%",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlowLayout() {
  const { isPaletteOpen, setIsPaletteOpen, togglePalette } = useDragContext();

  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // ✅ Position BELOW button + SHIFT LEFT (avoid properties panel)
  useEffect(() => {
    if (buttonRef.current && isPaletteOpen) {
      const rect = buttonRef.current.getBoundingClientRect();

      setPalettePosition({
        x: rect.left - 260, // 👈 SHIFT LEFT (important fix)
        y: rect.bottom + 10,
      });
    }
  }, [isPaletteOpen]);

  const handleToggle = () => {
    if (togglePalette) togglePalette();
    else if (setIsPaletteOpen) setIsPaletteOpen(!isPaletteOpen);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Canvas */}
      <div className="absolute inset-0 z-0">
        <CanvasDropZone />
      </div>

      {/* UI Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex justify-between">
        {/* Sidebar — tutorial anchor */}
        <div className="pointer-events-auto h-full py-4 pl-4">
          <Sidebar />
        </div>

        {/* Right Side */}
        <div className="pointer-events-auto h-full py-4 pr-4 flex items-start gap-2">
          {/* Add-node button — tutorial anchor */}
          <div ref={buttonRef} className="mt-1" data-tutorial-id="tutorial-add-button">
            <FloatingAddButton
              onClick={handleToggle}
              isOpen={isPaletteOpen ?? false}
            />
          </div>
          {/* Properties panel — tutorial anchor */}
          <div data-tutorial-id="tutorial-properties">
            <PropertiesPanel />
          </div>
        </div>
      </div>

      {/* ✅ Panel */}
      <NodePalettePanel
        isOpen={isPaletteOpen ?? false}
        onClose={() => setIsPaletteOpen && setIsPaletteOpen(false)}
        position={palettePosition}
        setPosition={setPalettePosition}
      />

      {/* Results + Performance buttons (bottom-right) */}
      <BottomRightOverlay />

      {/* Workflow Builder chat (bottom-left) */}
      <WorkflowBuilderChat />

      {/* Live execution HUD — floats above the canvas while a workflow runs */}
      <ExecutionHUD />

      {/* Polls saga status and pushes node states into context */}
      <WorkflowLiveTracker />

      {/* ── Onboarding tutorial (shows once for new users) ── */}
      <OnboardingTutorial />

      {/* Replay tutorial button — top-centre, only visible after tutorial done */}
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 30, pointerEvents: "auto" }}>
        <TutorialReplayButton />
      </div>
    </div>
  );
}


export default function FlowPage() {
  return (
    <UserProvider>
      <SidebarProvider>
        <DragProvider>
          <WorkflowProvider>
            <FlowStateProvider>
              <FlowLayout />
            </FlowStateProvider>
          </WorkflowProvider>
        </DragProvider>
      </SidebarProvider>
    </UserProvider>
  );
}