# UML Activity Diagrams - AutoWeave

## Overview
Activity diagrams model the workflow and dynamic aspects of AutoWeave system. They show sequential and parallel activities, decision points, and control flows across various business processes and system operations.

---

## 1. User Authentication Activities

### 1.1 User Registration Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ User Registration Process                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Open Registration     │
                    │        Form             │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │  Enter Email & Password │
                    │  + Confirm Password     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Input       │
                    │  (Format, Length, etc) │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Check Email      │  │ Show Error       │
            │ Uniqueness       │  │ Message          │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗            │
               ║ Unique?   ║            │
               ╚═════╤═════╝            │
            YES┌──────┴──────┐NO        │
              ▼             ▼           │
    ┌──────────────────┐ ┌──────────────┐
    │ Hash Password    │ │ Show: Email  │
    │ (bcrypt)         │ │ Already Used │
    └────────┬─────────┘ └─────┬────────┘
             │                 │
             ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Create User      │  │  Return to Form  │
    │ Record in DB     │  │  with Focus on   │
    │                  │  │  Email Field     │
    └────────┬─────────┘  └──────────────────┘
             │                   ▲
             ▼                   │
    ┌──────────────────┐         │
    │ Generate OTP     │         │
    │ (6-digit code)   │         │
    └────────┬─────────┘         │
             │                   │
             ▼                   │
    ┌──────────────────┐         │
    │ Store OTP in DB  │         │
    │ (TTL: 10 min)    │         │
    └────────┬─────────┘         │
             │                   │
             ▼                   │
    ┌──────────────────┐         │
    │ Send OTP Email   │         │
    └────────┬─────────┘         │
             │                   │
       ╔═════╩═════╗             │
       ║ Email OK? ║             │
       ╚═════╤═════╝             │
            YES│ NO──────────────┘
              ▼
    ┌──────────────────┐
    │ Return to User   │
    │ Success Screen   │
    │ (Verification    │
    │  Pending)        │
    └────────┬─────────┘
             │
             ▼
           END

```

### 1.2 Email Verification & OTP Validation Activity Diagram

```
┌──────────────────────────────────────────────────────��──────────────────────┐
│ Email Verification & OTP Validation Process                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Receives OTP     │
                    │   Email                 │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Open Verification     │
                    │   Link or Enter OTP     │
                    │   Manually              │
                    └──────────┬──────────────┘
                               │
                      ╔════════╩════════╗
                      ║ Verification    ║
                      ║ Method?         ║
                      ╚════════╤════════╝
                           │       │
                    ┌──────┘       └──────┐
                    │                     │
                Link│                     │Manual
                    │                     │
                    ▼                     ▼
        ┌───────────��──────┐   ┌──────────────────┐
        │ Click Email Link │   │ Enter OTP Code   │
        │ (Extract Token)  │   │ in Input Field   │
        └────────┬─────────┘   └────────┬─────────┘
                 │                      │
                 │    ┌─────────────────┘
                 │    │
                 ▼    ▼
        ┌──────────────────┐
        │ Retrieve OTP     │
        │ from Database    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Check if OTP     │
        │ is Expired       │
        │ (TTL Check)      │
        └────────┬─────────┘
                 │
           ╔═════╩═════╗
           ║ Expired?  ║
           ╚═════╤═════╝
            YES  │  NO
              ▼  ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Show: OTP        │  │ Compare OTP      │
    │ Expired          │  │ with Provided    │
    │ Request New      │  │ Code             │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                ╔════╩════╗
    ┌──────────────────┐     ║ Match?  ║
    │ Delete Old OTP   │     ╚════╤════╝
    │ Generate New     │      YES  │ NO
    │ Re-send Email    │        ▼  ▼
    └─────┬────────────┘  ┌──────────────────┐
          │               │ Show: Invalid    │
          │               │ OTP Error        │
          │               │ (Retry or        │
          │               │  Request New)    │
          │               └────────┬─────────┘
          │                        │
          │                        ▼
          │               ┌──────────────────┐
          │               │ Allow User to    │
          │               │ Request New OTP  │
          │               │ or Manual Entry  │
          │               └────────┬─────────┘
          │                        │
          │                        ▼
          │               ┌──────────────────┐
          │               │ Increment Failed │
          │               │ Attempts Counter │
          │               └────────┬─────────┘
          │                        │
          │                ╔═══════╩═══════╗
          │                ║ Attempts > 5? ║
          │                ╚═══════╤═══════╝
          │                      YES│ NO
          │                        ▼│
          │                ┌──────────────────┐
          │                │ Lock Account     │
          │                │ for 15 minutes   │
          │                │ Send Alert Email │
          │                └────────┬─────────┘
          │                         │
          │    ┌────────────────────┘
          │    │
          └────┼───────┐
               │       │
               ▼       ▼
    ┌──────────────────┐
    │ Mark User as     │
    │ Email Verified   │
    │ in Database      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Delete OTP       │
    │ Record           │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Send Welcome     │
    │ Email            │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Redirect to      │
    │ Dashboard or     │
    │ Login Page       │
    └────────┬─────────┘
             │
             ▼
           END

