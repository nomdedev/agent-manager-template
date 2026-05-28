import { describe, it, expect } from 'vitest'
import { detectCliPlatform, isNativeWindows } from '../../../../src/cli/utils/platform.js'

describe('platform detection', () => {
  it('detects Windows when platform is win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32', configurable: true })
    expect(isNativeWindows()).toBe(true)
    expect(detectCliPlatform()).toBe('windows')
  })

  it('detects linux when platform is linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true })
    expect(isNativeWindows()).toBe(false)
    expect(detectCliPlatform()).toBe('linux')
  })
})
