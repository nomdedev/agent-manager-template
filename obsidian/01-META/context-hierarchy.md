---
h-level: 1
created: 2026-05-23
modified: 2026-05-23
agent-relevant: true
tokens: 200
---

# Context Hierarchy (H1-H5)

## Loading Rules

| Level | When | Budget | Content |
|-------|------|--------|---------|
| H1 Universal | Start of session | 300-500 tokens | Project identity, stack, conventions |
| H2 Session | Per feature | 400-800 tokens | Active pipeline, current feature |
| H3 Task | Per task | 200-600 tokens | Requirements, acceptance criteria |
| H4 Reference | On demand | 100-400 tokens | ADRs, API docs, business rules |
| H5 Archive | Never (AI) | 0 tokens | Historical, completed features |

## Hard Limits

- **Per turn:** Max 2,000 tokens of vault context
- **H1+H2+H3:** Should fit in ~1,000 tokens
- **H4:** Loaded only when agent explicitly references
- **H5:** Never loaded automatically

## Link vs Embed

- **Embed:** Information needed for critical path (H1-H3)
- **Link:** Details not needed now (H4)
- **Archive:** Historical only (H5)

## Note Format

```yaml
---
h-level: 1-5
created: YYYY-MM-DD
modified: YYYY-MM-DD
agent-relevant: true|false
tokens: [count]
---
```