```

### 1.3 User Login with 2FA Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ User Login with 2FA/OTP Process                                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Open Login Form       │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │  Enter Email & Password │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │  Validate Input Format  │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Query User DB    │  │ Show: Invalid    │
            │ by Email         │  │ Email Format     │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗            │
               ║ User      ║            │
               ║ Found?    ║            │
               ╚═════╤═════╝            │
            YES│     │NO            ┌───┘
              ▼     ▼               │
    ┌──────────────────┐ ┌──────────────┐
    │ Verify Password  │ │ Show: User   │
    │ (bcrypt compare) │ │ Not Found or │
    └────────┬─────────┘ │ Invalid      │
             │           │ Credentials  │
             │           └─────┬────────┘
             │                 │
       ╔═════╩═════╗            │
       ║ Password  ║            │
       ║ Correct?  ║            │
       ╚═════╤═════╝            │
            YES│ NO             │
              ▼ ▼───────────────┘
    ┌──────────────────┐
    │ Check Account    │
    │ Status           │
    │ (Active/Locked)  │
    └────────┬─────────┘
             │
       ╔═════╩═════╗
       ║ Account   ║
       ║ Active?   ║
       ╚═════╤═════╝
            YES│ NO
              ▼ ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Check if 2FA     │  │ Show: Account    │
    │ is Enabled       │  │ Locked/Inactive  │
    └────────┬─────────┘  └─────┬────────────┘
             │                  │
       ╔═════╩═════╗        ┌───┘
       ║ 2FA       ║        │
       ║ Enabled?  ║        │
       ╚═════╤═════╝        │
            YES│ NO        │
              ▼  ▼         │
    ┌──────────────────┐  ┌──────────────────┐
    │ Generate OTP     │  │ Create Session   │
    │ (6-digit code)   │  │ Token            │
    └────────┬─────────┘  │ Store in DB      │
             │            │ Return to        │
             ▼            │ Dashboard        │
    ┌──────────────────┐  └─────┬────────────┘
    │ Send OTP via     │        │
    │ Email/SMS        │        ▼
    └────────┬─────────┘    ┌──────────────────┐
             │              │ Redirect to      │
             ▼              │ Dashboard        │
    ┌──────────────────┐    └─────┬────────────┘
    │ Redirect to 2FA  │          │
    │ Verification     │          ▼
    │ Page             │        END
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ User Enters OTP  │
    │ Code             │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Verify OTP Code  │
    │ (check DB)       │
    │ Check Expiry     │
    └────────┬─────────┘
             │
       ╔═════╩═════╗
       ║ Valid &   ║
       ║ Not       ║
       ║ Expired?  ║
       ╚═════╤═════╝
            YES│ NO
              ▼ ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Mark 2FA as      │  │ Show: Invalid    │
    │ Verified         │  │ or Expired OTP   │
    │ Delete OTP       │  │ Request New      │
    └────────┬─────────┘  └─────┬────────────┘
             │                  │
             ▼                  ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Create Session   │  │ Allow Retry      │
    │ Token            │  │ or Resend OTP    │
    │ Store in DB      │  └────────┬─────────┘
    │ Store in Cookie  │           │
    │ (HttpOnly, Secure)│          │
    └────────┬─────────┘           │
             │                     │
             ▼                     ▼
    ┌──────────────────┐ ┌──────────────────┐
    │ Log Success      │ │ Increment Failed │
    │ Login Event      │ │ Attempts         │
    └────────┬─────────┘ └────────┬─────────┘
             │                    │
             ▼              ╔═════╩═════╗
    ┌──────────────────┐   ║ Attempts>5║
    │ Send Confirmation│   ╚═════╤═════╝
    │ Email with       │        YES│ NO
    │ Location & Time  │          ▼│
    └────────┬─────────┘   ┌──────────────────┐
             │             │ Lock Account     │
             │             │ Send Alert Email │
             │             └────────┬─────────┘
             │                      │
             ▼                      ▼
    ┌──────────────────┐ ┌──────────────────┐
    │ Redirect to      │ │ Show: Account    │
    │ Dashboard        │ │ Locked          │
    │                  │ │ Contact Support  │
    └────────┬─────────┘ └────────┬─────────┘
             │                    │
             └──────────┬─────────┘
                        │
                        ▼
                      END

```

---

## 2. Workflow Creation & Management Activities

### 2.1 Create Workflow Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Create New Workflow Process                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Open Create Workflow  │
                    │   Dialog/Form           │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │  Enter Workflow Name    │
                    │  + Description          │
                    │  + Tags                 │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │  Validate Input         │
                    │  (Name not empty,       │
                    │   Max length, etc)      │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Check Name       │  │ Show Error       │
            │ Uniqueness       │  │ Message          │
            │ (for user)       │  │ (Fix & Retry)    │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗            │
               ║ Unique?   ║            │
               ╚═════╤═════╝            │
            YES│     │NO           ┌────┘
              ▼     ▼              │
    ┌──────────────────┐ ┌──────────────┐
    │ Generate UUID    │ │ Show: Name   │
    │ for Workflow     │ │ Already Used │
    └────────┬─────────┘ └─────┬────────┘
             │                 │
             ▼                 ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Create Workflow  │  │ Allow User to    │
    │ Record in DB     │  │ Choose New Name  │
    │ (status: DRAFT)  │  │ or Cancel        │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Create Version 1 │  │ Back to Input    │
    │ (initial version)│  │ Form             │
    └────────┬─────────┘  └──────────────────┘
             │                    ▲
             ▼                    │
    ┌──────────────────┐          │
    │ Initialize Nodes │          │
    │ Array (empty)    │          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
    ┌──────────────────┐          │
    │ Set Default      │          │
    │ Configuration    │          │
    │ (timeout, etc)   │          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
    ┌──────────────────┐          │
    │ Create Audit     │          │
    │ Log Entry        │          │
    │ (user created wf)│          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
    ┌──────────────────┐          │
    │ Cache Workflow   │          │
    │ in Redis         │          │
    │ (TTL: 1 hour)    │          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
    ┌──────────────────┐          │
    │ Return Workflow  │          │
    │ ID & Open        │          │
    │ Editor Canvas    │          │
    └────────┬─────────┘          │
             │                    │
             ▼                    │
           END                    │
            (Resolve loop)────────┘

```

### 2.2 Add Node to Workflow Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Add Node to Workflow Activity Diagram                                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Selects Node     │
                    │   Type from Palette     │
                    │   (HTTP, DB, LLM, etc)  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Drag Node onto Canvas │
                    │   at Position (x, y)    │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Node Dropped          │
                    │   (Canvas Position Set) │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Node Type    │
                    │   Availability for WF   │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Generate Node    │  │ Show Error:      │
            │ UUID             │  │ Node Type Not    │
            │                  │  │ Available        │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
                     ▼                  ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Load Node        │  │ Rollback to      │
            │ Configuration    │  │ Previous State   │
            │ Template         │  └────────┬─────────┘
            └────────┬─────────┘           │
                     │                    ▼
                     ▼                  END
            ┌──────────────────┐
            │ Create Node      │
            │ Record in DB     │
            │ (with metadata)  │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Link Node to     │
            │ Workflow         │
            │ (set parent_id)  │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Set Default      │
            │ Input/Output     │
            │ Ports            │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Render Node on   │
            │ Canvas UI        │
            │ (with label,     │
            │  ports, color)   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Enable Edit Mode │
            │ (double-click    │
            │  to configure)   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Create Audit     │
            │ Log Entry        │
            │ (node added)     │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Update Version   │
            │ Timestamp        │
            │ (mark as modified)
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Return Node      │
            │ Details to UI    │
            │ (for display)    │
            └────────┬─────────┘
                     │
                     ▼
                   END

```

