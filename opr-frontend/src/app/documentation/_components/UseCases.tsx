"use client";

import { useState } from "react";
import { Mail, Calendar, Database, FileText, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

const useCases = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email Automation",
    description: "Trigger emails automatically on form submissions or scheduled times.",
    accent: "cyan",
    pipeline: [
      { label: "Webhook Trigger", type: "Trigger", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
      { label: "Condition", type: "Logic", color: "border-orange-500/50 bg-orange-500/10 text-orange-300" },
      { label: "Claude AI", type: "AI", color: "border-green-500/50 bg-green-500/10 text-green-300" },
      { label: "Send Email", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
    ],
    details: [
      "POST webhook receives form payload",
      "Condition checks if email is valid domain",
      "AI drafts a personalized reply",
      "Email node delivers it to the recipient",
    ],
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    title: "Calendar & Scheduling",
    description: "Create and manage calendar events from workflow data.",
    accent: "purple",
    pipeline: [
      { label: "Schedule Trigger", type: "Trigger", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
      { label: "Claude AI", type: "AI", color: "border-green-500/50 bg-green-500/10 text-green-300" },
      { label: "Google Calendar", type: "Integration", color: "border-pink-500/50 bg-pink-500/10 text-pink-300" },
      { label: "Send Email", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
    ],
    details: [
      "Cron fires every weekday at 08:00",
      "AI summarises pending tasks from context",
      "Calendar node creates event for the day",
      "Email node sends agenda to attendees",
    ],
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Data Synchronisation",
    description: "Sync records between systems with AI-powered transformation.",
    accent: "green",
    pipeline: [
      { label: "API Trigger", type: "Trigger", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
      { label: "Claude AI", type: "AI", color: "border-green-500/50 bg-green-500/10 text-green-300" },
      { label: "Update DB", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
      { label: "Send Email", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
    ],
    details: [
      "Incoming API payload triggers workflow",
      "AI maps and transforms field formats",
      "Target database record is upserted",
      "Confirmation email sent to data owner",
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Document Processing",
    description: "Extract, classify, and route documents automatically.",
    accent: "orange",
    pipeline: [
      { label: "Webhook Trigger", type: "Trigger", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
      { label: "Claude AI", type: "AI", color: "border-green-500/50 bg-green-500/10 text-green-300" },
      { label: "Condition", type: "Logic", color: "border-orange-500/50 bg-orange-500/10 text-orange-300" },
      { label: "Update DB", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
    ],
    details: [
      "File upload fires webhook with document content",
      "AI extracts structured fields from raw text",
      "Condition routes by document type",
      "Record saved to appropriate database table",
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Lead Management",
    description: "Capture, qualify, and follow up on leads autonomously.",
    accent: "pink",
    pipeline: [
      { label: "Webhook Trigger", type: "Trigger", color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300" },
      { label: "Claude AI", type: "AI", color: "border-green-500/50 bg-green-500/10 text-green-300" },
      { label: "Condition", type: "Logic", color: "border-orange-500/50 bg-orange-500/10 text-orange-300" },
      { label: "Send Email", type: "Action", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
    ],
    details: [
      "CRM form POST triggers workflow",
      "AI classifies lead quality (hot / warm / cold)",
      "Condition routes to the right sales rep queue",
      "Welcome email with next-steps sent instantly",
    ],
  },
];

export default function UseCases() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          Workflow Examples
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Use Cases & Workflow Examples</h2>
        <p className="text-muted-foreground max-w-2xl">
          Real-world automation patterns you can build with AutoWeave. Each example shows the exact node pipeline.
        </p>
      </div>

      {/* Use case list */}
      <div className="space-y-3">
        {useCases.map((uc, i) => (
          <div key={i} className="rounded-xl border border-border bg-background/40 overflow-hidden">
            {/* Header row */}
            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-card/40 transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="text-muted-foreground">{uc.icon}</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{uc.title}</span>
                <span className="text-xs text-muted-foreground">{uc.description}</span>
              </span>
              {/* Compact pipeline preview */}
              <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                {uc.pipeline.map((node, ni) => (
                  <div key={ni} className="flex items-center gap-1">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono ${node.color}`}>{node.type}</span>
                    {ni < uc.pipeline.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
              {expanded === i
                ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </button>

            {/* Expanded detail */}
            {expanded === i && (
              <div className="border-t border-border px-5 py-5 space-y-5">
                {/* Full pipeline */}
                <div className="overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-max">
                    {uc.pipeline.map((node, ni) => (
                      <div key={ni} className="flex items-center gap-2">
                        <div className={`rounded-lg border px-4 py-2.5 text-xs font-medium text-center w-32 ${node.color}`}>
                          <p className="text-[10px] opacity-60 uppercase tracking-wider mb-0.5">{node.type}</p>
                          {node.label}
                        </div>
                        {ni < uc.pipeline.length - 1 && (
                          <div className="flex items-center gap-0.5">
                            <div className="h-px w-6 bg-border" />
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-step detail */}
                <div className="grid sm:grid-cols-2 gap-2">
                  {uc.details.map((d, di) => (
                    <div key={di} className="flex items-start gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-card border border-border text-[10px] font-bold text-muted-foreground mt-0.5">{di + 1}</span>
                      <span className="text-xs text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Build your own CTA */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-5">
        <p className="text-sm font-semibold text-foreground mb-1">Build Your Own Use Case</p>
        <p className="text-sm text-muted-foreground mb-3">
          These patterns are a starting point. Any combination of Triggers, AI nodes, Logic, and Actions is valid.
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {["What manual task costs time?", "What event should trigger an action?", "Where do you need AI reasoning?", "What notification is missing?"].map((q) => (
            <span key={q} className="rounded border border-border bg-card px-3 py-1.5">{q}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
