import { Slider } from '@/components/ui/slider'
import styles from './quality-slider.module.css'
import { useQualitySlider } from './use-quality-slider'

interface QualitySliderProps {
  files: File[]
  value: number
  onChange: (value: number) => void
}

export function QualitySlider({ files, value, onChange }: QualitySliderProps) {
  const status = useQualitySlider(files, value)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span>Image quality</span>
        <span className={styles.status}>{status}</span>
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