### 2.3 Configure Node Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Configure Node Settings & Parameters                                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Double-Click Node     │
                    │   to Open Config        │
                    │   Dialog                │
                    └──────────┬─────────��────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Load Current Node     │
                    │   Configuration        │
                    │   from Database        │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Render Config Form    │
                    │   Based on Node Type    │
                    │   (dynamic fields)      │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Display Current       │
                    │   Values in Form        │
                    │   (if exists)           │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Modifies         │
                    │   Configuration        │
                    │   Parameters            │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Node     ║
                         ║  Type?    ║
                         ╚═════╤═════╝
                    ┌─────┬────┬──┬───────────┐
                    │     │    │  │           │
                   HTTP  DB  LLM COND       Other
                    │     │    │  │           │
                    ▼     ▼    ▼  ▼           ▼
        ┌─────────────────────────────────────────┐
        │ HTTP Node:                              │
        │ - URL (required)                        │
        │ - Method (GET/POST/PUT/DELETE)          │
        │ - Headers (key-value)                   │
        │ - Body (JSON/Form)                      │
        │ - Auth Type (None/Bearer/Basic)         │
        │ - Timeout (seconds)                     │
        │ - Retry Count                           │
        │ - Success Condition                     │
        └────────┬─────────────────────────────────┘
                 │                         │
        DB Node  │                         │  LLM Node
        ┌────────▼──────┐          ┌───────▼────────────┐
        │ - Database    │          │ - Model Name       │
        │   Connection  │          │ - Prompt Template  │
        │ - SQL Query   │          │ - Temperature      │
        │ - Timeout     │          │ - Max Tokens       │
        │ - Pagination  │          │ - Top P/K          │
        │ - Cache TTL   │          │ - System Prompt    │
        │ - Params      │          │ - Streaming        │
        │   (binding)   │          │ - API Key (masked) │
        └────────┬──────┘          └──────┬─────────────┘
                 │                        │
        Conditional Node                  │
        ┌────────▼───────────────────────────┬──────────────┐
        │ - Condition Expression             │              │
        │ - Operators (>, <, ==, AND, OR)    │              │
        │ - Variables Reference              │              │
        │ - True Path (next node)             │              │
        │ - False Path (else node)            │              │
        │ - Default Path (catchall)           │              │
        └────────┬─────────────────────────────┘             │
                 │                                           │
                 ▼                                           ▼
        ┌─────────────────────────┐          ┌──────────────────────┐
        │ Validate Configuration  │          │ Other Node Types:    │
        │ Based on Type           │          │ - Delay              │
        │ - Required Fields       │          │ - Transform/Map      │
        │ - Format Validation     │          │ - Split              │
        │ - Range Checks          │          │ - Merge              │
        └────────┬────────────────┘          └──────┬───────────────┘
                 │                                  │
           ╔═════╩═════╗                           │
           ║  Valid?   ║                           │
           ╚═════╤═════╝                           │
                YES│ NO                            │
                  ▼ ▼                              │
        ┌──────────────────┐    ┌─────────────────┐
        ��� Show Validation  │    │ Show Errors     │
        │ Errors with      │    │ (Red highlight) │
        │ Hints for Fix    │    │ Allow Fix &     │
        └────────┬─────────┘    │ Revalidate      │
                 │              └────────┬────────┘
                 │                       │
                 ▼                       ▼
        ┌──────────────────┐    ┌──────────────────┐
        │ Save Config to   │    │ Return to Form   │
        │ Database         │    │ (focus on error) │
        │ (update record)  │    └────────┬─────────┘
        └────────┬─────────┘             │
                 │                       ▼
                 ▼                     END
        ┌──────────────────┐          (Error
        │ Create Audit Log │           Handling)
        │ (config change)  │
        └────────┬─────────┘
                 │
                 ▼
        ┌───────────────���──┐
        │ Update Modified  │
        │ Timestamp        │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Close Config     │
        │ Dialog           │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Re-render Node   │
        │ on Canvas with   │
        │ Updated Label    │
        │ (show config)    │
        └────────┬─────────┘
                 │
                 ▼
               END

```

### 2.4 Connect Nodes with Edge Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Connect Two Nodes with Edge (Connection)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Drags from      │
                    │   Source Node Port     │
                    │   to Target Node Port  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Get Source Node      │
                    │   and Target Node      │
                    │   Information          │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Connection  │
                    │   - Not Self-loop      │
                    │   - Type Compatibility │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Check for        │  │ Show Error:      │
            │ Circular         │  │ Cannot Connect   │
            │ Dependencies     │  │ (Reason: type    │
            │ (DAG validation) │  │ mismatch, etc)   │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗            │
               ║ No        ║            │
               ║ Circles?  ║            │
               ╚═════╤═════╝            │
                YES  │ NO              │
                  ▼  ▼                 │
    ┌──────────────────┐   ┌──────────────┐
    │ Check if Target  │   │ Rollback     │
    │ Node can accept  │   │ Connection   │
    │ Input from       │   │ (remove edge)│
    │ Source Output    │   └─────┬────────┘
    └────────┬─────────┘          │
             │                    ▼
             ▼                  END
    ┌──────────────────┐      (Error)
    │ Generate Edge    │
    │ UUID             │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Create Edge      │
    │ Record in DB     │
    │ (metadata:       │
    │  from_node_id,   │
    │  to_node_id,     │
    │  from_port,      │
    │  to_port)        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Load Port Type   │
    │ Information      │
    │ (data type)      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Create Data Flow │
    │ Mapping          │
    │ (field mapping)  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Render Edge on   │
    │ Canvas           │
    │ (line, arrow,    │
    │  label)          │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Enable Edge Edit │
    │ Mode on Config   │
    │ (right-click)    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Create Audit Log │
    │ (edge created)   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Update Workflow  │
    │ Modified Time    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Trigger Workflow │
    │ Validation       │
    │ (full DAG check) │
    └────────┬─────────┘
             │
             ▼
           END

```

