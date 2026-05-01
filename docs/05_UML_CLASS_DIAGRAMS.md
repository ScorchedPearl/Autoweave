# UML Class Diagrams - AutoWeave

## 1. Core Domain Model Classes

### 1.1 User & Authentication Classes

```
┌────────────────────────────────┐
│          User                  │
├────────────────────────────────┤
│ - userId: UUID                 │
│ - email: String                │
│ - username: String             │
│ - passwordHash: String         │
│ - firstName: String            │
│ - lastName: String             │
│ - avatar: String (URL)         │
│ - status: UserStatus           │
│ - createdAt: DateTime          │
│ - updatedAt: DateTime          │
│ - lastLoginAt: DateTime        │
│ - isEmailVerified: Boolean     │
│ - is2FAEnabled: Boolean        │
│ - 2FASecret: String            │
│ - preferences: UserPreferences │
├────────────────────────────────┤
│ + register(): void             │
│ + login(): AuthToken           │
│ + logout(): void               │
│ + updateProfile(): void        │
│ + resetPassword(): void        │
│ + enable2FA(): String          │
│ + disable2FA(): void           │
│ + verifyOTP(): Boolean         │
│ + getWorkflows(): List         │
│ + getIntegrations(): List      │
└────────────────────────────────┘
         △
         │ inherits
         │
    ┌────┴──────────────────────┐
    │                           │
┌───┴──────────┐         ┌──────┴──────┐
│ EndUser      │         │ AdminUser   │
├──────────────┤         ├─────────────┤
│ + tier:      │         │ + role:     │
│   UserTier   │         │   AdminRole │
│ + quotas:    │         │ + canDelete │
│   Quotas     │         │   Users:    │
├──────────────┤         │   Boolean   │
│ + upgrade(): │         │ + can      │
│   void       │         │   ViewLogs: │
│ + downgrade()│         │   Boolean   │
│ + getUsage(): │         ├─────────────┤
│   Usage      │         │ + viewUsers()│
└──────────────┘         │ + manage    │
                         │   Users()   │
                         │ + viewLogs()│
                         │ + manage    │
                         │   System()  │
                         └─────────────┘

┌────────────────────────────────┐
│    UserPreferences             │
├────────────────────────────────┤
│ - theme: String                │
│ - language: String             │
│ - timezone: String             │
│ - notificationSettings:        │
│   NotificationSettings         │
│ - workspaceSettings:           │
│   WorkspaceSettings            │
├────────────────────────────────┤
│ + getTheme(): String           │
│ + setTheme(): void             │
│ + getNotifications(): Object   │
│ + updateNotifications(): void  │
└────────────────────────────────┘

┌────────────────────────────────┐
│    AuthToken                   │
├────────────────────────────────┤
│ - tokenId: UUID                │
│ - userId: UUID                 │
│ - token: String                │
│ - refreshToken: String         │
│ - expiresAt: DateTime          │
│ - createdAt: DateTime          │
│ - ipAddress: String            │
│ - userAgent: String            │
├────────────────────────────────┤
│ + isValid(): Boolean           │
│ + refresh(): AuthToken        │
│ + revoke(): void               │
│ + getUser(): User              │
└────────────────────────────────┘

┌────────────────────────────────┐
│    OTPToken                    │
├────────────────────────────────┤
│ - otpId: UUID                  │
│ - userId: UUID                 │
│ - code: String                 │
│ - expiresAt: DateTime          │
│ - attempts: Integer            │
│ - verified: Boolean            │
├────────────────────────────────┤
│ + verify(code): Boolean        │
│ + isExpired(): Boolean         │
│ + incrementAttempts(): void    │
│ + regenerate(): void           │
└────────────────────────────────┘

┌────────────────────────────────┐
│    Quotas                      │
├────────────────────────────────┤
│ - maxWorkflows: Integer        │
│ - maxNodesPerWorkflow: Integer │
│ - maxExecutionsPerMonth:       │
│   Integer                      │
│ - maxConcurrentExecutions:     │
│   Integer                      │
│ - storageGB: Double            │
│ - maxIntegrations: Integer     │
├────────────────────────────────┤
│ + isWithinLimit(): Boolean     │
│ + getUsedAmount(): Double      │
│ + getRemaining(): Double       │
│ + canExecute(): Boolean        │
└────────────────────────────────┘
```

---

## 2. Workflow Core Classes

### 2.1 Workflow & Version Classes

```
┌─────────────────────────────────────┐
│         Workflow                    │
├─────────────────────────────────────┤
│ - workflowId: UUID                  │
│ - userId: UUID                      │
│ - name: String                      │
│ - description: String               │
│ - status: WorkflowStatus            │
│ - isPublished: Boolean              │
│ - currentVersionId: UUID            │
│ - createdAt: DateTime               │
│ - updatedAt: DateTime               │
│ - publishedAt: DateTime             │
│ - tags: List<String>               │
│ - isTemplate: Boolean               │
│ - templateId: UUID                  │
│ - parentWorkflowId: UUID            │
├─────────────────────────────────────┤
│ + create(): void                    │
│ + update(): void                    │
│ + publish(): void                   │
│ + unpublish(): void                 │
│ + delete(): void                    │
│ + saveAsDraft(): void               │
│ + saveAsTemplate(): void            │
│ + execute(): WorkflowExecution      │
│ + getVersions(): List               │
│ + createNewVersion(): Version       │
│ + rollbackToVersion(): void         │
│ + duplicate(): Workflow             │
│ + export(): String (JSON)           │
│ + getNodes(): List<Node>            │
│ + getEdges(): List<Edge>            │
│ + validate(): Boolean               │
│ + getExecutionHistory(): List       │
│ + addNode(): void                   │
│ + removeNode(): void                │
│ + getNodeById(): Node               │
│ + addTag(): void                    │
│ + removeTag(): void                 │
└─────────────────────────────────────┘
         △
         │ has
         │
    ┌────┴─────────────────────┐
    │                          │
┌───┴────────────┐      ┌──────┴──────┐
│ Version        │      │ Metadata    │
├────────────────┤      ├─────────────┤
│ - versionId:   │      │ - tags:     │
│   UUID         │      │   String[]  │
│ - workflowId:  │      │ - category: │
│   UUID         │      │   String    │
│ - version:     │      │ - icon:     │
│   String       │      │   URL       │
│ - changelog:   │      │ - color:    │
│   String       │      │   String    │
│ - nodes:       │      │ - isPublic: │
│   List<Node>   │      │   Boolean   │
│ - edges:       │      │ - views:    │
│   List<Edge>   │      │   Integer   │
│ - createdAt:   │      │ - likes:    │
│   DateTime     │      │   Integer   │
│ - createdBy:   │      │ - downloads:│
│   UUID         │      │   Integer   │
├────────────────┤      ├─────────────┤
│ + rollback():  │      │ + update(): │
│   void         │      │   void      │
│ + compare():   │      │ + publish(): │
│   Diff         │      │   void      │
│ + getChanges():│      └─────────────┘
│   List         │
└────────────────┘

┌─────────────────────────────────────┐
│     WorkflowStatus (Enum)           │
├─────────────────────────────────────┤
│ DRAFT                               │
│ PUBLISHED                           │
│ ARCHIVED                            │
│ DELETED                             │
│ SCHEDULED                           │
└─────────────────────────────────────┘
```

