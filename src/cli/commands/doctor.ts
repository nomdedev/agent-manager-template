import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { accessSync, constants } from 'node:fs'
import {
  checkNodeVersion,
  isTemplateRepo,
  ensureEnvFile,
} from '../utils/project.js'
import { patchSettingsJson, setHookPermissions } from '../utils/installer.js'
import { hasMattPocockSkills } from '../utils/skills.js'
import { isGstackInstalled } from './gstack-installer.js'

type CheckStatus = 'ok' | 'warn' | 'fail'

interface CheckResult {
  status: CheckStatus
  message: string
  fix?: string
}

function countMdFiles(dir: string): number {
  if (!existsSync(dir)) return 0
  return readdirSync(dir).filter(f => f.endsWith('.md')).length
}

function checkMcpPaths(settingsPath: string, projectPath: string): CheckResult {
  if (!existsSync(settingsPath)) {
    return { status: 'fail', message: 'settings.json no encontrado', fix: 'claudio init' }
  }

  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8')) as {
      mcpServers?: Record<string, { args?: string[] }>
    }
    const fs = settings.mcpServers?.filesystem
    const git = settings.mcpServers?.git
    const fsPath = fs?.args?.[fs.args.length - 1]
    const gitPath = git?.args?.[git.args.length - 1]

    const resolved = resolve(projectPath)
    const fsOk = fsPath === resolved
    const gitOk = gitPath === resolved

    if (fsOk && gitOk) {
      return { status: 'ok', message: 'settings.json MCP paths' }
    }

    patchSettingsJson(settingsPath, projectPath)
    return { status: 'warn', message: 'MCP paths corregidos automáticamente' }
  } catch {
    return { status: 'fail', message: 'settings.json inválido', fix: 'claudio init' }
  }
}

function checkHooksExecutable(hooksDir: string): CheckResult {
  if (process.platform === 'win32') {
    return {
      status: 'warn',
      message: 'Windows: hooks requieren Git Bash para bash/python',
    }
  }

  if (!existsSync(hooksDir)) {
    return { status: 'fail', message: 'Directorio hooks no encontrado', fix: 'claudio init' }
  }

  let missing = 0
  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
      } else if (full.endsWith('.sh') || full.endsWith('.py')) {
        try {
          accessSync(full, constants.X_OK)
        } catch {
          missing++
        }
      }
    }
  }
  walk(hooksDir)

  if (missing > 0) {
    setHookPermissions(hooksDir)
    return { status: 'warn', message: `Permisos de hooks corregidos (${missing} archivos)` }
  }

  return { status: 'ok', message: 'Hooks ejecutables' }
}

function icon(status: CheckStatus): string {
  if (status === 'ok') return '✓'
  if (status === 'warn') return '⚠'
  return '✗'
}

export async function runDoctor(cwd = process.cwd()): Promise<number> {
  const projectPath = resolve(cwd)
  const claudeDir = join(projectPath, '.claude')
  const results: CheckResult[] = []

  const node = checkNodeVersion()
  results.push(
    node.ok
      ? { status: 'ok', message: `Node ${node.version}` }
      : { status: 'fail', message: node.message ?? 'Node incompatible', fix: 'https://nodejs.org' },
  )

  if (!existsSync(claudeDir)) {
    results.push({
      status: 'fail',
      message: '.claude/ no encontrado',
      fix: 'claudio init o claudio evoluciona',
    })
  } else {
    const agents = countMdFiles(join(claudeDir, 'agents'))
    const commands = countMdFiles(join(claudeDir, 'commands'))
    const skillsDirs = existsSync(join(claudeDir, 'skills'))
      ? readdirSync(join(claudeDir, 'skills')).filter(d =>
          existsSync(join(claudeDir, 'skills', d, 'SKILL.md')),
        ).length
      : 0
    results.push({
      status: 'ok',
      message: `.claude/ (${agents} agentes, ${commands} comandos, ${skillsDirs} skills)`,
    })

    results.push(checkMcpPaths(join(claudeDir, 'settings.json'), projectPath))
    results.push(checkHooksExecutable(join(claudeDir, 'hooks')))

    const mattOk = hasMattPocockSkills(projectPath)
    const agentsDocs = join(projectPath, 'docs', 'agents', 'issue-tracker.md')
    results.push(
      mattOk
        ? { status: 'ok', message: 'mattpocock/skills (.agents/skills/)' }
        : {
            status: 'warn',
            message: 'mattpocock/skills no instaladas',
            fix: 'pnpm run skills:install',
          },
    )
    results.push(
      existsSync(agentsDocs)
        ? { status: 'ok', message: 'docs/agents/ configurado' }
        : {
            status: 'warn',
            message: 'docs/agents/ faltante',
            fix: 'claudio evoluciona o copiar desde el template',
          },
    )
    results.push(
      existsSync(join(projectPath, 'CONTEXT.md'))
        ? { status: 'ok', message: 'CONTEXT.md (raíz)' }
        : {
            status: 'warn',
            message: 'CONTEXT.md faltante',
            fix: 'copiar CONTEXT.md del template',
          },
    )

    results.push(
      isGstackInstalled()
        ? { status: 'ok', message: 'gstack (~/.claude/skills/gstack)' }
        : {
            status: 'warn',
            message: 'gstack no instalado (recomendado)',
            fix: 'pnpm run gstack:install',
          },
    )
  }

  if (isTemplateRepo(projectPath)) {
    const envPath = join(projectPath, '.env')
    const examplePath = join(projectPath, '.env.example')
    if (!existsSync(envPath) && existsSync(examplePath)) {
      ensureEnvFile(projectPath)
      results.push({ status: 'warn', message: '.env creado desde .env.example' })
    } else if (!existsSync(envPath)) {
      results.push({
        status: 'warn',
        message: '.env missing',
        fix: 'cp .env.example .env',
      })
    } else {
      results.push({ status: 'ok', message: '.env presente' })
    }
  }

  console.log('\n╔════════════════════════════════════════════╗')
  console.log('║   claudio doctor                           ║')
  console.log('╚════════════════════════════════════════════╝\n')

  let hasFail = false
  for (const r of results) {
    console.log(`  ${icon(r.status)} ${r.message}`)
    if (r.fix) {
      console.log(`      → ${r.fix}`)
    }
    if (r.status === 'fail') hasFail = true
  }

  console.log('')
  if (hasFail) {
    console.log('  Corregí los ítems marcados con ✗ y volvé a ejecutar claudio doctor.\n')
    return 1
  }

  console.log('  → Listo para Claude Code. Probá /plan con una feature pequeña.\n')
  return 0
}
