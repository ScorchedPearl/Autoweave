# Data Flow Diagrams - AutoWeave

## 1. Overall System Data Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                              │
│                       (Web Browser / Frontend)                              │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
                    HTTPS/REST
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                        │
│                      (Nginx Load Balancer)                                  │
│                                                                              │
│  • Request routing                                                          │
│  • Rate limiting                                                            │
│  • HTTPS/TLS termination                                                    │
│  • CORS enforcement                                                         │
└────────────────────────┬───────────────────────────────────────────────────┘
                         │
              ┌──────────┼──────────┬─────────────────┐
              │          │          │                 │
              ▼          ▼          ▼                 ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ REST API │ │WebSocket │ │ OAuth    │ │ Health       │
        │Endpoints │ │ Server   │ │Callback  │ │ Check        │
        └─────┬────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘
              │            │            │              │
         HTTP │            │ WS         │              │
              │            │            │              │
              ▼            ▼            ▼              │
┌──────────────────────────────────────────────────────┼──────────────┐
│        APPLICATION SERVICES LAYER (Microservices)   │              │
│                                                      │              │
│  ┌────────────────────────────┐                     │              │
│  │   Backend Service          │                     │              │
│  │   (Spring Boot on 8080)    │                     │              │
│  │                            │                     │              │
│  │  Controllers:              │                     │              │
│  │  ├─ AuthController         │                     │              │
│  │  ├─ WorkflowController     │                     │              │
│  │  ├─ ExecutionController    │                     │              │
│  │  ├─ IntegrationController  │                     │              │
│  │  └─ UserController         │                     │              │
│  │                            │                     │              │
│  │  Services:                 │                     │              │
│  │  ├─ AuthService            │                     │              │
│  │  ├─ WorkflowService        │                     │              │
│  │  ├─ ExecutionService       │                     │              │
│  │  ├─ IntegrationService     │                     │              │
│  │  └─ NotificationService    │                     │              │
│  └──────┬─────────────────────┘                     │              │
│         │                                            │              │
│         ├──────────────────┬──────────────────┬─────┘              │
│         │                  │                  │                     │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐        │
│  │ Kafka Queue │  │ Redis Cache    │  │ PostgreSQL DB  │        │
│  │ Producer    │  │ (Read/Write)   │  │ (Read/Write)   │        │
│  └──────┬──────┘  └────────┬────────┘  └─────┬──────────┘        │
│         │                  │                  │                    │
│  ┌──────▼────────────────────────────────────▼────────────────┐  │
│  │  Data Access & Integration Layer                           │  │
│  │                                                             │  │
│  │  • Database Repositories                                   │  │
│  │  • Cache Managers                                          │  │
│  │  • Event Producers                                         │  │
│  │  • Third-party API Clients                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │   AI Service (Python on 5000)                              │  │
│  │                                                             │  │
│  │  • LLM Integration (OpenAI, Claude, Ollama)               │  │
│  │  • Node Execution Engine                                  │  │
│  │  • Custom Code Executor                                   │  │
│  │  • Integration Handlers                                   │  │
│  │  • Error & Retry Logic                                    │  │
│  └──────────────────┬──────────────────────────────────────┘  │
│                     │                                           │
│  ┌────────��─────────▼──────────────────────────────────────┐  │
│  │   WebSocket Server (8081)                              │  │
│  │                                                         │  │
│  │  • Connection Management                              │  │
│  │  • Event Broadcasting                                 │  │
│  │  • Message Distribution                               │  │
│  │  • Client Session Tracking                            │  │
│  └──────────────────┬──────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────────┐
        │             │             │              │
        ▼             ▼             ▼              ▼
    ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │Kafka   │ │PostgreSQL│ │ Redis    │ │Third-party   │
    │Topics  │ │Database  │ │ Cluster  │ │ APIs         │
    └────────┘ └──────────┘ └──────────┘ └──────────────┘
        │             │             │              │
        └─────────────┼─────────────┴──────────────┘
                      │
                (Persistent Storage & External Services)
