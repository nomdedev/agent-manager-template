/**
 * Catálogo central de comandos y componentes del Agent Manager Template.
 * Usado por help, menú interactivo y wizards.
 */

export interface CatalogChoice {
  id: string
  label: string
  description: string
  hint?: string
  command?: string
  advanced?: boolean
}

export interface CatalogCommand {
  id: string
  name: string
  summary: string
  description: string
  usage: string
  examples: string[]
  advanced?: boolean
}

export const WHAT_IS_CLAUDIO = `claudio configura proyectos para Claude Code con un equipo de agentes,
pipeline de calidad (7 fases), hooks de seguridad y documentación generada automáticamente.`

export const MAIN_COMMANDS: CatalogCommand[] = [
  {
    id: 'init',
    name: 'init',
    summary: 'Empezar aquí — instala dependencias o copia .claude/',
    description:
      'Detecta si estás en el template clonado o en otro proyecto. En el template ejecuta pnpm/npm install y crea .env. En otros proyectos instala la carpeta .claude/ y genera context.md, domain.md y architecture.md.',
    usage: 'claudio init [carpeta] [--yes] [--minimal]',
    examples: ['claudio init', 'claudio init ./mi-app --yes', 'pnpm setup'],
  },
  {
    id: 'doctor',
    name: 'doctor',
    summary: 'Verificar que todo esté bien configurado',
    description:
      'Revisa Node 20+, existencia de .claude/, rutas MCP en settings.json, permisos de hooks y .env en el template. Corrige MCP paths automáticamente cuando puede.',
    usage: 'claudio doctor',
    examples: ['claudio doctor'],
  },
  {
    id: 'evoluciona',
    name: 'evoluciona',
    summary: 'Wizard completo para instalar .claude/ en un proyecto',
    description:
      'Igual que init en modo externo, pero siempre muestra el wizard paso a paso: nombre, stack, descripción de dominio, Obsidian y Hermes opcionales.',
    usage: 'claudio evoluciona [carpeta] [--yes] [--minimal]',
    examples: ['claudio evoluciona ./mi-proyecto', 'claudio evoluciona --minimal'],
  },
  {
    id: 'guia',
    name: 'guia',
    summary: 'Explicación de qué incluye el template y cada pieza',
    description: 'Muestra qué son agentes, hooks, skills, pipeline y opciones avanzadas sin instalar nada.',
    usage: 'claudio guia [tema]',
    examples: ['claudio guia', 'claudio guia pipeline', 'claudio guia hooks'],
  },
  {
    id: 'menu',
    name: 'menu',
    summary: 'Menú interactivo (mismo que ejecutar claudio sin argumentos)',
    description: 'Lista comandos con descripciones y te guía a elegir uno.',
    usage: 'claudio menu',
    examples: ['claudio menu'],
  },
]

export const ADVANCED_COMMANDS: CatalogCommand[] = [
  {
    id: 'hermes',
    name: 'hermes',
    summary: 'Hermes Agent — memoria personal entre proyectos (opcional)',
    description:
      'Instala y sincroniza Hermes con tu vault Obsidian. No es necesario para usar el pipeline en Claude Code.',
    usage: 'claudio hermes <install|init|optimize|status|gepa>',
    examples: ['claudio hermes status', 'claudio hermes init programmer'],
    advanced: true,
  },
  {
    id: 'gstack',
    name: 'gstack',
    summary: 'gstack — review, QA, ship y planificación (Garry Tan)',
    description:
      'Instala gstack globalmente en ~/.claude/skills/gstack. Complementa el pipeline con /review, /ship, /qa, /browse.',
    usage: 'claudio gstack <install|status>',
    examples: ['claudio gstack install', 'pnpm run gstack:install'],
    advanced: true,
  },
  {
    id: 'vault',
    name: 'vault',
    summary: 'Analizar y optimizar el vault Obsidian del proyecto',
    description: 'Mide tokens, salud de enlaces y comprime notas para eficiencia de contexto.',
    usage: 'claudio vault <analyze|optimize|tokens>',
    examples: ['claudio vault analyze', 'claudio vault tokens obsidian/00-README.md'],
    advanced: true,
  },
  {
    id: 'harness',
    name: 'harness',
    summary: 'Auditar cumplimiento del 12-Rule Standard',
    description: 'Genera reportes de eficiencia de tokens y reglas del harness por feature.',
    usage: 'claudio harness <audit|report|measure-file>',
    examples: ['claudio harness audit mi-feature'],
    advanced: true,
  },
]

export const HERMES_CHOICES: CatalogChoice[] = [
  {
    id: 'install',
    label: 'install',
    description:
      'Clona o actualiza el repo NousResearch/hermes-agent (último release). Solo requiere git.',
    command: 'claudio hermes install',
  },
  {
    id: 'init',
    label: 'init [perfil]',
    description: 'Crea ~/.hermes/ con SOUL.md y memoria inicial.',
    hint: 'Perfiles: programmer, designer, researcher',
    command: 'claudio hermes init programmer',
  },
  {
    id: 'optimize',
    label: 'optimize [ruta]',
    description: 'Sincroniza vault Obsidian + .claude/ → memoria de Hermes.',
    command: 'claudio hermes optimize .',
  },
  {
    id: 'status',
    label: 'status',
    description: 'Muestra qué hay en ~/.hermes/ y si está listo.',
    command: 'claudio hermes status',
  },
  {
    id: 'gepa',
    label: 'gepa',
    description: 'Instrucciones para optimizar skills con GEPA (avanzado).',
    command: 'claudio hermes gepa',
    advanced: true,
  },
]

