# Vault Rules — Obsidian as Extended Memory

These rules govern how the Obsidian vault (`obsidian/`) integrates with agent workflows.
**Goal: Minimize tokens while maximizing context quality.**

---

## The 5-Level Context Hierarchy (H1-H5)

Every note in the vault MUST have an H-level. This determines when agents load it.

### H1 — Universal Context (loaded once per session)
**When:** Start of every session
**Token budget:** 200-500 tokens total for ALL H1 notes
**Content:** Project identity, stack, conventions that never change

**Files:**
- `obsidian/00-README.md` — Vault guide
- `obsidian/01-META/project-identity.md` — What this project is
- `obsidian/02-Estandares/stack.md` — Technology stack
- `obsidian/02-Estandares/conventions.md` — Code conventions

**Rules:**
- Maximum 5 H1 notes
- Each note <150 tokens
- No code examples (link to H4 instead)
- No historical context
- Update only when stack/conventions change

---

### H2 — Session Context (loaded per feature/task)
**When:** When starting work on a feature
**Token budget:** 300-800 tokens total for ALL H2 notes
**Content:** Current state, active features, pipeline status

**Files:**
- `obsidian/04-Contexto/pipeline-activo.md` — What's in progress
- `obsidian/04-Contexto/current-feature.md` — Current feature details
- `obsidian/04-Contexto/roadmap.md` — Near-term priorities

**Rules:**
- Maximum 4 H2 notes active
- Archive old H2 notes to H5 after feature completes
- Update after every phase transition
- Link to H4 for detailed specs

---

### H3 — Task Context (loaded per specific task)
**When:** When executing a specific task
**Token budget:** 200-600 tokens
**Content:** Requirements, acceptance criteria, specific constraints

**Files:**
- `obsidian/05-Analisis/PLAN-*.md` — Feature specifications
- `obsidian/08-Templates/feature.md` — Feature template (when active)

**Rules:**
- One H3 note per active task
- Delete or archive when task completes
- Include GOAL, CRITERIA, APPROACH (Rule 4)
- No background information (that's H2)

---

### H4 — Reference (loaded on demand, never by default)
**When:** Agent explicitly asks or link is clicked
**Token budget:** 100-400 tokens per reference
**Content:** Detailed specs, ADRs, API docs, business rules

**Files:**
- `obsidian/05-Analisis/ADR-*.md` — Architecture Decision Records
- `obsidian/06-Testing/*.md` — Test plans and coverage reports
- `obsidian/07-Deployments/*.md` — Deployment runbooks
- `obsidian/08-Templates/*.md` — Templates (when referenced)

**Rules:**
- Never embed in H1-H3 notes
- Always linked with one-line description
- Self-contained (can be understood without other context)
- Versioned if they change (ADR-001, ADR-001-v2)

---

### H5 — Archive (never loaded by AI)
**When:** Never automatically
**Token budget:** 0 tokens
**Content:** Historical decisions, completed features, old analyses

**Files:**
- `obsidian/99-Archive/*.md` — Everything outdated

**Rules:**
- Move here when information is no longer relevant
- Keep backlinks working (don't break links)
- Human-readable only
- Can be loaded manually if explicitly requested

---

## Note Format (Token-Optimized)

### Frontmatter (required)
```yaml
---
h-level: 1|2|3|4|5
created: YYYY-MM-DD
modified: YYYY-MM-DD
agent-relevant: true|false
tokens: [estimated count]
---
```

### Body format
```markdown
# Note Title

## Key Facts (dense, scannable)
| Fact | Detail |
|------|--------|
| A | 1 |
| B | 2 |

## Context
[2-3 sentences max. Link to H4 for details.]

## Decisions
- [Decision 1 with rationale]
- [Decision 2 with rationale]

## Links
- [[H4-Reference]] — [one-line description]
- [[H4-Reference-2]] — [one-line description]
```

### Forbidden in H1-H3:
- Code blocks >10 lines (link to H4)
- Bullet lists >5 items (use table)
- Explanations >3 sentences (be concise)
- Historical narrative (move to H5)
- Duplicated information (link instead)

---

## Linking Strategy

### Internal links (`[[Note]]`)
- Use for H4 references from H1-H3
- One-line description after link
- Never embed full content

### Tag links (`#tag`)
- Use for categorization
- `#agent-relevant` — AI should know about this
- `#human-only` — AI can ignore
- `#archive-candidate` — Consider moving to H5

### External links
- Minimize (external context = token uncertainty)
- If needed, summarize in one line

---

## Vault Maintenance

### Weekly (automated via cron)
- [ ] Archive notes older than 30 days in H2-H3
- [ ] Check for broken links
- [ ] Measure total vault tokens (target: <50K)
- [ ] Identify duplicated information

### Per Feature (manual)
- [ ] Create H3 note for feature
- [ ] Update H2 pipeline-activo
- [ ] Link to relevant H4 references
- [ ] Archive H3 when feature completes

### Per Session (automatic)
- [ ] Load H1 notes (cached)
- [ ] Load relevant H2 notes
- [ ] Load H3 for current task
- [ ] H4 on demand only

---

## Token Budget by Context Load

| Load Type | H-Levels | Token Budget | When |
|-----------|----------|-------------|------|
| Cold start | H1 | 300-500 | New session |
| Feature start | H1 + H2 | 600-1,000 | New feature |
| Task execution | H1 + H2 + H3 | 800-1,500 | Specific task |
| Deep dive | H1 + H2 + H3 + H4 | 1,000-2,000 | On demand |
| Emergency | H1 + relevant only | 300-600 | Incident response |

**Never exceed 2,000 tokens of vault context per turn.**

---

## Integration with 12 Rules

| CLAUDE.md Rule | Vault Integration |
|----------------|-------------------|
| Rule 1 — Think Before Coding | H3 note defines goal before code |
| Rule 2 — Simplicity First | H1 conventions prevent over-engineering |
| Rule 3 — Surgical Changes | H4 specs define exact scope |
| Rule 4 — Goal-Driven | H3 contains GOAL/CRITERIA/APPROACH |
| Rule 5 — Code Over Model | H4 references deterministic operations |
| Rule 6 — Token Budgets | H-levels enforce progressive disclosure |
| Rule 7 — Surface Conflicts | H4 ADRs document pattern decisions |
| Rule 8 — Read Before Write | H2/H3 tell agent what to read |
| Rule 9 — Test Intent | H6 test plans define intent |
| Rule 10 — Checkpoint | H2 updated with checkpoint |
| Rule 11 — Match Conventions | H1 defines conventions |
| Rule 12 — Fail Loud | H2 pipeline state shows blockers |