```

---

## 2. Authentication & Login Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: USER REGISTRATION
─────────────────────────

Frontend                Backend Service                PostgreSQL
   │                         │                             │
   ├─User Registration────────>│                            │
   │ (email, password)         │                            │
   │                           ├─Validate Email─────────────>│
   │                           │ (Check uniqueness)          │
   │                           │<─Email Status─────────────<│
   │                           │                            │
   │                           ├─Hash Password──────────────>│
   │                           │ (Bcrypt + Salt)            │
   │                           │                            │
   │                           ├─Generate OTP─────────────>│
   │                           │ (6-digit code)  │          │
   │                           │<─OTP Generated<│          │
   │                           │                │          │
   │                           ├─Create User Record────────>│
   │                           │ • email                    │
   │                           │ • password_hash            │
   │                           │ • otp_secret               │
   │                           │ • created_at               │
   │                           │<─User Created─────────────<│
   │                           │                            │
   │<─OTP Sent (Email/SMS)─────<│                            │
   │                           │                            │


STEP 2: OTP VERIFICATION
─────────────────────────

Frontend                Backend Service         Redis Cache      PostgreSQL
   │                         │                      │                │
   ├─OTP Verification────────>│                      │                │
   │ (email, otp_code)         │                      │                │
   │                           ├─Verify OTP──────────>│                │
   │                           │ (Check Redis cache)  │                │
   │                           │<─OTP Valid/Invalid─<│                │
   │                           │                      │                │
   │                           ├─OTP Valid? YES       │                │
   │                           │  └─>Generate JWT Token               │
   │                           │     • user_id                       │
   │                           │     • email                         │
   │                           │     • exp: 15 min                   │
   │                           │                      │                │
   │                           ├─Generate Refresh Token              │
   │                           │ • user_id                           │
   │                           │ • exp: 7 days                       │
   │                           │                      │                │
   │                           ├─Store Session────────────────────────>│
   │                           │ • user_id                            │
   │                           │ • last_login: now                    │
   │                           │ • session_status: ACTIVE             │
   │                           │                      │                │
   │                           ├─Cache Session────────>│                │
   │                           │ • key: user:{id}:session             │
   │                           │ • ttl: 24 hours                      │
   │                           │<─Session Cached───<│                │
   │                           │                      │                │
   │<─JWT Token + Refresh──────<│                      │                │
   │   (HTTP Response)          │                      │                │
   │                            │                      │                │


STEP 3: SUBSEQUENT REQUESTS (AUTHENTICATED)
────────────────────────────────────────────

Frontend                Backend Service         Redis Cache      PostgreSQL
   │                         │                      │                │
   ├─Request + JWT Token─────>│                      │                │
   │ (GET /workflows)          │                      │                │
   │                           ├─Verify JWT──────────>│                │
   │                           │ (Check Redis)        │                │
   │                           │<─Token Valid/Exp──<│                │
   │                           │                      │                │
   │                           ├─Token Valid? YES      │                │
   │                           │                       │                │
   │                           ├─Extract user_id from JWT           │
   │                           │ └─>Get Workflows for user_id        │
   │                           │    (Filtered query)                 │
   │                           │                       │                │
   │                           ├─Query Workflows───────────────────────>│
   │                           │<─Workflows Data──────────────────────<│
   │                           │                       │                │
   │<─200 + Workflows──────────<│                       │                │
   │                            │                       │                │


STEP 4: TOKEN REFRESH
─────────────────────

Frontend                Backend Service         Redis Cache      PostgreSQL
   │                         │                      │                │
   ├─Refresh Token Request────>│                      │                │
   │ (GET /auth/refresh)        │                      │                │
   │ + refresh_token            │                      │                │
   │                            │                      │                │
   │                            ├─Verify Refresh Token ─────────────>│
   │                            │ (Check DB & Redis)    │              │
   │                            │<─Token Valid/Exp──<│<─User Status─<│
   │                            │                      │                │
   │                            ├─Generate New JWT Token              │
   │                            │ • user_id                           │
   │                            │ • exp: 15 min                       │
   │                            │                      │                │
   │                            ├─Cache New Token──────>│                │
   │                            │ • key: user:{id}:jwt                │
   │                            │ • ttl: 15 min                       │
   │                            │<─Cached──────────────<│                │
   │                            │                      │                │
   │<─New JWT Token────────────<│                       │                │
   │   (HTTP Response)           │                       │                │


STEP 5: LOGOUT
──────────────

Frontend                Backend Service         Redis Cache      PostgreSQL
   │                         │                      │                │
   ├─Logout Request──────────>│                      │                │
   │ + JWT Token               │                      │                │
   │                           ├─Invalidate Token─────>│                │
   │                           │ (Delete from Redis)   │                │
   │                           │<─Token Deleted────<│                │
   │                           │                      │                │
   │                           ├─Update Session────────────────────────>│
   │                           │ • logout_time: now                    │
   │                           │ • status: INACTIVE                    │
   │                           │<─Session Updated──────────────────────<│
   │                           │                      │                │
   │                           ├─Clear Session Cache──>│                │
   │                           │ (Delete cached data)  │                │
   │                           │<─Cache Cleared────<│                │
   │                           │                      │                │
   │<─200 Logout Success──────<│                       │                │
```

