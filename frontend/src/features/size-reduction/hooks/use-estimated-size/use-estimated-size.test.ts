import { act, renderHook } from '@testing-library/react'
import { estimateSize } from '../../api'
import { useEstimatedSize } from './use-estimated-size'

vi.mock('../../api',() => ({ estimateSize: vi.fn() }))

const estimateMock = vi.mocked(estimateSize)
const makeFiles = () => [
  new File(['a'], 'a.pdf', { type: 'application/pdf' }),
  new File(['b'], 'b.pdf', { type: 'application/pdf' }),
]

beforeEach(() => {
  vi.useFakeTimers()
  estimateMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useEstimatedSize', () => {
  it('is null with fewer than two files', () => {
    const { result } = renderHook(() => useEstimatedSize(makeFiles().slice(0, 1), 50))
    expect(result.current).toBeNull()
    expect(estimateMock).not.toHaveBeenCalled()
  })

  it('is null at full quality', () => {
    const { result } = renderHook(() => useEstimatedSize(makeFiles(), 100))
    expect(result.current).toBeNull()
  })

  it('is undefined while debouncing, then the estimated size', async () => {
    estimateMock.mockResolvedValue(4321)
    const files = makeFiles()
    const { result } = renderHook(() => useEstimatedSize(files, 50))

    expect(result.current).toBeUndefined()
    expect(estimateMock).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(estimateMock).toHaveBeenCalledTimes(1)
    expect(result.current).toBe(4321)
  })

  it('is null when the request fails', async () => {
    estimateMock.mockRejectedValue(new Error('boom'))
    const files = makeFiles()
    const { result } = renderHook(() => useEstimatedSize(files, 50))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(result.current).toBeNull()
  })
})
