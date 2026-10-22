export async function mergePdfs(
  files: File[],
  imageQuality: number,
): Promise<Blob> {
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  body.append('image_quality', String(imageQuality))

  const res = await fetch('/api/merge', { method: 'POST', body })
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.detail ?? 'Merging failed.')
  }
  return res.blob()
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
