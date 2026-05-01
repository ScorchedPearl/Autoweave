# UML Use Case Diagrams - AutoWeave

## 1. System Overview Use Case Diagram

```
                                    ┌─────────────────────────┐
                                    │    AUTOWEAVE SYSTEM     │
                                    │   Workflow Automation   │
                                    │      Platform           │
                                    └─────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
            ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
            │ End User     ��         │ Admin User   │         │ External API │
            └──────────────┘         └──────────────┘         └──────────────┘
                    │                         │                         │
                    │                         │                         │
        ┌───────────┼───────────┐    ┌────────┼────────┐    ┌──────────┼──────────┐
        │           │           │    │        │        │    │          │          │
        ▼           ▼           ▼    ▼        ▼        ▼    ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ ┌────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │ Create  │ │ Execute │ │ Monitor │ │Manage  │ │View│ │Send  │ │Receive│ │Receive│
    │Workflow │ │Workflow │ │Execution│ │System  │ │Logs│ │Data  │ │Data  │ │Events│
    └─────────┘ └─────────┘ └─────────┘ └────────┘ └────┘ └──────┘ └──────┘ └──────┘
        │           │           │        │        │    │          │          │
        │           │           │        │        │    │          │          │
        └───────────┼───────────┘        │        │    │          │          │
                    │                    │        │    │          │          │
                    └────────────────────┴────────┴────┴──────────┴──────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │   Workflow Engine     │
                            │   & Services          │
                            └───────────────────────┘
```

---

## 2. Complete Use Cases for End User

```
                                 ┌──────────────────────────────┐
                                 │      AUTOWEAVE SYSTEM        │
                                 │   (Workflow Automation)      │
                                 └──────────────────────────────┘
                                           │
                                           │
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
        │                  ╔══════════════════════╗                           │
        │                  ║    END USER ACTOR    ║                           │
        │                  ╚══════════════════════╝                           │
        │                            │                                        │
        │                            │                                        │
        ▼                            │                                        ▼
    ┌──────────────────┐             │                           ┌──────────────────┐
    │  AUTHENTICATION  │             │                           │  WORKFLOW MGMT   │
    │    SUB SYSTEM    │             │                           │  SUB SYSTEM      │
    ├──────────────────┤             │                           ├──────────────────┤
    │ • Register User  │◄────────────┼───────────────────────────│ • Create Workflow│
    │ • Login          │             │                           │ • Edit Workflow  │
    │ • OTP Verify     │             │                           │ • Save Workflow  │
    │ • Logout         │             │                           │ • Publish        │
    │ • Reset Password │             │                           │ • Version        │
    │ • 2FA Setup      │             │                           │ • Delete         │
    └──────────────────┘             │                           │ • Duplicate      │
                                     │                           │ • Export         │
                                     │                           └──────────────────┘
                                     │
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
    │ WORKFLOW EDITOR  │     │ INTEGRATION MGMT │     │  EXECUTION MGMT  │
    │  SUB SYSTEM      │     │   SUB SYSTEM     │     │  SUB SYSTEM      │
    ├──────────────────┤     ├──────────────────┤     ├──────────────────┤
    │ • Drag & Drop    │     │ • Connect Google │     │ • Execute        │
    │   Nodes          │     │   Calendar       │     │ • Monitor        │
    │ • Configure Node │     │ • Connect Gmail  │     │ • View Status    │
    │ • Create Edges   │     │ • Connect Slack  │     │ • View Logs      │
    │ • Delete Node    │     │ • Authorize      │     │ • Pause/Resume   │
    │ • Preview Flow   │     │ • Disconnect     │     │ • Retry          │
    │ • Test Node      │     │ • Manage Tokens  │     │ • Cancel         │
    │ • View Canvas    │     │ • Revoke Access  │     │ • Download Logs  │
    │ • Zoom/Pan       │     └──────────────────┘     │ • Set Alerts     │
    │ • Undo/Redo      │                              │ • Schedule       │
    └──────────────────┘                              └──────────────────┘
```

