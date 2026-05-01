
# System Architecture - AutoWeave

## Overview

AutoWeave is a workflow automation platform built with a modern microservices architecture. The system enables users to visually design, manage, and execute complex automated workflows powered by AI, with integrations to popular third-party services.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Web Browser (Next.js 14 + React Flow + Tailwind CSS)               │   │
│  │  • Visual Workflow Editor                                            │   │
│  │  • Dashboard & Monitoring                                            │   │
│  │  • Authentication UI                                                 │   │
│  └──────────────────────────┬───────────────────────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────────────────────��
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Nginx Load Balancer (Reverse Proxy)                                │   │
│  │  • Request routing & load balancing                                  │   │
│  │  • SSL/TLS termination                                               │   │
│  │  • Request throttling & rate limiting                                │   │
│  │  • CORS policy enforcement                                           │   │
│  └──────────────────────────┬───────────────────────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVICES LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Backend Service │  │   AI Service     │  │  WebSocket Server        │  │
│  │  (Spring Boot)   │  │   (Python)       │  │  (Real-time Updates)     │  │
│  │  • REST API      │  │  • LangChain     │  │  • Live Execution Status │  │
│  │  • Business Logic│  │  • LLM Models    │  │  • Event Broadcasting    │  │
│  │  • Auth Handler  │  │  • Node Execution│  │  • Connection Management │  │
│  │  • Integrations  │  │    Engine        │  │                          │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────┬───────────────┘  │
│           │                     │                        │                  │
│           └─────────────────────┼────────────────────────┘                  │
└───────────────────────┬───────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Redis      │ │   Kafka      │ │  PostgreSQL  │
│   Cache      │ │   Message    │ │  Primary DB  │
│              │ │   Queue      │ │              │
│ • Sessions   │ │              │ │ • Workflows  │
│ • Cache Data │ │ • Events     │ │ • Executions │
│ • Rate Limit │ │ • Async Jobs │ │ • Logs       │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📊 Layered Architecture

### Layer 1: Presentation Layer (Frontend)

**Technology**: Next.js 14, React, React Flow, Tailwind CSS

**Components:**
- **Workflow Editor** - Drag-and-drop interface for workflow creation
- **Dashboard** - Real-time execution monitoring and workflow management
- **Authentication UI** - Login, registration, OTP verification screens
- **Integration Manager** - OAuth authorization flows
- **Execution Viewer** - Detailed logs and execution history

**Responsibilities:**
- User interface rendering
- Client-side validation
- WebSocket connection management
- Local state management (Redux/Context API)
- API request orchestration

---

### Layer 2: API Gateway & Load Balancing

**Technology**: Nginx, Docker

**Components:**
- **Load Balancer** - Distributes incoming requests
- **Reverse Proxy** - Routes to appropriate backend services
- **SSL/TLS Terminator** - Encrypts communications
- **Rate Limiter** - Prevents abuse

**Responsibilities:**
- Request routing based on URL patterns
- Load distribution across service instances
- HTTPS enforcement
- CORS policy implementation
- Request/Response header manipulation

---

### Layer 3: Application Services Layer

#### 3.1 Backend Service (Spring Boot)

**Port**: 8080  
**Language**: Java

**Core Modules:**

```
Backend Service
├── Controller Layer (REST Endpoints)
│   ├── AuthController (/api/auth)
│   ├── WorkflowController (/api/workflows)
│   ├── ExecutionController (/api/executions)
│   ├── IntegrationController (/api/integrations)
│   └── UserController (/api/users)
│
├── Service Layer (Business Logic)
│   ├── AuthService
│   ├── WorkflowService
│   ├── ExecutionService
│   ├── IntegrationService
│   ├── NodeRegistryService
│   └── NotificationService
│
├── Repository Layer (Data Access)
│   ├── UserRepository
│   ├── WorkflowRepository
│   ├── ExecutionRepository
│   ├── IntegrationRepository
│   └── AuditLogRepository
│
├── Security
│   ├── JWT TokenProvider
│   ├── OTP Generator
│   ├── OAuth2Client
│   └── SecurityConfig
│
├── Integration Handlers
│   ├── GoogleCalendarAdapter
│   ├── GmailAdapter
│   ├── CustomAPIAdapter
│   └── WebhookHandler
│
└── Kafka Producers
    ├── WorkflowEventProducer
    ├── ExecutionEventProducer
    └── AuditLogProducer
```

**Key Responsibilities:**
- REST API endpoints for all operations
- Business logic implementation
- Authentication & authorization
- Database transaction management
- Kafka event publishing
- Integration credential management

---

#### 3.2 AI Service (Python + LangChain)