### 2.2 Node Classes

```
┌─────────────────────────────────────┐
│         Node (Abstract)             │
├─────────────────────────────────────┤
│ - nodeId: UUID                      │
│ - workflowId: UUID                  │
│ - versionId: UUID                   │
│ - type: NodeType                    │
│ - label: String                     │
│ - description: String               │
│ - position: Position {x, y}         │
│ - isDisabled: Boolean               │
│ - config: NodeConfig                │
│ - inputs: List<Input>               │
│ - outputs: List<Output>             │
│ - errorHandler: ErrorHandler        │
│ - metadata: NodeMetadata            │
├─────────────────────────────────────┤
│ + execute(): Result                 │
│ + validate(): Boolean               │
│ + getInputs(): List<Input>          │
│ + getOutputs(): List<Output>        │
│ + setConfig(): void                 │
│ + getConfig(): NodeConfig           │
│ + clone(): Node                     │
│ + getErrorHandler(): ErrorHandler   │
│ + setErrorHandler(): void           │
│ + toJSON(): String                  │
│ + fromJSON(): Node                  │
│ + preExecute(): void                │
│ + postExecute(): void               │
│ + getMetadata(): NodeMetadata       │
└─────────────────────────────────────┘
     △
     │ extends
     │
     ├─────────────────┬────────────────┬──────────┬───────────┐
     │                 │                │          │           │
┌────┴────────┐  ┌─────┴──────┐  ┌──────┴────┐ ┌──┴──────┐ ┌──┴────────┐
│TriggerNode  │  │ActionNode  │  │LogicNode  │ │LLMNode  │ │IntegNode  │
├─────────────┤  ├────────────┤  ├───────────┤ ├─────────┤ ├───────────┤
│ - trigger:  │  │ - action:  │  │ - logic:  │ │ - model:│ │ - service:│
│   Trigger   │  │   Action   │  │   Logic   │ │ String  │ │ Integration
│ - schedule: │  │ - output:  │  │ - condition
│   Schedule  │  │   Output   │  │ - branches
│ - webhook:  │  │ - retries: │  │ - priority
│   Webhook   │  │   Integer  │  │ - timeout
├─────────────┤  ├────────────┤  ├───────────┤ ├─────────┤ ├───────────┤
│ + onTrigger:│  │ + execute()│  │ + evaluate│ │ + call()│ │ + authorize
│   void      │  │ + retry()  │  │ + getPath │ │ + parse │ │ + execute()
│ + listen()  │  │ + skip()   │  │ + branch  │ │ + stream│ │ + refresh()
│ + validate()│  │            │  │           │ │ + cancel│ │ + revoke()
└─────────────┘  └────────────┘  └───────────┘ └─────────┘ └───────────┘

┌─────────────────────────────────────┐
│       NodeType (Enum)               │
├─────────────────────────────────────┤
│ TRIGGER                             │
│ ACTION                              │
│ LOGIC                               │
│ LLM                                 │
│ INTEGRATION                         │
│ WEBHOOK                             │
│ EMAIL                               │
│ WAIT                                │
│ LOOP                                │
│ CONDITIONAL                         │
│ PARALLEL                            │
│ JOIN                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       NodeConfig                    │
├─────────────────────────────────────┤
│ - settings: Map<String, Object>    │
│ - timeout: Integer (seconds)        │
│ - retryPolicy: RetryPolicy          │
│ - errorHandling: ErrorHandling      │
│ - parallelism: Integer              │
│ - cacheResults: Boolean             │
├─────────────────────────────────────┤
│ + get(key): Object                  │
│ + set(key, value): void             │
│ + toJSON(): String                  │
│ + fromJSON(): void                  │
│ + merge(config): void               │
│ + validate(): Boolean               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       NodeMetadata                  │
├─────────────────────────────────────┤
│ - icon: String (URL)                │
│ - color: String (hex)               │
│ - documentation: String             │
│ - examples: List<String>            │
│ - category: String                  │
│ - tags: List<String>                │
│ - version: String                   │
│ - isBuiltin: Boolean                │
├─────────────────────────────────────┤
│ + getDocumentation(): String        │
│ + getExamples(): List               │
│ + getIcon(): String                 │
│ + getColor(): String                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Input / Output              │
├─────────────────────────────────────┤
│ - inputId: UUID                     │
│ - name: String                      │
│ - type: DataType                    │
│ - required: Boolean                 │
│ - defaultValue: Object              │
│ - description: String               │
│ - value: Object                     │
│ - sourceNodeId: UUID                │
│ - sourceOutputId: UUID              │
├─────────────────────────────────────┤
│ + setValue(): void                  │
│ + getValue(): Object                │
│ + validate(): Boolean               │
│ + getType(): DataType               │
│ + isConnected(): Boolean            │
│ + connect(): void                   │
│ + disconnect(): void                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       DataType (Enum)               │
├─────────────────────────────────────┤
│ STRING                              │
│ NUMBER                              │
│ BOOLEAN                             │
│ OBJECT                              │
│ ARRAY                               │
│ DATE                                │
│ FILE                                │
│ ANY                                 │
│ CUSTOM                              │
└─────────────────────────────────────┘
```

### 2.3 Edge & Connection Classes

```
┌─────────────────────────────────────┐
│          Edge                       │
├─────────────────────────────────────┤
│ - edgeId: UUID                      │
│ - workflowId: UUID                  │
│ - versionId: UUID                   │
│ - sourceNodeId: UUID                │
│ - targetNodeId: UUID                │
│ - sourceOutputId: UUID              │
│ - targetInputId: UUID               │
│ - label: String                     │
│ - condition: String (expression)    │
│ - isActive: Boolean                 │
│ - executionOrder: Integer           │
│ - dataTransform: DataTransform      │
├─────────────────────────────────────┤
│ + connect(): void                   │
│ + disconnect(): void                │
│ + validateConnection(): Boolean     │
│ + getSourceNode(): Node             │
│ + getTargetNode(): Node             │
│ + evaluate(): Boolean               │
│ + passData(): void                  │
│ + transform(): Object               │
│ + clone(): Edge                     │
│ + isValid(): Boolean                │
└─────────────────────────────────────┘
         │ uses
         │
    ┌────┴────────────────────┐
    │                         │
┌───┴──────────┐      ┌───────┴────┐
│DataTransform │      │Condition   │
├──────────────┤      ├────────────┤
│ - mapping:   │      │ - expr:    │
│   Map        │      │   String   │
│ - filters:   │      │ - type:    │
│   List       │      │   String   │
│ - formatters:│      │ - params:  │
│   List       │      │   Map      │
├──────────────┤      ├────────────┤
│ + transform()│      │ + evaluate()
│ + apply()    │      │ + getParams
│ + format()   │      │ + validate()
└──────────────┘      └────────────┘
```