---

## 3. Authentication & Access Control Use Cases

```
                        ╔═══════════════════╗
                        ║   END USER        ║
                        ╚═══════════════════╝
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Register   │  │    Login     │  │ Forgot Pass  │
        │   New User   │  │ Credentials  │  │              │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                  │
               │                 ▼                  │
               │         ┌─────────────────┐       │
               │         │  Email Verify?  │       │
               │         │  YES / NO       │       │
               │         └────────┬────────┘       │
               │                  │                │
               │    ┌─────────────┴────────────┐   │
               │    │                          │   │
               │    ▼                          ▼   │
               │ ┌────────────┐         ┌──────────────┐
               │ │   Setup    │         │  OTP Sent    │
               │ │   2FA      │         │  to Email    │
               │ │            │         │              │
               │ │ QR Code +  │         │  User enters │
               │ │ Backup     │         │  6-digit OTP │
               │ │ Codes      │         └──────┬───────┘
               │ └─────┬──────┘                │
               │       │                      │
               └───────┼──────────────────────���
                       │
                       ▼
                ┌─────────────────┐
                │  Dashboard      │
                │  Authenticated  │
                │  Session Ready  │
                └─────────────────┘
```

---

## 4. Workflow Creation Use Cases (Detailed)

```
                    ╔═══════════════════════╗
                    ║   END USER            ║
                    ║   (Authenticated)     ║
                    ╚═══════════════════════╝
                              │
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Create  │    │  Create  │    │  Create  │
        │  Blank   │    │  From    │    │  From    │
        │ Workflow │    │Template  │    │  Library │
        └────┬─────┘    └────┬─────┘    └────┬───���─┘
             │               │               │
             └───────────────┼───────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │   Named Workflow   │
                    │   Created          │
                    │   (DRAFT status)   │
                    └────────┬───────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        ┌───────────┐  ┌───────────┐  ┌───────────┐
        │Add Trigger│  │Add Action │  │Add Logic  │
        │Nodes      │  │Nodes      │  │Nodes      │
        └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
              │              │              │
              │ ┌────────────┼────────────┐ │
              │ │            │            │ │
              │ ▼            ▼            ▼ │
              │ ┌────────────────────────────┐ │
              │ │  Configure Each Node       │ │
              │ │  - Set parameters          │ │
              │ │  - Map inputs/outputs      │ │
              │ │  - Add error handlers      │ │
              │ └────────────┬───────────────┘ │
              │              │                 │
              └──────────────┼─────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  Connect Nodes     │
                    │  (Create Edges)    │
                    └────────┬───────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  Test Workflow     │
                    │  (Run with sample) │
                    └────────┬───────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
              ┌──────────┐    ┌──────────────┐
              │  Passed? │    │  Edit/Debug  │
              │ YES / NO │    │  Errors      │
              └────┬─────┘    └──────┬───────┘
                   │                 │
                   │                 └─────────┐
                   │                           │
                   ▼                           │
            ┌─────────────┐                    │
            │   Publish   │                    │
            │  Workflow   │                    │
            │ (Go Live)   │                    │
            └─────────────┘                    │
                   ▲                           │
                   └───────────────────────────┘
```

---

## 5. Node Types & Configuration Use Cases

