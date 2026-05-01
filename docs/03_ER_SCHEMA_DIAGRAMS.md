# Entity-Relationship & Schema Diagrams - AutoWeave

## 1. Complete ER Diagram (Conceptual Model)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    AUTOWEAVE DATABASE SCHEMA (ER MODEL)                     │
└────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    USERS     │
                                    ├──────────────┤
                                    │ PK: id       │
                                    │    email     │
                                    │    password  ���
                                    │    otp_secret│
                                    │    created_at│
                                    │    updated_at│
                                    └──────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    │ (1:M) owns           │ (1:M) has            │ (1:M) authorized
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌─────────────────┐    ┌──────────────────┐   ┌──────────────────┐
           │   WORKFLOWS     │    │    AUDIT_LOGS    │   │  INTEGRATIONS    │
           ├─────────────────┤    ├──────────────────┤   ├──────────────────┤
           │ PK: id          │    │ PK: id           │   │ PK: id           │
           │ FK: user_id     │    │ FK: user_id (FK) │   │ FK: user_id (FK) │
           │    name         │    │    action        │   │    service_type  │
           │    description  │    │    resource_type │   │    encrypted_token│
           │    status       │    │    resource_id   │   │    refresh_token │
           │    created_at   │    │    changes       │   │    scopes        │
           │    updated_at   │    │    timestamp     │   │    authorized_at │
           │    version_id   │    └──────────────────┘   │    expires_at    │
           └────────┬────────┘                           └──────────────────┘
                    │
                    │ (1:M) contains
                    │
                    ▼
         ┌──────────────────────┐
         │  WORKFLOW_VERSIONS   │
         ├──────────────────────┤
         │ PK: id               │
         │ FK: workflow_id      │
         │    version_number    │
         │    snapshot (JSONB)  │
         │    created_at        │
         │    created_by        │
         └──────┬───────────────┘
                │
                │ (1:M) describes
                │
                ▼
         ┌──────────────────────┐
         │   WORKFLOW_NODES     │
         ├──────────────────────┤
         │ PK: id               │
         │ FK: workflow_id      │
         │    node_type         │
         │    position_x        │
         │    position_y        │
         │    config (JSONB)    │
         │    connections(JSONB)│
         │    created_at        │
         │    updated_at        │
         └──────┬───────────────┘
                │
                │ (M:M) is_used_in
                │
                ▼
         ┌──────────────────────┐
         │   NODE_REGISTRY      │
         ├──────────────────────┤
         │ PK: id               │
         │    node_type_name    │
         │    category          │
         │    description       │
         │    schema (JSONB)    │
         │    icon_url          │
         │    documentation_url │
         └──────────────────────┘


           ┌──────────────────────┐
           │   EXECUTIONS         │
           ├──────────────────────┤
           │ PK: id               │
           │ FK: workflow_id      │
           │ FK: triggered_by_id  │
           │    status            │
           │    started_at        │
           │    completed_at      │
           │    current_node_id   │
           │    results (JSONB)   │
           │    error_details     │
           │    created_at        │
           └──────┬───────────────┘
                  │
                  │ (1:M) generates_logs
                  │
                  ▼
           ┌────────���─────────────┐
           │  EXECUTION_LOGS      │
           ├──────────────────────┤
           │ PK: id               │
           │ FK: execution_id     │
           │ FK: node_id          │
           │    status            │
           │    input (JSONB)     │
           │    output (JSONB)    │
           │    error_message     │
           │    duration_ms       │
           │    retry_count       │
           │    timestamp         │
           └──────────────────────┘
