"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Activity, X } from "lucide-react";
import { BTreeExplorerPanel } from "@/components/BTreeExplorerPanel";
import { SagaTransactionMonitor } from "@/components/SagaTransactionMonitor";

interface PerformancePanelProps {
  executionId: string;
  workflowId: string;
  onClose?: () => void;
  apiBase?: string;
}

type ActiveTab = "btree" | "saga";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: {
  id: ActiveTab;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: { active: string; glow: string; dot: string };
}[] = [
  {
    id: "btree",
    label: "Query Analyzer",
    sublabel: "Index & speed insights",
    icon: <Database size={15} />,
    accent: {
      active: "rgba(6,182,212,0.12)",
      glow: "rgba(6,182,212,0.35)",
      dot: "#06b6d4",
    },
  },
  {
    id: "saga",
    label: "Transaction Monitor",
    sublabel: "Live step tracking",
    icon: <Activity size={15} />,
    accent: {
      active: "rgba(139,92,246,0.12)",
      glow: "rgba(139,92,246,0.35)",
      dot: "#8b5cf6",
    },
  },
];

// ─── Main PerformancePanel ────────────────────────────────────────────────────

export function PerformancePanel({ executionId, workflowId, onClose, apiBase = "" }: PerformancePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("btree");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #08090f 0%, #0b0d15 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1.5rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Ambient glow behind active tab */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none overflow-hidden rounded-t-3xl">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% -20%, ${active.accent.glow}22 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="text-white/15">AutoWeave</span>
          <span className="text-white/10">/</span>
          <span className="text-white/40">Performance</span>
          <span className="text-white/10">/</span>
          <span className="text-white/55 font-medium">{active.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20 font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
            {executionId.slice(0, 8)}…
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-white/25 hover:text-white/60"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher — pill style, not boxy */}
      <div className="relative flex items-center gap-2 px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: isActive ? tab.accent.active : "transparent",
                border: `1px solid ${isActive ? tab.accent.glow : "rgba(255,255,255,0.06)"}`,
                flex: "0 1 auto",
              }}
            >
              {/* Active dot */}
              {isActive && (
                <motion.div
                  layoutId="tab-dot"
                  className="absolute right-2.5 top-2.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: tab.accent.dot }}
                />
              )}
              <span style={{ color: isActive ? tab.accent.dot : "rgba(255,255,255,0.3)" }}>
                {tab.icon}
              </span>
              <div>
                <div className="text-xs font-semibold leading-none" style={{ color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}>
                  {tab.label}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: isActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)" }}>
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "btree" && (
            <motion.div key="btree"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <BTreeExplorerPanel executionId={executionId} workflowId={workflowId} apiBase={apiBase} />
            </motion.div>
          )}
          {activeTab === "saga" && (
            <motion.div key="saga"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <SagaTransactionMonitor executionId={executionId} apiBase={apiBase} pollIntervalMs={2000} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Floating Button ──────────────────────────────────────────────────────────

export function PerformancePanelButton({
  executionId,
  workflowId,
  apiBase,
}: Omit<PerformancePanelProps, "onClose">) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
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
