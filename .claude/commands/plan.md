---
description: Plan a feature or task before implementation
---

**Obligatorio antes de planificar:**

1. Leer y seguir `.claude/skills/skill-mattpocock-cycle/SKILL.md`
2. Aplicar `.claude/rules/mattpocock-task-cycle.md` (skills en `.agents/skills/`)
3. Si el área es desconocida: skill `zoom-out` primero
4. Si hace falta PRD/issue: skill `to-prd` + `docs/agents/issue-tracker.md`

Create a detailed implementation plan for: $ARGUMENTS

Follow this structure:

1. **Goal** — What "done" looks like
2. **Success criteria** — How to verify it
3. **Approach** — Steps (no more than 5)
4. **Risks** — What could go wrong
5. **Files affected** — Which files will be created/modified
6. **Edge cases** — Non-obvious scenarios to handle

Do NOT implement code. Only plan.

If this is part of the orchestration pipeline, save to `.claude/logs/audits/features/{feature-id}/` and update `pipeline-state.json`.
