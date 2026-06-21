import { resolve } from 'node:path'
import {
  HERMES_CHOICES,
  VAULT_CHOICES,
  HARNESS_CHOICES,
  INIT_FLOW_CHOICES,
  WHAT_IS_CLAUDIO,
} from '../catalog.js'
import { promptCatalogChoice, prompt, closePrompts } from '../utils/prompts.js'
import { printBanner, printSection, isInteractive } from '../utils/ui.js'
import { buildFullHelp } from '../catalog.js'
import { runInit } from './init.js'
import { runDoctor } from './doctor.js'
import { runEvoluciona } from './evoluciona.js'
import { runHermes } from './hermes.js'
import { vaultCommand } from './vault.js'
import { harnessCommand } from './harness.js'
import { runGuia } from './guia.js'
import { isTemplateRepo } from '../utils/project.js'

type MainMenuId =
  | 'init-flow'
  | 'doctor'
  | 'guia'
  | 'hermes-menu'
  | 'vault-menu'
  | 'harness-menu'
  | 'auto-audit-install'
  | 'help'
  | 'exit'

export async function runMainMenu(): Promise<void> {
  if (!isInteractive()) {
    console.log(buildFullHelp())
    return
  }

  printBanner('claudio — Menú interactivo', WHAT_IS_CLAUDIO)

  if (isTemplateRepo()) {
    printSection(
      'Sugerencia',
      'Estás en agent-manager-template. La opción más común es "Empezar / configurar".',
    )
  }

  const choices: { id: MainMenuId; label: string; description: string; advanced?: boolean }[] = [
    {
      id: 'init-flow',
      label: 'Empezar o configurar un proyecto',
      description: 'init en el template, wizard en otra carpeta, o instalación rápida.',
    },
    {
      id: 'doctor',
      label: 'Verificar el setup (doctor)',
      description: 'Comprueba Node, .claude/, MCP, hooks y .env.',
    },
    {
      id: 'guia',
      label: '¿Qué hace cada cosa? (guía)',
      description: 'Explica pipeline, agentes, hooks, skills y opciones avanzadas.',
    },
    {
      id: 'hermes-menu',
      label: 'Hermes Agent (opcional)',
      description: 'Memoria personal entre proyectos. No necesario para empezar.',
      advanced: true,
    },
    {
      id: 'vault-menu',
      label: 'Vault Obsidian (opcional)',
      description: 'Analizar u optimizar la carpeta obsidian/.',
      advanced: true,
    },
    {
      id: 'harness-menu',
      label: 'Auditoría harness (12 reglas)',
      description: 'Reportes de eficiencia y cumplimiento por feature.',
      advanced: true,
    },
    {
      id: 'auto-audit-install',
      label: 'Instalar Auto-Audit Loop',
      description: 'Copia el sistema de auto-audit a cualquier proyecto.',
      advanced: true,
    },
    {
      id: 'help',
      label: 'Ver ayuda completa (texto)',
      description: 'Lista todos los comandos y ejemplos.',
    },
    {
      id: 'exit',
      label: 'Salir',
      description: 'Cerrar el menú.',
    },
  ]

  const idx = await promptCatalogChoice('¿Qué querés hacer?', choices, { showAdvanced: true })
  const picked = choices[idx]
  closePrompts()

  if (!picked || picked.id === 'exit') {
    console.log('\nHasta luego. Tip: claudio guia · GETTING_STARTED.md\n')
    return
  }

  switch (picked.id) {
    case 'init-flow':
      await runInitFlowMenu()
      break
    case 'doctor': {
      const code = await runDoctor()
      process.exit(code)
    }
    case 'guia':
      runGuia()
      break
    case 'hermes-menu':
      await runHermesMenu()
      break
    case 'vault-menu':
      await runVaultMenu()
      break
    case 'harness-menu':
      await runHarnessMenu()
      break
    case 'auto-audit-install': {
      const { runAutoAuditInstall } = await import('./auto-audit-install.js')
      const path = await promptOptionalPath('¿En qué carpeta instalamos Auto-Audit? (Enter = actual)')
      await runAutoAuditInstall({ targetDir: path, yes: false })
      break
    }
    case 'help':
      console.log(buildFullHelp())
      break
  }
}

