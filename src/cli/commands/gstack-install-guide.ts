export const GSTACK_REPO = 'https://github.com/garrytan/gstack'
export const GSTACK_DOCS = 'https://github.com/garrytan/gstack#install--30-seconds'

export function printGstackInstallIntro(): void {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  gstack — equipo virtual de ingeniería (Garry Tan)         ║
╠════════════════════════════════════════════════════════════╣
│  • Repo global → ~/.claude/skills/gstack                     │
│  • Skills: /review, /ship, /qa, /office-hours, /browse…    │
│  • Requiere: git, bash (Git Bash en Windows), bun            │
│                                                              │
│  claudio gstack install  → clona + ./setup --team            │
│  claudio gstack status   → verifica instalación              │
╚════════════════════════════════════════════════════════════╝
`)
}
