import { execSync } from 'node:child_process'

export interface PrereqCheck {
  id: string
  label: string
  ok: boolean
  detail: string
  required: boolean
  fix?: string
}

export interface PrereqReport {
  checks: PrereqCheck[]
  ok: boolean
}

function tryExec(cmd: string): string | null {
  try {
    const out = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 15_000,
      shell: process.platform === 'win32' ? 'cmd.exe' : undefined,
    })
    return out.trim().split(/\r?\n/)[0] ?? null
  } catch {
    return null
  }
}

export function commandExists(name: string): boolean {
  if (process.platform === 'win32') {
    return tryExec(`where ${name}`) !== null
  }
  return tryExec(`command -v ${name}`) !== null
}

export function getCommandVersion(
  name: string,
  versionArgs = '--version',
): string | null {
  return tryExec(`${name} ${versionArgs}`)
}

function parseNodeMajor(versionLine: string | null): number | null {
  if (!versionLine) return null
  const m = versionLine.match(/v?(\d+)/)
  return m ? Number.parseInt(m[1], 10) : null
}

function parsePythonMajorMinor(versionLine: string | null): { major: number; minor: number } | null {
  if (!versionLine) return null
  const m = versionLine.match(/Python (\d+)\.(\d+)/i)
  if (!m) return null
  return { major: Number.parseInt(m[1], 10), minor: Number.parseInt(m[2], 10) }
}

export interface PrereqOptions {
  needNpm: boolean
  needCurl: boolean
  needPowerShell: boolean
  minNodeMajor?: number
  minPythonMajor?: number
  minPythonMinor?: number
}

const DEFAULT_OPTS: PrereqOptions = {
  needNpm: false,
  needCurl: false,
  needPowerShell: false,
  minNodeMajor: 18,
  minPythonMajor: 3,
  minPythonMinor: 11,
}

export function runPrerequisiteChecks(
  overrides: Partial<PrereqOptions> = {},
): PrereqReport {
  const opts = { ...DEFAULT_OPTS, ...overrides }
  const checks: PrereqCheck[] = []

  const gitVer = getCommandVersion('git')
  checks.push({
    id: 'git',
    label: 'Git',
    ok: Boolean(gitVer),
    detail: gitVer ?? 'no encontrado',
    required: true,
    fix: 'https://git-scm.com/downloads',
  })

  const nodeVer = getCommandVersion('node')
  const nodeMajor = parseNodeMajor(nodeVer)
  const nodeOk = nodeMajor !== null && nodeMajor >= (opts.minNodeMajor ?? 18)
  checks.push({
    id: 'node',
    label: 'Node.js',
    ok: nodeOk,
    detail: nodeVer ?? 'no encontrado',
    required: false,
    fix: `https://nodejs.org (>= ${opts.minNodeMajor})`,
  })

  const npmVer = getCommandVersion('npm')
  checks.push({
    id: 'npm',
    label: 'npm',
    ok: Boolean(npmVer),
    detail: npmVer ?? 'no encontrado',
    required: opts.needNpm,
    fix: 'Viene con Node.js — reinstalá Node si falta',
  })

  const pnpmVer = getCommandVersion('pnpm')
  checks.push({
    id: 'pnpm',
    label: 'pnpm',
    ok: Boolean(pnpmVer),
    detail: pnpmVer ? `${pnpmVer} (opcional)` : 'no instalado (opcional)',
    required: false,
    fix: 'npm install -g pnpm — no es obligatorio para Hermes',
  })

  let pythonVer = getCommandVersion('python') ?? getCommandVersion('python3')
  const py = parsePythonMajorMinor(pythonVer)
  const pythonOk =
    py !== null &&
    (py.major > (opts.minPythonMajor ?? 3) ||
      (py.major === (opts.minPythonMajor ?? 3) && py.minor >= (opts.minPythonMinor ?? 11)))
  checks.push({
    id: 'python',
    label: 'Python',
    ok: pythonOk,
    detail: pythonVer
      ? pythonOk
        ? pythonVer
        : `${pythonVer} — se recomienda 3.11+ (el instalador puede instalarlo con uv)`
      : 'no encontrado — el instalador intentará instalar 3.11 con uv',
    required: false,
    fix: 'https://www.python.org/downloads/ o dejá que el instalador use uv',
  })

  const uvVer = getCommandVersion('uv')
  checks.push({
    id: 'uv',
    label: 'uv (Python)',
    ok: Boolean(uvVer),
    detail: uvVer ?? 'se instalará automáticamente si hace falta',
    required: false,
  })

  if (opts.needCurl) {
    const curlVer = getCommandVersion('curl')
    checks.push({
      id: 'curl',
      label: 'curl',
      ok: Boolean(curlVer),
      detail: curlVer ?? 'no encontrado',
      required: true,
      fix: 'En Windows 10+: curl viene con el sistema; en macOS: preinstalado',
    })
  }

  if (opts.needPowerShell) {
    const ps = tryExec('powershell -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"')
    checks.push({
      id: 'powershell',
      label: 'PowerShell',
      ok: Boolean(ps),
      detail: ps ? `v${ps}` : 'no encontrado',
      required: true,
      fix: 'Usá PowerShell 5.1+ o PowerShell 7 en Windows',
    })
  }

  const ok = checks.filter(c => c.required).every(c => c.ok)
  return { checks, ok }
}

export function printPrerequisiteReport(report: PrereqReport): void {
  console.log('\n── Prerrequisitos ───────────────────────────────────────\n')
  for (const c of report.checks) {
    const icon = c.ok ? '✓' : c.required ? '✗' : '⚠'
    console.log(`  ${icon} ${c.label.padEnd(12)} ${c.detail}`)
    if (!c.ok && c.fix) {
      console.log(`      → ${c.fix}`)
    }
  }
  console.log('')
}
