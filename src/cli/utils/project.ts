import { existsSync, readFileSync, copyFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const TEMPLATE_PACKAGE_NAME = 'agent-manager-template'
const MIN_NODE_MAJOR = 20

export function checkNodeVersion(): { ok: boolean; version: string; message?: string } {
  const version = process.version
  const major = Number.parseInt(version.slice(1).split('.')[0] ?? '0', 10)
  if (major < MIN_NODE_MAJOR) {
    return {
      ok: false,
      version,
      message: `Node.js ${MIN_NODE_MAJOR}+ requerido. Instalá desde https://nodejs.org`,
    }
  }
  return { ok: true, version }
}

export function isTemplateRepo(cwd = process.cwd()): boolean {
  const pkgPath = join(cwd, 'package.json')
  if (!existsSync(pkgPath)) return false
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { name?: string }
    return pkg.name === TEMPLATE_PACKAGE_NAME
  } catch {
    return false
  }
}

export function hasPnpm(): boolean {
  try {
    execSync('pnpm --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

export function installDependencies(cwd: string): void {
  const cmd = hasPnpm() ? 'pnpm install' : 'npm install'
  console.log(`\n📦 Ejecutando: ${cmd}`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

export function ensureEnvFile(cwd: string): boolean {
  const envPath = join(cwd, '.env')
  const examplePath = join(cwd, '.env.example')
  if (existsSync(envPath)) return false
  if (!existsSync(examplePath)) return false
  copyFileSync(examplePath, envPath)
  return true
}

export function getTemplateRoot(fromModuleUrl: string): string {
  const __filename = fileURLToPath(fromModuleUrl)
  return resolve(dirname(__filename), '..', '..', '..')
}