### 2.5 Publish Workflow Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Publish Workflow for Execution                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Clicks Publish   │
                    │   Button                │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Show Publish Dialog   │
                    │   with Options:         │
                    │   - Create Release      │
                    │   - Set Version Tag     │
                    │   - Release Notes       │
                    └───────��──┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Confirms         │
                    │   or Adds Release Notes │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Workflow     │
                    │   Structure             │
                    │   - Has Entry Node      │
                    │   - No Orphaned Nodes   │
                    │   - All Edges Valid     │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Validate All     │  │ Show Validation  │
            │ Nodes Config     │  │ Errors:          │
            │ - Required fields│  │ - Missing config │
            │ - No errors      │  │ - Invalid refs   │
            │ - Valid inputs   │  │ - Structure prob │
            └────────┬─────────┘  │ Allow Fix        │
                     │            └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗        ┌───┘
               ║  All      ║        │
               ║  Valid?   ║        │
               ╚═════╤═════╝        │
                YES  │ NO         │
                  ▼  ▼            │
    ┌──────────────────┐ ┌─────────────────┐
    │ Check for        │ │ Return to Editor│
    │ Integration      │ │ with Errors     │
    │ Credentials      │ │ Highlighted     │
    │ (if used)        │ └────────┬────────┘
    └────────┬─────────┘          │
             │                    ▼
             ▼                  END
    ┌──────────────────┐      (Error)
    │ Verify All       │
    │ Integration      │
    │ Tokens are Valid │
    │ (not expired)    │
    └────────┬─────────┘
             │
       ╔═════╩═════╗
       ║ All Valid?║
       ╚═════╤═════╝
            YES│ NO
              ▼ ▼
    ┌──────────────────┐ ┌──────────────────┐
    │ Increment        │ │ Show Error:      │
    │ Version Number   │ │ Missing/Expired  │
    │                  │ │ Credentials      │
    └────────┬─────────┘ │ Re-auth Required │
             │           └────────┬─────────┘
             ▼                    │
    ┌──────────────────┐          ▼
    │ Create New       │        END
    │ Version Record   │       (Error)
    │ (increment v)    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Snapshot Current │
    │ Workflow State   │
    │ (nodes, edges,   │
    │  config)         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Update Workflow  │
    │ Status to        │
    │ PUBLISHED        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Generate Release │
    │ Version Tag      │
    │ (v1.0.0, etc)    │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Create Audit Log │
    │ (workflow        │
    │  published)      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Publish Event to │
    │ Message Queue    │
    │ (workflow.       │
    │  published)      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Cache Published  │
    │ Version          │
    │ in Redis         │
    │ (for quick load) │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Send Success     │
    │ Notification to  │
    │ User             │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Redirect to      │
    │ Execution View   │
    │ (ready to run)   │
    └────────┬─────────┘
             │
             ▼
           END

```

---

## 3. Workflow Execution Activities

### 3.1 Trigger Workflow Execution Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Trigger and Execute Workflow                                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                         ╔══════╩══════╗
                         ║ Trigger     ║
                         ║ Source?     ║
                         ╚══════╤══════╝
                    ┌──────┬────┬─────┐
                    │      │    │     │
                 Manual Schedule Webhook Other
                    │      │    │     │
                    ▼      ▼    ▼     ▼

        ┌──────────────────────────────────┐
        │ Manual: User Clicks              │
        │ Execute Button                   │
        └──────────┬──────��────────────────┘
                   │
        ┌──────────────────────────────────┐
        │ Scheduled: Cron Job              │
        │ Triggers at Set Time             │
        └──────────┬───────────────────────┘
                   │
        ┌──────────────────────────────────┐
        │ Webhook: External POST to        │
        │ /webhook endpoint                │
        └──────────┬───────────────────────┘
                   │
        ┌──────────────────────────────────┐
        │ Other: Event-based trigger       │
        │ (message, condition met)         │
        └──────────┬───────────────────────┘
                   │
                   └──────────┬──────────────┘
                              │
                              ▼
                    ┌─────────────────────────┐
                    │ Retrieve Workflow ID    │
                    │ and Latest Published    │
                    │ Version                 │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Get Execution           │
                    │ Parameters              │
                    │ (input variables)       │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Create Execution       │
                    │ Record in Database     │
                    │ (status: QUEUED)       │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Generate Execution     │
                    │ UUID                   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Initialize Execution   │
                    │ Context                │
                    │ (variables, state)     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Queue Execution Job    │
                    │ to Message Queue       │
                    │ (Kafka/RabbitMQ)       │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Create Audit Log       │
                    │ (execution started)    │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Publish Event          │
                    │ (execution.queued)     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │ Return Execution ID    │
                    │ to Client              │
                    │ (for polling/tracking) │
                    └──────────┬──────────────┘
                               │
                               ▼
                              END

```

