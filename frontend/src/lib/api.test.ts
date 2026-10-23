import { estimateSize, mergePdfs } from './api'

const files = [
  new File(['a'], 'a.pdf', { type: 'application/pdf' }),
  new File(['b'], 'b.pdf', { type: 'application/pdf' }),
]

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('estimateSize', () => {
  it('posts files and quality, and returns the size', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ size: 1234 }),
    })
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

describe('mergePdfs', () => {
  it('returns the response blob', async () => {
    const blob = new Blob(['pdf'])
    mockFetch({ ok: true, blob: async () => blob })
    await expect(mergePdfs(files, 100)).resolves.toBe(blob)
  })

  it('throws the backend detail on failure', async () => {
    mockFetch({ ok: false, json: async () => ({ detail: 'File 2 is bad.' }) })
    await expect(mergePdfs(files, 100)).rejects.toThrow('File 2 is bad.')
  })

  it('falls back to a default message', async () => {
    mockFetch({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })
    await expect(mergePdfs(files, 100)).rejects.toThrow('Merging failed.')
  })
})
