function buildBody(files: File[], imageQuality: number): FormData {
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  body.append('image_quality', String(imageQuality))
  return body
}

async function post(path: string, body: FormData, signal?: AbortSignal) {
  const res = await fetch(path, { method: 'POST', body, signal })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Merging failed.')
  }
  return res
}

export async function mergePdfs(
  files: File[],
  imageQuality: number,
): Promise<Blob> {
  const res = await post('/api/merge', buildBody(files, imageQuality))
  return res.blob()
}

export async function estimateSize(
  files: File[],
  imageQuality: number,
  signal: AbortSignal,
): Promise<number> {
  const res = await post(
    '/api/estimate',
    buildBody(files, imageQuality),
    signal,
  )
  return (await res.json()).size
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
