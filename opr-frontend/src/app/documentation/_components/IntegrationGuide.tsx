"use client";

import { useState } from "react";
import { Plug, Mail, Calendar, Shield, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const integrations = [
  {
    name: "Google Calendar",
    icon: <Calendar className="w-5 h-5" />,
    status: "Available",
    description: "Create and manage calendar events from workflow outputs.",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    capabilities: ["Create events", "List upcoming events", "Update event details", "Delete events", "Set reminders"],
    setup: [
      { step: "Settings → Integrations", detail: "Navigate to Integrations in your account settings" },
      { step: "Connect Google Calendar", detail: "Click the Google Calendar card to begin OAuth flow" },
      { step: "Authorize scopes", detail: "Grant calendar read/write permission on the Google consent screen" },
      { step: "Select calendar", detail: "Choose which calendar AutoWeave should write to by default" },
    ],
    node: "Google Calendar",
  },
  {
    name: "Gmail",
    icon: <Mail className="w-5 h-5" />,
    status: "Available",
    description: "Send emails and automate inbox actions via Gmail API.",
    color: "text-red-400 border-red-500/30 bg-red-500/5",
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
    capabilities: ["Send emails with attachments", "Read inbox messages", "Apply labels", "Archive threads", "Draft composer"],
    setup: [
      { step: "Settings → Integrations", detail: "Navigate to Integrations in your account settings" },
      { step: "Connect Gmail", detail: "Click the Gmail card to begin the OAuth flow" },
      { step: "Grant email permissions", detail: "Allow AutoWeave send & read access on the Google consent screen" },
      { step: "Configure signature", detail: "Optionally add an email signature in the node settings" },
    ],
    node: "Send Email / Gmail",
  },
];

export default function IntegrationGuide() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-400 mb-4">
          <Plug className="h-3 w-3" />
          External Services
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Integration Guide</h2>
        <p className="text-muted-foreground max-w-2xl">
          Connect AutoWeave with Google services to expand your automation. All integrations use OAuth — no credentials are stored.
        </p>
      </div>

      {/* Integration cards */}
      <div className="space-y-3">
        {integrations.map((integration, i) => (
          <div key={i} className={`rounded-xl border bg-background/40 overflow-hidden ${integration.color}`}>
            {/* Card header */}
            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-card/30 transition-colors"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className={integration.color.split(" ")[0]}>{integration.icon}</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{integration.name}</span>
                <span className="text-xs text-muted-foreground">{integration.description}</span>
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${integration.badge}`}>{integration.status}</span>
              {expanded === i
                ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            </button>

            {/* Expanded */}
            {expanded === i && (
              <div className="border-t border-border px-5 py-5 grid md:grid-cols-2 gap-6">
                {/* Capabilities */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Capabilities</p>
                  <div className="space-y-1.5">
                    {integration.capabilities.map((cap) => (
                      <div key={cap} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        {cap}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup steps */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Setup</p>
                  <div className="space-y-2">
                    {integration.setup.map((s, si) => (
                      <div key={si} className="flex gap-3 rounded-lg border border-border bg-card/40 px-3 py-2.5">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-[10px] font-bold text-muted-foreground mt-0.5">{si + 1}</span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.step}</p>
                          <p className="text-xs text-muted-foreground">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Node hint */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
                    <span className="text-xs text-muted-foreground">Node on canvas:</span>
                    <span className="rounded border border-border bg-card px-2 py-0.5 text-xs font-mono text-foreground">{integration.node}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Security strip */}
      <div className="rounded-xl border border-border bg-background/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-green-400" />
          <p className="text-sm font-semibold text-foreground">Permissions & Security</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: "OAuth Only", d: "We never store Google passwords — all auth via OAuth 2.0 tokens" },
            { t: "Minimal Scopes", d: "Only the exact permissions your workflow requires are requested" },
            { t: "Revoke Anytime", d: "Remove access from Google account settings at any time" },
            { t: "Encrypted Transit", d: "All API calls use TLS 1.3; tokens stored encrypted at rest" },
          ].map((item) => (
            <div key={item.t} className="flex gap-3 rounded-lg border border-border bg-card/30 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.t}</p>
                <p className="text-xs text-muted-foreground">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
