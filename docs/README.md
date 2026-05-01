# AutoWeave Documentation

Welcome to the AutoWeave technical documentation. This folder contains comprehensive system architecture, design patterns, and data flow diagrams for the AutoWeave workflow automation platform.

## Documentation Index

1. **[System Architecture](./01_SYSTEM_ARCHITECTURE.md)** - High-level overview of system components and their interactions
2. **[Data Flow Diagrams](./02_DATA_FLOW_DIAGRAM.md)** - Complete data flow across the entire system
3. **[ER Diagram & Database Schema](./03_ER_SCHEMA_DIAGRAMS.md)** - Elaborated Entity-Relationship and database schema diagrams
4. **[UML Use Case Diagrams](./04_UML_USE_CASE.md)** - System actors and their interactions
5. **[UML Class Diagrams](./05_UML_CLASS_DIAGRAMS.md)** - Detailed class hierarchies and relationships
6. **[UML Sequence Diagrams](./06_UML_SEQUENCE_DIAGRAMS.md)** - Step-by-step interaction sequences
7. **[UML Activity Diagrams](./07_UML_ACTIVITY_DIAGRAMS.md)** - Business process flows and workflows

## Project Overview

**AutoWeave** is a workflow automation platform that lets you visually build, connect, and run automated workflows powered by AI.

### Tech Stack
- **Frontend**: Next.js 14, React Flow, Tailwind CSS
- **Backend**: Spring Boot, Kafka, Redis, PostgreSQL
- **AI Service**: Python, LangChain
- **Infrastructure**: Docker Compose

### Key Features
- Visual drag-and-drop workflow editor
- AI-powered nodes via LangChain
- Google Calendar & Gmail integrations
- Real-time execution tracking
- Secure authentication with OTP verification

## Architecture Highlights

AutoWeave follows a microservices-inspired architecture with clear separation of concerns:
- **Frontend Layer**: React-based interactive UI
- **Backend Layer**: Spring Boot REST APIs with Kafka for messaging
- **AI Layer**: Python service with LangChain integration
- **Data Layer**: PostgreSQL for persistence, Redis for caching
- **Message Queue**: Kafka for asynchronous communication

## Getting Started with Docs

Start with the [System Architecture](./01_SYSTEM_ARCHITECTURE.md) document to understand the high-level design, then dive into specific aspects based on your interest.
