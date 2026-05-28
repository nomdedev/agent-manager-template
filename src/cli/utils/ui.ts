import type { CatalogChoice } from '../catalog.js'

export function printBanner(title: string, subtitle?: string): void {
  console.log('\n╔════════════════════════════════════════════╗')
  console.log(`║   ${title.padEnd(40)}║`)
  if (subtitle) {
    console.log('╠════════════════════════════════════════════╣')
    for (const line of wrapText(subtitle, 42)) {
      console.log(`║   ${line.padEnd(40)}║`)
    }
  }
  console.log('╚════════════════════════════════════════════╝\n')
}

export function printSection(title: string, body?: string): void {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 44 - title.length))}`)
  if (body) {
    for (const line of body.split('\n')) {
      console.log(`   ${line}`)
    }
  }
}

export function printChoices(choices: CatalogChoice[], options?: { showAdvanced?: boolean }): void {
  const filtered = options?.showAdvanced
    ? choices
    : choices.filter(c => !c.advanced)

  filtered.forEach((choice, i) => {
    console.log(`\n  ${i + 1}. ${choice.label}`)
    console.log(`     ${choice.description}`)
    if (choice.hint) {
      console.log(`     💡 ${choice.hint}`)
    }
    if (choice.command) {
      console.log(`     → ${choice.command}`)
    }
  })
  console.log('')
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > width) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines
}

export function isInteractive(): boolean {
  if (process.env.CLAUDIO_NO_MENU === '1' || process.env.CI === 'true') {
    return false
  }
  return Boolean(process.stdin.isTTY && process.stdout.isTTY)
}
