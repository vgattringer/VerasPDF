import { Button } from '@/components/ui/button'
import styles from './merge-button.module.css'
import { useMerge } from './use-merge'

interface MergeButtonProps {
  files: File[]
  imageQuality: number
  onMerged: () => void
}

export function MergeButton({ files, imageQuality, onMerged }: MergeButtonProps) {
  const { busy, error, merge, disabled } = useMerge(
    files,
    imageQuality,
    onMerged,
  )

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <Button disabled={disabled} onClick={merge}>
        {busy ? 'Merging...' : 'Merge PDFs'}
      </Button>
    </>
  )
}