### 3.2 Execute Nodes in Workflow Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Execute Nodes in Sequence/Parallel                                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Retrieve Queued       │
                    │   Execution Job        │
                    │   from Queue            │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Update Execution     │
                    │   Status to RUNNING    │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Get Workflow Graph   │
                    │   (nodes & edges)      │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Topological Sort     │
                    │   Nodes (execution     │
                    │   order based on DAG)  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Initialize Execution │
                    │   Context & Results    │
                    │   Storage              │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   FOR EACH Node in     │
                    │   Execution Order      │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║ More      ║
                         ║ Nodes?    ║
                         ╚═════╤═════╝
                            YES│ NO
                              ▼ │
                ┌─────────────────────────┐
                │ Get Node Configuration  │
                │ and Inputs              │
                │                         │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Load Input Data from    │
                │ Previous Nodes (edges)  │
                │ or Workflow Variables   │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Start Node Execution    │
                │ (log start event)       │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Validate Node Inputs    │
                │ (required, format)      │
                └──────────┬──────────────┘
                           │
                     ╔═════╩═════╗
                     ║ Valid?    ║
                     ╚═════╤═════╝
                          YES│ NO
                            ▼ ▼
                ┌─────────────────────────┐  ┌──────────────────┐
                │ Execute Node Action:    │  │ Mark Node as     │
                │                         │  │ FAILED           │
                │ Call corresponding      │  │ Store Error      │
                │ service/handler         │  │ Message          │
                │ (HTTP, DB, LLM, etc)    │  └─────┬────────────┘
                │                         │        │
                └──────────┬────���─────────┘        ▼
                           │            ┌──────────────────┐
                           ▼            │ Apply Error      │
                ┌─────────────────────────┐│ Recovery        │
                │ Handle Execution        ││ Strategy        │
                │ - Success               ││ (RETRY/FALLBACK)│
                │ - Partial Success       ││                 │
                │ - Error/Exception       ││ GO TO: Error    │
                │ - Timeout               ││ Handling        │
                │ - Cancelled             ││ Branch          │
                └──────────┬──────────────┘└────────┬────────┘
                           │                       │
                           ▼                       │
                ┌─────────────────────────┐        │
                │ Capture Node Output     │        │
                │ (result data)           │        │
                │                         │        │
                └──────────┬──────────────┘        │
                           │                       │
                           ▼                       │
                ┌─────────────────────────┐        │
                │ Store Node Result       │        │
                │ in Execution Context    │        │
                │ (for next node input)   │        │
                │                         │        │
                └──────────┬──────────────┘        │
                           │                       │
                           ▼                       │
                ┌─────────────────────────┐        │
                │ Log Node Completion     │        │
                │ (metrics, duration,     │        │
                │  status)                │        │
                │                         │        │
                └──────────┬──────────────┘        │
                           │                       │
                           ▼                       │
                ┌─────────────────────────┐        │
                │ Publish Node Complete   │        │
                │ Event (to subscribers)  │        │
                │ (for real-time UI)      │        │
                │                         │        │
                └──────────┬──────────────┘        │
                           │                       │
                           ├───────────────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Next Node in List       │
                │ (loop back to FOR EACH) │
                └──────────┬──────────────┘
                           │
                    ╔══════╩══════╗
                    ║ All Nodes   ║
                    ║ Complete?   ║
                    ╚══════╤══════╝
                         NO│ YES
                          ▼ ▼
                ┌─────────────────────────┐
                │ Evaluate Final Results  │
                │ - Success (all nodes OK)│
                │ - Partial Success       │
                │ - Failed (any node fail)│
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Update Execution Status │
                │ (COMPLETED/FAILED/etc)  │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Store Final Outputs     │
                │ (complete result set)   │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Create Audit Log        │
                │ (execution completed)   │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Publish Execution       │
                │ Complete Event          │
                │ (final status)          │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Clean Up Resources      │
                │ (close connections,     │
                │  release memory)        │
                └──────────┬──────────────┘
                           │
                           ▼
                         END

```

### 3.3 Error Recovery & Retry Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Error Handling & Automatic Retry Strategy                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Node Execution       │
                    │   Error Caught         │
                    │   (exception caught)   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Log Error            │
                    │   (type, message,      │
                    │    stack trace)        │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Get Error Recovery   │
                    │   Configuration        │
                    │   from Node Config     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Categorize Error     │
                    │   Type                 │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║ Error     ║
                         ║ Category? ║
                         ╚═════╤═════╝
                    ┌────┬────┬────┬──────┐
                    │    │    │    │      │
                 Network DB Timeout Auth Other
                    │    │    │    │      │
                    ▼    ▼    ▼    ▼      ▼
        ┌──────────────────────────────────────┐
        │ Network Error:                       │
        │ - Retry with exponential backoff     │
        │ - Retry count: config or default (3) │
        └───────────┬──────────────────────────┘
                    │
        ┌──────────────────────────────────────┐
        │ Database Error:                      │
        │ - Check if transient or permanent    │
        │ - Retry if transient                 │
        │ - Fallback if permanent              │
        └───────────┬──────────────────────────┘
                    │
        ┌──────────────────────────────────────┐
        │ Timeout Error:                       │
        │ - Increase timeout or skip           │
        │ - No retry (already timeout)         │
        │ - Check node config                  │
        └───────────┬──────────────────────────┘
                    │
        ┌──────────────────────────────────���───┐
        │ Auth Error:                          │
        │ - Check credentials/tokens           │
        │ - Refresh token if needed            │
        │ - No retry (auth issue)              │
        └───────────┬──────────────────────────┘
                    │
        ┌──────────────────────────────────────┐
        │ Other Errors:                        │
        │ - Depends on error handler config    │
        │ - Check node error_strategy          │
        └───────────┬──────────────────────────┘
                    │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Determine Strategy   │
                    │   for Recovery         │
                    │                        │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩════════╗
                         ║ Strategy?    ║
                         ╚═════╤════════╝
                    ┌────┬────┬────┐
                    │    │    │    │
                 RETRY FALLBACK SKIP ABORT
                    │    │    │    │
                    ▼    ▼    ▼    ▼

        RETRY Path:                  FALLBACK Path:
        ┌──────────────────────┐     ┌──────────────────┐
        │ Check Retry Count    │     │ Get Fallback     │
        │ Config               │     │ Node/Value       │
        └──────┬───────────────┘     │ from Config      │
               │                     └──────┬───────────┘
        ╔══════╩══════╗                     │
        ║ Retries     ║                     ▼
        ║ Remaining?  ║              ┌──────────────────┐
        ╚══════╤══════╝              │ Execute Fallback │
             YES│ NO                 │ Node/Return      │
               ▼ ▼                   │ Fallback Value   │
        ┌──────────────────┐   ┌─────────────────────┐
        │ Wait (backoff)   │   │ Store Fallback      │
        │ - Linear         │   │ Result              │
        │ - Exponential    │   └──────┬──────────────┘
        │ - Random         │          │
        └──────┬───────────┘          │
               │                      ▼
               ▼              ┌──────────────────┐
        ┌──────────────────┐  │ Mark Node Status │
        │ Retry Execution  │  │ (FALLBACK_USED)  │
        │ (re-run node)    │  └──────┬───────────┘
        └──────┬───────────┘         │
               │                     │
               ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ If Success:      │  │ Continue Workflow│
        │ Continue         │  │ with Fallback    │
        │                  │  │ Value            │
        │ If Fail Again:   │  └────────┬─────────┘
        │ Try Fallback     │           │
        │ or ABORT         │           │
        └──────┬───────────┘           │
               │                       │
               ▼                       ▼
        ┌──────────────────┐
        │ SKIP Path:       │
        │ - Skip Node      │
        │ - No retry       │
        │ - Use default    │
        │   output         │
        │                  │
        │ ABORT Path:      │
        │ - Stop Execution │
        │ - Mark Failed    │
        │ - Alert User     │
        │                  │
        └──────┬───────────┘
               │
               ▼
        ┌──────────────────┐
        │ Store Recovery   │
        │ Action Taken     │
        │ (audit log)      │
        └──────┬───────────┘
               │
               ▼
             END

```

