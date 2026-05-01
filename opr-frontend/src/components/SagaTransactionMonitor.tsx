"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RotateCcw, Loader2,
  ChevronDown, ChevronRight, AlertTriangle, Activity,
  RefreshCw, Database, ArrowDown
} from "lucide-react";


interface StepStatus {
  stepId: string; nodeId: string; nodeType: string; stepOrder: number;
  stepState: string; color: string;
  startedAt: string | null; completedAt: string | null; compensatedAt: string | null;
  errorMessage: string | null; hasCompensation: boolean;
  outputSnapshot: string | null; compensationPayload: string | null; durationMs: number;
}

interface SagaStatusResponse {
  sagaId: string; executionId: string; workflowId: string;
  sagaState: string; sagaColor: string; currentStep: string | null;
  startedAt: string | null; completedAt: string | null; compensatedAt: string | null;
  steps: StepStatus[]; sagaNarrative: string;
}

interface Props { executionId: string; apiBase?: string; pollIntervalMs?: number; }


const STATE_CONFIG: Record<string, { icon: React.ReactNode; label: string; textColor: string }> = {
  PENDING:      { icon: <Database size={13} />,   label: "Pending",      textColor: "#6b7280" },
  EXECUTING:    { icon: <Loader2 size={13} className="animate-spin" />, label: "Executing", textColor: "#3b82f6" },
  COMMITTED:    { icon: <CheckCircle2 size={13} />, label: "Committed",  textColor: "#22c55e" },
  COMPENSATING: { icon: <RotateCcw size={13} className="animate-spin" />, label: "Compensating", textColor: "#f97316" },
  COMPENSATED:  { icon: <RotateCcw size={13} />,  label: "Compensated", textColor: "#fb923c" },
  FAILED:       { icon: <XCircle size={13} />,    label: "Failed",      textColor: "#ef4444" },
};

// What each saga step state means in plain language.
// Shown inside the expanded step detail so developers understand the saga protocol.
const STEP_STATE_CONTEXT: Record<string, string> = {
  PENDING:
    "Waiting for preceding steps to commit before this local transaction can start.",
  EXECUTING:
    "Local transaction in progress. On success, Postgres will atomically write the result + store a compensation payload (outbox pattern). If this step commits, it becomes compensatable.",
  COMMITTED:
    "Local transaction committed and compensation payload persisted. This step is now enrolled in the saga — if any downstream step fails, this commit will be undone using the stored compensation transaction.",
  COMPENSATING:
    "Executing the pre-stored compensation transaction to undo this step's committed side effects. No distributed lock needed — eventual consistency through stored compensating writes.",
  COMPENSATED:
    "Compensation complete. This step's side effects have been fully reversed using its compensation payload.",
  FAILED:
    "Local transaction failed. The saga coordinator has triggered a compensation cascade: all previously committed steps will now be compensated in reverse order (highest step order first).",
};

// ── Saga Phase Flow: forward execution and compensation laid out side-by-side ─
//
// This makes the saga invariant visually obvious:
//   - Forward phase:  step 1 → step 2 → step 3 → … (each commits locally)
//   - Compensation:   … → undo step 3 → undo step 2 → undo step 1 (reverse order)
//
// Unlike 2PC (which holds locks across all participants), sagas commit eagerly
// and use compensating transactions for rollback — this is why we can scale
// across services without a distributed coordinator lock.

