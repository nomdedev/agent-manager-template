---
name: audit-pipeline
description: >
  Ejecuta auditorías lifecycle por fases usando agentes lifecycle-*-auditor,
  checklists, estándares y lifecycle-orchestrator. Usar SIEMPRE al auditar una
  feature, validar calidad pre-merge/deploy, o verificar si un análisis es correcto.
  Complementa el pipeline de equipos en orchestration.md. Disparadores: "auditar
  feature", "pipeline de auditoría", "audit phase", "GO/NO-GO", "validar auditoría",
  "lifecycle audit", "checklist de auditoría".
---

# Audit Pipeline — agent-manager-template

Ejecuta el **pipeline lifecycle de 8 fases** (complementario al pipeline de equipos de 7 fases).

## Dos pipelines

| Pipeline | Agentes | Cuándo |
|----------|---------|--------|
| Equipos | domain-expert, security-auditor, tester… | `/plan`, orchestration.md |
| **Lifecycle** | lifecycle-scope-auditor … lifecycle-production-auditor | Esta skill, `/audit-pipeline` |

## Recursos obligatorios

| Recurso | Ruta |
|---------|------|
| Estándares | `docs/AUDIT_STANDARDS.md` |
| Catálogo | `docs/AUDIT_AGENTS.md` |
| Checklists | `.claude/skills/lifecycle-orchestrator/references/checklists.md` |
| Cobertura | [references/coverage-by-phase.md](references/coverage-by-phase.md) |
| Rúbricas | [references/verdict-rubrics.md](references/verdict-rubrics.md) |
| Input | [references/input-template.md](references/input-template.md) |
| Validación reportes | [references/report-validation.md](references/report-validation.md) |

## Modo B — Una fase

1. Plantilla input → contexto de feature
2. `coverage-by-phase.md` → Fase N
3. `AUDIT_STANDARDS.md` → disciplina
4. Checklist Fase N
5. Invocar `lifecycle-*-auditor` correspondiente
6. `verdict-rubrics.md` + `report-validation.md`
7. Guardar en `docs/audits/[feature-id]-[fase]-[fecha].md`

## Modo C — ¿Auditoría correcta?

Cruzar reporte con rúbricas + checklist → **AUDITORÍA VÁLIDA** / **INVÁLIDA**

## Agentes lifecycle

| Fase | Agente |
|------|--------|
| 0 | lifecycle-scope-auditor |
| 1 | lifecycle-architecture-auditor |
| 2 | lifecycle-design-auditor |
| 3 | lifecycle-security-auditor |
| 4 | lifecycle-code-auditor |
| 5 | lifecycle-test-auditor |
| 6 | lifecycle-devex-auditor |
| 7 | lifecycle-production-auditor |

## Regenerar auditores

Skill `auditor-agent-factory` o re-ejecutar `claudio evoluciona` en el proyecto.
