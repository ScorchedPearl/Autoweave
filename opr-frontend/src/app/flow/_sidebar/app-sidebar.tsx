"use client"

import {
  HelpCircle,
  Plus,
  Save,
  Settings2,
  Play,
  Variable,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Layers,
  FolderOpen,
  Trash2,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle,
  Database,
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useSidebar } from "@/provider/sidebarContext";
import { useWorkflow } from "@/provider/statecontext"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { serializeWorkflowForBackend } from "@/lib/serializeWorkflowData"
import { useRunWorkflow } from "@/hooks/useRunWorkflow"
import { useSaveWorkflow } from "@/hooks/useSaveWorkflow"
import { useLoadWorkflow } from "@/hooks/useLoadWorkflow"
import { NODE_OUTPUT_REGISTRY, NodeOutputVar } from "@/lib/nodeOutputRegistry"
import { fetchWorkflows, deleteWorkflow, WorkflowListItem } from "@/lib/api"
import { PerformancePanelButton } from "@/components/PerformancePanel"
import { jwtDecode } from "jwt-decode"

function getOwnerIdFromJwt(): string | null {
  try {
    const raw = localStorage.getItem("__Pearl_Token");
    if (!raw) return null;
    const decoded = jwtDecode<{ sub?: string; userId?: string }>(raw);
    return decoded.sub ?? decoded.userId ?? null;
  } catch {
    return null;
  }
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  string:  { bg: "rgba(6,182,212,0.15)",   text: "#06b6d4" },
  number:  { bg: "rgba(245,158,11,0.15)",  text: "#f59e0b" },
  boolean: { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  object:  { bg: "rgba(167,139,250,0.15)", text: "#a78bfa" },
  array:   { bg: "rgba(251,146,60,0.15)",  text: "#fb923c" },
};

function CopyableTag({ tag, onRemove }: { tag: { id: string; text: string }; onRemove: (id: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`{{${tag.id}}}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tag.id]);

  return (
    <div
      className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span className="text-[11px] font-mono text-cyan-300/90 flex-1 min-w-0 truncate">
        {`{{${tag.id}}}`}
      </span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-white/40 hover:text-cyan-400"
        title="Copy"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
      <button
        onClick={() => onRemove(tag.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-white/40 hover:text-red-400"
        title="Remove"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface VarBrowseItem {
  nodeLabel: string;
  nodeType: string;
  vars: NodeOutputVar[];
}

function ReturnVariablesBrowser({
  isOpen,
  onClose,
  sidebarRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { enhancedNodes, addReturnVariable, returnVariableTags } = useWorkflow();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const browseItems: VarBrowseItem[] = [];
  const seen = new Set<string>();
  enhancedNodes.forEach((n) => {
    const type = n.data.nodeType;
    if (!seen.has(type) && NODE_OUTPUT_REGISTRY[type]) {
      seen.add(type);
      browseItems.push({
        nodeLabel: n.data.label,
        nodeType: type,
        vars: NODE_OUTPUT_REGISTRY[type],
      });
    }
  });

  const toggleGroup = (nodeType: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(nodeType)) next.delete(nodeType);
      else next.add(nodeType);
      return next;
    });
  };

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const rect = sidebarRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.top,
        left: rect.right + 8,
        height: rect.height,
        width: 320,
        zIndex: 9999,
      });
    }
  }, [isOpen, sidebarRef]);

  if (!isOpen) return null;

  return (
    <div
      style={panelStyle}
      className="flex flex-col rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-[#080a0f]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl" style={{ zIndex: -1 }} />

      <div className="relative flex items-center gap-2 px-4 py-3.5 border-b border-white/8">
        <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white leading-none">Browse Variables</h3>
          <p className="text-[10px] text-white/40 mt-0.5">From nodes on canvas</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto">
        {browseItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Variable className="w-5 h-5 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 font-medium">No nodes on canvas</p>
              <p className="text-[11px] text-white/30 mt-1">Add nodes to the workflow<br/>to see their return variables here</p>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {browseItems.map((item) => {
              const isExpanded = expandedGroups.has(item.nodeType);
              return (
                <div
                  key={item.nodeType}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => toggleGroup(item.nodeType)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/4 transition-colors text-left"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-base flex-shrink-0">
                  
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/80 truncate">{item.nodeLabel}</p>
                      <p className="text-[9px] text-white/35 truncate">{item.nodeType} · {item.vars.length} variables</p>
                    </div>
                    {isExpanded
                      ? <ChevronDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    }
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-2.5 pt-1 space-y-1">
                      {item.vars.map((v) => {
                        const tc = TYPE_COLORS[v.type] || { bg: "rgba(148,163,184,0.15)", text: "#94a3b8" };
                        const isAdded = returnVariableTags.some(t => t.id === v.key);
                        return (
                          <button
                            key={v.key}
                            onClick={() => addReturnVariable(v.key)}
                            className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all duration-150 hover:scale-[1.01]"
                            style={{
                              background: isAdded ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${isAdded ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            <span
                              className="text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                              style={{ background: tc.bg, color: tc.text }}
                            >
                              {v.type}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="text-[11px] font-mono text-white/60 block truncate">{`{{${v.key}}}`}</span>
                              <span className="text-[9px] text-white/35">{v.label}</span>
                            </span>
                            {isAdded
                              ? <Check className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                              : <Plus className="w-3 h-3 text-white/20 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                            }
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative px-4 py-3 border-t border-white/8">
        <p className="text-[10px] text-white/30 text-center">
          Click any variable to add it to return variables
        </p>
      </div>
    </div>
  );
}

const COLLAPSE_THRESHOLD = 300; 

function ResultEntry({ entryKey, value }: { entryKey: string; value: any }) {
  const [expanded, setExpanded] = useState(false);

  const { displayValue, valType } = useMemo(() => {
    let dv = "";
    let vt = typeof value;
    if (value === null) { dv = "null"; vt = "null" as typeof vt; }
    else if (typeof value === "object") { dv = JSON.stringify(value, null, 2); }
    else { dv = String(value); }
    return { displayValue: dv, valType: vt };
  }, [value]);

  const isLong = displayValue.length > COLLAPSE_THRESHOLD;
  const shown = expanded || !isLong ? displayValue : displayValue.slice(0, COLLAPSE_THRESHOLD) + "…";

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[11px] font-mono text-cyan-300 font-semibold">{entryKey}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{valType}</span>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 transition-colors font-semibold"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <pre className={`text-[10px] text-white/70 font-mono whitespace-pre-wrap break-all overflow-y-auto ${!expanded && isLong ? "max-h-28" : ""}`}>
          {shown}
        </pre>
        {isLong && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-1.5 text-[10px] text-cyan-400/70 hover:text-cyan-400 transition-colors"
          >
            Show full value ({displayValue.length} chars)
          </button>
        )}
      </div>
    </div>
  );
}

function WorkflowResultBrowser({
  isOpen,
  onClose,
  sidebarRef,
  resultData,
}: {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  resultData: any;
}) {
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const rect = sidebarRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.top,
        left: rect.right + 8,
        height: rect.height,
        width: 320,
        zIndex: 9999,
      });
    }
  }, [isOpen, sidebarRef]);

  if (!isOpen) return null;

  let resultVars = {};
  if (resultData && typeof resultData === "object") {
    resultVars = resultData.data || resultData.variables || resultData.returns || resultData;
  }
  const entries = Object.entries(resultVars || {});

  return (
    <div
      style={panelStyle}
      className="flex flex-col rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-[#080a0f]/90 backdrop-blur-2xl border border-cyan-400/20 rounded-2xl shadow-2xl" style={{ zIndex: -1 }} />

      <div className="relative flex items-center gap-2 px-4 py-3.5 border-b border-white/8 bg-cyan-950/20">
        <div className="w-7 h-7 rounded-lg bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white leading-none">Execution Results</h3>
          <p className="text-[10px] text-cyan-200/60 mt-0.5">Workflow Returned Variables</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto p-3 space-y-2">
        {entries.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-6">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <Variable className="w-5 h-5 text-white/20" />
             </div>
             <div className="text-center">
               <p className="text-sm text-white/50 font-medium">No results found</p>
               <p className="text-[11px] text-white/30 mt-1">Run workflow to see returns</p>
             </div>
           </div>
        ) : (
          entries.map(([key, value]) => (
            <ResultEntry key={key} entryKey={key} value={value} />
          ))
        )}
      </div>
    </div>
  );
}

function MyWorkflowsBrowser({
  isOpen,
  onClose,
  sidebarRef,
  onLoad,
}: {
  isOpen: boolean;
  onClose: () => void;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  onLoad: (id: string) => Promise<void>;
}) {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkflowId } = useWorkflow();

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchWorkflows(0, 50);
      setWorkflows(page.content || []);
    } catch {
      setError("Failed to load workflows");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadList();
  }, [isOpen, loadList]);

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const rect = sidebarRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.top,
        left: rect.right + 8,
        height: rect.height,
        width: 340,
        zIndex: 9999,
      });
    }
  }, [isOpen, sidebarRef]);

  const handleLoad = async (id: string) => {
    setLoadingId(id);
    try {
      await onLoad(id);
      onClose();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={panelStyle}
      className="flex flex-col rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-[#080a0f]/92 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl" style={{ zIndex: -1 }} />

      <div className="relative flex items-center gap-2 px-4 py-3.5 border-b border-white/8">
        <div className="w-7 h-7 rounded-lg bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white leading-none">My Workflows</h3>
          <p className="text-[10px] text-white/40 mt-0.5">{workflows.length} saved workflows</p>
        </div>
        <button onClick={loadList} className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            <p className="text-[11px] text-white/40">Loading workflows...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 px-6">
            <AlertCircle className="w-8 h-8 text-red-400/60" />
            <p className="text-[11px] text-white/50 text-center">{error}</p>
            <button onClick={loadList} className="text-[11px] text-indigo-400 hover:text-indigo-300">
              Try again
            </button>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/50 font-medium">No saved workflows yet</p>
              <p className="text-[11px] text-white/30 mt-1">Save a workflow to see it here</p>
            </div>
          </div>
        ) : workflows.map((wf) => {
          const isActive = wf.id === currentWorkflowId;
          const isConfirming = confirmDelete === wf.id;
          const isLoading = loadingId === wf.id;
          const isDeleting = deletingId === wf.id;
          const date = new Date(wf.updatedAt);
          const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

          return (
            <div
              key={wf.id}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                background: isActive ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
              }}
            >
              <div className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-white/90 truncate">{wf.name}</p>
                      {isActive && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold flex-shrink-0">LOADED</span>
                      )}
                    </div>
                    {wf.description && (
                      <p className="text-[10px] text-white/40 mt-0.5 truncate">{wf.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="flex items-center gap-1 text-[9px] text-white/30">
                        <Clock className="w-2.5 h-2.5" />
                        {dateStr}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">v{wf.version}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{wf.status}</span>
                    </div>
                  </div>
                </div>

                {isConfirming ? (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-[10px] text-red-300 flex-1">Delete this workflow?</p>
                    <button
                      onClick={() => handleDelete(wf.id)}
                      disabled={!!isDeleting}
                      className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleLoad(wf.id)}
                      disabled={!!loadingId}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 hover:scale-[1.02]"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
                    >
                      {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      {isLoading ? "Loading..." : "Load onto canvas"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(wf.id)}
                      className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { user, navMain } = useSidebar();
  const {
    getWorkflowExecutionData,
    returnVariableTags,
    setReturnVariableTags,
    removeReturnVariable,
    clearReturnVariables,
  } = useWorkflow();

  const [isRunning, setIsRunning] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const runWorkflowWithAuth = useRunWorkflow();
  const saveWorkflow = useSaveWorkflow();

  const loadWorkflowHook = useLoadWorkflow();
  const [showBrowser, setShowBrowser] = useState(false);
  const [showResultBrowser, setShowResultBrowser] = useState(false);
  const [showMyWorkflows, setShowMyWorkflows] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const [lastExecution, setLastExecution] = useState<{
    executionId: string;
    workflowId: string;
    ownerId: string;
  } | null>(null);

  useEffect(() => {
    if (!showBrowser) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setShowBrowser(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBrowser]);

  useEffect(() => {
    if (!showResultBrowser) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setShowResultBrowser(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showResultBrowser]);

  useEffect(() => {
    if (!showMyWorkflows) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setShowMyWorkflows(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMyWorkflows]);

  return (
    <div ref={sidebarRef} className="relative flex flex-col h-screen bg-black text-white overflow-auto">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
      </div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-white/10 backdrop-blur-sm bg-white/5">
          <div className="flex items-center gap-2">
            <Link href="/">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                AutoWeave
              </span>
            </Link>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            <NavMain items={navMain} />

            <div className="space-y-1">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-white">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/5 backdrop-blur-sm border border-white/20  hover:text-white hover:bg-white/10 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      setShowBrowser(false);
                      setShowResultBrowser(false);
                      setShowMyWorkflows(!showMyWorkflows);
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4 text-indigo-400" />
                    My Workflows
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start bg-white/5 backdrop-blur-sm border border-white/20 hover:text-white hover:bg-white/10 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={async () => {
                      try {
                        const response = await saveWorkflow();
                        setWorkflowId(response.id);
                        console.log("✅ Workflow saved:", response);
                      } catch (error) {
                        console.error("❌ Save failed:", error);
                      }
                    }}
                  >
                    <Save className="mr-2 h-4 w-4 text-cyan-400" />
                    Save Workflow
                  </Button>

                  <Button
                    disabled={!workflowId}
                    className={`w-full justify-center rounded-xl transition-all duration-300 transform font-semibold ${
                      workflowId
                        ? "bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.03] shadow-lg shadow-cyan-500/25"
                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                    }`}
                    onClick={async () => {
                      if (!workflowId) return;
                      const fullWorkflow = getWorkflowExecutionData();
                      const payload = serializeWorkflowForBackend(fullWorkflow);
                      try {
                        setIsRunning(true);
                        const response = await runWorkflowWithAuth(workflowId, payload, returnVariableTags);
                        console.log("Workflow run completed", response);
                        setWorkflowResult(response);
                        setShowResultBrowser(true);
                        setShowBrowser(false);
                        setShowMyWorkflows(false);
                        const execId = response?.executionId;
                        const ownerId = getOwnerIdFromJwt();
                        if (execId && ownerId) {
                          setLastExecution({ executionId: execId, workflowId, ownerId });
                        }
                      } catch (error) {
                        console.error("Failed to run workflow:", error);
                      } finally {
                        setIsRunning(false);
                      }
                    }}
                  >
                    <Play className={`mr-2 h-4 w-4 ${workflowId ? "text-black" : "text-white/30"}`} />
                    {isRunning ? "Running..." : "Run Workflow"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-center border-white/10 text-black/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                    onClick={async () => {
                      const fullWorkflow = getWorkflowExecutionData();
                      const payload = serializeWorkflowForBackend(fullWorkflow);
                      try {
                        setIsRunning(true);
                        let tempId = workflowId;
                        if (!tempId) {
                          const saveRes = await saveWorkflow();
                          tempId = saveRes.id;
                          setWorkflowId(tempId);
                        }
                        const response = await runWorkflowWithAuth(tempId!, payload, returnVariableTags);
                        console.log("Quick run completed", response);
                        setWorkflowResult(response);
                        setShowResultBrowser(true);
                        setShowBrowser(false);
                        setShowMyWorkflows(false);
                        const execId = response?.executionId;
                        const ownerId = getOwnerIdFromJwt();
                        if (execId && tempId && ownerId) {
                          setLastExecution({ executionId: execId, workflowId: tempId, ownerId });
                        }
                      } catch (error) {
                        console.error("Failed quick run:", error);
                      } finally {
                        setIsRunning(false);
                      }
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4 text-cyan-400" />
                    Run (No Save)
                  </Button>

                  {workflowResult && (
                    <Button
                      variant="outline"
                      className="w-full justify-center rounded-xl transition-all duration-300 bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-800/40 hover:text-cyan-200"
                      onClick={() => {
                        setShowResultBrowser(true);
                        setShowBrowser(false);
                      }}
                    >
                      View Last Results
                    </Button>
                  )}

                  {lastExecution && (
                    <div className="relative">
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                      </span>
                      <PerformancePanelButton
                        executionId={lastExecution.executionId}
                        workflowId={lastExecution.workflowId}
                        ownerId={lastExecution.ownerId}
                        apiBase={process.env.NEXT_PUBLIC_BACKEND_URL ?? ""}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-3 py-2">
              <button
                onClick={() => setShowBrowser((v) => !v)}
                className="w-full flex items-center gap-2 mb-3 group"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: showBrowser ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${showBrowser ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <Variable
                    className="w-3 h-3"
                    style={{ color: showBrowser ? "#06b6d4" : "rgba(255,255,255,0.4)" }}
                  />
                </div>
                <h2 className="flex-1 text-sm font-semibold tracking-tight text-white text-left">
                  Return Variables
                </h2>
                {returnVariableTags.length > 0 && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
                  >
                    {returnVariableTags.length}
                  </span>
                )}
                <ChevronDown
                  className="w-3.5 h-3.5 text-white/30 transition-transform duration-200 flex-shrink-0"
                  style={{ transform: showBrowser ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>

              {returnVariableTags.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-white/35">Hover to copy or remove</p>
                    <button
                      onClick={clearReturnVariables}
                      className="text-[10px] text-white/30 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {returnVariableTags.map((tag) => (
                    <CopyableTag
                      key={tag.id}
                      tag={tag}
                      onRemove={removeReturnVariable}
                    />
                  ))}
                  <button
                    onClick={() => setShowBrowser(true)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] text-white/40 hover:text-cyan-400 transition-colors"
                    style={{ border: "1px dashed rgba(255,255,255,0.12)" }}
                  >
                    <Plus className="w-3 h-3" />
                    Browse more variables
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowBrowser(true)}
                  className="w-full flex flex-col items-center gap-2 py-6 rounded-xl transition-all duration-200 hover:bg-white/4"
                  style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <Variable className="w-6 h-6 text-white/15" />
                  <div className="text-center">
                    <p className="text-[11px] text-white/40 font-medium">No return variables yet</p>
                    <p className="text-[10px] text-white/25 mt-0.5">Click to browse or pick from nodes</p>
                  </div>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2">
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-white/5 text-white/80 hover:text-white rounded-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/contact" className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4 text-cyan-400" />
                      Help &amp; Support
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-white/5 text-white/80 hover:text-white rounded-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="/" className="flex items-center">
                      <Settings2 className="mr-2 h-4 w-4 text-cyan-400" />
                      Home
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bottom-0 border-white/10 backdrop-blur-sm bg-white/5">
          <NavUser user={user} />
        </div>
      </div>

      <ReturnVariablesBrowser
        isOpen={showBrowser}
        onClose={() => setShowBrowser(false)}
        sidebarRef={sidebarRef}
      />

      <WorkflowResultBrowser
        isOpen={showResultBrowser}
        onClose={() => setShowResultBrowser(false)}
        sidebarRef={sidebarRef}
        resultData={workflowResult}
      />

      <MyWorkflowsBrowser
        isOpen={showMyWorkflows}
        onClose={() => setShowMyWorkflows(false)}
        sidebarRef={sidebarRef}
        onLoad={loadWorkflowHook}
      />
    </div>
  );
}
