"use client";

import { useState } from "react";
import { Bot, Sparkles, GitBranch, ArrowRight, CheckCircle2 } from "lucide-react";

const aiNodes = [
  {
    id: "claude",
    name: "Claude AI",
    provider: "Anthropic",
    color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    capabilities: ["Text summarisation", "Sentiment analysis", "Content generation", "Email drafting", "Data extraction"],
    config: `{
  "model": "claude-sonnet-4-6",
  "prompt": "Summarise the following and classify sentiment:",
  "temperature": 0.3,
  "max_tokens": 512
}`,
    example: "Summarise customer feedback and route hot leads",
  },
  {
    id: "gpt",
    name: "GPT Integration",
    provider: "OpenAI",
    color: "border-green-500/50 bg-green-500/10 text-green-300",
    badge: "border-green-500/30 bg-green-500/10 text-green-400",
    capabilities: ["Creative writing", "Problem solving", "Code generation", "Translation", "Brainstorming"],
    config: `{
  "model": "gpt-4o",
  "prompt": "Generate a personalised reply for:",
  "temperature": 0.7,
  "max_tokens": 1024
}`,
    example: "Draft personalised email responses from inquiry payloads",
  },
  {
    id: "classify",
    name: "Classify",
    provider: "LangChain",
    color: "border-purple-500/50 bg-purple-500/10 text-purple-300",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    capabilities: ["Spam detection", "Priority routing", "Anomaly detection", "Ticket categorisation", "Custom labels"],
    config: `{
  "categories": ["urgent", "normal", "spam"],
  "field": "$.body",
  "fallback": "normal"
}`,
    example: "Route support tickets to the right team automatically",
  },
];

const patterns = [
  { title: "Chain AI Nodes", desc: "Pass one AI's output as the next AI's input for multi-stage reasoning", icon: <ArrowRight className="h-4 w-4" /> },
  { title: "Conditional Routing", desc: "Use Classify output to branch into specialised processing paths", icon: <GitBranch className="h-4 w-4" /> },
  { title: "Error Fallback", desc: "Connect AI error outputs to a fallback node or manual review queue", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function AINodes() {
  const [active, setActive] = useState("claude");
  const node = aiNodes.find((n) => n.id === active)!;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 mb-4">
          <Bot className="h-3 w-3" />
          LangChain Powered
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">AI-Powered Nodes</h2>
        <p className="text-muted-foreground max-w-2xl">
          Inject intelligence at any point in your workflow. AI nodes process data through LLMs, enabling autonomous reasoning without code.
        </p>
      </div>

      {/* Node selector + config panel */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Selector */}
        <div className="flex flex-col gap-2">
          {aiNodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                active === n.id ? n.color : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              <Bot className={`h-4 w-4 flex-shrink-0 ${active === n.id ? "" : "text-muted-foreground"}`} />
              <div>
                <p className="font-semibold text-xs">{n.name}</p>
                <p className="text-[10px] opacity-60">{n.provider}</p>
              </div>
              {active === n.id && <span className={`ml-auto rounded-full border px-2 py-0.5 text-[9px] font-medium ${n.badge}`}>active</span>}
            </button>
          ))}
        </div>

        {/* Config panel */}
        <div className="md:col-span-2 rounded-xl border border-border bg-background/60 overflow-hidden">
          <div className="border-b border-border bg-card/60 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2 font-mono">{node.name} · config.json</span>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${node.badge}`}>{node.provider}</span>
          </div>
          <pre className="px-5 py-4 text-xs font-mono text-green-300 overflow-x-auto leading-relaxed">
            {node.config}
          </pre>
        </div>
      </div>

      {/* Capabilities + example */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-background/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <p className="text-sm font-semibold text-foreground">{node.name} · Capabilities</p>
          </div>
          <div className="space-y-2">
            {node.capabilities.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Example workflow</p>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
              <p className="text-[9px] opacity-60 uppercase">Trigger</p>
              Webhook
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <div className={`rounded border px-3 py-2 text-xs ${node.color}`}>
              <p className="text-[9px] opacity-60 uppercase">AI</p>
              {node.name}
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <div className="rounded border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
              <p className="text-[9px] opacity-60 uppercase">Action</p>
              Send Email
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{node.example}</p>
        </div>
      </div>

      {/* How to use */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Adding an AI Node</p>
        <div className="grid sm:grid-cols-5 gap-2">
          {["Drag AI node to canvas", "Open config panel", "Set prompt / model", "Connect input from prior node", "Wire output to next node"].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-background/40 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-muted-foreground">{i + 1}</span>
              <p className="text-xs text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced patterns */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Advanced Patterns</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {patterns.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">{p.icon}<p className="text-sm font-semibold text-foreground">{p.title}</p></div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
