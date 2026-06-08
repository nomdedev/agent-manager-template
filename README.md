# Agent Manager Template

> Setup profesional de Claude Code: pipeline de 7 fases, **12 agentes**, **13 comandos** slash, **11 hooks**, **10 skills** — un comando para empezar.

**Guía rápida:** [GETTING_STARTED.md](GETTING_STARTED.md) · **Referencia completa:** [docs/REFERENCE.md](docs/REFERENCE.md) · **Avanzado (opcional):** [docs/ADVANCED.md](docs/ADVANCED.md)

---

## Inicio rápido (3 comandos)

```bash
git clone https://github.com/nomdedev/agent-manager-template
cd agent-manager-template
pnpm setup && claudio doctor && pnpm dev
```

Sin argumentos, `claudio` abre un **menú interactivo** que explica cada opción. También: `claudio guia` (qué hace pipeline, agentes, hooks…).

Instalar en **otro proyecto:**

```bash
claudio init ./mi-proyecto --yes
claudio doctor
```

---

## Tabla de contenidos

- [Que es esto](#que-es-esto)
- [CLI claudio — referencia completa](#cli-claudio--referencia-completa)
- [Documentación detallada](#documentación-detallada)
- [Los 4 niveles de Hermes Agent](#los-4-niveles-de-hermes-agent)
- [Metodologia: el pipeline de 7 fases](#metodologia-el-pipeline-de-7-fases)
- [Los 7 agentes especializados](#los-7-agentes-especializados)
- [Los 12 comandos slash](#los-12-comandos-slash)
- [Los 11 hooks de seguridad y calidad](#los-11-hooks-de-seguridad-y-calidad)
- [Los 13 skills especializados](#los-13-skills-especializados)
- [Pipeline lifecycle de auditoría](#pipeline-lifecycle-de-auditoría)
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
- CLI `claudio` (`init`, `doctor`, `evoluciona`) para instalar y verificar el setup
- Pipeline de 7 fases con gates de salida verificables
- 12 agentes especializados con permisos y protocolos definidos
- 12 comandos slash (`/audit`, `/security`, `/test`, `/review`, `/frontend`, etc.)
- 11 hooks que bloquean automaticamente operaciones peligrosas
- 13 skills cargables on-demand (incl. audit-pipeline lifecycle)
- 8 agentes lifecycle-audit (scope → production, GO/NO-GO)
- Vault de Obsidian y Hermes Agent — **opcionales** ([docs/ADVANCED.md](docs/ADVANCED.md))

---

## CLI claudio — referencia completa

### `claudio init [target-dir] [--minimal] [--yes]`

Punto de entrada recomendado. En este template instala dependencias y crea `.env`; en otros proyectos instala `.claude/` y genera `context.md`, `architecture.md`, `domain.md` y `memory.md`.

```
claudio init
claudio init ./mi-proyecto --yes
pnpm setup    # alias de claudio init en este repo
```

### `claudio doctor`

Verifica Node, `.claude/`, MCP paths, hooks y `.env` (en el template).

### `claudio evoluciona [target-dir] [--minimal] [--yes]`

Instala el setup completo de Claude Code en un proyecto.

```
claudio evoluciona ./mi-proyecto --minimal
```

El wizard copia:
- `.claude/agents/` — 12 agentes especializados
- `.claude/commands/` — 12 comandos slash
- `.claude/hooks/` — 11 hooks de seguridad y calidad
- `.claude/skills/` — 10 skills especializados
- `.claude/rules/` — reglas del proyecto (incl. `domain.md` generado)
- `.claude/CLAUDE.md` — 12 reglas de comportamiento
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

## Documentación detallada

- [Pipeline de 7 fases, agentes, comandos, hooks y skills](docs/REFERENCE.md)
- [Hermes Agent y Obsidian (opcional)](docs/ADVANCED.md)
- [Guía de 5 minutos](GETTING_STARTED.md)

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
pnpm run claudio hermes install       # Clonar repo hermes-agent (solo git)

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

## Pipeline lifecycle de auditoría

Complementa el pipeline de **7 equipos** (`orchestration.md`) con un ciclo de **8 fases** orientado a calidad por disciplina:

| Fase | Agente lifecycle |
|------|------------------|
| 0 Intake | lifecycle-scope-auditor |
| 1 Arquitectura | lifecycle-architecture-auditor |
| 2 Diseño | lifecycle-design-auditor |
| 3 Seguridad | lifecycle-security-auditor |
| 4 Código | lifecycle-code-auditor |
| 5 Testing | lifecycle-test-auditor |
| 6 DevEx | lifecycle-devex-auditor |
| 7 Producción | lifecycle-production-auditor (GO/NO-GO) |

**Instalación:** automática con `claudio evoluciona` → genera `docs/AUDIT_STANDARDS.md`, `docs/AUDIT_AGENTS.md` y 8 agentes.

**Uso:** `/audit-pipeline [feature-id]` o skill `audit-pipeline`.

**Documentación:** [docs/AUDIT_PIPELINE.md](docs/AUDIT_PIPELINE.md)

---

## Adaptarlo a tu proyecto

```bash
claudio init ./mi-proyecto        # genera .claude/ + domain.md + context.md + audit lifecycle
claudio doctor
```

Refiná `.claude/architecture.md` y el glosario en `.claude/rules/domain.md` cuando el proyecto crezca. Obsidian es opcional → [docs/ADVANCED.md](docs/ADVANCED.md).

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
