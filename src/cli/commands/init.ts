import { resolve } from 'node:path'
import type { InitFlags } from '../utils/args.js'
import {
  checkNodeVersion,
  isTemplateRepo,
  installDependencies,
  ensureEnvFile,
} from '../utils/project.js'
import { runEvoluciona } from './evoluciona.js'
import { isInteractive } from '../utils/ui.js'
import { runInitFlowMenu } from './menu.js'
import { installMattPocockSkills, hasMattPocockSkills } from '../utils/skills.js'

export interface RunInitOptions {
  /** Evita abrir el sub-menú (uso interno desde menu.ts) */
  skipMenu?: boolean
}

export async function runInit(flags: InitFlags, options: RunInitOptions = {}): Promise<void> {
  const hasExplicitFlags = flags.yes || flags.minimal || Boolean(flags.targetDir)

  if (!options.skipMenu && !hasExplicitFlags && isInteractive()) {
    await runInitFlowMenu()
    return
  }

  await runInitDirect(flags)
}

async function runInitDirect(flags: InitFlags): Promise<void> {
  const nodeCheck = checkNodeVersion()
  if (!nodeCheck.ok) {
    console.error(`\n❌ ${nodeCheck.message}\n`)
    process.exit(1)
  }

  const explicitTarget = flags.targetDir ? resolve(flags.targetDir) : undefined
  const inTemplate = !explicitTarget && isTemplateRepo()

  if (inTemplate) {
    await runTemplateInit(flags)
    return
  }

  await runEvoluciona({
    targetArg: explicitTarget ?? flags.targetDir,
    minimal: flags.minimal,
    yes: flags.yes,
  })
}

async function runTemplateInit(flags: InitFlags): Promise<void> {
  const cwd = process.cwd()

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   claudio init  —  Template local          ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log(`  Node     : ${checkNodeVersion().version}`)
  console.log(`  Proyecto : agent-manager-template\n`)

  console.log('  Esto va a:\n')
  console.log('    · Instalar dependencias (pnpm o npm)\n')
  console.log('    · Crear .env desde .env.example si no existe\n')
  console.log('    · Dejarte listo para pnpm dev y Claude Code\n')

  try {
    installDependencies(cwd)
  } catch {
    console.error('\n❌ Falló la instalación de dependencias. Revisá tu red y Node.js.\n')
    process.exit(1)
  }

  const createdEnv = ensureEnvFile(cwd)
  if (createdEnv) {
    console.log('\n✅ Creado .env desde .env.example')
    console.log('   Completá OPENAI_API_KEY en .env si vas a usar el agente de ejemplo.\n')
  } else {
    console.log('\nℹ️  .env ya existe o no hay .env.example\n')
  }

  console.log('╔════════════════════════════════════════════╗')
  console.log('║   ✅  Listo para desarrollar               ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log('  pnpm run dev     → servidor en http://localhost:3000')
  console.log('  pnpm test        → tests')
  console.log('  claudio doctor   → verificar el setup\n')
  if (!hasMattPocockSkills(cwd)) {
    console.log('  📚 Instalando mattpocock/skills (.agents/skills/) ...\n')
    try {
      installMattPocockSkills(cwd)
      console.log('  ✅ Skills mattpocock instaladas\n')
    } catch {
      console.warn('  ⚠️  No se pudieron instalar skills. Ejecutá: pnpm run skills:install\n')
    }
  }

  console.log('  Abrí este proyecto en Claude Code y probá /plan con una feature pequeña.\n')
  console.log('  Ciclo de tareas: .claude/rules/mattpocock-task-cycle.md\n')
  console.log('  Más info: claudio guia · docs/ADVANCED.md (Obsidian/Hermes opcionales)\n')

  if (!flags.minimal && !flags.yes) {
    console.log('  Tip: claudio guia pipeline — entender las 7 fases\n')
  }
}
