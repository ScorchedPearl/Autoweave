# API Integration Guide — OPR Frontend

Purpose
-------
This document describes the HTTP API integration contract used by the `opr-frontend` application. It is intended for frontend engineers implementing or updating `src/lib/api.ts`, backend engineers who need to verify contracts, and QA/DevOps engineers testing endpoints.

Scope
-----
- All primary endpoints the frontend calls (workflows, executions, auth).
- Authentication mechanism used by the frontend: the special header `__Pearl_Token` and server-side session approaches.
- Request and response formats for workflow operations (save/load/run).
- Error handling patterns and recommended behavior for `lib/api.ts` and hooks.
- Example code for the common API functions that live inside `src/lib/api.ts`.

Conventions used in examples
----------------------------
- baseUrl: the API base URL configured for the environment (e.g., https://api.example.com).
- All JSON examples assume application/json content-type unless noted otherwise.
- For security-sensitive tokens we recommend server-managed httpOnly cookies; the `__Pearl_Token` header is used for explicit examples where needed.

Authentication overview
-----------------------

Mechanism summary
- Primary authentication uses a short-lived bearer token exchanged at login and stored server-side as an httpOnly cookie where possible.
- In addition to cookies, the frontend sometimes sends a header `__Pearl_Token: <token>` for APIs that require explicit token-based auth (use it only over TLS).
- `lib/api.ts` should include credentials: 'include' for cookie-based sessions, and attach `__Pearl_Token` when present in memory (never persist to localStorage).

Token lifecycle
- Login returns a short-lived token and, in server-assisted flows, sets a secure httpOnly cookie.
- On 401, the client should attempt a silent refresh (via `/api/auth/refresh`) and retry the original request once.
- If refresh fails, the UI should redirect the user to the login flow.

Security guidance
- Do not store `__Pearl_Token` in localStorage. Keep it in-memory or rely on httpOnly cookies.
- Only send `__Pearl_Token` over HTTPS.
- If cookies are used, ensure SameSite and Secure attributes are set and CSRF protections are in place for state-changing requests.

Core API endpoints
------------------

This section lists the main endpoints used by the frontend. Replace `/api` with the configured `baseUrl` prefix as appropriate.

1) Workflow CRUD

- Create / Update
  - POST /api/workflows
  - Purpose: create a new workflow or update an existing one. If workflow object contains an id, server will update; otherwise, create a new workflow.
  - Headers: Authorization via cookie or `__Pearl_Token` if required.
  - Body (application/json): serialized workflow object (see "Workflow payloads" section below).
  - Response 201/200: { id, updatedAt, schemaVersion }

- Get workflow
  - GET /api/workflows/:workflowId
  - Purpose: retrieve a workflow's serialized representation.
  - Response 200: Workflow object

- Delete workflow
  - DELETE /api/workflows/:workflowId
  - Purpose: delete a workflow (soft or hard delete depends on server).
  - Response 204 No Content or 200 with confirmation payload.

2) Run / Execution

- Start run
  - POST /api/workflows/:workflowId/run
  - Purpose: start execution of a workflow by id, or accept a full workflow payload in the body for ad-hoc runs.
  - Body: { runParameters?: {}, overrides?: {} }
  - Response 202: { executionId, startedAt }

- Get execution status
  - GET /api/executions/:executionId
  - Purpose: fetch current execution snapshot and metadata.
  - Response 200: { executionId, status, nodes: [...], events: [...] }

- Stream execution events
  - GET /api/executions/:executionId/stream (SSE) or websocket at /ws/executions/:executionId
  - Purpose: receive event-by-event updates for a running execution.

3) Auth endpoints (server-defined)

- POST /api/auth/login
  - Purpose: authenticate user / start session.
  - Body: provider-specific payload (e.g., OIDC code) or email/password in dev mode.
  - Response: 200 { user: {...}, token?: "<token>" } and possibly set httpOnly cookie.

- POST /api/auth/refresh
  - Purpose: refresh session cookie or return a new token.
  - Response: 200 { token?: "<token>" }

