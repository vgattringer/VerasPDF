import { buildBody, post } from '@/lib/http'

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
