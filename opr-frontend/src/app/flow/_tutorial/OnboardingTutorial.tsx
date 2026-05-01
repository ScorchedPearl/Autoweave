"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, CheckCircle2, BookOpen } from "lucide-react";
import { useUser } from "@/provider/userprovider";
import { useDragContext } from "@/provider/dragprovider";
import { useWorkflow } from "@/provider/statecontext";
import { useFlowState } from "@/provider/flowstatecontext";

function tutorialKey(email?: string | null) {
  return `aw_tutorial_v3_${(email ?? "guest").replace(/\W/g, "_")}`;
}

interface TCtx {
  isPaletteOpen: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodes: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edges: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedNode: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  returnVariableTags: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workflowResult: any;
}

interface Step {
  id: string;
  emoji: string;
  title: string;
  body: string;
  code?: string;
  target?: string;
  check?: (ctx: TCtx) => boolean;
  waitLabel?: string;
  manualNext?: boolean;
}

/* ── PART 1: UI Tour (manual "Got it") ── */
const UI_TOUR: Step[] = [
  {
    id: "welcome",
    emoji: "👋",
    title: "Welcome to AutoWeave!",
    body: "AutoWeave lets you visually connect powerful nodes to automate tasks — no code needed. Let's take a quick tour of the interface, then build a real workflow together!",
    manualNext: true,
  },
  {
    id: "tour-canvas",
    emoji: "🎨",
    title: "The Canvas",
    body: "The large area behind this card is your canvas. Drag nodes here to build pipelines. Pan by dragging the background, zoom with your scroll wheel.",
    manualNext: true,
  },
  {
    id: "tour-sidebar",
    emoji: "📋",
    title: "Left Sidebar",
    body: "The sidebar on the left is your control centre. It has quick actions like New Workflow, Save, and Run Workflow. You can also manage Return Variables here — those are values nodes expose for other nodes to use.",
    target: "tutorial-sidebar",
    manualNext: true,
  },
  {
    id: "tour-palette-btn",
    emoji: "📦",
    title: "Node Library Button",
    body: "See the ⊞ button in the top-right? Clicking it opens the Node Library — your toolbox with every available node: HTTP calls, AI models, calculators, Gmail, databases, and more.",
    target: "tutorial-add-button",
    manualNext: true,
  },
  {
    id: "tour-properties",
    emoji: "⚙️",
    title: "Properties Panel",
    body: "When you click any node on the canvas, its configuration opens in this Properties Panel. You can set inputs, add return variables, and inject values from other nodes using {{variable}} syntax.",
    target: "tutorial-properties",
    manualNext: true,
  },
  {
    id: "tour-return-vars",
    emoji: "📌",
    title: "Return Variables",
    body: "Return Variables are values a node produces that you want to pass downstream. Add them in the Properties Panel. Once added, any later node can reference them as {{result}}, {{responseBody}}, etc.",
    target: "tutorial-sidebar",
    manualNext: true,
  },
  {
    id: "tour-ready",
    emoji: "🚀",
    title: "Let's Build Something Real!",
    body: "Now that you know your way around, let's build a real workflow:\n① A Calculator node computes 3 × 3 = 9\n② An HTTP GET node fetches a cat fact using that 9\n\nReady? Follow the steps — the tutorial will detect each action automatically!",
    manualNext: true,
  },
];

