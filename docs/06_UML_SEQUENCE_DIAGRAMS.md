# UML Sequence Diagrams - AutoWeave

## 1. User Authentication & Registration Sequence

### 1.1 User Registration Flow

```
User                Browser          API Server        Database        Email Service
│                    │                    │                │                 │
├─ Register Form ──►│                    │                │                 │
│                    │─ POST /register ──►│                │                 │
│                    │  (email, password) │                │                 │
│                    │                    ├─ Validate ────►│                 │
│                    │                    │◄─ Success ─────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Hash Password │                 │
│                    │                    ├─ Create User ─►│                 │
│                    │                    │◄─ User ID ─────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Generate OTP ─┤                 │
│                    │                    ├─ Send Email ──────────────────► │
│                    │                    │                │                 │
│                    │◄─ 201 Created ────│                │                 │
│                    │  (with token)      │                │                 │
│                    │                    │◄─ Email Sent ──────────────────┤
│                    │                    │                │                 │
│◄─ Verification ───┤                    │                │                 │
│    Email           │                    │                │                 │
│                    │                    │                │                 │
```

### 1.2 User Login with 2FA/OTP

```
User                Browser          API Server        Database        OTP Service
│                    │                    │                │                 │
├─ Enter Creds ────►│                    │                │                 │
│                    │─ POST /login ─────►│                │                 │
│                    │  (email, password) │                │                 │
│                    │                    ├─ Find User ───►│                 │
│                    │                    │◄─ User Data ───┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Verify Pwd ───┤                 │
│                    │                    │ (bcrypt)        │                 │
│                    │                    │                │                 │
│                    │                    ├─ Check 2FA ───►│                 │
│                    │                    │◄─ Enabled ─────┤                 │
│                    │                    │                │                 │
│                    │◄─ 200 OK ─────────│                │                 │
│                    │  (requires OTP)    │                │                 │
│                    │                    │                │                 │
├─ Enter OTP ──────►│                    │                │                 │
│                    │─ POST /verify-otp ►│                │                 │
│                    │  (otp_code)        │                │                 │
│                    │                    ├─ Validate OTP ─┼────────────────►│
│                    │                    │                │                 │
│                    │                    │◄─ Valid ─────────────────────────┤
│                    │                    │                │                 │
│                    │                    ├─ Create Token ─┤                 │
│                    │                    ├─ Store Token ─►│                 │
│                    │                    │◄─ Stored ──────┤                 │
│                    │                    │                │                 │
│                    │◄─ 200 OK ─────────│                │                 │
│                    │  (auth_token,      │                │                 │
│                    │   refresh_token)   │                │                 │
│                    │                    │                │                 │
│◄─ Redirect to ────┤                    │                │                 │
│    Dashboard       │                    │                │                 │
│                    │                    │                │                 │
```

---

## 2. Workflow Creation & Management Sequences

### 2.1 Create New Workflow

```
User             Frontend          API Server        Database        Cache (Redis)
│                    │                    │                │                 │
├─ Create Workflow ─►│                    │                │                 │
│  (name, desc)      │                    │                │                 │
│                    │─ POST /workflows ─►│                │                 │
│                    │  (JSON payload)    │                │                 │
│                    │                    ├─ Validate ────►│                 │
│                    │                    │◄─ OK ──────────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Create WF ───►│                 │
│                    │                    │◄─ WF ID ───────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Create V1 ───►│                 │
│                    │                    │◄─ Version ID ──┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Cache WF ────────────────────► │
│                    │                    │                │                 │
│                    │◄─ 201 Created ────│                │                 │
│                    │  (workflow_id,     │                │                 │
│                    │   version_id)      │                │                 │
│                    │                    │◄─ Cached ──────────────────────┤
│                    │                    │                │                 │
│◄─ Workflow ID ────┤                    │                │                 │
│                    │                    │                │                 │
```

### 2.2 Add Node to Workflow

```
User             Frontend          Editor Service     API Server        Database
│                    │                    │                │                 │
├─ Drag Node ──────►│                    │                │                 │
│  (node_type,      │                    │                │                 │
│   position)        │                    │                │                 │
│                    │─ POST /nodes ─────►│                │                 │
│                    │  (workflow_id,     │                │                 │
│                    │   node_data)       │                │                 │
│                    │                    ├─ Validate ────►│                 │
│                    │                    │◄─ OK ──────────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Create Node ─►│                 │
│                    │                    │◄─ Node ID ─────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Link to WF ──►│                 │
│                    │                    │◄─ Updated ─────┤                 │
│                    │                    │                │                 │
│                    │◄─ 200 OK ─────���───│                │                 │
│                    │  (node_id,         │                │                 │
│                    │   node_config)     │                │                 │
│                    │                    │                │                 │
│◄─ Node Added ─────┤                    │                │                 │
│    (visual)        │                    │                │                 │
│                    │                    │                │                 │
```

### 2.3 Connect Nodes with Edge

```
User             Frontend          Editor Service     API Server        Database
│                    │                    │                │                 │
├─ Connect Nodes ──►│                    │                │                 │
│  (from_node,      │                    │                │                 │
│   to_node)        │                    │                 │
│                    │─ POST /edges ─────►│                │                 │
│                    │  (workflow_id,     │                │                 │
│                    │   source_node_id,  │                │                 │
│                    │   target_node_id)  │                │                 │
│                    │                    ├─ Validate Edge ►│                │
│                    │                    │◄─ OK ──────────┤                 │
│                    │                    │ (type compat)  │                 │
│                    │                    │                │                 │
│                    │                    ├─ Check Types ─►│                 │
│                    │                    │◄─ Compatible ──┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Create Edge ─►│                 │
│                    │                    │◄─ Edge ID ─────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Update Nodes ►│                 │
│                    │                    │◄─ Updated ─────┤                 │
│                    │                    │                │                 │
│                    │◄─ 200 OK ─────────│                │                 │
│                    │  (edge_id,         │                │                 │
│                    │   connection_info) │                │                 │
│                    │                    │                │                 │
│◄─ Edge Rendered ──┤                    │                │                 │
│    (visual)        │                    │                │                 │
│                    │                    │                │                 │
```

### 2.4 Publish Workflow

