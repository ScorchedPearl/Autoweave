## Workflow Guide — OPR Frontend

---

Appendix A: Sample serialized workflow (full example)

```json
{
  "id": "wf-sample-001",
  "name": "Example LLM ETL",
  "description": "An example workflow that extracts text, expands with LLM, and stores result",
  "schemaVersion": "1",
  "metadata": { "owner": "alice@example.com", "tags": ["example", "llm"] },
  "nodes": [
    {
      "id": "n-start",
      "type": "start",
      "label": "Manual Start",
      "config": { "startType": "manual", "initialPayload": { "text": "Hello" } },
      "outputs": { "payload": { "type": "json" } }
    },
    {
      "id": "n-llm",
      "type": "llm",
      "label": "LLM Expand",
      "config": { "model": "gpt-4", "temperature": 0.2 },
      "inputs": { "prompt": { "type": "string" } },
      "outputs": { "text": { "type": "string" } },
      "meta": { "timeoutMs": 45000 }
    },
    {
      "id": "n-transform",
      "type": "transform",
      "label": "Parse JSON",
      "config": { "script": "return JSON.parse(input);" },
      "inputs": { "input": { "type": "string" } },
      "outputs": { "doc": { "type": "json" } }
    },
    {
      "id": "n-output",
      "type": "output",
      "label": "Save to DB",
      "config": { "dest": "postgres://...", "table": "results" },
      "inputs": { "row": { "type": "json" } }
    }
  ],
  "edges": [
    { "id": "e1", "fromNode": "n-start", "fromPort": "payload", "toNode": "n-llm", "toPort": "prompt" },
    { "id": "e2", "fromNode": "n-llm", "fromPort": "text", "toNode": "n-transform", "toPort": "input" },
    { "id": "e3", "fromNode": "n-transform", "fromPort": "doc", "toNode": "n-output", "toPort": "row" }
  ]
}
```

Appendix B: Validator checklist (pre-run)

- All nodes have required config fields.
- Every required input either has an upstream edge or a runParameter default.
- No immediate type mismatches between connected ports.
- No cycles in DAG unless nodes explicitly support streaming/cycle semantics.

Appendix C: Example msw handler for mock execution stream

```ts
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:8000/api/workflows/:id', (req, res, ctx) => {
    return res(ctx.json(sampleWorkflows[0]));
  }),
  rest.post('http://localhost:8000/api/workflows/:id/run', (req, res, ctx) => {
    const execId = 'exec-mock-1';
    return res(ctx.status(202), ctx.json({ executionId: execId, startedAt: new Date().toISOString() }));
  })
];
```

Maintenance notes
- When adding new node types, remember to update documentation, node registries, serializer tests, and any sample workflows in `mockdata`.


This document describes the workflow model, node templates, execution flow, node I/O contracts, how to author custom workflows, and a pointer to mock data used by the frontend at `src/lib/mockdata.tsx`.

Audience
- Product engineers, frontend engineers, and backend engineers who need to align on workflow contracts.

Overview
- Workflows are directed graphs of nodes (functional units) connected by edges (data flow). The frontend models nodes, edges, and the execution context.

Table of contents
1. Node templates and types
2. Workflow execution flow
3. Node inputs/outputs specification
4. Creating custom workflows
5. Mock data reference (`src/lib/mockdata.tsx`)
6. Examples and troubleshooting notes

---

1) Node templates and types

The editor supports a set of canonical node types. Each node type includes metadata (id, label, category), config schema, input ports and output ports, and runtime hints (timeout, retry policy).

Core node families
- Start nodes: entry points that trigger workflow runs; may be manual or scheduled.
- Trigger nodes: integrate with external events (webhooks, cron, message queues).
- Authentication nodes: provide identity tokens, perform OTP verification, or manage secure key retrieval.
- LLM / compute nodes: call external LLM services or run code containers.
- Transform nodes: pure functions that transform data between shapes.
- Output nodes: persist results (to DB, storage) or emit webhooks.

Common node template shape (canonical JSON)

{
  "type": "llm|start|trigger|auth|transform|output",
  "id": "n-uuid",
  "label": "Human readable label",
  "config": { /* node-specific config */ },
  "inputs": { "in": { "type": "string|json|number|any" } },
  "outputs": { "out": { "type": "string|json|any" } },
  "meta": { "timeoutMs": 30000, "retry": { "maxAttempts": 3 } }
}

Start node details
- Typically have no inbound edges. They provide the initial payload or scheduling semantics.
- Config: `startType: 'manual' | 'cron' | 'webhook'`, `cronExpr` (if scheduled), `initialPayload`.

Trigger node details
- Used to connect external triggers (webhook, pubsub). They often require auth configuration and mapping rules for incoming payloads.

Authentication node details
- Provide tokens or secrets to downstream nodes. Should be configured with secure vault/backing store references, not raw secrets.
- Example: OAuth token refresher node, OTP verifier node.

LLM node details
- Config: model, temperature, maxTokens, systemPrompt. Inputs: prompt, context; Outputs: text, structured JSON.
- Must include rate-limit and cost metadata to help users avoid runaway runs.

