import { Bot, Sparkles, GitBranch, TrendingUp } from "lucide-react";

export default function AINodes() {
  const aiNodes = [
    {
      name: "Claude AI",
      description: "Advanced language model for text understanding and generation",
      capabilities: [
        "Text summarization",
        "Classification",
        "Content generation",
        "Email drafting",
        "Data extraction",
      ],
      example: "Summarize customer feedback emails and categorize sentiment",
    },
    {
      name: "GPT Integration",
      description: "Versatile AI model for creative and analytical tasks",
      capabilities: [
        "Creative writing",
        "Problem solving",
        "Translation",
        "Code generation",
        "Brainstorming",
      ],
      example: "Generate personalized email responses based on customer inquiries",
    },
    {
      name: "Classification",
      description: "Categorize data into predefined categories",
      capabilities: [
        "Spam detection",
        "Sentiment analysis",
        "Priority routing",
        "Anomaly detection",
        "Custom categories",
      ],
      example: "Route support tickets to the right team based on content",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-4">AI-Powered Nodes</h2>
        <p className="text-muted-foreground mb-6">
          Leverage AI to enhance your workflows with intelligent processing and decision-making powered by LangChain.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Overview
          </h3>
          <p className="text-muted-foreground mb-4">
            AI nodes process your data through advanced language models to extract insights, make decisions, and generate content. They're powered by LangChain, ensuring reliability and flexibility.
          </p>
          <div className="bg-background/30 border border-border rounded p-4">
            <p className="text-sm text-muted-foreground">
              <strong>LangChain Integration:</strong> Autoweave uses LangChain to manage AI model interactions, enabling seamless integration of multiple AI services with standardized interfaces.
            </p>
          </div>
        </div>

        {aiNodes.map((node, idx) => (
          <div key={idx} className="bg-background/50 border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              {node.name}
            </h3>
            <p className="text-muted-foreground mb-4">{node.description}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-3 text-sm">Capabilities</h4>
                <ul className="space-y-2">
                  {node.capabilities.map((cap, capIdx) => (
                    <li key={capIdx} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-cyan-500">•</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-border rounded p-4">
                <h4 className="font-semibold text-foreground mb-2 text-sm">Example Use Case</h4>
                <p className="text-sm text-muted-foreground">{node.example}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Using AI Nodes
          </h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex-shrink-0">1</span>
              <div>
                <p className="font-semibold text-foreground">Drag AI Node to Canvas</p>
                <p className="text-muted-foreground text-sm">Add the AI node type you need from the palette</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex-shrink-0">2</span>
              <div>
                <p className="font-semibold text-foreground">Configure Prompt/Parameters</p>
                <p className="text-muted-foreground text-sm">Set up the instruction or configuration for the AI model</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex-shrink-0">3</span>
              <div>
                <p className="font-semibold text-foreground">Connect Input Data</p>
                <p className="text-muted-foreground text-sm">Wire input from previous nodes to the AI node</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex-shrink-0">4</span>
              <div>
                <p className="font-semibold text-foreground">Connect Output</p>
                <p className="text-muted-foreground text-sm">Wire the AI output to subsequent nodes for further processing</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex-shrink-0">5</span>
              <div>
                <p className="font-semibold text-foreground">Test & Deploy</p>
                <p className="text-muted-foreground text-sm">Run a test execution and then deploy when satisfied</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-background/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-500" />
            Advanced Patterns
          </h3>
          <div className="space-y-3 text-muted-foreground text-sm">
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Chain Multiple AI Nodes</p>
              <p>Connect AI outputs as inputs to other AI nodes for multi-stage processing</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">Conditional AI Routing</p>
              <p>Use classification nodes to route different data types to specialized AI processors</p>
            </div>
            <div className="bg-background/30 border border-border rounded p-3">
              <p className="font-semibold text-foreground mb-1">AI with Error Handling</p>
              <p>Connect error outputs to fallback AI nodes or manual review queues</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">⚡ AI Best Practices</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>• Start with clear, specific prompts for best results</li>
            <li>• Test AI nodes with varied input to understand behavior</li>
            <li>• Use classification for structured categorization</li>
            <li>• Chain nodes for progressive refinement of results</li>
            <li>• Monitor AI costs and optimize prompt efficiency</li>
            <li>• Implement error handling for fallback scenarios</li>
          </ul>
        </div>
      </div>
    </div>
  );
}