---

## 3. Workflow Creation & Publishing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW CREATION & PUBLISHING                        │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: CREATE BLANK WORKFLOW
────────────────────────────

Frontend                Backend Service      PostgreSQL         Redis Cache
   │                         │                    │                  │
   ├─Create Workflow────────>│                    │                  │
   │ • name: "Email Parser"  │                    │                  │
   │ • description: "..."    │                    │                  │
   │ • user_id: (from JWT)   │                    │                  │
   │                         │                    │                  │
   │                         ├─Validate Input      │                  │
   │                         │ • Check name length │                  │
   │                         │ • Check permissions │                  │
   │                         │                    │                  │
   │                         ├─Create Workflow────>│                  │
   │                         │ INSERT INTO workflows:                 │
   │                         │ • id (UUID)         │                  │
   │                         │ • user_id           │                  │
   │                         │ • name              │                  │
   │                         │ • status: DRAFT     │                  │
   │                         │ • created_at        │                  │
   │                         │<─Workflow Created──<│                  │
   │                         │                    │                  │
   │                         ├─Cache Workflow──────────────────────────>│
   │                         │ key: workflow:{id}   │                  │
   │                         │ ttl: 1 hour         │                  │
   │                         │<─Cached───────────────────────────────<│
   │                         │                    │                  │
   │<─Workflow ID────────────<│                    │                  │
   │   (workflow_id: abc123)  │                    │                  │


STEP 2: ADD NODES TO WORKFLOW
─────────────────────────────

Frontend                Backend Service      PostgreSQL         Redis Cache
   │                         │                    │                  │
   ├─Add Node─────────────────>│                    │                  │
   │ • workflow_id: abc123     │                    │                  │
   │ • node_type: "trigger"    │                    │                  │
   │ • config: {trigger_type}  │                    │                  │
   │ • position: {x: 100, y:50}│                    │                  │
   │                           │                    │                  │
   │                           ├─Validate Node Config              │
   │                           │ • Check node_type exists             │
   │                           │ • Validate schema                    │
   │                           │                    │                  │
   │                           ├─Create Node────────>│                  │
   │                           │ INSERT INTO workflow_nodes:           │
   │                           │ • id (UUID)         │                  │
   │                           │ • workflow_id       │                  │
   │                           │ • node_type         │                  │
   │                           │ • config (JSONB)    │                  │
   │                           │ • position_x, y     │                  │
   │                           │<─Node Created──────<│                  │
   │                           │                    │                  │
   │                           ├─Invalidate Cache────────────────────>│
   │                           │ key: workflow:{id}   │                  │
   │                           │ action: DELETE       │                  │
   │                           │<─Cache Invalidated──────────────────<│
   │                           │                    │                  │
   │<─Node ID────────────────<│                    │                  │
   │   (node_id: node_001)     │                    │                  │


STEP 3: CONNECT NODES (CREATE EDGES)
────────────────────────────────────