Transform node details
- Pure functions or lightweight JS/wasm code snippets that transform data. Config usually includes the transformation source or selection.

Output node details
- Config: destination type (database, S3, webhook). Must include error handling options (retry, dead-letter queue).

Extensibility
- Node registries (`src/lib/nodeInputRegistry.ts`, `nodeOutputRegistry.ts`) define canonical input/output shapes. Update those registries when adding new node types.

---

2) Workflow execution flow

High-level lifecycle
1. Compose: user assembles nodes & edges in the editor.
2. Validate: client-side validation ensures required inputs are present and types match.
3. Save: serialized payload is persisted to backend via `POST /api/workflows`.
4. Run: user triggers a run (manual or scheduled). The frontend calls `POST /api/workflows/:id/run` and receives an executionId.
5. Execute: backend orchestrator executes nodes (possibly distributed). Frontend subscribes to execution events (SSE or websocket) and updates UI.
6. Inspect: per-node outputs and logs are available to the user.

Execution model details
- Orchestration is typically centralized on the backend: frontend requests a run, backend returns executionId and orchestrates nodes according to DAG order and node semantics.
- Parallelism: independent branches may run concurrently.
- Failure handling: node-level retry, per-workflow failure policies, optional compensation/saga semantics.

Execution event stream
- The frontend expects structured events for per-node updates: node:start, node:progress, node:success, node:error.
- Consider the event payload shape: { executionId, nodeId, status, logs, output, timestamp }.

Local validation vs server validation
- The frontend performs shallow validation (required fields, port connections, type matching). The backend performs authoritative validation during run submission and returns structured errors.

---

3) Node inputs/outputs specifications

Inputs
- Inputs are named ports with type annotations. Types are recommended: string, number, boolean, json, any, file.
- Example: `inputs: { text: { type: 'string', required: true } }`

Outputs
- Outputs are named ports produced by the node at runtime. Example: `outputs: { text: { type: 'string' }, data: { type: 'json' } }`

Type coercion & mapping
- The serializer supports simple template expressions (e.g., `{{ nodeA.outputs.text }}`) to map upstream outputs into downstream inputs.
- Provide transformation nodes for complex conversions.

Validation rules
- Required inputs must either be connected to a node output or supplied via runParameters.
- Type mismatch warnings should be surfaced in the editor.

Contracts & swagger
- If the backend maintains a swagger/openapi contract for node payloads, document the mapping in `docs/api-contracts.md` and keep the frontend serializer in sync.

---

4) How to create custom workflows

Authoring steps
1. Add node(s) to the canvas from the palette.
2. Configure node properties in the inspector.
3. Connect ports to build DAG.
4. Validate using the pre-run validator (the editor shows warnings/errors).
5. Save the workflow and optionally run it immediately.

Advanced additions (developer-level)
- To add a new node type to the editor:
  - Add node definition to `src/lib/nodeDefinitions/` (create a JSON or TS module exporting the node metadata and default config).
  - Register new node with `nodeInputRegistry` and `nodeOutputRegistry`.
  - Add a small inspector UI component in `src/components/inspector/` for configuring the node.
  - Update `serializeWorkflowData.ts` if node requires custom serialization.
  - Add unit tests for serializer and registry entries.

Custom runtime hooks
- Some nodes require backend capabilities (e.g., custom connectors). Record these requirements in node metadata and coordinate with backend teams for connectors.

Testing custom workflows
- Use `src/lib/mockdata.tsx` to create sample node outputs and unit-test nodes locally.
- Use Playwright/E2E tests to run saved workflows against a staging backend.

---

5) Mock data reference (`src/lib/mockdata.tsx`)

Location: `opr-frontend/src/lib/mockdata.tsx`

Purpose
- Provide sample workflows, node responses, and execution events for development and unit testing.

Common exports
- `sampleWorkflows`: array of workflow payloads for editor bootstrapping.
- `sampleExecutionEvents(executionId)`: generator for SSE-like events for testing runtime panels.

Using mock data in tests
- Import mock workflows to seed the editor in unit tests (msw can return these payloads for GET /api/workflows/:id).
- Use mock execution events to test `ExecutionPanel` and `PerformancePanel`.

Example (pseudo):

```ts
import { sampleWorkflows } from 'src/lib/mockdata';
it('loads sample workflow', () => {
  render(<Editor initialWorkflow={sampleWorkflows[0]} />);
  expect(screen.getByText('Call LLM')).toBeVisible();
});
```

---

6) Examples & troubleshooting notes

Example: simple LLM pipeline
- Nodes: Start -> LLM (prompt) -> Transform (parse) -> Output (save result)
- Inputs: Start supplies raw input text; LLM outputs text which Transform parses to JSON; Output persists to storage.

Common issues
- Missing runParameters: the run fails validation. Fix by providing runParameters or connecting required inputs.
- Type mismatches: update node config or add a transform node.

Debug tips
- Use the Execution snapshot endpoint `GET /api/executions/:id` to get full state when runs hang.
- Validate serializer output using unit tests that call `serializeWorkflowData(workflow)`.
