"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Circle } from "lucide-react";

const faqs = [
  {
    q: "Why isn't my workflow triggering automatically?",
    a: "Ensure the workflow is Deployed (not just saved). Check that the trigger node is properly configured and that integrations aren't expired. Use the execution log to identify where it stalls.",
    tag: "Triggers",
  },
  {
    q: "How do I connect Google Calendar or Gmail?",
    a: "Go to Settings → Integrations, click the service, complete the Google OAuth flow, and grant the requested scopes. Make sure you're signed into the correct Google account.",
    tag: "Integrations",
  },
  {
    q: "What does the red error indicator mean?",
    a: "A red node means execution failed at that step. Hover to see the stack trace. Common causes: misconfigured fields, expired auth tokens, or invalid upstream data.",
    tag: "Errors",
  },
  {
    q: "Can I test a workflow before deploying?",
    a: "Yes — click Run in the toolbar and provide sample input. Inspect each node's output in the execution log. Only deploy once the test run succeeds end-to-end.",
    tag: "Testing",
  },
  {
    q: "Why is my AI node returning unexpected results?",
    a: "Clarify your prompt to be more specific. Check that the input data format matches what the AI node expects. For structured output use the Classify node instead.",
    tag: "AI Nodes",
  },
  {
    q: "Can one output connect to multiple nodes?",
    a: "Yes. Drag multiple edges from the same output handle. Each path runs independently — useful for parallel processing or fan-out patterns.",
    tag: "Connections",
  },
  {
    q: "How do I schedule a workflow to run on a cron?",
    a: "Use the Schedule Trigger node. Set the cron expression (e.g. 0 9 * * 1-5 for weekdays at 9am). The workflow fires automatically on that schedule once deployed.",
    tag: "Triggers",
  },
  {
    q: "How do I view execution history?",
    a: "Open any deployed workflow and click the Executions tab. Filter by date, status, or node. Click a run to see per-node input/output and timing.",
    tag: "Monitoring",
  },
];

const checklist = [
  {
    title: "Workflow Won't Start",
    color: "border-red-500/30 bg-red-500/5",
    icon: <XCircle className="h-4 w-4 text-red-400" />,
    items: ["Workflow is deployed — not just saved", "Trigger node has a valid configuration", "OAuth tokens haven't expired", "Webhook URL matches the POST target"],
  },
  {
    title: "Node Fails Mid-Run",
    color: "border-yellow-500/30 bg-yellow-500/5",
    icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    items: ["Read the error on the red node", "Verify upstream output format", "Test the node alone with sample data", "Check external service uptime"],
  },
  {
    title: "Authentication Error",
    color: "border-purple-500/30 bg-purple-500/5",
    icon: <Circle className="h-4 w-4 text-purple-400" />,
    items: ["Re-authorise integration in Settings", "Ensure correct Google account selected", "Verify all required scopes granted", "Check OAuth token expiry"],
  },
];

export default function TroubleshootingFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const [filter, setFilter] = useState<string>("All");

  const tags = ["All", ...Array.from(new Set(faqs.map((f) => f.tag)))];
  const filtered = filter === "All" ? faqs : faqs.filter((f) => f.tag === filter);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 mb-4">
          <HelpCircle className="h-3 w-3" />
          FAQ
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Troubleshooting & FAQ</h2>
        <p className="text-muted-foreground max-w-2xl">
          Answers to common questions. Use the category filter or expand any item to read the full answer.
        </p>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => { setFilter(tag); setOpen(null); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              filter === tag
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-2">
        {filtered.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border bg-background/40 overflow-hidden">
            <button
              className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-card/30 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card mt-0.5">
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{faq.q}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:block rounded border border-border bg-card px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{faq.tag}</span>
                {open === i
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>
            {open === i && (
              <div className="border-t border-border bg-card/20 px-5 py-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-3">📞 Need More Help?</h3>
        <p className="text-muted-foreground mb-4">
          If you can't find the answer to your question, here are additional resources:
        </p>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li>• <strong>Email Support:</strong> Contact us at support@autoweave.io</li>
          <li>• <strong>Status Page:</strong> Check service status at status.autoweave.io</li>
          <li>• <strong>Community Forum:</strong> Ask questions and share tips with other users</li>
          <li>• <strong>Video Tutorials:</strong> Watch step-by-step guides on our YouTube channel</li>
          <li>• <strong>Chat Support:</strong> Available during business hours in the app</li>
        </ul>
      </div>

      <div className="bg-background/50 border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Common Issues Checklist</h3>
        <div className="space-y-3">
          <div className="bg-background/30 border border-border rounded p-4">
            <p className="font-semibold text-foreground text-sm mb-2">🔴 Workflow Won't Start</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>☐ Workflow is deployed (not just saved)</li>
              <li>☐ Trigger node is configured correctly</li>
              <li>☐ Integrations are authenticated and not expired</li>
              <li>☐ Webhook URL is correct (if using webhooks)</li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border rounded p-4">
            <p className="font-semibold text-foreground text-sm mb-2">🟡 Partial Failure</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>☐ Check error message on failed node</li>
              <li>☐ Verify input data format</li>
              <li>☐ Test individual nodes with sample data</li>
              <li>☐ Check external service status</li>
            </ul>
          </div>

          <div className="bg-background/30 border border-border rounded p-4">
            <p className="font-semibold text-foreground text-sm mb-2">🟣 Authentication Error</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>☐ Re-authorize integrations</li>
              <li>☐ Check API keys are correct</li>
              <li>☐ Verify permissions are granted</li>
              <li>☐ Check token expiration dates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support strip */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4">
        <p className="text-sm font-semibold text-foreground mb-1">Still stuck?</p>
        <p className="text-sm text-muted-foreground">
          Reach us at{" "}
          <span className="font-mono text-foreground">marcellapearl0627@gmail.com</span>{" "}
          or use the <span className="text-cyan-400">Contact</span> page. Include your workflow ID and the execution log for fastest resolution.
        </p>
      </div>
    </div>
  );
}
