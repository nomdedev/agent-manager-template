# CLAUDE.md — 12-Rule Standard (Agent Manager Template)

These rules apply to every task in this project unless explicitly overridden.
**Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.**

---

## Rule 1 — Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

**Checklist before writing any code:**
- [ ] Do I understand the full requirement?
- [ ] Have I identified edge cases?
- [ ] Do I know which files will be affected?
- [ ] Is there an existing pattern I should follow?

---

## Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.

**Test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

Anti-patterns to avoid:
- Premature generalization
- Unnecessary interfaces for single implementations
- Helper functions used only once
- Comments explaining what the code does (name things instead)

---

## Rule 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

**Before editing any file:** read it fully. Understand why it's structured that way.

---

## Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Don't follow steps blindly. Define success and iterate.
Strong success criteria let you loop independently.

**Template for every task:**
```
GOAL: <what done looks like>
CRITERIA: <how to verify it>
APPROACH: <steps, not more than 5>
RISKS: <what could go wrong>
```

---

## Rule 5 — Use the Model Only for Judgment Calls

Use me for: classification, drafting, summarization, extraction, ambiguity resolution.
Do NOT use me for: routing, retries, deterministic transforms, data that can be queried.

**If code can answer it → code answers it.**

---

## Rule 6 — Token Budgets Are Not Advisory

| Scope       | Limit        |
|-------------|-------------|
| Per task    | 4,000 tokens |
| Per session | 30,000 tokens |

If approaching budget: summarize and start fresh.
**Surface the breach. Do not silently overrun.**

Signs you're over-spending:
- Repeating context already established
- Writing boilerplate that could be templated
- Explaining rather than doing

---

## Rule 7 — Surface Conflicts, Don't Average Them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
**Do not blend conflicting patterns.**

When you find a conflict:
1. Name both patterns explicitly
2. State which one you're following and why
3. Create a TODO comment for the deprecated pattern

---

## Rule 8 — Read Before You Write

Before adding code, read: exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

**Mandatory reads before any new file:**
- The directory's index/barrel file
- Files that import from the same directory
- Any shared types this code will use

---

## Rule 9 — Tests Verify Intent, Not Just Behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

**Test naming convention:**
```
it('should <expected behavior> when <condition>', ...)
// NOT: it('works', ...)
// NOT: it('test add function', ...)
```

Every test must have:
- A clear business-language description
- At least one negative case
- Assertion that fails if the logic is removed

---

## Rule 10 — Checkpoint After Every Significant Step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
**If you lose track, stop and restate.**

**Checkpoint format:**
```
✅ DONE: <list of completed items>
✔️ VERIFIED: <how each was confirmed>
⏳ NEXT: <immediate next step>
⚠️ RISKS: <open concerns>
```

---

## Rule 11 — Match the Codebase's Conventions, Even If You Disagree

Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. **Don't fork silently.**

How to raise a convention concern:
1. Finish the current task using the existing convention
2. Add a `CONVENTION_ISSUE.md` note with your concern
3. Wait for team alignment before changing

---

## Rule 12 — Fail Loud

"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
**Default to surfacing uncertainty, not hiding it.**

Banned phrases without proof:
- "Tests pass" → show the test output
- "Done" → show what was verified
- "Should work" → run it and confirm

---

## Vault de Obsidian (cerebro del proyecto)

Este proyecto usa un vault de Obsidian en `obsidian/` como memoria extendida.
**Al iniciar cada sesion, leer obligatoriamente:**
1. `obsidian/00-README.md`
2. `obsidian/01-Agentes/Reglas para agentes.md`
3. `obsidian/02-Estandares/Stack tecnologico.md` y `obsidian/02-Estandares/Convenciones de codigo.md`

El vault contiene el detalle de arquitectura, analisis, testing y deployments.
Estas notas tienen prioridad sobre cualquier suposicion general.

## Descripción
Template reutilizable de Agent Manager para Claude Code. Contiene toda la configuración, hooks, MCPs, skills y documentación necesaria para inicializar CUALQUIER proyecto de software de forma profesional. Incluye un ejemplo funcional de AI Agent con Node.js + TypeScript.

## Objetivo
- Proveer una base configurable para proyectos nuevos
- Automatizar la configuración de Claude Code (hooks, MCPs, skills)
- Garantizar estándares de calidad y seguridad desde el día 1
- Servir como referencia de mejores prácticas

