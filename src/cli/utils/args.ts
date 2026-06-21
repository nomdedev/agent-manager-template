export interface InitFlags {
  minimal: boolean
  yes: boolean
  targetDir?: string
}

export interface EvolucionaFlags {
  minimal: boolean
  yes: boolean
  targetDir?: string
}

function extractPositionalAndFlags(args: string[]): {
  positional: string[]
  minimal: boolean
  yes: boolean
} {
  const positional: string[] = []
  let minimal = false
  let yes = false

  for (const arg of args) {
    if (arg === '--minimal') {
      minimal = true
    } else if (arg === '--yes' || arg === '-y') {
      yes = true
    } else if (!arg.startsWith('-')) {
      positional.push(arg)
    }
  }

  return { positional, minimal, yes }
}

export function parseInitArgs(args: string[]): InitFlags {
  const { positional, minimal, yes } = extractPositionalAndFlags(args)
  return {
    minimal,
    yes,
    targetDir: positional[0],
  }
}

export function parseEvolucionaArgs(args: string[]): EvolucionaFlags {
  const { positional, minimal, yes } = extractPositionalAndFlags(args)
  return {
    minimal,
    yes,
    targetDir: positional[0],
  }
}

export interface AutoAuditInstallFlags {
  targetDir?: string
  yes: boolean
}

export function parseAutoAuditInstallArgs(args: string[]): AutoAuditInstallFlags {
  const { positional, yes } = extractPositionalAndFlags(args)
  return {
    yes,
    targetDir: positional[0],
  }
}