- GET /api/auth/me
  - Purpose: return authenticated user profile.
  - Response: 200 { user: {...} }

4) Utility endpoints

- POST /api/debug/log (internal)
  - Purpose: receive telemetry/breadcrumbs from client on critical failures.

- GET /api/health
  - Purpose: lightweight health check for client-side diagnostics.

Request/response formats for workflow operations
-----------------------------------------------

Workflow payload (save/load)
----------------------------

High-level fields (frontend expects these):

- id: string (optional for new workflows)
- name: string
- description: string
- schemaVersion: string (recommended)
- metadata: object (owner, tags, visibility)
- nodes: array of node objects
- edges: array of edge objects

Node object (example):

{
  "id": "n1",
  "type": "llm",
  "label": "Call LLM",
  "config": { "model": "gpt-4", "temperature": 0.2 },
  "inputs": { "prompt": "{{input}}" },
  "outputs": { "text": "default" },
  "meta": { "timeoutMs": 30000 }
}

Edge object (example):

{
  "id": "e1",
  "fromNode": "n1",
  "fromPort": "text",
  "toNode": "n2",
  "toPort": "input"
}

Run request body (start run)
----------------------------

{
  "workflowId": "uuid-123",        // optional if you POST a full workflow body
  "runParameters": { "input": "Hello" },
  "overrides": { "n1": { "config": { "temperature": 0.1 } } }
}

Run start response (example):

HTTP 202 Accepted

{
  "executionId": "exec-123",
  "workflowId": "uuid-123",
  "startedAt": "2026-04-23T10:00:00Z",
  "status": "running"
}

Execution snapshot (example) — GET /api/executions/:executionId

{
  "executionId": "exec-123",
  "workflowId": "uuid-123",
  "status": "running",
  "nodes": [
    { "id": "n1", "status": "success", "output": { "text": "..." }, "startedAt": "...", "finishedAt": "..." }
  ],
  "events": [ /* chronological events */ ]
}

Execution event (SSE / websocket message) example

{
  "type": "node.update",
  "payload": {
    "executionId": "exec-123",
    "nodeId": "n1",
    "status": "running",
    "logs": ["..."],
    "output": null
  }
}

Authentication details: the `__Pearl_Token`
-----------------------------------------

Background
- The `__Pearl_Token` is a simple header-based token used by some endpoints to authorize explicit API calls (especially in cross-origin requests where cookies are inconvenient). It is a bearer-style token: the server validates its signature and expiry.

How to use it (frontend rules)
- When available, `lib/api.ts` should attach the header: `__Pearl_Token: <token>` to outgoing requests.
- Prefer httpOnly cookies for session continuity. Only use `__Pearl_Token` as a fallback or for third-party integrations.
- Never persist `__Pearl_Token` to long-lived storage.

Implementing token attach (pseudocode)

```ts
// pseudo: in src/lib/api.ts
function attachAuthHeaders(headers = {}) {
  // prefer cookies if server uses them, else attach token
  if (sessionInCookies()) {
    // credentials: 'include' should be used on fetch
    return headers;
  }
  const token = getInMemoryPearlToken();
  if (token) headers['__Pearl_Token'] = token;
  return headers;
}
```

Error handling patterns
-----------------------

Server error shape
- We expect API errors to follow a consistent structure:

{
  "code": "WORKFLOW_VALIDATION_ERROR",
  "message": "One or more nodes are missing required fields",
  "details": { "nodeErrors": [{ "nodeId": "n2", "errors": ["missing prompt"] }] }
}

Common error categories
- 400 Bad Request: client-side validation failed. Frontend should highlight offending fields.
- 401 Unauthorized: authentication required or token expired. Trigger refresh or redirect to login.
- 403 Forbidden: user lacks permission. Show permission error and fallback UI.
- 404 Not Found: requested resource not found.
- 409 Conflict: idempotency or resource conflict (e.g., concurrent edits). Offer user choices.
- 429 Too Many Requests: rate limiting. Back off and retry with exponential backoff.
- 5xx Server Errors: transient server issue. Retry when idempotent, surface a retry button otherwise.

Retry policy summary for frontend

