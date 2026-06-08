# Estándares de auditoría — agent-manager-template

Fuente única para auditores lifecycle. Fusiona baseline universal + reglas del proyecto.  
Actualizar cuando cambien `.claude/context.md`, CI o reglas de seguridad.

**Stack:** Node.js + TypeScript  
**Generado:** 2026-06-06

## Cómo usar

1. Skill `audit-pipeline` — workflow de ejecución
2. Esta sección por disciplina — estándares
3. `lifecycle-orchestrator/references/checklists.md` — ítems verificables
4. Agente `lifecycle-*-auditor` — proceso y comandos

> El **pipeline de equipos** (7 fases, `.claude/rules/orchestration.md`) y el **pipeline lifecycle** (8 fases, esta skill) son **complementarios**.

---

## Fase 0 — Scope

- Problema medible, alcance IN/OUT, criterios verificables
- Ver `.claude/context.md` y `.claude/rules/domain.md`

## Fase 1 — Arquitectura

- Capas separadas, contratos explícitos
- Ver `.claude/architecture.md`

## Fase 2 — Diseño/UX

- Estados loading/empty/error, a11y básica
- Build frontend: `npm run build`

## Fase 3 — Seguridad

- OWASP, sin secretos en cliente, `npm audit`
- Ver `.claude/rules/security.md` (obligatorio)

## Fase 4 — Código

- Convenciones del repo, sin deuda bloqueante
- Ver convenciones en context.md / Obsidian si aplica

## Fase 5 — Testing

- `npm test` debe pasar
- Casos negativos para lógica nueva
- Ver `.claude/rules/` y skill-testing

## Fase 6 — DevEx

- README, context.md, scripts npm documentados
- CI alineado con tests locales

## Fase 7 — Producción

- `npm run build` + `npm test` antes de GO
- Fases 0-6 APROBADO
- Veredicto: **GO / NO-GO**

---

## Comandos de referencia

| Disciplina | Comando |
|------------|---------|
| Design/Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` |
| Security | `npm audit` |
