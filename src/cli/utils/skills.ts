import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { copyDir } from './installer.js'

const MATTPOCOCK_SOURCE = 'mattpocock/skills'
const SKILLS_MARKER = join('.agents', 'skills', 'tdd', 'SKILL.md')

export function hasMattPocockSkills(projectRoot: string): boolean {
  return existsSync(join(projectRoot, SKILLS_MARKER))
}

/**
 * Instala mattpocock/skills con el CLI oficial (skills.sh).
 * Idempotente: si ya existe el marker, no hace nada salvo force.
 */
export function installMattPocockSkills(projectRoot: string, force = false): void {
  if (!force && hasMattPocockSkills(projectRoot)) {
    return
  }

  const cmd = `npx skills@latest add ${MATTPOCOCK_SOURCE} --yes`
  execSync(cmd, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, npm_config_yes: 'true' },
  })
}

/** Copia bundle del template (rápido, sin red) o instala vía npx si falta en el template. */
export function syncMattPocockBundle(templateRoot: string, targetDir: string): void {
  const agentsSrc = join(templateRoot, '.agents')
  if (existsSync(agentsSrc)) {
    copyDir(agentsSrc, join(targetDir, '.agents'))
  } else {
    installMattPocockSkills(targetDir)
  }

  const lockSrc = join(templateRoot, 'skills-lock.json')
  if (existsSync(lockSrc)) {
    copyFileSync(lockSrc, join(targetDir, 'skills-lock.json'))
  }

  const docsAgentsSrc = join(templateRoot, 'docs', 'agents')
  if (existsSync(docsAgentsSrc)) {
    copyDir(docsAgentsSrc, join(targetDir, 'docs', 'agents'))
  }

  for (const name of ['CONTEXT.md', 'AGENTS.md'] as const) {
    const src = join(templateRoot, name)
    if (existsSync(src)) {
      copyFileSync(src, join(targetDir, name))
    }
  }

  if (!hasMattPocockSkills(targetDir)) {
    installMattPocockSkills(targetDir)
  }
}
