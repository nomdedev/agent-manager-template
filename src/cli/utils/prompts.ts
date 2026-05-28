import { createInterface } from 'node:readline'
import { stdin, stdout } from 'node:process'
import type { CatalogChoice } from '../catalog.js'
import { printChoices } from './ui.js'

let rl: ReturnType<typeof createInterface> | null = null

export interface SelectOption {
  label: string
  description?: string
  hint?: string
}

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
  const rich: SelectOption[] = options.map(label => ({ label }))
  return promptSelectRich(question, rich)
}

/** Menú numerado con descripción por opción */
export async function promptSelectRich(question: string, options: SelectOption[]): Promise<number> {
  console.log(`\n${question}`)
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt.label}`)
    if (opt.description) {
      console.log(`     ${opt.description}`)
    }
    if (opt.hint) {
      console.log(`     💡 ${opt.hint}`)
    }
  })

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

/** Alias para opciones del catálogo central */
export async function promptCatalogChoice(
  question: string,
  choices: CatalogChoice[],
  options?: { showAdvanced?: boolean },
): Promise<number> {
  const filtered = options?.showAdvanced ? choices : choices.filter(c => !c.advanced)
  printChoices(filtered, { showAdvanced: true })
  const rich: SelectOption[] = filtered.map(c => ({
    label: c.label,
    description: c.description,
    hint: c.hint,
  }))
  // printChoices already printed; promptSelectRich would duplicate — use minimal prompt
  return new Promise(resolve => {
    getReadline().question(`${question}\nSelección [1]: `, answer => {
      const raw = answer.trim()
      if (!raw) {
        resolve(0)
        return
      }
      const num = Number.parseInt(raw, 10)
      if (!Number.isNaN(num) && num >= 1 && num <= filtered.length) {
        resolve(num - 1)
      } else {
        resolve(0)
      }
    })
  })
}