```

---

## 2. Detailed Schema Definition

### Table: USERS

**Purpose**: Store user account information and authentication data

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    otp_secret VARCHAR(32) NOT NULL,
    otp_verified BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| otp_secret | VARCHAR(32) | NOT NULL | Base32 encoded OTP secret |
| otp_verified | BOOLEAN | DEFAULT FALSE | 2FA verification status |
| first_name | VARCHAR(100) | NULLABLE | User's first name |
| last_name | VARCHAR(100) | NULLABLE | User's last name |
| profile_picture_url | TEXT | NULLABLE | URL to profile picture |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | User's timezone |
| language | VARCHAR(5) | DEFAULT 'en' | Preferred language code |
| notifications_enabled | BOOLEAN | DEFAULT TRUE | Email notification preference |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last profile update |
| last_login_at | TIMESTAMP | NULLABLE | Last successful login |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

### Table: WORKFLOWS

**Purpose**: Store workflow definitions and metadata

```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    icon_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_version_id UUID,
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT status_enum CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISABLED')),
    CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indexes
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Unique workflow identifier |
| user_id | UUID | FK, NOT NULL | Owner of the workflow |
| name | VARCHAR(255) | NOT NULL | Workflow display name |
| description | TEXT | NULLABLE | Workflow description |
| status | VARCHAR(50) | ENUM | DRAFT/PUBLISHED/ARCHIVED/DISABLED |
| icon_url | TEXT | NULLABLE | Custom workflow icon |
| tags | TEXT[] | ARRAY | For categorization/search |
| current_version_id | UUID | FK | Active version ID |
| published_at | TIMESTAMP | NULLABLE | Publication timestamp |
| archived_at | TIMESTAMP | NULLABLE | Archive timestamp |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last modification |
| deleted_at | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

### Table: WORKFLOW_VERSIONS

**Purpose**: Track version history of workflows

```sql
CREATE TABLE workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    changelog TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT version_positive CHECK (version_number > 0),
    UNIQUE(workflow_id, version_number)
);

-- Indexes
CREATE INDEX idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_created_at ON workflow_versions(created_at DESC);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Version record identifier |
| workflow_id | UUID | FK, NOT NULL | Reference to workflow |
| version_number | INTEGER | NOT NULL | Sequential version number |
| snapshot | JSONB | NOT NULL | Complete workflow state snapshot |
| changelog | TEXT | NULLABLE | Change description |
| created_by | UUID | FK | User who made the version |
| created_at | TIMESTAMP | DEFAULT NOW | Version creation time |

---

### Table: WORKFLOW_NODES

**Purpose**: Store individual nodes/steps in workflows

```sql
CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,
    position_x DECIMAL(10, 2),
    position_y DECIMAL(10, 2),
    label VARCHAR(255),
    config JSONB NOT NULL DEFAULT '{}',
    connections JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT node_type_enum CHECK (node_type IN (
        'TRIGGER', 'ACTION', 'CONDITION', 'LLM', 
        'INTEGRATION', 'LOOP', 'PARALLEL', 'DELAY', 'NOTIFICATION'
    ))
);

-- Indexes
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_node_type ON workflow_nodes(node_type);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Node identifier |
| workflow_id | UUID | FK, NOT NULL | Parent workflow |
| node_type | VARCHAR(50) | ENUM | Type of node |
| position_x | DECIMAL(10, 2) | NULLABLE | X coordinate on canvas |
| position_y | DECIMAL(10, 2) | NULLABLE | Y coordinate on canvas |
| label | VARCHAR(255) | NULLABLE | Display label |
| config | JSONB | NOT NULL | Node configuration (flexible) |
| connections | JSONB | NOT NULL | Edge connections array |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

**Config JSONB Examples**:

```json
// LLM Node
{
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 500,
  "prompt_template": "Summarize: {{input}}"
}

// Condition Node
{
  "condition": "output.status == 'success'",
  "true_branch": "node_success",
  "false_branch": "node_retry"
}

// Integration Node
{
  "service": "google_calendar",
  "action": "create_event",
  "parameters": {
    "calendar_id": "primary",
    "summary": "{{event_title}}",
    "start_time": "{{start_datetime}}"
  }
}
```

---

### Table: NODE_REGISTRY

**Purpose**: Define available node types and their schemas