---

## 3. Execution & Monitoring Classes

### 3.1 Workflow Execution Classes

```
┌──────────────────────────────────────┐
│     WorkflowExecution                │
├──────────────────────────────────────┤
│ - executionId: UUID                  │
│ - workflowId: UUID                   │
│ - versionId: UUID                    │
│ - userId: UUID                       │
│ - status: ExecutionStatus            │
│ - startedAt: DateTime                │
│ - completedAt: DateTime              │
│ - duration: Long (milliseconds)      │
│ - inputs: Map<String, Object>        │
│ - outputs: Map<String, Object>       │
│ - error: ExecutionError              │
│ - nodeExecutions:                    │
│   List<NodeExecution>                │
│ - logs: List<ExecutionLog>           │
│ - triggeredBy: String (manual/auto)  │
│ - trigger: String                    │
│ - resultSummary: ResultSummary       │
│ - metadata: ExecutionMetadata        │
├──────────────────────────────────────┤
│ + start(): void                      │
│ + pause(): void                      │
│ + resume(): void                     │
│ + cancel(): void                     │
│ + retry(): void                      │
│ + complete(): void                   │
│ + fail(): void                       │
│ + addLog(): void                     │
│ + getNodeExecutions(): List          │
│ + getOutputs(): Map                  │
│ + getErrors(): List<Error>           │
│ + getDuration(): Long                │
│ + toJSON(): String                   │
│ + export(): String (JSON/CSV)        │
│ + downloadLogs(): File               │
│ + shareLogs(url): void               │
└──────────────────────────────────────┘
         │ contains
         │
    ┌────┴──────────────────────────┐
    │                               │
┌───┴────────────┐         ┌────────┴─────┐
│NodeExecution   │         │ExecutionLog  │
├────────────────┤         ├──────────────┤
│ - nodeExecId:  │         │ - logId:     │
│   UUID         │         │   UUID       │
│ - nodeId:      │         │ - execId:    │
│   UUID         │         │   UUID       │
│ - status:      │         │ - level:     │
│   Status       │         │   LogLevel   │
│ - startTime:   │         │ - message:   │
│   DateTime     │         │   String     │
│ - endTime:     │         │ - timestamp: │
│   DateTime     │         │   DateTime   │
│ - inputs:      │         │ - nodeId:    │
│   Map          │         │   UUID       │
│ - outputs:     │         │ - context:   │
│   Map          │         │   Object     │
│ - error:       │         │ - stackTrace:│
│   Error        │         │   String     │
│ - logs:        │         ├──────────────┤
│   List<Log>    │         │ + getLevel():│
├────────────────┤         │   LogLevel   │
│ + execute():   │         │ + getMessage│
│   void         │         │ + getTime(): │
│ + success():   │         │   DateTime   │
│   void         │         │ + download():│
│ + error():     │         │   void       │
│   void         │         └──────────────┘
│ + retry():     │
│   void         │
│ + getStatus(): │
│   Status       │
│ + getDuration()│
│ + toLogs():    │
│   List         │
└────────────────┘

┌──────────────────────────────────────┐
│     ExecutionStatus (Enum)           │
├──────────────────────────────────────┤
│ PENDING                              │
│ RUNNING                              │
│ PAUSED                               │
│ COMPLETED                            │
│ FAILED                               │
│ CANCELLED                            │
│ RETRY                                │
│ TIMEOUT                              │
│ PARTIAL_FAILURE                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ExecutionError                 │
├──────────────────────────────────────┤
│ - errorId: UUID                      │
│ - nodeId: UUID                       │
│ - code: String                       │
│ - message: String                    │
│ - stackTrace: String                 │
│ - timestamp: DateTime                │
│ - context: Object                    │
│ - severity: ErrorSeverity            │
│ - isRecoverable: Boolean             │
├──────────────────────────────────────┤
│ + getMessage(): String               │
│ + getCode(): String                  │
│ + getStackTrace(): String            │
│ + getContext(): Object               │
│ + canRetry(): Boolean                │
│ + resolve(): void                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│     ResultSummary                    │
├──────────────────────────────────────┤
│ - totalNodes: Integer                │
│ - executedNodes: Integer             │
│ - successfulNodes: Integer           │
│ - failedNodes: Integer               │
│ - skippedNodes: Integer              │
│ - totalErrors: Integer               │
│ - criticalErrors: Integer            │
│ - warnings: Integer                  │
├──────────────────────────────────────┤
│ + getSuccessRate(): Double           │
│ + getFailureRate(): Double           │
│ + getCompletionPercentage(): Double  │
│ + hasCriticalErrors(): Boolean       │
│ + getSummary(): String               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│   ExecutionMetadata                  │
├──────────────────────────────────────┤
│ - ipAddress: String                  │
│ - userAgent: String                  │
│ - executedBy: String (userId)        │
│ - environment: String                │
│ - resourceUsage: ResourceUsage       │
│ - performanceMetrics:                │
│   PerformanceMetrics                 │
├──────────────────────────────────────┤
│ + getResourceUsage(): ResourceUsage  │
│ + getPerformanceMetrics():           │
│   PerformanceMetrics                 │
│ + getEnvironment(): String           │
└──────────────────────────────────────┘
```

---

## 4. Integration & Authentication Classes

### 4.1 Integration Classes

