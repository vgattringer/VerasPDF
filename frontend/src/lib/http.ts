export function buildBody(files: File[], imageQuality: number): FormData {
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  body.append('image_quality', String(imageQuality))
  return body
}

export async function post(path: string, body: FormData, signal?: AbortSignal) {
  const res = await fetch(path, { method: 'POST', body, signal })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Merging failed.')
  }
  return res
}