```
User             Frontend          API Server        Database        Message Queue (Kafka)
│                    │                    │                │                 │
├─ Publish Btn ────►│                    │                │                 │
│                    │─ POST /publish ───►│                │                 │
│                    │  (workflow_id)     │                │                 │
│                    │                    ├─ Validate WF ─►│                 │
│                    │                    │◄─ Valid ───────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Check Nodes ─►│                 │
│                    │                    │◄─ OK ──────────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Update Status►│                 │
│                    │                    │ (PUBLISHED)    │                 │
│                    │                    │◄─ Updated ─────┤                 │
│                    │                    │                │                 │
│                    │                    ├─ Publish Event ───────────────► │
│                    │                    │ (workflow.published)             │
│                    │                    │                │◄─ Acknowledged ┤
│                    │                    │                │                 │
│                    │◄─ 200 OK ─────────│                │                 │
│                    │  (success,         │                │                 │
│                    │   metadata)        │                │                 │
│                    │                    │                │                 │
│◄─ Success Toast ──┤                    │                │                 │
│                    │                    │                │                 │
```

---

## 3. Workflow Execution Sequences

### 3.1 Manual Workflow Execution

```
User             Frontend          Executor           Worker 1          Worker 2          Database
│                    │                    │                │                │                 │
├─ Execute Btn ────►│                    │                │                │                 │
│                    │─ POST /execute ───►│                │                │                 │
│                    │  (workflow_id)     │                │                │                 │
│                    │                    ├─ Load WF ─────────────────────────────────────► │
│                    │                    │◄─ Workflow Data ───────────────────────────────┤
│                    │                    │                │                │                 │
│                    │                    ├─ Create Exec ─────────────────────────────────► │
│                    │                    │◄─ Execution ID ────────────────────────────────┤
│                    │                    │                │                │                 │
│                    │◄─ 202 Accepted ───│                │                │                 │
│                    │  (execution_id)    │                │                │                 │
│                    │                    │                │                │                 │
│◄─ Execution ID ───┤                    │                │                │                 │
│                    │                    ├─ Dequeue Node 1 ──────────────►│                 │
│                    │                    │◄─ Processing ──────────────────┤                 │
│                    │                    │                │                │                 │
│                    │                    ├─ Dequeue Node 2 ──────────────────────────────►│
│                    │                    │◄─ Processing ──────────────────────────────────┤
│                    │                    │                │                │                 │
│                    │─ GET /status ─────►│                │                │                 │
│                    │  (execution_id)    │                │                │                 │
│                    │                    ├─ Get Exec Status ─────────────────────────────►│
│                    │                    │◄─ Status ──────────────────────────────────────┤
│                    │                    │  (RUNNING)     │                │                 │
│                    │                    │                │                │                 │
│                    │◄─ 200 OK ─────────│                │                │                 │
│                    │  (status: RUNNING)│                │                │                 │
│                    ���                    │                │                │                 │
│                    │  [polling...]      │  Node 1 Done   │                │                 │
│                    │                    │◄───────────────┤                │                 │
│                    │                    │                │ Update Log ───►│                 │
│                    │                    │                │                │◄─ Logged ──────┤
│                    │                    │                │                │                 │
│                    │                    │  Node 2 Done   │                │                 │
│                    │                    │◄──────────────────────────────┤                 │
│                    │                    │                │ Update Log ───►│                 │
│                    │                    │                │                │◄─ Logged ──────┤
│                    │                    │                │                │                 │
│                    │                    ├─ Update Exec Status ──────────────────────────►│
│                    │                    │ (COMPLETED)    │                │                 │
│                    │                    │◄─ Updated ─────────────────────────────────────┤
│                    │                    │                │                │                 │
│                    │─ GET /status ─────►│                │                │                 │
│                    │  (execution_id)    │                │                │                 │
│                    │◄─ 200 OK ─────────│                │                │                 │
│                    │  (status:          │                │                │                 │
│                    │   COMPLETED)       │                │                │                 │
│                    │                    │                │                │                 │
│◄─ Execution Done ─┤                    │                │                │                 │
│    (Success)       │                    │                │                │                 │
│                    │                    │                │                │                 │
```

### 3.2 Scheduled Workflow Execution

```
Scheduler            Trigger Service   Executor           Worker Pool       Database
│                    │                    │                    │                 │
├─ Check Schedule ───┤                    │                    │                 │
│  (every min)       │                    │                    │                 │
│                    ├─ Load Schedules ──►│                    │                 │
│                    │◄─ Schedule List ───┤                    │                 │
│                    │                    │                    │                 │
│                    │ [Match found]      │                    │                 │
│                    │                    ├─ Create Trigger ──►│                 │
│                    │                    │  (workflow_id,     │                 │
│                    │                    │   schedule_time)   │                 │
│                    │                    │                    │                 │
│                    │                    ├─ Create Exec ──────────────────────►│
│                    │                    │◄─ Execution ID ────────────────────┤
│                    │                    │                    │                 │
│                    │                    ├─ Queue Job ───────►│                 │
│                    │                    │◄─ Queued ──────────┤                 │
│                    │                    │                    │                 │
│                    │                    │                    ├─ Process Node 1 │
│                    │                    │                    ├─ Process Node 2 │
│                    │                    │                    ├─ ... Process ... │
│                    │                    │                    │                 │
│                    │                    │                    ├─ Update Logs ─►│
│                    │                    │◄─ Results ─────────│                 │
│                    │                    │                    │                 │
│                    │                    ├─ Update Exec ─────────────────────►│
│                    │                    │ (COMPLETED)        │                 │
│                    │                    │◄─ Updated ─────────────────────────┤
│                    │                    │                    │                 │
│                    │◄─ Execution Done ──┤                    │                 │
│                    │  (success/failure) │                    │                 │
│                    │                    │                    │                 │
│◄─ Log Entry ───────┤                    │                    │                 │
│  (scheduled)       │                    │                    │                 │
│                    │                    │                    │                 │
```

### 3.3 Webhook Trigger Execution

