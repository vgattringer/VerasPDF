import { formatSize } from '@/lib/format'
import { useEstimatedSize } from '../../hooks/use-estimated-size'

export function useQualitySlider(files: File[], value: number) {
  const newSize = useEstimatedSize(files, value)
  const newSizeLabel =
    files.length < 2
      ? 'add at least two files'
      : newSize === undefined
        ? 'calculating...'
        : newSize === null
          ? 'unavailable'
          : formatSize(newSize)

  return value === 100
    ? '(no size reduction yet)'
    : `Estimated new file size: ${newSizeLabel}`
}
