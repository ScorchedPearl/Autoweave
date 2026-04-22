"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Activity, X, ChevronLeft } from "lucide-react";
import { BTreeExplorerPanel } from "@/components/BTreeExplorerPanel";
import { SagaTransactionMonitor } from "@/components/SagaTransactionMonitor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerformancePanelProps {
  executionId: string;
  workflowId: string;
  onClose?: () => void;
  apiBase?: string;
}

type ActiveTab = "btree" | "saga";

function TabButton({
  id,
  active,
  onClick,
  icon,
  label,
  description,
  accent,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  accent: "emerald" | "violet";
}) {
  const colors = {
    emerald: {
      active:   "border-emerald-500 bg-emerald-500/10 text-emerald-300",
      inactive: "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300",
      icon:     "text-emerald-400",
    },
    violet: {
      active:   "border-violet-500 bg-violet-500/10 text-violet-300",
      inactive: "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300",
      icon:     "text-violet-400",
    },
  };
  const c = colors[accent];

  return (
    <button
      id={id}
      onClick={onClick}
      className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
        active ? c.active : c.inactive
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? (accent === "emerald" ? "bg-emerald-500/20" : "bg-violet-500/20") : "bg-slate-800"}`}>
        <span className={active ? c.icon : "text-slate-500"}>{icon}</span>
      </div>
      <div className="text-left min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-slate-500 truncate">{description}</div>
      </div>
      {active && (
        <motion.div
          layoutId="tab-active-dot"
          className={`ml-auto w-2 h-2 rounded-full ${accent === "emerald" ? "bg-emerald-400" : "bg-violet-400"}`}
        />
      )}
    </button>
  );
}

// ─── Main PerformancePanel ────────────────────────────────────────────────────

export function PerformancePanel({
  executionId,
  workflowId,
  onClose,
  apiBase = "",
}: PerformancePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("btree");

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span className="text-slate-600">AutoWeave</span>
          <span className="text-slate-700">/</span>
          <span>Performance & DBMS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono bg-slate-800 px-2 py-1 rounded">
            exec: {executionId.slice(0, 8)}…
          </span>
          {onClose && (
            <button
              id="perf-panel-close"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-3 p-4 flex-shrink-0 border-b border-slate-800 bg-slate-900/50">
        <TabButton
          id="perf-tab-btree"
          active={activeTab === "btree"}
          onClick={() => setActiveTab("btree")}
          icon={<Database size={16} />}
          label="B-Tree Execution Explorer"
          description="Physical query plan · O(log N) visualization"
          accent="emerald"
        />
        <TabButton
          id="perf-tab-saga"
          active={activeTab === "saga"}
          onClick={() => setActiveTab("saga")}
          icon={<Activity size={16} />}
          label="Saga Transaction Monitor"
          description="Distributed ACID · Outbox + Compensation"
          accent="violet"
        />
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "btree" && (
            <motion.div
              key="btree"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <BTreeExplorerPanel
                executionId={executionId}
                workflowId={workflowId}
                apiBase={apiBase}
              />
            </motion.div>
          )}
          {activeTab === "saga" && (
            <motion.div
              key="saga"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <SagaTransactionMonitor
                executionId={executionId}
                apiBase={apiBase}
                pollIntervalMs={2000}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Floating Performance Button ─────────────────────────────────────────────
// Drop <PerformancePanelButton> anywhere — it renders as a full-width sidebar
// button matching the AutoWeave glassmorphism style. After clicking it opens a
// slide-in panel covering the right side of the screen.

export function PerformancePanelButton({
  executionId,
  workflowId,
  apiBase,
}: Omit<PerformancePanelProps, "onClose">) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Full-width sidebar button — matches existing Button styling */}
      <button
        id="open-performance-panel-btn"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.03]"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.1) 100%)",
          border: "1px solid rgba(16,185,129,0.35)",
          color: "#6ee7b7",
          boxShadow: "0 0 20px rgba(16,185,129,0.08)",
        }}
      >
        <Database size={14} className="text-emerald-400" />
        Performance &amp; DBMS
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            {/* Sliding panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-50 p-4"
            >
              <PerformancePanel
                executionId={executionId}
                workflowId={workflowId}
                onClose={() => setOpen(false)}
                apiBase={apiBase}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
