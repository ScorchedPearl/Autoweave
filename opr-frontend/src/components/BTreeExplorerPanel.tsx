"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Database, AlertTriangle, ArrowDown, X,
  Zap, Map, MapPin, List, Link2, RotateCcw, ArrowUpDown,
  Scissors, Hash, Settings, ChevronDown, ChevronRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ExplainResponse {
  id: string; executionId: string; workflowId: string;
  scanType: string; indexName: string | null; indexDepth: number;
  isIndexScan: boolean; planningTimeMs: number; executionTimeMs: number;
  totalRowsScanned: number; rowsReturned: number; speedupRatio: number;
  theoreticalBtreeOps: number; theoreticalSeqScanOps: number;
  rawExplainJson: string; capturedAt: string; professorNarrative: string;
}

interface PlanNode {
  nodeType: string; actualTotalTime: number; actualStartupTime: number;
  actualRows: number; planRows: number; totalCost: number; startupCost: number;
  indexName?: string; indexCond?: string; filter?: string; relationName?: string;
  rowsRemovedByFilter?: number; children: PlanNode[];
}

interface Props { executionId: string; workflowId: string; ownerId: string; apiBase?: string; }

// ── Helpers ──────────────────────────────────────────────────────────────────

function parsePlan(raw: Record<string, unknown>): PlanNode {
  return {
    nodeType: String(raw["Node Type"] ?? "Unknown"),
    actualTotalTime: Number(raw["Actual Total Time"] ?? 0),
    actualStartupTime: Number(raw["Actual Startup Time"] ?? 0),
    actualRows: Number(raw["Actual Rows"] ?? 0),
    planRows: Number(raw["Plan Rows"] ?? 0),
    totalCost: Number(raw["Total Cost"] ?? 0),
    startupCost: Number(raw["Startup Cost"] ?? 0),
    indexName: raw["Index Name"] as string | undefined,
    indexCond: raw["Index Cond"] as string | undefined,
    filter: raw["Filter"] as string | undefined,
    relationName: raw["Relation Name"] as string | undefined,
    rowsRemovedByFilter: raw["Rows Removed by Filter"] as number | undefined,
    children: ((raw["Plans"] as Record<string, unknown>[]) ?? []).map(parsePlan),
  };
}

type IconComp = React.ReactElement;
const NODE_CFG: Record<string, { color: string; glow: string; Icon: IconComp; verdict: string }> = {
  "Index Scan":       { color: "#22c55e", glow: "rgba(34,197,94,0.35)",   Icon: <Zap size={16}/>,       verdict: "B-Tree O(log N)" },
  "Index Only Scan":  { color: "#10b981", glow: "rgba(16,185,129,0.35)",  Icon: <Zap size={16}/>,       verdict: "Covering index — zero heap I/O" },
  "Bitmap Heap Scan": { color: "#6366f1", glow: "rgba(99,102,241,0.35)",  Icon: <Map size={16}/>,       verdict: "Bitmap B-Tree scan" },
  "Bitmap Index Scan":{ color: "#818cf8", glow: "rgba(129,140,248,0.35)", Icon: <MapPin size={16}/>,    verdict: "Index bitmap build" },
  "Seq Scan":         { color: "#ef4444", glow: "rgba(239,68,68,0.35)",   Icon: <List size={16}/>,      verdict: "Sequential O(N) — no index!" },
  "Hash Join":        { color: "#f59e0b", glow: "rgba(245,158,11,0.35)",  Icon: <Link2 size={16}/>,     verdict: "Hash join" },
  "Nested Loop":      { color: "#8b5cf6", glow: "rgba(139,92,246,0.35)",  Icon: <RotateCcw size={16}/>, verdict: "Nested loop" },
  "Sort":             { color: "#06b6d4", glow: "rgba(6,182,212,0.35)",   Icon: <ArrowUpDown size={16}/>,verdict: "Sort" },
  "Limit":            { color: "#64748b", glow: "rgba(100,116,139,0.35)", Icon: <Scissors size={16}/>,  verdict: "Limit" },
  "Aggregate":        { color: "#a78bfa", glow: "rgba(167,139,250,0.35)", Icon: <Hash size={16}/>,      verdict: "Aggregate" },
};
const fallback = { color: "#64748b", glow: "rgba(100,116,139,0.35)", Icon: <Settings size={16}/>, verdict: "Plan node" };

// ── Interactive Graph Node Card ──────────────────────────────────────────────