/* ── PART 2: Workflow build (auto-detected) ── */
const BUILD_STEPS: Step[] = [
  {
    id: "open-palette",
    emoji: "📦",
    title: "Open the Node Library",
    body: "Click the ⊞ button in the top-right corner to open the Node Library.",
    target: "tutorial-add-button",
    check: (ctx) => ctx.isPaletteOpen === true,
    waitLabel: "Waiting for you to open the Node Library…",
  },
  {
    id: "add-calculator",
    emoji: "🧮",
    title: "Add a Calculator Node",
    body: "Search for \"Calculator\" in the library, then click the card to add it to the canvas.",
    target: "tutorial-palette-overlay",
    check: (ctx) => ctx.nodes.some((n) => n.data?.nodeType === "calculator"),
    waitLabel: "Waiting for Calculator node on canvas…",
  },
  {
    id: "select-calculator",
    emoji: "👆",
    title: "Select the Calculator Node",
    body: "Click on the Calculator node you just placed. Its settings will open in the Properties Panel on the right.",
    check: (ctx) => ctx.selectedNode?.data?.nodeType === "calculator",
    waitLabel: "Waiting for you to click the Calculator node…",
  },
  {
    id: "set-expression",
    emoji: "✏️",
    title: "Set the Expression",
    body: "In the Properties Panel, find the Expression field and type the formula below. Then click Save.",
    code: "3 * 3",
    target: "tutorial-properties",
    check: (ctx) => {
      const calcNode = ctx.nodes.find((n) => n.data?.nodeType === "calculator");
      const expr = (calcNode?.data?.configuration?.expression || calcNode?.data?.config?.expression) as string | undefined;
      if (!expr) return false;
      const clean = expr.replace(/\s/g, "");
      return clean === "3*3" || clean === "9";
    },
    waitLabel: "Waiting for expression to be set…",
  },
  {
    id: "info-return-var",
    emoji: "📌",
    title: "Return Variables — Auto Exposed!",
    body: "The Calculator node automatically exposes a variable called result after it runs — no action needed from you.\n\nDownstream nodes can reference it as {{result}} and the engine replaces it with the actual computed value at runtime.",
    code: "{{result}}  →  9",
    target: "tutorial-properties",
    manualNext: true,
  },
  {
    id: "add-http",
    emoji: "🌐",
    title: "Add an HTTP GET Node",
    body: "Open the Node Library again and search for \"HTTP GET\". Click it to add it to the canvas, to the right of the Calculator.",
    target: "tutorial-palette-overlay",
    check: (ctx) => ctx.nodes.some((n) => n.data?.nodeType === "httpGet"),
    waitLabel: "Waiting for HTTP GET node on canvas…",
  },
  {
    id: "connect",
    emoji: "🔗",
    title: "Connect the Nodes",
    body: "Hover the right edge of the Calculator node — a small circle handle appears. Drag from it to the left handle of the HTTP GET node to connect them.",
    check: (ctx) => ctx.edges.length > 0,
    waitLabel: "Waiting for a connection to be drawn…",
  },
  {
    id: "configure-http",
    emoji: "🔧",
    title: "Configure the URL",
    body: "Click the HTTP GET node, open Properties, and paste this URL. Then click Save! The {{result}} token will be replaced with 9 at runtime.",
    code: "https://catfact.ninja/fact?query={{result}}",
    target: "tutorial-properties",
    check: (ctx) => {
      const httpNode = ctx.nodes.find((n) => n.data?.nodeType === "httpGet");
      const url = (httpNode?.data?.configuration?.url || httpNode?.data?.config?.url) as string | undefined;
      return !!(url && url.includes("catfact.ninja"));
    },
    waitLabel: "Waiting for URL to be set…",
  },
  {
    id: "run",
    emoji: "▶️",
    title: "Run Your Workflow!",
    body: "Click the cyan \"Run Workflow\" button in the left sidebar. Watch the progress HUD light up at the top of the screen!",
    target: "tutorial-sidebar",
    check: (ctx) => !!ctx.workflowResult,
    waitLabel: "Waiting for workflow to complete…",
  },
  {
    id: "done",
    emoji: "🎉",
    title: "You Built a Real Workflow!",
    body: "You computed 3×3=9, injected that result into an HTTP call, and got a live cat fact back. You're ready to build anything — chain AI nodes, Gmail, databases, and more!",
    manualNext: true,
  },
];

const ALL_STEPS: Step[] = [...UI_TOUR, ...BUILD_STEPS];

