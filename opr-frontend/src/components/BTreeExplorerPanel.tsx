"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  AlertTriangle,
  Search,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Activity,
  GitBranch,
  Clock,
  Layers,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExplainResponse {
  id: string;
  executionId: string;
  workflowId: string;
  scanType: string;
  indexName: string | null;
  indexDepth: number;
  isIndexScan: boolean;
  planningTimeMs: number;
  executionTimeMs: number;
  totalRowsScanned: number;
  rowsReturned: number;
  speedupRatio: number;
  theoreticalBtreeOps: number;
  theoreticalSeqScanOps: number;
  rawExplainJson: string;
  capturedAt: string;
  professorNarrative: string;
}

interface BTreeNode {
  level: number;
  label: string;
  isLeaf: boolean;
  isHighlighted: boolean;
  children?: BTreeNode[];
}

interface Props {
  executionId: string;
  workflowId: string;
  apiBase?: string;
}

// ─── B-Tree Visual Node ────────────────────────────────────────────────────────

function BTreeVisualNode({ node, depth = 0 }: { node: BTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  const levelNames = ["Root", "Branch", "Leaf"];
  const levelLabel = levelNames[Math.min(node.level, 2)] ?? `L${node.level}`;

  const nodeColor = node.isHighlighted
    ? {
        bg: "rgba(6,182,212,0.15)",
        border: "rgba(6,182,212,0.5)",
        text: "#67e8f9",
        glow: "0 0 12px rgba(6,182,212,0.25)",
      }
    : node.isLeaf
    ? {
        bg: "rgba(139,92,246,0.1)",
        border: "rgba(139,92,246,0.3)",
        text: "#c4b5fd",
        glow: "",
      }
    : {
        bg: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.1)",
        text: "rgba(255,255,255,0.55)",
        glow: "",
      };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.07, type: "spring", stiffness: 300 }}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium cursor-pointer select-none transition-all hover:scale-105"
        style={{
          background: nodeColor.bg,
          border: `1px solid ${nodeColor.border}`,
          color: nodeColor.text,
          boxShadow: node.isHighlighted ? nodeColor.glow : "none",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="opacity-40 text-[8px] font-mono uppercase tracking-wider">
          {levelLabel}
        </span>
        <span className="max-w-[140px] truncate">{node.label}</span>
        {node.isHighlighted && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.3 }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"
          />
        )}
        {node.children && node.children.length > 0 && (
          <span className="opacity-30">
            {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {expanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-3 relative"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <div className="pt-3 flex gap-3">
              {node.children.map((child, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-full h-px mb-0.5"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                  <BTreeVisualNode node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Speed Bar ─────────────────────────────────────────────────────────────────

function SpeedBar({
  label,
  pct,
  ops,
  color,
  delay,
}: {
  label: string;
  pct: number;
  ops: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-white/45">{label}</span>
        <span className="text-[12px] font-mono font-semibold" style={{ color }}>
          {ops.toLocaleString()} ops
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function BTreeExplorerPanel({
  executionId,
  workflowId,
  apiBase = "",
}: Props) {
  const [data, setData] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tree" | "speed">("tree");

  const fetchExplain = useCallback(
    async (force = false) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("__Pearl_Token");
        const url = force
          ? `${apiBase}/api/v1/performance/explain/${executionId}?workflowId=${workflowId}`
          : `${apiBase}/api/v1/performance/explain/${executionId}`;
        const res = await fetch(url, {
          method: force ? "POST" : "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 401 || res.status === 403) throw new Error("Session expired.");
        if (res.status === 404 && !force) return fetchExplain(true);
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        setData(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [executionId, workflowId, apiBase]
  );

  useEffect(() => {
    fetchExplain();
  }, [fetchExplain]);

  const buildBTree = (d: ExplainResponse): BTreeNode => {
    const depth = d.indexDepth || 3;
    const build = (level: number): BTreeNode => {
      const isLeaf = level === depth;
      if (level === 0)
        return {
          level: 0,
          label: "Root — key space",
          isLeaf: false,
          isHighlighted: false,
          children: [build(1), build(1), build(1)],
        };
      if (isLeaf)
        return {
          level,
          label: d.indexName ?? "Leaf — data pointer",
          isLeaf: true,
          isHighlighted: d.isIndexScan,
        };
      return {
        level,
        label: "Branch node",
        isLeaf: false,
        isHighlighted: false,
        children: level < depth - 1 ? [build(level + 1), build(level + 1)] : [build(level + 1)],
      };
    };
    return build(0);
  };

  // ─── Metric strip (horizontal, not grid boxes) ──────────────────────────────
  const metrics = data
    ? [
        { icon: <Layers size={13} />, label: "Depth", value: `${data.indexDepth}`, unit: "levels", color: "#06b6d4" },
        { icon: <Clock size={13} />, label: "Speed", value: `${data.executionTimeMs?.toFixed(1)}`, unit: "ms", color: "#60a5fa" },
        { icon: <TrendingDown size={13} />, label: "Boost", value: `${data.speedupRatio}×`, unit: "faster", color: "#fb923c" },
        { icon: <BarChart3 size={13} />, label: "Returned", value: `${data.rowsReturned ?? "–"}`, unit: "rows", color: "#a78bfa" },
      ]
    : [];

  return (
    <div className="relative h-full flex flex-col overflow-hidden scale-[1.03] origin-top" style={{ background: "transparent" }}>
      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.2)",
            }}
          >
            <Database size={14} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white/70">Query Analyzer</p>
            <p className="text-[10px] text-white/25">How the database finds your data</p>
          </div>
        </div>
        <button
          onClick={() => fetchExplain(true)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all disabled:opacity-40 hover:scale-105"
          style={{
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            color: "#67e8f9",
          }}
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing…" : "Re-Analyze"}
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-5 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }}
            />
            <p className="text-[12px] text-white/25">Analyzing query…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.18)",
            }}
          >
            <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
            <p className="text-[12px] text-red-300">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Scan type hero — pill not box */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: data.isIndexScan
                  ? "linear-gradient(120deg, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.04) 100%)"
                  : "linear-gradient(120deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.04) 100%)",
                border: `1px solid ${data.isIndexScan ? "rgba(6,182,212,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: data.isIndexScan ? "rgba(6,182,212,0.12)" : "rgba(239,68,68,0.12)",
                }}
              >
                {data.isIndexScan ? (
                  <CheckCircle size={18} className="text-cyan-400" />
                ) : (
                  <XCircle size={18} className="text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: data.isIndexScan ? "#67e8f9" : "#f87171" }}
                >
                  {data.isIndexScan
                    ? "Index Scan — Direct Lookup"
                    : "Full Table Scan — Reading Everything"}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5 truncate">
                  {data.isIndexScan
                    ? `Index: ${data.indexName ?? "composite"} · ${data.indexDepth} levels`
                    : "No index — checks every row in the table"}
                </p>
              </div>
              <span className="text-[9px] text-white/20 font-mono flex-shrink-0">
                {new Date(data.capturedAt).toLocaleTimeString()}
              </span>
            </motion.div>

            {/* Metrics — horizontal flowing strip instead of grid boxes */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex-shrink-0 flex flex-col gap-1 px-4 py-3 rounded-2xl min-w-[105px]"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-center gap-1.5 text-[9px] text-white/25 uppercase tracking-wider">
                    <span style={{ color: m.color }}>{m.icon}</span>
                    {m.label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-xl font-bold font-mono leading-none"
                      style={{ color: m.color }}
                    >
                      {m.value}
                    </span>
                    <span className="text-[9px] text-white/25">{m.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tab pills */}
            <div className="flex items-center gap-2">
              {[
                { id: "tree" as const, label: "Query Map", icon: <GitBranch size={11} /> },
                { id: "speed" as const, label: "Speed Comparison", icon: <Activity size={11} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 hover:scale-105"
                    style={
                      isActive
                        ? {
                            background: "rgba(6,182,212,0.12)",
                            color: "#67e8f9",
                            border: "1px solid rgba(6,182,212,0.25)",
                          }
                        : {
                            background: "transparent",
                            color: "rgba(255,255,255,0.25)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }
                    }
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* Query Map */}
              {activeTab === "tree" && (
                <motion.div
                  key="tree"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-3xl p-6 overflow-auto"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {/* Legend — minimal, inline */}
                  <div className="flex flex-wrap gap-3 mb-5 text-[9px] text-white/25">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500/70 inline-block" />
                      Query target
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500/50 inline-block" />
                      Data leaves
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/15 inline-block" />
                      Navigation
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <BTreeVisualNode node={buildBTree(data)} />
                    <p className="text-[10px] text-white/18 mt-6 text-center max-w-xs leading-relaxed">
                      Like a book index: instead of scanning every page, the query jumps through {data.indexDepth} levels to land exactly on the right record.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Speed Comparison */}
              {activeTab === "speed" && (
                <motion.div
                  key="speed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-3xl p-5 space-y-5"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <p className="text-[12px] text-white/40 font-medium">
                    Steps needed to locate a record
                  </p>

                  {/* Big number comparison */}
                  <div className="flex items-stretch gap-3">
                    <div
                      className="flex-1 rounded-2xl px-4 py-4 text-center"
                      style={{ background: "rgba(6,182,212,0.06)" }}
                    >
                      <GitBranch size={17} className="text-cyan-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-mono text-cyan-400">
                        {data.theoreticalBtreeOps.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/30 mt-1">With index</div>
                    </div>
                    <div className="flex items-center text-white/15 text-lg font-light">
                      vs
                    </div>
                    <div
                      className="flex-1 rounded-2xl px-4 py-4 text-center"
                      style={{ background: "rgba(239,68,68,0.06)" }}
                    >
                      <Search size={17} className="text-red-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold font-mono text-red-400">
                        {data.theoreticalSeqScanOps.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/30 mt-1">Without index</div>
                    </div>
                  </div>

                  {/* Bar comparison */}
                  <div className="space-y-3">
                    <SpeedBar
                      label="Index Scan (direct path)"
                      pct={Math.min(
                        (data.theoreticalBtreeOps / data.theoreticalSeqScanOps) * 100,
                        100
                      )}
                      ops={data.theoreticalBtreeOps}
                      color="#06b6d4"
                      delay={0.2}
                    />
                    <SpeedBar
                      label="Full Table Scan (reads everything)"
                      pct={100}
                      ops={data.theoreticalSeqScanOps}
                      color="rgba(239,68,68,0.7)"
                      delay={0.4}
                    />
                  </div>

                  <p className="text-[10px] text-white/20 text-center">
                    {data.totalRowsScanned?.toLocaleString()} total records · index is{" "}
                    <span className="text-cyan-400 font-semibold">
                      {data.speedupRatio}× faster
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}