```
                        ┌──────────────────────┐
                        │  SELECT NODE TYPE    │
                        └──────────┬───────────┘
                                   │
                ┌──────────┬────────┼────────┬──────────┐
                │          │        │        │          │
                ▼          ▼        ▼        ▼          ▼
            ┌────────┐ ┌────────┐ ┌────┐ ┌──────┐ ┌──────────┐
            │TRIGGER │ │ ACTION │ │LLM │ │LOGIC │ │INTEGRATION
            │ NODES  │ │ NODES  │ │NODE│ │NODES │ │  NODES
            └───┬────┘ └───┬────┘ └─┬──┘ └──┬───┘ └────┬─────┘
                │          │        │       │          │
                ▼          ▼        ▼       ▼          ▼
            ┌────────┐ ┌────────┐ ┌────┐ ┌──────┐ ┌──────────┐
            │Schedule│ │Execute │ │Chat│ │If/   │ │Google
            │Timer   │ │Script  │ │GPT │ │Else  │ │Calendar
            │        │ │        │ │    │ │      │ │
            │Webhook │ │HTTP    │ │Code│ │Loop  │ │Gmail
            │        │ │Request │ │Gen │ │      │ │
            │Manual  │ │        │ │    │ │Switch│ │Slack
            │Trigger │ │Email   │ │    │ │      │ │
            │        │ │Send    │ │    │ │For   │ │Trello
            │        │ │        │ │    │ │Each  │ │
            │        │ │Process │ │    │ │      │ │Custom
            │        │ │File    │ │    │ │Delay │ │API
            │        │ │        │ │    │ │      │ │Webhook
            │        │ │Database│ │    │ │      │ │
            │        │ │Query   │ │    │ │      │ │
            └────┬───┘ └────┬───┘ └──┬─┘ └──┬───┘ └────┬─────┘
                 │          │        │      │          │
                 └──────────┼────────┼──────┼──────────┘
                            │        │      │
                            ▼        ▼      ▼
                      ┌──────────────────────┐
                      │ Configure Node       │
                      │ Parameters/Settings  │
                      └──────────────────────┘
```

---

## 6. Integration Management Use Cases

```
                    ╔════════════════════════╗
                    ║   END USER             ║
                    ║  (In Settings Page)    ║
                    ╚════════════════════════╝
                              │
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ��──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ View Active  │ │  Connect New │ │ Disconnect  │
        │ Integrations │ │  Service     │ │ Service     │
        └──────────────┘ └──────┬───────┘ └──────┬───────┘
                                │               │
                                ▼               │
                        ┌──────────────────┐    │
                        │ Select Service   │    │
                        │ Type             │    │
                        ├──────────────────┤    │
                        │• Google Calendar │    │
                        │• Gmail           │    │
                        │• Slack           │    │
                        │• Trello          │    │
                        │• Jira            │    │
                        │• Custom API      │    │
                        │• Webhook         │    │
                        └────────┬─────────┘    │
                                 │              │
                                 ▼              │
                        ┌──────────────────┐    │
                        │ OAuth Dialog /   │    │
                        │ API Key Input    │    │
                        │                  │    │
                        │ Redirect to:     │    │
                        │ Service Login    │    │
                        └────────┬─────────┘    │
                                 │              │
                                 ▼              │
                        ┌──────────────────┐    │
                        │ Grant Scopes     │    │
                        │ Authorize Access │    │
                        │ Confirm Consent  │    │
                        └────────┬─────────┘    │
                                 │              │
                                 ▼              │
                        ┌──────────────────┐    │
                        │ Redirect Back    │    │
                        │ Token Encrypted  │    │
                        │ Stored Securely  │    │
                        └────────┬─────────┘    │
                                 │              │
                                 ▼              │
                        ┌──────────────────┐    │
                        │ Integration      │    │
                        │ Active & Ready   │    │
                        │ Can Use in       │    │
                        │ Workflows        │    │
                        └──────────────────┘    │
                                                │
                                                ▼
                                        ┌──────────────────┐
                                        │ Confirm          │
                                        │ Disconnect?      │
                                        │ YES / NO         │
                                        └────────┬─────────┘
                                                 │
                                        (YES)    ▼
                                        ┌──────────────────┐
                                        │ Token Revoked    │
                                        │ Integration      │
                                        │ Disabled         │
                                        └──────────────────┘
```

---

## 7. Workflow Execution Use Cases

