import { Plug, Mail, Calendar, AlertCircle } from "lucide-react";

export default function IntegrationGuide() {
  const integrations = [
    {
      name: "Google Calendar",
      icon: <Calendar className="w-5 h-5" />,
      description: "Create, read, and manage calendar events",
      capabilities: [
        "Create events",
        "List events",
        "Update events",
        "Delete events",
        "Set reminders",
      ],
      setup: [
        "Navigate to Integrations in settings",
        "Click 'Connect Google Calendar'",
        "Authorize the application",
        "Select your calendar",
        "Permissions will be requested for calendar access",
      ],
      color: "from-blue-500/10 to-cyan-500/10",
    },
    {
      name: "Gmail",
      icon: <Mail className="w-5 h-5" />,
      description: "Send emails and manage inbox automation",
      capabilities: [
        "Send emails",
        "Read emails",
        "Apply labels",
        "Archive emails",
        "Send attachments",
      ],
      setup: [
        "Navigate to Integrations in settings",
        "Click 'Connect Gmail'",
        "Authorize the application",
        "Grant email permissions",
        "Configure email signature (optional)",
      ],
      color: "from-red-500/10 to-pink-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Integration Guide</h2>
        <p className="text-muted-foreground mb-6">
          Connect Autoweave with external services to expand your automation capabilities.
        </p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-r ${integration.color} border border-border rounded-lg p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-cyan-400">{integration.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{integration.name}</h3>
                <p className="text-muted-foreground text-sm">{integration.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-3 text-sm">Capabilities</h4>
                <ul className="space-y-2">
                  {integration.capabilities.map((cap, capIdx) => (
                    <li key={capIdx} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-cyan-500">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3 text-sm">Setup Steps</h4>
                <ol className="space-y-2">
                  {integration.setup.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-semibold flex-shrink-0">
                        {stepIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background/50 border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Permissions & Security
        </h3>
        <div className="space-y-3 text-muted-foreground text-sm">
          <p>
            <strong>OAuth Authentication:</strong> Autoweave uses industry-standard OAuth for secure authentication. Your credentials are never stored.
          </p>
          <p>
            <strong>Minimal Permissions:</strong> We request only the permissions necessary for your specific workflow.
          </p>
          <p>
            <strong>Revoke Access:</strong> You can revoke Autoweave's access to any service at any time in your service's security settings.
          </p>
          <p>
            <strong>Encryption:</strong> All data transmitted between Autoweave and external services is encrypted.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">📋 Integration Best Practices</h3>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li>• Test integrations with a small workflow first</li>
          <li>• Keep API rate limits in mind when designing high-volume workflows</li>
          <li>• Monitor integration logs for errors and issues</li>
          <li>• Update authentication credentials before they expire</li>
          <li>• Use separate integrations for development and production</li>
        </ul>
      </div>
    </div>
  );
}