function SagaPhaseFlow({ steps, sagaState }: { steps: StepStatus[]; sagaState: string }) {
  const [open, setOpen] = useState(false);
  const isCompensating = sagaState === "COMPENSATING" || sagaState === "COMPENSATED";

  // Steps currently being compensated, shown in reverse execution order
  const compensationSteps = [...steps]
    .filter(s => s.stepState === "COMPENSATING" || s.stepState === "COMPENSATED")
    .sort((a, b) => b.stepOrder - a.stepOrder);

  return (
    <div className="flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-5 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-white/30">
            Saga Pattern
          </span>
          {isCompensating && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c" }}>
              COMPENSATING
            </span>
          )}
          {!isCompensating && sagaState === "COMPLETED" && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}>
              ALL COMMITTED
            </span>
          )}
        </div>
        <span className="text-white/20 flex-shrink-0">
          {open ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {/* Two-column phase diagram */}
              <div className={`grid gap-3 ${isCompensating ? "grid-cols-2" : "grid-cols-1"}`}>

                {/* Forward execution column */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 text-emerald-400/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Forward Phase — local commits
                  </div>
                  <div className="space-y-1">
                    {steps.map(step => {
                      const isCommitted  = step.stepState === "COMMITTED";
                      const isExecuting  = step.stepState === "EXECUTING";
                      const isFailed     = step.stepState === "FAILED";
                      const isCompensatd = step.stepState === "COMPENSATING" || step.stepState === "COMPENSATED";
                      return (
                        <div key={step.stepId}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                          style={{
                            background: isCommitted  ? "rgba(34,197,94,0.07)"
                                      : isExecuting  ? "rgba(59,130,246,0.07)"
                                      : isFailed     ? "rgba(239,68,68,0.07)"
                                      : isCompensatd ? "rgba(249,115,22,0.07)"
                                      : "rgba(255,255,255,0.025)",
                            border: `1px solid ${
                              isCommitted  ? "rgba(34,197,94,0.2)"
                            : isExecuting  ? "rgba(59,130,246,0.2)"
                            : isFailed     ? "rgba(239,68,68,0.2)"
                            : isCompensatd ? "rgba(249,115,22,0.15)"
                            : "rgba(255,255,255,0.05)"}`,
                          }}>
                          <span className="text-[8px] text-white/20 font-mono w-4 flex-shrink-0">{step.stepOrder}</span>
                          <span className="text-[10px] font-medium flex-1 truncate"
                            style={{ color: isCommitted  ? "#4ade80"
                                         : isExecuting  ? "#60a5fa"
                                         : isFailed     ? "#f87171"
                                         : isCompensatd ? "#fb923c"
                                         : "rgba(255,255,255,0.35)" }}>
                            {step.nodeType}
                          </span>
                          <span className="text-[8px] flex-shrink-0"
                            style={{ color: isCommitted  ? "rgba(74,222,128,0.5)"
                                         : isExecuting  ? "rgba(96,165,250,0.5)"
                                         : isFailed     ? "rgba(248,113,113,0.5)"
                                         : isCompensatd ? "rgba(251,146,60,0.5)"
                                         : "rgba(255,255,255,0.15)" }}>
                            {isCommitted  ? "✓ committed"
                           : isExecuting  ? "executing…"
                           : isFailed     ? "✗ failed"
                           : isCompensatd ? "↩ undone"
                           : "pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compensation column — only shown when rollback is active */}
                {isCompensating && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 text-orange-400/70">
                      <RotateCcw size={9} className="text-orange-400" />
                      Compensation Phase — reverse undo
                    </div>
                    {compensationSteps.length === 0 ? (
                      <p className="text-[9px] text-white/20 px-2">No compensation steps recorded yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {compensationSteps.map(step => {
                          const done = step.stepState === "COMPENSATED";
                          return (
                            <div key={step.stepId}
                              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                              style={{
                                background: done ? "rgba(249,115,22,0.05)" : "rgba(249,115,22,0.12)",
                                border: `1px solid ${done ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.3)"}`,
                              }}>
                              <span className="text-[9px] font-mono text-orange-400/60 flex-shrink-0">↩{step.stepOrder}</span>
                              <span className="text-[10px] font-medium flex-1 truncate text-orange-300/70">
                                {step.nodeType}
                              </span>
                              <span className="text-[8px] flex-shrink-0"
                                style={{ color: done ? "rgba(251,146,60,0.4)" : "rgba(251,146,60,0.8)" }}>
                                {done ? "undone" : "undoing…"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Saga vs 2PC explainer */}
              <div className="rounded-lg px-3 py-2.5 text-[10px] text-white/30 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {isCompensating ? (
                  <>
                    <span className="text-orange-400/80 font-semibold">Why no distributed lock? </span>
                    Each committed step persisted its compensation payload before executing. On failure, those payloads are
                    replayed in reverse — no two-phase-commit coordinator needed, no cross-service lock held.
                    This trades strong consistency for availability and partition tolerance.
                  </>
                ) : (
                  <>
                    <span className="text-violet-400/80 font-semibold">Saga vs 2PC: </span>
                    Two-phase commit locks all participants until every node votes — catastrophic under partial failure.
                    Sagas commit each step locally and store a compensation transaction pre-execution. If step K fails,
                    steps K-1 … 1 are compensated in reverse. No global lock; each service stays autonomous.
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function tryParse(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

function safeKeys(obj: Record<string, unknown> | null): string[] {
  return obj ? Object.keys(obj).filter(k => !["node_type","workflow_id","execution_id"].includes(k)) : [];
}


function JsonViewer({ json, label, color }: { json: string | null; label: string; color: string }) {
  const [open, setOpen] = useState(false);
  const parsed = tryParse(json);
  if (!parsed) return null;
  const keys = safeKeys(parsed);
  if (keys.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${color}22` }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        style={{ background: `${color}08` }}>
        <span style={{ color }}>{open ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{label}</span>
        <span className="text-[10px] text-white/20 ml-auto">{keys.length} fields</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-3 py-2 space-y-1 font-mono text-[11px]"
              style={{ background: "rgba(0,0,0,0.3)" }}>
              {keys.map(k => {
                const v = parsed[k];
                const display = typeof v === "object" ? JSON.stringify(v) : String(v);
                const isNumeric = typeof v === "number";
                const isBool = typeof v === "boolean";
                return (
                  <div key={k} className="flex gap-2 items-start">
                    <span className="text-white/30 flex-shrink-0">{k}:</span>
                    <span className={`break-all ${isNumeric ? "text-amber-400" : isBool ? "text-purple-400" : "text-emerald-400"}`}>
                      {display}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function StepTraceEntry({
  step, totalDurationMs, isActive, onSimulateFail, canSimulate,
}: {
  step: StepStatus; totalDurationMs: number; isActive: boolean;
  onSimulateFail: (nodeId: string) => void; canSimulate: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATE_CONFIG[step.stepState] ?? STATE_CONFIG.PENDING;
  const barPct = totalDurationMs > 0 ? Math.max(3, (step.durationMs / totalDurationMs) * 100) : 30;

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: step.stepOrder * 0.07 }}
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-all hover:bg-white/[0.03]"
        style={{
          border: isActive ? `1px solid ${step.color}44` : "1px solid rgba(255,255,255,0.04)",
          background: isActive ? `${step.color}08` : "rgba(255,255,255,0.02)",
          boxShadow: isActive ? `0 0 12px ${step.color}18` : "none",
        }}>

        <span style={{ color: cfg.textColor }} className="flex-shrink-0">{cfg.icon}</span>

        <span className="text-[10px] text-white/20 font-mono flex-shrink-0">#{step.stepOrder}</span>

        <span className="text-xs font-semibold text-white/70 flex-1 truncate">{step.nodeType}</span>

        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
          <motion.div className="h-full rounded-full" style={{ background: step.color }}
            initial={{ width: 0 }} animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.7, delay: step.stepOrder * 0.07 }} />
        </div>

        <span className="text-[11px] font-mono flex-shrink-0 w-14 text-right"
          style={{ color: step.durationMs > 0 ? step.color : "rgba(255,255,255,0.2)" }}>
          {step.durationMs > 0 ? `${step.durationMs}ms` : "–"}
        </span>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${step.color}18`, color: step.color }}>
          {cfg.label}
        </span>

        <span className="text-white/20 flex-shrink-0">
          {expanded ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
        </span>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 mb-2 rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.25)" }}>
            <div className="p-3 space-y-1">

              <div className="text-[10px] font-mono text-white/25 pb-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                node: {step.nodeId}
              </div>

              {/* What this state means in the saga protocol */}
              <div className="mt-2 rounded-lg px-3 py-2 text-[10px] leading-relaxed"
                style={{
                  background: `${step.color}08`,
                  border: `1px solid ${step.color}22`,
                  color: "rgba(255,255,255,0.45)",
                }}>
                <span className="font-semibold mr-1" style={{ color: step.color }}>
                  {step.stepState}:
                </span>
                {STEP_STATE_CONTEXT[step.stepState] ?? "Step is part of the distributed saga transaction."}
              </div>

              <JsonViewer json={step.outputSnapshot} label="Step Output" color="#22c55e" />

              {step.hasCompensation && (
                <JsonViewer json={step.compensationPayload} label="Compensation (undo)" color="#f97316" />
              )}

              {step.errorMessage && (
                <div className="mt-2 rounded-lg px-3 py-2 text-[11px] text-red-300 flex items-start gap-2"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertTriangle size={11} className="text-red-400 flex-shrink-0 mt-0.5" />
                  {step.errorMessage}
                </div>
              )}

              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                {step.startedAt && (
                  <div className="text-white/25">Started: <span className="text-white/40">{new Date(step.startedAt).toLocaleTimeString()}</span></div>
                )}
                {step.completedAt && (
                  <div className="text-white/25">Completed: <span className="text-white/40">{new Date(step.completedAt).toLocaleTimeString()}</span></div>
                )}
              </div>

              {canSimulate && step.stepState === "COMMITTED" && (
                <button onClick={(e) => { e.stopPropagation(); onSimulateFail(step.nodeId); }}
                  className="mt-2 text-[10px] text-red-500/50 hover:text-red-400 transition-colors flex items-center gap-1">
                  <XCircle size={9} /> Simulate failure here 
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-start ml-6 mb-0.5">
        <ArrowDown size={10} className="text-white/10" />
      </div>
    </div>
  );
}


export function SagaTransactionMonitor({ executionId, apiBase = "", pollIntervalMs = 2000 }: Props) {
  const [data, setData] = useState<SagaStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const failCount = useRef(0);

  const isTerminal = data?.sagaState === "COMPLETED" || data?.sagaState === "FAILED" || data?.sagaState === "COMPENSATED";
  const isCompensating = data?.sagaState === "COMPENSATING" || data?.sagaState === "COMPENSATED";

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/saga/execution/${executionId}/status`);
      if (res.status === 404) {
        setNotFound(true); setLoading(false);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json()); setError(null); failCount.current = 0;
    } catch {
      failCount.current += 1;
      if (failCount.current >= 3) {
        setError(`Connection failed after 3 attempts. Backend reachable?`);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }
    } finally { setLoading(false); }
  }, [executionId, apiBase]);

  useEffect(() => {
    setLoading(true); fetchStatus();
    if (!isTerminal) intervalRef.current = setInterval(fetchStatus, pollIntervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus]);

  useEffect(() => {
    if (isTerminal && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, [isTerminal]);

  const handleSimFail = async (nodeId: string) => {
    setSimulating(true);
    try {
      await fetch(`${apiBase}/api/v1/saga/execution/${executionId}/simulate-failure?nodeId=${nodeId}&reason=Professor+demo`, { method: "POST" });
      await fetchStatus();
    } finally { setSimulating(false); }
  };

  const totalMs = data?.steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0) ?? 0;
  const committedCount = data?.steps.filter(s => s.stepState === "COMMITTED").length ?? 0;
  const totalCount = data?.steps.length ?? 0;

  return (
    <div className="h-full flex flex-col text-white overflow-hidden"
      style={{ background: "linear-gradient(160deg,#070810 0%,#0a0c18 100%)", fontFamily: "'Inter',sans-serif", position: "relative" }}>

      <AnimatePresence>
        {isCompensating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
            style={{ zIndex: 0 }}>
            {[0,1,2].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-3xl"
                style={{ border: "2px solid rgba(249,115,22,0.3)" }}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1.05, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.8, ease: "easeOut" }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isCompensating ? "bg-orange-500/20" : "bg-violet-500/20"}`}>
              <Activity size={13} className={isCompensating ? "text-orange-400" : "text-violet-400"} />
            </div>
            <span className="text-sm font-semibold text-white/80">Distributed Execution Trace</span>
            {data && (
              <motion.span key={data.sagaState}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${data.sagaColor}18`, color: data.sagaColor }}>
                {data.sagaState}
              </motion.span>
            )}
          </div>
          <div className="text-[10px] text-white/20 mt-0.5 font-mono">exec: {executionId.slice(0,12)}…</div>
        </div>
        <button onClick={() => { setLoading(true); fetchStatus(); }} disabled={loading}
          className="p-1.5 rounded-lg transition-colors text-white/25 hover:text-white/60 hover:bg-white/5">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {data && totalCount > 0 && (
        <div className="px-5 pt-3 pb-2 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
            <span>ACID Commit Progress</span>
            <span className="font-mono">{committedCount}/{totalCount} committed</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              animate={{ width: `${(committedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: isCompensating
                ? "linear-gradient(90deg,#f97316,#fb923c)"
                : "linear-gradient(90deg,#8b5cf6,#22c55e)" }} />
          </div>
        </div>
      )}

      {/* Saga pattern explainer — shows the two execution phases side-by-side */}
      {data && data.steps.length > 0 && (
        <SagaPhaseFlow steps={data.steps} sagaState={data.sagaState} />
      )}

      <div className="flex-1 overflow-auto px-5 pb-5 relative">

        {loading && !data && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
            <p className="text-sm">Connecting to Saga Monitor…</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 mt-4 p-4 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300">{error}</p>
              <p className="text-[11px] text-red-600 mt-1">Is <code className="text-red-400">/api/v1/saga/**</code> in SecurityConfig permitAll()?</p>
            </div>
          </div>
        )}

        {notFound && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 px-4">
            <div className="p-4 rounded-2xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Activity size={28} className="text-violet-500/40 mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-white/50">Saga not yet started for this execution</p>
              <p className="text-[11px] text-white/25 leading-relaxed">
                The infrastructure is built. Wire it into<br />
                <code className="text-violet-400">DistributedWorkflowCoordinator</code>:
              </p>
            </div>
            <div className="w-full rounded-xl overflow-hidden text-[11px] font-mono"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="px-3 py-2 text-white/15 text-[9px] uppercase tracking-widest"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>startWorkflowExecution()</div>
              <div className="px-3 py-3 space-y-1">
                <div className="text-white/25">{"// 1. Start the saga"}</div>
                <div className="text-violet-400">sagaCoordinator.startSaga(executionId, workflowId);</div>
                <div className="text-white/25 mt-2">{"// 2. After each node completes:"}</div>
                <div className="text-emerald-400">sagaCoordinator.commitStep(sagaId, nodeId, outputJson);</div>
                <div className="text-white/25 mt-2">{"// 3. On failure:"}</div>
                <div className="text-red-400">sagaCoordinator.failStepAndCompensate(sagaId, nodeId, err);</div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isCompensating && data && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 mt-2 flex items-start gap-3 p-4 rounded-xl"
              style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)" }}>
              <RotateCcw size={15} className="text-orange-400 flex-shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="text-sm font-semibold text-orange-300">Compensation Cascade Active</p>
                <p className="text-[11px] text-orange-500/70 mt-0.5">
                  Rolling back committed steps in reverse topological order via stored compensating transactions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {data && data.steps.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-3 px-3 mb-2 text-[9px] text-white/20 uppercase tracking-widest">
              <span className="w-3" />
              <span className="w-4" /><span className="flex-1">Node</span>
              <span className="w-24">Duration</span>
              <span className="w-14 text-right">Time</span>
              <span className="w-20 text-right">State</span>
              <span className="w-4" />
            </div>

            {data.steps.map(step => (
              <StepTraceEntry key={step.stepId} step={step}
                totalDurationMs={totalMs}
                isActive={data.currentStep === step.nodeId}
                onSimulateFail={handleSimFail}
                canSimulate={!isTerminal && !simulating} />
            ))}
          </div>
        )}

        {data && (
          <div className="mt-4 rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-[9px] text-white/20 uppercase tracking-widest mb-2">System Narrative</div>
            <p className="text-[12px] text-white/50 leading-relaxed">{data.sagaNarrative}</p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { letter: "A", title: "Atomicity", color: "#3b82f6",
              body: "Each step + its Kafka event written in ONE transaction via Outbox Pattern." },
            { letter: "C", title: "Consistency", color: "#22c55e",
              body: "DB trigger fn_sync_saga_state() keeps saga state deterministic from step states." },
            { letter: "I", title: "Isolation", color: "#8b5cf6",
              body: "@Version optimistic locking prevents concurrent lost-update anomalies." },
            { letter: "D", title: "Durability", color: "#f59e0b",
              body: "Compensation payloads persisted pre-execution. Replayable after any crash." },
          ].map(t => (
            <div key={t.letter} className="rounded-xl p-3"
              style={{ background: `${t.color}08`, border: `1px solid ${t.color}18` }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: t.color }}>{t.letter} — {t.title}</div>
              <p className="text-[10px] text-white/35 leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}