- Idempotent-safe endpoints (GET, HEAD): retry up to 3 times with exponential backoff + jitter.
- Write endpoints (POST run): do not auto-retry. Surface retry action to the user.
- Use an idempotency token (Idempotency-Key) for POSTs if backend supports it, then retry safely.

Error handling best practices in hooks

- Validate on the client first; send minimal API errors to server.
- Normalize server error shapes in `lib/api.ts` so hooks can make decisions based on {code, retryable}.
- Surface friendly messages, and include debug info such as `X-Request-Id` when present.

Correlation IDs and debugging
- Client should generate and attach an `X-Request-Id` header to each state-changing request.
- When logging errors to internal telemetry, include the requestId and relevant context (workflowId, executionId, userId).

Code examples: `src/lib/api.ts` function equivalents
-------------------------------------------------

Below are concrete TypeScript-style snippets for the common functions you should find or implement in `src/lib/api.ts`. They are intentionally small and focused; adapt them to your project's HTTP client (fetch, axios, ky, etc.).

Note: these examples intentionally do not import project-specific types—use your project's types where available.

Helper: base request wrapper

```ts
const baseUrl = process.env.API_BASE_URL || '';

type ApiError = { code: string; message: string; details?: any };

async function request(path: string, opts: RequestInit = {}) {
  const url = baseUrl + path;
  const headers = new Headers(opts.headers || {});
  // attach auth header if in-memory token present
  const token = getInMemoryPearlToken();
  if (token) headers.set('__Pearl_Token', token);

  const withCreds = { ...opts, headers, credentials: 'include' };

  let res: Response;
  try {
    res = await fetch(url, withCreds);
  } catch (networkErr) {
    throw { code: 'NETWORK_ERROR', message: 'Network request failed', details: networkErr };
  }

  if (res.status === 401) {
    // attempt refresh once
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      // try again once
      const retryRes = await fetch(url, withCreds);
      return parseResponse(retryRes);
    }
    throw { code: 'UNAUTHORIZED', message: 'Not authorized' } as ApiError;
  }

  return parseResponse(res);
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  const requestId = res.headers.get('x-request-id') || undefined;
  if (res.ok) {
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  }
  // error handling
  if (contentType.includes('application/json')) {
    const payload = await res.json();
    const apiErr: ApiError = {
      code: payload.code || `HTTP_${res.status}`,
      message: payload.message || res.statusText,
      details: payload.details || undefined,
    };
    throw { ...apiErr, requestId };
  }
  throw { code: `HTTP_${res.status}`, message: res.statusText, requestId } as ApiError;
}
```

Function: saveWorkflow

```ts
export async function saveWorkflow(workflow: any) {
  const body = JSON.stringify(workflow);
  return request('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
```

Function: getWorkflow

```ts
export async function getWorkflow(workflowId: string) {
  return request(`/api/workflows/${encodeURIComponent(workflowId)}`, { method: 'GET' });
}
```

Function: runWorkflow

```ts
export async function runWorkflow(workflowId: string, options: { runParameters?: any; overrides?: any } = {}) {
  return request(`/api/workflows/${encodeURIComponent(workflowId)}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': generateIdempotencyKey() },
    body: JSON.stringify(options),
  });
}
```

Function: getExecutionStatus

```ts
export async function getExecutionStatus(executionId: string) {
  return request(`/api/executions/${encodeURIComponent(executionId)}`, { method: 'GET' });
}
```

Function: subscribeExecution (SSE)

```ts
export function subscribeExecution(executionId: string, onEvent: (ev: any) => void, onError?: (err: any) => void) {
  const url = `${baseUrl}/api/executions/${encodeURIComponent(executionId)}/stream`;
  const es = new EventSource(url, { withCredentials: true });
  es.onmessage = (evt) => {
    try {
      const parsed = JSON.parse(evt.data);
      onEvent(parsed);
    } catch (e) {
      // non-json event
      onEvent({ type: 'raw', data: evt.data });
    }
  };
  es.onerror = (err) => {
    if (onError) onError(err);
  };
  return () => es.close();
}
```

Auxiliary helpers used above (pseudocode)

```ts
function getInMemoryPearlToken(): string | null {
  // your app should keep token in a module-scoped variable or a small store
  return window.__PEARL_TOKEN__ || null;
}

