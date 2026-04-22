import { Play, MonitorPlay, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

export default function WorkflowExecution() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Workflow Execution & Monitoring</h2>
        <p className="text-muted-foreground mb-6">
          Run your workflows and monitor their execution in real-time with comprehensive tracking.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-green-500" />
            Running Your Workflow
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Manual Execution</h4>
              <ol className="space-y-2 text-muted-foreground text-sm ml-4">
                <li>1. Open your workflow from the dashboard</li>
                <li>2. Click the <strong>Run</strong> button in the top toolbar</li>
                <li>3. If required, fill in any input parameters</li>
                <li>4. Click <strong>Execute</strong> to start the workflow</li>
                <li>5. Watch the execution progress in real-time</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Automatic Triggers</h4>
              <p className="text-muted-foreground text-sm">
                Once deployed, workflows with trigger nodes (Webhook, Schedule, Email) will automatically execute when their conditions are met.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-cyan-500" />
            Execution Monitoring
          </h3>
          <div className="space-y-3 text-muted-foreground text-sm">
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Real-Time Status</p>
              <p>Watch as each node executes. Colors indicate the status:</p>
              <ul className="mt-2 ml-4 space-y-1">
                <li>🟡 <span className="text-yellow-400">Running</span> - Node is currently executing</li>
                <li>🟢 <span className="text-green-400">Completed</span> - Node finished successfully</li>
                <li>🔴 <span className="text-red-400">Failed</span> - Node encountered an error</li>
              </ul>
            </div>

            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Execution Timeline</p>
              <p>View the execution history with timestamps, duration, and input/output data for each node.</p>
            </div>

            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Logs & Output</p>
              <p>Access detailed logs showing what happened at each step, including errors and data transformations.</p>
            </div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Performance Metrics
          </h3>
          <div className="space-y-3 text-muted-foreground text-sm">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-background/30 border border-border rounded p-3">
                <p className="font-semibold text-foreground mb-1">Total Executions</p>
                <p>View the total number of times your workflow has run.</p>
              </div>
              <div className="bg-background/30 border border-border rounded p-3">
                <p className="font-semibold text-foreground mb-1">Success Rate</p>
                <p>Monitor the percentage of successful executions.</p>
              </div>
              <div className="bg-background/30 border border-border rounded p-3">
                <p className="font-semibold text-foreground mb-1">Average Duration</p>
                <p>Track how long your workflow typically takes to complete.</p>
              </div>
              <div className="bg-background/30 border border-border rounded p-3">
                <p className="font-semibold text-foreground mb-1">Error Rate</p>
                <p>Monitor and identify patterns in failed executions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Troubleshooting Failures
          </h3>
          <div className="space-y-3 text-muted-foreground text-sm">
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Check Error Messages</p>
              <p>Hover over failed nodes to see detailed error messages and stack traces.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Review Input Data</p>
              <p>Verify that the data passed to each node is in the expected format.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Test Individual Nodes</p>
              <p>Right-click on a node and select "Test" to run it independently with sample data.</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Check Integration Status</p>
              <p>Ensure all connected services (Google Calendar, Gmail, etc.) are properly authenticated.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">💡 Execution Tips</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• Start with manual test runs before enabling automatic triggers</li>
            <li>• Add error handling nodes to gracefully handle failures</li>
            <li>• Use logging nodes to track important data points</li>
            <li>• Monitor your workflow dashboard regularly for issues</li>
            <li>• Set up notifications for workflow failures</li>
          </ul>
        </div>
      </div>
    </div>
  );
}