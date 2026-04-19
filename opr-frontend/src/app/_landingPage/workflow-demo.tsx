"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bot, GitBranch, Mail, Database, Bell, RotateCcw, ArrowRight, Check, Pause, Play } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    active: [] as string[],
    flowing: [] as string[],
    label: "Idle",
    desc: "Workflow deployed and listening for events.",
  },
  {
    active: ["trigger"],
    flowing: [],
    label: "Webhook received",
    desc: "A new order event arrived. Execution begins.",
  },
  {
    active: ["trigger", "ai"],
    flowing: ["e1"],
    label: "AI agent analyzing",
    desc: "Claude 3.5 Sonnet classifies the request.",
  },
  {
    active: ["trigger", "ai", "branch"],
    flowing: ["e1", "e2"],
    label: "Routing decision",
    desc: "Router selects both downstream paths.",
  },
  {
    active: ["trigger", "ai", "branch", "email", "db"],
    flowing: ["e1", "e2", "e3", "e4"],
    label: "Parallel execution",
    desc: "Email sent and DB updated simultaneously.",
  },
  {
    active: ["trigger", "ai", "branch", "email", "db", "notify"],
    flowing: ["e1", "e2", "e3", "e4", "e5"],
    label: "Complete",
    desc: "Automation finished in 1.8s. Zero intervention.",
  },
];

const NODES = [
  { id: "trigger", label: "Webhook",    sub: "POST /api/orders", color: "#06b6d4", Icon: Zap,       left: 10,  top: 133 },
  { id: "ai",      label: "AI Agent",   sub: "Claude 3.5",       color: "#a78bfa", Icon: Bot,       left: 195, top: 133 },
  { id: "branch",  label: "Router",     sub: "Priority check",   color: "#f59e0b", Icon: GitBranch, left: 380, top: 133 },
  { id: "email",   label: "Send Email", sub: "To customer",      color: "#22c55e", Icon: Mail,      left: 565, top: 45  },
  { id: "db",      label: "Update DB",  sub: "Save record",      color: "#22c55e", Icon: Database,  left: 565, top: 220 },
  { id: "notify",  label: "Slack Alert",sub: "Notify team",      color: "#06b6d4", Icon: Bell,      left: 752, top: 133 },
];

const EDGE_PATHS: Record<string, string> = {
  e1: "M 140 170 L 195 170",
  e2: "M 325 170 L 380 170",
  e3: "M 510 157 C 538 157 548 82  565 82",
  e4: "M 510 183 C 538 183 548 257 565 257",
  e5: "M 695 257 C 724 257 724 170 752 170",
};

const EDGE_NODE_PAIRS: [string, string][] = [
  ["trigger", "ai"],
  ["ai", "branch"],
  ["branch", "email"],
  ["branch", "db"],
  ["db", "notify"],
];

