import {
  cpSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

export interface HermesConfig {
  type: 'sse' | 'stdio'
  url?: string
  command?: string
  args?: string[]
}

export function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true, force: true })
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function touchGitkeep(dir: string): void {
  ensureDir(dir)
  writeFileSync(join(dir, '.gitkeep'), '')
}

export function patchSettingsJson(
  settingsPath: string,
  projectPath: string,
  hermes?: HermesConfig,
): void {
  if (!existsSync(settingsPath)) return

  const raw = readFileSync(settingsPath, 'utf8')
  const settings = JSON.parse(raw) as Record<string, unknown>

  if (!settings.mcpServers) {
    settings.mcpServers = {}
  }

  const mcpServers = settings.mcpServers as Record<string, unknown>

  // Replace hardcoded filesystem path
  const filesystem = mcpServers.filesystem as { args?: string[] } | undefined
  if (filesystem?.args) {
    filesystem.args = ['-y', '@modelcontextprotocol/server-filesystem', projectPath]
  }

  // Replace hardcoded git repo path
  const git = mcpServers.git as { args?: string[] } | undefined
  if (git?.args) {
    git.args = ['-y', '@modelcontextprotocol/server-git', '--repository', projectPath]
  }

  // Optionally add Hermes MCP
  if (hermes) {
    if (hermes.type === 'sse' && hermes.url) {
      mcpServers['hermes'] = {
        type: 'sse',
        url: hermes.url,
      }
    } else if (hermes.type === 'stdio' && hermes.command) {
      mcpServers['hermes'] = {
        command: hermes.command,
        args: hermes.args ?? [],
        env: {},
      }
    }
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n')
}

export function setHookPermissions(hooksDir: string): void {
  if (process.platform === 'win32') return // chmod not needed on Windows

  if (!existsSync(hooksDir)) return

  function walkAndChmod(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walkAndChmod(full)
      } else if (full.endsWith('.sh') || full.endsWith('.py')) {
        try {
          execSync(`chmod +x "${full}"`)
        } catch {
          // Non-fatal: warn but continue
          console.warn(`  ⚠️  No se pudo hacer chmod +x en: ${full}`)
        }
      }
    }
  }

  walkAndChmod(hooksDir)
}
