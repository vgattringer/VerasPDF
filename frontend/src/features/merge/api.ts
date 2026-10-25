import { buildBody, post } from '@/lib/http'

export async function mergePdfs(
  files: File[],
  imageQuality: number,
): Promise<Blob> {
  const res = await post('/api/merge', buildBody(files, imageQuality))
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
