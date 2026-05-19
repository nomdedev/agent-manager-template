import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  existsSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
} from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  copyDir,
  ensureDir,
  touchGitkeep,
  patchSettingsJson,
  setHookPermissions,
} from '../../../../src/cli/utils/installer.js'

let tmp: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'claudio-installer-test-'))
})

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true })
})

// ─── ensureDir ────────────────────────────────────────────────────────────────

describe('ensureDir', () => {
  it('creates a directory recursively', () => {
    const target = join(tmp, 'a', 'b', 'c')
    ensureDir(target)
    expect(existsSync(target)).toBe(true)
    expect(statSync(target).isDirectory()).toBe(true)
  })

  it('is idempotent — does not throw if the directory already exists', () => {
    const target = join(tmp, 'existing')
    ensureDir(target)
    expect(() => ensureDir(target)).not.toThrow()
  })

  it('handles deeply nested paths (portability: uses OS-native separator)', () => {
    const target = join(tmp, 'level1', 'level2', 'level3', 'level4')
    ensureDir(target)
    expect(existsSync(target)).toBe(true)
  })
})

// ─── touchGitkeep ─────────────────────────────────────────────────────────────

describe('touchGitkeep', () => {
  it('creates a .gitkeep file inside the given directory', () => {
    const target = join(tmp, 'empty-dir')
    mkdirSync(target)
    touchGitkeep(target)
    expect(existsSync(join(target, '.gitkeep'))).toBe(true)
  })

  it('creates the parent directory if it does not exist', () => {
    const target = join(tmp, 'new', 'nested', 'dir')
    touchGitkeep(target)
    expect(existsSync(target)).toBe(true)
    expect(existsSync(join(target, '.gitkeep'))).toBe(true)
  })

  it('overwrites an existing .gitkeep without error', () => {
    const target = join(tmp, 'existing-dir')
    mkdirSync(target)
    writeFileSync(join(target, '.gitkeep'), 'old')
    touchGitkeep(target)
    expect(readFileSync(join(target, '.gitkeep'), 'utf8')).toBe('')
  })
})

// ─── copyDir ──────────────────────────────────────────────────────────────────

describe('copyDir', () => {
  it('copies a flat directory', () => {
    const src = join(tmp, 'src-flat')
    const dest = join(tmp, 'dest-flat')
    mkdirSync(src)
    writeFileSync(join(src, 'file.txt'), 'hello')
    copyDir(src, dest)
    expect(readFileSync(join(dest, 'file.txt'), 'utf8')).toBe('hello')
  })

  it('copies nested directories recursively', () => {
    const src = join(tmp, 'src-nested')
    const dest = join(tmp, 'dest-nested')
    mkdirSync(join(src, 'sub'), { recursive: true })
    writeFileSync(join(src, 'root.txt'), 'root')
    writeFileSync(join(src, 'sub', 'child.txt'), 'child')
    copyDir(src, dest)
    expect(readFileSync(join(dest, 'root.txt'), 'utf8')).toBe('root')
    expect(readFileSync(join(dest, 'sub', 'child.txt'), 'utf8')).toBe('child')
  })

  it('overwrites existing files at destination', () => {
    const src = join(tmp, 'src-over')
    const dest = join(tmp, 'dest-over')
    mkdirSync(src)
    mkdirSync(dest)
    writeFileSync(join(src, 'file.txt'), 'new content')
    writeFileSync(join(dest, 'file.txt'), 'old content')
    copyDir(src, dest)
    expect(readFileSync(join(dest, 'file.txt'), 'utf8')).toBe('new content')
  })

  it('creates destination directory if it does not exist', () => {
    const src = join(tmp, 'src-create')
    const dest = join(tmp, 'dest-create')
    mkdirSync(src)
    writeFileSync(join(src, 'x.md'), '# hi')
    copyDir(src, dest)
    expect(existsSync(dest)).toBe(true)
  })
})

// ─── patchSettingsJson ────────────────────────────────────────────────────────