```
External System      Webhook Endpoint   Trigger Service    Executor        Database
│                    │                    │                    │                 │
├─ POST /webhook ───►│                    │                    │                 │
│  (payload)         │                    │                    │                 │
│                    ├─ Verify Signature ─┤                    │                 │
│                    │ (HMAC-SHA256)      │                    │                 │
│                    │                    │                    │                 │
│                    ├─ Validate Payload ─┤                    │                 │
│                    │                    │                    │                 │
│                    ├─ Queue Event ─────►│                    │                 │
│                    │  (workflow_id,     │                    │                 │
│                    │   payload)         │                    │                 │
│                    │                    │                    │                 │
│                    │◄─ 202 Accepted ────│                    │                 │
│                    │                    │                    │                 │
│◄─ 202 Accepted ───┤                    │                    │                 │
│  (webhook_id)      │                    │                    │                 │
│                    │                    │                    │                 │
│                    │                    ├─ Process Event ───►│                 │
│                    │                    │  (create execution)│                 │
│                    │                    │                    │                 │
│                    │                    │                    ├─ Create Exec ─►│
│                    │                    │                    │◄─ Exec ID ────┤
│                    │                    │                    │                 │
│                    │                    │                    ├─ Execute Nodes│
│                    │                    │                    ├─ ... Process ..│
│                    │                    │                    │                 │
│                    │                    ├─ Log Webhook ────────────────────►│
│                    │                    │  (processed)       │                 │
│                    │                    │◄─ Logged ─────────────────────────┤
│                    │                    │                    │                 │
```

---

## 4. Integration & Authentication Sequences

### 4.1 Google Calendar Integration Flow

```
User             Frontend          API Server        OAuth 2.0         Google API         Database
│                    │                    │           Server             Server              │
├─ Connect Calendar ►│                    │                │                │                 │
│                    │─ POST /integrations│                │                │                 │
│                    │  /google/auth ────►│                │                │                 │
│                    │                    ├─ Generate State│                │                 │
│                    │                    │   + PKCE Code  │                │                 │
│                    │                    │                │                │                 │
│                    │◄─ Redirect URL ───┼─────────────────────────────────┤                 │
│                    │  (auth_uri)        │                │                │                 │
│                    │                    │                │                │                 │
│◄─ Redirect ────────┤                    │                │                │                 │
│   to Google        │                    │                │                │                 │
│                    │─────────────────────────────────────┤                │                 │
│                    │  (client_id, state│                │                │                 │
│                    │   redirect_uri)    │                │                │                 │
│                    │                    │                ├─ Show Login ──►│                 │
│                    │ [User authenticates and grants permission to Google]  │
│                    │                    │                │                │                 │
│                    │◄────────────────────────────────────┤                │                 │
│                    │  (code, state)     │                │                │                 │
│                    │                    │                │                │                 │
│                    │─ GET /callback ───►│                │                │                 │
│                    │  ?code=XXX&state=YY│                │                │                 │
│                    │                    ├─ Validate State│                │                 │
│                    │                    │                │                │                 │
│                    │                    ├─ POST Token ──────────────────►│                 │
│                    │                    │  Request        │                │                 │
│                    │                    │  (code,         │                │                 │
│                    │                    │   client_id,    │                │                 │
│                    │                    │   client_secret)│                │                 │
│                    │                    │                │◄─ Access Token ┤                 │
│                    │                    │                │    Refresh     │                 │
│                    │                    │                │    Token ID    │                 │
│                    │                    │                │                │                 │
│                    │                    ├─ Get User Info ────────────────►│                 │
│                    │                    │  (access_token)│                │                 │
│                    │                    │                │◄─ User Info ──┤                 │
│                    │                    │                │                │                 │
│                    │                    ├─ Create Integration ──────────►│                 │
│                    │                    │  (user_id,     │                │                 │
│                    │                    │   access_token,│                │                 │
│                    │                    │   refresh_token│                │                 │
│                    │                    │◄─ Integration ID ──────────────┤                 │
│                    │                    │                │                │                 │
│                    │◄─ 302 Redirect ───│                │                │                 │
│                    │  (dashboard)       │                │                │                 │
│                    │                    │                │                │                 │
│◄─ Connected ───────┤                    │                │                │                 │
│    (success)       │                    │                │                │                 │
│                    │                    │                │                │                 │
```

### 4.2 Integration Test Connection

```
User             Frontend          API Server        Integration Service    Google Calendar
│                    │                    │                    │                 │
├─ Test Connection ─►│                    │                    │                 │
│                    │─ POST /test-conn ─►��                    │                 │
│                    │  (integration_id)  │                    │                 │
│                    │                    ├─ Load Integration ─►│                 │
│                    │◄─ Credentials ─────┤                    │                 │
│                    │                    │                    │                 │
│                    │                    ├─ Check Token ──────┤                 │
│                    │                    │ (not expired?)     │                 │
│                    │                    │                    │                 │
│                    │                    ├─ GET /calendar ───────────────────►│
│                    │                    │  (access_token)    │                 │
│                    │                    │                    │◄─ Calendars ──┤
│                    │                    │◄─ Success ────────┤                 │
│                    │                    │                    │                 │
│                    │◄─ 200 OK ─────────│                    │                 │
│                    │  (connected: true) │                    │                 │
│                    │                    │                    │                 │
│◄─ Status: ────────┤                    │                    │                 │
│    Connected       │                    │                    │                 │
│                    │                    │                    │                 │
```

### 4.3 Integration Credential Refresh

```
Task Scheduler      Integration Svc     Database        Google OAuth        Google API
│                   │                       │              Server             Server
│ [Token Expiry ─►  │                       │                │                 │
│  Check]           │                       │                │                 │
│                   ├─ Find Expired ──────►│                 │                 │
│                   │  Tokens              │                 │                 │
│                   │◄─ Integration List ──┤                 │                 │
│                   │                       │                 │                 │
│◄─ Expired Found ──┤                       │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Load Refresh Token ►│                 │                 │
│                   │◄─ Token ──────────────┤                 │                 │
│                   │                       │                 │                 │
│                   ├─ POST Token Endpoint ─────────────────►│                 │
│                   │  (refresh_token,      │                 │                 │
│                   │   client_id,          │                 │                 │
│                   │   client_secret)      │                 │                 │
│                   │                       │                 ├─ Validate ────►│
│                   │                       │                 │◄─ New Access ──┤
│                   │                       │                 │    Token       │
│                   │◄─ New Access Token ───────────────────┤                 │
│                   │                       │                 │                 │
│                   ├─ Update Credentials ─►│                 │                 │
│                   │  (new_access_token)   │                 │                 │
│                   │◄─ Updated ─────────────┤                 │                 │
│                   │                       │                 │                 │
│◄─ Token Refreshed ┤                       │                 │                 │
│                   │                       │                 │                 │
```