```
┌──────────────────────────────────────┐
│      Integration (Abstract)          │
├──────────────────────────────────────┤
│ - integrationId: UUID                │
│ - userId: UUID                       │
│ - name: String                       │
│ - type: IntegrationType              │
│ - status: IntegrationStatus          │
│ - isActive: Boolean                  │
│ - createdAt: DateTime                │
│ - updatedAt: DateTime                │
│ - metadata: IntegrationMetadata      │
│ - credentials: Credentials           │
│ - permissions: List<Permission>      │
│ - rateLimits: RateLimit              │
├──────────────────────────────────────┤
│ + authorize(): void                  │
│ + revoke(): void                     │
│ + refreshCredentials(): void         │
│ + testConnection(): Boolean          │
│ + getStatus(): IntegrationStatus     │
│ + call(method, params): Response     │
│ + getMetadata(): IntegrationMetadata │
│ + getPermissions(): List              │
│ + disconnect(): void                 │
│ + validateCredentials(): Boolean     │
│ + onTokenRefresh(): void             │
│ + onTokenExpire(): void              │
│ + getApiVersion(): String            │
└──────────────────────────────────────┘
     △
     │ extends
     │
     ├──────────────┬─────────────┬─────────────┬──────────┐
     │              │             │             │          │
┌────┴────────┐ ┌──┴──────────┐ ┌┴──────────┐ ┌┴────────┐ ┌┴─────────┐
│GoogleCal    │ │Gmail        │ │Slack      │ │Trello   │ │Custom    │
│Integration  │ │Integration  │ │Integration│ │Integ.   │ │Integration
├─────────────┤ ├─────────────┤ ├───────────┤ ├─────────┤ ├──────────┤
│ - calendarId│ │ - labelIds: │ │ - teamId: │ │ - boardId
│ - timezone: │ │   List      │ │   String  │ │ - userId: │ - baseUrl:│
│   String    │ │ - sendAs:   │ │ - webhook │ │   String  │   String  │
│ - defaultCal│ │   String    │ │   - url   │ ├─────────┤ ├──────────┤
├─────────────┤ ├─────────────┤ ├───────────┤ │ + create │ │ + call() │
│ + listCalens│ │ + sendEmail │ │ + send    │ │   Card()  │ + mapData │
│ + getEvents │ │ + readEmail │ │ + listen  │ │ + update  │ + validate
│ + addEvent  │ │ + createLabel
│ + updateEv  │ │ + archive   │ │ + channel │ │   Card()  │ + retry()
│ + deleteEv  │ │ + forward   │ │ + attach  │ │ + delete  │
└─────────────┘ └─────────────┘ └───────────┘ └─────────┘ └──────────┘

┌──────────────────────────────────────┐
│    IntegrationType (Enum)            │
├──────────────────────────────────────┤
│ GOOGLE_CALENDAR                      │
│ GMAIL                                │
│ SLACK                                │
│ TRELLO                               │
│ JIRA                                 │
│ GITHUB                               │
│ WEBHOOK                              │
│ REST_API                             │
│ GRAPHQL_API                          │
│ DATABASE                             │
│ CUSTOM                               │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    IntegrationStatus (Enum)          │
├──────────────────────────────────────┤
│ AUTHORIZED                           │
│ REVOKED                              │
│ EXPIRED                              │
│ PENDING                              │
│ FAILED                               │
│ DISCONNECTED                         │
│ ERROR                                │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       Credentials                    │
├──────────────────────────────────────┤
│ - credentialId: UUID                 │
│ - integrationId: UUID                │
│ - accessToken: String (encrypted)    │
│ - refreshToken: String (encrypted)   │
│ - expiresAt: DateTime                │
│ - type: CredentialType               │
│ - scopes: List<String>               │
│ - metadata: Map<String, Object>      │
├──────────────────────────────────────┤
│ + getAccessToken(): String           │
│ + getRefreshToken(): String          │
│ + isValid(): Boolean                 │
│ + isExpired(): Boolean               │
│ + refresh(): void                    │
│ + revoke(): void                     │
│ + encrypt(): void                    │
│ + decrypt(): void                    │
│ + getScopes(): List<String>          │
│ + hasScope(scope): Boolean           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    IntegrationMetadata               │
├──────────────────────────────────────┤
│ - apiVersion: String                 │
│ - baseUrl: String                    │
│ - rateLimit: RateLimit               │
│ - features: List<String>             │
│ - supportedOperations:               │
│   List<String>                       │
│ - documentation: String (URL)        │
│ - icon: String (URL)                 │
│ - color: String (hex)                │
│ - category: String                   │
├──────────────────────────────────────┤
│ + getFeatures(): List                │
│ + isOperationSupported(): Boolean    │
│ + getDocumentation(): String         │
│ + getRateLimit(): RateLimit          │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│        RateLimit                     │
├──────────────────────────────────────┤
│ - requestsPerMinute: Integer         │
│ - requestsPerHour: Integer           │
│ - requestsPerDay: Integer            │
│ - burstSize: Integer                 │
│ - retryAfter: Integer (seconds)      │
│ - remaining: Integer                 │
│ - resetAt: DateTime                  │
├──────────────────────────────────────┤
│ + isLimitExceeded(): Boolean         │
│ + getRemaining(): Integer            │
│ + shouldRetry(): Boolean             │
│ + getRetryAfter(): Long              │
│ + increment(): void                  │
│ + reset(): void                      │
└──────────────────────────────────────┘
```

---

## 5. Notification & Alert Classes

```
┌──────────────────────────────────────┐
│        Alert                         │
├──────────────────────────────────────┤
│ - alertId: UUID                      │
│ - userId: UUID                       │
│ - workflowId: UUID                   │
│ - executionId: UUID (optional)       │
│ - type: AlertType                    │
│ - condition: AlertCondition          │
│ - channels: List<AlertChannel>       │
│ - isActive: Boolean                  │
│ - createdAt: DateTime                │
│ - lastTriggered: DateTime            │
│ - triggerCount: Integer              │
│ - cooldownPeriod: Integer (seconds)  │
│ - metadata: Map                      │
├──────────────────────────────────────┤
│ + create(): void                     │
│ + update(): void                     │
│ + delete(): void                     │
│ + trigger(): void                    │
│ + evaluateCondition(): Boolean       │
│ + sendNotification(): void           │
│ + canTrigger(): Boolean              │
│ + getLastTrigger(): DateTime         │
│ + disable(): void                    │
│ + enable(): void                     │
└──────────────────────────────────────┘
         │ uses
         │
    ┌────┴──────────────────────┐
    │                           │
┌───┴──────────┐       ┌────────┴────┐
│AlertType     │       │AlertChannel │
├──────────────┤       ├─────────────┤
│ EXECUTION    │       │ EMAIL       │
│ _FAILED      │       │ SLACK       │
│ EXECUTION    │       │ WEBHOOK     │
│ _SLOW        │       │ PUSH        │
│ EXECUTION    │       │ SMS         │
│ _SUCCESS     │       │ IN_APP      │
│ LONG_RUNNING │       │ LOG         │
│ RATE_LIMIT   │       └─────────────┘
│ QUOTA_       │
│ EXCEEDED     │
│ ERROR        │
│ SYSTEM       │
│ _DOWN        │
│ USER_ACTION  │
└──────────────┘

┌──────────────────────────────────────┐
│      AlertCondition                  │
├──────────────────────────────────────┤
│ - field: String                      │
│ - operator: ConditionOperator        │
│ - value: Object                      │
│ - logicalOp: LogicalOperator         │
│ - subConditions: List                │
├──────────────────────────────────────┤
│ + evaluate(context): Boolean         │
│ + addSubCondition(): void            │
│ + removeSubCondition(): void         │
│ + toExpression(): String             │
│ + fromExpression(): void             │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      Notification                    │
├──────────────────────────────────────┤
│ - notificationId: UUID               │
│ - userId: UUID                       │
│ - alertId: UUID                      │
│ - message: String                    │
│ - channel: NotificationChannel       │
│ - status: NotificationStatus         │
│ - sentAt: DateTime                   │
│ - readAt: DateTime                   │
│ - deliveredAt: DateTime              │
│ - failureReason: String              │
│ - metadata: Map                      │
├──────────────────────────────────────┤
│ + send(): void                       │
│ + markAsRead(): void                 │
│ + markAsDelivered(): void            │
│ + retry(): void                      │
│ + getStatus(): NotificationStatus    │
│ + delete(): void                     │
└──────────────────────────────────────┘
```

