import { Play, Circle, CheckCircle2, XCircle, Clock, BarChart3, AlertTriangle } from "lucide-react";

const executionLog = [
  { node: "Webhook Trigger", status: "success", duration: "12ms", output: '{ "email": "user@co.com", "event": "form_submit" }' },
  { node: "Condition Check", status: "success", duration: "3ms", output: '{ "result": true }' },
  { node: "Claude AI", status: "success", duration: "1.4s", output: '{ "summary": "High priority lead from enterprise segment." }' },
  { node: "Send Email", status: "success", duration: "210ms", output: '{ "messageId": "msg_abc123", "status": "sent" }' },
];

const statusConfig = {
  running: { icon: <Circle className="h-3.5 w-3.5 animate-pulse" />, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Running" },
  success: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", label: "Completed" },
  failed: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Failed" },
};

const metrics = [
  { label: "Total Runs", value: "1,284", sub: "all time", color: "text-cyan-400" },
  { label: "Success Rate", value: "98.6%", sub: "last 30 days", color: "text-green-400" },
  { label: "Avg Duration", value: "1.8s", sub: "per execution", color: "text-purple-400" },
  { label: "Error Rate", value: "1.4%", sub: "last 30 days", color: "text-orange-400" },
];

export default function WorkflowExecution() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-4">
          <Play className="h-3 w-3" />
          Runtime
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Workflow Execution & Monitoring</h2>
        <p className="text-muted-foreground max-w-2xl">
          Run workflows manually or via triggers. Watch real-time execution, inspect node outputs, and track performance metrics.
        </p>
      </div>

      {/* Execution log mock */}
      <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
        <div className="border-b border-border bg-card/60 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">execution-log · run #1284</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Completed
          </span>
        </div>

        <div className="divide-y divide-border">
          {executionLog.map((entry, i) => {
            const cfg = statusConfig[entry.status as keyof typeof statusConfig];
            return (
              <div key={i} className="flex gap-4 px-4 py-3 items-start hover:bg-card/20 transition-colors">
                <span className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{entry.node}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3" />{entry.duration}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground truncate">{entry.output}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to run */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Running Your Workflow</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Manual Run</p>
            <div className="space-y-1.5">
              {["Open workflow from dashboard", 'Click Run in the top toolbar', "Fill any required input params", "Click Execute to start", "Watch each node light up live"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-[9px] font-bold">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Automatic Trigger</p>
            <p className="text-xs text-muted-foreground mb-3">Deployed workflows with Trigger nodes execute automatically when conditions fire:</p>
            <div className="space-y-1.5">
              {[["Webhook", "POST to your endpoint URL"], ["Schedule", "Cron expression fires on time"], ["Email", "Incoming message matches filter"]].map(([t, d]) => (
                <div key={t} className="flex items-center gap-2 rounded border border-border bg-card/40 px-2.5 py-1.5 text-xs">
                  <span className="font-mono text-cyan-400 w-16 flex-shrink-0">{t}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Performance Metrics</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-background/40 px-4 py-4 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs font-medium text-foreground mt-1">{m.label}</p>
              <p className="text-[10px] text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <p className="text-sm font-semibold text-foreground">Troubleshooting Failures</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { t: "Check Error Messages", d: "Hover a red node to see the stack trace" },
            { t: "Inspect Input Data", d: "Verify upstream node output matches expected format" },
            { t: "Test Individual Nodes", d: "Right-click → Test to run a node with sample data" },
            { t: "Check Auth Status", d: "Ensure Google OAuth tokens haven't expired" },
          ].map((item) => (
            <div key={item.t} className="flex gap-3 rounded-lg border border-border bg-card/30 px-3 py-2.5">
              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
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
