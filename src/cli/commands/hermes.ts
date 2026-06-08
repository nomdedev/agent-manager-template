/**
 * claudio hermes — Gestión de Hermes Agent
 *
 * Instala, inicializa y optimiza Hermes Agent usando el vault de Obsidian
 * como base de conocimiento conectora entre todos los proyectos.
 *
 * Arquitectura:
 *   Obsidian vault  ──→  ~/.hermes/memories/MEMORY.md   (Tier 1, 2200 chars)
 *   .claude/rules/  ──→  ~/.hermes/memories/USER.md     (Tier 1, 1375 chars)
 *   .claude/skills/ ──→  ~/.hermes/skills/claude-pipeline/  (procedural memory)
 *   SOUL.md         ──→  slot #1 en cada system prompt  (identidad fija)
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs'
import { join, resolve, basename, dirname } from 'node:path'
import { homedir } from 'node:os'
import { execSync } from 'node:child_process'
import { prompt, promptYesNo, promptSelect, closePrompts } from '../utils/prompts.js'
import { ensureDir } from '../utils/installer.js'
import { printHermesInstallIntro } from './hermes-install-guide.js'
import { installHermesAgent } from './hermes-installer.js'
import { readProjectSoul } from '../utils/hermes-bootstrap.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const HERMES_HOME = join(homedir(), '.hermes')
const HERMES_REPO = 'https://github.com/NousResearch/hermes-agent'
const GEPA_REPO = 'https://github.com/NousResearch/hermes-agent-self-evolution'

// Hermes Tier 1 memory limits (from docs)
const MEMORY_MD_MAX_CHARS = 2200
const USER_MD_MAX_CHARS = 1375

type HermesRole = 'programmer' | 'designer' | 'researcher' | 'custom'

// ─── SOUL.md templates ────────────────────────────────────────────────────────

const SOUL_TEMPLATES: Record<HermesRole, (stack: string, pipeline: boolean) => string> = {
  programmer: (stack, pipeline) => `# Soul

You are my staff engineer. Terse, direct, pragmatic.
${stack ? `Primary stack: ${stack}.` : ''}
You read code before you write code. You write the smallest change that solves the problem.
You prefer standard library over dependencies, boring tech over shiny tech, explicit over clever.
${
  pipeline
    ? `
You enforce a 7-phase gated pipeline on every feature:
  Domain → Architecture → Backend → Security → Dev → QA → Production
Security (Phase 4) must APPROVE before Dev (Phase 5) starts.
QA (Phase 6) must APPROVE before Production (Phase 7) starts.
If QA blocks → identify root cause → bounce to the correct team. Never skip.
`
    : ''
}
Always check: does this already exist in the codebase? Are there tests? What breaks if this fails?
Run the tests before saying "done."
You delegate file editing, test execution, and git operations to Claude Code.`,

  designer: () => `# Soul

You are an expert at creating clear, high-impact visual artifacts that explain technical concepts.
Think architecture diagrams and whiteboard sketches, not polished marketing art.

Every artifact should make a technical idea click. You lead with the concept,
choose the metaphor, then commit to the design. Clarity and information density
over visual flourish.

Be opinionated about what to draw and what to leave out.
Say when a diagram would hurt more than it helps.`,

  researcher: () => `# Soul

You are my deep researcher for the AI and software engineering space.
Your main deliverable is actionable intelligence: what changed, why it matters, what to do next.

Cover: trending repos, lab announcements, research papers, social pulse (X, Reddit, HN).
Lead with what changed since yesterday. Cite every claim with a URL.
Flag when signal is thin. Never fabricate a citation.

Use delegate_task aggressively to parallelize across research streams.`,

  custom: (stack) => `# Soul

You are my specialized agent.${stack ? `\nPrimary stack: ${stack}.` : ''}

[Customize this identity. This file is slot #1 in every system prompt,
loaded before memories, skills, and context. It defines who you are,
not what you know.]
`,
}

// ─── Hermes skills ────────────────────────────────────────────────────────────

function claudePipelineSkill(): string {
  return `---
name: claude-pipeline
description: >
  Activate for ANY feature, bugfix, or refactor affecting business logic,
  stateful UI, APIs, or databases. Enforces the 7-phase gated pipeline.
  Triggers: "implement", "new feature", "refactor", "fix issue", "deploy".
version: 1.0.0
author: claudio-installer
platforms: [linux, macos, windows]
---

## 7-Phase Pipeline (mandatory — never skip)

| Phase | Team | Agent(s) | Gate |
|-------|------|----------|------|
| 1. Domain | Design | domain-expert | Requirements validated |
| 2. Architecture | Design | architect | Design approved, interfaces defined |
| 3. Backend | Backend | architect + orchestrator | API routes + schema consistent |
| 4. Security | Security | security-auditor | No CRITICAL/HIGH without mitigation |
| 5. Dev | Dev | developer + reviewer | Build passes, review OK |
| 6. QA | QA | tester | All tests pass, coverage documented |
| 7. Production | Production | orchestrator | GO / NO-GO |

## Golden Rules
1. Never skip a phase. If blocked → fix → re-enter at that phase.
2. Dev (Phase 5) cannot start without Security (Phase 4) APPROVED.
3. Production (Phase 7) cannot start without QA (Phase 6) APPROVED.
4. QA blocks → identify root (logic/backend/security/impl) → bounce to that team.

## Procedure
1. Check .claude/logs/pipeline-state.json for the current feature status
2. Confirm the gate condition of the current phase is met
3. Produce the phase report → .claude/logs/audits/features/<feature-id>/fase<N>-<date>.md
4. Update pipeline-state.json with the new phase and status
5. Authorize (or block with reason) the next phase

## Pitfalls
- Assuming Security is OK without running the security-auditor agent
- Merging without test coverage documentation
- Treating "small" changes as exempt (they're usually not)
- Moving to Production before the QA report shows APPROVED

## Verification
- pipeline-state.json shows \`"status": "GO"\` for the feature
- .claude/logs/audits/ has a report for each completed phase
`
}

function obsidianConnectorSkill(vaultPath: string): string {
  return `---
name: obsidian-connector
description: >
  Activate when searching for project context, conventions, architecture decisions,
  or historical analysis. Reads the Obsidian vault as the source of truth.
  Triggers: "project context", "what are our conventions", "architecture", "decisions",
  "what did we design", "history of".
version: 1.0.0
author: claudio-installer
platforms: [linux, macos, windows]
---

## Vault Location
${vaultPath}

## Vault Structure
\`\`\`
obsidian/
├── 00-README.md              ← index of all sections
├── 01-Agentes/               ← pipeline rules, agent configuration
│   └── Reglas para agentes.md
├── 02-Estandares/            ← conventions, tech stack decisions
│   ├── Stack tecnologico.md
│   └── Convenciones de codigo.md
├── 03-Contexto/              ← project context, business domain
├── 04-Analisis/              ← technical analyses, ADRs
├── 05-Testing/               ← testing strategy, test plans
└── 06-Deployments/           ← deployment history, runbooks
\`\`\`

## Procedure
1. Identify which vault section is relevant to the query
2. Read the relevant file(s) from the path above
3. Synthesize the answer using vault content as the authoritative source
4. If the vault doesn't have the answer, say so explicitly — do not invent

## Update Protocol
When new decisions, conventions, or analyses are made:
1. Ask user if this should be recorded in the vault
2. If yes, write/append to the appropriate section
3. Keep entries concise — the vault is a searchable reference, not a log

## Pitfalls
- Assuming conventions without reading 02-Estandares/ first
- Making architecture decisions that contradict 04-Analisis/ decisions
- Forgetting to check 05-Testing/ before writing test plans
`
}

// ─── Memory synthesis from Obsidian + .claude/ ───────────────────────────────

function readFile(path: string): string {
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf8')
}

function compress(content: string, maxChars: number): string {
  return content
    .replace(/^#{1,6}\s+/gm, '')       // strip headers
    .replace(/```[\s\S]*?```/g, '')     // strip code blocks
    .replace(/\|[^\n]+\|/g, '')         // strip tables
    .replace(/\n{3,}/g, '\n\n')         // collapse blank lines
    .trim()
    .slice(0, maxChars)
}

function synthesizeMemoryMd(opts: {
  projectName: string
  projectPath: string
  stack: string
  obsidianPath?: string
}): string {
  const { projectName, projectPath, stack, obsidianPath } = opts
  const parts: string[] = []
  let budget = MEMORY_MD_MAX_CHARS

  // ── Active Project (always first, ~120 chars) ──────────────────────────────
  const projectBlock = `## Active Project\nname: ${projectName} | stack: ${stack}\npath: ${projectPath}\n`
  parts.push(projectBlock)
  budget -= projectBlock.length

  // ── Pipeline rules (always present, ~220 chars) ────────────────────────────
  const pipelineBlock = `## Pipeline (7 phases, mandatory)\nDomain→Architecture→Backend→Security→Dev→QA→Production\nSecurity before Dev. QA before Production. Never skip.\n`
  parts.push(pipelineBlock)
  budget -= pipelineBlock.length

  // ── Code conventions from Obsidian ────────────────────────────────────────
  if (obsidianPath && budget > 200) {
    const convFile = readFile(join(obsidianPath, '02-Estandares', 'Convenciones de codigo.md'))
    if (convFile) {
      const label = '## Code Conventions\n'
      const body = compress(convFile, budget - label.length - 5)
      if (body) {
        parts.push(label + body + '\n')
        budget -= label.length + body.length + 1
      }
    }
  }

  // ── Stack info from Obsidian ───────────────────────────────────────────────
  if (obsidianPath && budget > 150) {
    const stackFile = readFile(join(obsidianPath, '02-Estandares', 'Stack tecnologico.md'))
    if (stackFile) {
      const label = '## Stack Details\n'
      const body = compress(stackFile, Math.min(300, budget - label.length - 5))
      if (body) {
        parts.push(label + body + '\n')
        budget -= label.length + body.length + 1
      }
    }
  }

  // ── Domain invariants from .claude/rules/domain.md ────────────────────────
  if (budget > 100) {
    const domainFile = readFile(join(projectPath, '.claude', 'rules', 'domain.md'))
    if (domainFile) {
      const match = domainFile.match(/## Business Invariants[\s\S]*?(?=\n## |\n---|\s*$)/)
      if (match) {
        const label = '## Domain Rules\n'
        const body = compress(match[0], Math.min(250, budget - label.length - 5))
        if (body) {
          parts.push(label + body + '\n')
        }
      }
    }
  }

  return parts.join('\n')
}

function synthesizeUserMd(opts: {
  userName: string
  stack: string
  obsidianPath?: string
}): string {
  const { userName, stack, obsidianPath } = opts

  let content = `## User
name: ${userName} | role: developer | stack: ${stack}

## Communication Style
Direct, terse. Show code, not just descriptions.
Spanish for conversation, English for code and technical terms.
Flag unclear requirements rather than guessing.

## Working Patterns
- Enforces 7-phase pipeline on all features
- Uses Claude Code for execution delegation
- Obsidian vault as canonical project knowledge source
- No any in TypeScript, explicit error handling, minimal deps
`

  if (obsidianPath) {
    const agentRules = readFile(join(obsidianPath, '01-Agentes', 'Reglas para agentes.md'))
    if (agentRules) {
      const section = '\n## Agent Preferences\n' + compress(agentRules, 200) + '\n'
      if ((content + section).length <= USER_MD_MAX_CHARS) {
        content += section
      }
    }
  }

  return content.slice(0, USER_MD_MAX_CHARS)
}

// ─── Profile directory helper ─────────────────────────────────────────────────

function profileDir(profileName: string): string {
  return profileName === 'main' ? HERMES_HOME : join(HERMES_HOME, 'profiles', profileName)
}

function ensureProfileDirs(pDir: string): void {
  const dirs = [
    pDir,
    join(pDir, 'memories', 'projects'),
    join(pDir, 'skills', 'claude-pipeline'),
    join(pDir, 'skills', 'obsidian-connector'),
    join(pDir, 'sessions'),
    join(pDir, 'cron', 'output'),
    join(pDir, 'plugins'),
    join(pDir, 'hooks'),
    join(pDir, 'skins'),
    join(pDir, 'logs'),
  ]
  for (const d of dirs) ensureDir(d)
}

// ─── Subcommand: install ──────────────────────────────────────────────────────

async function runHermesInstall(): Promise<void> {
  printHermesInstallIntro()

  try {
    await installHermesAgent()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`\n❌ Instalación de Hermes falló: ${msg}\n`)
    process.exit(1)
  }

  const runInit = await promptYesNo(
    '¿Crear ~/.hermes/ para este template (claudio hermes init programmer)?',
    true,
  )
  closePrompts()

  if (runInit) {
    await runHermesInit('programmer')
  }
}

// ─── Subcommand: init ─────────────────────────────────────────────────────────

async function runHermesInit(profileArg?: string): Promise<void> {
  console.log('\n─── Hermes Agent — Inicialización ─────────────────────')

  const profileName = profileArg ?? (await prompt('Nombre del perfil', 'main'))
  const roleIdx = await promptSelect('Rol principal del agente:', [
    'programmer  — staff engineer, código + Claude Code delegation',
    'designer    — diseño visual, diagramas, ilustraciones técnicas',
    'researcher  — investigación, digests diarios, monitoreo de AI/ML',
    'custom      — definir manualmente en SOUL.md',
  ])
  const roleMap: HermesRole[] = ['programmer', 'designer', 'researcher', 'custom']
  const role = roleMap[roleIdx]
  const stack = await prompt('Stack tecnológico principal', 'TypeScript / Node.js')
  const userName = await prompt('Tu nombre (para USER.md)', process.env.USERNAME ?? process.env.USER ?? 'developer')
  const includePipeline = await promptYesNo(
    '¿Incluir reglas del pipeline de 7 fases en SOUL.md?',
    role === 'programmer',
  )
  closePrompts()

  const pDir = profileDir(profileName)
  ensureProfileDirs(pDir)

  const writes: Array<[string, string, boolean]> = [] // [path, content, overwrite]

  // SOUL.md — never overwrite (identity is sacred)
  const soulPath = join(pDir, 'SOUL.md')
  const soulContent = SOUL_TEMPLATES[role](stack, includePipeline)
  writes.push([soulPath, soulContent, false])

  // MEMORY.md skeleton
  const memPath = join(pDir, 'memories', 'MEMORY.md')
  const memContent = synthesizeMemoryMd({
    projectName: profileName,
    projectPath: process.cwd(),
    stack,
  })
  writes.push([memPath, memContent, false])

  // USER.md skeleton
  const userPath = join(pDir, 'memories', 'USER.md')
  writes.push([userPath, synthesizeUserMd({ userName, stack }), false])

  // claude-pipeline skill (always update)
  const skillPath = join(pDir, 'skills', 'claude-pipeline', 'SKILL.md')
  writes.push([skillPath, claudePipelineSkill(), true])

  for (const [path, content, overwrite] of writes) {
    if (overwrite || !existsSync(path)) {
      writeFileSync(path, content)
      console.log(`  ✅ ${path}`)
    } else {
      console.log(`  ⏭  ${basename(path)} ya existe — no sobreescrito`)
    }
  }

  const relDir = profileName === 'main' ? '~/.hermes/' : `~/.hermes/profiles/${profileName}/`
  console.log(`\n✅ ${relDir} inicializado`)
  if (!existsSync(join(pDir, 'config.yaml'))) {
    const cmd = profileName === 'main' ? 'hermes setup' : `hermes -p ${profileName} setup`
    console.log(`\n  ⚠️  Falta config.yaml. Ejecutá: ${cmd}`)
  }
  console.log('\n  Próximo paso: claudio hermes optimize\n')
}

// ─── Subcommand: optimize ─────────────────────────────────────────────────────

async function runHermesOptimize(projectArg?: string): Promise<void> {
  console.log('\n─── Obsidian → Hermes Memory Sync ─────────────────────')

  const projectPath = resolve(projectArg ?? process.cwd())

  if (!existsSync(join(projectPath, '.claude'))) {
    console.error(`❌ No se encontró .claude/ en: ${projectPath}`)
    console.error('   Ejecutá "claudio evoluciona" primero para setup del proyecto.')
    process.exit(1)
  }

  const obsidianPath = join(projectPath, 'obsidian')
  const hasObsidian = existsSync(obsidianPath)
  if (!hasObsidian) {
    console.log('⚠️  Sin vault de Obsidian en este proyecto.')
    console.log('   Ejecutá "claudio evoluciona" con Obsidian activado para crearlo.\n')
  } else {
    console.log(`  Vault: ${obsidianPath}`)
  }

  // Detect project name from context.md
  let projectName = basename(projectPath)
  const contextContent = readFile(join(projectPath, '.claude', 'context.md'))
  const nameMatch = contextContent.match(/^#\s+Contexto del Proyecto\s+—\s+(.+)$/m)
  if (nameMatch?.[1]) projectName = nameMatch[1].trim()

  // Detect stack
  let stack = 'TypeScript / Node.js'
  const stackMatch = contextContent.match(/^## Stack\n(.+)$/m)
  if (stackMatch?.[1]) stack = stackMatch[1].trim()

  const profileIdx = await promptSelect('¿A qué perfil de Hermes sincronizar?', [
    'main  (perfil principal)',
    'programmer',
    'designer',
    'researcher',
    'otro (especificar)',
  ])
  const profileNames = ['main', 'programmer', 'designer', 'researcher', '__custom__']
  let pName = profileNames[profileIdx]
  if (pName === '__custom__') {
    pName = await prompt('Nombre del perfil')
  }
  closePrompts()

  const pDir = profileDir(pName)
  ensureProfileDirs(pDir)

  const obsOpt = hasObsidian ? obsidianPath : undefined

  // Synthesize MEMORY.md
  const memContent = synthesizeMemoryMd({
    projectName,
    projectPath,
    stack,
    obsidianPath: obsOpt,
  })
  writeFileSync(join(pDir, 'memories', 'MEMORY.md'), memContent)
  const memPct = Math.round((memContent.length / MEMORY_MD_MAX_CHARS) * 100)
  console.log(`  ✅ MEMORY.md — ${memContent.length}/${MEMORY_MD_MAX_CHARS} chars (${memPct}% full)`)

  const projectSoul = readProjectSoul(projectPath)
  if (projectSoul) {
    writeFileSync(join(pDir, 'SOUL.md'), projectSoul)
    console.log('  ✅ SOUL.md — sincronizado desde .claude/hermes/SOUL.md')
  }

  // Synthesize USER.md (only if not customized — check for default marker)
  const userPath = join(pDir, 'memories', 'USER.md')
  const existingUser = readFile(userPath)
  if (!existingUser || existingUser.includes('[Customize this]')) {
    const userContent = synthesizeUserMd({
      userName: process.env.USERNAME ?? process.env.USER ?? 'developer',
      stack,
      obsidianPath: obsOpt,
    })
    writeFileSync(userPath, userContent)
    const userPct = Math.round((userContent.length / USER_MD_MAX_CHARS) * 100)
    console.log(`  ✅ USER.md — ${userContent.length}/${USER_MD_MAX_CHARS} chars (${userPct}% full)`)
  } else {
    console.log('  ⏭  USER.md — ya personalizado, no sobreescrito')
  }

  // Update claude-pipeline skill
  writeFileSync(join(pDir, 'skills', 'claude-pipeline', 'SKILL.md'), claudePipelineSkill())
  console.log('  ✅ skills/claude-pipeline/SKILL.md actualizado')

  // Obsidian connector skill (if vault exists)
  if (hasObsidian) {
    ensureDir(join(pDir, 'skills', 'obsidian-connector'))
    writeFileSync(
      join(pDir, 'skills', 'obsidian-connector', 'SKILL.md'),
      obsidianConnectorSkill(obsidianPath),
    )
    console.log('  ✅ skills/obsidian-connector/SKILL.md actualizado')
  }

  // Per-project memory note
  const projNoteDir = join(pDir, 'memories', 'projects')
  ensureDir(projNoteDir)
  let projNote = `# ${projectName}\npath: ${projectPath}\nstack: ${stack}\nupdated: ${new Date().toISOString().slice(0, 10)}\n\n`
  if (hasObsidian) {
    const readme = readFile(join(obsidianPath, '00-README.md'))
    if (readme) projNote += compress(readme, 600) + '\n'
    const ctx = readFile(join(obsidianPath, '03-Contexto', 'Resumen del proyecto.md'))
    if (ctx) projNote += '\n## Contexto\n' + compress(ctx, 400) + '\n'
  }
  writeFileSync(join(projNoteDir, `${projectName}.md`), projNote)
  console.log(`  ✅ memories/projects/${projectName}.md`)

  const relDir = pName === 'main' ? '~/.hermes' : `~/.hermes/profiles/${pName}`
  console.log(`\n✅ "${projectName}" sincronizado → ${relDir}`)
  console.log('\n  Próximos pasos:')
  console.log('  • Revisá MEMORY.md y editá lo que no sea relevante')
  console.log('  • Ejecutá "hermes" para iniciar con el contexto cargado')
  console.log('  • Para optimizar skills offline: claudio hermes gepa\n')
}

// ─── Subcommand: gepa ─────────────────────────────────────────────────────────

function runHermesGepa(): void {
  closePrompts()
  console.log('\n─── GEPA — Genetic-Pareto Prompt Evolution ────────────')
  console.log(`\n  Repo:  ${GEPA_REPO}`)
  console.log('  Paper: https://arxiv.org/abs/2507.19457 (ICLR 2026 Oral)')
  console.log('  Costo: ~$2–10 por skill optimizado. Sin GPU.')
  console.log('\nQué hace GEPA:')
  console.log('  Lee trazas de ejecución de state.db → identifica fallas →')
  console.log('  genera variantes del skill → evalúa con LLM-as-judge →')
  console.log('  propone el mejor candidato como PR (nunca sobreescribe directo).')
  console.log('\nSkills candidatos a optimizar:')

  const skillsDir = join(HERMES_HOME, 'skills')
  if (existsSync(skillsDir)) {
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      .map(d => d.name)
    if (skills.length > 0) {
      for (const s of skills) console.log(`  • ~/.hermes/skills/${s}/`)
    } else {
      console.log('  (sin skills instalados aún)')
    }
  } else {
    console.log('  (~/.hermes/skills/ no encontrado — ejecutá "claudio hermes init" primero)')
  }

  console.log('\nPasos:')
  console.log(`  1. git clone ${GEPA_REPO}`)
  console.log('  2. cd hermes-agent-self-evolution')
  console.log('  3. pip install -r requirements.txt')
  console.log('  4. python run_gepa.py \\')
  console.log('       --skill claude-pipeline \\')
  console.log('       --traces ~/.hermes/state.db \\')
  console.log('       --output ./optimized/')
  console.log('\nEl resultado es una propuesta de skill mejorado.')
  console.log('Revisá el diff antes de reemplazar el original.\n')
}

// ─── Subcommand: status ───────────────────────────────────────────────────────

function runHermesStatus(): void {
  closePrompts()
  console.log('\n─── Estado de ~/.hermes/ ──────────────────────────────')

  // Binary check
  let version = '⚠️  no instalado'
  try {
    version = '✅ ' + execSync('hermes --version', { stdio: 'pipe', encoding: 'utf8' }).trim()
  } catch { /* not installed */ }
  console.log(`\n  hermes binary : ${version}`)
  console.log(`  ~/.hermes/    : ${existsSync(HERMES_HOME) ? '✅ existe' : '❌ no existe'}`)

  if (!existsSync(HERMES_HOME)) {
    console.log('\n  Ejecutá: claudio hermes install\n')
    return
  }

  // SOUL.md
  const soulPath = join(HERMES_HOME, 'SOUL.md')
  console.log(`  SOUL.md       : ${existsSync(soulPath) ? '✅' : '⚠️  falta — ejecutá claudio hermes init'}`)

  // Memory tiers
  const memPath = join(HERMES_HOME, 'memories', 'MEMORY.md')
  if (existsSync(memPath)) {
    const len = readFileSync(memPath, 'utf8').length
    const pct = Math.round((len / MEMORY_MD_MAX_CHARS) * 100)
    const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10))
    console.log(`  MEMORY.md     : [${bar}] ${len}/${MEMORY_MD_MAX_CHARS} chars (${pct}%)`)
  } else {
    console.log('  MEMORY.md     : ⚠️  falta — ejecutá claudio hermes optimize')
  }

  const userPath = join(HERMES_HOME, 'memories', 'USER.md')
  if (existsSync(userPath)) {
    const len = readFileSync(userPath, 'utf8').length
    const pct = Math.round((len / USER_MD_MAX_CHARS) * 100)
    console.log(`  USER.md       : ${len}/${USER_MD_MAX_CHARS} chars (${pct}%)`)
  } else {
    console.log('  USER.md       : ⚠️  falta')
  }

  // SQLite session store
  const dbPath = join(HERMES_HOME, 'state.db')
  console.log(`  state.db      : ${existsSync(dbPath) ? '✅ (Tier 2 — FTS5 sessions)' : '— (se crea al usar hermes)'}`)

  // Skills
  const skillsDir = join(HERMES_HOME, 'skills')
  if (existsSync(skillsDir)) {
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    console.log(`  skills/       : ${skills.length} skill(s) — ${skills.map(s => s.name).join(', ')}`)
  } else {
    console.log('  skills/       : — (vacío)')
  }

  // Profiles
  const profilesDir = join(HERMES_HOME, 'profiles')
  if (existsSync(profilesDir)) {
    const profiles = readdirSync(profilesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
    if (profiles.length > 0) {
      console.log(`  profiles/     : ${profiles.join(', ')}`)
    }
  }

  console.log('')
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

const HERMES_HELP = `
claudio hermes — Gestión de Hermes Agent + Obsidian como knowledge DB

USO
  claudio hermes <subcomando> [opciones]

SUBCOMANDOS
  install              Clona/actualiza github.com/NousResearch/hermes-agent (solo el repo)
  init [perfil]        Crea ~/.hermes/ con SOUL.md, MEMORY.md, skills iniciales
  optimize [ruta]      Sincroniza Obsidian vault + .claude/ → Hermes memory
  status               Estado de ~/.hermes/ y sus componentes
  gepa                 Instrucciones para optimizar skills con GEPA offline

FLUJO RECOMENDADO (con este template)
  1. claudio init / evoluciona   → .claude/ + .claude/hermes/SOUL.md adaptado al proyecto
  2. claudio hermes init         → ~/.hermes/ (no requiere binario hermes)
  3. claudio hermes optimize     → SOUL + MEMORY sincronizados desde el proyecto

  Opcional — código fuente de Hermes:
     claudio hermes install       → clona el repo (último release), sin deps extra

  Avanzado: claudio hermes gepa  → optimizar skills con GEPA

MEMORY ARCHITECTURE (Hermes Tier 1)
  MEMORY.md  — ${MEMORY_MD_MAX_CHARS} chars max — hechos del proyecto, pipeline, convenciones
  USER.md    — ${USER_MD_MAX_CHARS} chars max — perfil del desarrollador, preferencias
  Ambos se inyectan en cada system prompt. Dense, no verbose.

OBSIDIAN COMO CONNECTOR DB
  El vault obsidian/ de cada proyecto alimenta MEMORY.md y los skills.
  Un skill "obsidian-connector" permite a Hermes leer el vault on-demand.
  memories/projects/<nombre>.md acumula conocimiento cross-proyecto.
`

export async function runHermes(subcommand?: string, args: string[] = []): Promise<void> {
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(HERMES_HELP)
    console.log('\nTip: ejecutá "claudio hermes" sin argumentos para un menú interactivo.\n')
    return
  }

  switch (subcommand) {
    case 'install':
      await runHermesInstall()
      break
    case 'init':
      await runHermesInit(args[0])
      break
    case 'optimize':
      await runHermesOptimize(args[0])
      break
    case 'status':
      runHermesStatus()
      break
    case 'gepa':
      runHermesGepa()
      break
    default:
      console.error(`\n❌ Subcomando desconocido: "${subcommand}"`)
      console.error('   Ejecutá "claudio hermes --help"\n')
      process.exit(1)
  }
}
