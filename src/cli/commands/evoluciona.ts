import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prompt, promptSelectRich, closePrompts } from '../utils/prompts.js'
import { printBanner, printSection } from '../utils/ui.js'
import {
  copyDir,
  touchGitkeep,
  patchSettingsJson,
  setHookPermissions,
  type HermesConfig,
} from '../utils/installer.js'
import {
  STACKS,
  generateContextMd,
  generateArchitectureMd,
  generateMemoryMd,
  generateDomainMd,
  createObsidianStarters,
  type ProjectTemplateInput,
} from '../utils/templates.js'
import { getTemplateRoot } from '../utils/project.js'
import { syncMattPocockBundle } from '../utils/skills.js'
import { bootstrapAuditEcosystem } from '../utils/audit-bootstrap.js'
import { bootstrapHermesProject, defaultHermesPriorities } from '../utils/hermes-bootstrap.js'

const __filename = fileURLToPath(import.meta.url)
const TEMPLATE_ROOT = getTemplateRoot(import.meta.url)

const STACK_OPTIONS = STACKS.map(stack => ({
  label: stack,
  description:
    stack.includes('Node.js')
      ? 'APIs con Fastify/Express/Hono — coincide con el ejemplo del template.'
      : stack.includes('React')
        ? 'SPA o Next.js; activá frontend-expert y reglas en .claude/rules/frontend.md.'
        : stack.includes('Python')
          ? 'FastAPI/Django; ajustá comandos en context.md tras instalar.'
          : stack.includes('Vue')
            ? 'Nuxt/Vite; ajustá reglas frontend según tu diseño.'
            : 'Completá context.md y architecture.md manualmente después.',
}))

const EXTRAS_OPTIONS = [
  {
    label: 'Solo .claude/ (recomendado para empezar)',
    description: 'Pipeline, agentes, hooks y archivos de contexto generados. Sin dependencias extra.',
  },
  {
    label: 'Agregar vault Obsidian',
    description: 'Carpeta obsidian/ como memoria extendida en notas. Opcional si preferís solo context.md.',
  },
  {
    label: 'Obsidian + Hermes MCP',
    description:
      'Vault local + entrada MCP en settings.json (NO instala Ubuntu ni el binario Hermes). Reiniciá Claude Code.',
    hint: 'Binario Hermes: claudio hermes install (solo guía, manual)',
  },
] as const

export interface EvolucionaOptions {
  targetArg?: string
  minimal?: boolean
  yes?: boolean
}

