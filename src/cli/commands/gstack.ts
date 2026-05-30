/**
 * claudio gstack — Instalación de gstack (Garry Tan)
 *
 * Instala gstack globalmente en ~/.claude/skills/gstack y ejecuta ./setup --team.
 * Complementa el pipeline del template con skills como /review, /ship, /qa, /browse.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { printGstackInstallIntro, GSTACK_DOCS } from './gstack-install-guide.js'
import { getGstackDir, installGstack, isGstackInstalled } from './gstack-installer.js'
import { commandExists, getCommandVersion } from '../utils/prerequisites.js'

function printHelp(): void {
  console.log(`
claudio gstack — gstack (equipo virtual de ingeniería)

Uso:
  claudio gstack <subcomando>

Subcomandos:
  install    Clona/actualiza github.com/garrytan/gstack y ejecuta ./setup --team
  status     Verifica si gstack está instalado globalmente

Requisitos para setup completo:
  · git
  · bash (Git Bash en Windows)
  · bun (https://bun.sh)

Documentación: ${GSTACK_DOCS}

Este repo ya incluye la sección gstack en .claude/CLAUDE.md (modo team recomendado).
Tras instalar, reiniciá Claude Code o Cursor para cargar los skills.
`)
}

export async function runGstack(sub?: string, _rest: string[] = []): Promise<void> {
  if (!sub || sub === '--help' || sub === '-h') {
    printHelp()
    return
  }

  switch (sub) {
    case 'install': {
      printGstackInstallIntro()
      await installGstack()
      break
    }

    case 'status': {
      const dir = getGstackDir()
      const installed = isGstackInstalled()
      console.log('\n─── Estado de gstack ─────────────────────────────────\n')
      console.log(`  ~/.claude/skills/gstack : ${installed ? '✅ instalado' : '❌ no instalado'}`)
      console.log(`  Ruta                    : ${dir}`)

      if (installed) {
        const versionPath = join(dir, 'VERSION')
        if (existsSync(versionPath)) {
          const version = readFileSync(versionPath, 'utf8').trim()
          console.log(`  Versión                 : ${version}`)
        }
      } else {
        console.log('\n  Ejecutá: claudio gstack install\n')
      }

      const gitVer = getCommandVersion('git')
      const bunVer = getCommandVersion('bun')
      console.log(`  git                     : ${gitVer ?? 'no encontrado'}`)
      console.log(`  bun                     : ${bunVer ?? 'no encontrado (requerido para setup)'}`)
      console.log(`  bash                    : ${commandExists('bash') ? 'disponible' : 'no encontrado'}\n`)
      break
    }

    default:
      console.error(`\n❌ Subcomando desconocido: "${sub}"`)
      console.error('   Ejecutá "claudio gstack --help"\n')
      process.exit(1)
  }
}
