# Checklists lifecycle — agent-manager-template

## Fase 0 — Scope (lifecycle-scope-auditor)

- [ ] Problema definido y medible
- [ ] Alcance IN/OUT documentado
- [ ] Criterios de aceptación verificables
- [ ] .claude/context.md y domain.md revisados

## Fase 1 — Arquitectura (lifecycle-architecture-auditor)

- [ ] Capas respetadas según architecture.md
- [ ] Contratos entre módulos claros
- [ ] Impacto documentado

## Fase 2 — Diseño (lifecycle-design-auditor)

- [ ] `npm run build` pasa (si hay UI)
- [ ] Estados loading/empty/error
- [ ] A11y básica en flujos tocados

## Fase 3 — Seguridad (lifecycle-security-auditor)

- [ ] Sin secretos hardcodeados
- [ ] `npm audit` sin críticos sin mitigación
- [ ] `.claude/rules/security.md` cumplido
- [ ] `.env` no commiteado

## Fase 4 — Código (lifecycle-code-auditor)

- [ ] Convenciones del repo
- [ ] Sin duplicación bloqueante
- [ ] `npm run lint` si aplica

## Fase 5 — Testing (lifecycle-test-auditor)

- [ ] `npm test` pasa
- [ ] Tests para lógica nueva
- [ ] Casos negativos

## Fase 6 — DevEx (lifecycle-devex-auditor)

- [ ] README / context.md actualizados
- [ ] Scripts npm documentados
- [ ] CI alineado

## Fase 7 — Producción (lifecycle-production-auditor)

- [ ] Fases 0-6 APROBADO
- [ ] `npm run build` + `npm test` OK
- [ ] Smoke test si aplica
- [ ] VEREDICTO: GO / NO-GO

## Comandos

| Comando | Uso |
|---------|-----|
| `npm test` | Tests |
| `npm run build` | Build |
| `npm audit` | Seguridad deps |
