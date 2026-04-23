import { Link2, GitBranch, AlertCircle, CheckCircle } from "lucide-react";

export default function NodeConnections() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Creating Node Connections</h2>
        <p className="text-muted-foreground mb-6">
          Connections define the flow of data and logic between nodes. Learn how to create and manage them effectively.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-500" />
            How to Connect Nodes
          </h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">1</span>
              <span><strong>Hover over Node:</strong> Move your mouse over a node to reveal connection ports</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">2</span>
              <span><strong>Click Output Port:</strong> Click and hold on the right side of the source node</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">3</span>
              <span><strong>Drag Connection:</strong> Drag the line to the target node's input port (left side)</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">4</span>
              <span><strong>Release:</strong> Release to create the connection</span>
            </li>
          </ol>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-500" />
            Port Types
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground mb-2">Input Ports (Left Side)</p>
              <p className="text-sm">Receive data or events from other nodes. Most nodes have at least one input port.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground mb-2">Output Ports (Right Side)</p>
              <p className="text-sm">Send data or events to other nodes. Multiple outputs can represent different paths (success/failure, true/false).</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground mb-2">Data Types</p>
              <p className="text-sm">Ports are color-coded by data type. Connect matching colors to ensure proper data flow.</p>
              <ul className="mt-2 space-y-1 text-xs ml-4">
                <li>• <span className="text-cyan-400">Cyan:</span> Trigger/Event</li>
                <li>• <span className="text-green-400">Green:</span> Success Path</li>
                <li>• <span className="text-red-400">Red:</span> Error Path</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Best Practices
          </h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Start with a Trigger node - every workflow needs an entry point</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Connect nodes logically - follow the natural flow of your automation</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Handle errors - connect error outputs to error handlers or notifications</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Test connections - validate your workflow before deployment</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>Use branches - Route different data paths using condition nodes</span>
            </li>
          </ul>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Common Issues
          </h3>
          <div className="space-y-3 text-muted-foreground">
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground text-sm mb-1">❌ Connection Won't Form</p>
              <p className="text-sm">Make sure you're connecting from an output port to an input port, and the data types match.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground text-sm mb-1">❌ Invalid Path</p>
              <p className="text-sm">Avoid circular connections (A → B → A). Each path must eventually reach an end node.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-4">
              <p className="font-semibold text-foreground text-sm mb-1">❌ Data Loss</p>
              <p className="text-sm">Ensure critical nodes are connected. Unconnected paths may skip important steps.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">💡 Connection Tips</h3>
          <p className="text-muted-foreground mb-3">
            You can have multiple connections from a single output port to enable complex workflows. For example, a condition node can send success and failure paths to different nodes.
          </p>
          <p className="text-sm text-cyan-400">
            Right-click on a connection line to delete it or view its properties.
          </p>
        </div>
      </div>
    </div>
  );
}