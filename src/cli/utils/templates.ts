import { existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { ensureDir } from './installer.js'

export const STACKS = [
  'Node.js + TypeScript (Fastify / Express / Hono)',
  'React + TypeScript (Next.js / Vite)',
  'Python (FastAPI / Django / Flask)',
  'Vue + TypeScript (Nuxt / Vite)',
  'Otro — configura manualmente después',
] as const

export interface ProjectTemplateInput {
  projectName: string
  stack: string
  description?: string
  domainDescription?: string
  /** Prioridades 1–3 para .claude/hermes/SOUL.md */
  priorities?: [string, string, string]
}

export function generateContextMd(input: ProjectTemplateInput): string {
  const { projectName, stack, description } = input
  const descBlock = description?.trim()
    ? description.trim()
    : '[Describe brevemente el propósito del proyecto]'

  return `# Contexto del Proyecto — ${projectName}

## Stack
${stack}

## Descripción
${descBlock}

## Comandos esenciales
\`\`\`bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev

# Build
npm run build

# Tests
npm test
\`\`\`

## Estructura de carpetas
\`\`\`
src/
tests/
docs/
\`\`\`

## Variables de entorno necesarias
- \`NODE_ENV\` — development | production
- [agregar más aquí]

## Decisiones de arquitectura clave
- [Agregar aquí las decisiones importantes a medida que surjan]

## Advertencias
- NUNCA commitear \`.env\` — usar \`.env.example\` como template
- Los archivos en \`src/config/\` son sensibles — no modificar sin confirmación
`
}

export function generateArchitectureMd(input: ProjectTemplateInput): string {
  const { projectName, stack } = input
  return `# Arquitectura — ${projectName}

## Stack
${stack}

## Diagrama de alto nivel
\`\`\`
[Cliente] → [API] → [Servicios] → [Base de datos / Externos]
\`\`\`

## Módulos principales

| Módulo | Responsabilidad |
|--------|----------------|
| [módulo 1] | [descripción] |
| [módulo 2] | [descripción] |

## Constraints inmutables
1. [Constraint 1 — ej. "No SSR en páginas de datos en tiempo real"]
2. [Constraint 2]

## Patrones de código establecidos
- [Patrón 1 — referencia a archivo de ejemplo]
- [Patrón 2 — referencia a archivo de ejemplo]

## Decisiones técnicas clave
| Decisión | Alternativas consideradas | Razón |
|----------|--------------------------|-------|
| [decisión] | [alternativas] | [por qué] |
`
}

export function generateMemoryMd(projectName: string): string {
  return `# Memory — ${projectName}

## Decisiones técnicas
[Registra aquí las decisiones técnicas importantes a medida que surjan]

## Patrones aprendidos
[Registra aquí los patrones que funcionaron bien en este proyecto]

## Issues conocidos del codebase
[Registra aquí los problemas conocidos para no repetir errores]

## Notas de deploy
[Registra aquí información importante para el deploy de este proyecto]

## Historial de sesiones
[El hook PreCompact agrega aquí resúmenes automáticos de sesión]
`
}

export function generateDomainMd(input: ProjectTemplateInput): string {
  const { projectName, description, domainDescription } = input
  const domainSummary =
    domainDescription?.trim() ||
    description?.trim() ||
    `[Describe el dominio de negocio de ${projectName}]`

  return `# Domain Rules — ${projectName}

This file defines the business domain vocabulary, workflows, and constraints.
Referenced by:
- \`.claude/agents/domain-expert.md\` — domain validation
- \`.claude/agents/tester.md\` — business invariants in tests
- \`.claude/rules/orchestration.md\` — Phase 1 domain review

---

## Domain: ${projectName}

${domainSummary}

---

## Domain Glossary

| Correct Term | Avoid | Definition |
|--------------|-------|------------|
| **Feature** | Ticket, Task, Item | Unit of work tracked through the pipeline |
| **User** | Customer, Client | End user of the system |
| [término] | [evitar] | [definición] |

**Rule:** Use only "Correct Term" column in code, labels, comments, docs.

---

## Core Workflow

\`\`\`
[Documenta el flujo principal del negocio — ej. registro → verificación → uso]
\`\`\`

### Allowed Transitions
- [Transición permitida 1]

### Forbidden
- [Regla de negocio que no debe violarse]

---

## Key Entities

| Entity | Purpose | Constraints |
|--------|---------|-------------|
| [entidad] | [propósito] | [restricciones] |

---

## KPIs

| Metric | Calculation | Why |
|--------|-------------|-----|
| [métrica] | [cómo se calcula] | [por qué importa] |

---

## Sensitive Data

| Field | Level | Rules |
|-------|-------|-------|
| API keys in \`.env\` | CRITICAL | Never commit, never expose in client |
| [campo] | [nivel] | [reglas] |

---

## Business Invariants

1. [Invariante de negocio 1]
2. [Invariante de negocio 2]

---

## Out of Scope

- [Qué queda fuera del alcance de este proyecto]
`
}

export function createObsidianStarters(obsidianDir: string, projectName: string): void {
  ensureDir(obsidianDir)

  const readmePath = join(obsidianDir, '00-README.md')
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# ${projectName} — Knowledge Vault

## Secciones del vault
- [[01-Agentes/Reglas para agentes]] — Reglas y configuración de los agentes
- [[02-Estandares/Stack tecnologico]] — Stack tecnológico del proyecto
- [[02-Estandares/Convenciones de codigo]] — Convenciones de código
- [[03-Contexto/Resumen del proyecto]] — Contexto general
- [[04-Analisis/README]] — Análisis técnicos
- [[05-Testing/README]] — Estrategia de testing
- [[06-Deployments/README]] — Historial de deploys

> Vault opcional. Si no usás Obsidian, \`.claude/context.md\` y \`.claude/memory.md\` son la fuente de verdad.
`,
    )
  }

  const agentesDir = join(obsidianDir, '01-Agentes')
  ensureDir(agentesDir)
  const reglasPath = join(agentesDir, 'Reglas para agentes.md')
  if (!existsSync(reglasPath)) {
    writeFileSync(
      reglasPath,
      `# Reglas para Agentes — ${projectName}

Ver \`.claude/rules/orchestration.md\` para el pipeline de 7 fases.
`,
    )
  }

  const estandaresDir = join(obsidianDir, '02-Estandares')
  ensureDir(estandaresDir)

  const stackPath = join(estandaresDir, 'Stack tecnologico.md')
  if (!existsSync(stackPath)) {
    writeFileSync(
      stackPath,
      `# Stack Tecnológico — ${projectName}

[Documenta aquí el stack elegido, versiones exactas, y razones]
`,
    )
  }

  const convPath = join(estandaresDir, 'Convenciones de codigo.md')
  if (!existsSync(convPath)) {
    writeFileSync(
      convPath,
      `# Convenciones de Código — ${projectName}

[Documenta convenciones específicas del proyecto]
`,
    )
  }

  const sections: Record<string, string> = {
    '03-Contexto/Resumen del proyecto.md': `# Resumen del Proyecto — ${projectName}\n\n[Describe aquí el contexto de negocio del proyecto]\n`,
    '04-Analisis/README.md': `# Análisis — ${projectName}\n\n[Documenta aquí los análisis técnicos importantes]\n`,
    '05-Testing/README.md': `# Testing — ${projectName}\n\n[Documenta la estrategia de testing]\n`,
    '06-Deployments/README.md': `# Deployments — ${projectName}\n\n[Historial de deploys]\n`,
  }

  for (const [relPath, content] of Object.entries(sections)) {
    const fullPath = join(obsidianDir, relPath)
    if (!existsSync(fullPath)) {
      ensureDir(dirname(fullPath))
      writeFileSync(fullPath, content)
    }
  }
}
