export type CliPlatform = 'windows' | 'macos' | 'linux' | 'unknown'

export function isNativeWindows(): boolean {
  return process.platform === 'win32'
}

/** Git Bash / MSYS en Windows */
export function isMsysOnWindows(): boolean {
  return Boolean(process.env.MSYSTEM) && process.platform === 'win32'
}

export function detectCliPlatform(): CliPlatform {
  if (process.platform === 'win32' || isMsysOnWindows()) return 'windows'
  if (process.platform === 'darwin') return 'macos'
  if (process.platform === 'linux') return 'linux'
  return 'unknown'
}

export function platformLabel(p: CliPlatform): string {
  switch (p) {
    case 'windows':
      return 'Windows'
    case 'macos':
      return 'macOS'
    case 'linux':
      return 'Linux'
    default:
      return process.platform
  }
}
