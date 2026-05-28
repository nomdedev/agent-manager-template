import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { commandExists, getCommandVersion } from '../utils/prerequisites.js'
import { HERMES_REPO, HERMES_DOCS } from './hermes-install-guide.js'

const GITHUB_API_LATEST =
  'https://api.github.com/repos/NousResearch/hermes-agent/releases/latest'
const HERMES_GIT_URL = 'https://github.com/NousResearch/hermes-agent.git'

export interface HermesInstallRef {
  kind: 'tag' | 'branch'
  ref: string
}

export interface InstallHermesResult {
  installDir: string
  ref: HermesInstallRef
}

export function getHermesRepoDir(): string {
  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local')
    return join(local, 'hermes', 'hermes-agent')
  }
  return join(homedir(), '.hermes', 'hermes-agent')
}

export async function resolveLatestHermesRef(): Promise<HermesInstallRef> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'agent-manager-template-claudio',
      },
      signal: AbortSignal.timeout(12_000),
    })
    if (res.ok) {
      const data = (await res.json()) as { tag_name?: string }
      if (data.tag_name) {
        return { kind: 'tag', ref: data.tag_name }
      }
    }
  } catch {
    /* fallback */
  }
  return { kind: 'branch', ref: 'main' }
}

function ensureGit(): void {
  if (!commandExists('git')) {
    throw new Error('Git es obligatorio. Instalalo desde https://git-scm.com/downloads')
  }
  const ver = getCommandVersion('git')
  if (ver) {
    console.log(`  ✓ Git: ${ver}`)
  }
}

function cloneHermesRepo(installDir: string, ref: HermesInstallRef): void {
  mkdirSync(dirname(installDir), { recursive: true })

  console.log(`\n📥 Clonando ${HERMES_GIT_URL}`)
  console.log(`   → ${installDir}`)
  console.log(`   ref: ${ref.ref}\n`)

  execSync(
    `git clone --depth 1 --branch "${ref.ref}" --recurse-submodules "${HERMES_GIT_URL}" "${installDir}"`,
    { stdio: 'inherit', timeout: 600_000 },
  )
}

function updateHermesRepo(installDir: string, ref: HermesInstallRef): void {
  console.log(`\n📂 Repo existente: ${installDir}`)
  console.log(`   Actualizando a ${ref.ref}...\n`)

  execSync('git fetch --tags --depth 1 origin', { cwd: installDir, stdio: 'inherit', timeout: 300_000 })
  execSync(`git checkout "${ref.ref}"`, { cwd: installDir, stdio: 'inherit' })
  execSync('git submodule update --init --recursive --depth 1', {
    cwd: installDir,
    stdio: 'inherit',
    timeout: 300_000,
  })
}

export async function installHermesAgent(): Promise<InstallHermesResult> {
  console.log('\n─── Hermes Agent — Obtener repositorio ────────────────')
  console.log(`    ${HERMES_REPO}\n`)
  console.log('  Solo se clona/actualiza el código fuente.')
  console.log('  No se instalan Python, npm, ni paquetes del sistema.\n')

  ensureGit()

  const ref = await resolveLatestHermesRef()
  console.log(
    `\n📌 Versión: ${ref.ref} (${ref.kind === 'tag' ? 'último release en GitHub' : 'rama main'})\n`,
  )

  const installDir = getHermesRepoDir()

  if (existsSync(join(installDir, '.git'))) {
    updateHermesRepo(installDir, ref)
  } else {
    if (existsSync(installDir)) {
      throw new Error(
        `La ruta ${installDir} existe pero no es un clone git. Movela o borrala y reintentá.`,
      )
    }
    cloneHermesRepo(installDir, ref)
  }

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   ✅  Repositorio listo                    ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log(`  Carpeta: ${installDir}`)
  console.log(`  Ref:     ${ref.ref}\n`)
  console.log('  Siguiente (opcional):')
  console.log('    · Seguí el README del repo para tu entorno')
  console.log('    · claudio hermes init programmer  — memoria para este template')
  console.log(`    · ${HERMES_DOCS}\n`)

  return { installDir, ref }
}