---

## 4. Integration Activities

### 4.1 Google Calendar Integration Flow Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Google Calendar Integration & Authorization                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Clicks           │
                    │   "Connect to Google    │
                    │   Calendar"             │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Generate OAuth State  │
                    │   Token (CSRF)          │
                    │   + PKCE Code           │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Build Authorization   │
                    │   URL with:             │
                    │   - client_id           │
                    │   - redirect_uri        │
                    │   - scope (calendar)    │
                    │   - state               │
                    │   - code_challenge     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Redirect to Google    │
                    │   OAuth Consent Screen  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Authenticates   │
                    │   & Grants Permissions │
                    │   to AutoWeave         │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Google Redirects     │
                    │   Back with:            │
                    │   - Authorization Code │
                    │   - State (verify)      │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Verify State Token   │
                    │   (CSRF protection)    │
                    │   in Database          │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║ Valid?    ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Exchange Auth    │  │ Reject Request   │
            │ Code for Access  │  │ (security breach)│
            │ Token via POST   │  │ Log Event        │
            │ to Google Token  │  │ Alert Admin      │
            │ Endpoint         │  └─────┬────────────┘
            └────────┬─────────┘        │
                     │                  ▼
                     ▼                END
            ┌──────────────────┐    (Error)
            │ Receive:          │
            │ - access_token    │
            │ - refresh_token   │
            │ - expires_in      │
            │ - token_type      │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Encrypt Tokens   │
            │ (AES-256)        │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Store Tokens in  │
            │ Database:        │
            │ - access_token   │
            │ - refresh_token  │
            │ - expiry_time    │
            │ - user_id        │
            │ - integration_id │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Set Token        │
            │ Expiry Alarm     │
            │ (1 day before)   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Fetch User       │
            │ Calendar Info    │
            │ from Google API  │
            │ (GET /calendars) │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Cache User Info  │
            │ (calendars list) │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Create           │
            │ Integration      │
            │ Record in DB     │
            │ (status: ACTIVE) │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Create Audit Log │
            │ (calendar        │
            │  integrated)     │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Redirect to      │
            │ Dashboard        │
            │ (success page)   │
            └────────┬─────────┘
                     │
                     ▼
           END

```

### 4.2 Integration Token Refresh Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Automatic Token Refresh for Integrations                                    │
└─────────────────────────────────────────────────────────────────────────────┘

        ╔══════════════════════════════════════════════════╗
        ║ Background Task (Runs Every Hour)               ║
        ╚══════════════════════════════════════════════════╝
                            │
                            ▼
                ┌─────────────────────────┐
                │ Query All Active        │
                │ Integrations in DB      │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ FOR EACH Integration    │
                └──────────┬──────────────┘
                           │
                     ╔═════╩═════╗
                     ║ More      ║
                     ║ Integ?    ║
                     ╚═════╤═════╝
                         YES│ NO
                           ▼ │
                ┌─────────────────────────┐
                │ Get Token Expiry Time   │
                │ from DB                 │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Check if Token Expired  │
                │ or Will Expire Soon     │
                │ (< 1 hour)              │
                └──────────┬──────────────┘
                           │
                     ╔═════╩════════╗
                     ║ Needs        ║
                     ║ Refresh?     ║
                     ╚═════╤════════╝
                          │ NO
                        YES│ ▼
                           ▼ End loop
                ┌─────────────────────────┐
                │ Get Refresh Token       │
                │ from DB (decrypt)       │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Prepare Refresh Request │
                │ - refresh_token         │
                │ - client_id             │
                │ - client_secret         │
                │ - grant_type            │
                │   (refresh_token)       │
                └──────────┬──────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ POST to OAuth Provider  │
                │ Token Endpoint          │
                │ (Google/etc)            │
                └──────────┬──────────────┘
                           │
                     ╔═════╩═════╗
                     ║ Success?  ║
                     ╚═════╤═════╝
                          YES│ NO
                            ▼ ▼
                ┌─────────────────────────┐  ┌──────────────────┐
                │ Receive New Access      │  │ Log Refresh      │
                │ Token & Expiry          │  │ Failure          │
                │                         │  │ - Check Error    │
                │                         │  │ - Notify User    │
                │                         │  │ - Mark for       │
                │                         │  │   Manual Auth    │
                │                         │  └────────┬─────────┘
                │                         │           │
                └──────────┬──────────────┘           │
                           │                         │
                           ▼                         │
                ┌─────────────────────────┐          │
                │ Encrypt New Access      │          │
                │ Token                   │          │
                └──────────┬──────────────┘          │
                           │                         │
                           ▼                         │
                ┌─────────────────────────┐          │
                │ Update Token in DB:     │          │
                │ - access_token          │          │
                │ - expiry_time           │          │
                │ - last_refreshed        │          │
                └──────────┬──────────────┘          │
                           │                         │
                           ▼                         │
                ┌─────────────────────────┐          │
                │ Create Audit Log        │          │
                │ (token refreshed)       │          │
                └──────────┬──────────────┘          │
                           │                         │
                           ├─────────────────────────┘
                           │
                           ▼
                ┌─────────────────────────┐
                │ Next Integration        │
                │ in Loop                 │
                └──────────┬──────────────┘
                           │
                           ▼
        ╔═════════════════════════════════╗
        ║ All Integrations Processed      ║
        ║ Schedule Next Check             ║
        ║ (in 1 hour)                     ║
        ╚═════════════════════════════════╝
                           │
                           ▼
                         END

```

---

## 5. Monitoring & Tracking Activities

### 5.1 Real-Time Execution Monitoring Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Real-Time Execution Monitoring & WebSocket Updates                          │
└─────────────────────────────────────────────────────────────────────────────┘

