---
name: lifecycle-orchestrator
description: >
  Orquestador del pipeline lifecycle de 8 fases para {{PROJECT_NAME}}. Coordina
  agentes lifecycle-*-auditor, gates APROBADO/GO/NO-GO y rebotes. Complementa
  orchestrator.md (pipeline de equipos). Disparadores: "orquestar lifecycle",
  "lifecycle pipeline", "gate lifecycle", "fase lifecycle".
---

# Lifecycle Orchestrator — {{PROJECT_NAME}}

Coordina el pipeline **lifecycle** (8 fases). No reemplaza el orquestador de equipos en `.claude/agents/orchestrator.md`.

Leer skill **`audit-pipeline`** antes de orquestar.

## Fases

| Fase | Agente | Gate |
|------|--------|------|
| 0 | lifecycle-scope-auditor | APROBADO |
| 1 | lifecycle-architecture-auditor | APROBADO |
| 2 | lifecycle-design-auditor | APROBADO |
| 3 | lifecycle-security-auditor | APROBADO |
| 4 | lifecycle-code-auditor | APROBADO |
| 5 | lifecycle-test-auditor | APROBADO |
| 6 | lifecycle-devex-auditor | APROBADO |
| 7 | lifecycle-production-auditor | GO / NO-GO |

## Protocolo

1. Crear `docs/audits/[feature-id]-state.json`
2. Por fase: invocar auditor → verificar [checklists.md](references/checklists.md) → guardar reporte
3. BLOQUEADO detiene el pipeline; rebote según matriz en audit-pipeline/references/verdict-rubrics.md

## Reportes

`docs/audits/[feature-id]-[fase]-[fecha].md`
