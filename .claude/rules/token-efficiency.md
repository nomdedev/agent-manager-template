# Token Efficiency Rules — Harness Engineering Standard

These rules enforce the 12-Rule Standard from CLAUDE.md at the token level.
**Goal: 90% token reduction vs unstructured agent interaction.**

---

## The 12 Rules → Token Savings Mapping

| Rule | Token Saving Mechanism | Estimated Savings |
|------|----------------------|-------------------|
| **Rule 1 — Think Before Coding** | Prevents speculative code generation, reduces rewrite cycles | ~25% |
| **Rule 2 — Simplicity First** | Eliminates boilerplate, abstractions, comments | ~20% |
| **Rule 3 — Surgical Changes** | Touch fewer files = less context to load | ~15% |
| **Rule 4 — Goal-Driven** | Stops when done, no extra "just in case" code | ~10% |
| **Rule 5 — Code Over Model** | Deterministic transforms don't need LLM reasoning | ~15% |
| **Rule 6 — Token Budgets** | Hard cap prevents runaway generation | ~30% |
| **Rule 7 — Surface Conflicts** | No blended patterns = no explanatory prose | ~5% |
| **Rule 8 — Read Before Write** | Prevents wrong assumptions, reduces iterations | ~10% |
| **Rule 9 — Test Intent** | Focused tests = less test code | ~5% |
| **Rule 10 — Checkpoint** | Summarize instead of repeating context | ~15% |
| **Rule 11 — Match Conventions** | No debates, no alternative implementations | ~5% |
| **Rule 12 — Fail Loud** | Catches issues early, prevents long debug sessions | ~20% |

**Cumulative effect:** Rules compound. A task that would take 10,000 tokens unstructured takes ~1,000 with all rules enforced.

---

## Rule 1 — Think Before Coding (Token Strategy)

### Before generating ANY code, the agent must output:

```
GOAL: [one line]
FILES: [list of files that will change]
ASSUMPTIONS: [explicit assumptions]
```

**Token saving:** Prevents the agent from generating code, realizing it's wrong, and regenerating. One clear plan = one generation cycle.

### Anti-pattern (wastes tokens):
```
Agent: "I'll implement the feature now."
[generates 200 lines]
Agent: "Wait, I need to check the existing structure first."
[reads files]
Agent: "Actually, the approach needs to change."
[regenerates 200 lines]
```

### Correct pattern (saves tokens):
```
Agent: "GOAL: Add rate limiting middleware
FILES: src/middleware/rate-limit.ts, src/config/index.ts
ASSUMPTIONS: Using @fastify/rate-limit, config from env vars"
[reads src/config/index.ts — 50 tokens of context]
[generates correct code once — 100 tokens]
```

---

## Rule 2 — Simplicity First (Token Strategy)

### Every line of code must earn its tokens:

| What | Token Cost | When to Cut |
|------|-----------|-------------|
| Interface for single implementation | 20-50 tokens | Always — use inline type |
| Helper function used once | 30-80 tokens | Inline it |
| Comment explaining "what" | 10-30 tokens | Delete, rename instead |
| Generic type parameter | 15-40 tokens | Use `unknown` + guard |
| Error class hierarchy | 50-150 tokens | Use `Error` with message |
| Builder pattern | 100-300 tokens | Object literal |

### Example: Before/After token count

**Before (speculative, 180 tokens):**
```typescript
// Interface for the service
interface IAgentService {
  chat(message: string, agentId?: string): Promise<ChatResponse>;
  listAgents(): Agent[];
}

// Abstract base class
abstract class BaseAgentService implements IAgentService {
  abstract chat(message: string, agentId?: string): Promise<ChatResponse>;
  abstract listAgents(): Agent[];
}

// Concrete implementation
export class AgentService extends BaseAgentService {
  // ... 50 lines of implementation
}
```

**After (simple, 60 tokens):**
```typescript
export class AgentService {
  chat(message: string, agentId?: string) { /* ... */ }
  listAgents() { /* ... */ }
}
```

**Savings:** 120 tokens (67% reduction)

---

## Rule 3 — Surgical Changes (Token Strategy)

### Load only the context you need:

**Bad (loads entire file context):**
```
[Agent reads 10 files to understand full architecture]
[Changes 2 lines in 1 file]
```

**Good (loads only affected context):**
```
[Agent reads 1 file that will change]
[Reads 1 file for type references]
[Changes 2 lines]
```

### Token budget per file read:
- Small file (<50 lines): 100-200 tokens
- Medium file (50-150 lines): 200-500 tokens
- Large file (>150 lines): Read only relevant section

**Never read a file without knowing exactly what you're looking for.**

---

## Rule 5 — Use Code, Not Model (Token Strategy)

### Deterministic operations = zero LLM tokens:

