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
