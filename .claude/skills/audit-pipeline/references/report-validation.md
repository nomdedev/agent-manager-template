# Validación de reportes de auditoría

Un reporte es **válido** solo si cumple todos los criterios obligatorios.

## Campos obligatorios

| Campo | Requerido | Fases |
|-------|-----------|-------|
| Título `## FASE N — [NOMBRE] — [feature-id] — [fecha]` | sí | 0-7 |
| Auditor identificado | sí | 0-7 |
| Alcance auditado (archivos/comandos) | sí | 0-7 |
| Checklist con ítems marcados | sí | 0-7 |
| Tabla o lista de hallazgos | sí (puede ser "ninguno") | 0-7 |
| `VEREDICTO: APROBADO \| BLOQUEADO` | sí | 0-6 |
| `VEREDICTO FINAL: GO \| NO-GO` | sí | 7 |
| Razón del veredicto | sí | 0-7 |
| Próximo paso | sí | 0-7 |

## Formato de hallazgo válido

Cada hallazgo debe incluir:

```
| severidad | descripción | ubicación | recomendación |
```

Mínimo para hallazgos críticos/altos: **ubicación** con path (y línea si aplica).

## Reporte INVÁLIDO si

- Falta VEREDICTO
- VEREDICTO sin razón
- Checklist ausente
- Hallazgo crítico sin ubicación
- Fase 7 usa APROBADO en lugar de GO/NO-GO
- No referencia feature-id
- Solo texto narrativo sin estructura

## Ubicación de archivos

```
docs/audits/[feature-id]-[fase-slug]-[YYYY-MM-DD].md
docs/audits/[feature-id]-state.json
```

### state.json mínimo

```json
{
  "id": "feature-id",
  "currentPhase": 3,
  "status": "IN_PROGRESS",
  "lastVerdict": "APROBADO",
  "startedAt": "2026-06-06T00:00:00Z",
  "updatedAt": "2026-06-06T12:00:00Z"
}
```

## Checklist de validación rápida

```
[ ] Título correcto
[ ] feature-id presente
[ ] Auditor correcto para la fase
[ ] Comandos ejecutados listados con resultado
[ ] Hallazgos con severidad
[ ] Veredicto coherente (ver verdict-rubrics.md)
[ ] Archivo guardado en docs/audits/
```

4/4 en verdict-rubrics + 7/7 aquí → reporte válido y análisis correcto.