```sql
CREATE TABLE node_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    icon_url TEXT,
    documentation_url TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT category_enum CHECK (category IN (
        'TRIGGER', 'ACTION', 'CONTROL_FLOW', 'AI', 'INTEGRATION', 'UTILITY'
    ))
);

-- Indexes
CREATE INDEX idx_node_registry_category ON node_registry(category);
CREATE INDEX idx_node_registry_node_type ON node_registry(node_type_name);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Registry entry ID |
| node_type_name | VARCHAR(100) | UNIQUE | Node type identifier |
| category | VARCHAR(50) | ENUM | Node category |
| description | TEXT | NULLABLE | Node description |
| schema | JSONB | NOT NULL | JSON schema for validation |
| icon_url | TEXT | NULLABLE | Icon URL |
| documentation_url | TEXT | NULLABLE | Documentation link |
| is_custom | BOOLEAN | DEFAULT FALSE | Custom/Built-in flag |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

**Schema JSONB Example**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "model": {
      "type": "string",
      "enum": ["gpt-4", "gpt-3.5-turbo", "claude-2"]
    },
    "temperature": {
      "type": "number",
      "minimum": 0,
      "maximum": 1
    },
    "prompt_template": {
      "type": "string"
    }
  },
  "required": ["model", "prompt_template"]
}
```

---

### Table: EXECUTIONS

**Purpose**: Store workflow execution records

```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_by_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    input_data JSONB,
    results JSONB,
    error_details JSONB,
    current_node_id UUID REFERENCES workflow_nodes(id),
    total_duration_ms INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT status_enum CHECK (status IN (
        'PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'
    ))
);

-- Indexes
CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_workflow_user ON executions(workflow_id, user_id, created_at DESC);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Execution ID |
| workflow_id | UUID | FK, NOT NULL | Executed workflow |
| user_id | UUID | FK, NOT NULL | Workflow owner |
| triggered_by_id | UUID | FK | User who triggered |
| status | VARCHAR(50) | ENUM | Current execution status |
| input_data | JSONB | NULLABLE | Input parameters |
| results | JSONB | NULLABLE | Final results |
| error_details | JSONB | NULLABLE | Error information |
| current_node_id | UUID | FK | Currently executing node |
| total_duration_ms | INTEGER | NULLABLE | Total execution time |
| started_at | TIMESTAMP | NULLABLE | Start time |
| completed_at | TIMESTAMP | NULLABLE | Completion time |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

---

### Table: EXECUTION_LOGS

**Purpose**: Store detailed logs for each node execution

```sql
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    input JSONB,
    output JSONB,
    error_message TEXT,
    error_code VARCHAR(50),
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT status_enum CHECK (status IN (
        'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED', 'RETRYING'
    ))
);

-- Indexes
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_node_id ON execution_logs(node_id);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at DESC);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log record ID |
| execution_id | UUID | FK, NOT NULL | Parent execution |
| node_id | UUID | FK, NOT NULL | Executed node |
| status | VARCHAR(50) | ENUM | Node execution status |
| input | JSONB | NULLABLE | Input to node |
| output | JSONB | NULLABLE | Output from node |
| error_message | TEXT | NULLABLE | Error message |
| error_code | VARCHAR(50) | NULLABLE | Error code |
| duration_ms | INTEGER | NULLABLE | Execution duration |
| retry_count | INTEGER | DEFAULT 0 | Number of retries |
| max_retries | INTEGER | DEFAULT 3 | Max retry attempts |
| next_retry_at | TIMESTAMP | NULLABLE | Next retry time |
| started_at | TIMESTAMP | DEFAULT NOW | Execution start |
| completed_at | TIMESTAMP | NULLABLE | Execution end |
| created_at | TIMESTAMP | DEFAULT NOW | Log creation |

---

### Table: INTEGRATIONS

**Purpose**: Store third-party service integrations for users

