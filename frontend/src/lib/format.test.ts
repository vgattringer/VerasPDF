import { formatSize } from './format'

describe('formatSize', () => {
  it('rounds to kB below 1 MB', () => {
    expect(formatSize(0)).toBe('0 kB')
    expect(formatSize(1499)).toBe('1 kB')
    expect(formatSize(999_499)).toBe('999 kB')
  })

  it('switches to MB with one decimal at 1 MB', () => {
    expect(formatSize(1_000_000)).toBe('1.0 MB')
    expect(formatSize(2_540_000)).toBe('2.5 MB')
  })
})
