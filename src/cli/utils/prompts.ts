import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'

let rl: ReturnType<typeof createInterface> | null = null

function getReadline(): ReturnType<typeof createInterface> {
  rl ??= createInterface({ input: stdin, output: stdout })
  return rl
}

export function closePrompts(): void {
  if (rl) {
    rl.close()
    rl = null
  }
}

export function prompt(question: string, defaultValue = ''): Promise<string> {
  const hint = defaultValue ? ` [${defaultValue}]` : ''
  return new Promise(resolve => {
    getReadline().question(`${question}${hint}: `, answer => {
      resolve(answer.trim() || defaultValue)
    })
  })
}

export function promptYesNo(question: string, defaultYes = false): Promise<boolean> {
  const hint = defaultYes ? 'S/n' : 's/N'
  return new Promise(resolve => {
    getReadline().question(`${question} [${hint}]: `, answer => {
      const lower = answer.trim().toLowerCase()
      if (lower) {
        resolve(lower === 's' || lower === 'y' || lower === 'si' || lower === 'yes')
      } else {
        resolve(defaultYes)
      }
    })
  })
}

export async function promptSelect(question: string, options: string[]): Promise<number> {
  console.log(`\n${question}`)
  options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`))

  return new Promise(resolve => {
    getReadline().question(`\nSelección [1]: `, answer => {
      const raw = answer.trim()
      if (!raw) {
        resolve(0)
        return
      }
      const num = Number.parseInt(raw, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= options.length) {
        resolve(num - 1)
      } else {
        resolve(0)
      }
    })
  })
}