Frontend                Backend Service      PostgreSQL         Redis Cache
   │                         │                    │                  │
   ├─Create Connection────────>│                    │                  │
   │ • workflow_id: abc123     │                    │                  │
   │ • source_node_id: node_001│                    │                  │
   │ • target_node_id: node_002│                    │                  │
   │ • condition: (optional)   │                    │                  │
   │                           │                    │                  │
   │                           ├─Validate Connection             │
   │                           │ • Check nodes exist                 │
   │                           │ • Check connection valid            │
   │                           │                    │                  │
   │                           ├─Update Node Config────>│                  │
   │                           │ UPDATE workflow_nodes:                │
   │                           │ • connections: [...]                 │
   │                           │<─Updated──────────<│                  │
   │                           │                    │                  │
   │<─Connection Created──────<│                    │                  │


STEP 4: SAVE WORKFLOW (DRAFT)
─────────────────────────────

Frontend                Backend Service      PostgreSQL         Redis Cache
   │                         │                    │                  │
   ├─Save Workflow────────────>│                    │                  │
   │ • workflow_id: abc123     │                    │                  │
   │ (Contains all nodes)      │                    │                  │
   │                           │                    │                  │
   │                           ├─Validate Full Workflow          │
   │                           │ • Check at least 1 node             │
   │                           │ • Check connections valid            │
   │                           │ • Check node configs                 │
   │                           │                    │                  │
   │                           ├─Update Workflow Status────>│          │
   │                           │ UPDATE workflows:          │          │
   │                           │ • status: DRAFT    │          │
   │                           │ • updated_at: now  │          │
   │                           │<─Saved─────────────<│          │
   │                           │                    │          │
   │                           ├─Publish Event───────────────────────>│
   │                           │ event: workflow.saved                │
   │                           │ workflow_id: abc123                  │
   │                           │ (→ Kafka Topic)                      │
   │                           │                    │          │
   │<─Save Successful──────────<│                    │          │


STEP 5: PUBLISH WORKFLOW
────────────────────────

Frontend                Backend Service      PostgreSQL    Kafka Queue
   │                         │                    │            │
   ├─Publish Workflow─────────>│                    │            │
   │ • workflow_id: abc123     │                    │            │
   │                           │                    │            │
   │                           ├─Validate Full Config        │
   │                           │ • Check all nodes configured │
   │                           │ • Check connections         │
   │                           │                    │            │
   │                           ├─Create Version Record────>│        │
   │                           │ INSERT INTO workflow_versions:       │
   │                           │ • id (UUID)         │            │
   │                           │ • workflow_id       │            │
   │                           │ • version_number: 1 │            │
   │                           │ • snapshot: {...}   │            │
   │                           │ • created_at        │            │
   │                           │<─Version Created──<│        │
   │                           │                    │            │
   │                           ├─Update Workflow Status────>│        │
   │                           │ UPDATE workflows:          │        │
   │                           │ • status: PUBLISHED│        │
   │                           │ • published_at: now│        │
   │                           │ • current_version_id    │
   │                           │<─Published────────<│        │
   │                           │                    │            │
   │                           ├─Publish Event──────────────────────>│
   │                           │ {                          │
   │                           │   event: 'workflow.published'      │
   │                           │   workflow_id: abc123      │
   │                           │   version: 1               │
   │                           │   timestamp: now           │
   │                           │ }                          │
   │                           │ (Kafka: workflow.published)│
   │                           │                           <│
   │                           │ [Consumed by notification service]
   │                           │                           <│
   │                           │                    │            │
   │<─Publish Successful──────<│                    │            │