function GraphNode({
  node, depth, maxTime, selected, onSelect,
}: {
  node: PlanNode; depth: number; maxTime: number;
  selected: boolean; onSelect: (n: PlanNode) => void;
}) {
  const cfg = NODE_CFG[node.nodeType] ?? fallback;
  const barPct = maxTime > 0 ? Math.max(4, (node.actualTotalTime / maxTime) * 100) : 50;
  const isExpensive = node.actualTotalTime === maxTime;

  return (
    <div className="flex flex-col items-center">
      {/* Connector from parent */}
      {depth > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.08)" }} />
          <ArrowDown size={10} style={{ color: "rgba(255,255,255,0.15)" }} />
        </div>
      )}

      {/* The node card */}
      <motion.button
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: depth * 0.1 + 0.05, type: "spring", stiffness: 300, damping: 24 }}
        onClick={() => onSelect(node)}
        className="relative rounded-2xl px-5 py-3.5 text-center transition-all w-52"
        style={{
          background: selected
            ? `linear-gradient(135deg, ${cfg.color}22 0%, ${cfg.color}10 100%)`
            : "rgba(255,255,255,0.03)",
          border: `1.5px solid ${selected ? cfg.color : "rgba(255,255,255,0.07)"}`,
          boxShadow: selected ? `0 0 24px ${cfg.glow}` : "none",
          cursor: "pointer",
        }}
      >
        {/* Expensive badge */}
        {isExpensive && (
          <span className="absolute -top-2 -right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: cfg.color, color: "#000" }}>
            SLOWEST
          </span>
        )}

        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 mx-auto"
          style={{ background: `${cfg.color}18`, color: cfg.color }}>
          {cfg.Icon}
        </div>

        {/* Node type */}
        <div className="text-xs font-bold leading-tight" style={{ color: cfg.color }}>{node.nodeType}</div>

        {/* Index/table */}
        {(node.indexName || node.relationName) && (
          <div className="text-[9px] text-white/30 mt-0.5 truncate max-w-full">
            {node.indexName ?? node.relationName}
          </div>
        )}

        {/* Duration bar */}
        <div className="mt-2.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full" style={{ background: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.8, delay: depth * 0.1 + 0.2, ease: "easeOut" }} />
        </div>

        {/* Stats row */}
        <div className="flex justify-between mt-1.5 text-[9px]">
          <span className="font-mono" style={{ color: cfg.color }}>{node.actualTotalTime.toFixed(2)}ms</span>
          <span className="text-white/25">{node.actualRows.toLocaleString()} rows</span>
        </div>
      </motion.button>

      {/* Children row */}
      {node.children.length > 0 && (
        <div className={`flex gap-8 mt-0 ${node.children.length > 1 ? "relative" : ""}`}>
          {/* Horizontal connector for multiple children */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          )}
          {node.children.map((child, i) => (
            <GraphNode key={i} node={child} depth={depth + 1} maxTime={maxTime}
              selected={selected && false} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail Panel for selected node ──────────────────────────────────────────

function NodeDetail({ node, onClose }: { node: PlanNode; onClose: () => void }) {
  const cfg = NODE_CFG[node.nodeType] ?? fallback;
  const isIndexScan = node.nodeType.includes("Index");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${cfg.color}33` }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${cfg.color}22` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}18`, color: cfg.color }}>
          {cfg.Icon}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: cfg.color }}>{node.nodeType}</div>
          <div className="text-[10px] text-white/30">{cfg.verdict}</div>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white/60 text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3 text-xs">

        {/* What happened */}
        <div className="rounded-xl p-3" style={{ background: `${cfg.color}0a`, border: `1px solid ${cfg.color}22` }}>
          <div className="text-[9px] uppercase tracking-widest text-white/30 mb-2">What happened here</div>
          {isIndexScan ? (
            <p className="text-white/60 leading-relaxed">
              Postgres used the <span style={{ color: cfg.color }} className="font-mono">{node.indexName ?? "index"}</span> B-Tree
              to locate rows. Instead of reading every row ({(node.planRows * 10).toLocaleString()} worst-case),
              it traversed <strong className="text-white/80">~{Math.ceil(Math.log2(Math.max(node.planRows, 2)))} B-Tree levels</strong> and
              fetched only the {node.actualRows} matching rows — direct pointer access.
            </p>
          ) : node.nodeType === "Seq Scan" ? (
            <p className="text-white/60 leading-relaxed">
              <span className="text-red-400 font-semibold">No index was used.</span> Postgres read
              every row in the <span className="font-mono text-white/70">{node.relationName}</span> table sequentially.
              {node.rowsRemovedByFilter != null && node.rowsRemovedByFilter > 0
                ? ` ${node.rowsRemovedByFilter.toLocaleString()} rows were then discarded by the filter predicate.`
                : ""} This is O(N) — add a composite index to fix this.
            </p>
          ) : (
            <p className="text-white/60 leading-relaxed">
              {node.nodeType} took {node.actualTotalTime.toFixed(3)}ms to process {node.actualRows} rows.
            </p>
          )}
        </div>

        {/* Index condition */}
        {node.indexCond && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5">Index condition (pushed to B-Tree)</div>
            <div className="font-mono text-[11px] rounded-lg px-3 py-2"
              style={{ background: "rgba(34,197,94,0.08)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}>
              {node.indexCond}
            </div>
            <p className="text-[10px] text-white/25 mt-1">
              ↳ Only rows matching this predicate are read from the index leaf pages
            </p>
          </div>
        )}

        {/* Filter */}
        {node.filter && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/25 mb-1.5">Post-scan filter (heap recheck)</div>
            <div className="font-mono text-[11px] rounded-lg px-3 py-2"
              style={{ background: "rgba(245,158,11,0.08)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.2)" }}>
              {node.filter}
            </div>
            {node.rowsRemovedByFilter != null && node.rowsRemovedByFilter > 0 && (
              <p className="text-[10px] text-red-400/70 mt-1">
                ↳ Discarded {node.rowsRemovedByFilter} rows — consider adding this column to the index
              </p>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div>
          <div className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Execution stats</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Actual time",    value: `${node.actualTotalTime.toFixed(3)} ms`,       color: cfg.color },
              { label: "Rows returned",  value: node.actualRows.toLocaleString(),               color: "#22c55e" },
              { label: "Rows planned",   value: node.planRows.toLocaleString(),                 color: "#6b7280" },
              { label: "Planner cost",   value: `${node.startupCost.toFixed(2)}..${node.totalCost.toFixed(2)}`, color: "#6b7280" },
            ].map(s => (
              <div key={s.label} className="rounded-lg px-3 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-[9px] text-white/25">{s.label}</div>
                <div className="font-mono text-sm font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* B-Tree traversal path — dynamic from actual depth */}
        {isIndexScan && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/25 mb-2">B-Tree traversal path</div>
            <div className="text-[9px] text-white/25 font-mono mb-2">
              Index: <span style={{ color: cfg.color }}>{node.indexName ?? "composite index"}</span>
            </div>
            <div className="space-y-1">
              {(() => {
                const depth = Math.max(2, Math.ceil(Math.log(Math.max(node.planRows, 10)) / Math.log(300)));
                const levels = [
                  { label: "Root Page", detail: `Fan-out ≈ 300 keys/page`, isLeaf: false },
                  ...Array.from({ length: Math.max(depth - 2, 0) }, (_, i) => ({
                    label: `Internal Node L${i + 1}`,
                    detail: `Navigate using ${node.indexCond ? node.indexCond.split("(")[0]?.trim() : "key"} comparison`,
                    isLeaf: false,
                  })),
                  { label: "Leaf Page", detail: `→ ${node.actualRows} row pointer${node.actualRows !== 1 ? "s" : ""} found`, isLeaf: true },
                ];
                return levels.map((lvl, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <div className="rounded px-2 py-1.5 text-[10px] font-mono flex-1"
                        style={{
                          background: lvl.isLeaf ? `${cfg.color}15` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${lvl.isLeaf ? cfg.color + "44" : "rgba(255,255,255,0.06)"}`,
                          color: lvl.isLeaf ? cfg.color : "rgba(255,255,255,0.45)",
                        }}>
                        <div className="font-semibold">{lvl.label}</div>
                        <div className="text-[9px] opacity-60 mt-0.5">{lvl.detail}</div>
                      </div>
                      <span className="text-[9px] text-white/20 font-mono flex-shrink-0">1 I/O</span>
                    </div>
                    {i < levels.length - 1 && (
                      <div className="flex items-center ml-2 my-0.5">
                        <div className="w-px h-2 bg-white/10" />
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
            <p className="text-[9px] text-white/20 mt-1.5">
              {Math.ceil(Math.log(Math.max(node.planRows, 10)) / Math.log(300)) + 1} total disk reads → {node.actualRows} row{node.actualRows !== 1 ? "s" : ""} returned
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BTreeExplorerPanel({ executionId, workflowId, ownerId, apiBase = "" }: Props) {
  const [data, setData] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planTree, setPlanTree] = useState<PlanNode | null>(null);
  const [maxTime, setMaxTime] = useState(1);
  const [selected, setSelected] = useState<PlanNode | null>(null);
  const [view, setView] = useState<"graph" | "raw">("graph");

  const fetch_ = useCallback(async (force = false) => {
    setLoading(true); setError(null);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("__Pearl_Token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const url = force
        ? `${apiBase}/api/v1/performance/explain/${executionId}?workflowId=${workflowId}&ownerId=${ownerId}`
        : `${apiBase}/api/v1/performance/explain/${executionId}`;
      const res = await fetch(url, { method: force ? "POST" : "GET", headers });
      if (res.status === 404 && !force) return fetch_(true);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ExplainResponse = await res.json();
      setData(json);
      try {
        const raw = JSON.parse(json.rawExplainJson ?? "[]");
        const arr = Array.isArray(raw) ? raw : [raw];
        if (arr[0]?.Plan) {
          const root = parsePlan(arr[0].Plan as Record<string, unknown>);
          setPlanTree(root);
          function walkMax(n: PlanNode): number { return Math.max(n.actualTotalTime, ...n.children.map(walkMax)); }
          setMaxTime(Math.max(walkMax(root), 0.001));
          setSelected(root); // auto-select root
        }
      } catch { /* plan unavailable */ }
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }, [executionId, workflowId, ownerId, apiBase]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="h-full flex flex-col text-white overflow-hidden"
      style={{ fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Database size={14} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white/80">Query Plan Tracer</span>
              {data && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.isIndexScan ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                  {data.scanType}
                </span>
              )}
            </div>
            <div className="text-[10px] text-white/20 font-mono">exec: {executionId.slice(0, 12)}…</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["graph", "raw"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{
                  background: view === v ? "rgba(34,197,94,0.15)" : "transparent",
                  color: view === v ? "#22c55e" : "rgba(255,255,255,0.3)",
                }}>
                {v === "graph" ? "Graph" : "Raw Plan"}
              </button>
            ))}
          </div>
          <button onClick={() => fetch_(true)} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            {loading ? "Analyzing…" : "Re-run EXPLAIN"}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      {data && (
        <div className="flex gap-2 px-5 py-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { label: "Planning", value: `${data.planningTimeMs?.toFixed(2)}ms`, color: "#06b6d4" },
            { label: "Execution", value: `${data.executionTimeMs?.toFixed(2)}ms`, color: "#22c55e" },
            { label: "Rows returned", value: data.rowsReturned?.toLocaleString(), color: "#22c55e" },
            { label: "Rows scanned", value: data.totalRowsScanned?.toLocaleString(), color: "#f59e0b" },
            { label: data.isIndexScan ? "Index speedup" : "Scan type", value: data.isIndexScan ? `${data.speedupRatio}×` : "Seq Scan ⚠", color: data.isIndexScan ? "#22c55e" : "#ef4444" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl px-3 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="text-[9px] text-white/25 mb-0.5">{s.label}</div>
              <div className="text-sm font-bold font-mono" style={{ color: s.color }}>{s.value ?? "–"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {loading && !data && (
          <div className="flex flex-col items-center justify-center w-full gap-3 text-slate-500">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            <p className="text-sm">Running EXPLAIN ANALYZE…</p>
          </div>
        )}

        {error && (
          <div className="m-4 flex items-start gap-3 p-4 rounded-xl flex-1"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <p className="text-[11px] text-red-600 mt-1">Click "Re-run EXPLAIN" above to retry.</p>
            </div>
          </div>
        )}

        {data && view === "graph" && (
          <>
            {/* Plan graph (scrollable) */}
            <div className="flex-1 overflow-auto p-6"
              style={{ borderRight: selected ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              {planTree ? (
                <div className="flex justify-center">
                  <GraphNode node={planTree} depth={0} maxTime={maxTime}
                    selected={selected?.nodeType === planTree.nodeType}
                    onSelect={setSelected} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                  <Database size={32} className="opacity-30" />
                  <p className="text-sm">No EXPLAIN plan — click Re-run EXPLAIN</p>
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {Object.entries(NODE_CFG).slice(0, 5).map(([type, cfg]) => (
                  <span key={type} className="flex items-center gap-1 text-[9px] px-2 py-1 rounded-lg"
                    style={{ background: `${cfg.color}0a`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
                    {cfg.Icon} {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Node detail panel */}
            <AnimatePresence>
              {selected && (
                <div className="w-80 flex-shrink-0 p-3">
                  <NodeDetail node={selected} onClose={() => setSelected(null)} />
                </div>
              )}
            </AnimatePresence>
          </>
        )}

        {data && view === "raw" && (
          <div className="flex-1 overflow-auto p-5">
            <div className="text-[9px] text-white/25 uppercase tracking-widest mb-3">Raw EXPLAIN (FORMAT JSON, ANALYZE, BUFFERS)</div>
            <pre className="text-[11px] font-mono text-emerald-400/70 whitespace-pre-wrap break-all">
              {JSON.stringify(JSON.parse(data.rawExplainJson || "[]"), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}