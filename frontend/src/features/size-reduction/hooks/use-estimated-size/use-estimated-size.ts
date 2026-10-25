import { useEffect, useState } from 'react'
import { estimateSize } from '../../api'

interface Estimate {
  files: File[]
  imageQuality: number
  size: number | null
}

const DEBOUNCE_MS = 400

/**
 * Asks the backend how large the merged PDF would be at the given quality.
 * Returns undefined while calculating, null if it could not be calculated.
 */
export function useEstimatedSize(
  files: File[],
  imageQuality: number,
): number | null | undefined {
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const enabled = files.length >= 2 && imageQuality < 100

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      estimateSize(files, imageQuality, controller.signal)
        .then((size) => setEstimate({ files, imageQuality, size }))
        .catch((e) => {
          if (e.name !== 'AbortError') {
            setEstimate({ files, imageQuality, size: null })
          }
        })
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [enabled, files, imageQuality])

  if (!enabled) return null
  const current =
    estimate?.files === files && estimate.imageQuality === imageQuality
  return current ? estimate.size : undefined
}