```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    encrypted_token TEXT NOT NULL,
    refresh_token TEXT,
    scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    authorized_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT service_type_enum CHECK (service_type IN (
        'GOOGLE_CALENDAR', 'GMAIL', 'SLACK', 'TRELLO', 
        'JIRA', 'CUSTOM_API', 'WEBHOOK'
    )),
    UNIQUE(user_id, service_type)
);

-- Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_service_type ON integrations(service_type);
CREATE INDEX idx_integrations_expires_at ON integrations(expires_at);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Integration ID |
| user_id | UUID | FK, NOT NULL | User who authorized |
| service_type | VARCHAR(100) | ENUM | Service provider |
| display_name | VARCHAR(255) | NULLABLE | Custom display name |
| encrypted_token | TEXT | NOT NULL | Encrypted access token |
| refresh_token | TEXT | NULLABLE | OAuth refresh token |
| scopes | TEXT[] | ARRAY | Granted permissions |
| metadata | JSONB | DEFAULT {} | Service-specific data |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| authorized_at | TIMESTAMP | DEFAULT NOW | Authorization time |
| expires_at | TIMESTAMP | NULLABLE | Token expiration |
| last_used_at | TIMESTAMP | NULLABLE | Last usage time |
| created_at | TIMESTAMP | DEFAULT NOW | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

---

### Table: AUDIT_LOGS

**Purpose**: Track all user actions for security and compliance

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT action_enum CHECK (action IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 
        'PUBLISH', 'EXECUTE', 'LOGIN', 'LOGOUT'
    )),
    CONSTRAINT resource_type_enum CHECK (resource_type IN (
        'WORKFLOW', 'EXECUTION', 'INTEGRATION', 'USER', 'SETTINGS'
    ))
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

**Columns Description**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Log entry ID |
| user_id | UUID | FK | User who performed action |
| action | VARCHAR(100) | ENUM | Action performed |
| resource_type | VARCHAR(100) | ENUM | Type of resource |
| resource_id | UUID | NULLABLE | Resource identifier |
| old_values | JSONB | NULLABLE | Previous values |
| new_values | JSONB | NULLABLE | New values |
| ip_address | INET | NULLABLE | Client IP address |
| user_agent | TEXT | NULLABLE | Browser user agent |
| status | VARCHAR(50) | DEFAULT 'SUCCESS' | Action status |
| error_message | TEXT | NULLABLE | Error details |
| created_at | TIMESTAMP | DEFAULT NOW | Log timestamp |

---

## 3. Relationship Diagrams

### 3.1 User-Workflow Relationship

```
┌──────────────┐           1:M            ┌──────────────────┐
│   USERS      │ ─────────────────────────│  WORKFLOWS       │
├──────────────┤                          ├──────────────────┤
│ id (PK)      │◄───── user_id (FK) ──────│ id (PK)          │
│ email        │                          │ user_id (FK)     │
│ ...          │                          │ name             │
└──────────────┘                          │ status           │
                                          │ ...              │
                                          └──────────────────┘

Relationship Type: One-to-Many
- One user can own multiple workflows
- Each workflow belongs to exactly one user
- ON DELETE CASCADE: Deleting user deletes all their workflows
```

### 3.2 Workflow-Nodes Relationship

```
┌──────────────────┐        1:M        ┌─────────────────────┐
│   WORKFLOWS      │──────────────────│  WORKFLOW_NODES     │
├──────────────────┤                  ├─────────────────────┤
│ id (PK)          │◄──workflow_id────│ id (PK)             │
│ ...              │                  │ workflow_id (FK)    │
└──────────────────┘                  │ node_type           │
                                      │ config (JSONB)      │
                                      │ connections (JSONB) │
                                      └─────────────────────┘

Relationship Type: One-to-Many
- One workflow can have multiple nodes (steps)
- Each node belongs to exactly one workflow
- Nodes are visually connected via 'connections' JSONB array
- ON DELETE CASCADE: Deleting workflow deletes all nodes
```

### 3.3 Nodes-Registry Relationship

```
┌──────────────────┐        M:1        ┌──────────────────┐
│  WORKFLOW_NODES  │──────────────────│  NODE_REGISTRY   │
├──────────────────┤                  ├──────────────────┤
│ id (PK)          │ node_type ──────│ node_type_name   │
│ node_type (FK)   │  (string ref)   │ id (PK)          │
│ config (JSONB)   │                  │ schema (JSONB)   │
└──────────────────┘                  │ category         │
                                      └──────────────────┘

