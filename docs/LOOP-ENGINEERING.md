# Loop Engineering — Spec

> "El apalancamiento se movió. De escribir prompts a diseñar sistemas que promptean por vos."
> Fuente: @0xCodez, basado en Anthropic engineering docs + Addy Osmani

---

## ¿Qué es Loop Engineering?

Loop Engineering es construir un sistema chico que:
1. **Encuentra el trabajo** (scan, schedule, event)
2. **Se lo da al agente** (prompt automatizado)
3. **Chequea el resultado** (gate objetivo)
4. **Registra qué pasó** (state file)
5. **Decide el siguiente paso** (loop o stop)

Vos diseñás ese sistema una vez. El sistema promptea al agente de ahí en adelante.

---

## Test de 4 Condiciones (Antes de construir nada)

Un loop justifica su costo bajo estas 4 condiciones. Fallá una y el loop cuesta más de lo que devuelve.

| # | Condición | Pregunta |
|---|-----------|----------|
| 1 | **La tarea se repite** | ¿Ocurre al menos semanalmente? |
| 2 | **Verificación automatizada** | ¿Un test/linter/build/type-check puede rechazar mal output? |
| 3 | **Budget de tokens aguanta** | ¿Podés absorber reintentos y re-lecturas de contexto? |
| 4 | **El agente tiene herramientas de senior** | ¿Puede correr código, ver logs, reproducir bugs? |

**Si fallás alguna → usá un prompt manual. No todo necesita ser un loop.**

---

## Los 5 Building Blocks

### 1. Automatizaciones (el latido)
- **Schedule**: cron job, `/loop 30m`, intervalo fijo
- **Evento**: webhook, PR abierto, CI falla, commit
- **Trigger**: condición de estado (test roto, deuda acumulada)

### 2. Worktrees (paralelo sin caos)
- Git worktrees para aislar trabajo paralelo
- Cada agente en su propia rama/worktree
- Merge solo cuando el gate pasa

### 3. Skills (contexto que no se recalcula)
- `SKILL.md` que guarda contexto del proyecto
- El agente no re-deriva el contexto cada run
- Ya implementado en `.agents/skills/`

### 4. Verifier (maker ≠ checker)
- El agente que escribe NO es el que califica
- Un modelo/verificador separado aprueba o rechaza
- Gate objetivo: test pass, build OK, lint clean, type check

### 5. State File (memoria persistente)
- `STATE.md` en el repo o sistema externo (Linear, GitHub Issues)
- "El agente olvida, el repo no"
- Cada run retoma en vez de reiniciar

---

## Minimum Viable Loop (4 piezas)

```
┌─────────────────────────────────────────────────┐
│  1. AUTOMATION  ─→  dispara el loop             │
│  2. SKILL       ─→  contexto del proyecto       │
│  3. STATE FILE  ─→  qué está hecho, qué falta   │
│  4. GATE         ─→  test/build/lint/type check  │
└─────────────────────────────────────────────────┘
```

**Orden importa:**
1. Hacé un run manual confiable
2. Convertilo en skill
3. Wrappealo en loop
4. Schedulealo

**Métrica clave:** costo por cambio aceptado. Si accepted-change rate < 50%, el loop está perdiendo.

---

## El 30-Second Loop Check

Antes de convertir una tarea en loop, pasá este checklist:

- [ ] La tarea ocurre al menos semanalmente
- [ ] Un test, type check, build o linter puede rechazar mal output
- [ ] El agente puede correr el código que cambia
- [ ] El loop tiene hard stop (token budget, iteraciones, tiempo)
- [ ] Un humano revisa antes de merge/deploy/dependency changes

**Fallá un box → mantenelo como prompt manual.**

---

## Good First Loops

| Loop | Frecuencia | Gate |
|------|-----------|------|
| CI failure triage | Nocturno | Clasificar causas, draft fix PRs |
| Dependency bump PRs | Semanal | Test compatibilidad, abrir PRs |
| Lint-and-fix passes | Por PR | Aplicar style fixes automáticos |
| Flaky test reproduction | On-demand | Loop hasta que teoría sobreviva el test |
| Issue-to-PR drafts | On-demand | Test suite rechaza bad output |

## Bad First Loops (necesitan humano)

- Architecture rewrites
- Auth o payments code
- Production deploys
- Vague product work
- Cualquier cosa donde "done" es un juicio subjetivo

---

## Integración con el Template

Este template ya tiene:
- ✅ **Skills** → `.agents/skills/`
- ✅ **Gates** → Pipeline de 7 fases con verificadores
- ✅ **Pipeline** → `.agents/orchestrator/PIPELINE.md`

Loop Engineering agrega:
- 🆕 **State File** → `STATE.md` (template abajo)
- 🆕 **Vision File** → `VISION.md` (template abajo)
- 🆕 **Automation patterns** → Hermes cron + `/loop` + `/goal`
- 🆕 **Verifier separation** → Maker-checker split en gates
- 🆕 **Anti-patterns** → `docs/ANTI-PATTERNS.md`
- 🆕 **Loop Gates** → `docs/LOOP-GATES.md`

---

## Referencias

- [Addy Osmani — Loop Engineering](https://addyosmani.com)
- [Anthropic Engineering Docs](https://docs.anthropic.com)
- [AlphaSignal Analysis](https://alphasignal.ai)
- Geoffrey Huntley — "Ralph Wiggum Loop" failure mode
