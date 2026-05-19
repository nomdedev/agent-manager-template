import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prompt, promptYesNo, promptSelect, closePrompts } from '../utils/prompts.js'
import {
  copyDir,
  ensureDir,
  touchGitkeep,
  patchSettingsJson,
  setHookPermissions,
  type HermesConfig,
} from '../utils/installer.js'

const __filename = fileURLToPath(import.meta.url)
// src/cli/commands/ → ../../../ → project root
const TEMPLATE_ROOT = resolve(dirname(__filename), '..', '..', '..')

const STACKS = [
  'Node.js + TypeScript (Fastify / Express / Hono)',
  'React + TypeScript (Next.js / Vite)',
  'Python (FastAPI / Django / Flask)',
  'Vue + TypeScript (Nuxt / Vite)',
  'Otro — configura manualmente después',
]

// ─── Template generators ─────────────────────────────────────────────────────

function generateContextMd(projectName: string, stack: string): string {
  return `# Contexto del Proyecto — ${projectName}

## Stack
${stack}

## Descripción
[Describe brevemente el propósito del proyecto]

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

function generateArchitectureMd(projectName: string, stack: string): string {
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

function generateMemoryMd(projectName: string): string {
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

function createObsidianStarters(obsidianDir: string, projectName: string): void {
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

> Este vault es leído automáticamente por Claude Code al inicio de cada sesión.
> Ver .claude/CLAUDE.md para las instrucciones de carga.
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

## Pipeline de 7 Fases (obligatorio para todo feature)

Ver \`.claude/rules/orchestration.md\` para el detalle completo.

| Fase | Equipo | Agente(s) | Gate de salida |
|------|--------|-----------|----------------|
| 1. Dominio e Idea | Diseño | domain-expert | Requerimientos validados |
| 2. Arquitectura | Diseño | architect + developer | Diseño aprobado, interfaces definidas |
| 3. Backend | Backend | architect + orquestador | API routes, schema consistente |
| 4. Seguridad | Seguridad | security-auditor | Sin hallazgos CRÍTICOS/ALTOS |
| 5. Develop | Develop | developer + reviewer | Build exitoso, review OK |
| 6. QA | QA | tester | Tests pasando, cobertura documentada |
| 7. Producción | Producción | orquestador | Verificación real, GO/NO-GO |

## Agentes disponibles
- **domain-expert** — Valida que el feature tenga sentido para el negocio
- **architect** — Diseña la solución técnica sin escribir código
- **security-auditor** — Audita OWASP Top 10 antes de que entre código
- **developer** — Implementa siguiendo el diseño aprobado
- **reviewer** — Code review antes de QA
- **tester** — Escribe y ejecuta tests. Su misión: romper todo
- **orchestrator** — Dirige el pipeline, emite GO/NO-GO final

## Reglas de oro
1. Nunca saltear una fase. Si está bloqueada, se corrige y re-ingresa al equipo.
2. Equipo 4 (Develop) NO recibe tarea sin veredicto APROBADO de Seguridad.
3. Producción (Fase 7) NO se ejecuta sin veredicto APROBADO de QA.
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

## Stack principal
[Documenta aquí el stack elegido, versiones exactas, y razones]

## Dependencias clave
| Dependencia | Versión | Para qué |
|-------------|---------|----------|
| [dep] | [ver] | [uso] |

## Dependencias prohibidas o descartadas
| Dependencia | Razón de rechazo |
|-------------|-----------------|
| [dep] | [por qué se descartó] |

## Configuración del entorno
[Documenta aquí cómo configurar el entorno de desarrollo]
`,
    )
  }

  const convPath = join(estandaresDir, 'Convenciones de codigo.md')
  if (!existsSync(convPath)) {
    writeFileSync(
      convPath,
      `# Convenciones de Código — ${projectName}

## Nomenclatura
- Variables y funciones: \`camelCase\`
- Clases, interfaces, types: \`PascalCase\`
- Archivos: \`kebab-case\`
- Constantes: \`UPPER_SNAKE_CASE\`

## Imports
- Usar path aliases configurados en tsconfig.json (\`@/\`)
- Imports de Node.js: \`node:\` prefix (ej. \`node:fs\`, \`node:path\`)
- Ordenar: externos → internos → tipos

## Prohibiciones
- No \`any\` — usar \`unknown\` + type guards
- No \`dangerouslySetInnerHTML\` sin sanitizador
- No datos sensibles en localStorage/sessionStorage
- No credenciales hardcodeadas

## Reglas adicionales
[Documenta aquí las convenciones específicas que surjan del proyecto]
`,
    )
  }

  // Create empty placeholder files for other sections
  const sections: Record<string, string> = {
    '03-Contexto/Resumen del proyecto.md': `# Resumen del Proyecto — ${projectName}\n\n[Describe aquí el contexto de negocio del proyecto]\n`,
    '04-Analisis/README.md': `# Análisis — ${projectName}\n\n[Documenta aquí los análisis técnicos importantes]\n`,
    '05-Testing/README.md': `# Testing — ${projectName}\n\n## Estrategia de testing\n[Documenta aquí la estrategia de testing]\n\n## Suite de tests\n- Unit: \`tests/unit/\`\n- Integration: \`tests/integration/\`\n- E2E: \`tests/e2e/\`\n`,
    '06-Deployments/README.md': `# Deployments — ${projectName}\n\n## Historial de deploys\n[Documenta aquí el historial de deploys importantes]\n`,
  }

  for (const [relPath, content] of Object.entries(sections)) {
    const fullPath = join(obsidianDir, relPath)
    if (!existsSync(fullPath)) {
      ensureDir(dirname(fullPath))
      writeFileSync(fullPath, content)
    }
  }
}