async function tryRefreshSession(): Promise<boolean> {
  try {
    const res = await fetch(baseUrl + '/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) return false;
    const payload = await res.json();
    if (payload.token) setInMemoryPearlToken(payload.token);
    return true;
  } catch (e) {
    return false;
  }
}

function generateIdempotencyKey() {
  return `idemp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function setInMemoryPearlToken(token: string) {
  // store in-memory only
  (window as any).__PEARL_TOKEN__ = token;
}
```

Curl examples
-------------

Save workflow

```bash
curl -X POST https://api.example.com/api/workflows \
  -H "Content-Type: application/json" \
  -H "__Pearl_Token: $PEARL_TOKEN" \
  -d '{ "name": "Hello world", "nodes": [], "edges": [] }'
```

Start run (ad-hoc)

```bash
curl -X POST https://api.example.com/api/workflows/uuid-123/run \
  -H "Content-Type: application/json" \
  -H "__Pearl_Token: $PEARL_TOKEN" \
  -d '{ "runParameters": {"input":"test"} }'
```

Handling streaming via websocket (example JS client)

```js
const ws = new WebSocket('wss://api.example.com/ws/executions/exec-123');
ws.onmessage = (evt) => console.log('event', JSON.parse(evt.data));
```

Testing and mock patterns for frontend
-------------------------------------

- Use `msw` (Mock Service Worker) to author deterministic API responses and streamable events in tests.
- For SSE tests, polyfill EventSource or use a mock server that emits SSE messages.
- When testing retry logic, simulate network failures and 5xx responses with controlled delays.

Operational considerations
------------------------

Rate limiting and backoff
- If backend returns 429, read `Retry-After` (if present) and respect it. If missing, apply exponential backoff starting at 500ms.

Large payloads
- For very large workflows, consider chunked upload or storing large node artifacts separately (S3/Blob) and referencing them in node configs.

Telemetry
- Emit events for workflow save, run start, run finish, runtime failure. Include executionId and requestId.

Versioning and migrations
- Add `schemaVersion` to saved workflows. Backend and frontend should maintain migration helpers.

Appendix: Example full request/response pairs
--------------------------------------------

1) Save workflow (request)

POST /api/workflows

Request body:

{
  "name": "Example workflow",
  "description": "Demo",
  "schemaVersion": "1",
  "metadata": { "owner": "user@example.com" },
  "nodes": [ { "id": "n1", "type": "llm", "config": { "model": "gpt-4" } } ],
  "edges": []
}

Response 201

{
  "id": "uuid-abc",
  "updatedAt": "2026-04-23T10:01:00Z",
  "schemaVersion": "1"
}

2) Start run (request)

POST /api/workflows/uuid-abc/run

Request body:

{
  "runParameters": { "input": "Hello" },
  "overrides": {}
}

Response 202

{
  "executionId": "exec-789",
  "workflowId": "uuid-abc",
  "startedAt": "2026-04-23T10:02:00Z",
  "status": "running"
}

3) Execution update (SSE message)

data: { "type": "node.update", "payload": { "executionId": "exec-789", "nodeId": "n1", "status": "success", "output": { "text": "OK" } } }

Change management notes
-----------------------

- When changing request or response shapes, update this document and coordinate with backend engineers. Consider API versioning (e.g., /v1/, /v2/) for breaking changes.

FAQ
---

Q: Why both cookies and `__Pearl_Token`?
A: Cookies provide session convenience and CSRF protections; header tokens provide explicit auth for cross-origin or server-to-server scenarios.

Q: Where to put retry logic?
A: Keep network-level retry logic centralized in `lib/api.ts` so hooks do not have to reimplement it.

Q: How do I debug an execution that never completes?
A: Check websocket/SSE connectivity, server logs (with X-Request-Id), and node-level timeouts. Use `GET /api/executions/:id` for a snapshot.


