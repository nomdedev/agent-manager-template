import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { commandExists, getCommandVersion } from '../utils/prerequisites.js'
import { GSTACK_REPO } from './gstack-install-guide.js'

const GSTACK_GIT_URL = 'https://github.com/garrytan/gstack.git'

export interface InstallGstackResult {
  installDir: string
  setupRan: boolean
  setupMessage?: string
}

export function getGstackDir(): string {
  return join(homedir(), '.claude', 'skills', 'gstack')
}

function resolveBashPath(): string | null {
  if (process.platform !== 'win32') {
    return commandExists('bash') ? 'bash' : null
  }

  const candidates = [
    process.env.BASH_PATH,
    join(process.env.ProgramFiles ?? 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
    join(process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'),
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return commandExists('bash') ? 'bash' : null
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

function cloneGstackRepo(installDir: string): void {
  mkdirSync(join(installDir, '..'), { recursive: true })

  console.log(`\n📥 Clonando ${GSTACK_GIT_URL}`)
  console.log(`   → ${installDir}\n`)

  execSync(`git clone --single-branch --depth 1 "${GSTACK_GIT_URL}" "${installDir}"`, {
    stdio: 'inherit',
    timeout: 600_000,
  })
}

function updateGstackRepo(installDir: string): void {
  console.log(`\n📂 Repo existente: ${installDir}`)
  console.log('   Actualizando...\n')

  execSync('git fetch --depth 1 origin main', { cwd: installDir, stdio: 'inherit', timeout: 300_000 })
  execSync('git checkout main', { cwd: installDir, stdio: 'inherit' })
  execSync('git pull --ff-only origin main', { cwd: installDir, stdio: 'inherit', timeout: 300_000 })
}

function runGstackSetup(installDir: string): { ran: boolean; message?: string } {
  const bash = resolveBashPath()
  if (!bash) {
    return {
      ran: false,
      message:
        'bash no encontrado. En Windows instalá Git for Windows y reintentá, o ejecutá manualmente: cd ~/.claude/skills/gstack && ./setup --team',
    }
  }

  if (!commandExists('bun')) {
    return {
      ran: false,
      message:
        'bun no está instalado (requerido por gstack). Instalalo desde https://bun.sh y luego ejecutá: cd ~/.claude/skills/gstack && ./setup --team',
    }
  }

  const bunVer = getCommandVersion('bun')
  if (bunVer) {
    console.log(`  ✓ Bun: ${bunVer}`)
  }

  console.log('\n⚙️  Ejecutando ./setup --team -q...\n')

  const setupArgs = ['./setup', '--team', '-q']
  if (bash === 'bash') {
    execSync(`bash ${setupArgs.join(' ')}`, {
      cwd: installDir,
      stdio: 'inherit',
      timeout: 600_000,
    })
  } else {
    execSync(`"${bash}" ${setupArgs.join(' ')}`, {
      cwd: installDir,
      stdio: 'inherit',
      timeout: 600_000,
    })
  }

  return { ran: true }
}

export async function installGstack(): Promise<InstallGstackResult> {
  console.log('\n─── gstack — Instalación global ───────────────────────')
  console.log(`    ${GSTACK_REPO}\n`)

  ensureGit()

  const installDir = getGstackDir()

  if (existsSync(join(installDir, '.git'))) {
    updateGstackRepo(installDir)
  } else {
    if (existsSync(installDir)) {
      throw new Error(
        `La ruta ${installDir} existe pero no es un clone git. Movela o borrala y reintentá.`,
      )
    }
    cloneGstackRepo(installDir)
  }

  let setupResult: { ran: boolean; message?: string }
  try {
    setupResult = runGstackSetup(installDir)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    setupResult = {
      ran: false,
      message: `setup falló: ${msg}. Ejecutá manualmente: cd ${installDir} && ./setup --team`,
    }
  }

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   ✅  gstack listo                         ║')
  console.log('╚════════════════════════════════════════════╝\n')
  console.log(`  Carpeta: ${installDir}`)
  console.log(`  Setup:   ${setupResult.ran ? 'completado (--team)' : 'pendiente'}\n`)

  if (setupResult.message) {
    console.log(`  ⚠️  ${setupResult.message}\n`)
  }

  console.log('  Skills disponibles tras setup: /review, /ship, /qa, /office-hours, /browse')
  console.log('  Ver también la sección gstack en .claude/CLAUDE.md\n')

  return {
    installDir,
    setupRan: setupResult.ran,
    setupMessage: setupResult.message,
  }
}

export function isGstackInstalled(): boolean {
  const dir = getGstackDir()
  return existsSync(join(dir, 'bin')) && existsSync(join(dir, '.git'))
}