---

## 6. Trigger Classes

```
┌──────────────────────────────────────┐
│        Trigger (Abstract)            │
├──────────────────────────────────────┤
│ - triggerId: UUID                    │
│ - workflowId: UUID                   │
│ - type: TriggerType                  │
│ - isActive: Boolean                  │
│ - lastTriggered: DateTime            │
│ - triggerCount: Long                 │
│ - configuration: TriggerConfig       │
├──────────────────────────────────────┤
│ + activate(): void                   │
│ + deactivate(): void                 │
│ + execute(): void                    │
│ + validate(): Boolean                │
│ + getConfiguration(): TriggerConfig  │
│ + setConfiguration(): void           │
│ + getMetadata(): TriggerMetadata     │
│ + clone(): Trigger                   │
│ + toJSON(): String                   │
└──────────────────────────────────────┘
     △
     │ extends
     │
     ├──────────────┬──────────────┬───────────┬───────────┐
     │              │              │           │           │
┌────┴─────────┐ ┌─┴────────────┐ ┌┴────────┐ ┌┴────────┐ ┌┴─────────┐
│ScheduleTrig  │ │WebhookTrig   │ │ManualTr │ │EmailTrig │ │EventTrig │
├───────────────┤ ├──────────────┤ ├─────────┤ ├─────────┤ ├──────────┤
│ - cron:       │ │ - url:       │ │ - button│ │ - from: │ │ - source:│
│   String      │ │   String     │ │   enabled
│ - timezone:   │ │ - method:    │ │         │ │   String  │   String  │
│   String      │ │   HTTP       │ │ - hotkey│ │ - subject │ - event: │
│ - nextRun:    │ │ - headers:   │ │ - icon: │ │ - body:   │   String  │
│   DateTime    │ │   Map        │ │   String│ │   String  │ - filters:│
│ - frequency:  │ │ - auth:      │ │         │ │ - filter: │   Map     │
│   String      │ │   String     │ │         │ │   String  │           │
│ - advancedCfg │ │ - ipWhitelist│ │         │ │           │           │
│               │ │ - retries:   │ │         │ │           │           │
├───────────────┤ │   Integer    │ ├─────────┤ ├─────────┤ ├──────────┤
│ + getNextRun()│ ├──────────────┤ │ + trigger
│ + getSchedule │ │ + validate() │ │   ()    │ │ + isMatch │ + listen()│
│ + parseRun()  │ │ + getUrl()   │ │         │ │ + parse() │ + on()    │
│ + getFreq()   │ │ + retry()    │ │ + icon()│ │ + format()│ + setup() │
└───────────────┘ └──────────────┘ └─────────┘ └─────────┘ └──────────┘

┌──────────────────────────────────────┐
│       TriggerType (Enum)             │
├──────────────────────────────────────┤
│ SCHEDULE                             │
│ WEBHOOK                              │
│ MANUAL                               │
│ EMAIL                                │
│ EVENT                                │
│ WATCH                                │
│ POLL                                 │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      TriggerConfig                   │
├──────────────────────────────────────┤
│ - settings: Map<String, Object>     │
│ - metadata: TriggerMetadata          │
│ - validation: ValidationRules        │
│ - advancedOptions: Map               │
├──────────────────────────────────────┤
│ + validate(): Boolean                │
│ + getSetting(): Object               │
│ + setSetting(): void                 │
│ + getMetadata(): TriggerMetadata     │
│ + toJSON(): String                   │
│ + fromJSON(): void                   │
└──────────────────────────────────────┘
```

---

## 7. Action & Response Classes

```
┌──────────────────────────────────────┐
│         Action (Abstract)            │
├──────────────────────────────────────┤
│ - actionId: UUID                     │
│ - nodeId: UUID                       │
│ - type: ActionType                   │
│ - name: String                       │
│ - description: String                │
│ - config: ActionConfig               │
│ - handler: ActionHandler             │
│ - output: ActionOutput               │
│ - timeout: Integer (seconds)         │
│ - retryPolicy: RetryPolicy           │
│ - errorHandler: ErrorHandler         │
├──────────────────────────────────────┤
│ + execute(input): Object             │
│ + validate(): Boolean                │
│ + getConfig(): ActionConfig          │
│ + setConfig(): void                  │
│ + getOutput(): ActionOutput          │
│ + retry(): Object                    │
│ + preExecute(): void                 │
│ + postExecute(): void                │
│ + rollback(): void                   │
│ + toJSON(): String                   │
└──────────────────────────────────────┘
     △
     │ extends
     │
     ├──────────────┬──────────┬──────────┬──────────┐
     │              │          │          │          │
┌────┴─────────┐ ┌─┴────────┐ ┌┴────────┐ ┌┴────────┐ ┌┴─────────┐
│HttpAction    │ │EmailAction│ │DbAction  │ │FileAction│ │EmailAct   │
├───────────────┤ ├──────────┤ ├─────────┤ ├─────────┤ ├──────────┤
│ - url:        │ │ - from:  │ │ - query:│ │ - path: │ │ - method:│
│   String      │ │   String │ │   String│ │ String  │ │ SEND/    │
│ - method:     │ │ - to:    │ │ - type: │ │ - op:   │ │ FORWARD/ │
│   HTTP        │ │   String │ │ QUERY/  │ │ READ/   │ │ ARCHIVE  │
│ - headers:    │ │ - subject│ │ UPDATE/ │ │ WRITE/  │ │ - to:    │
│   Map         │ │ - body:  │ │ DELETE  │ │ DELETE  │ │ String[] │
│ - body:       │ │   String │ │ - params│ │ - format│ │ - subject│
│   Object      │ │ - attach │ │ - conn: │ │ - encod │ │ - body:  │
│ - auth:       │ │ - filter │ │ String  │ │ - delete│ │ String   │
│   String      │ │          │ │         │ │         │ │ - attach │
├───────────────┤ ├──────────┤ ├─────────┤ ├─────────┤ ├──────────┤
│ + send()      │ │ + send() │ │ + query()
│ + handleResp()│ │ + retry()│ │ + exec()  │ │ + read()  │ + send()  │
│ + parseResp()│ │          │ │ + close()  │ │ + write()  │ + forward │
│ + mapHeaders()│ │          │ │           │ │ + delete()│ + archive │
└───────────────┘ └──────────┘ └─────────┘ └─────────┘ └──────────┘

┌──────────────────────────────────────┐
│       ActionType (Enum)              │
├──────────────────────────────────────┤
│ HTTP_REQUEST                         │
│ EMAIL_SEND                           │
│ DATABASE_QUERY                       │
│ FILE_OPERATION                       │
│ EMAIL_INTEGRATION                    │
│ SLACK_MESSAGE                        │
│ WEBHOOK                              │
│ SCRIPT_EXECUTION                     │
│ DATA_PROCESSING                      │
│ INTEGRATION_CALL                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ActionOutput                   │
├──────────────────────────────────────┤
│ - status: Integer (HTTP status)      │
│ - body: Object                       │
│ - headers: Map<String, String>       │
│ - metadata: Map                      │
│ - executionTime: Long (milliseconds) │
│ - success: Boolean                   │
│ - error: ActionError                 │
├──────────────────────────────────────┤
│ + getStatus(): Integer               │
│ + getBody(): Object                  │
│ + getHeaders(): Map                  │
│ + isSuccessful(): Boolean            │
│ + getExecutionTime(): Long           │
│ + getError(): ActionError            │
│ + toJSON(): String                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ActionError                    │
├──────────────────────────────────────┤
│ - code: String                       │
│ - message: String                    │
│ - statusCode: Integer                │
│ - details: Map                       │
│ - timestamp: DateTime                │
│ - isRecoverable: Boolean             │
├──────────────────────────────────────┤
│ + getCode(): String                  │
│ + getMessage(): String               │
│ + getStatusCode(): Integer           │
│ + canRetry(): Boolean                │
│ + getDetails(): Map                  │
│ + recover(): boolean                 │
└──────────────────────────────────────┘
```