Relationship Type: Many-to-One
- Many nodes can use the same node type
- Each node type has a schema definition in registry
- Flexible relationship (not traditional FK due to string key)
- Used for validation and metadata
```

### 3.4 Execution-Logs Relationship

```
┌─────────────────┐        1:M        ┌──────────────────┐
│   EXECUTIONS    │──────────────────│  EXECUTION_LOGS  │
├─────────────────┤                  ├──────────────────┤
│ id (PK)         │◄──execution_id───│ id (PK)          │
│ workflow_id     │                  │ execution_id (FK)│
│ status          │                  │ node_id (FK)     │
│ results         │                  │ status           │
└─────────────────┘                  │ input (JSONB)    │
                                      │ output (JSONB)   │
                                      └──────────────────┘

Relationship Type: One-to-Many
- One execution generates many node-level logs
- Each log record tracks one node's execution
- Complete audit trail of execution
- ON DELETE CASCADE: Deleting execution deletes all logs
```

### 3.5 User-Integration Relationship

```
┌──────────────┐        1:M        ┌─────────────────┐
│   USERS      │──────────────────│  INTEGRATIONS   │
├──────────────┤                  ├─────────────────┤
│ id (PK)      │◄──user_id────────│ id (PK)         │
│ email        │                  │ user_id (FK)    │
│ ...          │                  │ service_type    │
└──────────────┘                  │ encrypted_token │
                                  │ ...             │
                                  └─────────────────┘

Relationship Type: One-to-Many
- One user can authorize multiple services
- UNIQUE(user_id, service_type): Only one integration per service per user
- Each integration stores encrypted OAuth token
- ON DELETE CASCADE: Deleting user deletes all integrations
```

---

## 4. Complete Logical Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE LOGICAL DATA MODEL                           │
└─────────────────────────────────────────────────────────────────────────┘

┌───────��─────────────────────┐
│      USERS (Entities)       │
├─────────────────────────────┤
│ • id (UUID, PK)             │
│ • email (VARCHAR, UNIQUE)   │
│ • password_hash             │
│ • otp_secret                │
│ • profile data              │
│ • preferences               │
│ • audit trail               │
└────────────┬────────────────┘
             │
    ┌────────┼────────┬──────────┬──────────────┐
    │        │        │          │              │
    ▼        ▼        ▼          ▼              ▼

┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────┐
│WORKFLOWS │ │AUDIT_LOGS    │ │EXECUTIONS  │ │INTEGRATIONS  │
├──────────┤ ├──────────────┤ ├────────────┤ ├──────────────┤
│• id(PK)  │ │• id(PK)      │ │• id(PK)    │ │• id(PK)      │
│• user_id │ │• user_id(FK) │ │• user_id   │ │• user_id(FK) │
│• name    │ │• action      │ │• workflow_ │ │• service_type│
│• status  │ │• resource    │ │  id(FK)    │ │• token       │
│• version │ │• changes     │ │• status    │ │• refresh_tok │
└────┬─────┘ └──────────────┘ └─────┬──────┘ └──────────────┘
     │                              │
     │                              │
     ▼                              ▼
┌──────────────────┐      ┌──────────────────────┐
│WORKFLOW_VERSIONS │      │  EXECUTION_LOGS      │
├──────────────────┤      ├──────────────────────┤
│• id(PK)          │      │• id(PK)              │
│• workflow_id(FK) │      │• execution_id(FK)    │
│• version_number  │      │• node_id(FK)         │
│• snapshot(JSONB) │      │• status              │
└──────────────────┘      │• input/output(JSONB) │
                          │• duration_ms         │
     │                    └──────────────────────┘
     │
     ▼
┌──────────────────┐
│ WORKFLOW_NODES   │
├──────────────────┤
│• id(PK)          │
│• workflow_id(FK) │
│• node_type       │
│• config(JSONB)   │
│• connections(J)  │
└────────┬─────────┘
         │
         │ (References)
         │
         ▼
┌──────────────────┐
│ NODE_REGISTRY    │
├──────────────────┤
│• id(PK)          │
│• node_type_name  │
│• category        │
│• schema(JSONB)   │
│• icon_url        │
└──────────────────┘
```

---

## 5. Data Types & Constraints Reference

### UUID vs SERIAL
```
✓ Used UUID (gen_random_uuid()) for all primary keys
  • Globally unique
  • No sequence needed
  • Better for distributed systems
  • Privacy (not sequential)
```