**Port**: 5000  
**Language**: Python

**Architecture:**

```
AI Service
├── LLM Interface
│   ├── OpenAI Connector
│   ├── Claude Connector
│   ├── Ollama Connector (Local LLMs)
│   └── Model Selector
│
├── Node Executors
│   ├── LLMNodeExecutor
│   ├── PromptTemplateEngine
│   ├── ChainBuilder
│   └── MemoryManager
│
├── Integration Handlers
│   ├── GoogleCalendarExecutor
│   ├── GmailExecutor
│   ├── HTTPExecutor
│   └── CustomCodeExecutor
│
├── Error Handling
│   ├── RetryLogic
│   ├── Fallback Handlers
│   ├── TokenLimitManager
│   └── RateLimitHandler
│
└── Monitoring
    ├── ExecutionLogger
    ├── PerformanceMetrics
    ├── TokenUsageTracker
    └── ErrorReporter
```

**Responsibilities:**
- Execute LLM nodes with LangChain
- Process integration API calls
- Custom code execution (sandboxed)
- Token usage optimization
- Error handling and retries

---

#### 3.3 WebSocket Server (Node.js or Spring)

**Port**: 8081  
**Technology**: Socket.io or Spring WebSocket

**Features:**
- Real-time execution status updates
- Live workflow monitoring
- Bidirectional communication
- Connection pooling
- Message broadcasting

---

### Layer 4: Message Queue & Event Streaming

**Technology**: Apache Kafka

**Topics:**

```
Kafka Topics
├── workflow.created
│   └── Published when workflow created/updated
│
├── workflow.published
│   └── Published when workflow goes live
│
├── execution.started
│   └── Published when execution begins
│
├── execution.node.started
│   └── Published when node execution starts
│
├── execution.node.completed
│   └── Published when node completes
│
├── execution.completed
│   └── Published when execution finishes
│
├── execution.failed
│   └── Published on execution failure
│
├── audit.log
│   └── All system activities
│
└── integration.event
    └── Third-party integration events
```

**Consumer Groups:**
- Execution Engine (consumes execution events)
- Notification Service (broadcasts updates)
- Audit Logger (records all events)
- Analytics Service (metrics collection)

---

### Layer 5: Caching Layer

**Technology**: Redis

**Data Stored:**

```
Redis Cache
├── Sessions
│   ├── user:{userId}:session
│   ├── user:{userId}:otp
│   └── user:{userId}:token
│
├── Workflow Data
│   ├── workflow:{workflowId}:definition
│   ├── workflow:{workflowId}:version
│   └── node:registry
│
├── Execution State
│   ├── execution:{executionId}:state
│   ├── execution:{executionId}:context
│   └── execution:{executionId}:locks
│
├── Integration Tokens
│   ├── integration:{userId}:{service}:token
│   └── integration:{userId}:{service}:metadata
│
└── Rate Limiting
    ├── ratelimit:{userId}:{endpoint}
    └── ratelimit:global
```

**Expiration Policies:**
- Sessions: 24 hours
- OTP: 5 minutes
- Workflow Cache: 1 hour
- Integration Tokens: Dynamic (based on provider)
- Rate Limit Counters: Per minute/hour

---

### Layer 6: Database Layer

**Technology**: PostgreSQL

**Primary Tables:**

```
Database Schema
├── Users Table
│   ├── id (UUID, PK)
│   ├── email (unique)
│   ├── password_hash
│   ├── otp_secret
│   ├── created_at
│   └── updated_at
│
├── Workflows Table
│   ├── id (UUID, PK)
│   ├── user_id (FK)
│   ├── name
│   ├── description
│   ├── status (DRAFT/PUBLISHED/ARCHIVED)
│   ├── current_version_id (FK)
│   ├── created_at
│   └── updated_at
│
├── Workflow_Nodes Table
│   ├── id (UUID, PK)
│   ├── workflow_id (FK)
│   ├── node_type (TRIGGER/ACTION/CONDITION/LLM/etc.)
│   ├── position_x, position_y
│   ├── config (JSONB)
│   └── connections (JSONB)
│
├── Executions Table
│   ├── id (UUID, PK)
│   ├── workflow_id (FK)
│   ├── status (PENDING/RUNNING/COMPLETED/FAILED)
│   ├── started_at
│   ├── completed_at
│   ├── current_node_id (FK)
│   ├── results (JSONB)
│   └── error_details (JSONB)
│
├── Execution_Logs Table
│   ├── id (UUID, PK)
│   ├── execution_id (FK)
│   ├── node_id (FK)
│   ├── status
│   ├── input (JSONB)
│   ├── output (JSONB)
│   ├── error_message
│   ├── duration_ms
│   └── timestamp
│
├── Integrations Table
│   ├── id (UUID, PK)
│   ├── user_id (FK)
│   ├── service_type (GOOGLE_CALENDAR/GMAIL/etc.)
│   ├── encrypted_token
│   ├── refresh_token
│   ├── scopes (array)
│   ├── authorized_at
│   └── expires_at
│
├── Audit_Logs Table
│   ├── id (UUID, PK)
│   ├── user_id (FK)
│   ├── action (CREATE/UPDATE/DELETE/EXECUTE)
│   ├── resource_type
│   ├── resource_id
│   ├── changes (JSONB)
│   └── timestamp
│
└── Node_Registry Table
    ├── id (UUID, PK)
    ├── node_type_name
    ├── category
    ├── description
    ├── schema (JSONB)
    ├── icon_url
    └── documentation_url
```