---

## 5. Node Execution Sequences

### 5.1 HTTP Action Node Execution

```
Executor            HTTP Node          HTTP Client        External API        Database
│                   │                       │                 │                 │
├─ Execute Node ───►│                       │                 │                 │
│  (node_id,        │                       │                 │                 │
│   inputs)         │                       │                 │                 │
│                   ├─ Get Config ──────────────────────────────────────────► │
│                   │◄─ Node Config ─────────────────────────────────────────┤
│                   │  (url, method,       │                 │                 │
│                   │   headers, body)     │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Validate Inputs ────┤                 │                 │
│                   │ (required params)     │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Build Request ──────┤                 │                 │
│                   │ (headers, auth)       │                 │                 │
│                   │                       │                 │                 │
│                   │                       ├─ HTTP Method ────────────────► │
│                   │                       │ (GET/POST/etc)  │                 │
│                   │                       │                 ├─ Process ────► │
│                   │                       │                 │◄─ Response ───┤
│                   │                       │◄─ Response ────┤                 │
│                   │                       │  (status_code, │                 │
│                   │                       │   headers,     │                 │
│                   │                       │   body)        │                 │
│                   │                       │                 │                 │
│                   ├─ Parse Response ──────┤                 │                 │
│                   │ (JSON/XML/etc)        │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Validate Response ───┤                 │                 │
│                   │ (schema check)        │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Map Output ──────────┤                 │                 │
│                   │ (field mapping)       │                 │                 │
│                   │                       │                 │                 │
│                   ├─ Store Result ────────────────────────────────────────► │
│                   │◄─ Stored ──────────────────────────────────────────────┤
│                   │  (node_exec_id,      │                 │                 │
│                   │   output)             │                 │                 │
│                   │                       │                 │                 │
│◄─ Success + ──────┤                       │                 │                 │
│   Output          │                       │                 │                 │
│                   │                       │                 │                 │
```

### 5.2 LLM (AI) Node Execution with Streaming

```
Executor            LLM Node           LLMService         LangChain          LLM API (OpenAI)
│                   │                      │                  │                 │
├─ Execute Node ───►│                      │                  │                 │
│  (node_id,        │                      │                  │                 │
│   inputs)         │                      │                 │                 │
│                   ├─ Get Config ────────►│                  │                 │
│                   │◄─ Model, Params ────┤                  │                 │
│                   │                      │                  │                 │
│                   ├─ Prepare Prompt ────┤                  │                 │
│                   │ (substitute vars)    │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Call LLM ──────────────────────────────┤                 │
│                   │  (prompt, model,     │                  │                 │
│                   │   temperature, etc)  │                  ├─ Send Req ────►│
│                   │                      │                  │◄─ Stream Token ┤
│                   │                      │◄─ Token Stream ──┤                 │
│                   │                      │  (real-time)     │                 │
│                   │                      │                  │                 │
│                   ├─ Buffer Output ──────┤                  │                 │
│                   │ (accumulate tokens)  │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Process/Format ────┤                  │                 │
│                   │ (output)             │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Validate Output ────┤                  │                 │
│                   │ (token count,        │                  │                 │
│                   │  content filter)     │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Store Result ──────────────────────────────────────────► │
│                   │◄─ Stored ────────────────────────────────────────────────┤
│                   │                      │                  │                 │
│◄─ Success + ──────┤                      │                  │                 │
│   LLM Output      │                      │                  │                 │
│                   │                      │                  │                 │
```

### 5.3 Database Query Node Execution

```
Executor            DB Node            Connection Pool     PostgreSQL         Cache
│                   │                      │                  │                 │
├─ Execute Node ───►│                      │                  │                 │
│  (node_id,        │                      │                  │                 │
│   inputs)         │                      │                  │                 │
│                   ├─ Get Query ──────────────────────────────────────────────► │
│                   │◄─ Query Config ────────────────────────────────────────────┤
│                   │  (sql, params,      │                  │                 │
│                   │   timeout)          │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Check Cache ────────────────────────────────────────────► │
│                   │◄─ Cache Hit? ──────────────────────────────────────────────┤
│                   │  (if exists)        │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Get Connection ───►│                  │                 │
│                   │◄─ Connection ───────┤                  │                 │
│                   │  (from pool)        │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Prepare Statement ─┤                  │                 │
│                   │ (parameter binding) │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Execute Query ─────────────────────────────────────────► │
│                   │                      ├─ Parse SQL ─────►│                 │
│                   │                      │◄─ Execution Plan ┤                 │
│                   │                      │                  ├─ Execute ────► │
│                   │                      │                  │◄─ Results ────┤
│                   │                      │◄─ Result Rows ──┤                 │
│                   │                      │                  │                 │
│                   ├─ Process Rows ──────┤                  │                 │
│                   │ (pagination,        │                  │                 │
│                   │  formatting)        │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Cache Results ────────────────────────────────────────────► │
│                   │◄─ Cached ──────────────────────────────────────────────────┤
│                   │  (ttl: 5 min)       │                  │                 │
│                   │                      │                  │                 │
│                   ├─ Close Connection ─►│                  │                 │
│                   │◄─ Released ──────────┤                  │                 │
│                   │                      │                  │                 │
│◄─ Success + ──────┤                      │                  │                 │
│   Result Rows     │                      │                  │                 │
│                   │                      │                  │                 │
```

### 5.4 Conditional Logic Node

```
Executor            Logic Node         Evaluator           Database
│                   │                      │                  │
├─ Execute Node ───►│                      │                  │
│  (node_id,        │                      │                  │
│   inputs)         │                      │                  │
│                   ├─ Get Conditions ────────────────────────► │
│                   │◄─ Condition List ────────────────────────┤
│                   │  (expressions,      │                  │
│                   │   operators)        │                  │
│                   │                      │                  │
│                   ├─ Prepare Context ───┤                  │
│                   │ (input vars, state) │                  │
│                   │                      │                  │
│                   ├─ Evaluate Cond 1 ──►│                  │
│                   │ (if x > 10)         │                  │
│                   │◄─ Result: TRUE ─────┤                  │
│                   │                      │                  │
│                   ├─ Branch 1 Execute ──────────────────────► │
│                   │ (true_path_node)    │                  │
│                   │                      │                  │
│                   ├─ Evaluate Cond 2 ──►│                  │
│                   │ (else if y < 5)     │                  │
│                   │◄─ Result: FALSE ────┤                  │
│                   │                      │                  │
│                   ├─ Evaluate Else ────►│                  │
│                   │                      │                  │
│                   │◄─ Result: Execute ──┤                  │
│                   │  default_path       │                  │
│                   │                      │                  │
│                   ├─ Branch 3 Execute ──────────────────────► │
│                   │ (default_path_node) │                  │
│                   │                      │                  │
│◄─ Success + ──────┤                      │                  │
│   Taken Path      │                      │                  │
│                   │                      │                  │
```

