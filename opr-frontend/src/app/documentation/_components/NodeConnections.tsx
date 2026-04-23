import { Link2, ArrowRight, GitMerge, AlertCircle, CheckCircle2 } from "lucide-react";

const connectionRules = [
  { from: "Trigger", to: "Action / AI / Logic", valid: true },
  { from: "AI Node", to: "Action / Logic / Another AI", valid: true },
  { from: "Condition", to: "Two branches (true / false)", valid: true },
  { from: "Action", to: "Trigger", valid: false },
  { from: "Output", to: "Itself (same node)", valid: false },
];

const connectionTypes = [
  { label: "Data Flow", color: "bg-cyan-500", desc: "Passes output of one node as input to the next" },
  { label: "Conditional", color: "bg-orange-500", desc: "Routes execution based on true / false evaluation" },
  { label: "Error Path", color: "bg-red-500", desc: "Handles failures and routes to fallback logic" },
];

export default function NodeConnections() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 mb-4">
          <Link2 className="h-3 w-3" />
          Edges & Wiring
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Node Connections</h2>
        <p className="text-muted-foreground max-w-2xl">
          Connections (edges) define how data flows through your workflow. Each node has input and output handles you connect by dragging.
        </p>
      </div>

      {/* Visual connection diagram */}
      <div className="rounded-xl border border-border bg-background/60 p-6 overflow-x-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Connection Flow</p>
        <div className="flex items-start gap-3 min-w-[520px]">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300 font-medium w-32 text-center">
              <p className="text-[10px] text-cyan-500/60 uppercase tracking-wider">Trigger</p>
              Webhook
            </div>
            <span className="text-[10px] text-muted-foreground">Output handle →</span>
          </div>

          <div className="flex flex-col items-center mt-3.5 gap-1">
            <div className="h-px w-10 bg-cyan-500/50" />
            <ArrowRight className="h-3.5 w-3.5 text-cyan-500/70 -mt-1" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-300 font-medium w-32 text-center">
              <p className="text-[10px] text-green-500/60 uppercase tracking-wider">AI</p>
              Claude AI
            </div>
            <span className="text-[10px] text-muted-foreground">← Input handle</span>
          </div>

          <div className="flex flex-col items-center mt-3.5 gap-1">
            <div className="h-px w-10 bg-green-500/50" />
            <ArrowRight className="h-3.5 w-3.5 text-green-500/70 -mt-1" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 px-4 py-3 text-sm text-orange-300 font-medium w-32 text-center">
              <p className="text-[10px] text-orange-500/60 uppercase tracking-wider">Logic</p>
              Condition
            </div>
            <GitMerge className="h-3.5 w-3.5 text-orange-400" />
          </div>

          <div className="flex flex-col items-start mt-0 gap-2 ml-1">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-green-500/50" />
              <div className="rounded border border-green-500/40 bg-green-500/10 px-3 py-2 text-xs text-green-300 w-28 text-center">Send Email</div>
              <span className="text-[10px] text-green-400 font-mono">true</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px w-8 bg-red-500/50" />
              <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 w-28 text-center">Log Error</div>
              <span className="text-[10px] text-red-400 font-mono">false</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to connect */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">How to Connect Nodes</p>
        <div className="space-y-2">
          {[
            { n: "1", t: "Hover a node", d: "Small circles appear on the edges — these are handles" },
            { n: "2", t: "Click & drag from output handle", d: "A green edge will follow your cursor" },
            { n: "3", t: "Drop on input handle", d: "The edge snaps in place and turns solid" },
            { n: "4", t: "Delete a connection", d: "Click the edge and press Delete, or right-click → Remove" },
          ].map((row) => (
            <div key={row.n} className="flex items-center gap-4 rounded-lg border border-border bg-background/40 px-4 py-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-muted-foreground">{row.n}</span>
              <span className="text-sm font-medium text-foreground w-44 flex-shrink-0">{row.t}</span>
              <span className="text-sm text-muted-foreground">{row.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection types */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Connection Types</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {connectionTypes.map((ct) => (
            <div key={ct.label} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2 w-6 rounded-full ${ct.color}`} />
                <span className="text-sm font-semibold text-foreground">{ct.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{ct.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Valid / invalid rules */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Connection Rules</p>
        <div className="space-y-2">
          {connectionRules.map((rule, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${rule.valid ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              {rule.valid
                ? <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
              <span className={`font-medium ${rule.valid ? "text-green-300" : "text-red-300"}`}>{rule.from}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{rule.to}</span>
              <span className={`ml-auto text-xs font-mono ${rule.valid ? "text-green-400" : "text-red-400"}`}>{rule.valid ? "allowed" : "blocked"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
