# Loop State — [PROJECT_NAME]

> "El agente olvida, el repo no." — Addy Osmani

---

## Último run
- **Fecha:** YYYY-MM-DD HH:MM UTC
- **Trigger:** [schedule | event | manual]
- **Resultado:** [success | partial | failed]
- **Duración:** Xm Ys
- **Tokens:** ~Nk

## En progreso
<!-- Tareas que el loop está trabajando activamente -->
- [ ] `branch/feature-name` — descripción breve, status

## Completado hoy
<!-- PRs mergeados, features cerradas -->
- `branch/fix-name` → merged (CI green)

## Escalado a humanos
<!-- Cosas que el loop no pudo resolver solo -->
- Archivo/issue — razón del escalamiento

## Lecciones aprendidas (escribir acá, no en chat)
<!-- Lo que el agente aprendió este run que vale para el futuro -->
- YYYY-MM-DD: descubrimiento o workaround

## Stop conditions alcanzados desde última revisión
<!-- Qué condiciones de parada se activaron -->
- `/goal "all tests pass + lint clean"` achieved en commit abc123 a HH:MM UTC

---

## Template de uso

```markdown
## Último run
- **Fecha:** 2026-06-09 20:00 UTC
- **Trigger:** schedule (daily_scan)
- **Resultado:** success
- **Duración:** 3m 42s
- **Tokens:** ~45k

## En progreso
- [ ] `fix/auth-token-refresh` — tests passing locally, awaiting CI
- [ ] `feat/watchlist-export` — API done, frontend pending

## Completado hoy
- `fix/lint-errors-june-9` → merged (CI green)
- `chore/bump-deps` → merged

## Escalado a humanos
- `src/billing/refund.ts` — tests failing in 3 ways, root cause unclear

## Lecciones aprendidas
- 2026-06-09: PowerShell hits TLS 1.2 issue on Windows runner. Use bash.
- 2026-06-08: tests/e2e/checkout requires Stripe webhook secret in env.
```

---

## Reglas

1. **Actualizar después de cada run** — no opcional
2. **Lecciones van acá, no en chat** — persisten entre sesiones
3. **Escalados requieren humano** — no reintentar automáticamente
4. **Limpiar semanalmente** — mover completados a archivo
