#!/usr/bin/env node
/**
 * claudio — CLI del Agent Manager Template
 *
 * Comandos:
 *   claudio evoluciona [target-dir]   Instala el setup completo de Claude Code
 *   claudio --help                    Muestra esta ayuda
 *   claudio --version                 Muestra la versión
 */

import { runEvoluciona } from './commands/evoluciona.js'
import { runHermes } from './commands/hermes.js'
import { vaultCommand } from './commands/vault.js'
import { harnessCommand } from './commands/harness.js'

const VERSION = '0.1.0'

const HELP = `
╔════════════════════════════════════════════╗
║   claudio — Agent Manager CLI             ║
╚════════════════════════════════════════════╝

USO
  claudio <comando> [opciones]

COMANDOS
  evoluciona [target-dir]
    Instala el setup completo de Claude Code en un proyecto.
    Incluye: pipeline de 7 fases, 7 agentes, 12 comandos slash,
    11 hooks de seguridad y calidad, 9 skills especializados.

    Si no se especifica target-dir, el wizard pregunta interactivamente.

    Opciones adicionales en el wizard:
      · Vault de Obsidian (memoria extendida del proyecto)
      · Hermes MCP server (HTTP/SSE o stdio)

  vault <subcomando>              Gestión del vault de Obsidian
    analyze              Analiza salud del vault (tokens, links, eficiencia)
    optimize             Optimiza notas para eficiencia de tokens
    tokens <archivo>     Mide tokens en un archivo

  harness <subcomando>            Auditoría del 12-Rule Standard
    audit [feature]      Audita cumplimiento de reglas
    report [feature]     Genera reporte de eficiencia
    measure-file <f>     Mide tokens de un archivo

  hermes <subcomando>
    Gestión de Hermes Agent con Obsidian como knowledge DB.

    Subcomandos:
      install              Instala Hermes Agent en el sistema
      init [perfil]        Crea ~/.hermes/ con SOUL.md + memoria inicial
      optimize [ruta]      Sincroniza Obsidian vault → Hermes memory
      status               Estado de ~/.hermes/ y sus componentes
      gepa                 Instrucciones para optimizar skills con GEPA

    Flujo recomendado:
      claudio evoluciona   → setup del proyecto + vault Obsidian
      claudio hermes install → instalar Hermes
      claudio hermes init    → SOUL.md + memoria inicial
      claudio hermes optimize → Obsidian → MEMORY.md + skills
      hermes                  → Hermes con contexto completo

EJEMPLOS
  claudio evoluciona
  claudio evoluciona ./mi-nuevo-proyecto
  claudio hermes install
  claudio hermes init programmer
  claudio hermes optimize ./mi-proyecto
  claudio hermes status
  claudio hermes gepa

OPCIONES GLOBALES
  --help, -h      Muestra esta ayuda
  --version, -v   Muestra la versión instalada

DESDE EL TEMPLATE (desarrollo)
  pnpm run claudio evoluciona
  pnpm run claudio evoluciona -- ./mi-proyecto
`

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP)
    process.exit(0)
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`claudio v${VERSION}`)
    process.exit(0)
  }

  const command = args[0]

  switch (command) {
    case 'evoluciona': {
      const targetArg = args[1] && !args[1].startsWith('-') ? args[1] : undefined
      await runEvoluciona(targetArg)
      break
    }

    case 'hermes': {
      await runHermes(args[1], args.slice(2))
      break
    }

    case 'vault': {
      await vaultCommand(args[1], args.slice(2))
      break
    }

    case 'harness': {
      await harnessCommand(args[1], args.slice(2))
      break
    }

    default:
      console.error(`\n❌ Comando desconocido: "${command}"`)
      console.error('   Ejecutá "claudio --help" para ver los comandos disponibles.\n')
      process.exit(1)
  }
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
