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
import { Database, ChevronDown, ChevronUp, X, Download, Sparkles, Hash, Eye, EyeOff, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateWorkflowFromPrompt,
  generateWorkflowFromKeywords,
  type WorkflowProvider as AIProvider,
} from "@/lib/api";
import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData } from "@/lib/mockdata";

/* ── Bottom-right overlay: Intelligence + Results buttons ── */
function BottomRightOverlay() {
  const { lastExecution, workflowResult, showResultPanel, setShowResultPanel } =
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
        {/* Sidebar */}
        <div className="pointer-events-auto h-full py-4 pl-4">
          <Sidebar />
        </div>

        {/* Right Side */}
        <div className="pointer-events-auto h-full py-4 pr-4 flex items-start gap-2">
          <div ref={buttonRef} className="mt-1">
            <FloatingAddButton
              onClick={handleToggle}
              isOpen={isPaletteOpen ?? false}
            />
          </div>
          <PropertiesPanel />
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