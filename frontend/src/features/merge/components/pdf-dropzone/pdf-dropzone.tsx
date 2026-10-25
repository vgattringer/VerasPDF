import { cn } from '@/lib/utils'
import styles from './pdf-dropzone.module.css'
import { usePdfDropzone } from './use-pdf-dropzone'

interface PdfDropzoneProps {
  onFiles: (files: File[]) => void
}

export function PdfDropzone({ onFiles }: PdfDropzoneProps) {
  const {
    dragging,
    inputRef,
    openPicker,
    onKeyDown,
    onDragOver,
    onDragLeave,
    onDrop,
    onInputChange,
  } = usePdfDropzone(onFiles)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(styles.dropzone, dragging && styles.dragging)}
    >
      Drag PDF files here, or click to select
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={onInputChange}
      />
    </div>
  )
}
