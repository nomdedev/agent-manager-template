import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { existsSync } from 'node:fs'
import { resolveLatestHermesRef, getHermesRepoDir } from '../../../../src/cli/commands/hermes-installer.js'

const execSyncMock = vi.fn()

vi.mock('node:child_process', () => ({
  execSync: (...args: unknown[]) => execSyncMock(...args),
}))

vi.mock('../../../../src/cli/utils/prerequisites.js', () => ({
  commandExists: vi.fn(() => true),
  getCommandVersion: vi.fn(() => 'git version 2.43.0'),
}))

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    existsSync: vi.fn(actual.existsSync),
    mkdirSync: vi.fn(actual.mkdirSync),
  }
})

describe('resolveLatestHermesRef', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns latest tag from GitHub API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: 'v0.14.0' }),
      }),
    )
    const ref = await resolveLatestHermesRef()
    expect(ref).toEqual({ kind: 'tag', ref: 'v0.14.0' })
  })

  it('falls back to main when API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const ref = await resolveLatestHermesRef()
    expect(ref).toEqual({ kind: 'branch', ref: 'main' })
  })
})

describe('installHermesAgent', () => {
  beforeEach(() => {
    execSyncMock.mockReset()
    vi.mocked(existsSync).mockReturnValue(false)
  })

  it('clones repo with git only', async () => {
    const { installHermesAgent } = await import('../../../../src/cli/commands/hermes-installer.js')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: 'v0.14.0' }),
      }),
    )

    const result = await installHermesAgent()

    expect(result.ref).toEqual({ kind: 'tag', ref: 'v0.14.0' })
    expect(result.installDir).toBe(getHermesRepoDir())

    const cloneCall = execSyncMock.mock.calls.find(c =>
      String(c[0]).includes('git clone'),
    )
    expect(cloneCall).toBeDefined()
    expect(String(cloneCall![0])).toContain('hermes-agent.git')

    const ps1Call = execSyncMock.mock.calls.find(c => String(c[0]).includes('powershell'))
    expect(ps1Call).toBeUndefined()
  })
})