---

## 🔄 Data Flow

### 1. User Registration & Authentication Flow

```
Frontend                API Gateway            Backend Service           Database
    │                       │                         │                      │
    ├─Register Request──────>│                         │                      │
    │                        ├─Hash Request─────────────>│                     │
    │                        │                         ├─Generate OTP─────────>│
    │                        │                         │                      │
    │<─OTP Sent─────────────<┤<─OTP Response──────────<┤<─Store OTP Sent────<│
    │                        │                         │                      │
    │───OTP Verification────>│                         │                      │
    │                        ├─Verify──────────────────>│                     │
    │                        │                         ├─Compare OTP─────────>│
    │                        │                         │      & Hash          │
    │<─JWT Token────────────<┤<─Auth Token────────────<┤<─Session Created───<│
    │                        │                         │                      │
```

### 2. Workflow Execution Flow

```
Frontend              Backend Service         Kafka Queue          AI Service      Database
    │                      │                     │                    │              │
    ├─Execute Workflow────>│                     │                    │              │
    │                      ├─Create Execution───────────────────────────────────────>│
    │                      ├─Publish: execution.started──────────────>│              │
    │                      │                     │                    │              │
    │                      │                [Consumed]                │              │
    │                      │<────────────────────┤                    │              │
    │                      ├─Get First Node─────────────────────────────────────────>│
    │                      │                     │                    │              │
    │                      ├─Execute Node───────────────────────────────────────────>│
    │                      │                     │<──────Execute LLM──┤              │
    │                      │                     │<──────API Response─┤              │
    │                      ├─Save Output────────────────────────────────────────────>│
    │                      ├─Publish: node.completed────────────────>│              │
    │                      │                     │                    │              │
    │<─WebSocket Update───<┤─Get Execution Status───────────────────>│              │
    │                      │                     │                    │              │
    │ (Repeat for next nodes until complete)    │                    │              │
    │                      │                     │                    │              │
    │                      ├─Publish: execution.completed────────────>│              │
    │<─Final Result────────<┤<─Final Output─────────────────────────<┤              │
```

### 3. Integration Authorization Flow

```
Frontend              Backend Service         OAuth Provider         Database
    │                      │                      │                      │
    ├─Authorize Google────>│                      │                      │
    │                      ├─Generate State────────────────────────────>│
    │                      │                      │                      │
    │<─Redirect to Google─<┤<─Auth URL───────────<│                      │
    │                      │                      │                      │
    │ [User Grants Permissions on Google]         │                      │
    │                      │                      │                      │
    │                      │<─Redirect w/ Code────────────────────────  │
    │                      │                      │                      │
    │                      ├─Exchange Code────────>│                      │
    │                      │                      │                      │
    │                      │<─Access Token────────┤                      │
    │                      ├─Encrypt Token───────────────────────────────>│
    │                      │                      │                      │
    │<─Authorization Complete──────────────────────────────────────────  │
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
Security Layers
│
├── Layer 1: Transport Security
│   ├── HTTPS/TLS 1.3
│   ├── Certificate pinning
│   └── HSTS headers
│
├── Layer 2: Authentication
│   ├── OTP Verification (2FA)
│   ├── JWT Token Generation
│   ├── Token Expiration (15 min access, 7 day refresh)
│   └── Secure Session Management
│
├── Layer 3: Authorization
│   ├── Role-Based Access Control (RBAC)
│   ├── Resource-Level Permissions
│   ├── API Endpoint Authorization
│   └── Data Row-Level Security
│
├── Layer 4: Data Protection
│   ├── AES-256 Encryption at Rest
│   ��── Bcrypt for Password Hashing
│   ├── OAuth Token Encryption
│   └── PII Masking in Logs
│
└── Layer 5: Audit & Monitoring
    ├── Complete Activity Logging
    ├── Failed Authentication Tracking
    ├── Permission Change Audits
    └── Anomaly Detection
```

