"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  Shield,
  Zap,
  AlertTriangle,
  Activity,
  Clock,
  Database,
  ArrowDown,
  RefreshCw,
  CircleDot,
  Circle,
  Wifi,
  WifiOff,
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

// ─── Step state config ────────────────────────────────────────────────────────

const STEP_CFG: Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  PENDING: {
    icon: <Circle size={12} />,
    label: "Waiting",
    color: "rgba(255,255,255,0.3)",
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.06)",
  },
  EXECUTING: {
    icon: <Loader2 size={12} className="animate-spin" />,
    label: "Running",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.2)",
  },
  COMMITTED: {
    icon: <CheckCircle2 size={12} />,
    label: "Done",
    color: "#22d3ee",
    bg: "rgba(6,182,212,0.06)",
    border: "rgba(6,182,212,0.2)",
  },
  COMPENSATING: {
    icon: <RotateCcw size={12} className="animate-spin" />,
    label: "Rolling Back",
    color: "#fb923c",
    bg: "rgba(249,115,22,0.06)",
    border: "rgba(249,115,22,0.2)",
  },
  COMPENSATED: {
    icon: <RotateCcw size={12} />,
    label: "Rolled Back",
    color: "#fdba74",
    bg: "rgba(249,115,22,0.04)",
    border: "rgba(249,115,22,0.15)",
  },
  FAILED: {
    icon: <XCircle size={12} />,
    label: "Failed",
    color: "#f87171",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
  },
};

// ─── Step Card ────────────────────────────────────────────────────────────────