```

---

## 4. Workflow Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW EXECUTION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: TRIGGER EXECUTION
─────────────────────────

Frontend                Backend Service      PostgreSQL    Kafka    Redis
   │                         │                    │         │        │
   ├─Execute Workflow─────────>│                    │         │        │
   │ • workflow_id: abc123     │                    │         │        │
   │ • input_data: {...}       │                    │         │        │
   │                           │                    │         │        │
   │                           ├─Get Workflow──────────────────────────>│
   │                           │ (Check cache first) │         │        │
   │                           │<─Workflow Data────────────────────────<│
   │                           │                    │         │        │
   │                           ├─Validate Workflow  │         │        │
   │                           │ • Check PUBLISHED   │         │        │
   │                           │ • Check user access │         │        │
   │                           │                    │         │        │
   │                           ├─Create Execution Record────>│         │
   │                           │ INSERT INTO executions:       │         │
   │                           │ • id (UUID)         │         │        │
   │                           │ • workflow_id       │         │        │
   │                           │ • user_id           │         │        │
   │                           │ • status: PENDING   │         │        │
   │                           │ • started_at: now   │         │        │
   │                           │ • input_data        │         │        │
   │                           │<─Execution Created <│         │        │
   │                           │   execution_id: exec_001     │        │
   │                           │                    │         │        │
   │                           ├─Publish Event──────────────────────────>│
   │                           │ {                          │        │
   │                           │   event: 'execution.started'│        │
   │                           │   execution_id: exec_001    │        │
   │                           │   workflow_id: abc123       │        │
   │                           │   timestamp: now            │        │
   │                           │ }                          │        │
   │                           │ (Kafka: execution.started) <│        │
   │                           │                    │         │        │
   │                           ├─Cache Execution────────────────────────>│
   │                           │ key: execution:{id}:state    │        │
   │                           │ • current_node: trigger_node │        │
   │                           │ • status: RUNNING           │        │
   │                           │ • started_at: now           │        │
   │                           │<─Cached────────────────────────────<│
   │                           │                    │         │        │
   │<─Execution Started────────<│                    │         │        │
   │   (execution_id: exec_001) │                    │         │        │


STEP 2: PROCESS NODES (IN SEQUENCE)
────────────────────────────────────

Backend Service         AI Service    PostgreSQL  Kafka   Redis Cache
      │                     │              │        │         │
      ├─Get Current Node────────────────────────────────────────>│
      │ key: execution:{id}:current_node   │        │         │
      │<─Current Node Info─────────────────────────────────────<│
      │                     │              │        │         │
      ├─Publish Event──────────────────────────────────────────>│
      │ event: node.started │              │        │         │
      │ (Kafka: execution.node.started)    │        │         │
      │                     │              │        │         │
      ├─◇ Node Type?       │              │        │         │
      │                     │              │        │         │
      ├─[If LLM Node]       │              │        │         │
      │  └─>Call AI Service──────────────>│              │
      │      • workflow_id  │              │              │
      │      • node_config  │              │              │
      │      • context_data │              │              │
      │                     │              │              │
      │      (In AI Service:)             │              │
      │      ├─Load LLM Model             │              │
      │      ├─Build Prompt from Template │              │
      │      ├─Call LLM (OpenAI/Claude)   │              │
      │      ├─Parse Response             │              │
      │      └─Return Result──────────────>│              │
      │                     │<─LLM Output──┤              │
      │                     │              │              │
      ├─[If Condition Node] │              │              │
      │  └─>Evaluate Condition            │              │
      │      ├─Get input_value            │              │
      │      ├─Check condition logic      │              │
      │      ├─Determine path             │              │
      │      └─Set next_node              │              │
      │                     │              │              │
      ├─[If Integration Node]              │              │
      │  └─>Call External API             │              │
      │      ├─Get encrypted credentials  │              │
      │      ├─Refresh OAuth token if needed           │
      │      ├─Prepare API request        │              │
      │      ├─Make HTTP call             │              │
      │      └─Parse response             │              │
      │                     │              │              │
      ├─Save Node Output─────────────────>│              │
      │ INSERT INTO execution_logs:        │              │
      │ • execution_id: exec_001           │              │
      │ • node_id: node_001                │              │
      │ • status: COMPLETED                │              │
      │ • input, output (JSONB)            │              │
      │ • duration_ms                      │              │
      │<─Log Entry Created───────────────<│              │
      │                     │              │              │
      ├─Update Execution Context───────────────────────────>│
      │ • node_outputs: {...}              │              │
      │ • execution_path: [...]            │              │
      │ • progress: 1/5                    │              │
      │<─Updated──────────────────────────────────────────<│
      │                     │              │              │
      ├─Publish Event──────────────────────────────────────>│
      │ event: node.completed              │              │
      │ output: {...}                      │              │
      │ progress: 20%                      │              │
      │ (Kafka: execution.node.completed) <│              │
      │                     │              │              │
      ├─Get Next Node──────────────────────────────────────>│
      │ (Based on connections/conditions)  │              │
      │<─Next Node ID────────────────────────────────────<│
      │                     │              │              │
      │ [LOOP: Repeat STEP 2 for each node until complete]
      │


STEP 3: EXECUTION COMPLETION
────────────────────────────

Backend Service         PostgreSQL          Kafka    Redis Cache
      │                     │                 │         │
      ├─Mark Execution Complete────>         │         │
      │ UPDATE executions:            │         │         │
      │ • status: COMPLETED           │         │         │
      │ • completed_at: now           │         │         │
      │ • final_results: {...}        │         │         │
      │<─Execution Updated──────────<│         │         │
      │                     │         │         │         │
      ├─Generate Summary────────────>│         │         │
      │ • total_duration: 2.5s        │         │         │
      │ • nodes_executed: 5           │         │         │
      │ • success_count: 5            │         │         │
      │                     │         │         │         │
      ├─Publish Final Event────────────────────────────>│
      │ {                             │         │
      │   event: 'execution.completed'│         │
      │   execution_id: exec_001      │         │
      │   workflow_id: abc123         │         │
      │   status: COMPLETED           │         │
      │   duration_ms: 2500           │         │
      │   results: {...}              │         │
      │   timestamp: now              │         │
      │ }                             │         │
      │ (Kafka: execution.completed)  <│         │
      │                     │         │         │
      ├─Update Cache───────────────────────────────────>│
      │ key: execution:{id}:state     │         │
      │ • status: COMPLETED           │         │
      │ • final_results               │         │
      │ • ttl: 30 days (archive)      │         │
      │<─Cached────────────────────────────────────────<│
```