### Credential Storage

```
Credential Encryption
│
├── OAuth Tokens
│   ├── Encrypted with AES-256
│   ├── Stored in secure vault (PostgreSQL)
│   ├── Decrypted only during API calls
│   └── Rotated regularly
│
├── API Keys (for integrations)
│   ├── Hashed with bcrypt
│   ├── Salt generated per key
│   ├── Scoped access control
│   └── Usage monitoring
│
├── User Passwords
│   ├── PBKDF2 + bcrypt hashing
│   ├── Salted with secure random
│   ├── Never stored in plaintext
│   └── No password recovery available (OTP reset)
│
└── Encryption Keys
    ├── Master key rotation quarterly
    ├── Key stored in secure environment variables
    ├── Separate keys for different data types
    └── HSM support for production
```

---

## 🚀 Deployment Architecture

### Development Environment

```
Docker Compose Setup
├── Frontend Container
│   └── Next.js dev server (localhost:3000)
│
├── Backend Container
│   └── Spring Boot (localhost:8080)
│
├── AI Service Container
│   └── Python service (localhost:5000)
│
├── PostgreSQL Container
│   └── Database (localhost:5432)
│
├── Redis Container
│   └── Cache (localhost:6379)
│
└── Kafka Container
    ├── Kafka Broker (localhost:9092)
    └── Zookeeper (localhost:2181)
```

### Production Environment

```
Kubernetes Deployment
│
├── Namespace: autoweave-prod
│
├── Frontend Deployment
│   ├── Replicas: 3
│   ├── Pod: Next.js + Nginx
│   ├── Service: ClusterIP (internal)
│   └── Ingress: HTTPS with TLS
│
├── Backend Deployment
│   ├── Replicas: 3
│   ├── Pod: Spring Boot
│   ├── Service: ClusterIP
│   ├── StatefulSet with persistence
│   └── Health checks (liveness/readiness)
│
├── AI Service Deployment
│   ├── Replicas: 2
│   ├── Pod: Python + LangChain
│   ├── Resource limits (GPU optional)
│   └── Service: ClusterIP
│
├── PostgreSQL StatefulSet
│   ├── Replicas: 1 (Primary) + 2 (Replicas)
│   ├── Persistent Volume: 500GB SSD
│   ├── Automated backups (daily)
│   └── Point-in-time recovery
│
├── Redis StatefulSet
│   ├── Replicas: 3 (Sentinel mode)
│   ├── Persistent Volume: 100GB SSD
│   ├── Automatic failover
│   └── Data replication
│
└── Kafka StatefulSet
    ├── Replicas: 3 (minimum)
    ├── Persistent Volume: 1TB SSD
    ├── Zookeeper: 3 replicas
    └── Topic replication factor: 3
```

---

## 📈 Scalability Patterns

### Horizontal Scaling

**Stateless Services** (Can scale easily):
- Frontend (Next.js)
- Backend API (Spring Boot)
- AI Service (Python)
- WebSocket Server

**Deployment Strategy:**
```
Load Balancer
├── Instance 1 (Spring Boot)
├── Instance 2 (Spring Boot)
├── Instance 3 (Spring Boot)
└── Instance N (Spring Boot)
```

**Auto-scaling Rules:**
```
CPU Utilization > 70% → Scale Up
CPU Utilization < 30% → Scale Down (after 5 min)
Memory Usage > 85% → Scale Up immediately
Response Time > 2s → Scale Up
```

---

### Stateful Services

**Database Replication:**
```
Primary (Write)
├── Replica 1 (Read)
└── Replica 2 (Read)

Read queries distributed to replicas
Write queries go to primary
```

**Redis Clustering:**
```
Master-Slave Replication
├── Master (Write)
├── Slave 1 (Read)
└── Slave 2 (Read)

Sentinel monitors health
Auto-failover on primary failure
```

---

### Caching Strategy

```
Cache Hierarchy
│
├── L1: Browser Cache (Static assets)
│   ├── Images: 1 month
│   ├── CSS/JS: 1 week
│   └── HTML: 5 minutes
│
├── L2: Redis Cache (Server-side)
│   ├── Hot data: 1 hour
│   ├── Sessions: 24 hours
│   ├── API responses: 15 minutes
│   └── LRU eviction policy
│
└── L3: Database (Persistent storage)
    └── Query results for miss
```

---

### Database Performance

**Indexing Strategy:**