describe('patchSettingsJson', () => {
  function writeSettings(obj: unknown): string {
    const p = join(tmp, `settings-${Date.now()}.json`)
    writeFileSync(p, JSON.stringify(obj, null, 2))
    return p
  }

  it('replaces filesystem MCP args with the project path', () => {
    const projectPath = join(tmp, 'myproject')
    const settingsPath = writeSettings({
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/hardcoded/old/path'],
        },
      },
    })
    patchSettingsJson(settingsPath, projectPath)
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers.filesystem.args[2]).toBe(projectPath)
  })

  it('replaces git MCP --repository path with the project path', () => {
    const projectPath = join(tmp, 'myproject')
    const settingsPath = writeSettings({
      mcpServers: {
        git: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-git', '--repository', '/old/repo'],
        },
      },
    })
    patchSettingsJson(settingsPath, projectPath)
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers.git.args[3]).toBe(projectPath)
  })

  it('creates mcpServers key when it is missing', () => {
    const settingsPath = writeSettings({})
    patchSettingsJson(settingsPath, tmp)
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers).toBeDefined()
  })

  it('adds Hermes SSE MCP entry when config type is sse', () => {
    const settingsPath = writeSettings({ mcpServers: {} })
    patchSettingsJson(settingsPath, tmp, { type: 'sse', url: 'http://localhost:3001/sse' })
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers.hermes).toEqual({
      type: 'sse',
      url: 'http://localhost:3001/sse',
    })
  })

  it('adds Hermes stdio MCP entry when config type is stdio', () => {
    const settingsPath = writeSettings({ mcpServers: {} })
    patchSettingsJson(settingsPath, tmp, {
      type: 'stdio',
      command: 'hermes',
      args: ['--mcp'],
    })
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers.hermes).toMatchObject({ command: 'hermes', args: ['--mcp'] })
  })

  it('does not add hermes key when no hermes config is provided', () => {
    const settingsPath = writeSettings({ mcpServers: {} })
    patchSettingsJson(settingsPath, tmp)
    const result = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(result.mcpServers.hermes).toBeUndefined()
  })

  it('does nothing if the settings file does not exist (no throw)', () => {
    expect(() =>
      patchSettingsJson(join(tmp, 'nonexistent.json'), tmp),
    ).not.toThrow()
  })

  it('produces valid JSON output (portability: OS-native path separators in JSON)', () => {
    const projectPath = join('some', 'deep', 'project')
    const settingsPath = writeSettings({
      mcpServers: {
        filesystem: { args: ['-y', '@modelcontextprotocol/server-filesystem', '/old'] },
      },
    })
    patchSettingsJson(settingsPath, projectPath)
    const content = readFileSync(settingsPath, 'utf8')
    expect(() => JSON.parse(content)).not.toThrow()
    const parsed = JSON.parse(content)
    expect(parsed.mcpServers.filesystem.args[2]).toBe(projectPath)
  })

  it('writes pretty-printed JSON (ends with newline)', () => {
    const settingsPath = writeSettings({ mcpServers: {} })
    patchSettingsJson(settingsPath, tmp)
    const content = readFileSync(settingsPath, 'utf8')
    expect(content.endsWith('\n')).toBe(true)
  })
})

// ─── setHookPermissions ───────────────────────────────────────────────────────

describe('setHookPermissions', () => {
  it('does not throw when the directory does not exist', () => {
    expect(() =>
      setHookPermissions(join(tmp, 'nonexistent-hooks')),
    ).not.toThrow()
  })

  it('does not throw on an empty directory', () => {
    const hooksDir = join(tmp, 'empty-hooks')
    mkdirSync(hooksDir)
    expect(() => setHookPermissions(hooksDir)).not.toThrow()
  })

  it('does not throw on non-executable files (.md, .json)', () => {
    const hooksDir = join(tmp, 'hooks-noexec')
    mkdirSync(hooksDir)
    writeFileSync(join(hooksDir, 'README.md'), '# hooks')
    writeFileSync(join(hooksDir, 'config.json'), '{}')
    expect(() => setHookPermissions(hooksDir)).not.toThrow()
  })

  it('processes shell scripts without throwing (platform-safe)', () => {
    const hooksDir = join(tmp, 'hooks-sh')
    mkdirSync(hooksDir)
    writeFileSync(join(hooksDir, 'pre-tool.sh'), '#!/bin/bash\necho hello')
    // On Windows: skips chmod silently. On Unix: applies chmod +x.
    expect(() => setHookPermissions(hooksDir)).not.toThrow()
  })

  it('processes python scripts without throwing (platform-safe)', () => {
    const hooksDir = join(tmp, 'hooks-py')
    mkdirSync(hooksDir)
    writeFileSync(join(hooksDir, 'scan.py'), '#!/usr/bin/env python3\nprint("ok")')
    expect(() => setHookPermissions(hooksDir)).not.toThrow()
  })

  it('walks nested subdirectories', () => {
    const hooksDir = join(tmp, 'hooks-nested')
    mkdirSync(join(hooksDir, 'PreToolUse'), { recursive: true })
    mkdirSync(join(hooksDir, 'PostToolUse'), { recursive: true })
    writeFileSync(join(hooksDir, 'PreToolUse', 'guard.sh'), '#!/bin/bash')
    writeFileSync(join(hooksDir, 'PostToolUse', 'lint.sh'), '#!/bin/bash')
    expect(() => setHookPermissions(hooksDir)).not.toThrow()
  })
})