```
                    ╔════════════════════════╗
                    ║   END USER             ║
                    ║  (Workflow Published)  ║
                    ╚════════════════════════╝
                              │
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
              ▼               ▼                   ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │Manual Trigger│ │Scheduled Exec│ │Webhook Trigger
        │(Run Now)     │ │(Cron/Timer)  │ │(External)
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │               │
               └────────────────┼───────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │ Provide Inputs   │
                        │ (if required)    │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ START EXECUTION  │
                        │ Status: PENDING  │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Status: RUNNING  │
                        │ Execute Nodes    │
                        │ in Sequence      │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Node 1  │  │  Node N  │  │ Logs     │
            │ Execute  │  │ Execute  │  │ Recorded │
            │ Log Out  │  │ Log Out  │  │ Real-time│
            └────┬─────┘  └────┬─────┘  └──────────┘
                 │             │
                 └─────┬───────┘
                       │
                       ▼
            ┌────────────────────┐
            │ All Nodes Done?    │
            │ YES / NO           │
            └──────┬─────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        │ (Error?)            │
        ▼                     ▼
    ┌──────────┐        ┌──────────────┐
    │ FAILED   │        │ COMPLETED    │
    │ Results  │        │ Results      │
    │ Errors   │        │ Output       │
    │ Stored   │        │ Stored       │
    └────┬─────┘        └──────┬───────┘
         │                     │
         │     ┌───────────────┘
         │     │
         ▼     ▼
    ┌──────────────────────┐
    │ User Views Results   │
    │ Downloads Logs       │
    │ Reviews Execution    │
    │ Retry if Failed      │
    └──────────────────────┘
```

---

## 8. Monitoring & Debugging Use Cases

```
                    ╔═════════════════════════╗
                    ║   END USER              ║
                    ║  (Workflow Owner)       ║
                    ╚═════════════════════════╝
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ View Workflow│ │Set Execution │ │View Real-time│
        │ Execution    │ │Alerts        │ │Dashboard     │
        │ History      │ │              │ │              │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │               │
               │                ▼               │
               │        ┌──────────────────┐    │
               ��        │ Alert Types:     │    │
               │        │ • Failures       │    │
               │        │ • Slow           │    │
               │        │ • Success        │    │
               │        │ • Duration       │    │
               │        │ • Email/Slack    │    │
               │        └──────────────────┘    │
               │                                │
               ▼                                ▼
        ┌────────────────────────────────────────┐
        │ Select Execution Record                │
        │ View Full Details                      │
        └─────────────────┬──────────────────────┘
                          │
                          ▼
                ┌──────────────────────────────┐
                │ Execution Details Page       │
                │                              │
                │ • Status: FAILED             │
                │ • Duration: 4m 23s           │
                │ • Triggered by: User/Auto    │
                │ • Start/End time             │
                │ • Overall Results            │
                └──────────────┬───────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ View Node    │ │ Download     │ │ Retry Exec   │
        │ Logs         │ │ Logs (JSON)  │ │              │
        │              │ │              │ │ From Failed  │
        │ Timeline of  │ │ Export as    │ │ Node         │
        │ each node    │ │ CSV          │ │              │
        │              │ │              │ │ Or Full      │
        │ Input/Output │ │ Print        │ │              │
        │              │ │              │ │              │
        │ Duration     │ │ Share Link   │ │ With same    │
        │              │ │              │ │ inputs       │
        │ Error Details│ │              │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 9. Admin Use Cases

```
                    ╔════════════════════════╗
                    ║   ADMIN USER           ║
                    ║  (System Admin)        ║
                    ╚════════════════════════╝
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │ View System  │   │ Manage Users │  │ Monitor      │
    │ Analytics    │   │              │  │ Performance  │
    └──────┬───────┘   └──────┬───────┘  └──────┬───────┘
           │                  │                 │
           ▼                  ▼                 ▼
    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
    │ • Total Users│   │ • Create User│  │ • CPU Usage  │
    │ • Workflows  │   │ • Disable    │  │ • Memory     │
    │ • Executions │   │ • Reset Pass │  │ • DB Queries │
    │ • Uptime     │   │ • View Audit │  │ • API Calls  │
    │ • Errors     │   │ • Assign     │  │ • Workflow   │
    │ • Revenue    │   │   Roles      │  │   Queue      │
    │ • Growth %   │   │ • Delete Acct│  │ • Error Rate │
    └──────────────┘   └──────────────┘  └──────────────┘

          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ View System Logs     │
                    │ & Audit Trail        │
                    │                      │
                    │ Filter by:           │
                    │ • Date range         │
                    │ • User               │
                    │ • Action             │
                    │ • Resource           │
                    │ • Status             │
                    │                      │
                    │ Export/Download      │
                    │ Compliance Reports   │
                    └──────────────────────┘