Client (Browser)          WebSocket Server       Executor           Database
     │                           │                  │                   │
     │                           │                  │                   │
     ├─ Connect WS ─────────────►│                  │                   │
     │  (execution_id)           │                  │                   │
     │◄─ Connected ──────────────┤                  │                   │
     │                           │                  │                   │
     │                           ├──────────────────────────────────────►│
     │                           │ Get Execution Status & Nodes          │
     │                           │◄──────────────────────────────────────┤
     │                           │                  │                   │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: execution.started                     │                   │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.1.started                        │                   │
     │                          │                  │                   │
     │ [Monitoring...]          ├─ Node 1 Running ◄───────────────────┤
     │                          │  [Progress 25%]  │                  │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.1.progress                       │                   │
     │ (25%)                     │                  │                   │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.1.progress                       │                   │
     │ (50%)                     │                  │                   │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.1.progress                       │                   │
     │ (75%)                     │                  │                   │
     │                          │  [Progress 100%] │                  │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.1.completed                      │                   │
     │ {outputs: {...}}          │                  │                   │
     │                          ├─ Node 2 Running ◄───────────────────┤
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.2.started     │                  │                   │
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: node.2.completed   │                  │                   │
     │ {outputs: {...}}          │                  │                   │
     │                           │                  ├─ All Complete ──►│
     │◄───────────────────────────────────────────────────────────────── │
     │ Event: execution.completed│                  │                   │
     │ {outputs, status: SUCCESS}                   │                   │
     │                           │                  │                   │
     ├─ Disconnect WS ──────────►│                  │                   │
     │◄─ Closed ─────────────────┤                  │                   │
     │                           │                  │                   │

Activity Sequence:
                              START
                                │
                                ▼
                    ┌────────────────���────────┐
                    │   Client Opens          │
                    │   WebSocket Connection  │
                    │   (execution_id)        │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Server Accepts        │
                    │   Connection            │
                    │   (authenticate)        │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Store WS Connection   │
                    │   Reference             │
                    │   (for broadcasting)    │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Get Execution State   │
                    │   from Database         │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Send Initial State    │
                    │   to Client             │
                    │   (all events so far)   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Event Listener Loop   │
                    │   (on executor events)  │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║ Execution ║
                         ║ Event     ║
                         ║ Received? ║
                         ╚═════╤═════╝
                         YES   │
                          │    │
                    ┌─────┴────┴─────────────┐
                    │                        │
                    ▼                        ▼
            ┌────────────────────┐  ┌──────────────────┐
            │ Emit Event via     │  │ Execution        │
            │ WebSocket to       │  │ Complete?        │
            │ Connected Clients  │  │ (COMPLETED/      │
            │                    │  │  FAILED/etc)     │
            │                    │  └─────┬────────────┘
            └────────┬───────────┘        │ YES
                     │              ╔════╩════╗
                     │              ║ Send    ║
                     │              ║ Final   ║
                     │              ║ Event   ║
                     │              ╚════╤════╝
                     │                   │
                     ▼                   ▼
            ┌────────────────────┐  ┌──────────────────┐
            │ Continue Listening │  │ Close Broadcast  │
            │ to Next Event      │  │ Stream           │
            │                    │  │ (or wait for)    │
            │                    │  │ Disconnect       │
            │                    │  └─────┬────────────┘
            │                    │         │
            └──┬─────────────────┘         │
               │                          │
               ▼                          │
            ┌────────────────────┐        │
            │ Client Disconnect? │        │
            │ (or connection     │        │
            │  lost)             │        │
            └────────┬───────────┘        │
                     │ YES               │
                     │          ┌────────┘
                     ▼          ▼
            ┌────────────────────────┐
            │ Close WebSocket        │
            │ Connection             │
            │ Clean up resources     │
            └────────┬───────────────┘
                     │
                     ▼
                   END

```

---

## 6. User Management Activities

### 6.1 Change User Password Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ User Password Change Process                                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Navigates to     │
                    │   Change Password      │
                    │   Page                  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    ���   Display Change       │
                    │   Password Form        │
                    │   - Current Password   │
                    │   - New Password       │
                    │   - Confirm Password   │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Enters          │
                    │   Passwords            │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Input       │
                    │   - Format             │
                    │   - Length (min 12)    │
                    │   - Complexity         │
                    │ (upper, lower, digit,  │
                    │  special char)         │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Check Passwords  │  │ Show Validation  │
            │ Match            │  │ Errors           │
            │                  │  │ (Fix & Retry)    │
            └────────┬─────────┘  └─────┬────────────┘
                     │                  │
               ╔═════╩═════╗            │
               ║ Match?    ║            │
               ╚═════╤═════╝            │
                YES  │ NO              │
                  ▼  ▼                 │
    ┌──────────────────┐  ┌──────────────┐
    │ Verify Current   │  │ Show: Pass   │
    │ Password         │  │ Not Match    │
    │ (bcrypt compare) │  │ Allow Retry  │
    └────────┬─────────┘  └─────┬────────┘
             │                  │
       ╔═════╩═════╗        ┌───┘
       ║ Correct?  ║        │
       ╚═════╤═════╝        │
            YES│ NO        │
              ▼ ▼          │
    ┌──────────────────┐ ┌──────────────┐
    │ Check if New     │ │ Show: Wrong  │
    │ Password Same    │ │ Current Pass │
    │ as Current       │ │ Retry        │
    └────────┬─────────┘ └─────┬────────┘
             │                 │
       ╔═════╩═════╗            │
       ║ Different?║            │
       ╚═════╤═════╝            │
            YES│ NO            │
              ▼ ▼              │
    ┌──────────────────┐ ┌─────────────────┐
    │ Hash New         │ │ Show: New Pass  │
    │ Password         │ │ Same as Old     │
    │ (bcrypt)         │ │ Try Different   │
    └────────┬─────────┘ └────────┬────────┘
             │                    │
             ▼                    ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Update Password  │  │ Back to Form     │
    │ in Database      │  │ (focus on new    │
    │ (replace hash)   │  │  password field) │
    └────────┬─────��───┘  └─────┬────────────┘
             │                  │
             ▼                  ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Invalidate All   │  │ Loop Until       │
    │ Existing         │  │ Success          │
    │ Sessions         │  └────────┬─────────┘
    │ (force re-login) │           │
    └────────┬─────────┘           ▼
             │                  (Error
             ▼                  Handling)
    ┌──────────────────┐
    │ Create Audit Log │
    │ (password        │
    │  changed)        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Send             │
    │ Confirmation     │
    │ Email with       │
    │ timestamp &      │
    │ location         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Show Success     │
    │ Message          │
    │ Redirect to      │
    │ Dashboard/Login  │
    └────────┬─────────┘
             │
             ▼
           END

```

