---
name: skill-mattpocock-cycle
description: Obligatorio al iniciar cualquier tarea o feature. Carga el mapa de skills mattpocock/skills por fase del pipeline y exige leer cada SKILL.md indicado antes de planificar o codificar. Usar siempre en /plan, nuevas features, bugfixes no triviales y trabajo con pipeline-state.json.
---

# Skill: Ciclo mattpocock (obligatorio)

## Cuándo usar

- Al empezar **cualquier** tarea nueva en este repo.
- Antes de `/plan`, `/domain`, `/architect`, `/test`, `/review`.
- Cuando `orchestration.md` o el usuario exija el pipeline de 7 fases.

## Proceso (hacer en orden)

1. Confirmá que existen `.agents/skills/` y `docs/agents/`. Si faltan: `pnpm run skills:install`.
2. Leé `.claude/rules/mattpocock-task-cycle.md` completo.
3. Leé `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`.
4. Según el tipo de tarea, abrí y seguí **cada** skill listado en la tabla de esa regla (archivos en `.agents/skills/<nombre>/SKILL.md`).
5. Al terminar la fase, documentá `SKILLS_USED` en el checkpoint (Regla 10 / 12).

## Mapa rápido

| Momento | Skills |
| ------- | ------ |
| Arranque | `zoom-out`, `grill-with-docs`, `to-prd`, `triage` |
| Diseño | `prototype`, `grill-with-docs` |
| Backend | `improve-codebase-architecture`, `tdd` |
| Implementación | `tdd`, `review` |
| Bugs | `diagnose` |
| Cierre de sesión | `handoff` |

## No confundir con

- Skills del template en `.claude/skills/skill-*` (complementan, no reemplazan).
- Plugin `ralph-loop` (bucle automático opcional; no es este ciclo).