---

## 6. Error Handling & Recovery Sequences

### 6.1 Node Execution with Error Handling

```
Executor            Action Node         ErrorHandler        Notification Svc    Database
│                   │                       │                      │                 │
├─ Execute Node ───►│                       │                      │                 │
│  (node_id,        │                       │                      │                 │
│   inputs)         │                       │                      │                 │
│                   ├─ Try Execute ─────────┤                      │                 │
│                   │ (HTTP request)        │                      │                 │
│                   │◄─ ERROR: 500 ─────────┤                      │                 │
│                   │  Server Error         │                      │                 │
│                   │                       │                      │                 │
│                   ├─ Error Triggered ────►│                      │                 │
│                   │  (exception)          │                      │                 │
│                   │                       ├─ Match Error ────────────────────────► │
│                   │                       │ (code: 500)          │                 │
│                   │◄─ Matches Config ─────┤                      │                 │
│                   │                       ├─ Get Strategy ───────────────────────► │
│                   │                       │◄─ RETRY (3x) ────────────────────────┤
│                   │                       │                      │                 │
│                   ├─ Retry Attempt 1 ────┤                      │                 │
│                   │ (delay: 1s)           │                      │                 │
│                   │◄─ ERROR: 502 ─────────┤                      │                 │
│                   │  Bad Gateway         │                      │                 │
│                   │                       │                      │                 │
│                   ├─ Retry Attempt 2 ────┤                      │                 │
│                   │ (delay: 2s)           │                      │                 │
│                   │◄─ ERROR: 503 ─────────┤                      │                 │
│                   │  Service Unavailable │                      │                 │
│                   │                       │                      │                 │
│                   ├─ Retry Attempt 3 ────┤                      │                 │
│                   │ (delay: 4s)           │                      │                 │
│                   │◄─ SUCCESS: 200 ───────┤                      │                 │
│                   │  OK                   │                      │                 │
│                   │                       │                      │                 │
│                   ├─ Return Result ───────────────────────────────────────────────► │
│                   │◄─ Success ────────────────────────────────────────────────────┤
│                   │                       │                      │                 │
│◄─ Recovered ──────┤                       │                      │                 │
│   (after 3 tries)  │                       │                      │                 │
│                   │                       │                      │                 │
```

### 6.2 Node Failure with Fallback

```
Executor            Action Node         ErrorHandler        Fallback Node       Database
│                   │                       │                      │                 │
├─ Execute Node ───►│                       │                      │                 │
│  (node_id,        │                       │                      │                 │
│   inputs)         │                       │                      │                 │
│                   ├─ Execute Action ──────┤                      │                 │
│                   │                       │                      │                 │
│                   │◄─ FATAL ERROR ────────┤                      │                 │
│                   │  (invalid config)     │                      │                 │
│                   │                       │                      │                 │
│                   ├─ Error Triggered ────►│                      │                 │
│                   │  (exception)          │                      │                 │
│                   │                       ├─ Match Error ─────────────────────────► │
│                   │                       │ (not recoverable)    │                 │
│                   │                       │                      │                 │
│                   │                       ├─ Strategy: FALLBACK ─────────────────► │
│                   │                       │◄─ Fallback Node ID ──────────────────┤
│                   │                       │  (default_handler)   │                 │
│                   │                       │                      │                 │
│                   │◄─ Fallback Triggered ┤                      │                 │
│                   │                       │                      ├─ Execute ────► │
│                   │                       │                      │ (safe default) │
│                   │                       │                      │◄─ Return ────┤
│                   │                       │                      │ (fallback value)
│                   │                       │                      │                 │
│                   ├─ Return Fallback ────────────────────────────────────────────► │
│                   │  Output              │                      │                 │
│                   │◄─ Stored ──────────────────────────────────────────────────────┤
│                   │                       │                      │                 │
│◄─ Fallback Used ──┤                       │                      │                 │
│   (graceful       │                       │                      │                 │
│    degradation)   │                       │                      │                 │
│                   │                       │                      │                 │
```

### 6.3 Execution Timeout & Cancellation

```
Executor            Action Node         Timeout Monitor     Notification Svc    Database
│                   │                       │                      │                 │
├─ Execute Node ───►│                       │                      │                 │
│  (node_id,        ├─ Start Timer ────────►│                      │                 │
│   timeout: 30s)   │  (30 seconds)        │                      │                 │
│                   │◄─ Monitoring ─────────┤                      │                 │
│                   │                       │                      │                 │
│                   ├─ Long Operation ──────┤                      │                 │
│                   │ (call external API)   │                      │                 │
│                   │                       ├─ Check Elapsed ──────────────────────► │
│                   │  25 seconds...        │ (25 sec)             │                 │
│                   │                       │◄─ OK ────────────────────────────────┤
│                   │                       │                      │                 │
│                   │  26, 27, 28... 29s    ├─ Threshold Reached ─┤                 │
│                   │                       │ (30 sec)             │                 │
│                   │                       │                      │                 │
│                   │◄─ TIMEOUT ─────────────────────────────────────────────────────┤
│                   │  (forced stop)        ├─ Send Notification ─────────────────► │
│                   │                       │                      ├─ Alert User ──► │
│                   │                       │                      │◄─ Sent ────────┤
│                   │                       │                      │                 │
│                   ├─ Cleanup ─────────────────────────────────────────────────────► │
│                   │ (close connections,   │                      │                 │
│                   │  release resources)   │                      │                 │
│                   │◄─ Cleaned ────────────────────────────────────────────────────┤
│                   │                       │                      │                 │
│◄─ TIMEOUT ────────┤                       │                      │                 │
│   (execution      │                       │                      │                 │
│    failed)        │                       │                      │                 │
│                   │                       │                      │                 │
```

