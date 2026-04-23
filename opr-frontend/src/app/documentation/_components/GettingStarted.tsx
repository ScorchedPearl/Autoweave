import { CheckCircle2, ArrowRight } from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started with Autoweave</h2>
        <p className="text-muted-foreground mb-6">
          Autoweave is a visual workflow automation platform that enables you to create, connect, and execute automated workflows without writing code.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            Overview
          </h3>
          <p className="text-muted-foreground">
            Autoweave combines visual workflow design with AI-powered nodes and seamless integrations. You can drag nodes, connect them together, and create complex automations in minutes.
          </p>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-500" />
            Key Features
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-cyan-500">•</span>
              Visual drag-and-drop workflow editor
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">•</span>
              AI-powered nodes with LangChain integration
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">•</span>
              Google Calendar & Gmail integrations
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">•</span>
              Real-time execution tracking and monitoring
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-500">•</span>
              Secure authentication with OTP verification
            </li>
          </ul>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-500" />
            Quick Start Steps
          </h3>
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">1</span>
              <span><strong>Sign In:</strong> Log in with your email or Google account</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">2</span>
              <span><strong>Create Workflow:</strong> Click "New Workflow" to start creating</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">3</span>
              <span><strong>Add Nodes:</strong> Drag nodes from the palette onto the canvas</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">4</span>
              <span><strong>Connect Nodes:</strong> Draw connections between nodes to define logic flow</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">5</span>
              <span><strong>Deploy & Run:</strong> Save and deploy your workflow to start automation</span>
            </li>
          </ol>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">💡 Pro Tip</h3>
          <p className="text-muted-foreground">
            Start with simple workflows first. Once you're comfortable with the basics, try combining multiple nodes and integrations for more powerful automations.
          </p>
        </div>
      </div>
    </div>
  );
}