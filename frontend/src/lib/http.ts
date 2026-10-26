const DEFAULT_MESSAGE = 'Merging failed.'
const MAX_DETAIL_LENGTH = 200

export function buildBody(files: File[], imageQuality: number): FormData {
  const body = new FormData()
  files.forEach((file) => body.append('files', file))
  body.append('image_quality', String(imageQuality))
  return body
}

/** Message for failures where the backend gave no usable detail. */
function fallbackMessage(status: number | undefined): string {
  if (status === 413) return 'The files are too large.'
  if (status !== undefined && status >= 500) {
    return 'Something went wrong on the server. Please try again later.'
  }
  return DEFAULT_MESSAGE
}

/** Returns the backend's detail only if it is a short, non-empty string. */
function readDetail(error: unknown): string | null {
  const detail = (error as { detail?: unknown } | null)?.detail
  if (typeof detail !== 'string') return null
  const text = detail.trim()
  return text && text.length <= MAX_DETAIL_LENGTH ? text : null
}

export async function post(path: string, body: FormData, signal?: AbortSignal) {
  let res: Response
  try {
    res = await fetch(path, { method: 'POST', body, signal })
  } catch (e) {
    // Aborts must reach the caller unchanged; only network failures are replaced.
    if (e instanceof TypeError) {
      throw new Error('Could not reach the server. Check your connection.')
    }
    throw e
  }
  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(readDetail(error) ?? fallbackMessage(res.status))
  }
  return res
}