---

## 5. Error Handling & Recovery Flow

```
┌─────────────────────────���───────────────────────────────────────────────┐
│              ERROR HANDLING & RECOVERY FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

During Node Execution:

Backend Service              AI Service      PostgreSQL    Kafka
      │                           │              │          │
      ├─Execute Node──────────────>│              │          │
      │                           │              │          │
      │◇ Error Occurs──────────────X              │          │
      │ (Timeout/API Error/etc)    │              │          │
      │                           │              │          │
      ├─Catch Exception            │              │          │
      │ • Error type              │              │          │
      │ • Error message           │              │          │
      │ • Stack trace             │              │          │
      │                           │              │          │
      ├─Classify Error            │              │          │
      │ • Transient (Retry)       │              │          │
      │ • Permanent (Fail)        │              │          │
      │ • Rate Limited            │              │          │
      │                           │              │          │
      ├─[If Transient Error]      │              │          │
      │ ├─Increment Retry Count   │              │          │
      │ ├─Check if Retry < Max(3) │              │          │
      │ ├─◇ Can Retry?            │              │          │
      │ │                         │              │          │
      │ ├─[YES] Calculate Backoff           │          │
      │ │ • Wait: exponential    │              │          │
      │ │ • 1s, 2s, 4s + jitter │              │          │
      │ │                        │              │          │
      │ ├─Wait Backoff Period    │              │          │
      │ │ └─(Sleep/Delay)        │              │          │
      │ │                        │              │          │
      │ └─Retry Node Execution───────────────>│              │
      │    └─[Go back to Execute Node]         │              │
      │                          │              │          │
      ├─[NO] Save Error Details────────────────────>│      │
      │ INSERT INTO execution_logs:           │      │
      │ • execution_id            │      │
      │ • node_id                 │      │
      │ • status: FAILED          │      │
      │ • error_code              │      │
      │ • error_message           │      │
      │ • retry_count: 3          │      │
      │ • timestamp               │      │
      │<─Error Logged────────────────────<│      │
      │                          │      │
      ├─[If Permanent Error]     │      │
      │ ├─Mark Execution Failed   │      │
      │ ├─Set status: FAILED      │      │
      │ ├─Stop execution          │      │
      │ └─Notify user             │      │
      │                          │      │
      ├─Publish Error Event───────────────────────>│
      │ {                         │      │
      │   event: 'execution.failed'   │
      │   execution_id: exec_001  │      │
      │   error_code: API_TIMEOUT │      │
      │   error_message: "..."    │      │
      │   node_id: node_002       │      │
      │   retry_count: 3          │      │
      │   timestamp: now          │      │
      │ }                         │      │
      │ (Kafka: execution.failed) <│      │
      │                          │      │
      ├─Update Execution Status────────────────────>│
      │ • status: FAILED/PAUSED   │      │
      │ • error_details: {...}    │      │
      │ • paused_at: now          │      │
      │ • can_resume: true        │      │
      │<─Updated──────────────────────<│
```

