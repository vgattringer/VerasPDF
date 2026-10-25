import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'

const isPdf = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

export function usePdfDropzone(onFiles: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = (list: FileList | null) => {
    const pdfs = Array.from(list ?? []).filter(isPdf)
    if (pdfs.length > 0) onFiles(pdfs)
  }

  const openPicker = () => inputRef.current?.click()

  return {
    dragging,
    inputRef,
    openPicker,
    onKeyDown: (e: KeyboardEvent) => e.key === 'Enter' && openPicker(),
    onDragOver: (e: DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      handle(e.dataTransfer.files)
    },
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => {
      handle(e.target.files)
      e.target.value = ''
    },
  }
}
