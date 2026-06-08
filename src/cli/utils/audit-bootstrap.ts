import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ensureDir } from './installer.js'
import type { ProjectTemplateInput } from './templates.js'

interface LifecycleAgentDef {
  slug: string
  phaseNum: string
  phaseName: string
  phaseSlug: string
  phaseTrigger: string
  color: string
  tools: string[]
  covers: string
  verdictRule: string
  responsibilities: string
  process: string
  verifyCommands: string
}

function replacePlaceholders(content: string, vars: Record<string, string>): string {
  let out = content
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value)
  }
  return out
}

function renderAgent(def: LifecycleAgentDef, baseTpl: string, vars: Record<string, string>): string {
  const toolsYaml = def.tools.map(t => `  - ${t}`).join('\n')
  return replacePlaceholders(baseTpl, {
    ...vars,
    AGENT_SLUG: def.slug,
    PHASE_NUM: def.phaseNum,
    PHASE_NAME: def.phaseName,
    PHASE_SLUG: def.phaseSlug,
    PHASE_TRIGGER: def.phaseTrigger,
    COLOR: def.color,
    TOOLS_YAML: toolsYaml,
    COVERS: def.covers,
    VERDICT_RULE: def.verdictRule,
    RESPONSIBILITIES: def.responsibilities,
    PROCESS: def.process,
    VERIFY_COMMANDS: replacePlaceholders(def.verifyCommands, vars),
  })
}

export function bootstrapAuditEcosystem(
  targetDir: string,
  templateRoot: string,
  input: ProjectTemplateInput,
): void {
  const auditTemplates = join(templateRoot, '.claude', 'templates', 'audit')
  if (!existsSync(auditTemplates)) {
    console.warn('  ⚠️  No se encontró .claude/templates/audit — omitiendo bootstrap de auditoría')
    return
  }

  const vars: Record<string, string> = {
    PROJECT_NAME: input.projectName,
    STACK: input.stack,
    DATE: new Date().toISOString().slice(0, 10),
    TEST_COMMAND: 'npm test',
    BUILD_COMMAND: 'npm run build',
    LINT_COMMAND: 'npm run lint',
  }

  ensureDir(join(targetDir, 'docs'))
  ensureDir(join(targetDir, 'docs', 'audits'))

  for (const tpl of ['AUDIT_STANDARDS.md.tmpl', 'AUDIT_AGENTS.md.tmpl'] as const) {
    const path = join(auditTemplates, tpl)
    if (existsSync(path)) {
      const out = tpl.replace('.tmpl', '')
      writeFileSync(join(targetDir, 'docs', out), replacePlaceholders(readFileSync(path, 'utf8'), vars))
    }
  }

  const agentBaseTpl = join(auditTemplates, 'agents', 'lifecycle-agent.md.tmpl')
  const catalogPath = join(auditTemplates, 'agents', 'catalog.json')
  const agentsDest = join(targetDir, '.claude', 'agents')
  ensureDir(agentsDest)

  if (existsSync(agentBaseTpl) && existsSync(catalogPath)) {
    const baseTpl = readFileSync(agentBaseTpl, 'utf8')
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')) as LifecycleAgentDef[]
    for (const def of catalog) {
      writeFileSync(join(agentsDest, `${def.slug}.md`), renderAgent(def, baseTpl, vars))
    }
  }

  const checklistsTpl = join(
    templateRoot,
    '.claude',
    'skills',
    'lifecycle-orchestrator',
    'references',
    'checklists.md.tmpl',
  )
  if (existsSync(checklistsTpl)) {
    const outDir = join(targetDir, '.claude', 'skills', 'lifecycle-orchestrator', 'references')
    ensureDir(outDir)
    writeFileSync(join(outDir, 'checklists.md'), replacePlaceholders(readFileSync(checklistsTpl, 'utf8'), vars))
  }

  const pipelineSkill = join(targetDir, '.claude', 'skills', 'audit-pipeline', 'SKILL.md')
  if (existsSync(pipelineSkill)) {
    writeFileSync(pipelineSkill, replacePlaceholders(readFileSync(pipelineSkill, 'utf8'), vars))
  }

  console.log('  ✅ Ecosistema lifecycle: docs/AUDIT_*.md + 8 agentes lifecycle-*')
}