---

## 7. Data Flow Through Edges

### 7.1 Data Transformation Between Nodes

```
Node 1 Output        Edge Data          Data Transform       Edge             Node 2 Input
(raw API response)   (connection)       (mapping/filter)     (connection)     (formatted data)
│                    │                      │                    │                │
├─ Response JSON ───►│                      │                    │                │
│  {"user": {        │                      ├─ Load Mapping ─────┤                │
│    "id": 123,      │                      │ (user.id -> user_id)                │
│    "name": "John", │                      │                    │                │
│    "email": "j@x"} │◄─ Pass Data ────────►│                    │                │
│  }                 │  (raw)               │ ├─ Extract ────────┤                │
│                    │                      │ │ (user.id)        │                │
│                    │                      │ ├─ Rename ─────────┤                │
│                    │                      │ │ (user_id)        │                │
│                    │                      │ ├─ Format ─────────┤                │
│                    │                      │ │ (as integer)     │                │
│                    │                      │ ├─ Validate ───────┤                │
│                    │                      │ │ (not null)       │                │
│                    │                      │ ├─ Pass ───────────────────────────►│
│                    │                      │ │ {"user_id": 123} │                │
│                    │                      │ │                  │                │
│                    │                      │ └─ Log Transform ──┤                │
│                    │                      │   (mapping_id,     │                │
│                    │                      │    source_value,   │                │
│                    │                      │    transformed_val)│                │
│                    │                      │                    │                │
│                    │                      │                    ◄──── Input Recv─┤
│                    │                      │                    │ (user_id: 123) │
│                    │                      │                    │                │
```

### 7.2 Conditional Data Routing

```
Evaluator Node       Edge 1             Node 2A            Edge 2             Node 3
(condition check)    (true path)        (if true)          (result)           (next node)
│                    │                  │                  │                  │
├─ Evaluate ─────────┤                  │                  │                  │
│ condition:         │                  │                  │                  │
│ balance > 1000     │                  │                  │                  │
│                    │                  │                  │                  │
│◄─ Result: TRUE ────┤                  │                  │                  │
│                    ├─ Pass Data ──────────────────────►│                  │
│                    │ (balance, user)  │                  │                  │
│                    │                  ├─ Process ───────►│                  │
│                    │                  │ (premium offer)  ├─ Return Result ─►│
│                    │                  │                  │ (offer_code:    │
│                    │                  │                  │  PREMIUM_100)   │
│                    │                  │                  │                  │
│                    ├─ Alternative ────────────────────────────────────────►│
│ [FALSE path]       │  (balance <= 1000)                                    │
│                    │  (skipped)                                           │
│                    │                                                       │
│                    └─ Route to ────────────────────────────────────────────┤
│                      Alternative                          │                │
│                                                           │                │
│                                      Edge 3 (false)       │                │
│                                      Node 2B              │                │
│                                      (else branch)        │                │
│                                                           ◄──── Route Here──┤
│                                                           │                │
```

---

## 8. Monitoring & Observability Sequences

### 8.1 Real-time Execution Monitoring

```
WebSocket Client     WebSocket Server   Execution Engine    Database        Message Queue
(Frontend)           (Node.js)          (Java)              (PostgreSQL)     (Kafka)
│                    │                      │                  │                │
├─ Connect WS ──────►│                      │                  │                │
│  (execution_id)    │                      │                  │                │
│                    │◄─ Connected ──────────┤                 │                │
│                    │  (ready to stream)    │                 │                │
│                    │                      │                  │                │
│                    │                      ├─ Execution Start │                │
│                    │                      ├─ Node 1 Running ┌┤                │
│                    │                      │                  ├─ Publish ─────►│
│                    │                      │                  │ (node_started) │
│                    │◄─ Event Stream ◄──────────────────────┬─┤                │
│                    │ (node_started:       │                │                 │
│                    │  Node 1)             │                │                 │
│                    │                      │ [Processing]   │                 │
│                    │  25% progress ─────► │                ├─ Publish ─────►│
│                    │  50% progress        │ [Still proc.]  │ (progress:      │
│                    │  75% progress        │                │  50%)           │
│                    │◄─ Node 1 Complete ───────────────────┴─┤                │
│                    │  (outputs)           │                  ├─ Store ────────►│
│                    │                      │                  │                │
│                    │                      ├─ Node 2 Running ┌┤                │
│                    │◄─ Node 2 Started ◄────────────────────┬┤                │
│                    │                      │                │                 │
│                    │◄─ Node 2 Complete ◄─────────────────┬─┤                │
│                    │  (outputs)           │                │                 │
│                    │                      │                │                 │
│                    │                      ├─ Execution Complete              │
│                    │◄─ Final Results ◄────────────────────┬─┤                │
│                    │  (all outputs)       │                │  ├─ Publish ───►│
│                    │  (status: SUCCESS)   │                │  │ (completed)  │
│                    │                      │                │  │              │
│├─ Disconnect ──────┤                      │                │  │              │
│                    │◄─ Closed ──────────────────────────────┼──┤             │
│                    │                      │                │  │              │
```

### 8.2 Performance Metrics Collection

```
Node Executor        Metrics Collector    Performance Svc     Time Series DB    Dashboard
│                    │                       │                  │                  │
├─ Execute Node ────►│                       │                  │                  │
│ [start_time: T1]   │                       │                  │                  │
│                    │                       │                  │                  │
│ [Processing...]    ├─ Record: node.start ─────────────────────────────────────► │
│                    │ (timestamp)           │                  ├─ Store ────────► │
│                    │                       │                  │◄─ Indexed ───────┤
│                    │                       │                  │                  │
│ [end_time: T2]     │                       │                  │                  │
│                    ├─ Record: metrics ─────────────────────────────────────────► │
│ [success]          │ - duration: T2-T1     │                  │  memory_used:    │
│                    │ - memory_used: 256MB  │                  │   cpu_percent:   │
│                    │ - cpu_percent: 45%    │                  │   duration: 1.5s │
│                    │ - db_queries: 3       │                  │                  │
│                    │ - api_calls: 1        ├─ Aggregate ───────────────────────► │
│                    │ - cache_hits: 0       │ (calculate      │  ├─ Store ────────┤
│                    │ - cache_misses: 1     │  percentiles)   │  ├─ Aggregate ──►│
│                    │ - network_mb: 0.5     │                  │  │               │
│                    │                       ├─ Alert Threshold Check            │
│                    │                       │ (if duration > 5s)                 │
│                    │                       ├─ Alert Triggered                  │
│                    │                       │ (slow node)                        │
���                    │                       │                  ├─ Query Latest ─►│
│                    │                       │                  │◄─ Data ─────────┤
│                    │                       │                  │                  │
│◄─ Metrics ─────────┤                       │                  │◄─ Display ──────┤
│ (recorded)         │                       │                  │ (real-time chart)
│                    │                       │                  │                  │
```