function StepCard({ step, isActive }: { step: StepStatus; isActive: boolean }) {
  const cfg = STEP_CFG[step.stepState] ?? STEP_CFG.PENDING;
  const isRunning =
    step.stepState === "EXECUTING" || step.stepState === "COMPENSATING";

  const friendlyType = step.nodeType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0, scale: isActive ? 1.015 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: cfg.bg,
        border: `1px solid ${isActive ? step.color + "55" : cfg.border}`,
        boxShadow: isActive ? `0 0 0 1px ${step.color}22` : "none",
      }}
    >
      {/* Active glow */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.15, 0, 0.15] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ boxShadow: `inset 0 0 20px ${step.color}22` }}
        />
      )}

      <div className="relative flex items-center gap-3.5 px-4 py-3.5">
        {/* Order */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {step.stepOrder}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-medium text-white/80 truncate block">
            {friendlyType}
          </span>
          {step.errorMessage && (
            <span className="flex items-center gap-1 text-[10px] text-red-400 mt-0.5">
              <AlertTriangle size={8} />
              {step.errorMessage}
            </span>
          )}
          {step.hasCompensation &&
            step.stepState !== "PENDING" &&
            step.stepState !== "EXECUTING" && (
              <span className="flex items-center gap-1 text-[9px] text-white/20 mt-0.5">
                <Shield size={8} />
                Undo action saved
              </span>
            )}
        </div>

        {/* Status pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold flex-shrink-0"
          style={{ color: cfg.color, background: "rgba(0,0,0,0.2)" }}
        >
          {cfg.icon}
          {cfg.label}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Overall Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ state, color }: { state: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    STARTED: <CircleDot size={10} />,
    IN_PROGRESS: <Loader2 size={10} className="animate-spin" />,
    COMPLETED: <CheckCircle2 size={10} />,
    COMPENSATING: <RotateCcw size={10} className="animate-spin" />,
    COMPENSATED: <RotateCcw size={10} />,
    FAILED: <XCircle size={10} />,
  };
  const friendly: Record<string, string> = {
    STARTED: "Started",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    COMPENSATING: "Rolling Back",
    COMPENSATED: "Rolled Back",
    FAILED: "Failed",
  };

  return (
    <motion.div
      key={state}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}
    >
      {icons[state] ?? <CircleDot size={10} />}
      {friendly[state] ?? state.replace("_", " ")}
    </motion.div>
  );
}

// ─── Rollback Ripple ──────────────────────────────────────────────────────────

function RollbackRipple({ active }: { active: boolean }) {
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
          className="absolute inset-0 rounded-2xl border border-orange-500/20"
          initial={{ scale: 0.9, opacity: 0.5 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{
            repeat: Infinity,
            duration: 2.4,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

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
    data?.sagaState === "COMPLETED" ||
    data?.sagaState === "FAILED" ||
    data?.sagaState === "COMPENSATED";

  const committedCount =
    data?.steps.filter((s) => s.stepState === "COMMITTED").length ?? 0;
  const totalCount = data?.steps.length ?? 0;
  const progressPct = totalCount > 0 ? (committedCount / totalCount) * 100 : 0;

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${apiBase}/api/v1/saga/execution/${executionId}/status`
      );
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
      consecutiveErrors.current = 0;
    } catch (e: any) {
      consecutiveErrors.current += 1;
      if (consecutiveErrors.current >= 3) {
        setError(`Connection lost: ${e.message}`);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [executionId, apiBase]);

  useEffect(() => {
    setLoading(true);
    fetchStatus();
    if (!isTerminal) {
      intervalRef.current = setInterval(fetchStatus, pollIntervalMs);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus, isTerminal, pollIntervalMs]);

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
        `${apiBase}/api/v1/saga/execution/${executionId}/simulate-failure?nodeId=${nodeId}&reason=demo`,
        { method: "POST" }
      );
      await fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSimulatingFailure(false);
    }
  };

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden scale-[1.03] origin-top"
      style={{ background: "transparent" }}
    >
      <AnimatePresence>{isCompensating && <RollbackRipple active />}</AnimatePresence>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: isCompensating
                ? "rgba(249,115,22,0.1)"
                : "rgba(139,92,246,0.1)",
              border: `1px solid ${
                isCompensating
                  ? "rgba(249,115,22,0.2)"
                  : "rgba(139,92,246,0.2)"
              }`,
            }}
          >
            <Activity
              size={14}
              className={isCompensating ? "text-orange-400" : "text-violet-400"}
            />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white/70">
              Transaction Monitor
            </p>
            <p className="text-[10px] text-white/25">Live step tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && (
            <div
              className="flex items-center gap-1 text-[10px]"
              style={{
                color: isTerminal ? "rgba(255,255,255,0.2)" : "#4ade80",
              }}
            >
              {isTerminal ? (
                <WifiOff size={10} />
              ) : (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Wifi size={10} />
                </motion.div>
              )}
              <span>{isTerminal ? "Stopped" : "Live"}</span>
            </div>
          )}

          {data && <StatusBadge state={data.sagaState} color={data.sagaColor} />}

          <button
            onClick={() => {
              setLoading(true);
              fetchStatus();
            }}
            disabled={loading}
            className="p-1.5 rounded-xl transition-all disabled:opacity-40 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <RefreshCw
              size={13}
              className={`text-white/40 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Progress — thin, elegant */}
      {data && totalCount > 0 && (
        <div className="px-5 pb-2 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-white/20 mb-1">
            <span>Progress</span>
            <span className="font-mono">
              {committedCount}/{totalCount}
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full"
              style={{
                background: isCompensating
                  ? "linear-gradient(90deg, #c2410c, #fb923c)"
                  : "linear-gradient(90deg, #7c3aed, #06b6d4)",
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-auto px-5 pb-5 space-y-3.5">
        {/* Loading */}
        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: "rgba(139,92,246,0.2)",
                borderTopColor: "#8b5cf6",
              }}
            />
            <p className="text-[12px] text-white/20">Connecting…</p>
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

        {/* Not found */}
        {notFound && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Database size={20} className="text-white/15" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/40">
                No transaction data yet
              </p>
              <p className="text-[10px] text-white/20 mt-1.5 leading-relaxed">
                Monitoring activates automatically when this workflow runs.
              </p>
            </div>
          </div>
        )}

        {/* Data */}
        {data && (
          <>
            {/* Alert banners — non-boxy, full-radius pill */}
            <AnimatePresence>
              {isCompensating && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "rgba(249,115,22,0.06)",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  <RotateCcw
                    size={14}
                    className="text-orange-400 flex-shrink-0 animate-spin"
                  />
                  <div>
                    <p className="text-[12px] font-semibold text-orange-300">
                      Rolling Back
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Undoing completed steps in reverse order to keep your data
                      consistent.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {data.sagaState === "COMPLETED" && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(6,182,212,0.06)",
                  border: "1px solid rgba(6,182,212,0.18)",
                }}
              >
                <CheckCircle2
                  size={14}
                  className="text-cyan-400 flex-shrink-0"
                />
                <div>
                  <p className="text-[12px] font-semibold text-cyan-300">
                    All Steps Done
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    Every step finished successfully.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Summary metrics — horizontal strip */}
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {[
                {
                  label: "Total",
                  value: totalCount,
                  color: "rgba(255,255,255,0.4)",
                  icon: <Clock size={11} />,
                },
                {
                  label: "Done",
                  value: committedCount,
                  color: "#22d3ee",
                  icon: <CheckCircle2 size={11} />,
                },
                {
                  label: "Failed",
                  value: data.steps.filter(
                    (s) =>
                      s.stepState === "FAILED" || s.stepState === "COMPENSATED"
                  ).length,
                  color: "#f87171",
                  icon: <XCircle size={11} />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.025)", minWidth: 72 }}
                >
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span
                    className="text-lg font-bold font-mono leading-none"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[9px] text-white/20">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <p className="text-[9px] font-semibold text-white/20 uppercase tracking-widest mb-3">
                Steps
              </p>

              <div className="relative">
                <div
                  className="absolute left-[19px] top-3 bottom-3 w-px"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />

                <div className="space-y-2 pl-10">
                  {data.steps.map((step, i) => (
                    <div key={step.stepId} className="relative">
                      <motion.div
                        className="absolute -left-[30px] top-[14px] w-2.5 h-2.5 rounded-full"
                        animate={{ backgroundColor: step.color }}
                        style={{
                          backgroundColor: step.color,
                          border: "2px solid #07090e",
                        }}
                      />
                      {i < data.steps.length - 1 && (
                        <div className="absolute -left-[26px] top-8 text-white/10">
                          <ArrowDown size={8} />
                        </div>
                      )}

                      <StepCard
                        step={step}
                        isActive={data.currentStep === step.nodeId}
                      />

                      {step.stepState === "COMMITTED" && !isTerminal && (
                        <button
                          onClick={() => handleSimulateFailure(step.nodeId)}
                          disabled={simulatingFailure}
                          className="mt-1 flex items-center gap-1 text-[9px] transition-colors disabled:opacity-40"
                          style={{ color: "rgba(239,68,68,0.35)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "rgba(239,68,68,0.7)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "rgba(239,68,68,0.35)")
                          }
                        >
                          <Zap size={7} />
                          Simulate failure here
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}