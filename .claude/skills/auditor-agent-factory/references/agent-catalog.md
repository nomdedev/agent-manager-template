# Catálogo de agentes auditores

7 auditores + 1 orquestador. Cada uno sigue el formato de [agent-development](https://github.com/anthropics/claude-code).

## scope-auditor

| Campo | Valor |
|-------|-------|
| Fase | 0 Intake |
| Color | `blue` |
| Tools | `Read`, `Grep`, `Glob` |
| Model | `inherit` |

**Audita:** requisitos, alcance IN/OUT, premisas, criterios de éxito, dependencias externas, riesgos de scope creep.

**No audita:** implementación, código, seguridad técnica.

## architecture-auditor

| Campo | Valor |
|-------|-------|
| Fase | 1 Arquitectura |
| Color | `cyan` |
| Tools | `Read`, `Grep`, `Glob` |
| Model | `inherit` |

**Audita:** capas, patrones, contratos API, acoplamiento, impacto en módulos existentes, decisiones documentadas.

**No audita:** estilos visuales, vulnerabilidades OWASP (eso es security-auditor).

## design-auditor (condicional)

| Campo | Valor |
|-------|-------|
| Fase | 2 Diseño/UX |
| Color | `magenta` |
| Tools | `Read`, `Grep`, `Glob` |
| Model | `inherit` |

**Incluir si:** hay `dashboard/`, `src/components/`, `pages/`, o UI framework.

**Audita:** consistencia visual, tokens, a11y, responsive, estados vacíos/error/loading.

## security-auditor

| Campo | Valor |
|-------|-------|
| Fase | 3 Seguridad |
| Color | `red` |
| Tools | `Read`, `Grep`, `Glob`, `Bash` |
| Model | `inherit` |

**Audita:** secretos, auth, input validation, dependencias (`npm audit`), perfiles de seguridad, CORS, injection, supply chain.

**Veredicto:** BLOQUEADO si hay hallazgo crítico sin mitigación documentada.

## code-auditor

| Campo | Valor |
|-------|-------|
| Fase | 4 Implementación |
| Color | `green` |
| Tools | `Read`, `Grep`, `Glob` |
| Model | `inherit` |

**Audita:** convenciones del proyecto, naming, imports, complejidad, duplicación, deuda técnica bloqueante.

**No audita:** estrategia de negocio (scope-auditor) ni vulnerabilidades (security-auditor).

## test-auditor

| Campo | Valor |
|-------|-------|
| Fase | 5 Testing |
| Color | `yellow` |
| Tools | `Read`, `Bash`, `Grep` |
| Model | `inherit` |

**Audita:** plan de pruebas, tests unitarios/integración/e2e, casos negativos, suite sin skip, cobertura documentada.

**Ejecuta:** comandos de test del proyecto (`npm test`, `npm run test:unit`, etc.).

## devex-auditor (condicional)

| Campo | Valor |
|-------|-------|
| Fase | 6 DevEx |
| Color | `cyan` |
| Tools | `Read`, `Grep`, `Glob`, `Bash` |
| Model | `inherit` |

**Incluir si:** hay CI, CLI publicable, o documentación de onboarding compleja.

**Audita:** scripts npm, CI workflows, README/AGENTS.md actualizados, tiempo de setup, errores de DX.

## production-auditor

| Campo | Valor |
|-------|-------|
| Fase | 7 Producción |
| Color | `red` |
| Tools | `Read`, `Bash`, `Grep` (+ browser si hay UI) |
| Model | `inherit` |

**Audita:** build, deploy, performance básica, evidencia visual, console sin errores, smoke tests.

**Veredicto:** GO o NO-GO (no APROBADO).

## project-orchestrator (skill, no agent .md)

Generado como `.claude/skills/project-orchestrator/SKILL.md`. Coordina fases, verifica gates, maneja rebotes.

## Placeholders para templates

Al generar, rellenar en `agent-base.md.tmpl`:

| Placeholder | Fuente |
|-------------|--------|
| `{{PROJECT_NAME}}` | package.json name o README |
| `{{PROJECT_STANDARDS}}` | AGENTS.md, CLAUDE.md |
| `{{VERIFICATION_COMMANDS}}` | package.json scripts |
| `{{STACK_SPECIFIC_CHECKS}}` | stack-profiles.md + discovery |
| `{{DESCRIPTION_WITH_EXAMPLES}}` | 2-3 blocks `<example>` contextualizados |
