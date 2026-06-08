# Pipeline de auditoría lifecycle

Complemento del [pipeline de equipos](REFERENCE.md#metodologia-el-pipeline-de-7-fases) (7 fases). Cubre el **ciclo de vida completo** del software con 8 fases y gates GO/NO-GO.

## Instalación automática

Al ejecutar `claudio evoluciona` o `claudio init` en un proyecto externo:

- 8 agentes `lifecycle-*-auditor` en `.claude/agents/`
- Skills: `audit-pipeline`, `lifecycle-orchestrator`, `auditor-agent-factory`
- Docs: `docs/AUDIT_STANDARDS.md`, `docs/AUDIT_AGENTS.md`, `docs/audits/`

## Uso diario

```
/audit-pipeline mi-feature-id
```

O invocar skill `audit-pipeline` en Claude Code.

## Qué abarca cada fase

Ver `.claude/skills/audit-pipeline/references/coverage-by-phase.md`

## Cómo saber si la auditoría es correcta

Ver `.claude/skills/audit-pipeline/references/verdict-rubrics.md`

| Correcto | Incorrecto |
|----------|------------|
| Checklist completo | Sin evidencia |
| Veredicto coherente con severidades | APROBADO con críticos |
| Reporte en docs/audits/ | Solo en chat |

## Dos pipelines

| | Equipos | Lifecycle |
|---|---------|-----------|
| Fases | 7 | 8 |
| Reglas | orchestration.md | AUDIT_STANDARDS.md |
| Orquestador | orchestrator.md | lifecycle-orchestrator |
| Seguridad | security-auditor | lifecycle-security-auditor |

No mezclar agentes ni veredictos entre ambos.

## Regenerar

```bash
claudio evoluciona ./mi-proyecto --yes
```

O skill `auditor-agent-factory` en Claude Code.