export const VAULT_CHOICES: CatalogChoice[] = [
  {
    id: 'analyze',
    label: 'analyze',
    description: 'Escanea obsidian/, cuenta tokens y genera reporte de salud.',
    command: 'claudio vault analyze',
  },
  {
    id: 'optimize',
    label: 'optimize',
    description: 'Comprime notas del vault para gastar menos tokens en contexto.',
    command: 'claudio vault optimize',
  },
  {
    id: 'tokens',
    label: 'tokens <archivo>',
    description: 'Estima tokens de un archivo markdown concreto.',
    command: 'claudio vault tokens obsidian/00-README.md',
  },
]

export const HARNESS_CHOICES: CatalogChoice[] = [
  {
    id: 'audit',
    label: 'audit [feature-id]',
    description: 'Audita una feature contra las 12 reglas del harness.',
    command: 'claudio harness audit',
  },
  {
    id: 'report',
    label: 'report [feature-id]',
    description: 'Imprime reporte de eficiencia sin guardar archivo.',
    command: 'claudio harness report',
  },
  {
    id: 'measure-file',
    label: 'measure-file <archivo>',
    description: 'Cuenta tokens de un archivo de log o sesión.',
    command: 'claudio harness measure-file .claude/logs/audit.log',
  },
]

export const INIT_FLOW_CHOICES: CatalogChoice[] = [
  {
    id: 'template',
    label: 'Estoy en el template clonado (agent-manager-template)',
    description: 'Instala dependencias (pnpm/npm), crea .env y prepara el ejemplo Fastify.',
    command: 'claudio init',
  },
  {
    id: 'wizard',
    label: 'Instalar .claude/ en otro proyecto (wizard guiado)',
    description: 'Pregunta nombre, stack, dominio de negocio y extras opcionales.',
    command: 'claudio evoluciona',
  },
  {
    id: 'quick',
    label: 'Instalación rápida en otro proyecto (sin preguntas)',
    description: 'Stack Node por defecto, sin Obsidian ni Hermes. Ideal para CI o expertos.',
    command: 'claudio init ./mi-proyecto --yes',
  },
  {
    id: 'doctor',
    label: 'Solo verificar el setup actual',
    description: 'No instala nada; revisa Node, .claude/, MCP y .env.',
    command: 'claudio doctor',
  },
]

export const COMPONENT_TOPICS: Record<string, { title: string; body: string }> = {
  pipeline: {
    title: 'Pipeline de 7 fases',
    body: `Cada feature pasa por: Dominio → Arquitectura → Backend → Seguridad → Develop → QA → Producción.
Ninguna fase se salta. Seguridad debe aprobar antes de Develop; QA antes de Producción.
Estado en .claude/logs/pipeline-state.json. Detalle: .claude/rules/orchestration.md`,
  },
  agentes: {
    title: 'Agentes especializados',
    body: `12 roles en .claude/agents/: domain-expert, architect, api-expert, security-auditor, tester, orchestrator, etc.
Cada uno tiene permisos y un protocolo. No son "un solo chat": el orquestador enruta por fase.`,
  },
  comandos: {
    title: 'Comandos slash en Claude Code',
    body: `13 comandos en .claude/commands/: /plan, /architect, /security, /test, /review, /deploy, etc.
Se invocan dentro de Claude Code, no en la terminal.`,
  },
  hooks: {
    title: 'Hooks de seguridad y calidad',
    body: `11 hooks en .claude/hooks/: bloquean bash peligroso, escanean writes, lint al editar, tests al cambiar código.
En Windows necesitás Git Bash para bash/python.`,
  },
  skills: {
    title: 'Skills',
    body: `10 skills en .claude/skills/: conocimiento on-demand (testing, API design, git workflow, HTML artifacts, etc.).
Claude los carga cuando la tarea lo requiere.`,
  },
  obsidian: {
    title: 'Vault Obsidian (opcional)',
    body: `Carpeta obsidian/ como memoria extendida. Si no la usás, .claude/context.md y memory.md bastan.
Ver docs/ADVANCED.md`,
  },
  hermes: {
    title: 'Hermes Agent (opcional)',
    body: `claudio hermes install: clona el repo hermes-agent (último tag de GitHub) en ~/.hermes/hermes-agent. No instala Python ni npm.
claudio hermes init: memoria ~/.hermes/ para este template. Ver docs/ADVANCED.md`,
  },
  gstack: {
    title: 'gstack (recomendado)',
    body: `pnpm run gstack:install: clona garrytan/gstack en ~/.claude/skills/gstack y ejecuta ./setup --team.
Skills: /review, /ship, /qa, /browse, /office-hours. Complementa el pipeline del template. Ver docs/ADVANCED.md`,
  },
}

export function formatCommandHelp(cmd: CatalogCommand): string {
  const lines = [
    `  ${cmd.name.padEnd(12)} ${cmd.summary}`,
    `               ${cmd.description}`,
    `               Uso: ${cmd.usage}`,
  ]
  if (cmd.examples.length > 0) {
    lines.push(`               Ej: ${cmd.examples[0]}`)
  }
  return lines.join('\n')
}

export function buildFullHelp(): string {
  const main = MAIN_COMMANDS.map(formatCommandHelp).join('\n\n')
  const adv = ADVANCED_COMMANDS.map(formatCommandHelp).join('\n\n')
  return `
╔════════════════════════════════════════════╗
║   claudio — Agent Manager CLI             ║
╚════════════════════════════════════════════╝

${WHAT_IS_CLAUDIO}

COMANDOS PRINCIPALES

${main}

AVANZADO (opcional)

${adv}

INTERACTIVO
  claudio              Menú guiado (si la terminal es interactiva)
  claudio guia         Qué hace cada pieza del template
  claudio --help       Esta ayuda

Guía rápida: GETTING_STARTED.md
`
}