/* ── Spotlight cutout + brightness booster ── */
function Spotlight({ targetId, padding = 12 }: { targetId?: string; padding?: number }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetId) { setRect(null); return; }
    const update = () => {
      const el = document.querySelector(`[data-tutorial-id="${targetId}"]`);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    const id = setInterval(update, 150);
    window.addEventListener("resize", update);
    return () => { clearInterval(id); window.removeEventListener("resize", update); };
  }, [targetId]);

  return (
    <>
      {/* Dark veil over entire screen */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(0,0,0,0.60)", pointerEvents: "none" }} />

      {rect && (
        <>
          {/* Cutout — removes the dark veil over the target */}
          <motion.div
            key={targetId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              top: rect.top - padding,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
              borderRadius: 14,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.60)",
              zIndex: 9991,
              pointerEvents: "none",
              border: "2px solid rgba(6,182,212,0.85)",
            }}
          />

          {/* Brightness booster — glowing layer on top of the element so it's actually LIT */}
          <motion.div
            key={`boost-${targetId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: rect.top - padding,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
              borderRadius: 14,
              zIndex: 9993,
              pointerEvents: "none",
              background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(167,139,250,0.07) 100%)",
              boxShadow: "inset 0 0 30px rgba(6,182,212,0.18), 0 0 60px rgba(6,182,212,0.45)",
            }}
          />

          {/* Animated outer ring */}
          <motion.div
            style={{
              position: "fixed",
              top: rect.top - padding - 7,
              left: rect.left - padding - 7,
              width: rect.width + padding * 2 + 14,
              height: rect.height + padding * 2 + 14,
              borderRadius: 20,
              border: "2px solid rgba(6,182,212,0.4)",
              zIndex: 9992,
              pointerEvents: "none",
            }}
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0.15, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </>
      )}
    </>
  );
}

/* ── Bouncing arrow ── */
function BounceArrow({ targetId }: { targetId?: string }) {
  const [pos, setPos] = useState<{ x: number; y: number; side: "right" | "top" } | null>(null);

  useEffect(() => {
    if (!targetId) { setPos(null); return; }
    const update = () => {
      const el = document.querySelector(`[data-tutorial-id="${targetId}"]`);
      if (!el) { setPos(null); return; }
      const r = el.getBoundingClientRect();
      if (r.left > window.innerWidth * 0.55) {
        setPos({ x: r.left - 44, y: r.top + r.height / 2, side: "right" });
      } else {
        setPos({ x: r.left + r.width / 2, y: r.top - 40, side: "top" });
      }
    };
    update();
    const id = setInterval(update, 200);
    window.addEventListener("resize", update);
    return () => { clearInterval(id); window.removeEventListener("resize", update); };
  }, [targetId]);

  if (!pos) return null;

  return (
    <motion.div
      key={targetId}
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 9993,
        pointerEvents: "none", fontSize: 26,
        transform: pos.side === "right" ? "translateY(-50%)" : "translateX(-50%)",
      }}
      animate={pos.side === "right" ? { x: [0, -10, 0] } : { y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 0.75, ease: "easeInOut" }}
    >
      {pos.side === "right" ? "👉" : "👇"}
    </motion.div>
  );
}

/* ── Progress dots ── */
function Dots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{
            width: i === current ? 18 : 5,
            backgroundColor: i < current ? "#22c55e" : i === current ? "#06b6d4" : "rgba(255,255,255,0.12)",
          }}
          transition={{ duration: 0.3 }}
          style={{ height: 5, borderRadius: 3 }}
        />
      ))}
    </div>
  );
}

/* ── Action success flash ── */
function ActionFlash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1300);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      style={{
        position: "fixed", bottom: 38, left: "50%", zIndex: 10001,
        transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "13px 22px", borderRadius: 16,
        background: "rgba(4,22,10,0.97)",
        border: "1px solid rgba(34,197,94,0.7)",
        boxShadow: "0 0 40px rgba(34,197,94,0.3), 0 20px 60px rgba(0,0,0,0.8)",
        backdropFilter: "blur(24px)",
      }}
    >
      <motion.span
        animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 22 }}
      >✅</motion.span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>Nice work! Moving to next step…</span>
    </motion.div>
  );
}

/* ── Tutorial card ── */
function TutorialCard({
  step, stepIndex, total, isWaiting, onNext, onSkip,
}: {
  step: Step; stepIndex: number; total: number;
  isWaiting: boolean; onNext: () => void; onSkip: () => void;
}) {
  const isLast = stepIndex === total - 1;
  const showNextBtn = !!step.manualNext || isLast;
  const isUITour = stepIndex < UI_TOUR.length;

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{
        position: "fixed", bottom: 32, left: "50%",
        zIndex: 10000, width: 460, transform: "translateX(-50%)",
        background: "rgba(4,7,15,0.97)",
        border: `1px solid ${isUITour ? "rgba(167,139,250,0.4)" : "rgba(6,182,212,0.4)"}`,
        borderRadius: 22, backdropFilter: "blur(28px)",
        boxShadow: `0 32px 80px rgba(0,0,0,0.85), 0 0 50px ${isUITour ? "rgba(167,139,250,0.1)" : "rgba(6,182,212,0.12)"}`,
        overflow: "hidden",
      }}
    >
      {/* Rainbow top bar */}
      <motion.div
        style={{
          height: 3,
          background: isUITour
            ? "linear-gradient(90deg,#a78bfa,#f59e0b,#a78bfa)"
            : "linear-gradient(90deg,#06b6d4,#a78bfa,#06b6d4)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />

      <div style={{ padding: "20px 22px 18px" }}>
        {/* Section badge */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 6,
            background: isUITour ? "rgba(167,139,250,0.15)" : "rgba(6,182,212,0.12)",
            color: isUITour ? "#a78bfa" : "#06b6d4",
            border: `1px solid ${isUITour ? "rgba(167,139,250,0.3)" : "rgba(6,182,212,0.25)"}`,
          }}>
            {isUITour ? `🗺️ Interface Tour · ${stepIndex + 1} / ${UI_TOUR.length}` : `🔨 Build Workflow · ${stepIndex - UI_TOUR.length + 1} / ${BUILD_STEPS.length}`}
          </span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.span
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              style={{ fontSize: 30 }}
            >{step.emoji}</motion.span>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "white", lineHeight: 1.2, margin: 0 }}>
              {step.title}
            </h2>
          </div>
          <button onClick={onSkip} style={{ padding: 6, borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "pointer", flexShrink: 0 }}>
            <X size={13} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: "0 0 12px 0", whiteSpace: "pre-line" }}>
          {step.body}
        </p>

        {step.code && (
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, padding: "10px 14px", borderRadius: 10, marginBottom: 12, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#67e8f9", userSelect: "all" }}>
            {step.code}
          </div>
        )}

        {isWaiting && step.waitLabel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
              style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, border: "2px solid rgba(6,182,212,0.2)", borderTopColor: "#06b6d4" }}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{step.waitLabel}</span>
          </motion.div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Dots current={stepIndex} total={total} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onSkip} style={{ padding: "6px 12px", borderRadius: 9, fontSize: 11, fontWeight: 600, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
              Skip tour
            </button>
            {showNextBtn && (
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={isLast ? onSkip : onNext}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "8px 18px",
                  borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: isUITour ? "linear-gradient(135deg,rgba(167,139,250,0.25),rgba(167,139,250,0.12))" : "linear-gradient(135deg,rgba(6,182,212,0.28),rgba(6,182,212,0.12))",
                  border: isUITour ? "1px solid rgba(167,139,250,0.55)" : "1px solid rgba(6,182,212,0.55)",
                  color: isUITour ? "#c4b5fd" : "#67e8f9",
                  boxShadow: isUITour ? "0 0 18px rgba(167,139,250,0.15)" : "0 0 18px rgba(6,182,212,0.18)",
                }}
              >
                {isLast ? <><CheckCircle2 size={13} />Start Building!</> : <>Got it <ChevronRight size={13} /></>}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Context hook ── */
function useTutorialCtx(): TCtx {
  const { isPaletteOpen, nodes, edges } = useDragContext();
  const { selectedNode, returnVariableTags } = useWorkflow();
  const { workflowResult } = useFlowState();
  return {
    isPaletteOpen: !!isPaletteOpen,
    nodes: nodes ?? [],
    edges: edges ?? [],
    selectedNode,
    returnVariableTags: returnVariableTags ?? [],
    workflowResult,
  };
}

/* ── Main component ── */
export function OnboardingTutorial() {
  const { currentUser, isLoading } = useUser();
  const ctx = useTutorialCtx();
  // *** KEY FIX: keep a ref so interval callbacks always read fresh context ***
  const ctxRef = useRef<TCtx>(ctx);
  useEffect(() => { ctxRef.current = ctx; });

  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const advancingRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!localStorage.getItem(tutorialKey(currentUser?.email))) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, [mounted, isLoading, currentUser?.email]);

  const finish = useCallback(() => {
    localStorage.setItem(tutorialKey(currentUser?.email), "1");
    setVisible(false);
  }, [currentUser?.email]);

  const advance = useCallback(() => {
    advancingRef.current = false;
    setStepIndex((i) => {
      const next = i + 1;
      if (next >= ALL_STEPS.length) { finish(); return i; }
      return next;
    });
  }, [finish]);

  /* Poll with ctxRef so it always has fresh values — fixes the stale closure bug */
  useEffect(() => {
    if (!visible) return;
    const step = ALL_STEPS[stepIndex];
    if (!step.check || step.manualNext) return;
    advancingRef.current = false;

    const id = setInterval(() => {
      if (advancingRef.current) return;
      if (step.check!(ctxRef.current)) {
        advancingRef.current = true;
        clearInterval(id);
        setShowFlash(true);
      }
    }, 400);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, stepIndex]);

  if (!mounted || !visible) return null;

  const step = ALL_STEPS[stepIndex];
  const hasCheck = !!step.check && !step.manualNext;

  return (
    <AnimatePresence mode="wait">
      <>
        <Spotlight targetId={step.target} />
        {step.target && !showFlash && <BounceArrow targetId={step.target} />}

        {showFlash && (
          <ActionFlash onDone={() => { setShowFlash(false); advance(); }} />
        )}

        {!showFlash && (
          <TutorialCard
            step={step}
            stepIndex={stepIndex}
            total={ALL_STEPS.length}
            isWaiting={hasCheck}
            onNext={advance}
            onSkip={finish}
          />
        )}
      </>
    </AnimatePresence>
  );
}

/* ── Replay button ── */
export function TutorialReplayButton() {
  const { currentUser } = useUser();
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(!!localStorage.getItem(tutorialKey(currentUser?.email)));
  }, [currentUser?.email]);
  if (!done) return null;
  return (
    <button
      onClick={() => { localStorage.removeItem(tutorialKey(currentUser?.email)); window.location.reload(); }}
      title="Replay tutorial"
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9", cursor: "pointer" }}
    >
      <BookOpen size={12} /> Tutorial
    </button>
  );
}
