export const HERMES_REPO = 'https://github.com/NousResearch/hermes-agent'
export const HERMES_DOCS = 'https://hermes-agent.nousresearch.com/docs'

export function printHermesInstallIntro(): void {
  console.log(`
┌─────────────────────────────────────────────────────────────┐
│  Hermes Agent ≠ Agent Manager Template                      │
├─────────────────────────────────────────────────────────────┤
│  • Agent Manager (.claude/) → Claude Code en tu proyecto    │
│  • Hermes Agent → repo en ~/.hermes/hermes-agent            │
│                                                             │
│  claudio hermes install  → solo clona el repo (último tag)  │
│  claudio hermes init     → memoria ~/.hermes/ del template │
└─────────────────────────────────────────────────────────────┘
`)
}