```

---

## 10. Extended Use Cases (Advanced Scenarios)

### 10.1 Workflow Versioning

```
            ┌────────────────────────┐
            │ Published Workflow     │
            │ (Version 1.0)          │
            └───────────┬────────────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
          ▼             ▼              ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │ Create   │ │ Continue │ │ Rollback to  │
    │ New Draft│ │ Editing  │ │ Previous     │
    │          │ │ Version  │ │ Version      │
    └────┬─────┘ └────┬─────┘ └──────┬───────┘
         │            │             │
         ▼            ▼             ▼
    ┌──────────────────────────────────┐
    │ Version Comparison               │
    │ • Changes diff                   │
    │ • Node additions/deletions       │
    │ • Config modifications           │
    │ • Execution history per version  │
    └──────────────────────────────────┘
```

### 10.2 Workflow Templates & Sharing

```
            ┌────────────────────────┐
            │ Save as Template       │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Template Library       │
            ├────────────────────────┤
            │ • Personal Templates   │
            │ • Shared Templates     │
            │ • Public Templates     │
            │ • Organization         │
            │   Templates            │
            └────────────────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
          ▼                            ▼
    ┌──────────────┐         ┌──────────────┐
    │ Use Template │         │ Share        │
    │ Start New    │         │ Template     │
    │ Workflow     │         │              │
    │              │         │ • Team       │
    │ Pre-filled   │         │ • Public URL │
    │ Nodes/Config │         │ • Invite     │
    └──────────────┘         │   Users      │
                             │              │
                             │ • Permission │
                             │   Control    │
                             │ • View Only/ │
                             │   Edit       │
                             └─────────────��┘
```

### 10.3 Error Handling & Retry

```
            ┌────────────────────────┐
            │ Node Execution Error   │
            │ (e.g., API timeout)    │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Check Error Handler    │
            │ Configuration          │
            └───────────┬────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
          ▼                            ▼
    ┌──────────────┐         ┌──────────────┐
    │ Retry Logic  │         │ Fallback     │
    │              │         │ Action       │
    │ • Max retries│         │              │
    │ • Backoff    │         │ • Skip Node  │
    │   strategy   │         │ • Use Default│
    │ • Exponential│         │ • Send Alert │
    │   delay      │         │ • Continue   │
    │              │         │   with default
    │ Wait & Retry │         │   value      │
    │ From Point   │         │              │
    │ of Failure   │         │ Skip branch/ │
    │              │         │ End workflow │
    └──────┬───────┘         └──────┬───────┘
           │                        │
           └────────────┬───────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Continue Workflow      │
            │ Log Error & Action     │
            │ Notify User            │
            └────────────────────────┘
