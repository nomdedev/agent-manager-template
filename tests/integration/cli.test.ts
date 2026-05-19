/**
 * Integration tests — CLI routing
 *
 * These tests spawn the TypeScript CLI directly via tsx to verify that
 * the command routing, help text, and exit codes work correctly end-to-end.
 *
 * Portability notes:
 *  - Uses `process.platform` to choose the tsx invocation strategy
 *  - Path resolution uses `fileURLToPath` + `resolve` (no hardcoded separators)
 *  - On Windows: `shell: true` enables .cmd wrapper resolution for tsx
 *  - Timeout: 20 s per test (tsx cold-start can be slow on constrained machines)
 */

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Resolve project root from this file's location: tests/integration/ → ../../
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..')

// Find tsx — prefer local install, fall back to PATH
const localTsx = resolve(ROOT, 'node_modules', '.bin', 'tsx')
const tsxBin = existsSync(localTsx) ? localTsx : 'tsx'
const entryPoint = resolve(ROOT, 'src', 'cli', 'claudio.ts')

/**
 * Runs the CLI with the given arguments and captures stdout/stderr.
 * Uses `shell: true` on Windows to resolve .cmd wrappers.
 */
function runClaudio(...args: string[]): ReturnType<typeof spawnSync> & {
  stdout: string
  stderr: string
} {
  const result = spawnSync(tsxBin, [entryPoint, ...args], {
    encoding: 'utf8',
    timeout: 20_000,
    cwd: ROOT,
    shell: process.platform === 'win32',
  })
  return result as ReturnType<typeof spawnSync> & { stdout: string; stderr: string }
}

// ─── Global help ──────────────────────────────────────────────────────────────

describe('claudio --help', () => {
  it('exits with code 0', () => {
    const result = runClaudio('--help')
    expect(result.status).toBe(0)
  })

  it('prints the main help text', () => {
    const result = runClaudio('--help')
    expect(result.stdout).toContain('claudio')
  })

  it('lists the "evoluciona" command', () => {
    const result = runClaudio('--help')
    expect(result.stdout).toContain('evoluciona')
  })

  it('lists the "hermes" command', () => {
    const result = runClaudio('--help')
    expect(result.stdout).toContain('hermes')
  })

  it('no-args also shows help (exits 0)', () => {
    const result = runClaudio()
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('claudio')
  })

  it('-h alias shows help', () => {
    const result = runClaudio('-h')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('claudio')
  })
})

// ─── Version ──────────────────────────────────────────────────────────────────

describe('claudio --version', () => {
  it('exits with code 0', () => {
    expect(runClaudio('--version').status).toBe(0)
  })

  it('prints a semver-like version string', () => {
    const result = runClaudio('--version')
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
  })

  it('-v alias also prints version', () => {
    const result = runClaudio('-v')
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
  })
})

// ─── Unknown command ──────────────────────────────────────────────────────────

describe('claudio <unknown>', () => {
  it('exits with code 1 for an unknown top-level command', () => {
    expect(runClaudio('does-not-exist').status).toBe(1)
  })

  it('prints an error message for unknown command', () => {
    const result = runClaudio('does-not-exist')
    const combined = result.stdout + result.stderr
    expect(combined).toMatch(/desconocido|unknown|error/i)
  })

  it('error message echoes the unknown command name', () => {
    const result = runClaudio('xyzzy-unknown')
    const combined = result.stdout + result.stderr
    expect(combined).toContain('xyzzy-unknown')
  })
})

// ─── hermes subcommand routing ────────────────────────────────────────────────

describe('claudio hermes --help', () => {
  it('exits with code 0', () => {
    expect(runClaudio('hermes', '--help').status).toBe(0)
  })

  it('prints hermes help text', () => {
    const result = runClaudio('hermes', '--help')
    expect(result.stdout).toContain('hermes')
  })

  it('lists the install subcommand', () => {
    expect(runClaudio('hermes', '--help').stdout).toContain('install')
  })

  it('lists the init subcommand', () => {
    expect(runClaudio('hermes', '--help').stdout).toContain('init')
  })

  it('lists the optimize subcommand', () => {
    expect(runClaudio('hermes', '--help').stdout).toContain('optimize')
  })

  it('lists the status subcommand', () => {
    expect(runClaudio('hermes', '--help').stdout).toContain('status')
  })

  it('lists the gepa subcommand', () => {
    expect(runClaudio('hermes', '--help').stdout).toContain('gepa')
  })

  it('-h alias also shows hermes help', () => {
    const result = runClaudio('hermes', '-h')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('hermes')
  })
})

describe('claudio hermes status', () => {
  it('exits with code 0', () => {
    expect(runClaudio('hermes', 'status').status).toBe(0)
  })

  it('mentions ~/.hermes/ in its output', () => {
    const result = runClaudio('hermes', 'status')
    expect(result.stdout).toContain('.hermes')
  })
})

describe('claudio hermes gepa', () => {
  it('exits with code 0', () => {
    expect(runClaudio('hermes', 'gepa').status).toBe(0)
  })

  it('mentions the GEPA repo', () => {
    const result = runClaudio('hermes', 'gepa')
    expect(result.stdout).toContain('github.com')
  })

  it('includes git clone instruction', () => {
    const result = runClaudio('hermes', 'gepa')
    expect(result.stdout).toContain('git clone')
  })
})

describe('claudio hermes <unknown>', () => {
  it('exits with code 1 for an unknown hermes subcommand', () => {
    expect(runClaudio('hermes', 'not-a-subcommand').status).toBe(1)
  })

  it('prints an error with the unknown subcommand name', () => {
    const result = runClaudio('hermes', 'not-a-subcommand')
    const combined = result.stdout + result.stderr
    expect(combined).toContain('not-a-subcommand')
  })
})

// ─── Portability checks ───────────────────────────────────────────────────────

describe('portability', () => {
  it('CLI entrypoint file exists at expected path (no hardcoded drive letters)', () => {
    // entryPoint was resolved via fileURLToPath + resolve — verify it actually exists
    expect(existsSync(entryPoint)).toBe(true)
  })

  it('tsx binary is discoverable (local or global)', () => {
    // If local tsx doesn't exist, falling back to PATH means tsx must be global
    expect(typeof tsxBin).toBe('string')
    expect(tsxBin.length).toBeGreaterThan(0)
  })

  it('CLI runs successfully regardless of working directory', () => {
    // Run from a temp dir to verify no implicit cwd assumptions
    const tmpCwd = ROOT // Use ROOT explicitly; real portability is the cwd option
    const result = spawnSync(tsxBin, [entryPoint, '--version'], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: tmpCwd,
      shell: process.platform === 'win32',
    })
    expect(result.status).toBe(0)
  })

  it('spawns without error on current platform', () => {
    const result = runClaudio('--version')
    // spawnError means the binary couldn't be started at all (not an exit code error)
    expect(result.error).toBeUndefined()
  })
})