---

## 8. Error Handling Classes

```
┌──────────────────────────────────────┐
│      ErrorHandler                    │
├──────────────────────────────────────┤
│ - handlerId: UUID                    │
│ - nodeId: UUID                       │
│ - type: ErrorHandlingType            │
│ - strategy: ErrorStrategy            │
│ - retryPolicy: RetryPolicy           │
│ - fallbackNode: UUID (optional)      │
│ - notificationChannels:              │
│   List<NotificationChannel>          │
│ - errorFilters: List<ErrorFilter>    │
│ - metadata: Map                      │
├──────────────────────────────────────┤
│ + handle(error): void                │
│ + retry(): void                      │
│ + skip(): void                       │
│ + useFallback(): void                │
│ + notify(): void                     │
│ + log(): void                        │
│ + shouldHandle(): Boolean            │
│ + canRecover(): Boolean              │
│ + getStrategy(): ErrorStrategy       │
│ + setStrategy(): void                │
└──────────────────────────────────────┘
         │ uses
         │
    ┌────┴──────────────────┐
    │                       │
┌───┴──────────┐    ┌───────┴─────┐
│RetryPolicy   │    │ErrorFilter  │
├──────────────┤    ├─────────────┤
│ - maxRetries:│    │ - errorCode:│
│   Integer    │    │   String    │
│ - backoff:   │    │ - message:  │
│   String     │    │   Regex     │
│ - delay:     │    │ - severity: │
│   Integer    │    │   Level     │
│ - maxDelay:  │    │ - match():  │
│   Integer    │    │   Boolean   │
│ - strategy:  │    └─────────────┘
│   String     │
├──────────────┤
│ + getDelay():│
│   Integer    │
│ + canRetry():│
│   Boolean    │
│ + getBackoff │
│ + reset()    │
└──────────────┘

┌──────────────────────────────────────┐
│   ErrorHandlingType (Enum)           │
├──────────────────────────────────────┤
│ RETRY                                │
│ SKIP                                 │
│ FALLBACK                             │
│ NOTIFY                               │
│ ABORT                                │
│ IGNORE                               │
│ CONTINUE                             │
│ ESCALATE                             │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       ErrorStrategy (Enum)           │
├──────────────────────────────────────┤
│ EXPONENTIAL_BACKOFF                  │
│ LINEAR_BACKOFF                       │
│ IMMEDIATE_RETRY                      │
│ SCHEDULED_RETRY                      │
│ CIRCUIT_BREAKER                      │
│ BULKHEAD                             │
│ TIMEOUT                              │
│ TIMEOUT_RETRY                        │
└──────────────────────────────────────┘
```

---

## 9. Audit & Logging Classes

```
┌──────────────────────────────────────┐
│        AuditLog                      │
├──────────────────────────────────────┤
│ - auditLogId: UUID                   │
│ - userId: UUID                       │
│ - action: AuditAction                │
│ - resourceType: String               │
│ - resourceId: UUID                   │
│ - timestamp: DateTime                │
│ - oldValue: Object                   │
│ - newValue: Object                   │
│ - ipAddress: String                  │
│ - userAgent: String                  │
│ - status: AuditStatus                │
│ - details: Map                       │
├──────────────────────────────────────┤
│ + getAction(): AuditAction           │
│ + getChanges(): Map                  │
│ + getUser(): User                    │
│ + getResource(): Object              │
│ + getTimestamp(): DateTime           │
│ + getDiff(): String                  │
│ + export(): String (JSON/CSV)        │
│ + toJSON(): String                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│       AuditAction (Enum)             │
├──────────────────────────────────────┤
│ CREATE                               │
│ UPDATE                               │
│ DELETE                               │
│ READ                                 │
│ EXECUTE                              │
│ PUBLISH                              │
│ AUTHORIZE                            │
│ REVOKE                               │
│ LOGIN                                │
│ LOGOUT                               │
│ EXPORT                               │
│ IMPORT                               │
│ SHARE                                │
│ UNSHARE                              │
│ PERMISSION_CHANGE                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│    SystemLog                         │
├──────────────────────────────────────┤
│ - logId: UUID                        │
│ - level: LogLevel                    │
│ - source: String                     │
│ - message: String                    │
│ - stackTrace: String                 │
│ - timestamp: DateTime                │
│ - context: Map                       │
│ - user: UUID (optional)              │
│ - correlationId: UUID                │
│ - environment: String                │
│ - version: String                    │
├──────────────────────────────────────┤
│ + getLevel(): LogLevel               │
│ + getMessage(): String               │
│ + getStackTrace(): String            │
│ + getContext(): Map                  │
│ + getTimestamp(): DateTime           │
│ + correlate(id): void                │
│ + toJSON(): String                   │
│ + export(): String (JSON/CSV)        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│        LogLevel (Enum)               │
├──────────────────────────────────────┤
│ DEBUG                                │
│ INFO                                 │
│ WARN                                 │
│ ERROR                                │
│ FATAL                                │
│ TRACE                                │
└──────────────────────────────────────┘
```

