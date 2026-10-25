import { Slider } from '@/components/ui/slider'
import { formatSize } from '@/lib/format'
import { useEstimatedSize } from '../../hooks/use-estimated-size'

interface QualitySliderProps {
  files: File[]
  value: number
  onChange: (value: number) => void
}

export function QualitySlider({ files, value, onChange }: QualitySliderProps) {
  const newSize = useEstimatedSize(files, value)
  const newSizeLabel =
    files.length < 2
      ? 'add at least two files'
      : newSize === undefined
        ? 'calculating...'
        : newSize === null
          ? 'unavailable'
          : formatSize(newSize)

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <span>Image quality</span>
        <span className="text-muted-foreground">
          {value === 100
            ? '100 (no size reduction)'
            : `${value} - estimated new file size: ${newSizeLabel}`}
        </span>
      </div>
      <Slider
        aria-label="Image quality"
        min={10}
        max={100}
        step={5}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