---

## 6. Real-Time Execution Monitoring Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│          REAL-TIME EXECUTION MONITORING (WebSocket Flow)                 │
└─────────────────────────────────────────────────────────────────────────┘

Frontend Browser        WebSocket Server        Backend Service     Kafka
      │                       │                       │              │
      ├─Connect WebSocket─────>│                       │              │
      │ (User views execution) │                       │              │
      │                        │                       │              │
      │<─Connection Established                        │              │
      │   (on message handler) │                       │              │
      │                        │                       │              │
      │                        ├─Subscribe to Channel──>│              │
      │                        │ execution:{exec_id}    │              │
      │                        │                       │              │
      │                        │                       ├─Listen for Events
      │                        │                       │ (Kafka topic)│
      │                        │                       │<─event: node.started─┤
      │                        │                       │              │
      │                        │<─Publish Event────────┤              │
      │                        │ {                     │              │
      │                        │   node_id: node_001   │              │
      │                        │   status: RUNNING     │              │
      │                        │   progress: 20%       │              │
      │                        │ }                     │              │
      │                        │                       │              │
      │<─WebSocket Message─────┤                       │              │
      │ (Real-time update)     │                       │              │
      │                        │                       │              │
      │ Update Dashboard:      │                       │              │
      │ • Progress bar         │                       │              │
      │ • Current node         │                       │              │
      │ • Status               │                       │              │
      │ • Execution time       │                       │              │
      │                        │                       │              │
      │                        │                       │<─event: node.completed─┤
      │                        │<─Publish Event────────┤              │
      │                        │ {                     │              │
      │                        │   node_id: node_001   │              │
      │                        │   status: COMPLETED   │              │
      │                        │   output: {...}       │              │
      │                        │   duration_ms: 1200   │              │
      │                        │   progress: 40%       │              │
      │                        │ }                     │              │
      │                        │                       │              │
      │<─WebSocket Message─────┤                       │              │
      │ (Update with results)  │                       │              │
      │                        │                       │              │
      │ Update Dashboard:      │                       │              │
      │ • Node results         │                       │              │
      │ • Progress increment   │                       │              │
      │ • Duration updated     │                       │              │
      │                        │                       │              │
      │ [Repeat for each node] │                       │              │
      │                        │                       │              │
      │                        │                       │<─event: execution.completed
      │                        │<─Publish Final Event──┤              │
      │                        │ {                     │              │
      │                        │   status: COMPLETED   │              │
      │                        │   final_results: {...}│              │
      │                        │   total_duration: 5000│              │
      │                        │   timestamp: now      │              │
      │                        │ }                     │              │
      │                        │                       │              │
      │<─Final WebSocket Msg───┤                       │              │
      │ (Execution Complete)   │                       │              │
      │                        │                       │              │
      │ Update Dashboard:      │                       │              │
      │ • Status: COMPLETED    │                       │              │
      │ • Show results         │                       │              │
      │ • Show artifacts       │                       │              │
      │ • Enable export        │                       │              │
      │                        │                       │              │
      ├─Close WebSocket────────>│                       │              │
      │ (User exits execution) │                       │              │
      │                        │                       │              │
      │<─Connection Closed─────                        │              │
      │                        │                       │              │
      │                        ├─Unsubscribe Channel──>│              │
      │                        │ (Release resources)   │              │
      │                        │                       │              │