### JSONB vs JSON
```
✓ Used JSONB (Binary JSON) for flexible data
  • Smaller storage
  • Faster operations
  • Supports indexing
  • Used for:
    - config (Node configurations)
    - connections (Edge definitions)
    - metadata (Service-specific data)
    - input/output (Execution data)
    - snapshot (Version history)
```

### Timestamp Fields
```
Pattern Used:
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  └─ Set only on creation, never changed
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
  └─ Updated on every modification
- deleted_at: TIMESTAMP (NULL by default)
  └─ Used for soft deletes, preserves data
- *_at: Other time markers for specific events
```

### ENUM vs CHECK Constraints
```
✓ Used CHECK constraints instead of ENUM type
  Reasons:
  • More flexible (can change values)
  • Better for migrations
  • Explicit in schema
  • Easier to debug
  
  Example:
  CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
```

### Array Types
```
✓ Used TEXT[] for storing lists
  Example: tags TEXT[] DEFAULT ARRAY[]::TEXT[]
  
✓ Used JSONB[] for complex arrays
  Example: scopes JSONB DEFAULT '[]'::JSONB
  
✓ Used for:
  - tags (workflow categories)
  - scopes (OAuth permissions)
  - connections (node edges)
```

---

## 6. Indexes Strategy

### Performance Indexes

```sql
-- Frequently Filtered Columns
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_executions_status ON executions(status);

-- Sorting Columns (DESC for recent-first)
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite Indexes (for common WHERE clauses)
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);
CREATE INDEX idx_executions_workflow_user ON executions(workflow_id, user_id, created_at DESC);

-- Search Columns
CREATE INDEX idx_users_email ON users(email);

-- Foreign Key Columns
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
```

### Index Statistics

| Table | Total Indexes | Primary Purpose |
|-------|---------------|-----------------|
| users | 2 | Login, account lookup |
| workflows | 4 | User workflows, status filtering |
| workflow_nodes | 2 | Workflow structure, node queries |
| executions | 5 | Execution history, status filtering |
| execution_logs | 4 | Execution details, debugging |
| integrations | 3 | User services, token refresh |
| audit_logs | 4 | User actions, compliance |
| **Total** | **24** | - |

---

## 7. SQL Setup Scripts

### Create All Tables