```

### 10.4 Conditional Branching

```
            ┌────────────────────────┐
            │ Workflow Execution     │
            │ Reaches Condition Node │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Evaluate Condition     │
            │                        │
            │ if (status == "active")│
            │   AND (count > 10)     │
            │   then...              │
            └───────────┬────────────┘
                        │
          ┌─────────────┴──────────────┐
          │                            │
    TRUE  ▼                            ▼  FALSE
    ┌──────────────┐         ┌──────────────┐
    │ Execute True │         │ Execute False│
    │ Branch Path  │         │ Branch Path  │
    │              │         │              │
    │ Continue to  │         │ Continue to  │
    │ True Nodes   │         │ False Nodes  │
    │ (Path A)     │         │ (Path B)     │
    └──────┬───────┘         └──────┬───────┘
           │                        │
           └────────────┬───────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Converge Paths         │
            │ (Join to same node)    │
            │                        │
            │ Continue Execution     │
            └────────────────────────┘
```

### 10.5 Parallel Execution

```
            ┌────────────────────────┐
            │ Workflow Execution     │
            │ Reaches Parallel Node  │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Split Execution        │
            │ Create N parallel      │
            │ execution threads      │
            └───┬──────────┬──────┬───┘
                │          │      │
        ┌───────▼┐ ┌──────▼┐ ┌───▼────┐
        │Thread 1│ │Thread2 │ │Thread 3│
        │        │ │        │ │        │
        │Node A  │ │Node B  │ │Node C  │
        │Execute │ │Execute │ │Execute │
        │ (2.5s) │ │ (1.8s) │ │ (3.1s) │
        └───┬────┘ └────┬───┘ └───┬────┘
            │           │         │
            └───────────┬─────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Wait for All Threads   │
            │ Synchronization Point  │
            │ (Longest: 3.1s)        │
            │                        │
            │ Collect Results:       │
            │ [resultA, resultB,     │
            │  resultC]              │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Continue to Next Node  │
            │ with combined results  │
            └────────────────────────┘
```

### 10.6 Loop/Iterator

```
            ┌────────────────────────┐
            │ Workflow Execution     │
            │ Reaches Loop Node      │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Loop Configuration     │
            │                        │
            │ For each item in:      │
            │ inputList (5 items)    │
            │                        │
            │ Variable: item         │
            │ Index: i               │
            └───────────┬────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼───┐       ┌───▼───┐     ┌───▼───┐
    │i = 0  │       │i = 1  │  .. │i = 4  │
    │item1  │       │item2  │     │item5  │
    │       │       │       │     │       │
    │Execute│       │Execute│     │Execute│
    │Nodes  │       │Nodes  │     │Nodes  │
    │in Loop│       │in Loop│     │in Loop│
    └───┬───┘       └───┬───┘     └───┬───┘
        │               │             │
        └───────────────┼─────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Collect Loop Results   │
            │ [result0, result1, ..  │
            │  result4]              │
            │                        │
            │ Continue Next Node     │
            └────────────────────────┘
```

---

## 11. Actor Summary

### Primary Actors

| Actor | Role | Capabilities |
|-------|------|--------------|
| **End User** | Workflow creator & operator | Create, edit, execute, monitor workflows |
| **Admin User** | System administrator | Manage users, view analytics, system logs |
| **External System** | API/Webhook caller | Trigger workflows, send/receive data |

### Secondary Actors

| Actor | Role | Interaction |
|-------|------|-------------|
| **Email Service** | OTP delivery | Send verification codes |
| **Google Calendar** | Calendar provider | Read/write calendar events |
| **Gmail** | Email provider | Send/read emails |
| **Slack** | Messaging platform | Send notifications |
| **LangChain/LLM** | AI service | Process natural language |
| **Kafka** | Message queue | Queue workflow jobs |
| **Redis** | Cache/Session store | Session management, caching |
| **PostgreSQL** | Database | Data persistence |

---

## 12. Use Case Relationships

### Inclusion Relationships (<<include>>)

```
Create Workflow ──includes──> Add Nodes
                 ──includes──> Configure Node
                 ──includes──> Connect Edges

Execute Workflow ──includes──> Validate Inputs
                  ──includes──> Run Nodes
                  ──includes──> Log Results

