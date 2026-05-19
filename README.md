# Agent Manager Template

> Setup profesional de Claude Code listo para usar: pipeline de 7 fases, 7 agentes especializados, 12 comandos slash, 11 hooks de seguridad, 10 skills — instalable en cualquier proyecto con un solo comando CLI.

---

## Tabla de contenidos

- [Que es esto](#que-es-esto)
- [Inicio rapido con el CLI](#inicio-rapido-con-el-cli)
- [CLI claudio — referencia completa](#cli-claudio--referencia-completa)
- [Los 4 niveles de Hermes Agent](#los-4-niveles-de-hermes-agent)
- [Metodologia: el pipeline de 7 fases](#metodologia-el-pipeline-de-7-fases)
- [Los 7 agentes especializados](#los-7-agentes-especializados)
- [Los 12 comandos slash](#los-12-comandos-slash)
- [Los 11 hooks de seguridad y calidad](#los-11-hooks-de-seguridad-y-calidad)
- [Los 10 skills especializados](#los-10-skills-especializados)
- [Las 5 reglas del proyecto](#las-5-reglas-del-proyecto)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Stack tecnologico](#stack-tecnologico)
- [Comandos de desarrollo](#comandos-de-desarrollo)
- [Adaptarlo a tu proyecto](#adaptarlo-a-tu-proyecto)

---

## Que es esto

**Agent Manager Template** es un sistema de ingenieria asistida por IA para Claude Code. No es solo una estructura de carpetas: es una **metodologia completa** que define como un equipo de agentes especializados colabora para entregar software de calidad.

La idea central es simple: en lugar de que Claude Code sea un asistente general que hace todo, este template lo convierte en un **equipo de especialistas con roles definidos**, que trabajan bajo un pipeline secuencial con gates de calidad. Cada feature pasa por 7 fases obligatorias antes de llegar a produccion.

**Que incluye:**
- CLI `claudio` para instalar el setup completo en cualquier proyecto con un wizard interactivo
- Pipeline de 7 fases con gates de salida verificables
- 7 agentes especializados con permisos y protocolos definidos
- 12 comandos slash para tareas frecuentes (`/audit`, `/security`, `/test`, `/review`, etc.)
- 11 hooks que bloquean automaticamente operaciones peligrosas
- 10 skills con conocimiento especializado cargable on-demand
- Vault de Obsidian como memoria extendida del proyecto
- Integracion con Hermes Agent para Knowledge Management personal

---

## Inicio rapido con el CLI

### Prerequisitos

- Node.js 20+
- pnpm (recomendado) o npm
- Claude Code instalado

### Instalar y usar en tu proyecto

```bash
# Opcion A: instalar globalmente
npm install -g agent-manager-template
claudio evoluciona ./mi-proyecto

# Opcion B: clonar y usar desde el template
git clone https://github.com/nomdedev/agent-manager-template
cd agent-manager-template
pnpm install
pnpm run claudio evoluciona ./mi-proyecto
```

El wizard `evoluciona` instala de forma interactiva:

1. El directorio `.claude/` completo (agentes, comandos, hooks, skills, reglas)
2. Opcionalmente: vault de Obsidian en `obsidian/` (memoria extendida del proyecto)
3. Opcionalmente: configuracion de Hermes MCP server (HTTP/SSE o stdio)

### Flujo recomendado completo

```bash
# 1. Instalar el setup en tu proyecto
claudio evoluciona ./mi-nuevo-proyecto

# 2. Instalar Hermes Agent (knowledge base personal)
claudio hermes install

# 3. Inicializar Hermes con tu perfil
claudio hermes init programmer

# 4. Sincronizar tu vault de Obsidian → Hermes memory
claudio hermes optimize ./mi-nuevo-proyecto

# 5. Usar Hermes con contexto completo
hermes
```

---

## CLI claudio — referencia completa

### `claudio evoluciona [target-dir]`

Instala el setup completo de Claude Code en un proyecto. Si no se especifica `target-dir`, el wizard pregunta interactivamente.

```
claudio evoluciona
claudio evoluciona ./mi-proyecto
claudio evoluciona /ruta/absoluta/al/proyecto
```

El wizard copia:
- `.claude/agents/` — los 7 agentes especializados
- `.claude/commands/` — los 12 comandos slash
- `.claude/hooks/` — los 11 hooks de seguridad y calidad
- `.claude/skills/` — los 10 skills especializados
- `.claude/rules/` — las 5 reglas del proyecto
- `.claude/CLAUDE.md` — las 12 reglas de comportamiento del agente
- `.claude/logs/pipeline-state.json` — estado del pipeline

### `claudio hermes <subcomando>`

Gestion de Hermes Agent con Obsidian como knowledge database.

| Subcomando | Descripcion |
|---|---|
| `install` | Instala Hermes Agent en el sistema |
| `init [perfil]` | Crea `~/.hermes/` con `SOUL.md` + memoria inicial. Perfiles: `programmer`, `writer`, `researcher` |
| `optimize [ruta]` | Sincroniza Obsidian vault → `MEMORY.md` + skills de Hermes |
| `status` | Estado de `~/.hermes/` y sus componentes |
| `gepa` | Instrucciones para optimizar skills del agente con GEPA (auto-evolucion) |

### Opciones globales

```
claudio --help      Muestra la ayuda
claudio --version   Muestra la version instalada
```

---

## Los 4 niveles de Hermes Agent

Hermes Agent escala en 4 niveles de madurez progresivos. Cada nivel tiene un patron de comunicacion diferente, mayor grado de autonomia, y mayor riesgo si el workflow no esta bien probado. **Empieza en Nivel 1 y avanza solo cuando el nivel anterior es solido.**

> "Take small steps. Do not automate slop. Fewer agents with better output beats MAXXING."

---

### Nivel 1 — Main Agent: tu banco de prototipado

```
You ──────────────→ Hermes Agent
```

Tu agente principal. Funciona tambien como orquestador hasta que tengas un workflow lo suficientemente solido para convertirlo en su propio agente especializado.

**Cuándo usarlo:**
- Prototipado de nuevos flujos (outbound, SEO, contenido, etc.)
- Testing de un metodo antes de darle su propio agente
- Drafting de campaign briefs y stress-testing del angulo
- Trabajo de asistente personal: bandeja de entrada, voice memos, calendario

**Señal para subir al Nivel 2:** si ejecutas el mismo workflow mas de 3 veces, es candidato a convertirse en agente dedicado.

**Configuracion:**
```bash
claudio hermes install              # instala Hermes en el sistema
claudio hermes init programmer      # crea ~/.hermes/ con SOUL.md + memoria inicial
claudio hermes optimize ./          # sincroniza tu vault Obsidian → MEMORY.md
```

---

### Nivel 2 — Agentes especializados: acceso directo, uno por rol

```
You ──────────────→ SEO Agent
You ──────────────→ CMO Agent
You ──────────────→ Outbound Agent
You ──────────────→ Design Agent
You ──────────────→ Ops Agent
```

Una vez que un workflow es solido, se "spinnea out" en su propio agente. Cada agente recibe sus propias credenciales, memoria independiente y scope definido. Le hablas directamente mientras lo ejecutas en trabajo real.

**Ejemplos de agentes especializados:**

| Agente | Pipeline | Ejemplos de uso |
|--------|----------|-----------------|
| `hermes-seo` | keyword research → articulo publicado | 21-step pipeline editorial |
| `hermes-cmo` | posicionamiento, brand voice | campaign briefs, copy review |
| `hermes-outbound` | lead enrichment, sequence drafting | follow-ups automatizados |
| `hermes-design` | landing page builds | ad creative review |
| `hermes-ops` | VPS health, backups | security audits nocturnos |

**Cuándo pasar de Nivel 1 a Nivel 2:** cuando el workflow es repetible, tiene pasos definidos, y su scope no se solapa con otros roles.

**Configuracion:**
```bash
claudio hermes init researcher      # perfil investigador
claudio hermes init designer        # perfil diseñador
claudio hermes init custom          # identidad completamente custom
```

Cada agente especializado vive en `~/.hermes/agents/<nombre>/` con su propio `SOUL.md`, `MEMORY.md` y credenciales separadas.

---

### Nivel 3 — Equipo orquestado: el orquestador enruta el trabajo

```
You ──────────────→ Orchestrator
                         │
                         ↓
              Specialist Agents
        (SEO, CMO, Outbound, Design, Ops)
```

Se vuelve a incorporar el orquestador. Ahora dirige todo el equipo: recibe tu pedido, enruta el trabajo a los agentes correctos, sintetiza el resultado de vuelta hacia ti.

**Cuándo usarlo:** pedidos cross-functional que tocan mas de un rol. Cuando no queres decidir manualmente quien hace que parte del trabajo.

**Ejemplos:**
- `"Draft a full launch campaign"` → CMO (posicionamiento) + Design (landing) + SEO (contenido) + Outbound (secuencia)
- `"Generate this week's content slate"` → SEO (investigacion) → CMO (angulos) → Design (visuales)
- `"Audit our positioning vs competitors"` → investigacion competitiva + CMO synthesis

---

### Nivel 4 — Equipo automatizado: cron + eventos disparan el trabajo

```
Cron / Events ────→ Orchestrator
                         │
                         ↓
                    Agent Team
             (working async, you are not in the loop)
```

Se agregan listas de tareas para que el equipo trabaje de forma asincrona. Cron jobs y eventos disparan los trabajos. El equipo maneja el trabajo, archiva reportes, y solo te pinga cuando necesita criterio tuyo.

**Ejemplos de automatizacion:**

| Trigger | Agente(s) | Tarea |
|---------|-----------|-------|
| Cron: lunes 8am | `hermes-seo` | Reporte SEO semanal |
| Cron: noche | `hermes-ops` | Daily backup audit + server health check |
| Event: nuevo blog post | `hermes-cmo` + `hermes-outbound` | Atomizar en LinkedIn, X, Threads |
| Event: lead form fill | `hermes-outbound` | Qualify lead + drafting de reply |
| Cron: cada 2 horas | `hermes` (main) | Inbox triage — 4 emails que valen tu tiempo |

**Regla de Nivel 4:** antes de automatizar, el workflow debe haber pasado por Nivel 2 (probado en trabajo real) y Nivel 3 (probado como equipo orquestado). **No se automatiza slop.**

---

### Resumen: cuando usar cada nivel

| Nivel | Patron | Usalo cuando... |
|-------|--------|-----------------|
| 1 — Main Agent | `You → Hermes` | Prototipando, explorando, tarea nueva sin workflow definido |
| 2 — Especializados | `You → Agente X` | El workflow es repetible y tiene scope acotado |
| 3 — Orquestado | `You → Orquestador` | La tarea toca mas de un rol o es cross-functional |
| 4 — Automatizado | `Cron/Eventos → Equipo` | Workflow probado en Nivel 2 y 3, listo para correr solo |

---

## Metodologia: el pipeline de 7 fases

El corazon del sistema. Cada feature, bugfix o refactor **obligatoriamente** pasa por 7 fases antes de llegar a produccion. Ninguna fase se saltea. Cada fase tiene un gate de salida con veredicto `APROBADO` o `BLOQUEADO`.

```
Fase 1 → Dominio e Idea        (Equipo 1: Diseño)
Fase 2 → Arquitectura          (Equipo 1: Diseño)
Fase 3 → Backend               (Equipo 2: Backend)
Fase 4 → Seguridad             (Equipo 3: Seguridad)   ← nunca se saltea
Fase 5 → Develop & Deploy      (Equipo 4: Develop)
Fase 6 → QA / Testing          (Equipo 5: QA)           ← mission: ROMPER TODO
Fase 7 → Produccion / Go-No-Go (Equipo 6: Produccion)  ← solo el orquestador
```

### Como funciona el pipeline

**El Orquestador Principal** (no un agente de implementacion) dirige el proceso. Envia la tarea al equipo correcto, recibe el reporte, verifica el gate de salida, y autoriza (o no) el paso al siguiente equipo.

**Reglas de oro:**
1. Si un equipo devuelve `BLOQUEADO`, el pipeline se detiene. Se crea una tarea de correccion y se reinicia desde esa fase.
2. Si QA encuentra un bloqueante, el feature **no avanza a Fase 7**. Hay rebote al equipo correspondiente segun el tipo de bug.
3. El Equipo de Develop **no recibe la tarea** si Seguridad no emitio veredicto `APROBADO`.

### Rebote de QA por tipo de defecto

| Tipo de defecto | Equipo de rebote | Fase de reinicio |
|---|---|---|
| Logica de negocio incorrecta | Equipo 1 (Diseno) | Fase 2 (Arquitectura) |
| Schema/API roto | Equipo 2 (Backend) | Fase 3 (Backend) |
| Vulnerabilidad de seguridad | Equipo 3 (Seguridad) | Fase 4 (Seguridad) |
| Bug de implementacion | Equipo 4 (Develop) | Fase 5 (Develop) |

### Estado del pipeline

El estado de cada feature se registra en `.claude/logs/pipeline-state.json`. Ningun codigo llega a produccion sin que este archivo refleje `status: "GO"`.

```json
{
  "features": [
    {
      "id": "feature-slug",
      "currentPhase": 7,
      "currentTeam": "Equipo 6: Produccion",
      "status": "GO",
      "audits": [
        { "phase": 1, "verdict": "APROBADO" },
        { "phase": 4, "verdict": "APROBADO" },
        { "phase": 7, "verdict": "GO" }
      ]
    }
  ]
}
```

Ver `.claude/rules/orchestration.md` para el detalle completo de cada fase, checklists y formatos de reporte.

---

## Los 7 agentes especializados

Cada agente tiene un rol definido, permisos de filesystem limitados a su responsabilidad, y un protocolo de trabajo especifico.

### `architect`

**Rol:** Disena antes de que se escriba codigo. Define estructura, contratos publicos, interfaces TypeScript y arbol de archivos. No implementa.

**Cuándo invocarlo:** Propuesta de arquitectura, diseno de modulos, decision de patrones.

**Permisos:** Solo lectura (`find`, `cat`, `ls`, `grep`, `git`). Edicion denegada.

---

### `domain-expert`

**Rol:** Valida que la logica de negocio, terminologia, flujos y modelos de datos reflejen la realidad del dominio del proyecto. No escribe codigo — audita y aprueba o bloquea.

**Cuándo invocarlo:** Antes de disenar cualquier feature. Fase 1 del pipeline.

**Protocolo:** Lee `.claude/rules/domain.md` antes de cada tarea. Verifica: flujos de estados, terminologia del glosario, KPIs medibles, datos sensibles, alcance IN/OUT.

**Permisos:** Solo lectura.

---

### `frontend-expert`

**Rol:** Implementa componentes UI, paginas e interacciones siguiendo las convenciones del proyecto. Aplica design tokens, patrones de estado y reglas de performance.

**Cuándo invocarlo:** Tareas de UI — "implementar componente", "crear pagina", "estilizar esto".

**Protocolo:** Usa `cn()` para clases condicionales, design tokens CSS para colores, `lucide-react` para iconos, `useMemo`/`useCallback` para evitar re-renders.

---

### `reviewer`

**Rol:** Revisa codigo antes de mergear. Valida convenciones, verifica tests, detecta problemas de calidad. Protege la integridad del codebase.

**Cuándo invocarlo:** Code review antes de merge. Fase 5 del pipeline (review interno).

**Checklist:** Tipos TypeScript sin `any`, no hay `dangerouslySetInnerHTML` sin sanitizador, imports organizados, tests con casos negativos, nombre de tests describe el comportamiento.

---

### `security-auditor`

**Rol:** Audita codigo, dependencias, configuraciones y datos sensibles. Compliance OWASP Top 10. Mision: encontrar cada vulnerabilidad.

**Cuándo invocarlo:** Fase 4 del pipeline (obligatoria). También al invocar `/security`.

**Modulos de auditoria:**
- Secretos hardcodeados y credenciales
- Vulnerabilidades en dependencias (`npm audit`)
- XSS, SQL injection, eval con input externo
- Datos sensibles en localStorage/sessionStorage
- Vectores de ataque especificos del feature

**Permisos:** Solo lectura + `npm audit`.

---

### `tester`

**Rol:** Diseña planes de prueba, escribe tests y verifica cobertura. Mision: ROMPER TODO.

**Cuándo invocarlo:** Fase 6 del pipeline. También al invocar `/test`.

**Filosofia:** "Tu trabajo no es confirmar que funciona. Tu trabajo es demostrar que se puede romper."

**Cobertura obligatoria:** Happy path, estado vacio, manejo de errores, boundary values, invariantes de negocio.

**Convencion:** `it('should <comportamiento> when <condicion>', ...)`

---

### `orchestrator`

**Rol:** Dirige el pipeline de 7 fases. Envia tareas a equipos, verifica gates de salida, maneja rebotes, autoriza transiciones. No implementa codigo (salvo Fase 7).

**Cuándo invocarlo:** Para coordinar un feature completo a traves del pipeline.

---

## Los 12 comandos slash

Los comandos slash son instrucciones predefinidas invocables directamente en Claude Code con `/comando`.

| Comando | Descripcion |
|---|---|
| `/audit` | Auditoria completa del proyecto: codigo, tests, seguridad, convenciones |
| `/security [scope]` | Auditoria de seguridad OWASP Top 10. Scopes: `deps`, `code`, `secrets`, `auth`, `api`, `all` |
| `/test` | Disenar plan de pruebas, escribir tests con coverage |
| `/review` | Code review completo del diff o archivo especificado |
| `/architect` | Propuesta arquitectonica con opciones, pros/cons y decision documentada |
| `/plan` | Planificacion de una feature: fases, archivos afectados, estimacion |
| `/deploy` | Checklist y proceso de deploy a produccion |
| `/checkpoint` | Checkpoint de sesion con formato Rule 10 (DONE / VERIFIED / NEXT / RISKS) |
| `/handoff` | Genera documento de traspaso para otra sesion o agente |
| `/flows [modulo]` | Genera o actualiza visualizacion HTML del flujo de datos de un modulo |
| `/domain` | Validacion de dominio: terminologia, flujos, invariantes de negocio |
| `/frontend` | Checklist e implementacion de componentes frontend con convenciones del proyecto |

### Ejemplos de uso

```
/security secrets          → solo escanea hardcoded credentials
/flows dashboard           → genera docs/flows/dashboard-flow.html
/checkpoint                → guarda estado actual de la sesion
/handoff                   → crea .claude/logs/handoffs/handoff-{date}.md
/audit                     → auditoria completa con reporte
```

---

## Los 11 hooks de seguridad y calidad

Los hooks se ejecutan automaticamente en el ciclo de vida de Claude Code y bloquean o advierten sobre operaciones peligrosas.

### PreToolUse (antes de ejecutar una herramienta)

| Hook | Que bloquea |
|---|---|
| `01-validate-dangerous-bash.sh` | `cat .env`, `printenv`, `source .env`, `echo $SECRET` |
| `02-token-budget-guard.sh` | Advierte cuando se acerca al limite de tokens de sesion (30k) |
| `03-write-security-scan.py` | Detecta credenciales hardcodeadas, secretos en client-side env, `localStorage` con datos sensibles, SQL injection patterns |
| `04-git-push-main-guard.sh` | Bloquea `git push origin main` sin que los tests hayan pasado |
| `05-pipeline-phase-guard.py` | Verifica que el pipeline-state.json este actualizado antes de avanzar de fase |

### PostToolUse (despues de ejecutar una herramienta)

| Hook | Que hace |
|---|---|
| `01-auto-checkpoint.sh` | Guarda checkpoint automatico en `.claude/logs/checkpoints/` |
| `02-lint-on-edit.sh` | Ejecuta ESLint sobre el archivo editado |
| `03-test-on-change.sh` | Ejecuta los tests relacionados al archivo modificado |
| `04-flow-stale-detector.py` | Marca como `stale` los flows de datos afectados por el cambio |

### PreCompact (antes de comprimir el contexto)

| Hook | Que hace |
|---|---|
| `01-session-summarizer.sh` | Guarda un checkpoint de sesion con el template Rule 10 para no perder contexto |

### Notification

| Hook | Que hace |
|---|---|
| `01-task-notifier` | Notifica cuando una tarea del pipeline completa o necesita intervencion |

### Niveles de bloqueo

| Nivel | Codigo de salida | Efecto |
|---|---|---|
| CRITICAL | 2 | Bloqueo total — la operacion no se ejecuta |
| WARNING | 0 con mensaje | Aviso — la operacion continua pero queda registrada |

Para suprimir un falso positivo justificado: agregar `# claude-security-ok` al final de la linea.

---

## Los 10 skills especializados

Los skills son modulos de conocimiento especializado que se cargan on-demand cuando la tarea lo requiere.

| Skill | Cuándo se activa |
|---|---|
| `skill-agent-design` | Disenar o modificar agentes AI con tool use, memoria y system prompts |
| `skill-api-design` | Disenar APIs REST: endpoints, schemas Zod, contratos de respuesta |
| `skill-code-review` | Revision de codigo: convenciones, tipos, tests, patrones de error |
| `skill-debugging` | Diagnostico sistematico de bugs: reproduccion, hipotesis, fix, regresion |
| `skill-documentation` | Generar documentacion tecnica, JSDoc, ADRs, diagramas |
| `skill-git-workflow` | Flujo de ramas, commits convencionales, PRs, merge strategy |
| `skill-hermes-levels` | Configurar Hermes Agent en el nivel correcto (1-4): diagnostico + pasos de setup |
| `skill-html-artifacts` | Generar artefactos HTML autocontenidos para outputs de agentes |
| `skill-refactoring` | Refactoring seguro: sin cambiar comportamiento externo, con tests previos |
| `skill-testing` | Estrategias de testing: unit, integration, e2e, coverage, mocks |

### Por que HTML en lugar de Markdown para outputs de agentes

El skill `skill-html-artifacts` aplica la regla **HTML-First**: todo output que un humano va a *leer* (reportes, specs, auditorias, diagramas) se genera como HTML autocontenido, no Markdown.

**Ventajas:**
- Tablas con color, badges de severidad, secciones colapsables
- Un archivo, un link — sin tooling ni build
- Boton "copy as prompt" para feedback estructurado al agente
- Un `.md` de 200 lineas no se lee; un HTML bien estructurado se escanea en segundos

Los artefactos HTML se guardan en:
```
docs/
  flows/    ← diagramas de flujo de datos por modulo
  specs/    ← specs de feature, decisiones de arquitectura
  audits/   ← reportes de fases del pipeline
  reviews/  ← reportes de code review
```

---

## Las 5 reglas del proyecto

Los archivos en `.claude/rules/` definen el comportamiento del sistema. Claude Code los lee antes de cada tarea relevante.

### `security.md`

Define que esta **absolutamente prohibido:**
- Credenciales hardcodeadas en cualquier archivo
- Variables de entorno con secrets en el prefijo client-side (`VITE_`, `NEXT_PUBLIC_`)
- `dangerouslySetInnerHTML` sin sanitizador
- Datos sensibles en `localStorage`/`sessionStorage`
- SQL construido por concatenacion de strings

Todo valor que cambia entre entornos o es sensible va en variables de entorno.

### `orchestration.md`

Define el pipeline de 7 fases, checklists por fase, formatos de reporte, reglas de rebote y estructura del `pipeline-state.json`. Es la regla mas importante del sistema.

### `domain.md`

Template para definir el glosario del dominio del proyecto, flujos de estados de entidades, KPIs, datos sensibles e invariantes de negocio. **Completar al inicializar cada proyecto nuevo.**

### `frontend.md`

Convenciones de frontend: design tokens CSS, uso de `cn()` para clases condicionales, estructura de componentes, gestión de estado global (Zustand), iconos (`lucide-react`), performance (`useMemo`, `useCallback`), responsive.

### `html-first.md`

Define cuando usar HTML vs Markdown para outputs de agentes, estructura obligatoria de artefactos HTML (completamente autocontenidos, sin CDN externos, dark mode, status badge) y anti-patterns a evitar.

---

## Estructura del proyecto

```
agent-manager-template/
│
├── bin/
│   └── claudio.cjs            ← wrapper CJS para invocar el CLI via tsx
│
├── src/
│   ├── cli/
│   │   ├── claudio.ts         ← entry point del CLI
│   │   ├── commands/
│   │   │   ├── evoluciona.ts  ← wizard de instalacion del setup
│   │   │   └── hermes.ts      ← gestion de Hermes Agent
│   │   └── utils/
│   │       ├── installer.ts   ← utilidades de filesystem para el wizard
│   │       └── prompts.ts     ← prompts interactivos readline
│   ├── agents/                ← (ejemplo) definicion de agentes AI
│   ├── config/                ← configuracion de la app
│   ├── middleware/            ← middleware de Fastify
│   ├── routes/                ← rutas de la API REST
│   ├── services/              ← logica de negocio
│   ├── tools/                 ← tools disponibles para el agente
│   │   ├── calculator.ts
│   │   ├── datetime.ts
│   │   └── index.ts
│   ├── types/                 ← tipos TypeScript compartidos
│   └── utils/                 ← utilidades compartidas
│
├── tests/
│   ├── unit/
│   │   ├── cli/
│   │   │   ├── commands/hermes.test.ts
│   │   │   └── utils/
│   │   │       ├── installer.test.ts
│   │   │       └── prompts.test.ts
│   │   ├── services/agent-service.test.ts
│   │   └── tools/
│   │       ├── calculator.test.ts
│   │       └── datetime.test.ts
│   ├── integration/
│   │   ├── cli.test.ts        ← tests de portabilidad del CLI
│   │   └── health.test.ts
│   └── e2e/
│
├── .claude/
│   ├── CLAUDE.md              ← 12 reglas de comportamiento del agente
│   ├── settings.json          ← permisos, hooks, MCPs, env vars
│   ├── context.md             ← contexto rapido del proyecto
│   ├── architecture.md        ← arquitectura del sistema
│   ├── memory.md              ← memoria persistente del agente
│   ├── agents/                ← definiciones de los 7 agentes
│   ├── commands/              ← los 12 comandos slash
│   ├── hooks/                 ← los 11 hooks
│   ├── rules/                 ← las 5 reglas del proyecto
│   ├── skills/                ← los 10 skills
│   └── logs/
│       ├── pipeline-state.json
│       ├── audit.log
│       ├── audits/
│       │   └── features/      ← reportes por feature (una carpeta por feature-id)
│       ├── checkpoints/       ← checkpoints de sesion
│       └── handoffs/          ← documentos de traspaso
│
├── obsidian/                  ← vault de Obsidian (memoria extendida)
│   ├── 01-Agentes/
│   ├── 02-Estandares/
│   ├── 03-Contexto/
│   ├── 04-Analisis/
│   ├── 05-Testing/
│   ├── 06-Deployments/
│   └── Templates/
│
├── docs/                      ← artefactos HTML generados por los agentes
│   ├── flows/
│   ├── specs/
│   ├── audits/
│   └── reviews/
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── vercel.json
```

---

## Stack tecnologico

| Categoria | Tecnologia |
|---|---|
| Runtime | Node.js 20+ |
| Lenguaje | TypeScript 5.x (ESM) |
| Package manager | pnpm |
| Framework API | Fastify |
| Validacion | Zod |
| Testing | Vitest + Supertest |
| Coverage | v8 (threshold 80%) |
| Linter | ESLint + Prettier |
| AI SDK | OpenAI SDK / Anthropic SDK |
| Deploy | Vercel |

---

## Comandos de desarrollo

```bash
pnpm install          # Instalar dependencias

# CLI
pnpm run claudio evoluciona           # Wizard interactivo
pnpm run claudio evoluciona ./target  # Instalar en directorio especifico
pnpm run claudio hermes install       # Instalar Hermes

# Servidor de ejemplo
pnpm run dev          # Desarrollo con hot-reload (http://localhost:3000)
pnpm run build        # Compilar TypeScript a dist/
pnpm start            # Iniciar en produccion

# Calidad
pnpm run lint         # Ejecutar ESLint
pnpm run lint:fix     # ESLint con auto-fix
pnpm run format       # Formatear con Prettier

# Tests
pnpm test             # Todos los tests
pnpm run test:unit    # Solo tests unitarios
pnpm run test:int     # Solo tests de integracion
pnpm run test:e2e     # Solo tests end-to-end
pnpm run test:watch   # Tests en modo watch
```

### Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripcion | Requerida |
|---|---|---|
| `NODE_ENV` | `development` / `production` / `test` | Si |
| `PORT` | Puerto del servidor (default: 3000) | No |
| `OPENAI_API_KEY` | API key de OpenAI | Si (para AI) |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | No |

---

## Adaptarlo a tu proyecto

El template esta diseñado para ser la base de cualquier proyecto de software, no solo agentes AI.

### Pasos para un proyecto nuevo

1. Ejecutar `claudio evoluciona ./mi-proyecto` — copia el `.claude/` completo
2. Editar `.claude/rules/domain.md` — definir el glosario y flujos del negocio
3. Editar `.claude/CLAUDE.md` — ajustar contexto y comandos esenciales del proyecto
4. Editar `.claude/context.md` — describir el proyecto, stack y equipo
5. Editar `.claude/architecture.md` — documentar las decisiones de arquitectura
6. Completar el vault de Obsidian (`obsidian/02-Estandares/`) con el stack elegido

### Tipos de proyecto soportados

| Tipo | Ajuste necesario |
|---|---|
| API REST | Mantener las capas, ajustar los services |
| Web App (React/Next.js) | Agregar frontend layer, activar `frontend-expert` |
| CLI Tool | Reemplazar API layer por CLI parser (Commander/yargs) |
| Microservicio | Agregar communication layer (message queue) |
| Scraper | Reemplazar Agent service por Scraper con Playwright |

---

## Licencia

MIT