```
Primary Indexes:
├── USERS: id (PK), email (unique)
├── WORKFLOWS: id (PK), user_id (FK), status
├── EXECUTIONS: id (PK), workflow_id (FK), status, created_at
├── EXECUTION_LOGS: id (PK), execution_id (FK), created_at
└── INTEGRATIONS: id (PK), user_id (FK), service_type

Composite Indexes:
├── EXECUTIONS: (user_id, status, created_at DESC)
├── EXECUTION_LOGS: (execution_id, node_id, created_at DESC)
└── AUDIT_LOGS: (user_id, created_at DESC)
```

**Query Optimization:**
- Connection pooling (max 50 connections)
- Prepared statements for all queries
- EXPLAIN ANALYZE for query analysis
- Materialized views for aggregations

---

## 📊 Monitoring & Observability

### Application Metrics

```
Prometheus Metrics
├── HTTP Requests
│   ├── http_requests_total (counter)
│   ├── http_request_duration_seconds (histogram)
│   └── http_request_size_bytes (histogram)
│
├── Business Metrics
│   ├── workflow_executions_total
│   ├── workflow_execution_duration_seconds
│   ├── node_execution_errors_total
│   └── integration_api_calls_total
│
├── System Metrics
│   ├── jvm_memory_usage_bytes
│   ├── jvm_gc_pause_seconds
│   ├── process_cpu_usage_percent
│   └── disk_io_operations_per_second
│
└── Database Metrics
    ├── db_connection_pool_usage
    ├── db_query_duration_seconds
    ├── db_connection_errors_total
    └── db_replication_lag_seconds
```

### Logging

```
Centralized Logging (ELK Stack)
├── Application Logs
│   ├── INFO: General operations
│   ├── WARN: Unusual conditions
│   ├── ERROR: Error events
│   └── DEBUG: Detailed debugging
│
├── Access Logs
│   ├── Request/Response details
│   ├── User identification
│   ├── Performance metrics
│   └── Error tracking
│
└── Audit Logs
    ├── User actions
    ├── Permission changes
    ├── Data modifications
    └── Authentication events
```

---

## 🔧 Configuration Management

### Environment Variables

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoweave
DB_USER=autoweave
DB_PASSWORD=*** (encrypted)
DB_POOL_SIZE=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=*** (encrypted)

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_PREFIX=autoweave

# OAuth
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=*** (encrypted)
OAUTH_REDIRECT_URI=https://autoweave.app/oauth/callback

# JWT
JWT_SECRET=*** (encrypted)
JWT_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7

# Encryption
ENCRYPTION_KEY=*** (encrypted)
ENCRYPTION_ALGORITHM=AES-256

# Service URLs
API_BASE_URL=https://api.autoweave.app
AI_SERVICE_URL=http://ai-service:5000
FRONTEND_URL=https://autoweave.app

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=JSON
```

---

## 🔄 Service Communication

### Internal Communication

```
Service A ──(HTTP/REST)──> Service B
         ──(gRPC)────────> Service C
         ──(Kafka)───────> Event Consumers
```

### External Communication

```
AutoWeave ──(HTTPS/REST)──> Google Calendar API
          ──(HTTPS/REST)──> Gmail API
          ──(HTTPS/REST)──> Custom User APIs
          ──(WebSocket)──> Frontend Clients
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Database migration scripts tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Load testing completed

### Deployment Steps

1. Build Docker images
2. Push to registry
3. Update Kubernetes manifests
4. Apply database migrations
5. Deploy services (backend first, then frontend)
6. Verify health checks
7. Run smoke tests
8. Monitor error rates

### Post-Deployment

- [ ] Verify all services running
- [ ] Check database connectivity
- [ ] Test authentication flow
- [ ] Verify integrations working
- [ ] Monitor system metrics
- [ ] Check logs for errors

---

## 🎯 Design Principles

1. **Microservices**: Independent, scalable services
2. **Event-Driven**: Kafka for async communication
3. **Stateless**: Services can be replicated
4. **Resilience**: Automatic retries, circuit breakers
5. **Security**: Encryption, authentication, audit logging
6. **Observability**: Comprehensive logging and metrics
7. **Performance**: Caching, connection pooling, optimization
8. **Maintainability**: Clean code, documentation, testing

---

## 🚀 Future Enhancements

- [ ] GraphQL API as alternative to REST
- [ ] gRPC for inter-service communication
- [ ] Service mesh (Istio) for traffic management
- [ ] Event sourcing for complete audit trail
- [ ] CQRS pattern for complex queries
- [ ] Distributed tracing (Jaeger)
- [ ] Machine learning for workflow optimization
- [ ] Multi-tenant architecture support

