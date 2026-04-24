"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Zap, Bot, Database } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

function useTypewriter(words: string[], typeSpeed = 75, deleteSpeed = 45, pauseMs = 2400) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIndex];
    let t: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayed.length < word.length) {
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), typeSpeed);
    } else if (!isDeleting && displayed.length === word.length) {
      t = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayed.length > 0) {
      t = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), deleteSpeed);
    } else {
      setIsDeleting(false);
      setWordIndex(i => (i + 1) % words.length);
    }
    return () => clearTimeout(t);
  }, [displayed, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseMs]);

  return displayed;
}

const PHASE_COUNT = 4;

const WorkflowCard = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % PHASE_COUNT), 1500);
    return () => clearInterval(id);
  }, []);

  const nodes = [
    { label: "Webhook", sub: "Trigger", color: "#06b6d4", Icon: Zap, activeAt: 1, x: 0 },
    { label: "AI Agent", sub: "Classify", color: "#a78bfa", Icon: Bot, activeAt: 2, x: 140 },
    { label: "Execute", sub: "Database", color: "#22c55e", Icon: Database, activeAt: 3, x: 280 },
  ];

  const edges = [
    { id: "he1", d: "M 100 45 L 140 45", activeAt: 2 },
    { id: "he2", d: "M 240 45 L 280 45", activeAt: 3 },
  ];

  const statusLabel = phase === 0 ? "Idle" : phase === 1 ? "Triggered" : phase === 2 ? "Processing" : "Complete";

  return (
    <div className="bg-[#07090e] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
      <div className="flex items-center px-4 py-3 border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-white/20 text-xs font-mono tracking-tight">
          order-flow.awf — AutoWeave
        </span>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] text-white/25 font-medium">Active</span>
        </div>
      </div>

      <div className="px-6 pt-7 pb-5 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative w-[380px] h-[90px] mx-auto">
          {nodes.map((node, i) => {
            const isActive = phase >= node.activeAt;
            return (
              <motion.div
                key={i}
                className="absolute top-0 w-[100px] h-full rounded-xl border flex flex-col items-center justify-center gap-1 overflow-hidden"
                style={{ left: node.x }}
                animate={{
                  borderColor: isActive ? `${node.color}65` : "rgba(255,255,255,0.07)",
                  backgroundColor: isActive ? `${node.color}10` : "rgba(255,255,255,0.02)",
                  boxShadow: isActive ? `0 0 18px ${node.color}22` : "0 0 0px transparent",
                }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 35%, ${node.color}1a, transparent 65%)` }}
                    animate={{ opacity: [0.4, 0.85, 0.4] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <motion.div
                  animate={{ color: isActive ? node.color : "rgba(255,255,255,0.2)" }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10"
                >
                  <node.Icon className="w-[15px] h-[15px]" />
                </motion.div>
                <motion.span
                  animate={{ color: isActive ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.18)" }}
                  transition={{ duration: 0.4 }}
                  className="text-[11px] font-semibold relative z-10"
                >
                  {node.label}
                </motion.span>
                <span className="text-[9px] text-white/22 relative z-10">{node.sub}</span>
              </motion.div>
            );
          })}

          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            width="380"
            height="90"
            viewBox="0 0 380 90"
          >
            <defs>
              {edges.map(e => (
                <path key={`d-${e.id}`} id={e.id} d={e.d} />
              ))}
            </defs>
            {edges.map(e => {
              const isActive = phase >= e.activeAt;
              return (
                <g key={e.id}>
                  <path
                    d={e.d}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {isActive && (
                    <motion.path
                      d={e.d}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeOpacity={0.45}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                  {isActive && [0, 0.52].map(offset => (
                    <circle key={offset} r="2.5" fill="#06b6d4" opacity={0.88}>
                      <animateMotion
                        dur="0.55s"
                        begin={`${offset * 0.55}s`}
                        repeatCount="indefinite"
                      >
                        <mpath href={`#${e.id}`} />
                      </animateMotion>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          {Array.from({ length: PHASE_COUNT }, (_, i) => (
            <motion.div
              key={i}
              className="h-[3px] rounded-full"
              animate={{
                width: phase === i ? "32px" : "10px",
                backgroundColor: phase > i ? "#06b6d4" : phase === i ? "#06b6d4" : "rgba(255,255,255,0.08)",
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          ))}
          <span className="ml-auto text-[10px] text-white/25 font-mono">{statusLabel}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Execution", value: "1.8s" },
            { label: "Success", value: "99.9%" },
            { label: "Queue", value: "0 ms" },
          ].map(m => (
            <div key={m.label} className="bg-white/[0.028] border border-white/[0.05] rounded-lg px-3 py-2">
              <div className="text-[9px] text-white/22 mb-0.5 uppercase tracking-wide">{m.label}</div>
              <div className="text-xs text-white/65 font-semibold font-mono">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WORDS = ["Workflows", "AI Agents", "Pipelines", "Automations"];

const Hero = () => {
  const word = useTypewriter(WORDS);

  return (
    <section
      id="hero"
      className="relative min-h-screen bg-background overflow-hidden flex items-center"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.13)_0%,transparent_70%)]" />
      </div>

      <motion.div
        className="absolute top-1/3 left-[8%] w-[480px] h-[480px] rounded-full blur-[130px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-[5%] w-[380px] h-[380px] rounded-full blur-[110px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
            >
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.45, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-sm text-muted-foreground">Live and in production</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05]"
            >
              <span className="text-foreground">Build Agentic</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                {word}
                <span className="typewriter-cursor text-cyan-500" aria-hidden>|</span>
              </span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-[2.6rem] font-semibold leading-snug">
                without a line of code
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed"
            >
              Deploy autonomous AI agents that think, decide, and execute complex tasks.
              Visual workflow builder for modern teams who move fast.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/auth">
                <Button
                  size="lg"
                  className="group bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base rounded-xl font-bold transition-all duration-250 hover:scale-[1.03] shadow-lg shadow-primary/20"
                >
                  Start building free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Button>
              </Link>
              <Link href="/flow">
                <Button
                  variant="outline"
                  size="lg"
                  className="border border-border text-foreground hover:bg-secondary hover:border-foreground/20 px-8 py-6 text-base rounded-xl transition-all duration-250 bg-transparent"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Live playground
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap items-center gap-8"
            >
              {[
                { value: "2,400+", label: "workflows created" },
                { value: "1.8s", label: "avg execution" },
                { value: "99.9%", label: "uptime" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.3, duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
            className="hidden lg:block"
          >
            <WorkflowCard />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