## Stack Tecnológico del Ejemplo
- **Runtime:** Node.js 20+
- **Lenguaje:** TypeScript 5.x
- **Framework:** Fastify (API) / extensible a otros
- **Testing:** Vitest (unit) + Supertest (integration) + Playwright (e2e)
- **Linter:** ESLint + Prettier
- **Deploy:** Vercel
- **AI:** OpenAI SDK / Anthropic SDK

## Comandos Esenciales
```bash
npm install          # Instalar dependencias
npm run dev          # Iniciar desarrollo con hot-reload
npm run build        # Compilar TypeScript a dist/
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Ejecutar ESLint con auto-fix
npm run format       # Formatear con Prettier
npm test             # Ejecutar todos los tests
npm run test:unit    # Solo tests unitarios
npm run test:int     # Solo tests de integración
npm run test:e2e     # Solo tests e2e
npm run test:watch   # Tests en modo watch
```

## Estructura de Carpetas
```
agent-manager-template/
├── opencode.json         # Bridge config para OpenCode (referencia todo en .claude/)
├── .opencode/            # Fallback mínimo para OpenCode
│   ├── README.md
│   └── plugins/          # Plugins nativos OpenCode
├── .claude/              # FUENTE DE VERDAD — toda la config vive aquí
│   ├── CLAUDE.md         # Este archivo
│   ├── settings.json     # Permisos, hooks, MCPs, env vars
│   ├── context.md        # Contexto rápido
│   ├── architecture.md   # Arquitectura del sistema
│   ├── agents/           # 7 agentes especializados
│   │   ├── architect.md
│   │   ├── domain-expert.md
│   │   ├── frontend-expert.md
│   │   ├── reviewer.md
│   │   ├── security-auditor.md
│   │   ├── tester.md
│   │   └── orchestrator.md
│   ├── commands/         # 12 comandos slash
│   │   ├── audit.md      # /audit — auditoría completa
│   │   ├── security.md   # /security — OWASP Top 10
│   │   ├── test.md       # /test — tests con coverage
│   │   ├── review.md     # /review — code review
│   │   ├── architect.md  # /architect — propuesta arquitectónica
│   │   ├── plan.md       # /plan — planificación
│   │   ├── deploy.md     # /deploy — deploy a producción
│   │   ├── checkpoint.md # /checkpoint — checkpoint de sesión
│   │   ├── handoff.md    # /handoff — documento de traspaso
│   │   ├── flows.md      # /flows — diagrama de flujo de datos HTML
│   │   ├── domain.md     # /domain — validación de dominio
│   │   └── frontend.md   # /frontend — checklist e implementación frontend
│   ├── hooks/            # 11 hooks de seguridad y calidad
│   │   ├── PreToolUse/   # 5 hooks (dangerous bash, token budget, security scan, git guard, pipeline guard)
│   │   ├── PostToolUse/  # 4 hooks (checkpoint, lint-on-edit, test-on-change, flow-stale-detector)
│   │   ├── PreCompact/   # 1 hook (session summarizer)
│   │   └── Notification/ # 1 hook (task notifier)
│   ├── rules/            # Reglas del proyecto
│   │   ├── security.md       # Reglas de seguridad y OWASP
│   │   ├── orchestration.md  # Pipeline de 7 fases por equipos
│   │   ├── domain.md         # Terminología de dominio y datos sensibles
│   │   ├── frontend.md       # Tokens de color, estructura, estado, íconos
│   │   └── html-first.md     # HTML sobre Markdown para outputs de agentes
│   ├── skills/           # 10 skills especializados
│   │   ├── skill-agent-design/
│   │   ├── skill-api-design/
│   │   ├── skill-code-review/
│   │   ├── skill-debugging/
│   │   ├── skill-documentation/
│   │   ├── skill-git-workflow/
│   │   ├── skill-hermes-levels/   # configurar Hermes Agent en 4 niveles
│   │   ├── skill-html-artifacts/  # HTML specs, audits, flows, reviews
│   │   ├── skill-refactoring/
│   │   └── skill-testing/
│   └── logs/             # Audit trail y pipeline state
│       ├── pipeline-state.json  # Estado del pipeline de features
│       ├── audit.log            # Log persistente de seguridad
│       ├── audits/              # Reportes de auditoría
│       │   ├── features/        # Reportes por feature (pipeline)
│       │   ├── security/        # Reportes de seguridad standalone
│       │   └── templates/       # Plantillas de auditoría
│       ├── checkpoints/         # Checkpoints de sesión
│       └── handoffs/            # Documentos de traspaso
├── src/
│   ├── index.ts       # Punto de entrada
│   ├── config/        # Configuración de la app
│   ├── agents/        # Definición de agentes AI
│   ├── tools/         # Herramientas disponibles para agentes
│   ├── middleware/     # Middleware de la aplicación
│   ├── routes/        # Rutas/endpoints
│   ├── services/      # Lógica de negocio
│   ├── utils/         # Utilidades compartidas
│   └── types/         # Tipos TypeScript compartidos
├── tests/
│   ├── unit/          # Tests unitarios
│   ├── integration/   # Tests de integración
│   └── e2e/           # Tests end-to-end
├── docs/              # Documentación del proyecto
├── .env.example       # Variables de entorno (template)
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Harness Engineering — Pipeline de 7 Fases

Todo feature/bugfix/refactor DEBE pasar por el pipeline definido en `.claude/rules/orchestration.md`:

| Fase | Equipo | Agente(s) | Gate de salida |
|------|--------|-----------|----------------|
| 1. Dominio e Idea | Diseño | domain-expert | Requerimientos validados |
| 2. Arquitectura | Diseño | architect + developer | Diseño aprobado, interfaces definidas |
| 3. Backend | Backend | architect + orquestador | API routes, schema consistente |
| 4. Seguridad | Seguridad | security-auditor | Sin hallazgos CRÍTICOS/ALTOS sin mitigación |
| 5. Develop | Develop | developer + reviewer | Build exitoso, code review OK |
| 6. QA | QA | tester | Tests pasando, cobertura documentada |
| 7. Producción | Producción | orquestador | Verificación real con datos, GO/NO-GO |

Ver `.claude/rules/orchestration.md` para el detalle completo de cada fase, checklists y reglas de rebote.

## Hooks de Seguridad

Los hooks bloquean automáticamente operaciones peligrosas:
- **PreToolUse**: bash peligroso, budget de tokens, security scan en writes, git push guard, pipeline phase guard
- **PostToolUse**: auto-checkpoint, lint-on-edit, test-on-change
- **PreCompact**: session summarizer (preserva contexto)
- **Notification**: task notifier

Ver `.claude/rules/security.md` para la tabla completa de patrones bloqueados.

## HTML-First para Outputs de Agentes

Todo artefacto producido por un agente (spec, reporte de auditoría, code review, diagrama de flujo, dashboard) DEBE ser HTML, no Markdown.
Ver `.claude/rules/html-first.md` para la regla completa, estructura obligatoria y anti-patterns.

Guardar artefactos en:
- `docs/flows/` — diagramas de flujo de datos
- `docs/specs/` — specs de feature, decisiones de arquitectura
- `docs/audits/` — reportes de fases del pipeline
- `docs/reviews/` — reportes de code review

Usar `skill-html-artifacts` para generar el HTML base.

## Convenciones de Código
- **Nomenclatura:** camelCase para variables/funciones, PascalCase para clases/interfaces/types, kebab-case para archivos
- **Imports:** Usar path aliases (`@/`) configurados en tsconfig.json
- **Errores:** Usar clases custom de error extendiendo Error
- **Async:** Preferir async/await sobre .then().catch()
- **Tipos:** Sin `any` — usar `unknown` y type guards cuando el tipo es incierto
- **Exports:** Preferir named exports sobre default exports
- **Comentarios:** Solo para lógica no obvia; el código debe ser auto-explicativo

## Reglas de Negocio
1. Nunca exponer claves API o secrets en el código fuente
2. Todos los endpoints deben tener validación de input con schemas (Zod)
3. Los agentes AI nunca deben ejecutar comandos sin validación previa
4. Rate limiting obligatorio en endpoints públicos
5. Logging estructurado en todos los servicios (formato JSON)

## Archivos Sensibles (NO modificar sin confirmación)
- `.env` / `.env.production`
- `package-lock.json`
- `tsconfig.json` (cambios pueden romper toda la build)
- `.claude/settings.json` (cambios afectan comportamiento del agente)
- Cualquier archivo en `src/config/`

## Flujo de Trabajo
1. Crear branch desde `main`: `feat/<feature-name>` o `fix/<bug-name>`
2. Desarrollar con tests
3. Self-review antes de PR
4. Merge a main via squash-merge
