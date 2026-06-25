# AutoWeave

<div align="center">

![AutoWeave Banner](https://img.shields.io/badge/AutoWeave-Workflow%20Automation-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2w0IDE0aDEybDQtMTR6Ii8+PC9zdmc+)

**Visually design, connect, and run intelligent automated workflows — powered by AI.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## What is AutoWeave?

AutoWeave is an open-source, full-stack workflow automation platform where you build powerful pipelines by dragging, connecting, and configuring nodes on a canvas — no scripting required. Under the hood, each node dispatches a job through **Apache Kafka**, is processed by a **Python/LangChain AI service**, and streams live results back to your browser over **WebSockets**.

Whether you need to summarize documents, run ML models, scan for security vulnerabilities, query databases, or integrate with Google services, AutoWeave gives you a composable toolkit to wire it all together visually.

---

## Features

### AI & Language
| Node | Description |
|---|---|
| Summarization | Condense long text using LLMs |
| Text Generation | Generate creative or structured content |
| Translation | Translate across languages |
| Text Classification | Label and categorize text |
| Text Embedding | Produce vector representations |
| Question & Answer | Run RAG-style Q&A over documents |
| Named Entity Recognition | Extract people, places, organizations |
| Content Generation | Template-driven LLM output |
| Search Agent | Autonomous web search + synthesis |

### Machine Learning
| Node | Description |
|---|---|
| Linear Regression | Fit and predict continuous variables |
| K-Means Clustering | Unsupervised grouping of data points |
| Anomaly Detection | Identify outliers in time-series or tabular data |
| Data Analyst | Auto-generate charts and statistical summaries |

### Security & DevOps
| Node | Description |
|---|---|
| Port Scanner | Discover open ports on a host |
| SQL Injection Tester | Probe endpoints for SQLi vulnerabilities |
| SSL Certificate Check | Validate TLS cert expiry and chain |
| Password Brute Force | Credential auditing for authorized systems |
| File Integrity Check | Detect unexpected file modifications |
| Wallet Validator | Verify blockchain address validity |
| Hash Generator | Compute MD5, SHA-1, SHA-256 and more |
| Get My IP | Retrieve external IP metadata |

### Workflow Engine
- **Visual canvas** — drag, drop, and wire nodes with React Flow
- **Real-time execution** — live status updates streamed via WebSocket
- **CP Solver** — constraint programming for optimization workflows
- **Python Task Runner** — execute arbitrary Python snippets as nodes
- **Kafka-backed** — async, reliable job dispatch and result delivery

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Next.js 15)                   │
│         Visual Canvas  ·  Dashboard  ·  Auth UI             │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTPS / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               Spring Boot  (port 2706)                      │
│   REST API  ·  JWT Auth  ·  OTP  ·  Google OAuth            │
│   Workflow CRUD  ·  Execution Management  ·  Kafka Producer  │
└───────────┬──────────────────────────┬──────────────────────┘
            │ Kafka (topic: jobs)       │ JDBC
            ▼                          ▼
┌────────────────────────┐   ┌──────────────────────┐
│  FastAPI  (port 8000)  │   │   PostgreSQL           │
│  LangChain  ·  AI      │   │   Workflows, Runs,     │
│  30+ Node Handlers     │   │   Users, Logs          │
│  Kafka Consumer        │   └──────────────────────┘
│  Result → WebSocket    │
└───────────┬────────────┘
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
Redis    Qdrant    External
Cache    Vector    LLM APIs
         Store    (OpenAI /
                  Gemini /
                  Anthropic)
```

### Service Breakdown

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| **Frontend** | Next.js 15, React Flow, Tailwind | `3000` | Canvas UI, auth, dashboard |
| **Backend** | Spring Boot 3, JPA | `2706` | REST API, auth, workflow CRUD |
| **AI Service** | Python, FastAPI, LangChain | `8000` | Node execution, LLM calls |
| **PostgreSQL** | Postgres 16 | `5432` | Persistent storage |
| **Redis** | Redis 7 | `6379` | Sessions, caching, rate limiting |
| **Kafka** | Apache Kafka 3.7 (KRaft) | `9092` | Async job queue |
| **Qdrant** | Qdrant latest | `6333` | Vector similarity search |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-org/autoweave.git
cd autoweave
```

### 2. Configure environment variables

