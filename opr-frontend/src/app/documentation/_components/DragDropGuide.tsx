import { Move3D, MousePointer2, Grid3x3, Trash2 } from "lucide-react";

export default function DragDropGuide() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Drag & Drop Guide</h2>
        <p className="text-muted-foreground mb-6">
          The visual drag-and-drop interface is the heart of Autoweave. Learn how to add, position, and organize nodes.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-cyan-500" />
            Finding & Selecting Nodes
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>Node Palette (Right Side):</strong> The node palette contains all available node types organized by category.
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <span className="text-cyan-500">Trigger Nodes:</span> Webhook, Schedule, Email</li>
              <li>• <span className="text-purple-500">Action Nodes:</span> Send Email, Update Database, HTTP Request</li>
              <li>• <span className="text-green-500">AI Nodes:</span> Claude AI, GPT Integration, Classification</li>
              <li>• <span className="text-orange-500">Logic Nodes:</span> Condition, Loop, Router</li>
              <li>• <span className="text-pink-500">Integration Nodes:</span> Google Calendar, Gmail, Slack</li>
            </ul>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Move3D className="w-5 h-5 text-purple-500" />
            How to Drag & Drop
          </h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">1</span>
              <span><strong>Click & Hold:</strong> Click and hold a node from the palette</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">2</span>
              <span><strong>Drag to Canvas:</strong> Move your cursor to the center canvas area</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">3</span>
              <span><strong>Release:</strong> Release the mouse button to place the node</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">4</span>
              <span><strong>Position Nodes:</strong> Drag any node on the canvas to reposition it</span>
            </li>
          </ol>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-green-500" />
            Canvas Organization
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p><strong>Canvas Area:</strong> The main editing area where you place and arrange your nodes.</p>
            <div className="bg-background/30 border border-border rounded p-4 space-y-2">
              <p>• <strong>Zoom:</strong> Use scroll wheel to zoom in/out</p>
              <p>• <strong>Pan:</strong> Click and drag empty space to move around</p>
              <p>• <strong>Grid:</strong> Nodes snap to a visual grid for alignment</p>
              <p>• <strong>Undo/Redo:</strong> Use Ctrl+Z / Ctrl+Shift+Z to undo/redo actions</p>
            </div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Deleting Nodes
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• <strong>Select Node:</strong> Click on a node to select it</li>
            <li>• <strong>Delete:</strong> Press Delete key or right-click and select Delete</li>
            <li>• <strong>Connected Edges:</strong> Deleting a node also removes all connected edges</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">⚡ Keyboard Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-cyan-400 mb-2">Mac:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>⌘Z - Undo</li>
                <li>⌘⇧Z - Redo</li>
                <li>⌘A - Select All</li>
              </ul>
            </div>
            <div>
              <p className="text-purple-400 mb-2">Windows/Linux:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>Ctrl+Z - Undo</li>
                <li>Ctrl+Shift+Z - Redo</li>
                <li>Ctrl+A - Select All</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}