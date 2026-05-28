# Domain Docs (agent-manager-template)

Cómo consumir la documentación de dominio de este template al explorar el código o crear tareas.

## Antes de explorar o planificar, leé

| Archivo | Contenido |
| ------- | --------- |
| `CONTEXT.md` (raíz) | Puntero al contexto del proyecto |
| `.claude/context.md` | Qué es el proyecto, stack, objetivos |
| `.claude/rules/domain.md` | Terminología, datos sensibles, reglas de negocio |
| `.claude/architecture.md` | Capas, módulos, flujos técnicos |
| `obsidian/` (si existe) | Vault extendido; ver `obsidian/00-README.md` |

No existe `docs/adr/` por defecto. Las decisiones de arquitectura viven en `.claude/architecture.md` y en reportes bajo `.claude/logs/audits/features/`. Si aparece `docs/adr/`, leé los ADR relevantes al área que tocás.

## Layout

Single-context (este template):

```
/
├── CONTEXT.md
├── docs/agents/          ← configuración para mattpocock/skills
├── .claude/
│   ├── context.md
│   ├── architecture.md
│   ├── rules/domain.md
│   └── logs/audits/features/
└── obsidian/             ← opcional
```

## Vocabulario

Usá los términos de `.claude/rules/domain.md` en títulos de issues, PRDs, tests y nombres de módulos. Si falta un término, anotalo para `/domain` o `grill-with-docs` — no inventes sinónimos.

## Conflicto con decisiones previas

Si tu propuesta contradice `.claude/architecture.md` o un reporte de fase en `audits/features/`, decilo explícitamente antes de implementar.
