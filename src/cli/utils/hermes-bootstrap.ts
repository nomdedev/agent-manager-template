import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { ensureDir } from './installer.js'
import type { ProjectTemplateInput } from './templates.js'

export interface HermesBootstrapInput extends ProjectTemplateInput {
  projectPath: string
}

export interface HermesBootstrapResult {
  soulPath: string
  profileSlug: string
  syncedToHermesHome: boolean
  hermesProfilePath?: string
}

function replacePlaceholders(content: string, vars: Record<string, string>): string {
  let out = content
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value)
  }
  return out
}

export function slugifyProjectName(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'main'
}

export function defaultHermesPriorities(
  projectName: string,
  description?: string,
): [string, string, string] {
  const nextStep = description?.trim()
    ? 'Primera feature end-to-end con /plan y pipeline de 7 fases'
    : 'Completar `.claude/context.md` y `.claude/rules/domain.md`'

  return [
    'Estabilizar setup `.claude/` y verificar con `claudio doctor`',
    nextStep,
    'Mantener context.md, architecture.md y memory.md al día con decisiones reales',
  ]
}

export function buildHermesTemplateVars(input: HermesBootstrapInput): Record<string, string> {
  const { projectName, stack, description, projectPath, priorities } = input
  const mission = description?.trim()
    ? `Entregar y mantener **${projectName}**: ${description.trim()}`
    : `[Describe el resultado principal que ${projectName} debería optimizar.]`

  const [p1, p2, p3] = priorities ?? defaultHermesPriorities(projectName, description)
  const nextStep = p2

  return {
    PROJECT_NAME: projectName,
    STACK: stack,
    PROJECT_PATH: projectPath,
    DATE: new Date().toISOString().slice(0, 10),
    AGENT_NAME: `Operador de ${projectName}`,
    MISSION: mission,
    PRIORITY_1: p1,
    PRIORITY_2: p2,
    PRIORITY_3: p3,
    ACTIVE_PROJECTS: `- **${projectName}** — activo · ${description?.trim() || 'setup inicial'} · siguiente: ${nextStep}`,
    STALE_WORK: `- **[Proyecto débil o viejo]** — [por qué importa o por qué está fallando]`,
    ON_HOLD: `- **[Proyecto]** — [por qué ahora mismo no es prioridad]`,
    KILL_CANDIDATES:
      '- [Proyecto o compromiso que puede que tenga que morir]\n- [Proyecto o compromiso que puede que tenga que morir]',
    DEBT:
      '- Completar domain.md y glosario de negocio\n- Primer feature auditada con `/audit-pipeline`\n- Sincronizar memoria Hermes: `claudio hermes optimize`',
    PIPELINE_SECTION: `## Pipeline del proyecto
Features con lógica de negocio, APIs o estado pasan por 7 fases: Domain → Architecture → Backend → Security → Dev → QA → Production.
Security antes de Dev. QA antes de Production. Nunca saltear gates.
Ver \`.claude/rules/orchestration.md\` y \`/audit-pipeline\`.`,
  }
}

export function renderSoulFromTemplate(
  templateRoot: string,
  input: HermesBootstrapInput,
): string | null {
  const tplPath = join(templateRoot, '.claude', 'templates', 'hermes', 'SOUL.md.tmpl')
  if (!existsSync(tplPath)) return null
  const tpl = readFileSync(tplPath, 'utf8')
  return replacePlaceholders(tpl, buildHermesTemplateVars(input))
}

export function projectSoulPath(projectPath: string): string {
  return join(projectPath, '.claude', 'hermes', 'SOUL.md')
}

export function readProjectSoul(projectPath: string): string | null {
  const path = projectSoulPath(projectPath)
  if (!existsSync(path)) return null
  return readFileSync(path, 'utf8')
}

function ensureHermesProfileDirs(profileDir: string): void {
  for (const rel of [
    profileDir,
    join(profileDir, 'memories', 'projects'),
    join(profileDir, 'skills', 'claude-pipeline'),
    join(profileDir, 'skills', 'obsidian-connector'),
  ]) {
    ensureDir(rel)
  }
}

export function syncSoulToHermesProfile(
  projectPath: string,
  profileSlug: string,
  soulContent: string,
): string | null {
  const hermesHome = join(homedir(), '.hermes')
  if (!existsSync(hermesHome)) return null

  const profileDir =
    profileSlug === 'main' ? hermesHome : join(hermesHome, 'profiles', profileSlug)
  ensureHermesProfileDirs(profileDir)
  writeFileSync(join(profileDir, 'SOUL.md'), soulContent)
  return profileDir
}

export function bootstrapHermesProject(
  targetDir: string,
  templateRoot: string,
  input: ProjectTemplateInput,
  options: { syncToHermesHome?: boolean } = {},
): HermesBootstrapResult | null {
  const hermesTemplates = join(templateRoot, '.claude', 'templates', 'hermes')
  if (!existsSync(hermesTemplates)) {
    console.warn('  ⚠️  No se encontró .claude/templates/hermes — omitiendo bootstrap Hermes')
    return null
  }

  const bootstrapInput: HermesBootstrapInput = {
    ...input,
    projectPath: targetDir,
  }
  const soulContent = renderSoulFromTemplate(templateRoot, bootstrapInput)
  if (!soulContent) return null

  const hermesDir = join(targetDir, '.claude', 'hermes')
  ensureDir(hermesDir)

  const soulPath = join(hermesDir, 'SOUL.md')
  writeFileSync(soulPath, soulContent)

  const profileSlug = slugifyProjectName(input.projectName)
  let syncedToHermesHome = false
  let hermesProfilePath: string | undefined

  if (options.syncToHermesHome !== false) {
    const synced = syncSoulToHermesProfile(targetDir, profileSlug, soulContent)
    if (synced) {
      syncedToHermesHome = true
      hermesProfilePath = synced
    }
  }

  const readmePath = join(hermesDir, 'README.md')
  if (!existsSync(readmePath)) {
    writeFileSync(
      readmePath,
      `# Hermes — ${input.projectName}

Identidad del agente para este proyecto. Generado por \`claudio evoluciona\`.

| Archivo | Rol |
|---------|-----|
| \`SOUL.md\` | Identidad fija (slot #1 del system prompt de Hermes) |

## Sincronizar con Hermes

\`\`\`bash
claudio hermes optimize
# o, si usás perfil dedicado:
hermes -p ${profileSlug}
\`\`\`

Editá \`SOUL.md\` aquí; \`claudio hermes optimize\` lo copia al perfil de \`~/.hermes/\`.
`,
    )
  }

  const syncNote = syncedToHermesHome
    ? ` + perfil ~/.hermes/profiles/${profileSlug}/`
    : ''
  console.log(`  ✅ Hermes: .claude/hermes/SOUL.md${syncNote}`)

  return { soulPath, profileSlug, syncedToHermesHome, hermesProfilePath }
}
