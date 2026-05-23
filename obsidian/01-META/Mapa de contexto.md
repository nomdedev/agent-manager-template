# Mapa de Contexto

Sistema de compresion de contexto para optimizar tokens en cada sesion.

## Niveles de contexto

| Nivel | Contenido | Tokens aprox | Cuando usar |
|-------|-----------|-------------|-------------|
| L0 — Micro | Solo la tarea actual + convenciones | ~500 | Fixes rapidos, typos |
| L1 — Task | Tarea + estandares + modulo afectado | ~1,500 | Features pequenas, refactors |
| L2 — Feature | Feature completa + pipeline + ADRs | ~3,000 | Features medianas, nuevos endpoints |
| L3 — Project | Todo el proyecto + historial + roadmap | ~6,000 | Features grandes, decisiones arquitectonicas |
| L4 — Full | Vault completo + analisis + deployment | ~10,000 | Auditorias, onboarding, revisiones |

## Reglas de compresion

1. **Siempre empezar por L0**, escalar solo si es necesario
2. **Links en lugar de contenido**: `[[ADR-001]]` en vez de copiar la decision
3. **Tablas resumen**: Una tabla vale mas que 5 parrafos
4. **Estado binario**: ✅ ❌ ⏳ en vez de frases completas
5. **Eliminar lo obvio**: No documentar "usamos Node.js" en cada nota

## Contexto por defecto (L1) para tareas normales

```
[01-META/Reglas para agentes] +
[03-Estandares/Stack tecnologico] +
[03-Estandares/Convenciones de codigo] +
[04-Contexto/Resumen del proyecto] +
[Modulo afectado]
```

## Como determinar el nivel

- **Fix de bug**: L0 + modulo afectado
- **Nueva feature**: L2 (necesita pipeline)
- **Refactor arquitectonico**: L3 (necesita ADRs)
- **Auditoria completa**: L4