export async function runInitFlowMenu(): Promise<void> {
  printBanner('Configurar proyecto')

  const flows = isTemplateRepo()
    ? INIT_FLOW_CHOICES
    : INIT_FLOW_CHOICES.filter(f => f.id !== 'template')

  const idx = await promptCatalogChoice('Elegí tu situación:', flows)
  const flow = flows[idx]
  closePrompts()

  if (!flow) return

  switch (flow.id) {
    case 'template':
      await runInit({ minimal: false, yes: false }, { skipMenu: true })
      break
    case 'wizard': {
      const path = await promptOptionalPath('¿En qué carpeta instalamos .claude/?')
      await runEvoluciona({ targetArg: path })
      break
    }
    case 'quick': {
      const path = await promptOptionalPath('¿En qué carpeta? (Enter = actual)')
      await runInit({ targetDir: path, minimal: false, yes: true }, { skipMenu: true })
      break
    }
    case 'doctor': {
      const code = await runDoctor()
      process.exit(code)
    }
  }
}

async function promptOptionalPath(question: string): Promise<string | undefined> {
  if (!isInteractive()) return undefined
  const { prompt: p } = await import('../utils/prompts.js')
  const raw = await p(question, process.cwd())
  closePrompts()
  return raw ? resolve(raw) : undefined
}

export async function runHermesMenu(): Promise<void> {
  printBanner('Hermes Agent', 'Opcional. Memoria personal en ~/.hermes/')

  const idx = await promptCatalogChoice('Subcomando de Hermes:', HERMES_CHOICES, {
    showAdvanced: true,
  })
  const choice = HERMES_CHOICES[idx]
  closePrompts()

  if (!choice) return

  if (choice.id === 'init') {
    const profile = await promptHermesProfile()
    await runHermes('init', profile ? [profile] : [])
    return
  }

  if (choice.id === 'optimize') {
    const path = await promptOptionalPath('Ruta del proyecto (Enter = actual)')
    await runHermes('optimize', path ? [path] : [])
    return
  }

  await runHermes(choice.id)
}

async function promptHermesProfile(): Promise<string | undefined> {
  const { promptSelectRich, closePrompts: close } = await import('../utils/prompts.js')
  const profiles = [
    { label: 'programmer', description: 'Staff engineer, pipeline de 7 fases, tests antes de done.' },
    { label: 'designer', description: 'Artefactos visuales y diagramas técnicos.' },
    { label: 'researcher', description: 'Investigación y síntesis de inteligencia técnica.' },
    { label: 'custom', description: 'SOUL.md editable a mano después del init.' },
  ]
  const i = await promptSelectRich('Perfil de Hermes:', profiles)
  close()
  return profiles[i]?.label
}

export async function runVaultMenu(): Promise<void> {
  printBanner('Vault Obsidian', 'Requiere carpeta obsidian/ en el proyecto.')

  const idx = await promptCatalogChoice('Acción sobre el vault:', VAULT_CHOICES)
  const choice = VAULT_CHOICES[idx]
  closePrompts()

  if (!choice) return

  if (choice.id === 'tokens') {
    const file = await promptOptionalPath('Ruta del archivo .md')
    if (file) await vaultCommand('tokens', [file])
    return
  }

  await vaultCommand(choice.id, [])
}

export async function runHarnessMenu(): Promise<void> {
  printBanner('Harness — 12-Rule Standard')

  const idx = await promptCatalogChoice('Acción de auditoría:', HARNESS_CHOICES)
  const choice = HARNESS_CHOICES[idx]
  closePrompts()

  if (!choice) return

  if (choice.id === 'measure-file') {
    const file = await promptOptionalPath('Ruta del archivo')
    if (file) await harnessCommand('measure-file', [file])
    return
  }

  const feature = await promptOptionalPath('ID de feature (Enter = current)')
  await harnessCommand(choice.id, feature ? [feature] : [])
}

/** Menú Hermes cuando se invoca `claudio hermes` sin subcomando en TTY */
export async function runHermesInteractive(): Promise<void> {
  await runHermesMenu()
}