```

---

## 7. Integration Authorization Flow (OAuth 2.0)

```
┌─────────────────────────────────────────────────────────────────────────┐
│          INTEGRATION AUTHORIZATION FLOW (OAuth 2.0)                      │
└─────────────────────────────────────────────────────────────────────────┘

User Browser              Frontend                Backend Service     Google OAuth
      │                       │                         │                │
      ├─Click "Connect Calendar"                        │                │
      │                       │                         │                │
      │                       ├─Generate State Token────>│                │
      │                       │ • Random 32-byte string │                │
      │                       │ • Store in session      │                │
      │                       │<─State Token────────────┤                │
      │                       │                         │                │
      │                       ├─Build OAuth URL         │                │
      │                       │ • client_id             │                │
      │                       │ • redirect_uri          │                │
      │                       │ • scopes: calendar.read │                │
      │                       │ • state: token          │                │
      │                       │ • response_type: code   │                │
      │                       │<─OAuth URL─────────────┤                │
      │                       │                         │                │
      │<─Redirect to Google────│                         │                │
      │                        │                         ├─HTTP 302──────>│
      │ (User sees Google Login/Permission Screen)      │                │
      │                        │                         │                │
      │ [User grants permissions]                        │                │
      │                        │                         │                │
      │<─Redirect back to app with code─────────────────┤<─Redirect──────┤
      │                        │                         │ redirect_uri   │
      │                        │ (code=abc123&state=xyz) │ &code=abc123   │
      │                        │                         │ &state=xyz     │
      │                        │                         │                │
      │ (Handled by Backend OAuth Callback)             │                │
      │                        │                         │                │
      │                        ├─Validate State─────────>│                │
      │                        │ • Compare with session  │                │
      │                        │ • Match? Continue      │                │
      │                        │                         │                │
      │                        ├─Exchange Code for Token│                │
      │                        │ POST request to Google  │                │
      │                        │ • code: abc123          │                │
      │                        │ • client_id             │                │
      │                        │ • client_secret         │                │
      │                        │ • redirect_uri          │                │
      │                        │ • grant_type: auth_code│                │
      │                        │<─Access Token──────────┤<──Get Token────┤
      │                        │ • access_token          │                │
      │                        │ • refresh_token         │                │
      │                        │ • expires_in: 3600     │                │
      │                        │                         │                │
      │                        ├─Encrypt Access Token   │                │
      │                        │ (AES-256)               │                │
      │                        │                         │                │
      │                        ├─Store in DB────────────────────────────>│
      │                        │ INSERT INTO integrations:    PostgreSQL  │
      │                        │ • id (UUID)             │                │
      │                        │ • user_id               │                │
      │                        │ • service_type: GOOGLE_CALENDAR        │
      │                        │ • encrypted_token       │                │
      │                        │ • refresh_token         │                │
      │                        │ • scopes: [...]         │                │
      │                        │ • authorized_at: now    │                │
      │                        │ • expires_at: now+3600s│                │
      │                        │<─Integration Saved──────────────────────<│
      │                        │                         │                │
      │                        ├─Clear Temporary Data    │                │
      │                        │ • Remove state token    │                │
      │                        │ • Remove code from session              │
      │                        │                         │                │
      │<─Redirect to Dashboard─┤                         │                │
      │   (Success message)     │                         │                │
      │                        │                         │                │
      │ [User can now use Google Calendar in workflows]  │                │
```

---

## 8. Data Flow Summary Table

| Flow Type | Source | Target | Data Type | Protocol | Frequency |
|-----------|--------|--------|-----------|----------|-----------|
| User Input | Frontend | Backend API | JSON | HTTPS/REST | On action |
| Workflow Execution | Backend | AI Service | JSON/Protobuf | HTTP | Per node |
| Event Publishing | Backend | Kafka | JSON | TCP | Real-time |
| WebSocket Updates | Backend | Frontend | JSON | WebSocket | Real-time |
| Database Writes | Services | PostgreSQL | SQL | TCP | Per operation |
| Cache Operations | Services | Redis | Binary | TCP | Frequently |
| External APIs | Backend | Third-party | JSON/XML | HTTPS | Per integration |
| OAuth Callbacks | OAuth Provider | Backend | JSON | HTTPS | One-time per auth |

---