---

## 7. System Administration Activities

### 7.1 Generate & Manage API Keys Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Generate and Manage API Keys for Programmatic Access                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Admin/User Clicks     │
                    │   "Generate API Key"    │
                    │   Button                │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Show API Key          │
                    │   Generation Dialog     │
                    │   - Name (optional)     │
                    │   - Permissions         │
                    │   - Expiry (optional)   │
                    │   - IP Whitelist        │
                    │   - Rate Limit          │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Fills Out       │
                    │   API Key Settings     │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Input       │
                    │   - Name not empty     │
                    │   - Permissions exist  │
                    │   - Expiry valid       │
                    │   - IP format correct  │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║  Valid?   ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Generate Random  │  │ Show Errors      │
            │ API Key          │  │ (Fix & Retry)    │
            │ (128 chars)       │  └─────┬────────────┘
            │ using             │        │
            │ cryptographic     │        ▼
            │ RNG               │      END
            └────────┬─────────┘    (Error)
                     │
                     ▼
            ┌──────────────────┐
            │ Create Hash of   │
            │ API Key          │
            │ (SHA-256)        │
            │ for storage      │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Store API Key    │
            │ Hash in DB:      │
            │ - user_id        │
            │ - key_hash       │
            │ - key_name       │
            │ - permissions    │
            │ - created_at     │
            │ - expires_at     │
            │ - ip_whitelist   │
            │ - rate_limit     │
            │ - status: ACTIVE │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Create Audit Log │
            │ (API key        │
            │  generated)      │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Display API Key  │
            │ Once (modal)     │
            │ "Copy to         │
            │ Clipboard"       │
            │ Warning: Cannot  │
            │ retrieve later   │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ User Copies Key  │
            │ or Downloads     │
            │ (securely)       │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Show API Key     │
            │ Management Page  │
            │ - List all keys  │
            │ - Show created   │
            │ - Show expires   │
            │ - Actions:       │
            │   * Regenerate   │
            │   * Revoke       │
            │   * Edit Perms   │
            └────────┬─────────┘
                     │
                     ▼
                   END

            Revoke API Key Flow:
            ┌──────────────────┐
            │ Click "Revoke"   │
            │ on Existing Key  │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ Confirm Revoke   │
            │ (warning: will   │
            │  break integrat) │
            └──────┬─────────���─┘
                   │
                   ▼
            ┌──────────────────┐
            │ Update Key       │
            │ Status to        │
            │ REVOKED          │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ Invalidate Cache │
            │ (if using cache) │
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ Create Audit Log │
            │ (API key revoked)│
            └──────┬───────────┘
                   │
                   ▼
            ┌──────────────────┐
            │ Show Success     │
            │ Message          │
            │ Key now invalid  │
            └──────┬───────────┘
                   │
                   ▼
                 END

```

---

## 8. Data Export & Reporting Activities

### 8.1 Export Workflow Execution Results Activity Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Export Execution Results to CSV/JSON/Excel                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                              START
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Clicks           │
                    │   "Export Results"      │
                    │   Button                │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Show Export Format    │
                    │   Options:              │
                    │   - CSV                 │
                    │   - JSON                │
                    │   - Excel (.xlsx)       │
                    │   - PDF                 │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   User Selects Format   │
                    │   + Additional Options: │
                    │   - Include Metadata?   │
                    │   - Include Logs?       │
                    │   - Date Range Filter?  │
                    └──────────┬──────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │   Validate Export       │
                    │   Permissions           │
                    │   (user can export?)    │
                    └──────────┬──────────────┘
                               │
                         ╔═════╩═════╗
                         ║ Allowed?  ║
                         ╚═════╤═════╝
                    YES ┌──────┴──────┐ NO
                       ▼             ▼
            ┌──────────────────┐  ┌──────────────────┐
            │ Query Results    │  │ Show: Access     │
            │ from Database    │  │ Denied           │
            │ (selected range) │  │ Contact Admin    │
            │                  │  └─────┬────────────┘
            └────────┬─────────┘        │
                     │                  ▼
                     ▼                END
            ┌──────────────────┐   (Error)
            │ Check Data Size  │
            │ (< export limit?)│
            └────────┬─────────┘
                     │
               ╔═════╩═════╗
               ║ Size OK?  ║
               ╚═════╤═════╝
                    YES│ NO
                      ▼ ▼
            ┌──────────────────┐ ┌─────────────────┐
            │ Transform Data   │ │ Show: Data Too  │
            │ to Selected      │ │ Large           │
            │ Format           │ │ Filter & Try    │
            │                  │ │ Again           │
            │ Format Handler:  │ └────────┬────────┘
            │ - Parse results  │         │
            │ - Build structure└─────────┘
            │ - Apply encoding │
            │ (UTF-8)          │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Compress Output  │
            │ (if large)       │
            │ (gzip)           │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Generate         │
            │ Temporary        │
            │ Download URL     │
            │ (expires: 1h)    │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Create Audit Log │
            │ (export created) │
            │ - format         │
            │ - records_count  │
            │ - user_id        │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Send Download    │
            │ Link to User     │
            │ Email (optional) │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Show Success:    │
            │ "File Ready for  │
            │ Download"        │
            │ + Download Link  │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ User Downloads   │
            │ File             │
            │ (direct link)    │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Schedule File    │
            │ Cleanup          │
            │ (delete after 1h)│
            └────────┬─────────┘
                     │
                     ▼
                   END

```

---

## Summary

This comprehensive UML Activity Diagrams documentation includes **18 detailed activity diagrams** covering:

**Authentication** (3): Registration, Verification, Login with 2FA   
**Workflow Management** (5): Create, Add Node, Configure, Connect, Publish  
**Execution** (3): Trigger, Execute Nodes, Error Recovery   
**Integrations** (2): Google Calendar Auth, Token Refresh   
**Monitoring** (1): Real-time Execution Tracking  
**User Management** (1): Password Change  
**Administration** (1): API Key Generation & Management  
**Data Operations** (1): Export Results  

Each diagram shows **sequential and parallel activities**, **decision points**, **loops**, **error handling**, and **end states** with comprehensive detail for system implementation and understanding!
