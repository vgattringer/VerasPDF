import { estimateSize } from './api'

const files = [
  new File(['a'], 'a.pdf', { type: 'application/pdf' }),
  new File(['b'], 'b.pdf', { type: 'application/pdf' }),
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('estimateSize', () => {
  it('posts files and quality, and returns the size', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ size: 1234 }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const signal = new AbortController().signal

    await expect(estimateSize(files, 60, signal)).resolves.toBe(1234)

    const [path, init] = fetchMock.mock.calls[0]
    expect(path).toBe('/api/estimate')
    expect(init.method).toBe('POST')
    expect(init.signal).toBe(signal)
    const body = init.body as FormData
    expect(body.getAll('files')).toHaveLength(2)
    expect(body.get('image_quality')).toBe('60')
  })
})
