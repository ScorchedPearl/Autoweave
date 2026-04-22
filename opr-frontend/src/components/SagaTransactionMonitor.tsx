"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, RotateCcw, Loader2, Shield,
  Zap, AlertTriangle, Activity, Clock, Info, Database,
  ArrowRight, RefreshCw
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepStatus {
  stepId: string;
  nodeId: string;
  nodeType: string;
  stepOrder: number;
  stepState: string;
  color: string;
  startedAt: string | null;
  completedAt: string | null;
  compensatedAt: string | null;
  errorMessage: string | null;
  hasCompensation: boolean;
}

interface SagaStatusResponse {
  sagaId: string;
  executionId: string;
  workflowId: string;
  sagaState: string;
  sagaColor: string;
  currentStep: string | null;
  startedAt: string | null;
  completedAt: string | null;
  compensatedAt: string | null;
  steps: StepStatus[];
  sagaNarrative: string;
}

interface Props {
  executionId: string;
  apiBase?: string;
  pollIntervalMs?: number;
}

// ─── Step Node Card ───────────────────────────────────────────────────────────

function StepNodeCard({ step, isActive }: { step: StepStatus; isActive: boolean }) {
  const stateConfig: Record<string, { icon: React.ReactNode; label: string; ring: string; bg: string }> = {
    PENDING:      { icon: <Clock size={14} />, label: "Pending",      ring: "ring-slate-600",   bg: "bg-slate-800" },
    EXECUTING:    { icon: <Loader2 size={14} className="animate-spin" />, label: "Executing", ring: "ring-blue-500", bg: "bg-blue-500/10" },
    COMMITTED:    { icon: <CheckCircle2 size={14} />, label: "Committed",   ring: "ring-emerald-500", bg: "bg-emerald-500/15" },
    COMPENSATING: { icon: <RotateCcw size={14} className="animate-spin" />, label: "Compensating", ring: "ring-orange-500", bg: "bg-orange-500/10" },
    COMPENSATED:  { icon: <RotateCcw size={14} />, label: "Compensated",  ring: "ring-orange-400", bg: "bg-orange-400/10" },
    FAILED:       { icon: <XCircle size={14} />, label: "Failed",       ring: "ring-red-500",    bg: "bg-red-500/10" },
  };

  const cfg = stateConfig[step.stepState] || stateConfig.PENDING;
  const colorText = {
    "#22c55e": "text-emerald-400",
    "#3b82f6": "text-blue-400",
    "#f97316": "text-orange-500",
    "#fb923c": "text-orange-400",
    "#ef4444": "text-red-400",
    "#6b7280": "text-slate-400",
  }[step.color] || "text-slate-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: isActive ? 1.04 : 1,
        boxShadow: isActive ? `0 0 0 2px ${step.color}55` : "none",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative flex flex-col gap-2 p-4 rounded-xl border ring-2 ${cfg.ring} ${cfg.bg} transition-all`}
    >
      {/* Pulsing glow for active state */}
      {(step.stepState === "EXECUTING" || step.stepState === "COMPENSATING") && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{ opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ boxShadow: `0 0 20px ${step.color}44` }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm font-medium ${colorText}`}>
          {cfg.icon}
          <span className="font-mono text-xs text-slate-400">#{step.stepOrder}</span>
          <span className="truncate max-w-[120px]">{step.nodeType}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorText} bg-black/20`}>
          {cfg.label}
        </span>
      </div>

      <div className="text-xs text-slate-500 font-mono truncate">{step.nodeId}</div>

      {step.errorMessage && (
        <div className="text-xs text-red-400 bg-red-900/20 rounded-lg px-2 py-1 mt-1">
          ⚠ {step.errorMessage}
        </div>
      )}

      {step.hasCompensation && step.stepState !== "PENDING" && step.stepState !== "EXECUTING" && (
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Shield size={9} />
          <span>Compensating TX stored</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Saga State Badge ─────────────────────────────────────────────────────────

function SagaStateBadge({ state, color }: { state: string; color: string }) {
  const emoji: Record<string, string> = {
    STARTED:      "🔵",
    IN_PROGRESS:  "⚡",
    COMPLETED:    "✅",
    COMPENSATING: "🔄",
    COMPENSATED:  "🟠",
    FAILED:       "❌",
  };

  return (
    <motion.div
      key={state}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
      style={{ backgroundColor: `${color}22`, border: `1px solid ${color}66`, color }}
    >
      <span>{emoji[state] || "⏳"}</span>
      <span>{state.replace("_", " ")}</span>
    </motion.div>
  );
}

// ─── Rollback Animation Overlay ───────────────────────────────────────────────

function RollbackWave({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-2xl border-2 border-orange-500/50"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SagaTransactionMonitor({
  executionId,
  apiBase = "",
  pollIntervalMs = 2000,
}: Props) {
  const [data, setData] = useState<SagaStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [simulatingFailure, setSimulatingFailure] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrors = useRef(0);

  const isCompensating =
    data?.sagaState === "COMPENSATING" || data?.sagaState === "COMPENSATED";
  const isTerminal =
    data?.sagaState === "COMPLETED" || data?.sagaState === "FAILED" || data?.sagaState === "COMPENSATED";

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/saga/execution/${executionId}/status`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
      consecutiveErrors.current = 0;
    } catch (e: any) {
      consecutiveErrors.current += 1;
      // Stop polling after 3 network failures (e.g. CORS, server down)
      if (consecutiveErrors.current >= 3) {
        setError(`Network error: ${e.message}. Polling stopped. Is the backend running?`);
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }
    } finally {
      setLoading(false);
    }
  }, [executionId, apiBase]);

  useEffect(() => {
    setLoading(true);
    fetchStatus();
    // Poll until terminal state
    if (!isTerminal) {
      intervalRef.current = setInterval(fetchStatus, pollIntervalMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus, isTerminal, pollIntervalMs]);

  // Stop polling when terminal
  useEffect(() => {
    if (isTerminal && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTerminal]);

  const handleSimulateFailure = async (nodeId: string) => {
    setSimulatingFailure(true);
    try {
      await fetch(
        `${apiBase}/api/v1/saga/execution/${executionId}/simulate-failure?nodeId=${nodeId}&reason=Professor+demo`,
        { method: "POST" }
      );
      await fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSimulatingFailure(false);
    }
  };

  // ACID progress: committed / total
  const committedCount = data?.steps.filter((s) => s.stepState === "COMMITTED").length || 0;
  const totalCount = data?.steps.length || 0;
  const progressPct = totalCount > 0 ? (committedCount / totalCount) * 100 : 0;

  return (
    <div className="relative h-full flex flex-col bg-slate-900 text-white rounded-2xl border border-slate-700 overflow-hidden">
      <AnimatePresence>{isCompensating && <RollbackWave active />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompensating ? "bg-orange-500/20" : "bg-violet-500/20"}`}>
            <Activity size={20} className={isCompensating ? "text-orange-400" : "text-violet-400"} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Saga Transaction Monitor</h2>
            <p className="text-xs text-slate-400">Distributed consistency visualizer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && <SagaStateBadge state={data.sagaState} color={data.sagaColor} />}
          <button
            id="saga-refresh-btn"
            onClick={() => { setLoading(true); fetchStatus(); }}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ACID progress bar */}
      {data && (
        <div className="px-6 pt-3 pb-1 flex-shrink-0">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>ACID Commit Progress</span>
            <span className="font-mono">{committedCount}/{totalCount} steps committed</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                isCompensating
                  ? "bg-gradient-to-r from-orange-700 to-orange-400"
                  : "bg-gradient-to-r from-violet-700 to-emerald-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full"
            />
            <p className="text-slate-400 text-sm">Connecting to Saga Monitor…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 rounded-xl p-4">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {notFound && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-500 px-6">
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
              <Activity size={28} className="opacity-30 mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-slate-400">Saga not started for this execution</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Saga infrastructure is built and ready.<br />
                It activates once <code className="text-violet-400">SagaCoordinatorService.startSaga()</code><br />
                is wired into <code className="text-violet-400">DistributedWorkflowCoordinator</code>.
              </p>
            </div>
            <div className="text-[10px] font-mono bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-500 w-full">
              <div className="text-slate-600 mb-1">// Add to startWorkflowExecution():</div>
              <div className="text-violet-400">sagaCoordinator.startSaga(executionId, workflowId);</div>
            </div>
          </div>
        )}

        {!data && !loading && !error && !notFound && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Database size={32} className="opacity-30" />
            <p className="text-sm">Connecting to Saga Monitor…</p>
          </div>
        )}

        {data && (
          <>
            {/* Compensation alert banner */}
            <AnimatePresence>
              {isCompensating && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/40 rounded-xl p-4"
                >
                  <RotateCcw size={18} className="text-orange-400 mt-0.5 flex-shrink-0 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-orange-300">Compensation Cascade Active</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rolling back committed steps in reverse topological order.
                      Compensating transactions are being published to Kafka via the Outbox Pattern.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step timeline */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Distributed Step Timeline
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />
                <div className="space-y-3 pl-10">
                  {data.steps.map((step, i) => (
                    <div key={step.stepId} className="relative">
                      {/* Dot on timeline */}
                      <motion.div
                        className="absolute -left-[30px] top-4 w-3 h-3 rounded-full border-2 border-slate-900"
                        animate={{ backgroundColor: step.color }}
                        style={{ backgroundColor: step.color }}
                      />
                      {/* Arrow between steps */}
                      {i < data.steps.length - 1 && (
                        <div className="absolute -left-[24px] top-8 text-slate-600">
                          <ArrowRight size={10} />
                        </div>
                      )}
                      <StepNodeCard
                        step={step}
                        isActive={data.currentStep === step.nodeId}
                      />

                      {/* Demo failure button */}
                      {step.stepState === "COMMITTED" && !isTerminal && (
                        <button
                          id={`saga-fail-btn-${step.nodeId}`}
                          onClick={() => handleSimulateFailure(step.nodeId)}
                          disabled={simulatingFailure}
                          className="mt-1 text-[10px] text-red-500/60 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <Zap size={8} />
                          Simulate failure here (demo)
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Narrative */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-violet-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                  System Narrative
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{data.sagaNarrative}</p>
            </div>

            {/* ACID Talking Points */}
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  title: "Atomicity via Outbox Pattern",
                  body: "Each node's Kafka event is written as a DB row IN THE SAME TRANSACTION as the saga step. The Outbox Relay publishes it afterward. No event is ever lost — even on crash.",
                  color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
                },
                {
                  title: "Consistency via DB Trigger",
                  body: "PostgreSQL trigger fn_sync_saga_state() fires on every step state change to update saga_instances.saga_state. The saga-level state is always a deterministic function of step states.",
                  color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
                },
                {
                  title: "Isolation via Optimistic Locking",
                  body: "@Version on SagaInstance increments on every update. Concurrent transactions competing for the same saga row will get an OptimisticLockException, preventing lost-update anomalies.",
                  color: "text-violet-400 border-violet-500/30 bg-violet-500/5",
                },
                {
                  title: "Durability via Compensating TXs",
                  body: "Each step's undo payload is persisted in saga_steps.compensation_payload before the step executes. On any crash, the Saga coordinator can replay compensations from durable DB state.",
                  color: "text-orange-400 border-orange-500/30 bg-orange-500/5",
                },
              ].map((tp, i) => (
                <div key={i} className={`border rounded-xl p-4 ${tp.color}`}>
                  <div className={`text-xs font-semibold mb-1 ${tp.color.split(" ")[0]}`}>
                    {["A", "C", "I", "D"][i]} — {tp.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tp.body}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
