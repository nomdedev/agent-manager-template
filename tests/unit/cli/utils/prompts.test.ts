import { describe, it, expect, vi, afterEach } from 'vitest'

// vi.mock is hoisted — runs before module initialization, so `rl` starts null
const mockQuestion = vi.fn()
const mockClose = vi.fn()

vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: mockQuestion,
    close: mockClose,
  })),
}))

// Import after mock is set up
import { prompt, promptYesNo, promptSelect, closePrompts } from '../../../../src/cli/utils/prompts.js'

afterEach(() => {
  // Reset the readline singleton so each test gets a fresh rl
  closePrompts()
  vi.clearAllMocks()
})

// ─── closePrompts ─────────────────────────────────────────────────────────────

describe('closePrompts', () => {
  it('does not throw when rl has not been created yet', () => {
    expect(() => closePrompts()).not.toThrow()
  })

  it('can be called multiple times without error', () => {
    // First call creates rl (via prompt), second closes it, third is a no-op
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    void prompt('q') // creates rl
    closePrompts() // closes and nulls
    expect(() => closePrompts()).not.toThrow()
  })
})

// ─── prompt ───────────────────────────────────────────────────────────────────

describe('prompt', () => {
  it('returns the user input verbatim (trimmed)', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('  hello  '))
    expect(await prompt('Enter value')).toBe('hello')
  })

  it('returns the default value when user presses Enter (empty input)', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    expect(await prompt('Enter value', 'default-val')).toBe('default-val')
  })

  it('returns empty string when no input and no default provided', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    expect(await prompt('Enter value')).toBe('')
  })

  it('includes the default value hint in the question string', async () => {
    mockQuestion.mockImplementationOnce((q: string, cb: (a: string) => void) => {
      expect(q).toContain('[my-default]')
      cb('')
    })
    await prompt('Question', 'my-default')
  })

  it('does not include a hint when default is empty string', async () => {
    mockQuestion.mockImplementationOnce((q: string, cb: (a: string) => void) => {
      expect(q).not.toContain('[')
      cb('x')
    })
    await prompt('Question')
  })
})

// ─── promptYesNo ─────────────────────────────────────────────────────────────

describe('promptYesNo', () => {
  it.each<[string, boolean]>([
    ['s', true],
    ['S', true],
    ['y', true],
    ['Y', true],
    ['si', true],
    ['yes', true],
    ['n', false],
    ['N', false],
    ['no', false],
  ])('returns correct boolean for input "%s"', async (input, expected) => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(input))
    expect(await promptYesNo('Proceed?')).toBe(expected)
    closePrompts()
    vi.clearAllMocks()
  })

  it('returns false (defaultYes=false) when user presses Enter', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    expect(await promptYesNo('Proceed?', false)).toBe(false)
  })

  it('returns true (defaultYes=true) when user presses Enter', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    expect(await promptYesNo('Proceed?', true)).toBe(true)
  })

  it('shows "S/n" hint when defaultYes=true', async () => {
    mockQuestion.mockImplementationOnce((q: string, cb: (a: string) => void) => {
      expect(q).toContain('S/n')
      cb('')
    })
    await promptYesNo('Proceed?', true)
  })

  it('shows "s/N" hint when defaultYes=false', async () => {
    mockQuestion.mockImplementationOnce((q: string, cb: (a: string) => void) => {
      expect(q).toContain('s/N')
      cb('')
    })
    await promptYesNo('Proceed?', false)
  })
})

// ─── promptSelect ─────────────────────────────────────────────────────────────

describe('promptSelect', () => {
  it('returns the 0-based index for a valid 1-based selection', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('2'))
    expect(await promptSelect('Choose', ['Alpha', 'Beta', 'Gamma'])).toBe(1)
  })

  it('returns 0 when user presses Enter (default = first option)', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb(''))
    expect(await promptSelect('Choose', ['A', 'B', 'C'])).toBe(0)
  })

  it('returns 0 for input "1" (selects first option)', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('1'))
    expect(await promptSelect('Choose', ['First', 'Second'])).toBe(0)
  })

  it('returns 0 for out-of-range numeric input', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('99'))
    expect(await promptSelect('Choose', ['A', 'B'])).toBe(0)
  })

  it('returns 0 for out-of-range input "0"', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('0'))
    expect(await promptSelect('Choose', ['A', 'B'])).toBe(0)
  })

  it('returns 0 for non-numeric input', async () => {
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) => cb('abc'))
    expect(await promptSelect('Choose', ['A', 'B'])).toBe(0)
  })

  it('selects the last option when given the last valid index', async () => {
    const options = ['X', 'Y', 'Z']
    mockQuestion.mockImplementationOnce((_q: string, cb: (a: string) => void) =>
      cb(String(options.length)),
    )
    expect(await promptSelect('Choose', options)).toBe(options.length - 1)
  })
})