---

## 9. Audit & Logging Sequences

### 9.1 Audit Log Creation

```
User Action          API Server         Audit Service       Database         Message Queue
(e.g., publish)      (Spring Boot)      (Logger)            (PostgreSQL)     (Kafka)
│                    │                     │                    │                 │
├─ Publish Workflow ►│                     │                    │                 │
│  (workflow_id:     │                     │                    │                 │
│   WF-123)          │                     │                    │                 │
│                    ├─ Validate ──────────┤                    │                 │
│                    │ (permissions)       │                    │                 │
│                    │                     ├─ Auth Check ──────►│                 │
│                    │                     │◄─ Allowed ─────────┤                 │
│                    │                     │                    │                 │
│                    ├─ Create Audit ─────►│                    │                 │
│                    │ Event Log           │                    │                 │
│                    │                     ├─ Prepare Log ──────────────────────► │
│                    │                     │ - action: PUBLISH  │                 │
│                    │                     │ - user_id: USR-456 │                 │
│                    │                     │ - resource: WF-123 │                 │
│                    │                     │ - old_value: DRAFT │                 │
│                    │                     │ - new_value: PUB.  │                 │
│                    │                     │ - timestamp: NOW   │                 │
│                    │                     │ - ip_address: ...  │                 │
│                    │                     │ - user_agent: ...  │                 │
│                    │                     │                    ├─ Insert ──────► │
│                    │                     │                    │◄─ Logged ───────┤
│                    │                     │                    │                 │
│                    │                     ├─ Publish Event ────────────────────► │
│                    │                     │ (workflow.published)  │ ◄─ Published ┤
│                    │                     │                    │                 │
│                    │◄─ Audit Complete ──┤                    │                 │
│                    │                     │                    │                 │
│◄─ Success ─────────┤                    │                    │                 │
│                    │                    │                    │                 │
```

### 9.2 System Log Collection

```
Services             Log Aggregator      Processing         Storage (ELK Stack)     UI
(Java, Python, etc)  (Fluentd)          (Logstash)        (Elasticsearch)          (Kibana)
│                    │                      │                  │                     │
├─ INFO: Node start ►│                      │                  │                     │
│                    ├─ Collect Log ────────┤                  │                     │
├─ DEBUG: Loading    │  (timestamp,         │                  │                     │
│  config            │   level, message)    │                  │                     │
│                    │                      ├─ Parse ──────────────────────────────► │
├─ ERROR: Timeout    │◄─ Buffer ────────────┤ (JSON, index by  │                     │
│                    │  (batch: 10 logs)    │  timestamp)      ├─ Index ──────────► │
├─ INFO: Node end    │                      │                  │◄─ Indexed ──────────┤
│                    ├─ Send Batch ─────────┤                  │                     │
├─ DEBUG: DB query   │  (batch_size:        │                  ├─ Search Query ◄───► │
│                    │   time_window: 10s)  │                  │                     │
├─ WARN: Slow query  │                      ├─ Transform ──────────────────────────► │
│                    │                      │ (add metadata:    │                     │
├─ INFO: Cache hit   │                      │  hostname, env,  ├─ Aggregate ────────► │
│                    │                      │  version)        │ (stats, analytics)  │
│                    │                      │                  │                     │
│                    │                      │                  ├─ Visualize ────────► │
│                    │                      │                  │ (dashboards,        │
│                    │                      │                  │  real-time logs)    │
│                    │                      │                  │                     │
│                    │                      │                  │                     │
```

---

## 10. Notification & Alert Sequence

### 10.1 Alert Triggered & Notification Sent

```
Monitoring System    Alert Service      Notification Svc    Email Service      User
│                    │                      │                    │                │
├─ Check Condition ──┤                      │                    │                │
│ (execution_time    │                      │                    │                │
│  > 5 minutes)      │                      │                    │                │
│                    ├─ Evaluate ──────────────────────────────────────────────► │
│                    │ (threshold reached)   │                    │                │
│                    │                       │                    │                │
│                    ├─ Alert Triggered ────►│                    │                │
│                    │ (execution_slow)      │                    │                │
│                    │                       ├─ Load Config ──────────────────────► │
│                    │                       │◄─ Alert Config ────────────────────┤
│                    │                       │  (channels: email, │                │
│                    │                       │   slack)           │                │
│                    │                       │                    │                │
│                    │                       ├─ Create ──────────►│                │
│                    │                       │ Notification      │                │
│                    │                       │                    ├─ Compose Email ┤
│                    │                       │                    │ - Subject       │
│                    │                       │                    │ - Body          │
│                    │                       │                    │ - Details       │
│                    │                       │                    │ - Link          │
│                    │                       │                    │                │
│                    │                       │                    ├─ Send Email ──►│
│                    │                       │                    │◄─ Delivered ───┤
│                    │                       │                    │                │
│                    │                       ├─ Update Status ────────────────────► │
│                    │                       │ (notification:     │                │
│                    │                       │  DELIVERED)        │                │
│                    │                       │                    │                │
│◄─ Alert Complete ──┤                      │                    │                │
│                    │                      │                    │                │
│                    │                      │                    │◄─ Email Received┤
│                    │                      │                    │                │
```

---

## 11. Complete End-to-End Workflow Execution

### 11.1 Full Workflow: Register → Create → Publish → Execute

