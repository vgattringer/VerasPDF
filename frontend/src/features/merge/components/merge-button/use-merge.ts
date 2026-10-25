import { useState } from 'react'
import { downloadBlob, mergePdfs } from '../../api'

export function useMerge(
  files: File[],
  imageQuality: number,
  onMerged: () => void,
) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const merge = async () => {
    setBusy(true)
    setError(null)
    try {
      downloadBlob(await mergePdfs(files, imageQuality), 'merged.pdf')
      onMerged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Merging failed.')
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, merge, disabled: files.length < 2 || busy }
}