Create a `.env` file in the project root (copy from `.env.example` if present) and fill in the required values:

```env
# LLM Provider Keys (at least one required)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...

# Google OAuth (for Gmail / Calendar integrations)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# JWT
JWT_SECRET=your-very-long-random-secret

# Mail (OTP delivery)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
```

### 3. Launch all services

```bash
docker compose up --build
```

> First run downloads ~2 GB of images and compiles the Spring Boot jar. Subsequent starts are much faster.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Spring API | http://localhost:2706 |
| FastAPI / Swagger | http://localhost:8000/docs |
| Qdrant Dashboard | http://localhost:6333/dashboard |

### 4. Create your first workflow

1. Register at `http://localhost:3000/auth` (OTP sent to your email)
2. Open the **Flow** editor from the sidebar
3. Drag a **Text Generation** node onto the canvas
4. Connect it to an **Output** node and click **Run**
5. Watch results stream back in real time

---

## Tech Stack

<details>
<summary><strong>Frontend</strong></summary>

- **Next.js 15** — App Router, Server Components
- **@xyflow/react** (React Flow) — canvas and edge rendering
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — animations
- **Radix UI** — accessible component primitives
- **React Hook Form** — form state management
- **jwt-decode** + **@react-oauth/google** — auth helpers

</details>

<details>
<summary><strong>Backend (Spring Boot)</strong></summary>

- **Spring Boot 3** + **Spring Security** — REST API and JWT guard
- **Spring Data JPA** + **PostgreSQL** — relational persistence
- **Spring Data Redis** — session cache
- **Spring Kafka** — job producer
- **JavaMailSender** — OTP emails

</details>

<details>
<summary><strong>AI Service (Python / FastAPI)</strong></summary>

- **FastAPI** — async HTTP and WebSocket server
- **LangChain** — LLM orchestration and chain building
- **OpenAI / Google Gemini / Anthropic** — pluggable LLM backends
- **sentence-transformers** — local embedding models
- **scikit-learn** — ML node implementations
- **Qdrant** — vector store for RAG pipelines
- **kafka-python** — Kafka consumer

</details>

---

## Project Structure

```
autoweave/
├── opr-frontend/          # Next.js 15 web app
│   └── src/
│       ├── app/
│       │   ├── flow/      # Workflow canvas page
│       │   ├── auth/      # Login / register
│       │   └── ...        # Dashboard, docs, blog
│       └── components/    # Shared UI components
│
├── spring-service/
│   └── backend/           # Spring Boot REST API
│       └── src/main/java/
│
├── langchain-service/
│   └── app/
│       ├── handlers/      # One handler per node type (30+)
│       ├── service/       # LLM factory, Kafka consumer, workflow builder
│       ├── core/          # Config, Kafka, Redis
│       └── models/        # Pydantic request/response schemas
│
├── docs/                  # Architecture & UML diagrams
└── docker-compose.yml     # Full stack orchestration
```

---

## Documentation

Full architecture and design docs live in [docs/](docs/):

| Document | Contents |
|---|---|
| [System Architecture](docs/01_SYSTEM_ARCHITECTURE.md) | High-level overview, service interactions |
| [Data Flow Diagram](docs/02_DATA_FLOW_DIAGRAM.md) | End-to-end request lifecycle |
| [ER Schema](docs/03_ER_SCHEMA_DIAGRAMS.md) | Database entity relationships |
| [Use Case UML](docs/04_UML_USE_CASE.md) | Actor/system interactions |
| [Class Diagrams](docs/05_UML_CLASS_DIAGRAMS.md) | Domain model |
| [Sequence Diagrams](docs/06_UML_SEQUENCE_DIAGRAMS.md) | Workflow execution flow |
| [Activity Diagrams](docs/07_UML_ACTIVITY_DIAGRAMS.md) | Node processing logic |

---

## Contributing

Contributions are welcome. Please open an issue first to discuss any significant change.

```bash
# Fork, then clone your fork
git clone https://github.com/your-username/autoweave.git

# Create a feature branch
git checkout -b feat/my-new-node

# Make changes, then run the stack
docker compose up --build

# Open a PR against main
```

Code style follows the conventions already present in each service (ESLint/Prettier for TypeScript, Black for Python, Google Java Format for Spring Boot).

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with precision and a lot of coffee.
</div>



