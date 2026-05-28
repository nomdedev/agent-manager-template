#!/usr/bin/env node
/**
 * claudio — CLI del Agent Manager Template
 */

import { runEvoluciona } from './commands/evoluciona.js'
import { runHermes } from './commands/hermes.js'
import { vaultCommand } from './commands/vault.js'
import { harnessCommand } from './commands/harness.js'
import { runInit } from './commands/init.js'
import { runDoctor } from './commands/doctor.js'
import { runMainMenu } from './commands/menu.js'
import { runGuia } from './commands/guia.js'
import { runHermesInteractive } from './commands/menu.js'
import { parseInitArgs, parseEvolucionaArgs } from './utils/args.js'
import { buildFullHelp } from './catalog.js'
import { isInteractive } from './utils/ui.js'
import { VAULT_CHOICES, HARNESS_CHOICES } from './catalog.js'
import { printChoices } from './utils/ui.js'

const VERSION = '0.1.0'

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    await runMainMenu()
    return
  }

  if (args.includes('--help') || args.includes('-h')) {
    const cmd = args.find(a => !a.startsWith('-'))
    if (cmd === 'hermes') {
      await runHermes('--help')
      return
    }
    console.log(buildFullHelp())
    process.exit(0)
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`claudio v${VERSION}`)
    process.exit(0)
  }

  const command = args[0]
  const rest = args.slice(1)

  switch (command) {
    case 'init': {
      await runInit(parseInitArgs(rest))
      break
    }

    case 'doctor': {
      const code = await runDoctor()
      process.exit(code)
    }

    case 'evoluciona': {
      const flags = parseEvolucionaArgs(rest)
      await runEvoluciona({
        targetArg: flags.targetDir,
        minimal: flags.minimal,
        yes: flags.yes,
      })
      break
    }

    case 'menu': {
      await runMainMenu()
      break
    }

    case 'guia':
    case 'guide': {
      const topic = rest.find(a => !a.startsWith('-'))
      runGuia(topic)
      break
    }

    case 'hermes': {
      const sub = rest[0]
      const subRest = rest.slice(1)
      if (!sub && isInteractive()) {
        await runHermesInteractive()
        break
      }
      await runHermes(sub, subRest)
      break
    }

    case 'vault': {
      const sub = rest[0]
      if (!sub && isInteractive()) {
        const { runVaultMenu } = await import('./commands/menu.js')
        await runVaultMenu()
        break
      }
      if (!sub || sub === '--help' || sub === '-h') {
        console.log('\nclaudio vault — Vault Obsidian (opcional)\n')
        printChoices(VAULT_CHOICES)
        console.log('Uso directo: claudio vault analyze | optimize | tokens <archivo>\n')
        break
      }
      await vaultCommand(sub, rest.slice(1))
      break
    }

    case 'harness': {
      const sub = rest[0]
      if (!sub && isInteractive()) {
        const { runHarnessMenu } = await import('./commands/menu.js')
        await runHarnessMenu()
        break
      }
      if (!sub || sub === '--help' || sub === '-h') {
        console.log('\nclaudio harness — Auditoría 12-Rule Standard\n')
        printChoices(HARNESS_CHOICES)
        console.log('Uso: claudio harness audit [feature-id]\n')
        break
      }
      await harnessCommand(sub, rest.slice(1))
      break
    }

    default:
      console.error(`\n❌ Comando desconocido: "${command}"`)
      console.error('   Ejecutá "claudio" para el menú o "claudio --help" para la lista.\n')
      process.exit(1)
  }
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