export async function runEvoluciona(options: EvolucionaOptions = {}): Promise<void> {
  const { targetArg, minimal = false, yes = false } = options

  printBanner(
    'claudio evoluciona — Setup Wizard',
    'Instala .claude/ con pipeline, agentes, hooks y contexto de tu proyecto.',
  )

  printSection('Qué se instalará', [
    '12 agentes equipo + 8 agentes lifecycle-audit · 14 comandos slash',
    '13 skills template + 29 mattpocock · 11 hooks',
    'context.md, architecture.md, domain.md, AUDIT_STANDARDS.md generados',
    '.claude/hermes/SOUL.md adaptado al proyecto (identidad Hermes)',
    'Opcional: Obsidian y/o Hermes MCP (podés elegir después)',
  ].join('\n'))

  let targetDir: string

  if (targetArg) {
    targetDir = resolve(targetArg)
  } else if (yes) {
    targetDir = process.cwd()
  } else {
    const choice = await promptSelectRich('¿Dónde instalar el setup de Claude Code?', [
      {
        label: `Directorio actual: ${process.cwd()}`,
        description: 'Instala aquí si ya estás dentro del proyecto.',
      },
      {
        label: 'Especificar otra ruta...',
        description: 'Crea la carpeta si no existe.',
      },
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

  const defaultName = basename(targetDir)
  const projectName = yes
    ? defaultName
    : await prompt(
        'Nombre del proyecto (aparece en context.md y domain.md)',
        defaultName,
      )

  const stackIdx =
    yes || minimal ? 0 : await promptSelectRich('Stack principal:', STACK_OPTIONS)
  const stackName = STACKS[stackIdx]

  let projectDescription: string | undefined
  let domainDescription: string | undefined
  let priorities: [string, string, string] | undefined

  if (!yes && !minimal) {
    printSection(
      'Contexto de negocio',
      'Estos textos alimentan .claude/context.md y .claude/rules/domain.md automáticamente.',
    )
    projectDescription = await prompt(
      '¿Qué hace el proyecto en una frase? (Enter para omitir)',
      '',
    )
    if (projectDescription) {
      domainDescription = await prompt(
        'Términos de dominio o reglas de negocio clave (Enter = usar la frase anterior)',
        '',
      )
    }

    const priorityDefaults = defaultHermesPriorities(projectName, projectDescription)
    printSection(
      'Prioridades Hermes',
      'Definen la sección Misión de .claude/hermes/SOUL.md. Enter acepta el default sugerido.',
    )
    const priority1 = await prompt('Prioridad 1 — foco inmediato', priorityDefaults[0])
    const priority2 = await prompt('Prioridad 2 — siguiente hito', priorityDefaults[1])
    const priority3 = await prompt('Prioridad 3 — mantenimiento / contexto', priorityDefaults[2])
    priorities = [priority1, priority2, priority3]
  } else {
    priorities = defaultHermesPriorities(projectName, projectDescription)
  }

  let installObsidian = false
  let hermesConfig: HermesConfig | undefined

  if (!minimal && !yes) {
    const extrasIdx = await promptSelectRich(
      '¿Querés componentes opcionales además de .claude/?',
      [...EXTRAS_OPTIONS],
    )
    if (extrasIdx === 1) {
      installObsidian = true
    } else if (extrasIdx === 2) {
      installObsidian = true
      printSection('Hermes MCP', 'Conecta Claude Code a un servidor Hermes (HTTP o proceso local).')
      const hermesTypeIdx = await promptSelectRich('Tipo de conexión:', [
        {
          label: 'HTTP / SSE',
          description: 'Servidor remoto o local en un puerto (ej. http://localhost:4000).',
        },
        {
          label: 'stdio',
          description: 'Proceso local; indicás comando y argumentos.',
        },
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
  }

  if (!yes) {
    closePrompts()
  }

  const templateInput: ProjectTemplateInput = {
    projectName,
    stack: stackName,
    description: projectDescription || undefined,
    domainDescription: domainDescription || projectDescription || undefined,
    priorities,
  }

  console.log('\n─────────────────────────────────────────────')
  console.log(`  Proyecto : ${projectName}`)
  console.log(`  Target   : ${targetDir}`)
  console.log(`  Stack    : ${stackName}`)
  if (priorities) {
    console.log(`  P1       : ${priorities[0]}`)
    console.log(`  P2       : ${priorities[1]}`)
    console.log(`  P3       : ${priorities[2]}`)
  }
  console.log(`  Obsidian : ${installObsidian ? 'Sí' : 'No'}`)
  if (hermesConfig) {
    const hermesDesc =
      hermesConfig.type === 'sse'
        ? hermesConfig.url
        : `${hermesConfig.command} ${hermesConfig.args?.join(' ')}`
    console.log(`  Hermes   : ${hermesDesc}`)
  } else {
    console.log(`  Hermes   : No`)
  }
  console.log('─────────────────────────────────────────────\n')

  const claudeDir = join(targetDir, '.claude')
  const sourceClaudeDir = join(TEMPLATE_ROOT, '.claude')

  if (!existsSync(sourceClaudeDir)) {
    console.error(
      `❌ No se encontró el directorio de templates en: ${sourceClaudeDir}\n` +
        '   Asegurate de ejecutar este comando desde el directorio del template.',
    )
    process.exit(1)
  }

  console.log('📦 Instalando .claude/ ...')
  copyDir(sourceClaudeDir, claudeDir)

  console.log('📚 Instalando mattpocock/skills + docs/agents ...')
  syncMattPocockBundle(TEMPLATE_ROOT, targetDir)

  console.log('⚙️  Configurando settings.json ...')
  patchSettingsJson(join(claudeDir, 'settings.json'), targetDir, hermesConfig)

  console.log('📝 Generando archivos de contexto del proyecto ...')
  writeFileSync(join(claudeDir, 'context.md'), generateContextMd(templateInput))
  writeFileSync(join(claudeDir, 'architecture.md'), generateArchitectureMd(templateInput))
  writeFileSync(join(claudeDir, 'memory.md'), generateMemoryMd(projectName))
  writeFileSync(join(claudeDir, 'rules', 'domain.md'), generateDomainMd(templateInput))

  console.log('🔍 Bootstrap ecosistema de auditoría lifecycle ...')
  bootstrapAuditEcosystem(targetDir, TEMPLATE_ROOT, templateInput)

  console.log('🧠 Bootstrap identidad Hermes (SOUL.md) ...')
  const hermesBootstrap = bootstrapHermesProject(targetDir, TEMPLATE_ROOT, templateInput)

  console.log('📁 Creando estructura de logs ...')
  touchGitkeep(join(claudeDir, 'logs', 'checkpoints'))
  touchGitkeep(join(claudeDir, 'logs', 'handoffs'))
  touchGitkeep(join(claudeDir, 'logs', 'audits', 'features'))
  touchGitkeep(join(claudeDir, 'logs', 'audits', 'security'))

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

  if (process.platform !== 'win32') {
    console.log('🔑 Configurando permisos de hooks ...')
    setHookPermissions(join(claudeDir, 'hooks'))
  }

  if (installObsidian) {
    console.log('📓 Instalando vault de Obsidian ...')
    const obsidianSrc = join(TEMPLATE_ROOT, 'obsidian')
    const obsidianDest = join(targetDir, 'obsidian')
    if (existsSync(obsidianSrc)) {
      copyDir(obsidianSrc, obsidianDest)
    }
    createObsidianStarters(obsidianDest, projectName)
  }

  printEvolucionaDone(targetDir, { installObsidian, hermesConfig, hermesBootstrap })
}

export function printEvolucionaDone(
  targetDir: string,
  opts: {
    installObsidian: boolean
    hermesConfig?: HermesConfig
    hermesBootstrap?: { profileSlug: string; syncedToHermesHome: boolean } | null
  },
): void {
  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   ✅  Instalación completada!              ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log('Próximo paso:\n')
  console.log(`  cd ${targetDir}`)
  console.log('  claudio doctor\n')

  if (process.platform === 'win32') {
    console.log('  ⚠️  Windows: hooks en Git Bash — chmod +x .claude/hooks/**/*.sh .claude/hooks/**/*.py\n')
  }

  if (opts.installObsidian) {
    console.log('  📓 Obsidian (opcional): abrí obsidian/ como vault\n')
  }

  if (opts.hermesConfig) {
    console.log('  🔌 Hermes MCP: reiniciá Claude Code para cargar la configuración\n')
  }

  console.log('  🔍 Lifecycle audit: /audit-pipeline · docs/AUDIT_PIPELINE.md\n')

  if (opts.hermesBootstrap) {
    const { profileSlug, syncedToHermesHome } = opts.hermesBootstrap
    console.log('  🧠 Hermes SOUL: .claude/hermes/SOUL.md (editá misión y prioridades ahí)\n')
    if (syncedToHermesHome) {
      console.log(`  🧠 Perfil Hermes: hermes -p ${profileSlug}\n`)
    } else {
      console.log('  🧠 Hermes: claudio hermes init && claudio hermes optimize\n')
    }
  }
}
