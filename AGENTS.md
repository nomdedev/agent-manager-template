# AGENTS.md

Instrucciones para agentes en este repositorio. La fuente de verdad detallada está en [.claude/CLAUDE.md](.claude/CLAUDE.md).

## Agent skills (mattpocock/skills)

Skills instaladas en `.agents/skills/` (lockfile: `skills-lock.json`). Reinstalar: `pnpm run skills:install`.

### Issue tracker

GitHub Issues vía `gh`. Ver [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Vocabulario en [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Single-context: `CONTEXT.md`, `.claude/context.md`, `.claude/rules/domain.md`. Ver [docs/agents/domain.md](docs/agents/domain.md).

### Ciclo de tareas (obligatorio)

Antes de planificar o implementar, leé [.claude/rules/mattpocock-task-cycle.md](.claude/rules/mattpocock-task-cycle.md) y el skill [.claude/skills/skill-mattpocock-cycle/SKILL.md](.claude/skills/skill-mattpocock-cycle/SKILL.md).