---

## 10. Performance & Monitoring Classes

```
┌──────────────────────────────────────┐
│    PerformanceMetrics                │
├──────────────────────────────────────┤
│ - executionId: UUID                  │
│ - totalExecutionTime: Long (ms)      │
│ - nodeExecutionTimes:                │
│   Map<UUID, Long>                    │
│ - memoryUsed: Long (bytes)           │
│ - cpuUsed: Double (percentage)       │
│ - networkBandwidth: Long (bytes)     │
│ - diskIOOperations: Long             │
│ - cacheHits: Integer                 │
│ - cacheMisses: Integer               │
│ - dbQueries: Integer                 │
│ - apiCalls: Integer                  │
│ - avgNodeTime: Long (ms)             │
│ - slowestNode: UUID                  │
│ - slowestNodeTime: Long (ms)         │
├──────────────────────────────────────┤
│ + getTotalTime(): Long               │
│ + getMemoryUsed(): Long              │
│ + getCPUUsed(): Double               │
│ + getSlowestNode(): UUID             │
│ + getCacheHitRate(): Double          │
│ + getPerformanceScore(): Double      │
│ + export(): String                   │
│ + toJSON(): String                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      ResourceUsage                   │
├──────────────────────────────────────┤
│ - memoryMB: Double                   │
│ - cpuPercent: Double                 │
│ - diskMB: Double                     │
│ - networkMB: Double                  │
│ - timestamp: DateTime                │
│ - peak: ResourceUsage (optional)     │
│ - average: ResourceUsage (optional)  │
├──────────────────────────────────────┤
│ + getMemoryMB(): Double              │
│ + getCPUPercent(): Double            │
│ + getDiskMB(): Double                │
│ + getNetworkMB(): Double             │
│ + getTotalUsage(): Double            │
│ + exceedsThreshold(): Boolean        │
│ + toJSON(): String                   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│      SystemMetrics                   │
├──────────────────────────────────────┤
│ - timestamp: DateTime                │
│ - cpuUsage: Double                   │
│ - memoryUsage: Double                │
│ - diskUsage: Double                  │
│ - networkLatency: Double (ms)        │
│ - activeConnections: Integer         │
│ - queuedJobs: Integer                │
│ - processingJobs: Integer            │
│ - completedJobs: Integer             │
│ - failedJobs: Integer                │
│ - uptime: Long (seconds)             │
├──────────────────────────────────────┤
│ + getSystemHealth(): Double          │
│ + isHealthy(): Boolean               │
│ + getLoadAverage(): Double           │
│ + getQueueSize(): Integer            │
│ + getSuccessRate(): Double           │
│ + getAvgLatency(): Double            │
│ + export(): String                   │
│ + toJSON(): String                   │
└──────────────────────────────────────┘
```

---

## 11. Class Relationships Summary

### Inheritance Relationships
```
Node
├── TriggerNode
├── ActionNode
├── LogicNode
├── LLMNode
└── IntegrationNode

Trigger
├── ScheduleTrigger
├── WebhookTrigger
├── ManualTrigger
├── EmailTrigger
└── EventTrigger

Integration
├── GoogleCalendarIntegration
├── GmailIntegration
├── SlackIntegration
├── TrelloIntegration
└── CustomIntegration

Action
├── HttpAction
├── EmailAction
├── DatabaseAction
├── FileAction
└── EmailIntegrationAction

User
├── EndUser
└── AdminUser

ErrorHandler (composition)
├── RetryPolicy
└── ErrorFilter

Alert
└── (uses AlertCondition)
```

### Composition Relationships
```
Workflow
├── contains Version (one or many)
├── contains Node (one or many)
├── contains Edge (one or many)
├── contains WorkflowMetadata (one)
├── contains Metadata (one)
└── created by User (one)

WorkflowExecution
├── contains NodeExecution (one or many)
├── contains ExecutionLog (one or many)
├── contains ExecutionError (optional)
├── contains ResultSummary (one)
└── contains ExecutionMetadata (one)

Node
├── contains Input (one or many)
├── contains Output (one or many)
├── contains NodeConfig (one)
├── contains NodeMetadata (one)
├── contains ErrorHandler (one)
└── has Action (one)

Integration
├── contains Credentials (one or many)
├── contains IntegrationMetadata (one)
├── contains RateLimit (one)
└── has permissions List<Permission>

User
├── contains UserPreferences (one)
├── contains Quotas (one)
├── created many Workflow
├── created many Integration
└── created many Alert
```

### Association Relationships
```
Edge
└── connects Node to Node

WorkflowExecution
└── executes Workflow

NodeExecution
├── executes Node
└── produces ExecutionLog

Alert
└── monitors Workflow

Integration
└── used by Node (IntegrationNode)

Trigger
└── belongs to Workflow

ErrorHandler
└── handles Node errors
```

---

