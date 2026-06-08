# Estándares baseline universales

Fusionar con estándares del proyecto al generar `docs/AUDIT_STANDARDS.md`. Los auditores deben aplicar **baseline + proyecto**.

## Fase 0 — Scope

| Estándar | Criterio |
|----------|----------|
| Problema observable | Hay síntoma o necesidad medible, no solo "sería bueno" |
| Alcance acotado | IN/OUT explícitos, máximo 1 feature principal por ciclo |
| Premisas | Dependencias externas nombradas (APIs, servicios, hardware) |
| Aceptación | Cada criterio es verificable sí/no |

## Fase 1 — Arquitectura

| Estándar | Criterio |
|----------|----------|
| Separación de capas | UI / API / dominio / infra no mezclados |
| Contratos explícitos | Inputs/outputs de módulos definidos |
| Impacto documentado | Módulos afectados listados |
| Alternativas | Al menos una alternativa descartada con razón |

## Fase 2 — Diseño/UX

| Estándar | Criterio |
|----------|----------|
| WCAG 2.1 AA (mínimo) | Contraste, labels, foco visible en flujos críticos |
| Estados UI | loading, empty, error, success en vistas con datos |
| Consistencia | Tokens/componentes del design system del proyecto |
| Datos reales | Sin mocks en producción |

## Fase 3 — Seguridad

| Estándar | Criterio |
|----------|----------|
| OWASP Top 10 | Injection, broken auth, sensitive data exposure revisados |
| Secretos | Ningún secret en cliente, logs, ni repo |
| Dependencias | Sin CVE crítico sin mitigación |
| Least privilege | Tools/permisos mínimos necesarios |
| Errores | Sin stack traces ni datos internos al usuario final |

## Fase 4 — Código

| Estándar | Criterio |
|----------|----------|
| Convenciones del repo | Naming, imports, estructura igual al módulo vecino |
| Legibilidad | Funciones con responsabilidad única |
| Deuda | Sin duplicación bloqueante ni hacks sin ticket |
| Tipos | Sin `any` evitable en TypeScript |

## Fase 5 — Testing

| Estándar | Criterio |
|----------|----------|
| Pirámide | Unit para lógica, integración para contratos, E2E para flujos críticos |
| Casos negativos | Al menos uno por módulo nuevo |
| CI | Suite relevante pasa en pipeline |
| Determinismo | Tests no dependen de orden ni estado global |

## Fase 6 — DevEx

| Estándar | Criterio |
|----------|----------|
| Setup reproducible | README con pasos verificables |
| Scripts documentados | Cada npm script nuevo explicado |
| CI alineado | Workflow cubre lo que el contribuidor ejecuta localmente |
| Tiempo de feedback | Tests unit < 5 min en CI |

## Fase 7 — Producción

| Estándar | Criterio |
|----------|----------|
| Build limpio | Sin errores ni warnings bloqueantes |
| Smoke test | Flujo principal verificado en entorno real |
| Evidencia | Screenshots/logs guardados |
| Rollback | Deploy reversible documentado |