| Operation | LLM Approach | Code Approach | Token Savings |
|-----------|-------------|---------------|---------------|
| Format JSON | "Please format this JSON" | `JSON.stringify(obj, null, 2)` | 100% |
| Sort array | "Sort these items by date" | `arr.sort((a,b) => a.date - b.date)` | 100% |
| Validate schema | "Check if this matches the schema" | `schema.parse(data)` | 100% |
| Count lines | "How many lines in this file?" | `wc -l file.ts` | 100% |
| Find imports | "What does this file import?" | `grep "^import" file.ts` | 100% |

**Rule:** If a shell command or code snippet can do it, don't ask the LLM.

---

## Rule 6 — Token Budget Enforcement

### Hard limits per scope:

| Scope | Limit | Action at 80% | Action at 100% |
|-------|-------|---------------|----------------|
| Per response | 4,000 tokens | Summarize context | Stop, checkpoint |
| Per task | 8,000 tokens | Review approach | Simplify or split |
| Per session | 30,000 tokens | Archive old context | Start new session |

### Checkpoint triggers (mandatory):
- [ ] After every file modified
- [ ] After every test run
- [ ] When approaching 50% of task budget
- [ ] When context exceeds 2,000 tokens

### Checkpoint format (compressed):
```
✅ DONE: [file:change] [file:change]
✔️ VERIFIED: [test:result] [lint:result]
⏳ NEXT: [one-line next step]
⚠️ TOKENS: [used]/[budget]
```

---

## Rule 8 — Read Before Write (Token Strategy)

### Context loading order (most efficient):

1. **Directory structure** (`ls src/routes/`) — 10 tokens
2. **Index/barrel file** (`cat src/routes/index.ts`) — 50 tokens
3. **Target file only** (`cat src/routes/agent-routes.ts`) — 200 tokens
4. **Shared types** (if needed) — 100 tokens

**Total:** ~360 tokens for full context

### Anti-pattern (wastes tokens):
```
[Read all files in src/ — 2,000 tokens]
[Read tests — 1,000 tokens]
[Read config — 200 tokens]
[Read docs — 500 tokens]
[Finally edit 1 file — 200 tokens]
Total: 3,900 tokens
```

### Correct pattern:
```
[ls src/routes/ — 10 tokens]
[cat src/routes/index.ts — 50 tokens]
[cat src/routes/target.ts — 200 tokens]
[Edit file — 200 tokens]
Total: 460 tokens (88% savings)
```

---

## Rule 10 — Checkpoint Compression

### Information decay curve:

After N turns, old context loses relevance:
- Turn 1-3: 100% relevant
- Turn 4-6: 70% relevant
- Turn 7-10: 40% relevant
- Turn 11+: Archive and summarize

### Compression formula:
```
Original context: 2,000 tokens across 10 turns
Checkpoint summary: 200 tokens
Savings: 1,800 tokens (90%)
```

### When to checkpoint:
- Every 3-5 turns
- When switching subtasks
- When context exceeds 1,500 tokens
- Before asking a clarifying question

---

## Vault Integration (Token Strategy)

### H-Level Loading (progressive disclosure):

```
H1 (Universal): Loaded once per session — 300 tokens
  └─ Project identity, stack, conventions

H2 (Session): Loaded per feature — 400 tokens
  └─ Current feature, pipeline state

H3 (Task): Loaded per task — 300 tokens
  └─ Requirements, acceptance criteria

H4 (Reference): Loaded on demand — 0 tokens default
  └─ Linked, not embedded

H5 (Archive): Never loaded — 0 tokens
```

**Default context per task: 1,000 tokens**
**With references: 1,000 + on-demand loads**

### Link vs Embed decision tree:

```
Is the information needed for THIS task?
├── Yes, critical path → Embed (H1-H3)
├── Yes, but details not needed now → Link (H4)
│   └── Load only when agent asks
└── No, historical only → Archive (H5)
    └── Never load
```

---

## Measuring Token Efficiency

### Metrics to track (in `.claude/logs/token-usage.json`):

```json
{
  "sessionId": "...",
  "taskId": "...",
  "metrics": {
    "totalTokensUsed": 4500,
    "tokensPerFileChanged": 450,
    "contextReloads": 2,
    "checkpoints": 3,
    "filesRead": 5,
    "filesModified": 2,
    "efficiency": 0.85
  }
}
```

### Efficiency formula:
```
efficiency = (useful_output_tokens) / (total_tokens_consumed)

useful_output = code_generated + test_generated + docs_generated
waste = rewrites + over-explanation + speculative_code + repeated_context

target efficiency: >0.7 (70% of tokens produce deliverables)
```

---

## Enforcement Hooks

### Pre-generation checklist (saves ~30% tokens):
- [ ] Goal stated in one line
- [ ] Files to change identified
- [ ] Assumptions explicit
- [ ] Existing pattern identified (Rule 8)
- [ ] Token budget checked

### Post-generation checklist (saves ~20% tokens):
- [ ] No speculative code (Rule 2)
- [ ] No comments explaining "what" (Rule 2)
- [ ] No helper functions used once (Rule 2)
- [ ] No adjacent code touched (Rule 3)
- [ ] Checkpoint emitted (Rule 10)