## 12. Complete Class Dependency Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  User ◄──────────┐                                             │
│                  │                                             │
│  ▼               │                                             │
│  AuthToken       UserPreferences                              │
│  OTPToken        Quotas                                        │
│                                                                 │
│  ▼                                                             │
│  Workflow ◄─────────────────────────────────────┐            │
│  │                                              │            │
│  ├─► Version                                    │            │
│  ├─► Node ◄──────────────────────┐             │            │
│  │   ├─► TriggerNode             │             │            │
│  │   ├─► ActionNode              │             │            │
│  │   ├─► LogicNode               │             │            │
│  │   ├─► LLMNode                 │             │            │
│  │   └─► IntegrationNode         │             │            │
│  │   ├─► Input/Output            │             │            │
│  │   ├─► NodeConfig              │             │            │
│  │   ├─► ErrorHandler            │             │            │
│  │   └─► NodeMetadata            │             │            │
│  ├─► Edge                        │             │            │
│  ├─► Metadata                    │             │            │
│  └─► WorkflowExecution ─────────┬┘─────────┐  │            │
│      │                          │          │  │            │
│      ├─► NodeExecution ◄────────┘          │  │            │
│      ├─► ExecutionLog                      │  │            │
│      ├─► ExecutionError                    │  │            │
│      ├─► ResultSummary                     │  │            │
│      └─► ExecutionMetadata                 │  │            │
│                                             │  │            │
│  ▼                                          │  │            │
│  Integration ◄───────────────┐             │  │            │
│  ├─► Credentials            │             │  │            │
│  ├─► IntegrationMetadata    │             │  │            │
│  ├─► RateLimit              │             │  │            │
│  └─ (GoogleCal, Gmail, etc.)│             │  │            │
│                               │             │  │            │
│  ▼                            │             │  │            │
│  Alert                        │             │  │            │
│  ├─► AlertCondition          │             │  │            │
│  ├─► AlertChannel            │             │  │            │
│  └─► Notification            │             │  │            │
│                               │             │  │            │
│  ▼                            │             │  │            │
│  Trigger ◄──────────────────┬┴────┐        │  │            │
│  ├─► ScheduleTrigger         │    │        │  │            │
│  ├─► WebhookTrigger          │    │        │  │            │
│  ├─► ManualTrigger           │    │        │  │            │
│  ├─► EmailTrigger            │    │        │  │            │
│  └─► EventTrigger            │    │        │  │            │
│                              │    │        │  │            │
│  ▼                           │    │        │  │            │
│  AuditLog                    │    │        │  │            │
│  SystemLog                   │    │        │  │            │
│                              │    │        │  │            │
│  ▼                           │    │        │  │            │
│  ErrorHandler                │    │        │  │            │
│  ├─► RetryPolicy             │    │        │  │            │
│  └─► ErrorFilter             │    │        │  │            │
│                              │    │        │  │            │
└──────────────────────────────┴────┴────────┴──┴────────────┘
```

---

## 13. Entity Relationships Cross-Reference

| Parent | Child | Cardinality | Relationship Type |
|--------|-------|-------------|-------------------|
| User | Workflow | 1:Many | Composition |
| User | Integration | 1:Many | Composition |
| User | Alert | 1:Many | Composition |
| User | AuditLog | 1:Many | Association |
| Workflow | Version | 1:Many | Composition |
| Workflow | Node | 1:Many | Composition |
| Workflow | Edge | 1:Many | Composition |
| Workflow | WorkflowExecution | 1:Many | Composition |
| Version | Node | 1:Many | Composition |
| Version | Edge | 1:Many | Composition |
| Node | Input | 1:Many | Composition |
| Node | Output | 1:Many | Composition |
| Node | NodeConfig | 1:1 | Composition |
| Node | ErrorHandler | 0:1 | Composition |
| Edge | Node | 2:1 | Association (connects) |
| WorkflowExecution | NodeExecution | 1:Many | Composition |
| WorkflowExecution | ExecutionLog | 1:Many | Composition |
| NodeExecution | Node | Many:1 | Association |
| Integration | Credentials | 1:Many | Composition |
| Integration | RateLimit | 1:1 | Composition |
| Alert | AlertCondition | 1:Many | Composition |
| Alert | Notification | 1:Many | Composition |
| Trigger | Workflow | Many:1 | Association |
| ErrorHandler | RetryPolicy | 1:1 | Composition |

---

## 14. Data Types & Enums Summary

```
Basic Data Types:
├── UUID: Unique identifier
├── String: Text data
├── Integer: Whole numbers
├── Double/Float: Decimal numbers
├── Boolean: True/False
├── DateTime: Date and time
├── Object: Generic object
├── Map<K,V>: Key-value pairs
├── List<T>: Ordered collection
└── File: File data

Enum Types:
├── UserStatus: ACTIVE, INACTIVE, SUSPENDED, DELETED
├── WorkflowStatus: DRAFT, PUBLISHED, ARCHIVED, DELETED, SCHEDULED
├── NodeType: (see above)
├── DataType: (see above)
├── ExecutionStatus: PENDING, RUNNING, PAUSED, COMPLETED, FAILED, etc.
├── ErrorSeverity: LOW, MEDIUM, HIGH, CRITICAL
├── LogLevel: DEBUG, INFO, WARN, ERROR, FATAL, TRACE
├── NotificationStatus: PENDING, SENT, DELIVERED, FAILED, READ
├── AlertType: EXECUTION_FAILED, EXECUTION_SLOW, etc.
├── IntegrationType: GOOGLE_CALENDAR, GMAIL, SLACK, etc.
├── IntegrationStatus: AUTHORIZED, REVOKED, EXPIRED, etc.
├── CredentialType: OAUTH, API_KEY, BASIC_AUTH, etc.
├── TriggerType: SCHEDULE, WEBHOOK, MANUAL, EMAIL, EVENT
├── ActionType: HTTP_REQUEST, EMAIL_SEND, DATABASE_QUERY, etc.
├── AuditAction: CREATE, UPDATE, DELETE, READ, EXECUTE, etc.
└── ErrorHandlingType: RETRY, SKIP, FALLBACK, NOTIFY, ABORT, etc.
```

---

## 15. Class Summary Statistics

**Total Classes: 68**

| Category | Count | Classes |
|----------|-------|---------|
| User & Auth | 6 | User, EndUser, AdminUser, AuthToken, OTPToken, UserPreferences |
| Workflow Core | 6 | Workflow, Version, Node variants (5), Metadata |
| Node Components | 8 | Input, Output, NodeConfig, NodeMetadata, Edge, DataTransform, Condition |
| Execution | 6 | WorkflowExecution, NodeExecution, ExecutionLog, ExecutionError, ResultSummary, ExecutionMetadata |
| Integration | 10 | Integration, 5 variants, Credentials, IntegrationMetadata, RateLimit |
| Notification | 4 | Alert, AlertCondition, AlertChannel, Notification |
| Trigger | 6 | Trigger, 5 variants, TriggerConfig |
| Action | 8 | Action, 5 variants, ActionConfig, ActionOutput, ActionError |
| Error Handling | 5 | ErrorHandler, RetryPolicy, ErrorFilter, ErrorHandlingType, ErrorStrategy |
| Audit & Logging | 3 | AuditLog, SystemLog, AuditAction |
| Performance | 3 | PerformanceMetrics, ResourceUsage, SystemMetrics |
| **Total** | **68** | |

---

## 16. Design Patterns Used

### Patterns Applied

1. **Inheritance Hierarchy** - Node, Trigger, Action, Integration base classes with concrete implementations
2. **Composition** - Complex objects built from simpler components (Workflow contains Node, Edge, Version)
3. **Strategy Pattern** - ErrorStrategy, RetryPolicy, ErrorHandlingType
4. **Factory Pattern** - Node creation, Integration creation
5. **Observer Pattern** - Alert/Notification system
6. **State Pattern** - Workflow/Execution status enums
7. **Builder Pattern** - Complex object construction (NodeConfig, AlertCondition)
8. **Repository Pattern** - User, Workflow, Integration persistence
9. **Decorator Pattern** - Node decorators (error handlers, validators)
10. **Adapter Pattern** - Integration adapters for different services

---
