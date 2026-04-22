"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, Zap, AlertTriangle, Search, BarChart3,
  ChevronRight, ChevronDown, Info, TrendingDown, Activity,
  GitBranch, Clock, Layers
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


function BTreeVisualNode({
  node,
  depth = 0,
}: {
  node: BTreeNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.1 }}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none text-sm font-mono
          ${node.isHighlighted
            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-emerald-500/30 shadow-lg"
            : node.isLeaf
            ? "bg-violet-500/20 border-violet-500/60 text-violet-300"
            : "bg-slate-700/60 border-slate-600 text-slate-300"
          }`}
        onClick={() => setExpanded((e) => !e)}
        title={node.label}
      >
        <span className="text-xs opacity-60">L{node.level}</span>
        <span className="max-w-[180px] truncate">{node.label}</span>
        {node.isHighlighted && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"
          />
        )}
        {node.children && node.children.length > 0 && (
          <span className="text-slate-500 ml-1">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </motion.div>

      {/* Connector lines + children */}
      <AnimatePresence>
        {expanded && node.children && node.children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-4 relative"
          >
            {/* Vertical stem */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-600" />
            <div className="pt-4 flex gap-4">
              {node.children.map((child, i) => (
                <div key={i} className="flex flex-col items-center gap-0">
                  {/* Horizontal branch */}
                  <div className="w-full h-px bg-slate-600 mb-1" />
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


function ComplexityComparisonChart({
  btreeOps,
  seqOps,
  n,
}: {
  btreeOps: number;
  seqOps: number;
  n: number;
}) {
  const max = seqOps;
  const btreePct = Math.min((btreeOps / max) * 100, 100);
  const seqPct = 100;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <GitBranch size={11} className="text-emerald-400" />
            B-Tree O(log N)
          </span>
          <span className="font-mono text-emerald-400">~{btreeOps.toLocaleString()} ops</span>
        </div>
        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${btreePct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1">
            <Search size={11} className="text-red-400" />
            Sequential Scan O(N)
          </span>
          <span className="font-mono text-red-400">~{seqOps.toLocaleString()} ops</span>
        </div>
        <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${seqPct}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full"
          />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Table size N = {n.toLocaleString()} rows
      </p>
    </div>
  );
}


function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: "green" | "blue" | "orange" | "purple";
}) {
  const colors = {
    green:  "border-emerald-500/40 text-emerald-400",
    blue:   "border-blue-500/40 text-blue-400",
    orange: "border-orange-500/40 text-orange-400",
    purple: "border-violet-500/40 text-violet-400",
  };
  return (
    <div className={`bg-slate-800/60 border rounded-xl p-4 ${colors[accent]}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold font-mono ${colors[accent].split(" ")[1]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BTreeExplorerPanel({ executionId, workflowId, apiBase = "" }: Props) {
  const [data, setData] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [activeTab, setActiveTab] = useState<"tree" | "complexity" | "narrative">("tree");


const fetchExplain = useCallback(async (force = false) => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('__Pearl_Token'); 
    
    const url = force
      ? `${apiBase}/api/v1/performance/explain/${executionId}?workflowId=${workflowId}`
      : `${apiBase}/api/v1/performance/explain/${executionId}`;

    const method = force ? "POST" : "GET";
    
    const res = await fetch(url, { 
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("Session expired. Please log in again.");
    }
    
    if (res.status === 404 && !force) {
      return fetchExplain(true);
    }
    
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    setData(await res.json());
  } catch (e: any) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}, [executionId, workflowId, apiBase]);

  useEffect(() => { fetchExplain(); }, [fetchExplain]);

  // Build a representative B-Tree from the explain data
  const buildBTree = (d: ExplainResponse): BTreeNode => {
    const depth = d.indexDepth || 3;
    const buildLevel = (level: number, maxDepth: number, isRoot: boolean): BTreeNode => {
      const isLeaf = level === maxDepth;
      const isHighlighted = isLeaf && d.isIndexScan;

      if (level === 0) {
        return {
          level: 0,
          label: isRoot ? `Root Page (key space)` : "Node",
          isLeaf: false,
          isHighlighted: false,
          children: [
            buildLevel(1, maxDepth, false),
            buildLevel(1, maxDepth, false),
            buildLevel(1, maxDepth, false),
          ],
        };
      }
      if (isLeaf) {
        return {
          level,
          label: `Leaf → owner_id + workflow_id`,
          isLeaf: true,
          isHighlighted,
        };
      }
      return {
        level,
        label: `Internal Node (L${level})`,
        isLeaf: false,
        isHighlighted: false,
        children:
          level < maxDepth - 1
            ? [buildLevel(level + 1, maxDepth, false), buildLevel(level + 1, maxDepth, false)]
            : [buildLevel(level + 1, maxDepth, false)],
      };
    };
    return buildLevel(0, depth, true);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Database size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold">B-Tree Execution Explorer</h2>
            <p className="text-xs text-slate-400">Physical query plan visualization</p>
          </div>
        </div>
        <button
          id="btree-refresh-btn"
          onClick={() => fetchExplain(true)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
        >
          <Zap size={12} />
          {loading ? "Analyzing..." : "Re-Analyze"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
            <p className="text-slate-400 text-sm">Running EXPLAIN ANALYZE…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Scan type badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 rounded-xl px-5 py-3 border ${
                data.isIndexScan
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : "bg-red-500/10 border-red-500/40"
              }`}
            >
              <div className={`text-2xl font-bold ${data.isIndexScan ? "text-emerald-400" : "text-red-400"}`}>
                {data.scanType}
              </div>
              {data.indexName && (
                <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded-md">
                  idx: {data.indexName}
                </span>
              )}
              <div className="ml-auto text-xs text-slate-500">
                {new Date(data.capturedAt).toLocaleTimeString()}
              </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={<Layers size={12} />} label="B-Tree Depth" value={`${data.indexDepth} levels`}
                sub={`O(log₂(N)) ≈ ${data.theoreticalBtreeOps} ops`} accent="green" />
              <StatCard icon={<Clock size={12} />} label="Exec Time" value={`${data.executionTimeMs?.toFixed(2)}ms`}
                sub={`Planning: ${data.planningTimeMs?.toFixed(2)}ms`} accent="blue" />
              <StatCard icon={<TrendingDown size={12} />} label="Speedup vs Seq" value={`${data.speedupRatio}×`}
                sub={`${data.rowsReturned} rows returned`} accent="orange" />
              <StatCard icon={<BarChart3 size={12} />} label="Rows Scanned" value={data.totalRowsScanned?.toLocaleString() || "–"}
                sub="by the query engine" accent="purple" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
              {(["tree", "complexity", "narrative"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`btree-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-slate-700 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab === "tree" ? "B-Tree Structure" : tab === "complexity" ? "Complexity" : "Professor Pitch"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "tree" && (
                <motion.div
                  key="tree"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 overflow-auto"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6 text-xs text-slate-400">
                      <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                      <span>Leaf node accessed (highlighted = query target)</span>
                      <div className="w-3 h-3 bg-violet-500 rounded-sm ml-4" />
                      <span>Other leaf nodes</span>
                      <div className="w-3 h-3 bg-slate-600 rounded-sm ml-4" />
                      <span>Internal nodes</span>
                    </div>
                    <BTreeVisualNode node={buildBTree(data)} />
                    <p className="text-xs text-slate-500 mt-6 text-center max-w-md">
                      Each traversal from root → leaf = 1 disk I/O. Height = {data.indexDepth} → max{" "}
                      {data.indexDepth} I/Os to locate any record (O(log N))
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "complexity" && (
                <motion.div
                  key="complexity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 space-y-6"
                >
                  <h3 className="text-sm font-medium text-slate-300">
                    Operations Required to Locate a Record
                  </h3>
                  <ComplexityComparisonChart
                    btreeOps={data.theoreticalBtreeOps}
                    seqOps={data.theoreticalSeqScanOps}
                    n={data.totalRowsScanned || 1000}
                  />
                  <div className="bg-slate-900/60 rounded-lg p-4 text-xs font-mono text-slate-300 space-y-1">
                    <div className="text-slate-500">// Composite index key structure</div>
                    <div>
                      <span className="text-violet-400">INDEX</span>{" "}
                      <span className="text-emerald-400">idx_executions_owner_workflow_time</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400">ON</span> executions
                    </div>
                    <div className="pl-4">
                      <span className="text-blue-400">(</span>owner_id,{" "}
                      workflow_id, started_at <span className="text-orange-400">DESC</span>
                      <span className="text-blue-400">)</span>
                    </div>
                    <div className="text-slate-500 mt-2">
                      // Relational Algebra: σ(owner_id=X ∧ workflow_id=Y)(Γ started_at↓)
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "narrative" && (
                <motion.div
                  key="narrative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Professor pitch */}
                  <div className="bg-gradient-to-br from-emerald-950/60 to-slate-800/60 border border-emerald-700/40 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={14} className="text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">Professor Narrative</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{data.professorNarrative}</p>
                  </div>

                  {/* Three talking points */}
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        title: "Relational Algebra",
                        point: `The query σ(owner_id=X ∧ workflow_id=Y)(executions) uses the selection operator over a composite predicate. The B-Tree index allows Postgres to evaluate this predicate in O(log N) rather than O(N) by exploiting the sorted structure of the index key.`,
                        color: "text-violet-400 border-violet-500/30 bg-violet-500/5",
                      },
                      {
                        title: "B-Tree Complexity O(log N)",
                        point: `With a branching factor b ≈ 300, a B-Tree of height h can index b^h ≈ 2.7 × 10^(h×2.4) records. For N=${data.totalRowsScanned?.toLocaleString()} rows, height ${data.indexDepth} suffices, requiring only ~${data.theoreticalBtreeOps} comparisons vs ${data.theoreticalSeqScanOps} for a full scan.`,
                        color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
                      },
                      {
                        title: "ACID Compliance",
                        point: `The index is maintained transactionally: every INSERT/UPDATE/DELETE to executions atomically updates the B-Tree. Postgres WAL (Write-Ahead Logging) ensures index consistency is preserved even on crash — guaranteeing the Durability guarantee of ACID.`,
                        color: "text-orange-400 border-orange-500/30 bg-orange-500/5",
                      },
                    ].map((tp, i) => (
                      <div key={i} className={`border rounded-xl p-4 ${tp.color}`}>
                        <div className={`text-xs font-semibold mb-1 ${tp.color.split(" ")[0]}`}>
                          {i + 1}. {tp.title}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{tp.point}</p>
                      </div>
                    ))}
                  </div>

                  {/* Raw JSON toggle */}
                  <button
                    id="btree-raw-json-toggle"
                    onClick={() => setShowRawJson((v) => !v)}
                    className="w-full text-xs text-slate-500 hover:text-slate-300 py-2 border border-slate-700 rounded-lg transition-colors"
                  >
                    {showRawJson ? "Hide" : "Show"} Raw EXPLAIN JSON
                  </button>
                  {showRawJson && (
                    <pre className="text-xs bg-slate-950 border border-slate-700 rounded-xl p-4 overflow-auto max-h-64 text-slate-400">
                      {JSON.stringify(JSON.parse(data.rawExplainJson || "{}"), null, 2)}
                    </pre>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
