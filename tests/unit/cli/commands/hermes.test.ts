import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock process.exit to prevent the test runner from exiting
const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code?: number) => {
  throw new Error(`process.exit(${_code})`)
})

// Mock execSync — used in runHermesStatus (hermes --version check)
vi.mock('node:child_process', () => ({
  execSync: vi.fn((cmd: string) => {
    if (cmd.includes('hermes --version')) throw new Error('hermes: not found')
    return ''
  }),
  spawnSync: vi.fn(),
}))

// Mock prompts to avoid readline hanging in tests
vi.mock('../../../../src/cli/utils/prompts.js', () => ({
  prompt: vi.fn().mockResolvedValue('test-value'),
  promptYesNo: vi.fn().mockResolvedValue(false),
  promptSelect: vi.fn().mockResolvedValue(0),
  closePrompts: vi.fn(),
}))

const installHermesAgentMock = vi.fn().mockResolvedValue({
  installDir: '/tmp/hermes-agent',
  ref: { kind: 'tag', ref: 'v0.14.0' },
})

vi.mock('../../../../src/cli/commands/hermes-installer.js', () => ({
  installHermesAgent: (...args: unknown[]) => installHermesAgentMock(...args),
}))

import { runHermes } from '../../../../src/cli/commands/hermes.js'

describe('runHermes — dispatch', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Help routes ───────────────────────────────────────────────────────────

  it('prints help when called with no subcommand', async () => {
    await runHermes()
    expect(logSpy).toHaveBeenCalled()
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('install')
    expect(output).toContain('init')
    expect(output).toContain('optimize')
    expect(output).toContain('status')
    expect(output).toContain('gepa')
  })

  it('prints help when called with "--help"', async () => {
    await runHermes('--help')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('claudio hermes')
  })

  it('prints help when called with "-h"', async () => {
    await runHermes('-h')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('claudio hermes')
  })

  it('help output contains memory architecture limits', async () => {
    await runHermes('--help')
    const output = logSpy.mock.calls.flat().join('\n')
    // The help string embeds the char limits at build time
    expect(output).toMatch(/\d+ chars max/)
  })

  // ─── Unknown subcommand ────────────────────────────────────────────────────

  it('exits with code 1 for an unknown subcommand', async () => {
    await expect(runHermes('nonexistent-cmd')).rejects.toThrow('process.exit(1)')
    expect(exitSpy).toHaveBeenCalledWith(1)
  })

  it('prints error message for unknown subcommand', async () => {
    try {
      await runHermes('typo-command')
    } catch { /* process.exit throws in tests */ }
    const errOutput = errSpy.mock.calls.flat().join('\n')
    expect(errOutput).toContain('typo-command')
    expect(errOutput).toContain('desconocido')
  })

  it('error message for unknown subcommand mentions --help', async () => {
    try {
      await runHermes('bad')
    } catch { /* process.exit throws */ }
    const errOutput = errSpy.mock.calls.flat().join('\n')
    expect(errOutput).toContain('--help')
  })

  // ─── status subcommand ────────────────────────────────────────────────────

  it('runs status without throwing', async () => {
    await expect(runHermes('status')).resolves.not.toThrow()
  })

  it('status reports hermes as not installed when binary is absent', async () => {
    await runHermes('status')
    const output = logSpy.mock.calls.flat().join('\n')
    // execSync mock throws for 'hermes --version', so we expect "no instalado" or similar
    expect(output).toMatch(/no instalado|not found|hermes binary/i)
  })

  it('status outputs ~/.hermes existence info', async () => {
    await runHermes('status')
    const output = logSpy.mock.calls.flat().join('\n')
    // Should mention the hermes home directory
    expect(output).toContain('.hermes')
  })

  // ─── gepa subcommand ─────────────────────────────────────────────────────

  it('runs gepa without throwing', async () => {
    await expect(runHermes('gepa')).resolves.not.toThrow()
  })

  it('gepa output contains the GEPA repo URL', async () => {
    await runHermes('gepa')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('github.com')
    expect(output).toContain('hermes-agent')
  })

  it('gepa output explains what GEPA does', async () => {
    await runHermes('gepa')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toMatch(/GEPA|skill|optim/i)
  })

  it('gepa output includes the install steps', async () => {
    await runHermes('gepa')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('git clone')
  })

  // ─── install subcommand (no remote bash) ─────────────────────────────────

  it('install delegates to installHermesAgent', async () => {
    installHermesAgentMock.mockClear()
    await runHermes('install')
    expect(installHermesAgentMock).toHaveBeenCalledTimes(1)
  })
})

// ─── Constants exported via help text ─────────────────────────────────────────

describe('hermes constants (via help text)', () => {
  let logSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('MEMORY_MD_MAX_CHARS is 2200 (embedded in help text)', async () => {
    await runHermes('--help')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('2200')
  })

  it('USER_MD_MAX_CHARS is 1375 (embedded in help text)', async () => {
    await runHermes('--help')
    const output = logSpy.mock.calls.flat().join('\n')
    expect(output).toContain('1375')
  })
})
