# Domain Rules — Generic Project

This file defines the business domain vocabulary, workflows, and constraints.
**Fill this in during project setup** with your specific domain.

This file is referenced by:
- `.claude/agents/domain-expert.md` — domain validation
- `.claude/agents/tester.md` — business invariants in tests
- `.claude/rules/orchestration.md` — Phase 1 domain review

---

## Domain Glossary

Define the canonical terms for your domain. This prevents terminology drift across the codebase.

| Correct Term | Avoid |
|--------------|-------|
| [your term] | [synonym to avoid] |
| [your term] | [synonym to avoid] |
| [your term] | [synonym to avoid] |

**Rule:** Use only the terms in the "Correct Term" column in UI labels, variable names, comments, and documentation.

---

## Core Business Workflow

Define the main pipeline/state machine for your domain:

```
[State 1] → [State 2] → [State 3] → [State 4] → [State 5]
```

### Entity States

For each main entity, define valid states and allowed transitions:

**[Entity 1]:**
- `[state_a]` → `[state_b]` (condition: ...)
- `[state_b]` → `[state_c]` (condition: ...)

---

## Key Business Entities

List the main entities, their purpose, and any constraints:

| Entity | Purpose | Key Constraints |
|--------|---------|-----------------|
| [Entity 1] | | |
| [Entity 2] | | |
| [Entity 3] | | |

---

## KPIs — Key Performance Indicators

Define measurable metrics relevant to this business:

- **[Metric 1]:** How calculated, why it matters
- **[Metric 2]:** How calculated, why it matters
- **[Metric 3]:** How calculated, why it matters

---

## Sensitive Data

Identify which data requires special handling (PII, PHI, financial, etc.):

| Data Field | Sensitivity Level | Rules |
|------------|------------------|-------|
| [field] | HIGH | Never log, never expose in aggregates |
| [field] | MEDIUM | Mask in UI, audit on access |

---

## Business Invariants (Rules That Must Never Be Violated)

1. [Invariant 1 — e.g., "An entity cannot move backward in the workflow"]
2. [Invariant 2]
3. [Invariant 3]

These become test cases. Every business invariant must have a test that fails if the rule is broken.

---

## Out of Scope

Explicitly define what this system does NOT handle:

- [Out of scope 1]
- [Out of scope 2]