```
User         Frontend        Auth Svc        Editor Svc       Executor        Database      External APIs
│              │               │               │               │               │               │
├─Register ────────────────────┤               │               │               │               │
│              │               ├─Store User ──►│               │               │               │
│              │◄──OK───────────┤               │               │               │               │
│              │                               │               │               │               │
├─Login ───────────────────────►│               │               │               │               │
│              │               ├─Verify Creds                  │               │               │
│              │◄──Auth Token ──┤               │               │               │               │
│              │                               │               │               │               │
├─Create WF ───────────────────────────────────┤               │               │               │
│              │               │               ├─Create WF ───►│               │               │
│              │               │               │◄─WF ID ───────┤               │               │
│              │◄──WF ID ───────────────────────┤               │               │               │
│              │                               │               │               │               │
├─Add Node 1 ───────────────────────────────────┤               │               │               │
│              │               │               ├─Node 1 ──────►│               │               │
│              │               │               │◄─Node ID ─────┤               │               │
│              │◄──Node 1 ──────────────────────┤               │               │               │
│              │                               │               │               │               │
├─Add Node 2 ───────────────────────────────────┤               │               │               │
│              │               │               ├─Node 2 ──────►│               │               │
│              │               │               │◄─Node ID ─────┤               │               │
│              │◄──Node 2 ──────────────────────┤               │               │               │
│              │                               │               │               │               │
├─Connect Nodes ────────────────────────────────┤               │               │               │
│              │               │               ├─Edge ────────►│               │               │
│              │               │               │◄─Edge ID ─────┤               │               │
│              │◄──Edge ────────────────────────┤               │               │               │
│              │                               │               │               │               │
├─Publish ─────────────────────────────────────►│               │               │               │
│              │               │               ├─Validate ────►│               │               │
│              │               │               ├─Publish ─────►│               │               │
│              │               │               │◄─Published ───┤               │               │
│              │◄──Published ───────────────────┤               │               │               │
│              │                               │               │               │               │
├─Execute ─────────────────────────────────────────────────────┤               │               │
│              │               │               │               ├─Create Exec ─►│               │
│              │               │               │               │◄─Exec ID ─────┤               │
│              │               │               │               │               │               │
│              │               │               │               ├─Execute Node 1 (HTTP) ─────►│
│              │               │               │               │  [wait for response]        │
│              │               │               │               │◄─Response ────────────────┤
│              │               │               │               ├─Update Log ──►│               │
│              │               │               │               │◄─Logged ──────┤               │
│              │               │               │               │               │               │
│              │               │               │               ├─Execute Node 2 (DB Query)  │
│              │               │               │               ├─DB Query ────►│               │
│              │               │               │               │◄─Results ─────┤               │
│              │               │               │               ├─Update Log ──►│               │
│              │               │               │               │◄─Logged ──────┤               │
│              │               │               │               │               │               │
│              │               │               │               ├─Mark Complete ────────────► │
│              │               │               │               │◄─Updated ─────────────────┤
│              │               │               │               │               │               │
│              │               │               │               ├─Publish Event (in Kafka) │
│              │               │               │               │               │               │
│              │◄──Execution Done ────────────────────────────┤               │               │
│              │   (success, outputs)          │               │               │               │
│              │                               │               │               │               │
│◄─View Results ┤                              │               │               │               │
│              │                               │               │               │               │
```

---

## 12. Integration Testing Sequence

### 12.1 Test Google Calendar Integration

```
Tester             Test API           Integration Svc     Google Calendar      Mock DB
│                  │                      │                    │                 │
├─Test Case ───────────────────────────────┤                    │                 │
│ (test_calendar_integration)              │                    │                 │
│                  │                       │                    │                 │
│                  ├─Setup: Create ────────────────────────────►│                 │
│                  │ Test Calendar       │                    │                 │
│                  │                       ├─Authorize ─────────────────────────► │
│                  │                       │ (test_creds)  │◄─Stored ──────────┤
│                  │                       │                    │                 │
│                  ├─Test 1: List ────────►│                    │                 │
│                  │ Calendars            ├─Call API ──────────────────────────► │
│                  │                       │◄─Calendars ────────────────────────┤
│                  │                       │                    │                 │
│                  │                       ├─Assert ─────────────────────────────► │
│                  │                       │ (contains test_cal)                  │
│                  │                       │◄─PASS ─────────────────────────────┤
│                  │                       │                    │                 │
│                  ├─Test 2: Create ──────►│                    │                 │
│                  │ Event              ├─Call API ──────────────────────────► │
│                  │ (event data)        │◄─Event ID ─────────────────────────┤
│                  │                       │                    │                 │
│                  │                       ├─Assert ─────────────────────────────► │
│                  │                       │ (event created)                      │
│                  │                       │◄─PASS ─────────────────────────────┤
│                  │                       │                    │                 │
│                  ├─Test 3: Get Events ──►│                    │                 │
│                  │ (by date range)     ├─Call API ──────────────────────────► │
│                  │                       │◄─Events ───────────────────────────┤
│                  │                       │                    │                 │
│                  │                       ├─Assert ─────────────────────────────► │
│                  │                       │ (count, dates)                       │
│                  │                       │◄─PASS ─────────────────────────────┤
│                  │                       │                    │                 │
│                  ├─Cleanup: Delete ─────────────────────────────────────────────► │
│                  │ Test Calendar      │                       │                 │
│                  │                       │◄─Deleted ──────────────────────────┤
│                  │                       │                    │                 │
│◄─All Tests Pass ─┤                      │                    │                 │
│                  │                      │                    │                 │
```

---

## Key Sequences Documented:

1. **Authentication** (2): Registration, Login with 2FA/OTP
2. **Workflow Management** (4): Creation, Node addition, Edge connection, Publishing
3. **Execution** (4): Manual execution, Scheduled, Webhook triggers, Full workflow
4. **Integrations** (3): Google Calendar auth, Connection testing, Token refresh
5. **Node Execution** (4): HTTP actions, LLM calls, Database queries, Logic conditions
6. **Error Handling** (3): Error recovery with retry, Fallback handling, Timeouts
7. **Data Flow** (2): Transformation between nodes, Conditional routing
8. **Monitoring** (2): Real-time monitoring, Performance metrics
9. **Audit & Logging** (2): Audit log creation, System log collection
10. **Notifications** (1): Alert triggering and notifications
11. **End-to-End** (1): Complete workflow lifecycle
12. **Testing** (1): Integration testing example

All sequences show **actor interactions**, **data flow**, **error conditions**, and **real-time updates**.