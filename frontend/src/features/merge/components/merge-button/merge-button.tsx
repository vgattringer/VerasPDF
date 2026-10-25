import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { downloadBlob, mergePdfs } from '../../api'

interface MergeButtonProps {
  files: File[]
  imageQuality: number
  onMerged: () => void
}

export function MergeButton({ files, imageQuality, onMerged }: MergeButtonProps) {
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

  return (
    <>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button disabled={files.length < 2 || busy} onClick={merge}>
        {busy ? 'Merging...' : 'Merge PDFs'}
      </Button>
    </>
  )
}
