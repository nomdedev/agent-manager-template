# Domain Rules — Agent Manager Template

This file defines the business domain vocabulary, workflows, and constraints.
Referenced by:
- `.claude/agents/domain-expert.md` — domain validation
- `.claude/agents/tester.md` — business invariants in tests
- `.claude/rules/orchestration.md` — Phase 1 domain review

---

## Domain: Agent Manager Template

This project is a **reusable template for managing AI software development agents** through a 7-phase gated pipeline. It includes a functional example AI Agent (Claudio) built with Node.js + Fastify.

---

## Domain Glossary

| Correct Term | Avoid | Definition |
|--------------|-------|------------|
| **Agent** | Bot, Assistant, Model | An autonomous AI worker with a specific role |
| **Tool** | Function, Utility, Helper | A capability an agent can invoke |
| **Pipeline** | Workflow, Process | The 7-phase gated sequence every feature must traverse |
| **Phase** | Step, Stage | One of 7 mandatory checkpoints in the pipeline |
| **Gate** | Checkpoint, Review | Exit criteria to advance to next phase |
| **Feature** | Ticket, Task, Item | Unit of work tracked through the pipeline |
| **Bounce** | Rework, Return | Feature fails gate, returns to earlier phase |
| **Verdict** | Status, Result | Phase outcome: GO, GO_WITH_NOTES, BLOCKED |
| **Orchestrator** | Manager, Coordinator | Director agent that routes features |
| **Conversation** | Chat, Session | Message exchange between user and agent |

**Rule:** Use only "Correct Term" column in code, labels, comments, docs.

---

## Core Workflow: 7-Phase Pipeline

```
Phase 1: Domain & Requirements → Phase 2: Architecture → Phase 3: Backend
→ Phase 4: Security → Phase 5: Develop & Deploy → Phase 6: QA/Testing
→ Phase 6.5: DevOps/Infra → Phase 7: Production
```

### Allowed Transitions
- Normal: Phase N → Phase N+1 (on GO)
- Bounce: Phase N → Phase M (M < N, on BLOCKED)
- Escalation: 3+ bounces to same phase → pause, escalate to user

### Forbidden
- Skipping phases
- Develop without Security approval
- Production with active blockers

---

## Key Entities

| Entity | Purpose | Constraints |
|--------|---------|-------------|
| Feature | Work unit in pipeline | Unique ID (FEAT-XXX), type, status, history |
| Agent | Specialized AI worker | Role, permissions, stack, triggers |
| Tool | Invokable capability | Name, description, parameters, handler |
| Conversation | User-agent message context | Session ID, history, tools used |
| Pipeline State | Feature registry | JSON file, single source of truth |

---

## KPIs

| Metric | Calculation | Why |
|--------|-------------|-----|
| Pipeline Velocity | Avg Phase 1→7 time | Delivery speed |
| Bounce Rate | Bounced/Total × 100 | Early phase quality |
| Gate Pass Rate | Passed first try/Total × 100 | First-time quality |
| Security Findings | CRITICAL/HIGH per audit | Security posture |
| Test Coverage | Covered/Total lines × 100 | Test completeness |
| Deploy Frequency | Production deploys/week | CI/CD health |

---

## Sensitive Data

| Field | Level | Rules |
|-------|-------|-------|
| OPENAI_API_KEY | CRITICAL | Server-only, never log, never expose |
| ANTHROPIC_API_KEY | CRITICAL | Server-only, never log, never expose |
| API keys in `.env` | CRITICAL | Never commit, never expose in client |
| Conversation content | MEDIUM | Don't log full messages |
| Pipeline state | LOW | Internal metadata, safe to log |

---

## Business Invariants

1. No phase skipping — every phase in order
2. Security before develop — Phase 4 approves before Phase 5
3. No deploy with blockers — deployLock=true if any BLOCKED
4. Unique feature IDs — FEAT-XXX format
5. Verdict required — no transition without documented verdict
6. Bounce to origin — earliest phase where root cause originated
7. Agent permissions — no actions outside scope

---

## Out of Scope

- Real-time collaboration (WebSockets)
- Persistent database (in-memory/JSON only)
- User authentication
- Frontend UI (backend API only)
- Multi-tenancy
- Billing/metering
