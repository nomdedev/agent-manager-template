import {
  WHAT_IS_CLAUDIO,
  COMPONENT_TOPICS,
  MAIN_COMMANDS,
  ADVANCED_COMMANDS,
  formatCommandHelp,
} from '../catalog.js'
import { printBanner, printSection } from '../utils/ui.js'
import { isTemplateRepo } from '../utils/project.js'

export function runGuia(topicArg?: string): void {
  const topic = topicArg?.toLowerCase().replace(/^--/, '')

  if (topic && topic !== 'help' && topic in COMPONENT_TOPICS) {
    const t = COMPONENT_TOPICS[topic]!
    printBanner(t.title)
    console.log(`   ${t.body.split('\n').join('\n   ')}\n`)
    return
  }

  if (topic === 'comandos' || topic === 'cli') {
    printBanner('Comandos del CLI', WHAT_IS_CLAUDIO)
    printSection('Principales')
    for (const cmd of MAIN_COMMANDS) {
      console.log(formatCommandHelp(cmd))
      console.log('')
    }
    printSection('Avanzados (opcionales)')
    for (const cmd of ADVANCED_COMMANDS) {
      console.log(formatCommandHelp(cmd))
      console.log('')
    }
    return
  }

  printBanner('Guía del Agent Manager Template', WHAT_IS_CLAUDIO)

  if (isTemplateRepo()) {
    printSection(
      'Tu situación',
      'Estás en el repo template. Usá "claudio init" para instalar dependencias o "claudio init ./otra-carpeta" para exportar el setup.',
    )
  } else {
    printSection(
      'Tu situación',
      'Parece un proyecto ya configurado. Usá "claudio doctor" para verificar y /plan en Claude Code para trabajar.',
    )
  }

  printSection('Qué se instala con init / evoluciona', [
    '.claude/agents/     → 12 roles (dominio, arquitectura, seguridad, QA…)',
    '.claude/commands/   → 13 slash commands (/plan, /security, /test…)',
    '.claude/hooks/      → 11 guardrails (bash, lint, tests, pipeline)',
    '.claude/skills/     → 10 skills especializados',
    '.claude/rules/      → domain.md, orchestration, seguridad, API…',
    'context + architecture + domain.md generados para TU proyecto',
  ].join('\n'))

  for (const key of ['pipeline', 'agentes', 'comandos', 'hooks', 'skills', 'obsidian', 'hermes', 'gstack'] as const) {
    const t = COMPONENT_TOPICS[key]!
    printSection(t.title, t.body)
  }

  console.log('\nTemas detallados: claudio guia <pipeline|agentes|hooks|skills|obsidian|hermes|gstack|comandos>\n')
  console.log('Documentación: GETTING_STARTED.md · docs/REFERENCE.md · docs/ADVANCED.md\n')
}
