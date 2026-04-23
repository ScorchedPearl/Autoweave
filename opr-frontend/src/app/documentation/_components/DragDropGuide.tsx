import { MousePointer2, Move, Trash2, ZoomIn, Command } from "lucide-react";

const nodeCategories = [
  { label: "Trigger", color: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300", nodes: ["Webhook", "Schedule", "Email"] },
  { label: "Action", color: "bg-purple-500/15 border-purple-500/40 text-purple-300", nodes: ["Send Email", "HTTP Request", "Update DB"] },
  { label: "AI", color: "bg-green-500/15 border-green-500/40 text-green-300", nodes: ["Claude AI", "GPT", "Classify"] },
  { label: "Logic", color: "bg-orange-500/15 border-orange-500/40 text-orange-300", nodes: ["Condition", "Loop", "Router"] },
  { label: "Integration", color: "bg-pink-500/15 border-pink-500/40 text-pink-300", nodes: ["Google Calendar", "Gmail", "Slack"] },
];

const shortcuts = [
  { keys: ["⌘Z", "Ctrl+Z"], label: "Undo" },
  { keys: ["⌘⇧Z", "Ctrl+Shift+Z"], label: "Redo" },
  { keys: ["⌘A", "Ctrl+A"], label: "Select All" },
  { keys: ["Delete", "Backspace"], label: "Delete node" },
  { keys: ["Scroll", "Pinch"], label: "Zoom in/out" },
];

export default function DragDropGuide() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 mb-4">
          <MousePointer2 className="h-3 w-3" />
          Canvas Editor
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3">Drag & Drop Guide</h2>
        <p className="text-muted-foreground max-w-2xl">
          The visual canvas is where your workflows come to life. Learn how to navigate the editor, place nodes, and wire them together.
        </p>
      </div>

      {/* Canvas mock */}
      <div className="rounded-xl border border-border bg-background/60 overflow-hidden">
        <div className="border-b border-border bg-card/60 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/60" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <span className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">workflow-canvas</span>
        </div>
        <div className="relative p-6 min-h-[200px] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]">
          {/* Simulated nodes */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1 items-center">
              <div className="rounded-lg border border-cyan-500/50 bg-cyan-500/10 px-4 py-2.5 text-xs font-medium text-cyan-300 shadow-lg shadow-cyan-500/5">
                <span className="block text-[10px] text-cyan-500/60 uppercase tracking-wider mb-0.5">Trigger</span>
                Webhook
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>

            <div className="flex-1 flex items-center gap-1 min-w-[60px]">
              <div className="flex-1 h-px bg-cyan-500/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500/50" />
            </div>

            <div className="flex flex-col gap-1 items-center">
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-2.5 text-xs font-medium text-green-300 shadow-lg shadow-green-500/5">
                <span className="block text-[10px] text-green-500/60 uppercase tracking-wider mb-0.5">AI</span>
                Claude AI
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="flex-1 flex items-center gap-1 min-w-[60px]">
              <div className="flex-1 h-px bg-green-500/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-500/50" />
            </div>

            <div className="flex flex-col gap-1 items-center">
              <div className="rounded-lg border border-purple-500/50 bg-purple-500/10 px-4 py-2.5 text-xs font-medium text-purple-300 shadow-lg shadow-purple-500/5">
                <span className="block text-[10px] text-purple-500/60 uppercase tracking-wider mb-0.5">Action</span>
                Send Email
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            </div>
          </div>

          {/* Drag hint */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground">
            <MousePointer2 className="h-3 w-3" />
            Drag nodes from the right palette
          </div>
        </div>
      </div>

      {/* How to drag */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">How to Add Nodes</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: <MousePointer2 className="h-4 w-4" />, step: "1", title: "Click & Hold", desc: "Hold a node from the right palette", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5" },
            { icon: <Move className="h-4 w-4" />, step: "2", title: "Drag", desc: "Move cursor onto the canvas area", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
            { icon: <ZoomIn className="h-4 w-4" />, step: "3", title: "Release", desc: "Drop to place the node", color: "text-green-400 border-green-500/30 bg-green-500/5" },
            { icon: <Trash2 className="h-4 w-4" />, step: "4", title: "Position / Delete", desc: "Drag to reposition · Delete key removes", color: "text-orange-400 border-orange-500/30 bg-orange-500/5" },
          ].map((item) => (
            <div key={item.step} className={`rounded-xl border p-4 ${item.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold opacity-50">{item.step}</span>
                <span>{item.icon}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Node palette */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Node Palette — Categories</p>
        <div className="flex flex-col gap-2">
          {nodeCategories.map((cat) => (
            <div key={cat.label} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-3">
              <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${cat.color}`}>{cat.label}</span>
              <div className="flex gap-2 flex-wrap">
                {cat.nodes.map((n) => (
                  <span key={n} className="rounded border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground font-mono">{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="rounded-xl border border-border bg-background/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Command className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Keyboard Shortcuts</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {shortcuts.map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="rounded border border-border bg-background px-2 py-0.5 text-xs font-mono text-foreground">{k}</kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
