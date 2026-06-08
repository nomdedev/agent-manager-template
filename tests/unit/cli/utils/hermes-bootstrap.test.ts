import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import {
  buildHermesTemplateVars,
  renderSoulFromTemplate,
  slugifyProjectName,
  bootstrapHermesProject,
  projectSoulPath,
} from '../../../../src/cli/utils/hermes-bootstrap.js'

const TEMPLATE_ROOT = resolve(process.cwd())

describe('hermes-bootstrap', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'hermes-bootstrap-'))
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  it('slugifyProjectName normaliza nombres con espacios y acentos', () => {
    expect(slugifyProjectName('Mi App Dental')).toBe('mi-app-dental')
    expect(slugifyProjectName('Proyecto Ñandú')).toBe('proyecto-nandu')
  })

  it('buildHermesTemplateVars incluye misión cuando hay descripción', () => {
    const vars = buildHermesTemplateVars({
      projectName: 'Acme API',
      stack: 'Node.js + TypeScript',
      description: 'API de pedidos B2B',
      projectPath: '/tmp/acme',
    })
    expect(vars.MISSION).toContain('Acme API')
    expect(vars.MISSION).toContain('API de pedidos B2B')
    expect(vars.AGENT_NAME).toBe('Operador de Acme API')
    expect(vars.ACTIVE_PROJECTS).toContain('Acme API')
  })

  it('buildHermesTemplateVars usa prioridades explícitas cuando se pasan', () => {
    const vars = buildHermesTemplateVars({
      projectName: 'Acme API',
      stack: 'Node.js + TypeScript',
      projectPath: '/tmp/acme',
      priorities: ['Ship MVP', 'Integrar pagos', 'Documentar API'],
    })
    expect(vars.PRIORITY_1).toBe('Ship MVP')
    expect(vars.PRIORITY_2).toBe('Integrar pagos')
    expect(vars.PRIORITY_3).toBe('Documentar API')
    expect(vars.ACTIVE_PROJECTS).toContain('Integrar pagos')
  })

  it('renderSoulFromTemplate reemplaza placeholders del template', () => {
    const templateRoot = TEMPLATE_ROOT
    const rendered = renderSoulFromTemplate(templateRoot, {
      projectName: 'Test Project',
      stack: 'React + TypeScript',
      description: 'Dashboard interno',
      projectPath: tempDir,
    })
    expect(rendered).not.toBeNull()
    expect(rendered).toContain('Operador de Test Project')
    expect(rendered).toContain('Dashboard interno')
    expect(rendered).not.toContain('{{PROJECT_NAME}}')
    expect(rendered).toContain('claudio-managed: true')
  })

  it('bootstrapHermesProject escribe SOUL.md en el proyecto', () => {
    const templateRoot = TEMPLATE_ROOT
    const result = bootstrapHermesProject(
      tempDir,
      templateRoot,
      {
        projectName: 'Bootstrap Test',
        stack: 'Node.js + TypeScript',
        description: 'Proyecto de prueba',
      },
      { syncToHermesHome: false },
    )

    expect(result).not.toBeNull()
    expect(existsSync(projectSoulPath(tempDir))).toBe(true)
    const soul = readFileSync(projectSoulPath(tempDir), 'utf8')
    expect(soul).toContain('Bootstrap Test')
    expect(soul).toContain('Proyecto de prueba')
    expect(existsSync(join(tempDir, '.claude', 'hermes', 'README.md'))).toBe(true)
  })

  it('renderSoulFromTemplate retorna null si falta el template', () => {
    writeFileSync(join(tempDir, 'empty.txt'), '')
    const rendered = renderSoulFromTemplate(tempDir, {
      projectName: 'X',
      stack: 'Y',
      projectPath: tempDir,
    })
    expect(rendered).toBeNull()
  })
})
