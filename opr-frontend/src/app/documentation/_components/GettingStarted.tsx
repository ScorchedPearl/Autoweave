"use client";

import { useState } from "react";
import { Terminal, LogIn, GitBranch, Plug, Zap, CheckCircle2, ChevronRight, Layers, Shield, Globe } from "lucide-react";

const steps = [
  {
    icon: <LogIn className="w-5 h-5" />,
    label: "Sign In",
    detail: "Authenticate with email + OTP or Google OAuth",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/30",
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    label: "New Workflow",
    detail: 'Click "New Workflow" on the dashboard',
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    label: "Add Nodes",
    detail: "Drag nodes from the palette onto the canvas",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  {
    icon: <Plug className="w-5 h-5" />,
    label: "Connect",
    detail: "Draw edges between node handles to define flow",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    label: "Deploy & Run",
    detail: "Save, deploy, and watch your workflow execute live",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
];

const features = [
  { icon: <Layers className="w-4 h-4" />, label: "Visual Drag-and-Drop Editor", color: "text-cyan-400" },
  { icon: <Globe className="w-4 h-4" />, label: "LangChain AI Integration", color: "text-purple-400" },
  { icon: <Plug className="w-4 h-4" />, label: "Google Calendar & Gmail", color: "text-green-400" },
  { icon: <Zap className="w-4 h-4" />, label: "Real-Time Execution Tracking", color: "text-orange-400" },
  { icon: <Shield className="w-4 h-4" />, label: "OTP-Secured Authentication", color: "text-pink-400" },
  { icon: <Terminal className="w-4 h-4" />, label: "Kafka + Redis Orchestration", color: "text-yellow-400" },
];

export default function GettingStarted() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          Quick Start
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Getting Started with AutoWeave</h2>
        <p className="text-muted-foreground max-w-2xl">
          AutoWeave is a visual workflow automation platform — build, connect, and execute autonomous AI pipelines without writing backend code.
        </p>
      </div>

      {/* Architecture strip */}
      <div className="rounded-xl border border-border bg-background/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Stack Overview</p>
        <div className="flex flex-wrap gap-2">
          {["Next.js Frontend", "Spring Boot API", "FastAPI / LangChain", "Kafka Events", "Redis Context", "Google Cloud"].map((t) => (
            <span key={t} className="rounded-md border border-border bg-card px-3 py-1 text-xs font-mono text-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive quickstart */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Quick Start — 5 Steps</p>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Step list */}
          <div className="flex flex-col gap-2 md:w-56 flex-shrink-0">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeStep === i
                    ? `${step.bg} ${step.color} border-current`
                    : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <span className={`flex-shrink-0 ${activeStep === i ? step.color : "text-muted-foreground"}`}>
                  {step.icon}
                </span>
                <span>{step.label}</span>
                {activeStep === i && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </button>
            ))}
          </div>

          {/* Step detail */}
          <div className={`flex-1 rounded-xl border p-6 ${steps[activeStep].bg}`}>
            <div className={`mb-3 flex items-center gap-3 ${steps[activeStep].color}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-current bg-current/10">
                {steps[activeStep].icon}
              </span>
              <span className="text-lg font-semibold">{`Step ${activeStep + 1} — ${steps[activeStep].label}`}</span>
            </div>
            <p className="text-sm text-muted-foreground">{steps[activeStep].detail}</p>

            {/* Visual flow connector */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                      i < activeStep
                        ? "border-green-500/50 bg-green-500/20 text-green-400"
                        : i === activeStep
                        ? `border-current bg-current/20 ${steps[activeStep].color}`
                        : "border-border bg-background/40 text-muted-foreground"
                    }`}
                  >
                    {i < activeStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-8 ${i < activeStep ? "bg-green-500/40" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Key Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3">
              <span className={f.color}>{f.icon}</span>
              <span className="text-sm text-foreground">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-500 mb-1">Pro Tip</p>
        <p className="text-sm text-muted-foreground">
          Start with a simple two-node workflow — a <span className="text-foreground font-medium">Webhook Trigger</span> → <span className="text-foreground font-medium">Send Email</span> — to get familiar with connections before adding AI nodes.
        </p>
      </div>
    </div>
  );
}
