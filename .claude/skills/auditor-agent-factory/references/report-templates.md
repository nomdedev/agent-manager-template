# Plantillas de reporte

Todos los auditores (Fases 0-6) usan **APROBADO / BLOQUEADO**. Solo `production-auditor` (Fase 7) usa **GO / NO-GO**.

## Reporte de fase (Fases 0-6)

```markdown
## FASE {{PHASE_NUM}} — {{PHASE_NAME}} — {{FEATURE_ID}} — {{DATE}}

### Auditor
{{AGENT_SLUG}}

### Alcance auditado
- Archivos/módulos: ...
- Comandos ejecutados: ...

### Checklist
- [x] Item verificado
- [ ] Item fallido — **BLOQUEANTE**

### Hallazgos

| Severidad | Hallazgo | Ubicación | Recomendación |
|-----------|----------|-----------|---------------|
| crítico | ... | `path:line` | ... |
| alto | ... | ... | ... |
| medio | ... | ... | ... |
| bajo | ... | ... | ... |

### VEREDICTO: APROBADO | BLOQUEADO
**Razón:** ...

### Próximo paso
- Avanzar a Fase {{NEXT_PHASE}} ({{NEXT_AGENT}}) / Rebote a Fase {{REBOUNCE_PHASE}}
```

## Reporte de producción (Fase 7)

```markdown
## FASE 7 — PRODUCCIÓN — {{FEATURE_ID}} — {{DATE}}

### Auditor
production-auditor

### Verificación realizada
- Build: ✅ / ❌ — `{{BUILD_COMMAND}}`
- Typecheck: ✅ / ❌
- Tests unitarios: ✅ / ❌ — `{{UNIT_TEST_COMMAND}}`
- QA browser: ✅ / ❌ / N/A
- Console sin errores: ✅ / ❌
- Datos reales en UI: ✅ / ❌ / N/A

### Evidencia
- Screenshots: `qa/screenshots/...`
- Logs relevantes: ...

### Hallazgos bloqueantes
- (lista o "ninguno")

### VEREDICTO FINAL: GO | NO-GO
**Razón:** ...

### Features autorizadas para deploy
- {{FEATURE_ID}}
```

## Reporte de transición (orquestador)

```markdown
## TRANSICIÓN — {{FEATURE_ID}} — Fase {{FROM}} → {{TO}} — {{DATE}}

### Reporte recibido de
{{AGENT_SLUG}}

### Gate verificado
- [x] Formato de reporte correcto
- [x] Checklist de fase completo
- [x] VEREDICTO presente

### Decisión del orquestador
**AUTORIZADO** — avanzar a Fase {{TO}} / **BLOQUEADO** — rebote a {{REBOUNCE_AGENT}}
```

## Severidades estándar

| Nivel | Criterio | Impacto en veredicto |
|-------|----------|---------------------|
| crítico | Exploit viable, data loss, secret exposed | BLOQUEADO |
| alto | Vulnerabilidad probable sin mitigación | BLOQUEADO en security; APROBADO con condición en otras fases |
| medio | Deuda técnica, convención violada | APROBADO con follow-up |
| bajo | Mejora sugerida | APROBADO |

## Ubicación de reportes

Guardar en el proyecto destino:

```
docs/audits/{{FEATURE_ID}}-{{PHASE}}-{{DATE}}.md
```

El orquestador referencia esta ruta en su skill generado.