// ─── Wizard ──────────────────────────────────────────────────────────────────

export async function runEvoluciona(targetArg?: string): Promise<void> {
  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   claudio evoluciona  —  Setup Wizard      ║')
  console.log('╠════════════════════════════════════════════╣')
  console.log('║  Instala el setup completo de Claude Code  ║')
  console.log('║  · Pipeline de 7 fases con 6 equipos       ║')
  console.log('║  · 7 agentes especializados                ║')
  console.log('║  · 12 comandos slash                       ║')
  console.log('║  · 11 hooks de seguridad y calidad         ║')
  console.log('║  · 9 skills especializados                 ║')
  console.log('╚════════════════════════════════════════════╝\n')

  // Step 1: Target directory
  let targetDir: string

  if (targetArg) {
    targetDir = resolve(targetArg)
  } else {
    const choice = await promptSelect('¿Dónde instalar el setup de Claude Code?', [
      `Directorio actual: ${process.cwd()}`,
      'Especificar otra ruta...',
    ])
    if (choice === 1) {
      const customPath = await prompt('Ruta del proyecto')
      targetDir = resolve(customPath)
    } else {
      targetDir = process.cwd()
    }
  }

  if (!existsSync(targetDir)) {
    console.log(`\n📁 Creando directorio: ${targetDir}`)
    mkdirSync(targetDir, { recursive: true })
  }

  // Step 2: Project name
  const projectName = await prompt('Nombre del proyecto', basename(targetDir))

  // Step 3: Stack
  const stackIdx = await promptSelect('Stack principal:', STACKS)
  const stackName = STACKS[stackIdx]

  // Step 4: Obsidian vault
  const installObsidian = await promptYesNo(
    '\n¿Instalar vault de Obsidian? (memoria extendida del proyecto)',
    false,
  )

  // Step 5: Hermes MCP
  const installHermes = await promptYesNo('¿Agregar Hermes MCP server?', false)
  let hermesConfig: HermesConfig | undefined

  if (installHermes) {
    const hermesTypeIdx = await promptSelect('Tipo de conexión de Hermes:', [
      'HTTP / SSE (servidor remoto o local por HTTP)',
      'stdio (proceso local, command + args)',
    ])

    if (hermesTypeIdx === 0) {
      const url = await prompt('URL del servidor Hermes', 'http://localhost:4000')
      hermesConfig = { type: 'sse', url }
    } else {
      const command = await prompt('Comando del proceso Hermes', 'node')
      const argsRaw = await prompt('Argumentos (separados por espacio)', 'hermes-mcp-server.js')
      hermesConfig = { type: 'stdio', command, args: argsRaw.split(' ').filter(Boolean) }
    }
  }

  closePrompts()

  // Summary
  console.log('\n─────────────────────────────────────────────')
  console.log(`  Proyecto : ${projectName}`)
  console.log(`  Target   : ${targetDir}`)
  console.log(`  Stack    : ${stackName}`)
  console.log(`  Obsidian : ${installObsidian ? 'Sí' : 'No'}`)
  if (hermesConfig) {
    const hermesDesc =
      hermesConfig.type === 'sse' ? hermesConfig.url : `${hermesConfig.command} ${hermesConfig.args?.join(' ')}`
    console.log(`  Hermes   : ${hermesDesc}`)
  } else {
    console.log(`  Hermes   : No`)
  }
  console.log('─────────────────────────────────────────────\n')

  // ═══ INSTALLATION ══════════════════════════════════════════════════════════

  const claudeDir = join(targetDir, '.claude')
  const sourceClaudeDir = join(TEMPLATE_ROOT, '.claude')

  if (!existsSync(sourceClaudeDir)) {
    console.error(
      `❌ No se encontró el directorio de templates en: ${sourceClaudeDir}\n` +
        '   Asegurate de ejecutar este comando desde el directorio del template.',
    )
    process.exit(1)
  }

  // 1. Copy .claude/
  console.log('📦 Instalando .claude/ ...')
  copyDir(sourceClaudeDir, claudeDir)

  // 2. Patch settings.json
  console.log('⚙️  Configurando settings.json ...')
  patchSettingsJson(join(claudeDir, 'settings.json'), targetDir, hermesConfig)

  // 3. Generate project-specific template files
  console.log('📝 Generando archivos de contexto del proyecto ...')
  writeFileSync(join(claudeDir, 'context.md'), generateContextMd(projectName, stackName))
  writeFileSync(join(claudeDir, 'architecture.md'), generateArchitectureMd(projectName, stackName))
  writeFileSync(join(claudeDir, 'memory.md'), generateMemoryMd(projectName))

  // 4. Ensure log dirs exist with .gitkeep
  console.log('📁 Creando estructura de logs ...')
  touchGitkeep(join(claudeDir, 'logs', 'checkpoints'))
  touchGitkeep(join(claudeDir, 'logs', 'handoffs'))
  touchGitkeep(join(claudeDir, 'logs', 'audits', 'features'))
  touchGitkeep(join(claudeDir, 'logs', 'audits', 'security'))

  // Reset pipeline state to empty
  writeFileSync(
    join(claudeDir, 'logs', 'pipeline-state.json'),
    JSON.stringify(
      {
        version: 2,
        description: 'Pipeline state by teams. Each feature must pass all phases before GO.',
        features: [],
      },
      null,
      2,
    ) + '\n',
  )

  // 5. Set hook permissions (Unix/Mac only)
  if (process.platform !== 'win32') {
    console.log('🔑 Configurando permisos de hooks ...')
    setHookPermissions(join(claudeDir, 'hooks'))
  }

  // 6. Optional: Obsidian vault
  if (installObsidian) {
    console.log('📓 Instalando vault de Obsidian ...')
    const obsidianSrc = join(TEMPLATE_ROOT, 'obsidian')
    const obsidianDest = join(targetDir, 'obsidian')
    if (existsSync(obsidianSrc)) {
      copyDir(obsidianSrc, obsidianDest)
    }
    createObsidianStarters(obsidianDest, projectName)
  }

  // ═══ DONE ══════════════════════════════════════════════════════════════════

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   ✅  Instalación completada!              ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log('Próximos pasos:\n')
  console.log('  1. Editá .claude/rules/domain.md con el vocabulario de tu dominio')
  console.log('  2. Editá .claude/context.md con el contexto específico del proyecto')
  console.log('  3. Editá .claude/architecture.md con la arquitectura real')

  if (process.platform === 'win32') {
    console.log('\n  ⚠️  Windows detectado. Para activar los hooks en Git Bash o WSL:')
    console.log('     chmod +x .claude/hooks/**/*.sh .claude/hooks/**/*.py')
  }

  if (installObsidian) {
    console.log('\n  📓 Obsidian: abrí la carpeta obsidian/ como vault en Obsidian')
    console.log('     Lee obsidian/00-README.md para el índice del vault')
  }

  if (hermesConfig) {
    console.log('\n  🔌 Hermes MCP: reiniciá Claude Code para que tome la nueva configuración')
  }

  console.log('\n  📖 Documentación completa: .claude/CLAUDE.md')
  console.log(
    `\n  Pipeline listo en: .claude/logs/pipeline-state.json`,
  )
  console.log('')
}
