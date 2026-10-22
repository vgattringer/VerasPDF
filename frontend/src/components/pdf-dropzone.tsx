import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface PdfDropzoneProps {
  onFiles: (files: File[]) => void
}

const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

export function PdfDropzone({ onFiles }: PdfDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = (list: FileList | null) => {
    const pdfs = Array.from(list ?? []).filter(isPdf)
    if (pdfs.length > 0) onFiles(pdfs)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handle(e.dataTransfer.files)
      }}
      className={cn(
        'flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors',
        dragging && 'border-primary bg-accent',
      )}
    >
      Drag PDF files here, or click to select
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
