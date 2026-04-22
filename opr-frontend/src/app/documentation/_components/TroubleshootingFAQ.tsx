import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function TroubleshootingFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Why isn't my workflow triggering automatically?",
      answer: "Check that: 1) Your workflow is deployed (not just saved), 2) The trigger node is properly configured, 3) External integrations are still authenticated, 4) You're using the correct webhook URL if applicable. Also check the execution logs for any errors.",
    },
    {
      question: "How do I connect Google Calendar or Gmail?",
      answer: "Navigate to Settings → Integrations, click on the service you want to connect, authorize Autoweave with your Google account, and grant the necessary permissions. Make sure you're logged into the correct Google account. You can manage multiple accounts if needed.",
    },
    {
      question: "What does the red error indicator mean on a node?",
      answer: "A red indicator means the node failed during execution. Click on it to see the detailed error message. Common causes: incorrect configuration, missing required fields, external service errors, or invalid input data. Check the execution logs for more information.",
    },
    {
      question: "Can I test my workflow before deploying?",
      answer: "Yes! Use the Test feature (play button in the toolbar) to run your workflow manually. You can provide sample data to test the complete flow. Once satisfied, click Deploy to enable automatic triggers.",
    },
    {
      question: "How do I delete or modify a deployed workflow?",
      answer: "Click the three-dot menu on your workflow and select 'Edit'. Make your changes and click 'Update' to modify it while deployed. To delete, select 'Delete Workflow'. Note: Deleting will stop any automatic executions.",
    },
    {
      question: "Why is my AI node returning unexpected results?",
      answer: "This could be due to: 1) Unclear prompt/instruction, 2) Input data not in expected format, 3) AI model misunderstanding the task. Try: clarifying your prompt, testing with different sample data, or using a classification node for structured output.",
    },
    {
      question: "How can I view my workflow execution history?",
      answer: "Open your deployed workflow and click the 'Executions' tab to see all past runs. You can filter by date range, status (success/failure), and view detailed logs for each execution. Click on any execution to see node-by-node details.",
    },
    {
      question: "What happens if a workflow fails?",
      answer: "When a workflow fails: 1) The failed node is highlighted in red, 2) Execution stops at that node (unless you have error handling), 3) You receive an error notification, 4) The execution log is saved for debugging. Add error handling nodes to recover from failures automatically.",
    },
    {
      question: "Can I have multiple connections from one node output?",
      answer: "Yes! One output port can connect to multiple input ports. This is useful for: running parallel processes, routing to multiple destinations, or creating branching logic. Each connection path will process independently.",
    },
    {
      question: "How do I fix 'Connection Refused' errors?",
      answer: "This usually means Autoweave can't reach an external service. Check: 1) Your internet connection, 2) The external service is online, 3) Your authentication tokens haven't expired, 4) Firewall/proxy isn't blocking the connection. Try reauthorizing the integration.",
    },
    {
      question: "What are the rate limits for workflows?",
      answer: "Autoweave itself doesn't enforce strict rate limits. However, external services (Google Calendar, Gmail, etc.) have their own limits. Plan your workflows accordingly and use queuing if you expect high volume. Contact support for enterprise rate limit requirements.",
    },
    {
      question: "How do I move a workflow to production?",
      answer: "1) Test thoroughly in your development environment, 2) Create a duplicate for production, 3) Update integrations to production credentials/calendars if needed, 4) Deploy the production workflow, 5) Monitor executions in the production dashboard. Keep development and production separate.",
    },
    {
      question: "Can I schedule workflows to run at specific times?",
      answer: "Yes! Use the 'Schedule' trigger node. Configure the frequency (daily, weekly, monthly) and time. The workflow will automatically execute at those times. You can also use cron expressions for more complex scheduling.",
    },
    {
      question: "What data gets stored from my workflows?",
      answer: "Autoweave stores: workflow definitions, execution logs, and input/output data from your nodes. This data is encrypted and secured. You can delete execution history from the settings. We don't sell or share your data. See our Privacy Policy for details.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Troubleshooting & FAQ</h2>
        <p className="text-muted-foreground mb-6">
          Find answers to common questions and solutions for common issues.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-background/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-background/70 transition-colors"
            >
              <h3 className="text-left font-semibold text-foreground">{faq.question}</h3>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${
                  expandedIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedIndex === idx && (
              <div className="px-6 py-4 border-t border-border bg-background/30">
                <p className="text-muted-foreground">{faq.answer}</p>
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
    </div>
  );
}