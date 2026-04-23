import { Mail, Calendar, Database, FileText, Users } from "lucide-react";

export default function UseCases() {
  const useCases = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Automation",
      description: "Automatically send emails based on triggers like form submissions or scheduled times.",
      steps: [
        "Add Webhook Trigger (form submission)",
        "Add Condition node to check email",
        "Connect to Send Email node",
        "Configure email template",
        "Deploy workflow",
      ],
      color: "from-cyan-500/10 to-blue-500/10",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Calendar & Schedule Management",
      description: "Create and manage calendar events based on workflow triggers.",
      steps: [
        "Add Schedule Trigger (recurring time)",
        "Connect to AI Node to process data",
        "Add Google Calendar node",
        "Configure event details",
        "Set up notifications",
      ],
      color: "from-purple-500/10 to-pink-500/10",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Synchronization",
      description: "Sync data between different systems automatically.",
      steps: [
        "Add API Trigger for source system",
        "Transform data with AI node",
        "Update target database",
        "Log transaction",
        "Send confirmation email",
      ],
      color: "from-green-500/10 to-emerald-500/10",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Document Processing",
      description: "Process documents, extract information, and route accordingly.",
      steps: [
        "Trigger on file upload",
        "Use AI node for OCR/extraction",
        "Route to appropriate handler",
        "Save to database",
        "Notify user",
      ],
      color: "from-orange-500/10 to-red-500/10",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Lead Management",
      description: "Automate lead collection and follow-up processes.",
      steps: [
        "Capture leads via webhook",
        "Classify with AI",
        "Assign to sales team",
        "Send welcome email",
        "Schedule follow-up",
      ],
      color: "from-indigo-500/10 to-violet-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Use Cases & Examples</h2>
        <p className="text-muted-foreground mb-6">
          Discover powerful automation scenarios you can build with Autoweave. From simple automation to complex workflows.
        </p>
      </div>

      <div className="grid gap-6">
        {useCases.map((useCase, idx) => (
          <div key={idx} className={`bg-gradient-to-r ${useCase.color} border border-border rounded-lg p-6`}>
            <div className="flex gap-4 mb-4">
              <div className="text-cyan-400">{useCase.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{useCase.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{useCase.description}</p>
              </div>
            </div>

            <div className="bg-background/40 border border-border rounded-lg p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Typical Flow:</p>
              <ol className="space-y-2">
                {useCase.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-semibold flex-shrink-0">
                      {stepIdx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-3">🚀 Create Your Own Use Case</h3>
        <p className="text-muted-foreground mb-4">
          These are just examples. Autoweave's flexibility allows you to create virtually any automation workflow. Think about:
        </p>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li>• What manual tasks take up your time?</li>
          <li>• What events need to trigger actions?</li>
          <li>• Where do you need data synchronization?</li>
          <li>• What notifications are important?</li>
          <li>• How can AI enhance your process?</li>
        </ul>
      </div>
    </div>
  );
}