```sql
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    otp_secret VARCHAR(32) NOT NULL,
    otp_verified BOOLEAN DEFAULT FALSE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    icon_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_version_id UUID,
    published_at TIMESTAMP,
    archived_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT status_enum CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DISABLED')),
    CONSTRAINT name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Workflow Versions Table
CREATE TABLE IF NOT EXISTS workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    changelog TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT version_positive CHECK (version_number > 0),
    UNIQUE(workflow_id, version_number)
);

-- Workflow Nodes Table
CREATE TABLE IF NOT EXISTS workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,
    position_x DECIMAL(10, 2),
    position_y DECIMAL(10, 2),
    label VARCHAR(255),
    config JSONB NOT NULL DEFAULT '{}',
    connections JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT node_type_enum CHECK (node_type IN (
        'TRIGGER', 'ACTION', 'CONDITION', 'LLM', 
        'INTEGRATION', 'LOOP', 'PARALLEL', 'DELAY', 'NOTIFICATION'
    ))
);

-- Node Registry Table
CREATE TABLE IF NOT EXISTS node_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    icon_url TEXT,
    documentation_url TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT category_enum CHECK (category IN (
        'TRIGGER', 'ACTION', 'CONTROL_FLOW', 'AI', 'INTEGRATION', 'UTILITY'
    ))
);

-- Executions Table
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    triggered_by_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    input_data JSONB,
    results JSONB,
    error_details JSONB,
    current_node_id UUID REFERENCES workflow_nodes(id),
    total_duration_ms INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_enum CHECK (status IN (
        'PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED'
    ))
);

-- Execution Logs Table
CREATE TABLE IF NOT EXISTS execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    input JSONB,
    output JSONB,
    error_message TEXT,
    error_code VARCHAR(50),
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_enum CHECK (status IN (
        'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED', 'RETRYING'
    ))
);

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    encrypted_token TEXT NOT NULL,
    refresh_token TEXT,
    scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    authorized_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_type_enum CHECK (service_type IN (
        'GOOGLE_CALENDAR', 'GMAIL', 'SLACK', 'TRELLO', 
        'JIRA', 'CUSTOM_API', 'WEBHOOK'
    )),
    UNIQUE(user_id, service_type)
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT action_enum CHECK (action IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 
        'PUBLISH', 'EXECUTE', 'LOGIN', 'LOGOUT'
    )),
    CONSTRAINT resource_type_enum CHECK (resource_type IN (
        'WORKFLOW', 'EXECUTION', 'INTEGRATION', 'USER', 'SETTINGS'
    ))
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX idx_workflows_user_status ON workflows(user_id, status);

CREATE INDEX idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);
CREATE INDEX idx_workflow_versions_created_at ON workflow_versions(created_at DESC);

CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_nodes_node_type ON workflow_nodes(node_type);

CREATE INDEX idx_node_registry_category ON node_registry(category);
CREATE INDEX idx_node_registry_node_type ON node_registry(node_type_name);

CREATE INDEX idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX idx_executions_user_id ON executions(user_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_workflow_user ON executions(workflow_id, user_id, created_at DESC);

CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_node_id ON execution_logs(node_id);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at DESC);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_service_type ON integrations(service_type);
CREATE INDEX idx_integrations_expires_at ON integrations(expires_at);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

---

## 8. Schema Statistics

### Table Size Estimates (per 1000 records)

| Table | Avg Size | Growth | Retention |
|-------|----------|--------|-----------|
| users | 500 KB | Slow | Permanent |
| workflows | 2 MB | Medium | Permanent |
| workflow_versions | 5 MB | Fast | Permanent |
| workflow_nodes | 3 MB | Medium | Permanent |
| node_registry | 100 KB | Very Slow | Permanent |
| executions | 8 MB | Fast | 90 days |
| execution_logs | 20 MB | Very Fast | 30 days |
| integrations | 1 MB | Slow | Until revoked |
| audit_logs | 10 MB | Very Fast | 1 year |

**Total Estimated Size** (10k users, 50k workflows, 1M executions): **~5 GB**

---

## 9. Data Integrity Constraints

### Referential Integrity
```
✓ Enforced via Foreign Keys with ON DELETE CASCADE
  • Delete user → Delete workflows, integrations, audit logs
  • Delete workflow → Delete nodes, versions, executions
  • Delete execution → Delete execution logs

✓ ON DELETE SET NULL
  • triggered_by_id in executions (can be unknown user)
  • user_id in audit_logs (preserves audit trail)
```

### Domain Constraints
```
✓ CHECK Constraints
  • Email format validation
  • Non-empty names
  • Positive version numbers
  • Enum value validation (status, types)

✓ UNIQUE Constraints
  • User email (no duplicates)
  • Workflow version (workflow_id, version_number)
  • Integration per service (user_id, service_type)
```

---

## 10. Query Performance Examples

### Common Query Patterns

```sql
-- Get user's workflows
SELECT * FROM workflows 
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
-- Uses: idx_workflows_user_status

-- Get execution history
SELECT * FROM executions
WHERE workflow_id = $1
ORDER BY created_at DESC
LIMIT 100;
-- Uses: idx_executions_workflow_id, idx_executions_created_at

-- Get execution logs for debugging
SELECT el.*, n.label
FROM execution_logs el
JOIN workflow_nodes n ON el.node_id = n.id
WHERE el.execution_id = $1
ORDER BY el.created_at ASC;
-- Uses: idx_execution_logs_execution_id

-- Find failed executions
SELECT * FROM executions
WHERE status = 'FAILED' AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
-- Uses: idx_executions_status, idx_executions_created_at

-- Audit user actions
SELECT * FROM audit_logs
WHERE user_id = $1 AND action = 'EXECUTE'
ORDER BY created_at DESC
LIMIT 100;
-- Uses: idx_audit_logs_user_id, idx_audit_logs_action
```

---