Manage Integration ──includes──> Authorize Service
                    ──includes──> Store Token Securely
```

### Extension Relationships (<<extend>>)

```
Execute Workflow ──extends──> Retry Failed Node
                 ──extends──> Handle Error
                 ──extends──> Send Alert

Login ──extends──> OTP Verification
       ──extends──> 2FA Challenge
       ──extends──> Reset Password
```

### Specialization Relationships

```
Execute Workflow
         │
         ├─ Manual Execution
         ├─ Scheduled Execution
         └─ Webhook-Triggered Execution

Add Node
     │
     ├─ Add Trigger Node
     ├─ Add Action Node
     ├─ Add Logic Node
     ├─ Add LLM Node
     └─ Add Integration Node
```

---

## 13. Pre-conditions & Post-conditions

### Create Workflow Use Case

**Pre-conditions:**
- User is authenticated and logged in
- User has workflow creation permission
- System is available and responsive

**Post-conditions:**
- Workflow record is created in database
- Workflow status is set to DRAFT
- User is navigated to editor page
- Initial version is created

---

### Execute Workflow Use Case

**Pre-conditions:**
- User is authenticated
- Workflow exists and is in PUBLISHED status
- All required integrations are authorized
- Workflow has at least one trigger node

**Post-conditions:**
- Execution record is created
- Nodes execute sequentially/in parallel as defined
- Execution logs are stored
- User receives completion notification
- Results are displayed in dashboard

---

### Connect Integration Use Case

**Pre-conditions:**
- User is authenticated
- Service is available
- Service OAuth/API is reachable
- User has service account

**Post-conditions:**
- Token is encrypted and stored
- Integration record is created
- Integration status is ACTIVE
- User can now use in workflows
- Refresh token is stored for token renewal

---

## 14. Non-Functional Requirements in Use Cases

### Performance
- Workflow execution < 5 seconds per node (average)
- UI response time < 500ms
- Dashboard load < 2 seconds

### Security
- All passwords hashed with bcrypt
- All integrations encrypted with AES-256
- All API calls use HTTPS/TLS
- OTP verification mandatory for sensitive actions

### Availability
- System uptime 99.9%
- Graceful degradation on service failures
- Automatic retry for transient failures

### Scalability
- Support 10,000+ concurrent users
- Handle 1M+ executions per day
- Support workflows with 100+ nodes
- Database auto-scaling

---

## 15. Use Case Traceability Matrix

| Use Case | Actor | Trigger | Primary Flow | Alternative | Error Handling |
|----------|-------|---------|--------------|-------------|-----------------|
| Create Workflow | End User | New button click | Add nodes & save | Save as draft | Validation error |
| Execute Workflow | End User/System | Manual/scheduled | Run nodes sequentially | Parallel nodes | Retry logic |
| Connect Integration | End User | Settings click | OAuth flow | API key input | Token refresh |
| Monitor Execution | End User | Dashboard view | Real-time updates | View history | Polling fallback |
| Manage Users | Admin | Admin panel | User CRUD ops | Bulk upload | Permission check |

---

## Summary of All Use Cases

**Total Primary Use Cases: 18**

1. Register User
2. Login
3. OTP Verification
4. Create Workflow
5. Edit Workflow
6. Publish Workflow
7. Version Workflow
8. Add Workflow Nodes
9. Configure Node
10. Connect Nodes (Edges)
11. Execute Workflow
12. Monitor Execution
13. View Execution Logs
14. Retry Execution
15. Connect Integration
16. Disconnect Integration
17. Set Execution Alerts
18. View Analytics (Admin)

**Total Extended Use Cases: 10+**
- Error Handling
- Conditional Branching
- Parallel Execution
- Loop/Iterator
- Workflow Versioning
- Template Management
- Role-Based Access Control
- Audit Logging
- Performance Optimization
- Disaster Recovery

---