export default function WorkflowDemo() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          if (s >= STEPS.length - 1) {
            setTimeout(() => setStep(0), 1600);
            return s;
          }
          return s + 1;
        });
      }, 2000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const current = STEPS[step];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-[#05070d] to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(6,182,212,0.04)_0%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-5"
          >
            <motion.div
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.55, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-sm text-white/50">Interactive demo</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Watch automation{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              happen live
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-white/40 text-lg max-w-xl mx-auto"
          >
            A real order-processing workflow — trigger to completion in under 2 seconds.
          </motion.p>
        </div>

        {/* ─── Unified app window ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="rounded-2xl border border-white/[0.07] overflow-hidden"
        >
          {/* ── Shared titlebar ── */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#080b14] border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <span className="ml-3 text-white/20 text-xs font-mono">
              order-processing.awf — AutoWeave
            </span>
            <div className="ml-auto flex items-center gap-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                animate={{
                  backgroundColor: running ? "#4ade80" : "rgba(255,255,255,0.2)",
                  opacity: running ? [1, 0.3, 1] : [0.35],
                }}
                transition={{ duration: 2, repeat: running ? Infinity : 0, ease: "easeInOut" }}
              />
              <span className="text-white/22 text-xs">{running ? "Running" : "Paused"}</span>
            </div>
          </div>

          {/* ── Sidebar + Canvas row ── */}
          <div className="flex min-h-[480px]">

            {/* ── LEFT SIDEBAR ── */}
            <div className="hidden lg:flex flex-col w-[210px] flex-shrink-0 bg-[#07090e] border-r border-white/[0.05]">

              {/* Sidebar header */}
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
                <p className="text-[10px] font-semibold text-white/28 uppercase tracking-widest mb-1.5">
                  Execution steps
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-sm font-medium text-white/75 leading-snug"
                  >
                    {current.label}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Timeline */}
              <div className="flex-1 py-4 relative">
                {/* Vertical guide line */}
                <div
                  className="absolute top-7 bottom-7 w-px bg-white/[0.05]"
                  style={{ left: "27px" }}
                />

                {STEPS.map((s, i) => {
                  const isDone    = i < step;
                  const isCurrent = i === step;
                  const isPending = i > step;

                  return (
                    <button
                      key={i}
                      onClick={() => { setStep(i); setRunning(false); }}
                      className="w-full flex items-start gap-3 px-4 py-2.5 text-left group relative"
                    >
                      {/* Circle indicator sitting on the guide line */}
                      <div className="relative z-10 flex-shrink-0 w-5 h-5 mt-px flex items-center justify-center">
                        <motion.div
                          className="w-5 h-5 rounded-full border flex items-center justify-center"
                          animate={{
                            borderColor: isCurrent
                              ? "#06b6d4"
                              : isDone
                              ? "rgba(255,255,255,0.18)"
                              : "rgba(255,255,255,0.07)",
                            backgroundColor: isCurrent
                              ? "rgba(6,182,212,0.12)"
                              : isDone
                              ? "rgba(255,255,255,0.04)"
                              : "transparent",
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isDone && (
                            <Check className="w-2.5 h-2.5 text-white/40" />
                          )}
                          {isCurrent && (
                            <motion.div
                              className="w-2 h-2 rounded-full bg-cyan-400"
                              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          {isPending && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/[0.08]" />
                          )}
                        </motion.div>
                      </div>

                      {/* Step label + description */}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <motion.p
                          animate={{
                            color: isCurrent
                              ? "rgba(255,255,255,0.85)"
                              : isDone
                              ? "rgba(255,255,255,0.38)"
                              : "rgba(255,255,255,0.16)",
                          }}
                          transition={{ duration: 0.25 }}
                          className="text-[12px] font-medium leading-none"
                        >
                          {s.label}
                        </motion.p>

                        <AnimatePresence initial={false}>
                          {isCurrent && (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="text-[10px] text-white/32 mt-1.5 leading-relaxed"
                            >
                              {s.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Controls pinned to bottom */}
              <div className="px-4 py-4 border-t border-white/[0.05] flex gap-2">
                <button
                  onClick={() => setRunning(r => !r)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors duration-150"
                >
                  {running
                    ? <><Pause className="w-3 h-3" /><span>Pause</span></>
                    : <><Play  className="w-3 h-3" /><span>Resume</span></>
                  }
                </button>
                <button
                  onClick={() => { setStep(0); setRunning(true); }}
                  className="w-9 flex items-center justify-center rounded-lg bg-white/[0.05] text-white/45 hover:bg-white/[0.1] hover:text-white transition-all duration-150"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── RIGHT: WORKFLOW CANVAS ── */}
            <div className="flex-1 flex flex-col bg-[#06080d]">
              <div className="flex-1 overflow-x-auto p-5">
                <div className="relative w-[900px] h-[400px]">

                  {/* Dot grid */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="aw-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="1" r="0.75" fill="rgba(255,255,255,0.055)" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#aw-dots)" />
                  </svg>

                  {/* Edges + particles */}
                  <svg
                    className="absolute inset-0 pointer-events-none overflow-visible"
                    width="900"
                    height="400"
                    viewBox="0 0 900 400"
                  >
                    <defs>
                      {Object.entries(EDGE_PATHS).map(([id, d]) => (
                        <path key={`d-${id}`} id={`ep-${id}`} d={d} />
                      ))}
                      <marker id="aw-arrow" markerWidth="7" markerHeight="5" refX="5" refY="2.5" orient="auto">
                        <polygon points="0 0, 7 2.5, 0 5" fill="rgba(6,182,212,0.5)" />
                      </marker>
                    </defs>

                    {Object.entries(EDGE_PATHS).map(([id, d], i) => {
                      const [from, to] = EDGE_NODE_PAIRS[i];
                      const isActive  = current.active.includes(from) && current.active.includes(to);
                      const isFlowing = current.flowing.includes(id);

                      return (
                        <g key={id}>
                          {/* Always-visible dashed base */}
                          <path
                            d={d}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                          {/* Draw-in active line */}
                          {isActive && (
                            <motion.path
                              d={d}
                              fill="none"
                              stroke="#06b6d4"
                              strokeWidth="1.8"
                              strokeOpacity={0.45}
                              markerEnd="url(#aw-arrow)"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          )}
                          {/* Flowing particles */}
                          {isFlowing && [0, 0.38, 0.72].map(offset => (
                            <circle key={offset} r="3" fill="#06b6d4" opacity={0.8}>
                              <animateMotion
                                dur="1.1s"
                                begin={`${offset * 1.1}s`}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#ep-${id}`} />
                              </animateMotion>
                            </circle>
                          ))}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {NODES.map(node => {
                    const isActive = current.active.includes(node.id);
                    return (
                      <div
                        key={node.id}
                        className="absolute"
                        style={{ left: node.left, top: node.top, width: 130, height: 74 }}
                      >
                        <motion.div
                          className="w-full h-full rounded-xl border flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                          animate={{
                            opacity:         isActive ? 1 : 0.22,
                            scale:           isActive ? 1 : 0.96,
                            borderColor:     isActive ? `${node.color}65` : "rgba(255,255,255,0.07)",
                            backgroundColor: isActive ? `${node.color}0e` : "rgba(255,255,255,0.015)",
                            boxShadow:       isActive
                              ? `0 0 22px ${node.color}20, 0 0 6px ${node.color}12`
                              : "0 0 0px transparent",
                          }}
                          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              style={{ background: `radial-gradient(circle at 50% 35%, ${node.color}16, transparent 65%)` }}
                              animate={{ opacity: [0.4, 0.85, 0.4] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                          <motion.div
                            animate={{ color: isActive ? node.color : "rgba(255,255,255,0.18)" }}
                            transition={{ duration: 0.4 }}
                            className="relative z-10"
                          >
                            <node.Icon className="w-4 h-4" />
                          </motion.div>
                          <motion.span
                            animate={{ color: isActive ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.2)" }}
                            transition={{ duration: 0.4 }}
                            className="text-[11px] font-semibold relative z-10"
                          >
                            {node.label}
                          </motion.span>
                          <span className="text-[9px] text-white/22 relative z-10">{node.sub}</span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canvas footer: progress */}
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center gap-3">
                <span className="text-white/20 text-xs font-mono tabular-nums">
                  {step + 1}/{STEPS.length}
                </span>
                <div className="flex-1 flex gap-1">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-[3px] flex-1 rounded-full"
                      animate={{ backgroundColor: i <= step ? "#06b6d4" : "rgba(255,255,255,0.07)" }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <span className="text-white/20 text-xs font-mono">
                  {step === STEPS.length - 1 ? "1.8s elapsed" : `step ${step + 1}`}
                </span>
              </div>

              {/* Mobile-only controls (sidebar hidden on mobile) */}
              <div className="flex lg:hidden items-center gap-2 px-5 py-3 border-t border-white/[0.04]">
                <button
                  onClick={() => setRunning(r => !r)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
                >
                  {running ? <><Pause className="w-3 h-3" /><span>Pause</span></> : <><Play className="w-3 h-3" /><span>Resume</span></>}
                </button>
                <button
                  onClick={() => { setStep(0); setRunning(true); }}
                  className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:bg-white/[0.1] transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="ml-auto text-white/25 text-xs font-medium">{current.label}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-white/28 text-sm mb-5">Build workflows like this in minutes, not days.</p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-500 text-black rounded-xl font-bold hover:bg-cyan-400 transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-cyan-500/20"
          >
            Build your first workflow free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
