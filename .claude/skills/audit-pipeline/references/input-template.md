# Plantilla de input para auditorías

Copiar y rellenar al invocar cualquier auditor o el orquestador.

```markdown
## Contexto de auditoría

**feature-id:** [kebab-case, ej. mcp-tool-export-ohlcv]
**fase:** [0-7]
**auditor:** [scope-auditor | architecture-auditor | ...]
**fecha:** [YYYY-MM-DD]
**solicitante:** [usuario o orquestador]

### Descripción de la feature
[1-3 oraciones: qué se cambió y por qué]

### Archivos / módulos tocados
- `path/to/file.js`
- `dashboard/src/components/X.tsx`

### Reportes de fases anteriores
- [ ] N/A (fase 0)
- [ ] `docs/audits/[feature-id]-intake-[fecha].md`
- [ ] `docs/audits/[feature-id]-architecture-[fecha].md`
- (listar los aplicables)

### Comandos ya ejecutados por el desarrollador
- [ ] `npm run test:unit` — resultado: ...
- [ ] `npm run dashboard:check` — resultado: ...
- (otros)

### Preguntas específicas para el auditor
- [opcional]

### Checklist a marcar
→ `.claude/skills/project-orchestrator/references/checklists.md` sección Fase N

### Estándares a aplicar
→ `docs/AUDIT_STANDARDS.md` sección [disciplina]
```

## Reglas del input

- **feature-id** obligatorio — sin él no se guarda reporte
- **Archivos tocados** mínimo 1 — delimita alcance del análisis
- **Reportes previos** obligatorios desde fase 1 en adelante
