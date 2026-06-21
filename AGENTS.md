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

### Loop Engineering (obligatorio para loops)

Antes de construir un loop, leé [docs/LOOP-ENGINEERING.md](docs/LOOP-ENGINEERING.md) y pasá el test de 4 condiciones. Templates: [docs/templates/STATE.md](docs/templates/STATE.md), [docs/templates/VISION.md](docs/templates/VISION.md). Anti-patterns: [docs/ANTI-PATTERNS.md](docs/ANTI-PATTERNS.md). Gates: [docs/LOOP-GATES.md](docs/LOOP-GATES.md).

### Ciclo de tareas (obligatorio)

Antes de planificar o implementar, leé [.claude/rules/mattpocock-task-cycle.md](.claude/rules/mattpocock-task-cycle.md) y el skill [.claude/skills/skill-mattpocock-cycle/SKILL.md](.claude/skills/skill-mattpocock-cycle/SKILL.md).

### gstack (Garry Tan — recomendado)

Instalación global (modo team): `pnpm run gstack:install` o `claudio gstack install`. Ver sección **gstack** en [.claude/CLAUDE.md](.claude/CLAUDE.md). Skills: `/review`, `/ship`, `/qa`, `/browse`, `/office-hours`, etc.

### Auto-Audit Loop (sistema de análisis automático)

Sistema de loops que activa automáticamente agentes expertos según el tipo de archivo modificado. Ver [.claude/skills/auto-audit-loop/SKILL.md](.claude/skills/auto-audit-loop/SKILL.md). Comando: `/auto-audit`. Hook: `03-auto-audit-trigger.sh` se activa después de cada edición. Cron job diario a las 9am. Reportes HTML en `.claude/logs/auto-audit/reports/`.
