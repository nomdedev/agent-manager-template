---
name: auditor-agent-factory
description: >
  Genera o regenera agentes lifecycle-*-auditor, AUDIT_STANDARDS.md y checklists
  para el proyecto. Usar al cambiar stack, estándares o al bootstrap inicial.
  Disparadores: "generar agentes auditores", "regenerar lifecycle auditors",
  "auditor factory", "actualizar AUDIT_STANDARDS".
---

# Auditor Agent Factory (embedded)

Versión embebida en Agent Manager Template. Regenera el ecosistema lifecycle en el proyecto actual.

## Recursos

- [references/standards-baseline.md](references/standards-baseline.md)
- [references/lifecycle-model.md](references/lifecycle-model.md)
- [references/agent-catalog.md](references/agent-catalog.md)
- `.claude/templates/audit/` — plantillas

## Regenerar en este proyecto

1. Leer `.claude/context.md`, `architecture.md`, `package.json`
2. Actualizar `docs/AUDIT_STANDARDS.md` desde baseline + proyecto
3. Regenerar 8 agentes `lifecycle-*` desde `.claude/templates/audit/agents/catalog.json`
4. Actualizar `lifecycle-orchestrator/references/checklists.md`
5. Validar con `docs/AUDIT_AGENTS.md`

## CLI alternativo

```bash
claudio evoluciona [proyecto] --yes   # re-bootstrap completo
```

## Relación

- **audit-pipeline** — ejecutar auditorías
- **orchestration.md** — pipeline de equipos (separado)
